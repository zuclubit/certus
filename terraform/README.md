# Terraform - Hergon Vector01 AWS Infrastructure

Infraestructura como código para el sistema Hergon-Vector01 desplegado en AWS con autenticación Azure AD.

## Estructura del Proyecto

```
terraform/
├── environments/
│   ├── prod/           # Configuración producción
│   └── staging/        # Configuración staging
└── modules/
    ├── networking/     # VPC, subnets, NAT, security groups
    ├── security/       # IAM roles, policies, secrets
    ├── compute/        # ECS Fargate, Lambda functions
    ├── database/       # RDS PostgreSQL, DynamoDB, ElastiCache
    ├── storage/        # S3 buckets
    ├── api-gateway/    # API Gateway con JWT authorizer
    └── monitoring/     # CloudWatch, alarms, dashboards
```

## Requisitos Previos

1. **AWS CLI configurado**
   ```bash
   aws configure
   # AWS Access Key ID: [tu-access-key]
   # AWS Secret Access Key: [tu-secret-key]
   # Default region: us-east-1
   ```

2. **Terraform instalado** (v1.6+)
   ```bash
   terraform --version
   ```

3. **Azure AD B2C configurado**
   - Tenant creado
   - App Registration con permisos API
   - Custom policies configurados
   - Tenant ID y Client ID disponibles

4. **S3 Bucket para Terraform State** (crear manualmente primero)
   ```bash
   aws s3api create-bucket \
     --bucket hergon-terraform-state-prod \
     --region us-east-1

   aws s3api put-bucket-versioning \
     --bucket hergon-terraform-state-prod \
     --versioning-configuration Status=Enabled

   aws s3api put-bucket-encryption \
     --bucket hergon-terraform-state-prod \
     --server-side-encryption-configuration '{
       "Rules": [{
         "ApplyServerSideEncryptionByDefault": {
           "SSEAlgorithm": "AES256"
         }
       }]
     }'
   ```

5. **DynamoDB Table para State Locking**
   ```bash
   aws dynamodb create-table \
     --table-name hergon-terraform-lock \
     --attribute-definitions AttributeName=LockID,AttributeType=S \
     --key-schema AttributeName=LockID,KeyType=HASH \
     --billing-mode PAY_PER_REQUEST \
     --region us-east-1
   ```

## Despliegue Rápido

### 1. Configurar Variables de Entorno

```bash
# Azure AD (obtener de Azure Portal)
export TF_VAR_azure_tenant_id="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
export TF_VAR_azure_client_id="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
export TF_VAR_azure_client_secret="tu-client-secret"

# Base de datos
export TF_VAR_db_master_password="$(openssl rand -base64 32)"

# Notificaciones
export TF_VAR_alert_email="ops@hergon.com"
```

### 2. Desplegar Staging (Primera vez)

```bash
cd environments/staging

# Inicializar
terraform init

# Revisar plan
terraform plan -out=staging.tfplan

# Aplicar
terraform apply staging.tfplan
```

### 3. Desplegar Producción

```bash
cd environments/prod

# Inicializar
terraform init

# Revisar plan
terraform plan -out=prod.tfplan

# Aplicar (requiere confirmación adicional)
terraform apply prod.tfplan
```

## Configuración por Entorno

### Staging

- **Región**: us-east-1
- **Costo estimado**: $450/mes
- **Configuración**:
  - 1 AZ (alta disponibilidad limitada)
  - RDS: db.t4g.medium (2 vCPU, 4 GB)
  - ECS: 1 tarea API, 1 tarea Worker
  - Lambda: Provisioned Concurrency = 1

### Producción

- **Región**: us-east-1 (AWS Mexico Central cuando esté disponible)
- **Costo estimado**: $1,650/mes ($15,192/año con Savings Plans)
- **Configuración**:
  - 3 AZs (alta disponibilidad completa)
  - RDS: db.r7g.large Multi-AZ (4 vCPU, 32 GB)
  - ECS: 3 tareas API, 2 tareas Worker
  - Lambda: Provisioned Concurrency = 10

## Validación de Costos

Antes de aplicar, genera un cost estimate:

```bash
# Opción 1: Usar terraform plan con output JSON
terraform plan -out=plan.tfplan
terraform show -json plan.tfplan > plan.json

# Opción 2: Usar Infracost (recomendado)
brew install infracost
infracost auth login
infracost breakdown --path .
```

## Gestión de Secrets

Los secrets sensibles se gestionan con AWS Secrets Manager:

