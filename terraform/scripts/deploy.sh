#!/bin/bash

# ============================================================================
# HERGON TERRAFORM DEPLOYMENT SCRIPT
# Script para desplegar infraestructura de forma segura
# ============================================================================

set -euo pipefail

# Colors para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ============================================================================
# FUNCTIONS
# ============================================================================

print_header() {
    echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

check_requirements() {
    print_header "Checking Requirements"

    # Check Terraform
    if ! command -v terraform &> /dev/null; then
        print_error "Terraform no está instalado"
        echo "Instalar con: brew install terraform"
        exit 1
    fi
    print_success "Terraform $(terraform --version | head -n1)"

    # Check AWS CLI
    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI no está instalado"
        echo "Instalar con: brew install awscli"
        exit 1
    fi
    print_success "AWS CLI $(aws --version | cut -d' ' -f1)"

    # Check AWS credentials
    if ! aws sts get-caller-identity &> /dev/null; then
        print_error "AWS credentials no configuradas"
        echo "Configurar con: aws configure"
        exit 1
    fi
    local aws_account=$(aws sts get-caller-identity --query Account --output text)
    local aws_user=$(aws sts get-caller-identity --query Arn --output text | cut -d'/' -f2)
    print_success "AWS Account: $aws_account (User: $aws_user)"
}

check_backend() {
    print_header "Checking Backend Configuration"

    local bucket="hergon-terraform-state-${ENVIRONMENT}"
    local table="hergon-terraform-lock"

    # Check S3 bucket
    if aws s3api head-bucket --bucket "$bucket" 2>/dev/null; then
        print_success "S3 bucket exists: $bucket"
    else
        print_warning "S3 bucket does not exist: $bucket"
        read -p "¿Crear bucket ahora? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            create_backend_bucket "$bucket"
        else
            print_error "Backend bucket required. Exiting."
            exit 1
        fi
    fi

    # Check DynamoDB table
    if aws dynamodb describe-table --table-name "$table" &> /dev/null; then
        print_success "DynamoDB table exists: $table"
    else
        print_warning "DynamoDB table does not exist: $table"
        read -p "¿Crear tabla ahora? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            create_backend_table "$table"
        else
            print_error "Backend table required. Exiting."
            exit 1
        fi
    fi
}

create_backend_bucket() {
    local bucket=$1
    print_info "Creating S3 bucket: $bucket"

    aws s3api create-bucket --bucket "$bucket" --region us-east-1
    aws s3api put-bucket-versioning --bucket "$bucket" --versioning-configuration Status=Enabled
    aws s3api put-bucket-encryption --bucket "$bucket" --server-side-encryption-configuration '{
        "Rules": [{
            "ApplyServerSideEncryptionByDefault": {
                "SSEAlgorithm": "AES256"
            }
        }]
    }'
    aws s3api put-public-access-block --bucket "$bucket" --public-access-block-configuration \
        BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true

    print_success "S3 bucket created: $bucket"
}

create_backend_table() {
    local table=$1
    print_info "Creating DynamoDB table: $table"

    aws dynamodb create-table \
        --table-name "$table" \
        --attribute-definitions AttributeName=LockID,AttributeType=S \
        --key-schema AttributeName=LockID,KeyType=HASH \
        --billing-mode PAY_PER_REQUEST \
        --region us-east-1 \
        --tags Key=Environment,Value=${ENVIRONMENT} Key=Project,Value=hergon

    print_success "DynamoDB table created: $table"
}

check_tfvars() {
    print_header "Checking terraform.tfvars"

    if [[ ! -f "terraform.tfvars" ]]; then
        print_error "terraform.tfvars no existe"
        print_info "Copiando desde terraform.tfvars.example..."
        cp terraform.tfvars.example terraform.tfvars
        print_warning "IMPORTANTE: Editar terraform.tfvars con valores reales antes de continuar"
        read -p "¿Has editado terraform.tfvars? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_error "Edita terraform.tfvars y vuelve a ejecutar"
            exit 1
        fi
    else
        print_success "terraform.tfvars exists"
    fi

    # Check for placeholder values
    if grep -q "CAMBIAR-POR" terraform.tfvars || grep -q "xxxxxxxx" terraform.tfvars; then
        print_error "terraform.tfvars contiene valores de ejemplo"
        print_warning "Reemplaza los valores de ejemplo con datos reales"
        exit 1
    fi

    print_success "terraform.tfvars parece válido"
}

