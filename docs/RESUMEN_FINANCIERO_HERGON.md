# 💰 Resumen Financiero Hergon - Pesos Mexicanos

**Fecha**: 2025-01-20
**Tipo de Cambio**: 1 USD = 20 MXN
**Salarios**: Mercado México 2025

---

## 📊 Resumen Ejecutivo - Tres Opciones

| Métrica | MVP (3 meses) | Full (5 meses) | Full sin IA (9 meses) |
|---------|---------------|----------------|----------------------|
| **Inversión Inicial** | **$2.27M MXN** | **$3.93M MXN** | **$6.96M MXN** |
| **Time to Market** | **12 semanas** ⚡ | 20 semanas | 36 semanas |
| **Go-Live** | Marzo 2026 | Mayo 2026 | Septiembre 2026 |
| **Revenue Año 1** | $5.6M MXN | **$8.0M MXN** | $4.8M MXN |
| **Utilidad Año 1** | $877K MXN | **$1.97M MXN** | -$3.56M MXN ❌ |
| **ROI Año 1** | 14% | **25%** ✅ | -34% ❌ |
| **ROI Año 2** | **267%** ✅ | 221% | 51% |
| **Punto Equilibrio** | Mes 10 (Dic 2026) | Mes 9 (Ene 2027) | Mes 18 (Jun 2027) |

### 🏆 Recomendación

- **Mejor ROI a 2 años**: MVP (267% ROI)
- **Mejor Utilidad Año 1**: Full con IA ($1.97M MXN)
- **NO recomendado**: Full sin IA (pérdida de $3.56M en Año 1)

---

## 💵 Desglose de Inversión Inicial

### Opción MVP (3 meses) - $2,272,813 MXN

| Categoría | Monto | % del Total |
|-----------|-------|-------------|
| **Personal** (5 devs × 3 meses) | $915,000 | 40% |
| **AI Tools** (Claude + Copilot) | $20,700 | 1% |
| **AWS Infraestructura** | $60,000 | 3% |
| **Herramientas SaaS** | $66,000 | 3% |
| **Otros Costos** (office, hardware, etc.) | $439,070 | 19% |
| **Compliance** (CONSAR review) | $50,000 | 2% |
| **Marketing & Pre-venta** | $140,000 | 6% |
| **IVA (16%)** | $270,043 | 12% |
| **Reserva Operacional** (3 meses) | $312,000 | 14% |
| **TOTAL** | **$2,272,813** | **100%** |

### Opción Full (5 meses) - $3,934,402 MXN

| Categoría | Monto | % del Total |
|-----------|-------|-------------|
| **Personal** (5 devs × 5 meses) | $1,525,000 | 39% |
| **AI Tools** | $34,500 | 1% |
| **AWS Infraestructura** | $144,000 | 4% |
| **Herramientas SaaS** | $110,000 | 3% |
| **Otros Costos** | $594,950 | 15% |
| **Compliance** (SOC 2 + ISO 27001 + Pentest) | $530,000 | 13% |
| **Marketing & Pre-venta** | $230,000 | 6% |
| **IVA (16%)** | $471,752 | 12% |
| **Reserva Operacional** | $294,200 | 7% |
| **TOTAL** | **$3,934,402** | **100%** |

---

## 👥 Costos de Personal (Salarios México)

| Rol | Salario Mensual | MVP (3 meses) | Full (5 meses) |
|-----|-----------------|---------------|----------------|
| **Tech Lead / Architect** | $70,000 MXN | $210,000 | $350,000 |
| **Backend Developer Senior (×2)** | $50,000 MXN | $300,000 | $500,000 |
| **Frontend Developer Senior** | $45,000 MXN | $135,000 | $225,000 |
| **DevOps Engineer** | $50,000 MXN | $150,000 | $250,000 |
| **QA Engineer** | $40,000 MXN | $120,000 | $200,000 |
| **SUBTOTAL** | | **$915,000** | **$1,525,000** |

**Nota**: Salarios competitivos para mercado mexicano 2025 (CDMX/Guadalajara/Monterrey)

---

## 🤖 Costos de AI Tools