```bash
# Ejemplo: Guardar Azure AD Client Secret
aws secretsmanager create-secret \
  --name /hergon/prod/azure-ad/client-secret \
  --description "Azure AD Client Secret for API authentication" \
  --secret-string '{"clientSecret":"tu-client-secret-aqui"}' \
  --region us-east-1

# Actualizar secret
aws secretsmanager put-secret-value \
  --secret-id /hergon/prod/azure-ad/client-secret \
  --secret-string '{"clientSecret":"nuevo-secret"}' \
  --region us-east-1
```

## Actualización de Infraestructura

```bash
# 1. Pull últimos cambios
git pull origin main

# 2. Revisar cambios
cd environments/prod
terraform plan

# 3. Aplicar cambios
terraform apply

# 4. Verificar deployment
aws ecs describe-services \
  --cluster hergon-cluster-prod \
  --services hergon-api-service \
  --region us-east-1
```

## Rollback

Si algo falla después de un apply:

```bash
# Opción 1: Revertir a estado anterior (si tienes backup)
terraform state pull > backup.tfstate
terraform state push previous.tfstate

# Opción 2: Destruir y recrear recurso específico
terraform destroy -target=module.compute.aws_ecs_service.api
terraform apply -target=module.compute.aws_ecs_service.api

# Opción 3: Rollback completo (extremo)
terraform destroy
# Luego volver a aplicar versión anterior desde git
```

## Destrucción de Infraestructura

**CUIDADO**: Esto eliminará toda la infraestructura y datos.

```bash
# Staging (menos crítico)
cd environments/staging
terraform destroy

# Producción (requiere múltiples confirmaciones)
cd environments/prod

# 1. Backup de bases de datos
aws rds create-db-snapshot \
  --db-instance-identifier hergon-catalog-db-prod \
  --db-snapshot-identifier hergon-catalog-final-$(date +%Y%m%d-%H%M%S)

# 2. Destruir
terraform destroy
```

## Monitoreo de Costos

```bash
# Ver costos actuales
aws ce get-cost-and-usage \
  --time-period Start=2025-01-01,End=2025-01-31 \
  --granularity MONTHLY \
  --metrics BlendedCost \
  --group-by Type=TAG,Key=Environment

# Ver forecast
aws ce get-cost-forecast \
  --time-period Start=2025-02-01,End=2025-02-28 \
  --metric BLENDED_COST \
  --granularity MONTHLY
```

## Troubleshooting

### Error: State locked

```bash
# Ver lock
aws dynamodb get-item \
  --table-name hergon-terraform-lock \
  --key '{"LockID":{"S":"hergon-terraform-state-prod/terraform.tfstate-md5"}}'

# Forzar unlock (solo si estás seguro)
terraform force-unlock <lock-id>
```

### Error: Insufficient capacity

Si ECS Fargate no puede lanzar tareas:

```bash
# Cambiar a otra AZ temporalmente
terraform apply -var="preferred_az=us-east-1b"
```

### Error: RDS snapshot restore

```bash
# Listar snapshots
aws rds describe-db-snapshots \
  --db-instance-identifier hergon-catalog-db-prod

# Restaurar
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier hergon-catalog-db-prod-restored \
  --db-snapshot-identifier hergon-catalog-snapshot-20250120
```

## Migración a AWS Mexico Central

Cuando AWS lance Mexico Central region:

```bash
# 1. Actualizar variables
cd environments/prod
vi terraform.tfvars
# Cambiar: region = "mx-central-1"

# 2. Crear snapshot y backup
./scripts/backup-before-migration.sh

# 3. Aplicar en nueva región
terraform plan -var="region=mx-central-1"
terraform apply

# 4. Migrar datos (RDS snapshot copy cross-region)
aws rds copy-db-snapshot \
  --source-db-snapshot-identifier arn:aws:rds:us-east-1:123456:snapshot:hergon-catalog-final \
  --target-db-snapshot-identifier hergon-catalog-mx-central \
  --source-region us-east-1 \
  --region mx-central-1

# 5. Actualizar DNS (Route 53)
# 6. Destruir infraestructura antigua
```

## Scripts Útiles

```bash
# Ver outputs de ambiente
terraform output

# Ver estado de recursos
terraform state list
terraform state show module.database.aws_db_instance.catalog

# Refrescar estado sin aplicar
terraform refresh

# Formatear archivos
terraform fmt -recursive

# Validar configuración
terraform validate

# Generar gráfico de dependencias
terraform graph | dot -Tpng > graph.png
```

## Contacto y Soporte

- **Documentación técnica**: `PLAN_IMPLEMENTACION_AWS_AZURE_AD.md`
- **Arquitectura**: `ARQUITECTURA_OPTIMIZADA_REALISTA.md`
- **Comparativa cloud**: `COMPARATIVA_AZURE_VS_AWS_2025.md`

---

**Última actualización**: 2025-01-20
**Versión Terraform**: 1.6+
**Proveedor AWS**: ~> 5.0
