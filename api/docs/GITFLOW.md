# GitFlow - Certus API

Este documento describe el flujo de trabajo de Git implementado para el proyecto Certus API.

## Ramas Principales

### `main`
- **Propósito**: Código en producción, siempre estable
- **Protección**: Requiere PR y aprobación
- **Despliegue**: Automático a **Staging** en cada merge
- **Tags**: Los releases se crean desde esta rama

### `develop`
- **Propósito**: Rama de integración para desarrollo
- **Protección**: Requiere PR
- **Despliegue**: Automático a **Development** en cada merge

## Ramas de Soporte

### `feature/*`
- **Origen**: `develop`
- **Destino**: `develop`
- **Naming**: `feature/nombre-descriptivo`
- **Ejemplo**: `feature/add-user-authentication`

```bash
# Crear feature branch
git checkout develop
git pull origin develop
git checkout -b feature/mi-nueva-funcionalidad

# Trabajar en la feature...
git add .
git commit -m "feat: descripción del cambio"

# Finalizar feature
git push origin feature/mi-nueva-funcionalidad
# Crear PR hacia develop
```

### `release/*`
- **Origen**: `develop`
- **Destino**: `main` y `develop`
- **Naming**: `release/v1.2.0`

```bash
# Crear release branch
git checkout develop
git pull origin develop
git checkout -b release/v1.2.0

# Preparar release (actualizar versión, changelog)
git add .
git commit -m "chore: prepare release v1.2.0"

# Finalizar release
git push origin release/v1.2.0
# Crear PR hacia main
# Después de merge a main, crear tag y merge a develop
```

### `hotfix/*`
- **Origen**: `main`
- **Destino**: `main` y `develop`
- **Naming**: `hotfix/descripcion-corta`

```bash
# Crear hotfix branch
git checkout main
git pull origin main
git checkout -b hotfix/fix-critical-bug

# Aplicar fix
git add .
git commit -m "fix: descripción del fix crítico"

# Finalizar hotfix
git push origin hotfix/fix-critical-bug
# Crear PR hacia main
# Después de merge a main, merge a develop
```

## Flujo de Despliegue

```
┌─────────────────────────────────────────────────────────────────┐
│                        GITFLOW DIAGRAM                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   feature/xxx ──────┐                                           │
│                     │                                           │
│   feature/yyy ──────┼──► develop ──────────────► Development    │
│                     │       │                    (ACI Dev)      │
│   feature/zzz ──────┘       │                                   │
│                             │                                   │
│                             ▼                                   │
│                       release/vX.X.X                            │
│                             │                                   │
│                             ▼                                   │
│   hotfix/xxx ──────────► main ─────────────────► Staging        │
│        │                   │                     (ACI Staging)  │
│        │                   │                                    │
│        │                   ▼                                    │
│        │              tag: vX.X.X ─────────────► Production     │
│        │                                         (ACI Prod)     │
│        │                                                        │
│        └──────────────► develop                                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Ambientes de Despliegue

| Ambiente | Trigger | URL | ACI Instance |
|----------|---------|-----|--------------|
| Development | Push a `develop` | http://certus-api-dev.eastus2.azurecontainer.io:8080 | aci-certus-dev-api |
| Staging | Push a `main` | http://certus-api-staging.eastus2.azurecontainer.io:8080 | aci-certus-staging-api |
| Production | Tag `v*` | http://certus-api.eastus2.azurecontainer.io:8080 | aci-certus-prod-api |

## Convenciones de Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Tipos de Commit

| Tipo | Descripción |
|------|-------------|
| `feat` | Nueva funcionalidad |
| `fix` | Corrección de bug |
| `docs` | Cambios en documentación |
| `style` | Cambios de formato (no afectan código) |
| `refactor` | Refactorización de código |
| `perf` | Mejoras de rendimiento |
| `test` | Agregar o modificar tests |
| `chore` | Tareas de mantenimiento |
| `ci` | Cambios en CI/CD |

### Ejemplos

```bash
feat(auth): add JWT refresh token support
fix(validation): correct CURP regex pattern
docs(api): update swagger documentation
refactor(services): extract validation logic to separate service
```

## Crear un Release

```bash
# 1. Asegurar que develop está actualizado
git checkout develop
git pull origin develop

# 2. Crear release branch
git checkout -b release/v1.2.0

# 3. Actualizar versión en csproj si aplica
# 4. Actualizar CHANGELOG.md

# 5. Commit de preparación
git add .
git commit -m "chore: prepare release v1.2.0"

# 6. Push y crear PR hacia main
git push origin release/v1.2.0

# 7. Después de aprobar PR y merge a main:
git checkout main
git pull origin main
git tag -a v1.2.0 -m "Release v1.2.0"
git push origin v1.2.0

# 8. Merge cambios de vuelta a develop
git checkout develop
git merge main
git push origin develop
```

## Secrets Configurados en GitHub

| Secret | Descripción |
|--------|-------------|
| `AZURE_CREDENTIALS` | Service Principal para Azure |
| `ACR_LOGIN_SERVER` | URL del Azure Container Registry |
| `ACR_USERNAME` | Usuario de ACR |
| `ACR_PASSWORD` | Password de ACR |
| `DATABASE_CONNECTION_STRING` | Connection string de PostgreSQL |
| `JWT_SECRET_KEY` | Clave secreta para JWT |
| `APP_INSIGHTS_CONNECTION_STRING` | Connection string de Application Insights |
| `AZURE_SUBSCRIPTION_ID` | ID de suscripción Azure |
| `AZURE_RESOURCE_GROUP` | Resource Group de Azure |

## Recursos de Azure

| Recurso | Nombre | Propósito |
|---------|--------|-----------|
| Container Registry | acrcertusdev | Almacén de imágenes Docker |
| Container Instance | aci-certus-dev-api | Ambiente Development |
| Container Instance | aci-certus-staging-api | Ambiente Staging |
| Container Instance | aci-certus-prod-api | Ambiente Production |
| PostgreSQL | psql-certus-dev | Base de datos |
| Key Vault | kv-certusdevg27d | Secretos |
| Storage | stcertusdev9w8r | Almacenamiento de archivos |
| App Insights | appi-certus-dev | Monitoreo |

## Comandos Útiles

```bash
# Ver estado de ramas
git branch -a

# Actualizar rama local con remoto
git fetch origin
git pull origin <branch>

# Cambiar a rama existente
git checkout <branch>

# Ver historial de commits
git log --oneline --graph --decorate

# Ver diferencias entre ramas
git diff develop..main

# Rebase de feature sobre develop actualizado
git checkout feature/mi-feature
git rebase develop
```

## Troubleshooting

### Error en despliegue
1. Verificar logs en GitHub Actions
2. Revisar estado del ACI: `az container logs --name <aci-name> --resource-group rg-certus-dev`
3. Verificar secrets en GitHub Settings > Secrets and variables > Actions

### Conflictos de merge
1. Resolver localmente
2. Usar `git mergetool` o resolver manualmente
3. Commit de resolución: `git commit -m "fix: resolve merge conflicts"`