| Herramienta | Por Dev/Mes | 5 Devs/Mes | MVP (3 meses) | Full (5 meses) |
|-------------|-------------|------------|---------------|----------------|
| **Claude Code Pro** | $600 MXN | $3,000 | $9,000 | $15,000 |
| **GitHub Copilot Enterprise** | $380 MXN | $1,900 | $5,700 | $9,500 |
| **Cursor AI** (opcional) | $400 MXN | $2,000 | $6,000 | $10,000 |
| **SUBTOTAL** | | **$6,900/mes** | **$20,700** | **$34,500** |

**ROI de IA**: Ahorro de 4 meses de desarrollo = $1,525,000 - $34,500 = **$1,490,500 MXN** ⚡

---

## ☁️ Costos de AWS (Infraestructura)

### Ambiente Staging

| Servicio | Mensual | MVP (3 meses) | Full (5 meses) |
|----------|---------|---------------|----------------|
| **ECS Fargate** (3 servicios) | $3,000 | $9,000 | $15,000 |
| **RDS PostgreSQL** (×2) | $2,500 | $7,500 | $12,500 |
| **DynamoDB** | $800 | $2,400 | $4,000 |
| **ElastiCache Redis** | $1,200 | $3,600 | $6,000 |
| **Lambda** (37 functions) | $500 | $1,500 | $2,500 |
| **S3 + CloudFront** | $400 | $1,200 | $2,000 |
| **API Gateway** | $300 | $900 | $1,500 |
| **CloudWatch** | $300 | $900 | $1,500 |
| **TOTAL STAGING** | **$9,000/mes** | **$27,000** | **$45,000** |

### Ambiente Producción

| Servicio | Mensual | Costo Anual |
|----------|---------|-------------|
| **ECS Fargate** (5 servicios) | $8,000 | $96,000 |
| **RDS PostgreSQL** (×2 Multi-AZ) | $12,000 | $144,000 |
| **DynamoDB** (on-demand) | $3,000 | $36,000 |
| **ElastiCache Redis** (cluster) | $4,000 | $48,000 |
| **Lambda** (37 functions ARM64) | $2,000 | $24,000 |
| **S3 + CloudFront** | $1,500 | $18,000 |
| **API Gateway** | $1,500 | $18,000 |
| **CloudWatch + X-Ray** | $1,000 | $12,000 |
| **TOTAL PRODUCCIÓN** | **$33,000/mes** | **$396,000/año** |

**Optimización Año 2**: Reserved Instances ahorran ~30% = $118,800 MXN/año

---

## 💼 Costos Operacionales (Post-Launch)

| Concepto | Mensual | Anual |
|----------|---------|-------|
| **AWS Producción** | $33,000 | $396,000 |
| **Personal Operaciones** (1.5 FTE) | $85,000 | $1,020,000 |
| **AI Tools** (5 licencias) | $6,900 | $82,800 |
| **Herramientas SaaS** | $8,000 | $96,000 |
| **Monitoring** | $8,000 | $96,000 |
| **Backups & DR** | $5,000 | $60,000 |
| **Office & Servicios** | $10,000 | $120,000 |
| **Contingencia (10%)** | $15,990 | $191,880 |
| **TOTAL OPERACIÓN** | **$171,890/mes** | **$2,062,680/año** |

### Costos Anuales Adicionales

| Concepto | Anual |
|----------|-------|
| **Renovación SOC 2** | $150,000 |
| **Renovación ISO 27001** | $80,000 |
| **Pentesting** (2×/año) | $100,000 |
| **CONSAR Compliance** | $60,000 |
| **Marketing & Ventas** | $200,000 |
| **Capacitación Usuarios** | $100,000 |
| **Legal & Contratos** | $80,000 |
| **Contingencia** | $97,000 |
| **TOTAL ANUAL ADICIONAL** | **$867,000** |

**COSTO TOTAL OPERACIÓN AÑO 1**: $2,062,680 + $867,000 = **$2,929,680 MXN**

---

## 📈 Proyección de Ingresos

### Modelo de Pricing

| Métrica | Valor |
|---------|-------|
| **Precio por AFORE** | $200,000 MXN/mes (~$10,000 USD/mes) |
| **Aumento Anual** | 10% |
| **Churn Rate** | <5% anual |
| **Contract Length** | 12 meses mínimo |

### Proyección de AFOREs Activas

#### Escenario MVP (Go-Live Marzo 2026)

