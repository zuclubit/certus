# Quick Start - Terraform Hergon

Comandos esenciales para desplegar rápidamente.

## 🚀 Despliegue Rápido (Staging)

```bash
# 1. Ir al directorio de staging
cd terraform/environments/staging

# 2. Crear backend (SOLO LA PRIMERA VEZ)
aws s3api create-bucket --bucket hergon-terraform-state-staging --region us-east-1
aws s3api put-bucket-versioning --bucket hergon-terraform-state-staging --versioning-configuration Status=Enabled

# 3. Crear tabla DynamoDB (SOLO LA PRIMERA VEZ, compartida entre ambientes)
aws dynamodb create-table \
  --table-name hergon-terraform-lock \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1

# 4. Configurar variables
cp terraform.tfvars.example terraform.tfvars
nano terraform.tfvars  # Completar valores reales

# 5. Inicializar Terraform
terraform init

# 6. Ver plan
terraform plan

# 7. Aplicar
terraform apply

# 8. Ver outputs
terraform output
```

## 📋 Valores Obligatorios en terraform.tfvars

```hcl
# Azure AD (obtener de Azure Portal)
azure_tenant_id     = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
azure_client_id     = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
azure_client_secret = "tu-client-secret-aqui"
azure_audience      = "api://hergon-api-staging"

# Database password (generar con: openssl rand -base64 32 | tr -d "/@\"\'")
db_master_password = "password-seguro-minimo-16-caracteres"

# SSL Certificate (crear en ACM primero)
ssl_certificate_arn = "arn:aws:acm:us-east-1:123456:certificate/xxxxx"

# Alertas
alert_email = "dev@hergon.com"
```

## 🔑 Generar Password Seguro

```bash
openssl rand -base64 32 | tr -d "/@\"\'"
```

## 🔐 Crear Certificado SSL en ACM

```bash
aws acm request-certificate \
  --domain-name staging.api.hergon.com \
  --validation-method DNS \
  --region us-east-1
```

## ✅ Verificar Despliegue

```bash
# Health check
curl -X GET $(terraform output -raw stage_invoke_url)/health

# Ver outputs
terraform output

# Ver dashboard
terraform output -raw main_dashboard_url | xargs open
```

## 🔄 Actualizar Infraestructura

```bash
# Plan
terraform plan

# Apply
terraform apply
```

## 🗑️ Destruir (con cuidado)

```bash
# Usar script de destrucción segura
../../scripts/destroy.sh staging
```

## 📊 Ver Costos

```bash
# Dashboard de costos
terraform output -raw costs_dashboard_url | xargs open

# CLI
aws ce get-cost-and-usage \
  --time-period Start=2025-01-01,End=2025-01-31 \
  --granularity MONTHLY \
  --metrics BlendedCost
```

## 🔍 Ver Logs

```bash
# API Gateway
aws logs tail /aws/apigateway/hergon-staging --follow

# ECS
aws logs tail /ecs/hergon-api-service-staging --follow
```

## 🆘 Problemas Comunes

### Error: Backend not configured
```bash
terraform init
```

### Error: No such bucket
```bash
# Crear bucket manualmente
aws s3api create-bucket --bucket hergon-terraform-state-staging --region us-east-1
```

### Error: 401 Unauthorized en API
- Verificar que `azure_tenant_id` sea correcto
- Verificar que `azure_audience` coincida con Azure AD
- Obtener nuevo token de Azure AD

## 📚 Más Información

- **Guía completa**: `DEPLOYMENT_GUIDE.md` (600+ líneas, muy detallada)
- **Resumen técnico**: `TERRAFORM_SUMMARY.md`
- **Scripts**: `scripts/deploy.sh` y `scripts/destroy.sh`

---

**Tiempo de despliegue**: ~20 minutos
**Costo estimado**: $450/mes (staging), $1,650/mes (prod)
