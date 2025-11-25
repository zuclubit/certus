#!/bin/bash

# ============================================================================
# HERGON TERRAFORM DESTROY SCRIPT
# Script para destruir infraestructura de forma segura
# ============================================================================

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

backup_state() {
    print_header "Backing Up Terraform State"

    local backup_file="terraform-state-backup-$(date +%Y%m%d-%H%M%S).json"
    terraform state pull > "$backup_file"

    print_success "State backed up to: $backup_file"
    print_info "Guarda este archivo en un lugar seguro"
}

backup_databases() {
    print_header "Creating Database Snapshots"

    print_warning "IMPORTANTE: Crear snapshots de RDS antes de destruir"

    # Get DB identifiers from Terraform state
    local catalog_db=$(terraform output -raw catalog_db_identifier 2>/dev/null || echo "")
    local validation_db=$(terraform output -raw validation_db_identifier 2>/dev/null || echo "")

    if [[ -n "$catalog_db" ]]; then
        print_info "Catalog DB: $catalog_db"
        local snapshot_name="${catalog_db}-final-$(date +%Y%m%d-%H%M%S)"

        read -p "¿Crear snapshot de $catalog_db? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            print_info "Creando snapshot: $snapshot_name"
            aws rds create-db-snapshot \
                --db-instance-identifier "$catalog_db" \
                --db-snapshot-identifier "$snapshot_name" \
                --region us-east-1
            print_success "Snapshot creado: $snapshot_name"
        fi
    fi

    if [[ -n "$validation_db" ]]; then
        print_info "Validation DB: $validation_db"
        local snapshot_name="${validation_db}-final-$(date +%Y%m%d-%H%M%S)"

        read -p "¿Crear snapshot de $validation_db? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            print_info "Creando snapshot: $snapshot_name"
            aws rds create-db-snapshot \
                --db-instance-identifier "$validation_db" \
                --db-snapshot-identifier "$snapshot_name" \
                --region us-east-1
            print_success "Snapshot creado: $snapshot_name"
        fi
    fi
}

show_resources() {
    print_header "Resources to be Destroyed"

    terraform state list | while read -r resource; do
        echo "  - $resource"
    done

    echo ""
    print_warning "Todos estos recursos serán ELIMINADOS"
}

confirm_destruction() {
    print_header "Confirmation"

    print_error "⚠️  ADVERTENCIA: Esta acción es IRREVERSIBLE ⚠️"
    echo ""
    print_warning "Se destruirán:"
    echo "  • Bases de datos (RDS PostgreSQL)"
    echo "  • Cache (ElastiCache Redis)"
    echo "  • Tablas DynamoDB"
    echo "  • Buckets S3 (si están vacíos)"
    echo "  • Load Balancers"
    echo "  • Servicios ECS"
    echo "  • Funciones Lambda"
    echo "  • Toda la infraestructura de red"
    echo ""

    if [[ "$ENVIRONMENT" == "prod" ]]; then
        print_error "⚠️  ESTÁS A PUNTO DE DESTRUIR PRODUCCIÓN ⚠️"
        echo ""
        print_warning "Para continuar, escribe EXACTAMENTE: destroy-prod-$ENVIRONMENT"
        read -p "Confirmación: " -r
        if [[ ! $REPLY == "destroy-prod-$ENVIRONMENT" ]]; then
            print_error "Confirmación incorrecta. Destrucción cancelada."
            exit 1
        fi

        print_warning "Segunda confirmación requerida"
        read -p "¿Estás ABSOLUTAMENTE seguro? (yes/no): " -r
        if [[ ! $REPLY == "yes" ]]; then
            print_error "Destrucción cancelada"
            exit 1
        fi
    else
        print_warning "Escribe 'yes' para confirmar la destrucción"
        read -p "Confirmar: " -r
        if [[ ! $REPLY == "yes" ]]; then
            print_error "Destrucción cancelada"
            exit 1
        fi
    fi

    print_success "Confirmación recibida"
}

terraform_destroy() {
    print_header "Destroying Infrastructure"

    # Disable deletion protection for production RDS
    if [[ "$ENVIRONMENT" == "prod" ]]; then
        print_info "Deshabilitando deletion protection en RDS..."

        local catalog_db=$(terraform output -raw catalog_db_identifier 2>/dev/null || echo "")
        local validation_db=$(terraform output -raw validation_db_identifier 2>/dev/null || echo "")

        if [[ -n "$catalog_db" ]]; then
            aws rds modify-db-instance \
                --db-instance-identifier "$catalog_db" \
                --no-deletion-protection \
                --apply-immediately \
                --region us-east-1 2>/dev/null || true
        fi

        if [[ -n "$validation_db" ]]; then
            aws rds modify-db-instance \
                --db-instance-identifier "$validation_db" \
                --no-deletion-protection \
                --apply-immediately \
                --region us-east-1 2>/dev/null || true
        fi

        print_info "Esperando 10 segundos para que se apliquen los cambios..."
        sleep 10
    fi

    # Disable ALB deletion protection
    print_info "Deshabilitando deletion protection en ALB..."
    local alb_arn=$(terraform output -raw alb_arn 2>/dev/null || echo "")
    if [[ -n "$alb_arn" ]]; then
        aws elbv2 modify-load-balancer-attributes \
            --load-balancer-arn "$alb_arn" \
            --attributes Key=deletion_protection.enabled,Value=false \
            --region us-east-1 2>/dev/null || true
    fi

    # Execute destroy
    terraform destroy -auto-approve

    print_success "Infrastructure destroyed successfully"
}

cleanup_state_backend() {
    print_header "Cleanup State Backend"

    print_warning "El bucket de state y la tabla DynamoDB NO se eliminan automáticamente"
    print_info "Para eliminarlos manualmente:"
    echo ""
    echo "  # Eliminar objetos del bucket"
    echo "  aws s3 rm s3://hergon-terraform-state-${ENVIRONMENT} --recursive"
    echo ""
    echo "  # Eliminar bucket"
    echo "  aws s3api delete-bucket --bucket hergon-terraform-state-${ENVIRONMENT}"
    echo ""
    echo "  # Eliminar tabla DynamoDB (si no se usa para otros ambientes)"
    echo "  aws dynamodb delete-table --table-name hergon-terraform-lock"
}

# ============================================================================
# MAIN
# ============================================================================

ENVIRONMENT=${1:-}

if [[ -z "$ENVIRONMENT" ]]; then
    echo "Usage: $0 <environment>"
    echo ""
    echo "Environments:"
    echo "  prod     - Production environment"
    echo "  staging  - Staging environment"
    echo ""
    echo "Example:"
    echo "  $0 staging"
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

# Execute destruction sequence
backup_state
show_resources
backup_databases
confirm_destruction
terraform_destroy
cleanup_state_backend

print_success "Done!"
print_warning "No olvides verificar que no queden recursos huérfanos en AWS Console"