| Mes | AFOREs | Ingreso Mensual | Acumulado |
|-----|--------|----------------|-----------|
| Ene 2026 | 0 | $0 | $0 |
| Feb 2026 | 0 | $0 | $0 |
| **Mar 2026** (Go-Live) | 1 | $200,000 | $200,000 |
| Abr 2026 | 1 | $200,000 | $400,000 |
| May 2026 | 2 | $400,000 | $800,000 |
| Jun 2026 | 2 | $400,000 | $1,200,000 |
| Jul 2026 | 3 | $600,000 | $1,800,000 |
| Ago 2026 | 3 | $600,000 | $2,400,000 |
| Sep 2026 | 4 | $800,000 | $3,200,000 |
| Oct 2026 | 4 | $800,000 | $4,000,000 |
| Nov 2026 | 4 | $800,000 | $4,800,000 |
| Dic 2026 | 4 | $800,000 | $5,600,000 |
| **TOTAL AÑO 1** | **4** | | **$5,600,000** |

#### Escenario Full (Go-Live Mayo 2026)

| Mes | AFOREs | Ingreso Mensual | Acumulado |
|-----|--------|----------------|-----------|
| Ene-Abr 2026 | 0 | $0 | $0 |
| **May 2026** (Go-Live) | 2 | $400,000 | $400,000 |
| Jun 2026 | 2 | $400,000 | $800,000 |
| Jul 2026 | 4 | $800,000 | $1,600,000 |
| Ago 2026 | 4 | $800,000 | $2,400,000 |
| Sep 2026 | 6 | $1,200,000 | $3,600,000 |
| Oct 2026 | 6 | $1,200,000 | $4,800,000 |
| Nov 2026 | 8 | $1,600,000 | $6,400,000 |
| Dic 2026 | 8 | $1,600,000 | $8,000,000 |
| **TOTAL AÑO 1** | **8** | | **$8,000,000** |

### Proyección Años 2-3

| Año | AFOREs Activas | Revenue Anual | Crecimiento |
|-----|----------------|---------------|-------------|
| **Año 1** | 4-8 | $5.6M - $8.0M | - |
| **Año 2** | 10-12 | $18.5M - $22.0M | +233% |
| **Año 3** | 20-25 | $43.6M - $54.5M | +136% |

---

## 💰 Opciones de Financiamiento

### Opción A: Financiamiento Bancario (Recomendado para MVP)

| Concepto | MVP | Full |
|----------|-----|------|
| **Monto a Financiar (70%)** | $1,590,975 | $2,753,881 |
| **Aporte Propio (30%)** | $681,838 | $1,180,521 |
| **Tasa Anual** | 12% | 12% |
| **Plazo** | 12 meses | 18 meses |
| **Pago Mensual** | $141,550 | $169,445 |
| **Intereses Totales** | $108,625 | $298,129 |

**Ventajas**:
- No diluye equity
- Tasas competitivas
- Plazo corto
- Cash flow positivo desde mes 10

**Requisitos**:
- Aval personal
- Estados financieros
- Plan de negocio
- Garantía (30% del préstamo)

---

### Opción B: Venture Debt

| Concepto | MVP | Full |
|----------|-----|------|
| **Monto a Financiar (60%)** | $1,363,688 | $2,360,641 |
| **Aporte Propio (40%)** | $909,125 | $1,573,761 |
| **Tasa Anual** | 15% | 15% |
| **Plazo** | 18 meses | 24 meses |
| **Warrants** | 5% equity | 5% equity |
| **Pago Mensual** | $82,555 | $116,301 |

**Ventajas**:
- Mayor monto disponible
- Plazo más largo
- Menor aporte propio

**Desventajas**:
- Dilución 5% por warrants
- Tasa más alta

---

### Opción C: Capital de Riesgo (Equity)

| Concepto | MVP | Full |
|----------|-----|------|
| **Equity a Vender** | 20% | 20% |
| **Valuación Pre-Money** | $11.4M | $19.7M |
| **Monto a Recibir** | $2.27M | $3.93M |
| **Valuación Post-Money** | $13.6M | $23.6M |
| **Dilución Fundadores** | 20% | 20% |

**Ventajas**:
- No hay deuda
- No hay pagos mensuales
- Acceso a red de inversionistas
- Mayor capital para crecimiento

**Desventajas**:
- Dilución significativa
- Pérdida de control (board seats)
- Presión por crecimiento acelerado

---

### Opción D: Financiamiento Híbrido (RECOMENDADO)

