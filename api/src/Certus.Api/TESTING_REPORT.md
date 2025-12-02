# Certus API - Reporte de Pruebas Sistemáticas

**Fecha:** 2025-11-26
**Versión API:** 1.0.0
**Framework:** .NET 10.0
**Base URL:** http://localhost:5000/api/v1

---

## Resumen Ejecutivo

| Métrica | Valor |
|---------|-------|
| **Total Tests** | 33 |
| **Passed** | 33 |
| **Failed** | 0 |
| **Pass Rate** | **100%** |

---

## Bugs Corregidos

### 1. DateTime UTC Bug (ExportsController.cs)

**Problema:** Error 500 al exportar reportes por período
**Causa:** PostgreSQL requiere `DateTimeKind.Utc` para columnas `timestamp with time zone`, pero los parámetros de query llegaban con `Kind=Unspecified`

**Error Original:**
```
Cannot write DateTime with Kind=Unspecified to PostgreSQL type 'timestamp with time zone', only UTC is supported
```

**Solución (líneas 216-218 y 255-257):**
```csharp
// Convert DateTime to UTC for PostgreSQL timestamp with time zone compatibility
var utcStartDate = DateTime.SpecifyKind(startDate, DateTimeKind.Utc);
var utcEndDate = DateTime.SpecifyKind(endDate, DateTimeKind.Utc);
```

**Archivos modificados:**
- `Controllers/ExportsController.cs`

---

### 2. Authorization Policy Bug (DependencyInjection.cs)

**Problema:** Error 403 Forbidden en endpoints de AuditLog para usuarios SystemAdmin
**Causa:** Las políticas de autorización usaban nombres de roles incorrectos (`"Admin"`) que no coincidían con el enum `UserRole` (`"SystemAdmin"`)

**Configuración Incorrecta:**
```csharp
options.AddPolicy("RequireSupervisor", policy => policy.RequireRole("Admin", "Supervisor"));
```

**Solución (línea 170-172):**
```csharp
// Políticas basadas en roles - usando nombres exactos del enum UserRole
options.AddPolicy("RequireAdmin", policy => policy.RequireRole("SystemAdmin", "AforeAdmin"));
options.AddPolicy("RequireSupervisor", policy => policy.RequireRole("SystemAdmin", "AforeAdmin", "Supervisor"));
options.AddPolicy("RequireAnalyst", policy => policy.RequireRole("SystemAdmin", "AforeAdmin", "Supervisor", "AforeAnalyst"));
```

**Archivos modificados:**
- `../Certus.Infrastructure/DependencyInjection.cs`

---

## Resultados por Categoría

### 1. Smoke Tests (3/3)
| Test | Endpoint | Status |
|------|----------|--------|
| Health Check | GET /health | ✅ 200 |
| Ping | GET /api/v1/ping | ✅ 200 |
| Version | GET /api/v1/version | ✅ 200 |

### 2. Authentication (4/4)
| Test | Endpoint | Status |
|------|----------|--------|
| Login - Valid | GET /api/v1/auth/me | ✅ 200 |
| Login - No Token | GET /api/v1/auth/me | ✅ 401 |
| Login - Invalid Password | POST /api/v1/auth/login | ✅ 401 |
| Logout | POST /api/v1/auth/logout | ✅ 204 |

### 3. Catalogs (6/6)
| Test | Endpoint | Status |
|------|----------|--------|
| Get All Catalogs | GET /api/v1/catalogs | ✅ 200 |
| Get Catalog by Code | GET /api/v1/catalogs/code/FILE_TYPES | ✅ 200 |
| Get Catalogs by Source | GET /api/v1/catalogs/source/CONSAR | ✅ 200 |
| Get Non-existent Catalog | GET /api/v1/catalogs/code/NONEXISTENT | ✅ 404 |
| Get Catalog by ID | GET /api/v1/catalogs/{id} | ✅ 200 |
| Search Catalog Entries | GET /api/v1/catalogs/{id}/entries/search | ✅ 200 |

### 4. Validations (4/4)
| Test | Endpoint | Status |
|------|----------|--------|
| Get Validations List | GET /api/v1/validations | ✅ 200 |
| Get Recent Validations | GET /api/v1/validations/recent | ✅ 200 |
| Get Validation Statistics | GET /api/v1/validations/statistics | ✅ 200 |
| Get Non-existent Validation | GET /api/v1/validations/{id} | ✅ 404 |

