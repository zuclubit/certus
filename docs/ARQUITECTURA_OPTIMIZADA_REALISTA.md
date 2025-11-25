# ARQUITECTURA OPTIMIZADA - HERGON VECTOR01
## Diseño Production-Ready para 2 AFOREs + Expansión Latinoamérica

**Fecha:** 20 Noviembre 2025
**Versión:** 2.0 - Optimizada para Contexto Real
**Estado:** Recomendación Final

---

## CONTEXTO DEL NEGOCIO

**Situación Actual:**
- 2 AFOREs confirmadas en México
- Equipo de especialistas técnicos disponible
- Capital disponible suficiente
- Visión: Expansión a Latinoamérica (Chile, Colombia, Perú)

**Objetivos de Arquitectura:**
1. Production-ready desde día 1 (no MVP)
2. Profesional para venta enterprise
3. Certificable y auditable (regulatorio)
4. Escalable sin reescritura (2 a 50 clientes)
5. Multi-país desde diseño
6. Costo optimizado (no over-engineering)

---

## ARQUITECTURA DE ALTO NIVEL

```
┌─────────────────────────────────────────────────────────────────────┐
│                         INTERNET / CLIENTES                          │
└────────────────────────────────┬────────────────────────────────────┘
                                 │ HTTPS
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    AZURE FRONT DOOR (CDN + WAF)                      │
│  • DDoS Protection                                                   │
│  • SSL/TLS Termination                                               │
│  • Geo-routing (Mexico, Chile, Colombia, Peru)                       │
│  • Rate Limiting                                                     │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   API MANAGEMENT (Developer Tier)                    │
│  • OAuth 2.0 Authentication                                          │
│  • API Versioning (v1, v2)                                           │
│  • Request/Response transformation                                   │
│  • Analytics & Monitoring                                            │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                 ┌───────────────┴───────────────┐
                 │                               │
                 ▼                               ▼
┌──────────────────────────────┐   ┌──────────────────────────────┐
│   AZURE CONTAINER APPS       │   │  AZURE FUNCTIONS             │
│   (Managed Kubernetes)       │   │  (Serverless)                │
│                              │   │                              │
│  ┌────────────────────────┐ │   │  ┌────────────────────────┐ │
│  │ API Service            │ │   │  │ Validation Functions   │ │
│  │ - .NET 8               │ │   │  │ - 37 validators        │ │
│  │ - 1-5 replicas         │ │   │  │ - Premium Plan (VNET)  │ │
│  │ - Auto-scale           │ │   │  │ - 2 always-on          │ │
│  └────────────────────────┘ │   │  └────────────────────────┘ │
│                              │   │                              │
│  ┌────────────────────────┐ │   │  ┌────────────────────────┐ │
│  │ Worker Service         │ │   │  │ Background Jobs        │ │
│  │ - .NET 8               │ │   │  │ - Parser               │ │
│  │ - 1-10 replicas        │ │   │  │ - Report Generator     │ │
│  │ - Queue-triggered      │ │   │  │ - Notifications        │ │
│  └────────────────────────┘ │   │  └────────────────────────┘ │
└──────────────────────────────┘   └──────────────────────────────┘
                 │                               │
                 └───────────────┬───────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      AZURE SERVICE BUS (STANDARD)                    │
│  • Topics: file-events, validation-events, notification-events      │
│  • Queues: validation-queue, report-queue                            │
│  • Dead-letter handling                                              │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                 ┌───────────────┴───────────────┐
                 │                               │
                 ▼                               ▼
┌──────────────────────────────┐   ┌──────────────────────────────┐
│  AZURE SQL DATABASE          │   │  AZURE COSMOS DB             │
│  (General Purpose)           │   │  (Serverless)                │
│                              │   │                              │
│  ┌────────────────────────┐ │   │  ┌────────────────────────┐ │
│  │ CatalogDB              │ │   │  │ EventStore             │ │
│  │ - 4 vCore              │ │   │  │ - 1000 RU/s autoscale  │ │
│  │ - Zone redundant       │ │   │  │ - Change feed enabled  │ │
│  └────────────────────────┘ │   │  └────────────────────────┘ │
│                              │   │                              │
│  ┌────────────────────────┐ │   │  ┌────────────────────────┐ │
│  │ ReadModelsDB           │ │   │  │ AuditLog               │ │
│  │ - 4 vCore              │ │   │  │ - Compliance 7 años    │ │
│  │ - Read replica         │ │   │  │ - Immutable            │ │
│  └────────────────────────┘ │   │  └────────────────────────┘ │
└──────────────────────────────┘   └──────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    AZURE CACHE FOR REDIS                             │
│  • Standard C1 (1GB)                                                 │
│  • Session state + catalog caching                                   │
│  • Distributed locks                                                 │
└─────────────────────────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     AZURE BLOB STORAGE                               │
│  • Hot tier: Archivos recientes (< 30 días)                          │
│  • Cool tier: Archivos históricos (30-365 días)                      │
│  • Archive tier: Regulatorio (> 365 días)                            │
│  • Lifecycle management automático                                   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## DIFERENCIAS vs DISEÑO ORIGINAL

### LO QUE MANTUVIMOS (Esencial)

✅ **Event-Driven Architecture** - Necesario para trazabilidad regulatoria
✅ **CQRS Pattern** - Separación read/write para performance
✅ **Serverless Functions** - Para validaciones paralelas
✅ **Multi-tenancy** - Aislamiento por AFORE/país
✅ **Event Sourcing** - Auditoría completa (CONSAR requirement)

### LO QUE SIMPLIFICAMOS (Smart)

🔄 **AKS → Azure Container Apps**
- **Ahorro:** $800/mes
- **Por qué:** Managed Kubernetes sin overhead de gestión
- **Capacidad:** Misma (0-100 replicas)
- **Complejidad:** 70% menor

🔄 **Service Bus Premium → Standard**
- **Ahorro:** $658/mes
- **Por qué:** Standard suficiente para < 10,000 archivos/mes
- **Trade-off:** Sin geo-replication (no crítico año 1)

🔄 **Cosmos DB siempre activo → Serverless**
- **Ahorro:** $526/mes
- **Por qué:** Workload intermitente (validaciones puntuales)
- **Trade-off:** Cold start ~500ms (aceptable)

🔄 **Redis Premium → Standard**
- **Ahorro:** $196/mes
- **Por qué:** 1GB suficiente para cache de catálogos
- **Trade-off:** Sin clustering (no necesario aún)

🔄 **SQL 8 vCore → 4 vCore (cada DB)**
- **Ahorro:** $1,200/mes
- **Por qué:** Rightsizing para workload real
- **Capacidad:** ~5,000 archivos/mes (suficiente)

### LO QUE ELIMINAMOS (Premature Optimization)

❌ **Geo-replication multi-región**
- Backup + restore manual suficiente año 1
- Implementar cuando tengas clientes en múltiples países

❌ **Azure Synapse Analytics**
- Power BI puede conectar directo a SQL
- Agregar cuando > 100K archivos históricos

❌ **Application Gateway**
- Azure Front Door + APIM suficiente
- Agregar solo si necesitas WAF avanzado

❌ **37 Functions separadas en Premium Plan**
- 10 en Premium (críticas), 27 en Consumption
- Ahorro sin impacto en performance

---

## STACK TECNOLÓGICO OPTIMIZADO

### Compute

| Componente | Especificación | Justificación |
|------------|----------------|---------------|
| **Container Apps** | 2 apps (API + Worker) | Managed K8s, 70% menos ops que AKS |
| **Functions Premium** | 1 plan (EP1), 2 instances | VNET + siempre-on para validaciones críticas |
| **Functions Consumption** | Pay-per-use | 27 validaciones menos frecuentes |

### Data

| Componente | Especificación | Justificación |
|------------|----------------|---------------|
| **Azure SQL** | 2 x 4 vCore GP | Catalog + ReadModels, suficiente para 5K archivos/mes |
| **Cosmos DB** | Serverless (1000 RU/s) | Event Store, solo paga por uso real |
| **Redis** | Standard C1 (1GB) | Cache + sessions, suficiente para 10 AFOREs |
| **Blob Storage** | Lifecycle management | Archivos con tiering automático |

### Integration

| Componente | Especificación | Justificación |
|------------|----------------|---------------|
| **Service Bus** | Standard | Suficiente throughput, upgrade path a Premium |
| **API Management** | Developer | Todas las features menos multi-región |
| **Front Door** | Standard | CDN + WAF + geo-routing |

---

## ANÁLISIS DE COSTOS OPTIMIZADO

### Infraestructura Mensual

| Componente | Costo Original | Costo Optimizado | Ahorro |
|------------|----------------|------------------|--------|
| **Compute** |
| Container Apps (vs AKS) | $2,050 | $250 | $1,800 |
| Functions Premium | $292 | $146 | $146 |
| Functions Consumption | $25 | $25 | $0 |
| **Data** |
| Cosmos DB | $584 | $58 | $526 |
| SQL Database (2x) | $2,400 | $1,200 | $1,200 |
| Redis | $251 | $55 | $196 |
| Blob Storage | $45 | $25 | $20 |
| **Integration** |
| Service Bus | $668 | $10 | $658 |
| API Management | $50 | $50 | $0 |
| Front Door | $35 | $35 | $0 |
| **Monitoring** |
| Application Insights | $115 | $75 | $40 |
| Log Analytics | $230 | $100 | $130 |
| **Networking** |
| VNet, Private Links | $22 | $15 | $7 |
| **Backup** |
| Geo-replication | $156 | $50 | $106 |
| **TOTAL** | **$7,350** | **$2,094** | **$5,256** |

### Costos Anuales

```
Diseño Original:    $88,200/año
Diseño Optimizado:  $25,128/año

