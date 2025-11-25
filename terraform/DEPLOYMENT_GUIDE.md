# Guía de Despliegue - Hergon Vector01 AWS Infrastructure

Esta guía explica paso a paso cómo desplegar la infraestructura AWS con autenticación Azure AD usando Terraform.

## Tabla de Contenidos

1. [Requisitos Previos](#requisitos-previos)
2. [Configuración Inicial](#configuración-inicial)
3. [Configuración de Azure AD](#configuración-de-azure-ad)
4. [Despliegue de Staging](#despliegue-de-staging)
5. [Despliegue de Producción](#despliegue-de-producción)
6. [Verificación Post-Despliegue](#verificación-post-despliegue)
7. [Troubleshooting](#troubleshooting)
8. [Rollback](#rollback)

---

## Requisitos Previos

### 1. Software Instalado

```bash
# Verificar Terraform (>= 1.6.0)
terraform --version

# Verificar AWS CLI
aws --version

# Si no están instalados:
brew install terraform awscli
```

### 2. AWS Account Setup

```bash
# Configurar credenciales AWS
aws configure

# Verificar acceso
aws sts get-caller-identity
```

Deberías ver algo como:
```json
{
    "UserId": "AIDAXXXXXXXXXXXXXXXXX",
    "Account": "123456789012",
    "Arn": "arn:aws:iam::123456789012:user/tu-usuario"
}
```

### 3. Permisos Necesarios

Tu usuario AWS debe tener permisos para crear:
- VPC, Subnets, NAT Gateways, Security Groups
- ECS Clusters, Task Definitions, Services
- RDS Databases, DynamoDB Tables, ElastiCache
- S3 Buckets
- IAM Roles y Policies
- CloudWatch Logs y Alarms
- API Gateway
- Lambda Functions
- KMS Keys

**Recomendación**: Usa el policy `AdministratorAccess` en ambientes de desarrollo, o crea un policy custom basado en `terraform-iam-policy.json` (incluido en este repo).

---

## Configuración Inicial

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tu-org/hergon-vector01.git
cd hergon-vector01/terraform
```

### 2. Crear Backend de Terraform State

**IMPORTANTE**: Ejecutar estos comandos UNA SOLA VEZ antes del primer `terraform init`.

#### Para Staging:

```bash
# Crear bucket S3
aws s3api create-bucket \
  --bucket hergon-terraform-state-staging \
  --region us-east-1

# Habilitar versioning
aws s3api put-bucket-versioning \
  --bucket hergon-terraform-state-staging \
  --versioning-configuration Status=Enabled

# Habilitar encriptación
aws s3api put-bucket-encryption \
  --bucket hergon-terraform-state-staging \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      }
    }]
  }'

# Bloquear acceso público
aws s3api put-public-access-block \
  --bucket hergon-terraform-state-staging \
  --public-access-block-configuration \
    BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true
```

#### Para Producción:

```bash
# Mismo proceso pero con bucket de prod
aws s3api create-bucket \
  --bucket hergon-terraform-state-prod \
  --region us-east-1

# ... (repetir comandos de versioning, encriptación y bloqueo público)
```

#### Crear Tabla DynamoDB para Locking (compartida entre ambientes):

```bash
aws dynamodb create-table \
  --table-name hergon-terraform-lock \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1 \
  --tags Key=Project,Value=hergon Key=Purpose,Value=terraform-lock
```

### 3. Verificar Estructura de Directorios

```bash
tree -L 3 terraform/

terraform/
├── README.md
├── DEPLOYMENT_GUIDE.md
├── .gitignore
├── environments/
│   ├── prod/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   ├── backend.tf
│   │   └── terraform.tfvars.example
│   └── staging/
│       ├── main.tf (link o copia de prod/main.tf)
│       ├── variables.tf
│       ├── outputs.tf
│       ├── backend.tf
│       └── terraform.tfvars.example
├── modules/
│   ├── networking/
│   ├── security/
│   ├── database/
│   ├── storage/
│   ├── api-gateway/
│   └── monitoring/
└── scripts/
    ├── deploy.sh
    └── destroy.sh
```

---

## Configuración de Azure AD

### 1. Crear Azure AD B2C Tenant (si no existe)

1. Ir a Azure Portal: https://portal.azure.com
2. Crear nuevo recurso: "Azure Active Directory B2C"
3. Seleccionar "Create a new Azure AD B2C Tenant"
4. Completar información:
   - Organization name: `Hergon`
   - Initial domain name: `hergon` (quedará como hergon.onmicrosoft.com)
   - Country/Region: México
5. Crear tenant

### 2. Registrar Aplicación (App Registration)

1. En Azure AD B2C, ir a "App registrations"
2. Click "New registration"
3. Configurar:
   - **Name**: `Hergon API - Staging` (o Production según ambiente)
   - **Supported account types**: Accounts in this organizational directory only
   - **Redirect URI**: Platform = Web, URI = `https://your-api-domain.com/auth/callback`
4. Click "Register"

### 3. Configurar API Permissions

1. En tu App Registration, ir a "API permissions"
2. Add permission → Microsoft Graph
3. Agregar permisos:
   - User.Read (Delegated)
   - email (Delegated)
   - openid (Delegated)
   - profile (Delegated)
4. Grant admin consent

### 4. Crear Client Secret

1. En tu App Registration, ir a "Certificates & secrets"
2. Click "New client secret"
3. Description: `Terraform Deployment Secret`
4. Expires: 24 months (recomendado)
5. Click "Add"
6. **COPIAR EL VALOR INMEDIATAMENTE** (no se podrá recuperar después)

### 5. Configurar API Identifier

1. Ir a "Expose an API"
2. Click "Add" en "Application ID URI"
3. Usar: `api://hergon-api-staging` (o `api://hergon-api-production`)
4. Click "Save"

### 6. Configurar Custom Claims (opcional)

Para incluir custom claims como `aforeId`, `role`, etc.:

1. Ir a "Token configuration"
2. Add optional claim
3. Seleccionar token type: ID token, Access token
4. Agregar claims:
   - email
   - preferred_username
   - Cualquier custom claim configurado

### 7. Guardar Información

Anotar estos valores (los necesitarás en terraform.tfvars):

```
Tenant ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
Client ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
Client Secret: el-valor-que-copiaste
Audience: api://hergon-api-staging (o production)
```

---

## Despliegue de Staging

Siempre desplegar primero en **staging** para validar la configuración antes de producción.

### 1. Configurar Variables

```bash
cd terraform/environments/staging

# Copiar ejemplo de variables
cp terraform.tfvars.example terraform.tfvars

# Editar con tus valores reales
nano terraform.tfvars
```

**Completar estos valores obligatorios**:

```hcl
# Azure AD
azure_tenant_id     = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
azure_client_id     = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
azure_client_secret = "tu-client-secret"
azure_audience      = "api://hergon-api-staging"

# Database
db_master_password = "tu-password-super-seguro-minimo-16-chars"

# SSL Certificate (crear primero en ACM)
ssl_certificate_arn = "arn:aws:acm:us-east-1:123456:certificate/xxxxx"

# Monitoring
alert_email = "dev@hergon.com"
```

### 2. Generar Password Seguro

```bash
# Generar password de 32 caracteres sin caracteres problemáticos
openssl rand -base64 32 | tr -d "/@\"\'"
```

### 3. Crear Certificado SSL (ACM)

```bash
# Opción 1: Via Console
# AWS Console > Certificate Manager > Request certificate
# Domain: staging.api.hergon.com
# Validation: DNS (recomendado)

# Opción 2: Via CLI
aws acm request-certificate \
  --domain-name staging.api.hergon.com \
  --validation-method DNS \
  --region us-east-1

# Copiar el ARN que devuelve
```

### 4. Validar Configuración

```bash
# Verificar que no hay valores de ejemplo
grep -E "CAMBIAR|xxxxxxxx" terraform.tfvars

# No debe devolver nada
```

### 5. Inicializar Terraform

```bash
terraform init

# Deberías ver:
# Terraform has been successfully initialized!
```

### 6. Validar Sintaxis

```bash
terraform validate

# Deberías ver:
# Success! The configuration is valid.
```

### 7. Revisar Plan de Ejecución

```bash
terraform plan -out=staging.tfplan

# Revisar cuidadosamente el output
# Terraform mostrará todos los recursos que creará
```

**Verificar que el plan incluye**:
- 1 VPC con 3 subnets públicas y 6 privadas
- 1 NAT Gateway (staging solo usa 1 AZ)
- 2 RDS PostgreSQL instances
- 1 ElastiCache Redis
- 2 DynamoDB tables
- 4 S3 buckets
- 1 ECS Cluster con servicios
- 1 ALB
- 1 API Gateway
- Security Groups, IAM Roles, etc.

**Total de recursos**: ~120-150 recursos

### 8. Aplicar Configuración

```bash
terraform apply staging.tfplan

# Confirmar con: yes
```

⏱️ **Tiempo estimado**: 15-25 minutos

**Progreso típico**:
- 0-5 min: VPC, subnets, security groups
- 5-10 min: NAT Gateway, RDS databases (los más lentos)
- 10-15 min: ECS cluster, ALB, Redis
- 15-20 min: DynamoDB, S3, Lambda functions
- 20-25 min: API Gateway, monitoring, finalizando

### 9. Guardar Outputs

```bash
# Ver todos los outputs
terraform output

# Guardar outputs importantes
terraform output -json > staging-outputs.json

# Guardar endpoints específicos
echo "API Endpoint: $(terraform output -raw alb_dns_name)" >> staging-info.txt
echo "RDS Catalog: $(terraform output -raw catalog_db_endpoint)" >> staging-info.txt
```

---

## Despliegue de Producción

**⚠️ IMPORTANTE**: Solo desplegar a producción después de validar completamente staging.

### Checklist Pre-Producción

- [ ] Staging desplegado y funcionando correctamente
- [ ] Tests ejecutados en staging exitosamente
- [ ] Certificado SSL de producción creado y validado
- [ ] Azure AD de producción configurado
- [ ] Passwords de producción generados y guardados en bóveda segura
- [ ] Email de alertas de producción configurado
- [ ] Backup plan documentado
- [ ] Equipo notificado del deployment

### Proceso de Despliegue

```bash
cd terraform/environments/prod

# 1. Configurar variables
cp terraform.tfvars.example terraform.tfvars
nano terraform.tfvars

# 2. Actualizar valores de producción
# - azure_tenant_id (puede ser el mismo o diferente tenant)
# - azure_client_id (DEBE ser diferente de staging)
# - azure_client_secret (NUEVO secret de producción)
# - db_master_password (DIFERENTE de staging)
# - ssl_certificate_arn (certificado de api.hergon.com)
# - alert_email (ops@hergon.com o similar)

# 3. Inicializar
terraform init

# 4. Validar
terraform validate

# 5. Plan (revisar MUY cuidadosamente)
terraform plan -out=prod.tfplan

# 6. Aplicar (requiere doble confirmación)
terraform apply prod.tfplan
```

⏱️ **Tiempo estimado**: 25-35 minutos (más recursos que staging)

---

## Verificación Post-Despliegue

### 1. Verificar Infraestructura

```bash
# Ver resumen
terraform output deployment_summary

# Verificar servicios críticos
aws ecs list-services --cluster hergon-cluster-staging --region us-east-1
aws rds describe-db-instances --region us-east-1 --query 'DBInstances[].DBInstanceIdentifier'
```

### 2. Health Checks

```bash
# API Gateway health endpoint (NO requiere autenticación)
curl -X GET $(terraform output -raw stage_invoke_url)/health

# Deberías ver:
# {"status": "healthy", "timestamp": "2025-01-20T10:00:00Z"}
```

### 3. Test de Autenticación

```bash
# 1. Obtener token de Azure AD
# (usa Postman o script de autenticación)

# 2. Hacer request autenticado
curl -X GET \
  $(terraform output -raw stage_invoke_url)/api/validation-files \
  -H "Authorization: Bearer TU_TOKEN_AZURE_AD"

# Si funciona, deberías ver respuesta 200 OK
# Si falla autenticación, verás 401 Unauthorized
```

### 4. Verificar Logs

```bash
# Logs de API Gateway
aws logs tail /aws/apigateway/hergon-staging --follow

# Logs de ECS
aws logs tail /ecs/hergon-api-service-staging --follow
```

### 5. Verificar Dashboards

```bash
# Abrir dashboard principal
terraform output -raw main_dashboard_url | xargs open

# O manualmente:
# AWS Console > CloudWatch > Dashboards > hergon-overview-staging
```

### 6. Test de Integración Completa

```bash
# Ejecutar suite de tests (si tienes)
cd ../../tests
./run-integration-tests.sh staging
```

---

## Troubleshooting

### Error: "Backend initialization required"

```bash
# Solución: Inicializar backend
terraform init
```

### Error: "NoSuchBucket: The specified bucket does not exist"

```bash
# Solución: Crear bucket de state
aws s3api create-bucket --bucket hergon-terraform-state-staging --region us-east-1
```

### Error: RDS "insufficient capacity"

```bash
# Solución 1: Cambiar availability zone
# En terraform.tfvars:
availability_zones = ["us-east-1b"]  # Probar otra AZ

# Solución 2: Esperar 15 minutos y reintentar
terraform apply
```

### Error: "Unauthorized" en JWT tokens

**Causas comunes**:
1. `azure_tenant_id` incorrecto
2. `azure_audience` no coincide con API identifier en Azure
3. Token expirado
4. Scope incorrecto en el token

**Solución**:
```bash
# Verificar configuración de Azure AD en Terraform
terraform output azure_ad_secret_name

# Ver configuración en Secrets Manager
aws secretsmanager get-secret-value \
  --secret-id $(terraform output -raw azure_ad_secret_name)

# Verificar OIDC configuration de Azure
curl https://login.microsoftonline.com/{TENANT_ID}/v2.0/.well-known/openid-configuration
```

### Error: Límites de AWS

```bash
# Verificar límites de cuenta
aws service-quotas list-service-quotas \
  --service-code vpc \
  --query 'Quotas[?QuotaName==`VPCs per Region`]'

# Solicitar aumento si es necesario
aws service-quotas request-service-quota-increase \
  --service-code vpc \
  --quota-code L-F678F1CE \
  --desired-value 10
```

### ECS Tasks no inician

```bash
# Ver eventos de servicio
aws ecs describe-services \
  --cluster hergon-cluster-staging \
  --services hergon-api-service \
  --query 'services[0].events[0:5]'

# Ver stopped tasks
aws ecs list-tasks \
  --cluster hergon-cluster-staging \
  --desired-status STOPPED \
  --query 'taskArns[0]' \
  --output text | \
  xargs -I {} aws ecs describe-tasks --cluster hergon-cluster-staging --tasks {}
```

### RDS conexión rechazada

```bash
# Verificar security groups
aws ec2 describe-security-groups \
  --filters "Name=tag:Name,Values=*rds*"

# Verificar que ECS tasks pueden alcanzar RDS
# (deben estar en misma VPC y security groups correctos)
```

---

## Rollback

### Rollback Parcial (un recurso específico)

```bash
# Listar recursos
terraform state list

# Destruir recurso específico
terraform destroy -target=aws_ecs_service.api

# Recrear
terraform apply
```

### Rollback Completo (state anterior)

```bash
# 1. Listar versiones de state
aws s3api list-object-versions \
  --bucket hergon-terraform-state-staging \
  --prefix environments/staging/terraform.tfstate

# 2. Descargar versión anterior
aws s3api get-object \
  --bucket hergon-terraform-state-staging \
  --key environments/staging/terraform.tfstate \
  --version-id VERSION_ID_ANTERIOR \
  previous-state.json

# 3. Restaurar (CUIDADO)
terraform state push previous-state.json

# 4. Aplicar state anterior
terraform apply
```

### Rollback de Disaster (destruir todo)

```bash
# Ver script de destrucción
../../scripts/destroy.sh staging
```

---

## Costos Estimados

### Staging
- **Mensual**: ~$450/mes
- **Anual**: ~$5,400/año

### Producción
- **Mensual**: ~$1,650/mes
- **Anual**: ~$19,800/año
- **Con Savings Plans 1y**: ~$15,192/año (-23%)
- **Con Savings Plans 3y**: ~$12,696/año (-36%)

### Monitorear Costos

```bash
# Ver costos actuales
aws ce get-cost-and-usage \
  --time-period Start=2025-01-01,End=2025-01-31 \
  --granularity MONTHLY \
  --metrics BlendedCost

# Dashboard de costos
terraform output -raw costs_dashboard_url | xargs open
```

---

## Recursos Adicionales

- **Documentación Técnica**: `../PLAN_IMPLEMENTACION_AWS_AZURE_AD.md`
- **Arquitectura**: `../ARQUITECTURA_OPTIMIZADA_REALISTA.md`
- **Comparativa Cloud**: `../COMPARATIVA_AZURE_VS_AWS_2025.md`
- **Terraform Registry**: https://registry.terraform.io/providers/hashicorp/aws/latest/docs
- **AWS Well-Architected**: https://aws.amazon.com/architecture/well-architected/

---

## Soporte

Para issues o preguntas:
1. Revisar logs de CloudWatch
2. Consultar esta guía de troubleshooting
3. Revisar documentación técnica del proyecto
4. Contactar al equipo DevOps

**Última actualización**: 2025-01-20