terraform_init() {
    print_header "Terraform Init"
    terraform init -upgrade
    print_success "Terraform initialized"
}

terraform_validate() {
    print_header "Terraform Validate"
    terraform validate
    print_success "Configuration is valid"
}

terraform_plan() {
    print_header "Terraform Plan"

    local plan_file="terraform-plan-$(date +%Y%m%d-%H%M%S).tfplan"
    terraform plan -out="$plan_file"

    print_success "Plan saved to: $plan_file"
    echo "$plan_file" > .last_plan_file
}

terraform_apply() {
    print_header "Terraform Apply"

    if [[ ! -f ".last_plan_file" ]]; then
        print_error "No plan file found. Run plan first."
        exit 1
    fi

    local plan_file=$(cat .last_plan_file)

    if [[ ! -f "$plan_file" ]]; then
        print_error "Plan file not found: $plan_file"
        exit 1
    fi

    print_warning "About to apply infrastructure changes"
    print_info "Plan file: $plan_file"
    print_info "Environment: $ENVIRONMENT"

    if [[ "$ENVIRONMENT" == "prod" ]]; then
        print_warning "⚠️  DEPLOYING TO PRODUCTION ⚠️"
        read -p "Type 'yes' to confirm: " -r
        if [[ ! $REPLY == "yes" ]]; then
            print_error "Deployment cancelled"
            exit 1
        fi
    else
        read -p "Continue? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_error "Deployment cancelled"
            exit 1
        fi
    fi

    terraform apply "$plan_file"

    rm -f .last_plan_file
    print_success "Infrastructure deployed successfully!"
}

show_outputs() {
    print_header "Terraform Outputs"
    terraform output
}

# ============================================================================
# MAIN
# ============================================================================

# Parse arguments
ENVIRONMENT=${1:-}
ACTION=${2:-all}

if [[ -z "$ENVIRONMENT" ]]; then
    echo "Usage: $0 <environment> [action]"
    echo ""
    echo "Environments:"
    echo "  prod     - Production environment"
    echo "  staging  - Staging environment"
    echo ""
    echo "Actions:"
    echo "  all      - Run full deployment (init, validate, plan, apply)"
    echo "  init     - Initialize Terraform"
    echo "  plan     - Create execution plan"
    echo "  apply    - Apply planned changes"
    echo "  output   - Show outputs"
    echo ""
    echo "Examples:"
    echo "  $0 staging all       # Full deployment to staging"
    echo "  $0 prod plan         # Create plan for production"
    echo "  $0 prod apply        # Apply plan to production"
    exit 1
fi

if [[ ! "$ENVIRONMENT" =~ ^(prod|staging)$ ]]; then
    print_error "Invalid environment: $ENVIRONMENT"
    echo "Valid environments: prod, staging"
    exit 1
fi

# Change to environment directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_DIR="$SCRIPT_DIR/../environments/$ENVIRONMENT"

if [[ ! -d "$ENV_DIR" ]]; then
    print_error "Environment directory not found: $ENV_DIR"
    exit 1
fi

cd "$ENV_DIR"
print_info "Working directory: $ENV_DIR"

# Execute actions
case "$ACTION" in
    all)
        check_requirements
        check_backend
        check_tfvars
        terraform_init
        terraform_validate
        terraform_plan
        terraform_apply
        show_outputs
        ;;
    init)
        check_requirements
        check_backend
        terraform_init
        ;;
    plan)
        check_requirements
        check_tfvars
        terraform_validate
        terraform_plan
        ;;
    apply)
        check_requirements
        terraform_apply
        show_outputs
        ;;
    output)
        show_outputs
        ;;
    *)
        print_error "Invalid action: $ACTION"
        echo "Valid actions: all, init, plan, apply, output"
        exit 1
        ;;
esac

print_success "Done!"