AHORRO: $63,072/año (71.5% reducción)
```

### Cost per Transaction

**Escenario: 2 AFOREs x 60 archivos/mes = 120 archivos/mes**

```
Costos Fijos: $2,094/mes
Costos Variables: ~$0.15/archivo (blob + egress)

Total: $2,094 + ($0.15 x 120) = $2,112/mes

Costo por archivo: $17.60
Costo por validación: $0.48

Con precio de venta $180/archivo:
Margen: $162.40 (90.2%)
```

**Escenario: 10 AFOREs x 60 archivos/mes = 600 archivos/mes**

```
Total: $2,094 + ($0.15 x 600) = $2,184/mes

Costo por archivo: $3.64
Margen: $176.36 (98.0%)
```

---

## CAPACIDADES Y LÍMITES

### Capacidad Actual (Sin Cambios)

| Métrica | Capacidad | Límite Técnico |
|---------|-----------|----------------|
| Archivos/mes | 5,000 | 10,000 |
| Archivos concurrentes | 50 | 100 |
| Validaciones paralelas | 200 | 500 |
| AFOREs soportadas | 10 | 20 |
| Tamaño archivo | 100 MB | 200 MB |
| Response time p95 | < 3s | < 5s |
| Throughput | 100 archivos/hora | 500 archivos/hora |

### Upgrade Path (Cuando Escalar)

**Trigger 1: > 3,000 archivos/mes**
- Upgrade SQL: 4 vCore → 8 vCore (+$600/mes)
- Upgrade Container Apps: +2 replicas (+$125/mes)
- **Total:** +$725/mes

**Trigger 2: > 5,000 archivos/mes**
- Upgrade Service Bus: Standard → Premium (+$658/mes)
- Upgrade Cosmos: Serverless → Provisioned 5K RU/s (+$292/mes)
- **Total:** +$950/mes

**Trigger 3: > 10 AFOREs o multi-país**
- Add geo-replication (+$300/mes)
- Add read replicas SQL (+$600/mes)
- Upgrade to AKS (mejor multi-tenancy) (+$800/mes)
- **Total:** +$1,700/mes

---

## ARQUITECTURA MULTI-PAÍS

### Diseño para Expansión Latinoamérica

```
┌────────────────────────────────────────────────────────────┐
│                    AZURE FRONT DOOR                         │
│  • Geo-routing por país                                     │
│  • mexico.hergon.com → Mexico Central                       │
│  • chile.hergon.com → Brazil South (más cercano)            │
│  • colombia.hergon.com → Brazil South                       │
└────────────────────┬───────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
┌──────────────────┐    ┌──────────────────┐
│  REGION: Mexico  │    │  REGION: Brazil  │
│  (Primary)       │    │  (Latam)         │
│                  │    │                  │
│  • 2 AFOREs MX   │    │  • Chile AFP     │
│  • Full stack    │    │  • Colombia AFP  │
│  • Event Store   │    │  • Peru AFP      │
└──────────────────┘    └──────────────────┘
        │                         │
        └────────────┬────────────┘
                     │
                     ▼
            ┌─────────────────┐
            │  Shared Catalog │
            │  (multi-region) │
            │  • Validaciones │
            │  • Common rules │
            └─────────────────┘