**Combinación: 15% Equity + 30% Deuda + 25% Propio + 30% Pre-ventas**

| Fuente | MVP | % | Condiciones |
|--------|-----|---|------------|
| **Equity (15%)** | $1,704,600 | 43% | Ángel inversionista o SOFOM |
| **Deuda Bancaria (30%)** | $681,844 | 17% | 12% tasa, 12 meses |
| **Aporte Propio (25%)** | $568,203 | 14% | Fundadores |
| **Pre-ventas (30%)** | $1,022,566 | 26% | 2 AFOREs comprometidas × 6 meses adelantado |
| **TOTAL** | **$3,977,213** | **100%** | |

**Beneficios**:
- ✅ Dilución mínima (15%)
- ✅ Riesgo distribuido
- ✅ Validación de mercado (pre-ventas)
- ✅ Cash flow desde día 1
- ✅ Menor deuda

**Requerimientos**:
- Contratos firmados con 2 AFOREs
- Pago adelantado de 6 meses ($1.2M MXN)
- Aval personal para deuda bancaria

---

## 📊 Análisis de Rentabilidad

### Escenario MVP

| Métrica | Año 1 | Año 2 | Año 3 |
|---------|-------|-------|-------|
| **Ingresos** | $5,600,000 | $18,480,000 | $43,560,000 |
| **Costos Operación** | $2,929,680 | $2,977,680 | $3,126,564 |
| **Intereses Deuda** | $108,625 | $0 | $0 |
| **Depreciación** | $50,000 | $50,000 | $50,000 |
| **EBITDA** | $2,511,695 | $15,452,320 | $40,383,436 |
| **Utilidad Neta** | $877,177 | $15,502,320 | $40,433,436 |
| **Margen Neto** | 16% | 84% | 93% |
| **ROI** | 14% | 267% | 556% |

### Escenario Full

| Métrica | Año 1 | Año 2 | Año 3 |
|---------|-------|-------|-------|
| **Ingresos** | $8,000,000 | $18,480,000 | $43,560,000 |
| **Costos Operación** | $2,929,680 | $2,977,680 | $3,126,564 |
| **Intereses Deuda** | $298,129 | $0 | $0 |
| **Depreciación** | $50,000 | $50,000 | $50,000 |
| **EBITDA** | $4,722,191 | $15,452,320 | $40,383,436 |
| **Utilidad Neta** | $1,968,368 | $15,502,320 | $40,433,436 |
| **Margen Neto** | 25% | 84% | 93% |
| **ROI** | 25% | 221% | 528% |

---

## 📉 Análisis de Sensibilidad

### ¿Qué pasa si captamos menos AFOREs?

| Escenario | AFOREs Año 1 | Revenue | Costos | Utilidad | ROI |
|-----------|--------------|---------|--------|----------|-----|
| **Optimista** | 6 | $8,400,000 | $4,722,823 | $3,677,177 | 162% ✅ |
| **Base** | 4 | $5,600,000 | $4,722,823 | $877,177 | 39% |
| **Conservador** | 3 | $4,200,000 | $4,722,823 | -$522,823 | -23% ⚠️ |
| **Pesimista** | 2 | $2,800,000 | $4,722,823 | -$1,922,823 | -85% ❌ |

### ¿Qué pasa si el precio es diferente?

| Precio/AFORE/Mes | Revenue (4 AFOREs) | Utilidad | ROI |
|------------------|-------------------|----------|-----|
| $250,000 (+25%) | $7,000,000 | $2,277,177 | 100% ✅ |
| **$200,000 (base)** | **$5,600,000** | **$877,177** | **39%** |
| $150,000 (-25%) | $4,200,000 | -$522,823 | -23% ⚠️ |
| $100,000 (-50%) | $2,800,000 | -$1,922,823 | -85% ❌ |

---

## 🎯 Indicadores Clave (KPIs)

### Métricas de Adquisición

| KPI | Meta Año 1 | Meta Año 2 | Fórmula |
|-----|-----------|-----------|---------|
| **CAC** (Costo Adquisición) | $550,000 | $400,000 | Marketing / # AFOREs |
| **LTV** (Lifetime Value) | $4,800,000 | $5,280,000 | ARPU × Meses × (1-Churn) |
| **LTV/CAC Ratio** | 8.7x | 13.2x | LTV / CAC |
| **Payback Period** | 2.8 meses | 1.9 meses | CAC / ARPU |

