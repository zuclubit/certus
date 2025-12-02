# Certus API

[![CI Pipeline](https://github.com/sh-certus/certus-api/actions/workflows/ci.yml/badge.svg)](https://github.com/sh-certus/certus-api/actions/workflows/ci.yml)
[![CD Pipeline](https://github.com/sh-certus/certus-api/actions/workflows/cd.yml/badge.svg)](https://github.com/sh-certus/certus-api/actions/workflows/cd.yml)
[![.NET](https://img.shields.io/badge/.NET-9.0-512BD4)](https://dotnet.microsoft.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-Proprietary-red)](LICENSE)

Backend API para el **Sistema de Validacion CONSAR - Certus**. Plataforma enterprise para validacion de archivos regulatorios del Sistema de Ahorro para el Retiro (SAR) en Mexico.

## Caracteristicas Principales

- **Validacion de Archivos CONSAR**: Soporte para multiples layouts regulatorios (MOV, RCV, ACV, SIEFORE, etc.)
- **Multi-tenant**: Arquitectura preparada para multiples AFOREs
- **Scrapers Normativos**: Recoleccion automatizada de 40+ fuentes regulatorias mexicanas
- **Real-time Updates**: Notificaciones via SignalR para progreso de validaciones
- **Sistema de Aprobaciones**: Workflow de revision y aprobacion de validaciones
- **Exportacion**: Generacion de reportes en PDF y Excel
- **Auditoria Completa**: Registro de todas las operaciones del sistema

## Stack Tecnologico

| Categoria | Tecnologia |
|-----------|------------|
| Framework | .NET 9.0 |
| Base de Datos | PostgreSQL 16 |
| ORM | Entity Framework Core 9 |
| Arquitectura | Clean Architecture + CQRS |
| Mensajeria | MediatR |
| Validacion | FluentValidation |
| Real-time | SignalR |
| Autenticacion | JWT Bearer |
| Logging | Serilog |
| Documentacion | Swagger/OpenAPI |
| Contenedores | Docker |

## Arquitectura

```
src/
├── Certus.Domain/           # Entidades, enums, interfaces del dominio
│   ├── Entities/            # Entidades de negocio
│   ├── Enums/               # Enumeraciones del dominio
│   ├── Events/              # Domain Events
│   └── Services/            # Interfaces de servicios
│
├── Certus.Application/      # Capa de aplicacion (CQRS)
│   ├── Features/            # Commands y Queries por feature
│   ├── DTOs/                # Data Transfer Objects
│   ├── Common/              # Behaviors, Interfaces
│   └── Mappings/            # Perfiles de AutoMapper
│
├── Certus.Infrastructure/   # Implementaciones de infraestructura
│   ├── Data/                # EF Core, Migraciones, Repositorios
│   ├── Identity/            # Autenticacion JWT
│   ├── Services/            # Servicios externos, Scrapers
│   └── Configuration/       # Configuraciones
│
└── Certus.Api/              # Capa de presentacion
    ├── Controllers/         # REST API Controllers
    ├── Hubs/                # SignalR Hubs
    ├── Middleware/          # Custom Middleware
    └── Configuration/       # Configuracion de API
```

## Inicio Rapido

### Prerrequisitos

- [.NET 9.0 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- [Git](https://git-scm.com/)

### Desarrollo Local

1. **Clonar el repositorio:**
```bash
git clone https://github.com/sh-certus/certus-api.git
cd certus-api
```

2. **Iniciar PostgreSQL con Docker:**
```bash
docker-compose -f docker-compose.dev.yml up -d
```

3. **Configurar variables de entorno:**
```bash
cp .env.example .env
# Editar .env con tus configuraciones
```

4. **Aplicar migraciones:**
```bash
dotnet ef database update -p src/Certus.Infrastructure -s src/Certus.Api
```

5. **Ejecutar la API:**
```bash
dotnet run --project src/Certus.Api
```

La API estara disponible en:
- **API**: http://localhost:5000
- **Swagger UI**: http://localhost:5000/swagger
- **Health Check**: http://localhost:5000/health

### Docker (Produccion)

```bash
# Build y ejecutar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f api
```

## Endpoints Principales

### Autenticacion
| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| POST | `/api/v1/auth/login` | Iniciar sesion |
| POST | `/api/v1/auth/refresh` | Refrescar token |
| POST | `/api/v1/auth/logout` | Cerrar sesion |

### Validaciones
| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/api/v1/validations` | Listar validaciones |
| GET | `/api/v1/validations/{id}` | Obtener validacion |
| POST | `/api/v1/validations` | Subir archivo para validar |
| POST | `/api/v1/validations/{id}/substitute` | Crear retransmision |
| POST | `/api/v1/validations/{id}/cancel` | Cancelar validacion |

### Estadisticas
| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/api/v1/validations/statistics` | Estadisticas generales |
| GET | `/api/v1/dashboard/summary` | Resumen del dashboard |

### Scrapers
| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/api/v1/scrapers` | Listar scrapers |
| POST | `/api/v1/scrapers/{id}/execute` | Ejecutar scraper |
| GET | `/api/v1/scrapers/executions` | Historial de ejecuciones |

## SignalR Hubs

### ValidationHub
Conexion: `ws://localhost:5000/hubs/validation`

**Eventos:**
- `ValidationProgress` - Progreso de validacion en tiempo real
- `ValidationCompleted` - Validacion completada
- `ValidationError` - Error en validacion

### ScraperHub
Conexion: `ws://localhost:5000/hubs/scraper`

**Eventos:**
- `ScraperProgress` - Progreso de scraper
- `ScraperCompleted` - Scraper completado
- `DocumentFound` - Nuevo documento encontrado

## Variables de Entorno

```env
# Base de datos
ConnectionStrings__DefaultConnection=Host=localhost;Port=5432;Database=certus;Username=postgres;Password=your_password

# JWT
Jwt__SecretKey=YourSecretKeyMinimum32Characters!
Jwt__Issuer=Certus
Jwt__Audience=CertusApi
Jwt__AccessTokenExpirationMinutes=60

# CORS
Cors__AllowedOrigins__0=http://localhost:5173

# File Storage
FileStorage__BasePath=./storage
FileStorage__MaxFileSizeMB=100

# Logging
Serilog__MinimumLevel__Default=Information
```

## Comandos Utiles

### Entity Framework Core

```bash
# Crear nueva migracion
dotnet ef migrations add NombreMigracion -p src/Certus.Infrastructure -s src/Certus.Api

# Aplicar migraciones
dotnet ef database update -p src/Certus.Infrastructure -s src/Certus.Api

# Revertir migracion
dotnet ef database update MigracionAnterior -p src/Certus.Infrastructure -s src/Certus.Api

# Generar script SQL
dotnet ef migrations script -p src/Certus.Infrastructure -s src/Certus.Api -o migration.sql
```

### Testing

```bash
# Ejecutar todos los tests
dotnet test

# Tests con coverage
dotnet test --collect:"XPlat Code Coverage"

# Tests especificos
dotnet test --filter "FullyQualifiedName~ValidationTests"
```

### Docker

```bash
# Build imagen
docker build -t certus-api .

# Ejecutar contenedor
docker run -p 8080:8080 certus-api

# Ver logs
docker logs certus-api -f
```

## Scrapers Disponibles

El sistema incluye scrapers para las siguientes fuentes regulatorias:

| Fuente | Descripcion |
|--------|-------------|
| CONSAR | Comision Nacional del SAR |
| CNBV | Comision Nacional Bancaria |
| Banxico | Banco de Mexico |
| SAT | Servicio de Administracion Tributaria |
| IMSS | Instituto Mexicano del Seguro Social |
| DOF | Diario Oficial de la Federacion |
| INFONAVIT | Instituto del Fondo Nacional de la Vivienda |
| VALMER | Valuacion Operativa y Referencias de Mercado |
| BMV | Bolsa Mexicana de Valores |
| Y 30+ mas... | |

## Contribuir

Por favor lee [CONTRIBUTING.md](CONTRIBUTING.md) para detalles sobre nuestro proceso de contribucion.

## Seguridad

Para reportar vulnerabilidades de seguridad, por favor lee [SECURITY.md](SECURITY.md).

## Equipo

Desarrollado por el equipo de **Hergon Digital** para el ecosistema Certus.

## Licencia

Este proyecto es software propietario. Todos los derechos reservados.

Copyright (c) 2024-2025 Hergon Digital