### 5. Dashboard (5/5)
| Test | Endpoint | Status |
|------|----------|--------|
| Get Dashboard Statistics | GET /api/v1/dashboard/statistics | ✅ 200 |
| Get Recent Validations | GET /api/v1/dashboard/recent-validations | ✅ 200 |
| Get Activity Feed | GET /api/v1/dashboard/activity | ✅ 200 |
| Get Dashboard Alerts | GET /api/v1/dashboard/alerts | ✅ 200 |
| Get Dashboard Trends | GET /api/v1/dashboard/trends | ✅ 200 |

### 6. Approvals (3/3)
| Test | Endpoint | Status |
|------|----------|--------|
| Get Approvals List | GET /api/v1/approvals | ✅ 200 |
| Get Approval Statistics | GET /api/v1/approvals/statistics | ✅ 200 |
| Get Non-existent Approval | GET /api/v1/approvals/{id} | ✅ 404 |

### 7. Validators (2/2)
| Test | Endpoint | Status |
|------|----------|--------|
| Get All Validators | GET /api/v1/validators | ✅ 200 |
| Get Validator Groups | GET /api/v1/validators/groups | ✅ 200 |

### 8. Audit Log (3/3)
| Test | Endpoint | Status |
|------|----------|--------|
| Get Audit Logs | GET /api/v1/auditlog | ✅ 200 |
| Get Audit Statistics | GET /api/v1/auditlog/statistics | ✅ 200 |
| Get Audit Action Types | GET /api/v1/auditlog/actions | ✅ 200 |

### 9. Exports (3/3)
| Test | Endpoint | Status |
|------|----------|--------|
| Export PDF (Non-existent) | GET /api/v1/exports/validations/{id}/pdf | ✅ 404 |
| Export Excel (Non-existent) | GET /api/v1/exports/validations/{id}/excel | ✅ 404 |
| Export Period Report (CSV) | GET /api/v1/exports/reports/period | ✅ 200 |

---

## Arquitectura de la API

```
Certus.Api/
├── Controllers/
│   ├── AuthController.cs          # Autenticación JWT
│   ├── ValidationsController.cs   # Gestión de validaciones
│   ├── CatalogsController.cs      # Catálogos CONSAR
│   ├── DashboardController.cs     # Métricas y KPIs
│   ├── ApprovalsController.cs     # Flujo de aprobaciones
│   ├── ValidatorsController.cs    # Reglas de validación
│   ├── AuditLogController.cs      # Auditoría
│   └── ExportsController.cs       # Exportación PDF/Excel/CSV
├── Hubs/
│   └── ValidationHub.cs           # SignalR real-time
├── Middleware/
│   └── CorrelationIdMiddleware.cs # Request tracking
└── Configuration/
    └── ApiVersioningConfiguration.cs
```

---

## Roles y Permisos

| Rol | Políticas Autorizadas |
|-----|----------------------|
| SystemAdmin | RequireAdmin, RequireSupervisor, RequireAnalyst, CanExport, CanApprove, CanManageUsers |
| AforeAdmin | RequireAdmin, RequireSupervisor, RequireAnalyst, CanExport, CanApprove |
| Supervisor | RequireSupervisor, RequireAnalyst, CanExport, CanApprove |
| AforeAnalyst | RequireAnalyst, CanExport |
| Auditor | CanExport (solo lectura) |
| Viewer | Solo lectura básica |

---

## Ejecución de Pruebas

### Script de Pruebas Automatizado
```bash
# Ubicación: /tmp/certus_api_tests_v2.sh
bash /tmp/certus_api_tests_v2.sh
```

### Credenciales de Prueba
```json
{
  "email": "admin@certus.mx",
  "password": "Admin123!"
}
```

### Resultados
El reporte detallado se genera en: `/tmp/certus_test_report_v2.md`

---

## Mejoras Recomendadas

1. **Seguridad**: Actualizar `Newtonsoft.Json` de 11.0.1 a versión más reciente (vulnerabilidad conocida GHSA-5crp-9r3c-p9vr)
2. **Monitoreo**: Implementar health checks para PostgreSQL (actualmente deshabilitado por token auth)
3. **Testing**: Agregar tests de integración con xUnit/NUnit
4. **CI/CD**: Implementar pipeline de GitHub Actions para pruebas automatizadas

---

**Generado automáticamente por el sistema de pruebas Certus**