```

### Configuración Multi-Tenancy

**Nivel 1: Por País**
```csharp
public enum Country
{
    Mexico,
    Chile,
    Colombia,
    Peru
}

public class TenantConfiguration
{
    public Country Country { get; set; }
    public string RegulatorName { get; set; }  // CONSAR, SuperPensiones, etc
    public string ConnectionString { get; set; }
    public List<Validation> CountrySpecificValidations { get; set; }
}

// Mexico
new TenantConfiguration
{
    Country = Country.Mexico,
    RegulatorName = "CONSAR",
    ValidationRules = MexicoConsar.GetValidations()
}

// Chile
new TenantConfiguration
{
    Country = Country.Chile,
    RegulatorName = "SuperPensiones",
    ValidationRules = ChileSuperPensiones.GetValidations()
}
```

**Nivel 2: Por AFORE/AFP**
```sql
-- Row-Level Security con país
CREATE FUNCTION dbo.fn_securitypredicate_country(@CountryId INT, @AforeId INT)
RETURNS TABLE
WITH SCHEMABINDING
AS
RETURN
    SELECT 1 AS fn_securitypredicate_result
    WHERE
        (@CountryId = CAST(SESSION_CONTEXT(N'CountryId') AS INT)
         AND @AforeId = CAST(SESSION_CONTEXT(N'AforeId') AS INT))
        OR IS_MEMBER('Admin') = 1;