### Métricas de Retención

| KPI | Meta Año 1 | Meta Año 2 |
|-----|-----------|-----------|
| **Churn Rate** | <5% | <3% |
| **Net Revenue Retention** | 110% | 120% |
| **Customer Satisfaction (NPS)** | >50 | >60 |

### Métricas Financieras

| KPI | Meta Año 1 | Meta Año 2 |
|-----|-----------|-----------|
| **Gross Margin** | 75% | 80% |
| **EBITDA Margin** | 45% | 84% |
| **Net Margin** | 16% | 84% |
| **Rule of 40** | 55% | 150% |

---

## ⚠️ Riesgos Principales

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| **Adopción lenta AFOREs** | Media | Alto | Pre-ventas, contratos piloto |
| **Cambios regulatorios CONSAR** | Baja | Alto | Compliance proactivo, flexibilidad |
| **Competencia (nuevos players)** | Alta | Medio | Diferenciación IA, time-to-market |
| **Costos AWS mayores** | Media | Medio | Reserved Instances, optimización |
| **Retención de talento** | Media | Medio | Salarios competitivos, equity pool |
| **Churn AFOREs** | Baja | Alto | Customer Success dedicado, SLAs |

---

## ✅ Conclusiones y Recomendaciones

### 1. Opción Recomendada: **MVP con Financiamiento Híbrido**

**Por qué MVP**:
- ✅ Menor riesgo financiero ($2.27M vs $3.93M)
- ✅ Time-to-market 2 meses antes (Marzo vs Mayo)
- ✅ ROI a 2 años superior (267% vs 221%)
- ✅ Validación temprana con AFOREs piloto
- ✅ Flexibilidad para pivotar si es necesario

**Financiamiento Híbrido**:
- 15% Equity ($1.7M) → Angel investor
- 30% Deuda ($682K) → Banco comercial
- 25% Propio ($568K) → Fundadores
- 30% Pre-ventas ($1.0M) → 2 AFOREs × 6 meses

### 2. Hitos Críticos

**Mes 1-3** (Desarrollo MVP):
- Cerrar pre-ventas con 2 AFOREs
- Obtener financiamiento bancario
- Contratar equipo completo

**Mes 3** (Go-Live):
- Launch con 1 AFORE piloto
- Validar 10 validators críticos
- Feedback y ajustes

**Mes 4-6** (Escalamiento):
- Onboarding de 2da y 3ra AFORE
- Optimización basada en feedback
- Preparar Post-MVP features

**Mes 7-9** (Consolidación):
- 4 AFOREs activas
- Punto de equilibrio alcanzado
- Preparar Año 2 (Full features)

### 3. Plan de Acción Inmediato

**Semana 1-2**:
- [ ] Presentar plan financiero a inversionistas
- [ ] Acercamiento a 5-6 AFOREs objetivo
- [ ] Solicitar crédito bancario (pre-aprobación)

**Semana 3-4**:
- [ ] Firmar LOI (Letter of Intent) con 2 AFOREs
- [ ] Cerrar ronda seed (15% equity)
- [ ] Aprobar crédito bancario

**Mes 2**:
- [ ] Constituir empresa
- [ ] Contratar Tech Lead + 2 devs
- [ ] Iniciar desarrollo (IA-powered)

**Mes 3**:
- [ ] Contratar resto del equipo
- [ ] Completar MVP
- [ ] Go-Live con AFORE piloto

### 4. Métricas de Éxito Año 1

| Métrica | Q1 | Q2 | Q3 | Q4 |
|---------|----|----|----|----|
| **AFOREs Activas** | 0 | 1-2 | 3 | 4 |
| **Revenue Mensual** | $0 | $200K-$400K | $600K | $800K |
| **Burn Rate** | $757K | $176K | $176K | $176K |
| **Cash Balance** | $1.6M | $400K | $1.1M | $2.2M |

---

## 📞 Contacto

**Para financiamiento o inversión**:
- Email: contacto@hergon.com
- Pitch Deck: Disponible bajo NDA
- Due Diligence: Documentación completa disponible

**Equipo Fundador**:
- CEO/Tech Lead: [Nombre]
- CTO/Architect: [Nombre]
- CFO/Ops: [Nombre]

---

**Última actualización**: 2025-01-20
**Versión**: 1.0
**Confidencial**: Este documento contiene información financiera sensible