```

---

## ROADMAP DE IMPLEMENTACIÓN

### Fase 1: MVP Production (8 semanas)

**Semanas 1-2: Infraestructura**
- Setup Azure subscriptions (Prod + Staging)
- Terraform para toda la infra
- CI/CD pipelines (Azure DevOps)
- Ambientes: dev, staging, prod

**Semanas 3-4: Core Services**
- Container App: API Service
- Container App: Worker Service
- Azure Functions: 10 validaciones críticas
- Service Bus + Event handling

**Semanas 5-6: Data Layer**
- SQL Databases + schemas
- Cosmos DB + event store
- Redis cache integration
- Blob storage + lifecycle

**Semanas 7-8: Testing + Go-Live**
- Integration testing con archivos reales
- Load testing (500 archivos/hora)
- Security audit
- Go-live con AFORE #1

### Fase 2: Segunda AFORE (4 semanas)

**Semanas 9-10:**
- Onboarding AFORE #2
- Customizaciones específicas
- Performance tuning
- Multi-tenant testing

**Semanas 11-12:**
- 27 validaciones restantes
- Reportes avanzados
- Dashboard analytics
- Go-live AFORE #2

### Fase 3: Preparación Latam (8 semanas)

**Semanas 13-16:**
- Research regulaciones Chile/Colombia/Perú
- Adaptar validaciones por país
- Setup región Brazil South
- Multi-region testing

**Semanas 17-20:**
- Portal multi-país
- Facturación multi-currency
- Compliance docs por país
- Sales collateral Latam

---

## EQUIPO RECOMENDADO

### Core Team (Año 1)

| Rol | Dedicación | Responsabilidad |
|-----|------------|-----------------|
| **Tech Lead / Architect** | 100% | Arquitectura, decisiones técnicas, code reviews |
| **Senior Backend Dev (.NET)** | 100% | API Service, Worker Service, Functions |
| **Mid-Level Backend Dev** | 100% | Validaciones, integraciones, testing |
| **DevOps Engineer** | 50% | Infra, CI/CD, monitoring (puede ser shared) |
| **QA Engineer** | 50% | Testing, automation (puede ser shared) |
| **Product Manager** | 50% | Roadmap, requirements, customer success |

**Total FTE:** 4.5 personas

### Extended Team (Año 2 - Expansión Latam)

- +1 Backend Dev (Chile/Colombia specifics)
- +1 Frontend Dev (customer portal)
- +1 DevOps (full-time para multi-región)
- +0.5 Data Engineer (analytics, BI)

**Total FTE:** ~7 personas

---

## COSTO TOTAL DE OWNERSHIP (TCO)

### Año 1

**Infraestructura:**
- Azure: $25,128/año
- Herramientas (Azure DevOps, GitHub, etc): $3,600/año
- **Subtotal Infra:** $28,728/año

**Personal (4.5 FTE):**
- Suponiendo promedio $80K MXN/mes por FTE
- 4.5 x $80,000 x 12 = $4,320,000 MXN/año
- **Subtotal Personal:** ~$216,000 USD/año

**Otros:**
- Certificaciones (ISO 27001, etc): $20,000
- Legal/Compliance: $15,000
- Marketing/Sales: $30,000
- **Subtotal Otros:** $65,000

**TOTAL AÑO 1:** ~$310,000 USD

### Revenue Proyectado Año 1

**Escenario Conservador:**
- 2 AFOREs x 5 fondos = 10 licencias
- Precio: $150,000 MXN/fondo/año = $7,500 USD/año
- Revenue: 10 x $7,500 = $75,000 USD año 1

**Pérdida Año 1:** -$235,000 USD

**Escenario Optimista (captar 1 AFORE adicional en Q3):**
- 3 AFOREs x 5 fondos = 15 licencias
- Revenue: 15 x $7,500 = $112,500 USD año 1

**Pérdida Año 1:** -$197,500 USD

### Break-Even Analysis

**Costos Fijos Anuales:** $93,728 (infra + herramientas + otros)
**Costos Variables:** $4,320,000 MXN = $216,000 USD (personal)

**Total:** $309,728/año = $25,810/mes

**Revenue por fondo:** $7,500/año = $625/mes

**Break-even:** $25,810 / $625 = 41 fondos

**Traducido:**
- 8-9 AFOREs con 5 fondos cada una
- O 4-5 AFOREs con 10 fondos cada una

**Timeline realista:** Mes 18-24

---

## VENTAJAS DE ESTA ARQUITECTURA

### vs Diseño Original (Microservicios Full)

✅ **71% más barato** ($25K vs $88K/año)
✅ **Mismo event sourcing** (compliance)
✅ **Mismo multi-tenancy** (aislamiento)
✅ **Misma escalabilidad** (hasta 10K archivos/mes)
✅ **70% menos complejo** (Container Apps vs AKS)
✅ **Upgrade path claro** (a microservicios cuando necesario)

### vs Monolito

✅ **10x más escalable** (5K archivos/mes vs 500)
✅ **Zero-downtime deploys** (blue-green)
✅ **Mejor observabilidad** (distributed tracing)
✅ **Preparado para multi-región** (desde diseño)
✅ **Profesional** para venta enterprise (no "MVP")

---

## CERTIFICACIONES Y COMPLIANCE

### Año 1

**Esenciales:**
- SOC 2 Type I (6 meses, $15K)
- ISO 27001 foundation (12 meses, $20K)
- Penetration testing (trimestral, $5K)

### Año 2

**Avanzadas:**
- SOC 2 Type II (12 meses operación)
- ISO 27001 full certification
- PCI DSS (si procesas pagos)
- Compliance por país (Chile, Colombia, etc)

---

## RIESGOS Y MITIGACIONES

### Riesgo 1: Container Apps es "nuevo"

**Mitigación:**
- Basado en Kubernetes (maduro)
- Managed by Microsoft (SLA 99.95%)
- Upgrade path a AKS es trivial (mismo código)

### Riesgo 2: Cosmos DB Serverless tiene cold start

**Mitigación:**
- Solo para event store (writes)
- Reads van a SQL (siempre caliente)
- 500ms cold start es aceptable (no crítico)
- Upgrade a provisioned es 1 click

### Riesgo 3: Service Bus Standard no tiene geo-DR

**Mitigación:**
- Backup events en Blob Storage
- Replay capability desde event store
- Upgrade a Premium cuando > 5 AFOREs

### Riesgo 4: Solo 4 vCore SQL puede ser insuficiente

**Mitigación:**
- Monitoring proactivo (Azure SQL Insights)
- Auto-scaling configurado
- Upgrade a 8 vCore en < 5 minutos (zero downtime)

---

## CONCLUSIÓN Y RECOMENDACIÓN FINAL

### Esta arquitectura es IDEAL para ti porque:

1. **Production-ready** pero no over-engineered
2. **$63K/año más barata** que diseño original
3. **Profesional** para vender a instituciones financieras
4. **Escalable** a 50+ clientes sin reescribir
5. **Multi-país** desde diseño
6. **Event sourcing completo** (compliance CONSAR)
7. **Upgrade path claro** (a microservicios full cuando necesario)

### Timeline de Implementación

- **Semana 12:** Go-live con primera AFORE
- **Semana 16:** Segunda AFORE productiva
- **Mes 6:** 3-4 AFOREs confirmadas
- **Mes 12:** Expansión a Chile/Colombia
- **Mes 18:** 8-10 clientes, break-even

### Inversión Requerida

**Año 1:** $310K USD total
- Infra: $29K
- Personal: $216K
- Otros: $65K

**Revenue esperado año 1:** $75K-112K USD
**Pérdida año 1:** -$198K a -$235K USD

**Break-even:** Mes 18-24 con 8-9 AFOREs

---

## PRÓXIMO PASO

¿Procedo a generar los entregables de implementación?

1. **Diagramas Técnicos Detallados** (Visio/Draw.io)
2. **Terraform Modules Completos** (toda la infra como código)
3. **Architecture Decision Records (ADRs)**
4. **API Specifications (OpenAPI 3.0)**
5. **Database Schema Scripts**
6. **CI/CD Pipeline Definitions**
7. **Security & Compliance Checklist**
8. **Onboarding Runbook** (para nuevas AFOREs)

**¿Con cuál empezamos?**
