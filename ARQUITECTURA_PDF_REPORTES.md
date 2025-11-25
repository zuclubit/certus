# 📄 ARQUITECTURA - GENERACIÓN DE REPORTES PDF CONSAR

**Proyecto**: Certus - Sistema de Validación CONSAR
**Fecha**: 22 de Enero de 2025
**Versión**: 1.0

---

## 📊 INVESTIGACIÓN Y ANÁLISIS

### Librerías Evaluadas para PDF (2025)

| Librería | Bundle | TypeScript | Tablas | Charts | Server/Client | Recomendación |
|----------|--------|------------|--------|--------|---------------|---------------|
| **pdfmake** | 3.7 MB | ⭐⭐⭐ | ✅ Excelente | ⚠️ Externa | ✅ Ambos | 🏆 **ELEGIDA** |
| pdf-lib | 1.1 MB | ⭐⭐⭐⭐⭐ | ❌ Manual | ❌ Manual | ✅ Ambos | ❌ No mantenida |
| jsPDF | 290 KB | ⭐⭐⭐ | ⚠️ Plugin | ⚠️ Plugin | ✅ Ambos | ⚠️ Básica |
| @react-pdf/renderer | 1.2 MB | ⭐⭐⭐⭐⭐ | ⚠️ Básico | ⚠️ Externa | ✅ Ambos | ✅ Alternativa |
| Puppeteer | 10+ MB | ⭐⭐⭐⭐⭐ | ✅ HTML | ✅ Cualquiera | ❌ Solo server | ❌ Muy pesado |

### Librerías de Gráficos Evaluadas

| Librería | Bundle | TypeScript | PDF Export | Facilidad | Recomendación |
|----------|--------|------------|------------|-----------|---------------|
| **Recharts** | 95 KB | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ SVG | Fácil | 🏆 **ELEGIDA** |
| Chart.js | 75 KB | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ Canvas | Muy fácil | ✅ Alternativa |
| Victory | 135 KB | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ SVG | Moderado | ✅ Alternativa |
| Nivo | 200+ KB | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ SVG | Complejo | ⚠️ Pesado |

---

## 🎯 DECISIONES DE ARQUITECTURA

### Stack Tecnológico Seleccionado

1. **PDF Generation**: **pdfmake v0.2.14**
   - Razón: Mejor soporte nativo para tablas, headers/footers
   - Declarative API perfecta para templates de compliance
   - Excelente performance en reportes de 50+ páginas
   - MIT License (commercial-friendly)

2. **Charts**: **Recharts v2.15.0**
   - Razón: SVG-based (perfecto para PDF)
   - TypeScript first-class
   - 12M+ descargas semanales
   - Fácil conversión SVG → PNG para embed

3. **Optimizaciones Parser**: **Zod v3.24.0** (ya instalado)
   - Razón: Runtime validation + TypeScript
   - Integración con parser existente
   - Mejores mensajes de error

---

## 🏗️ ARQUITECTURA DE 3 CAPAS

```
┌─────────────────────────────────────────────────────────────┐
│                  PRESENTATION LAYER                          │
│  ┌────────────────┐  ┌────────────────┐  ┌───────────────┐ │
│  │  ReportViewer  │  │  ChartPreview  │  │  PDFPreview   │ │
│  │   Component    │  │   Component    │  │   Component   │ │
│  └────────────────┘  └────────────────┘  └───────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  BUSINESS LOGIC LAYER                        │
│  ┌────────────────┐  ┌────────────────┐  ┌───────────────┐ │
│  │ PDF Generator  │  │ Chart Builder  │  │  Template     │ │
│  │    Service     │  │    Service     │  │   Manager     │ │
│  └────────────────┘  └────────────────┘  └───────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   DATA ACCESS LAYER                          │
│  ┌────────────────┐  ┌────────────────┐  ┌───────────────┐ │
│  │ ParsedFile     │  │  Statistics    │  │  Validation   │ │
│  │    Data        │  │   Calculator   │  │   Results     │ │
│  └────────────────┘  └────────────────┘  └───────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 📐 DISEÑO DE COMPONENTES

### 1. PDF Generator Service

**Responsabilidades**:
- Generar PDFs desde datos parseados
- Aplicar templates según tipo de reporte
- Manejar headers, footers, paginación
- Integrar gráficos generados
- Optimizar performance para reportes grandes

**Arquitectura**:
```typescript
class PDFGeneratorService {
  // Genera reporte completo de validación
  async generateValidationReport(
    parsedFile: ParsedFile,
    options: ReportOptions
  ): Promise<Blob>

  // Genera reporte de errores
  async generateErrorReport(
    parsedFile: ParsedFile
  ): Promise<Blob>

  // Genera reporte ejecutivo (resumen)
  async generateExecutiveSummary(
    parsedFile: ParsedFile,
    statistics: ValidationStatistics
  ): Promise<Blob>

  // Genera reporte de comparación
  async generateComparisonReport(
    file1: ParsedFile,
    file2: ParsedFile
  ): Promise<Blob>
}
```

---

### 2. Chart Builder Service

**Responsabilidades**:
- Generar gráficos estadísticos
- Convertir gráficos Recharts a imágenes PNG
- Optimizar resolución para PDF
- Cachear gráficos generados

**Arquitectura**:
```typescript
class ChartBuilderService {
  // Genera gráfico de barras de errores por tipo
  async generateErrorsByTypeChart(
    errors: ValidationError[]
  ): Promise<ChartImage>

  // Genera gráfico circular de distribución
  async generateDistributionChart(
    data: DistributionData
  ): Promise<ChartImage>

  // Genera gráfico de tendencia temporal
  async generateTrendChart(
    timeSeriesData: TimeSeriesData
  ): Promise<ChartImage>

  // Convierte componente Recharts a imagen PNG
  private async convertChartToImage(
    chartElement: ReactElement
  ): Promise<string> // Base64 PNG
}
```

---

### 3. Template Manager

**Responsabilidades**:
- Definir templates de reportes
- Gestionar estilos y formatos
- Versionado de templates
- Configuración por cliente/AFORE

**Arquitectura**:
```typescript
class TemplateManager {
  // Obtiene template según tipo
  getTemplate(
    type: ReportType
  ): PDFTemplate

  // Aplica branding personalizado
  applyBranding(
    template: PDFTemplate,
    branding: BrandingConfig
  ): PDFTemplate

  // Guarda template personalizado
  saveCustomTemplate(
    name: string,
    template: PDFTemplate
  ): void
}
```

---

## 📋 TIPOS DE REPORTES

### 1. Reporte Completo de Validación

**Contenido**:
- Portada con logo Certus
- Resumen ejecutivo
- Metadatos del archivo
- Estadísticas generales
- Gráficos de distribución
- Tabla de errores (primeros 100)
- Detalle de validadores aplicados
- Recomendaciones
- Footer con fecha/hora generación

**Páginas estimadas**: 15-30 páginas

---

### 2. Reporte de Errores

**Contenido**:
- Portada
- Resumen de errores
- Gráfico de errores por tipo
- Tabla completa de errores
- Agrupación por severidad
- Referencias a circulares CONSAR
- Acciones correctivas sugeridas

**Páginas estimadas**: 5-50 páginas (según errores)

---

### 3. Reporte Ejecutivo

**Contenido**:
- Resumen de 1 página
- Indicadores clave (KPIs)
- Gráficos principales
- Semáforo de cumplimiento
- Conclusión

**Páginas estimadas**: 1-3 páginas

---

### 4. Reporte de Comparación

**Contenido**:
- Comparación lado a lado
- Diferencias encontradas
- Evolución temporal
- Gráficos comparativos

**Páginas estimadas**: 10-20 páginas

---

## 🎨 DISEÑO VISUAL

### Paleta de Colores CONSAR

```typescript
const consarColors = {
  primary: '#1E40AF',      // Azul CONSAR
  secondary: '#64748B',    // Gris
  success: '#059669',      // Verde (válido)
  warning: '#CA8A04',      // Amarillo (advertencia)
  error: '#DC2626',        // Rojo (error)
  background: '#F8FAFC',   // Fondo claro
  text: '#1E293B',         // Texto oscuro
}
```

### Tipografía

```typescript
const fonts = {
  heading: 'Roboto-Bold',
  body: 'Roboto-Regular',
  mono: 'RobotoMono-Regular',
}
```

---

## ⚡ OPTIMIZACIONES DE PERFORMANCE

### 1. Lazy Loading de pdfmake

```typescript
// Dynamic import para reducir bundle inicial
const generatePDF = async () => {
  const pdfMake = await import('pdfmake/build/pdfmake')
  const pdfFonts = await import('pdfmake/build/vfs_fonts')
  pdfMake.vfs = pdfFonts.pdfMake.vfs
  return pdfMake
}
```

### 2. Generación en Web Worker

```typescript
// Worker para no bloquear UI
const worker = new Worker(
  new URL('./pdf-generator.worker.ts', import.meta.url),
  { type: 'module' }
)
```

### 3. Streaming para Reportes Grandes

```typescript
// No cargar todo en memoria
const generateStreamingPDF = async (data: LargeDataset) => {
  // Generar por páginas
  for (const chunk of data.chunks) {
    await addPageToDocument(chunk)
  }
}
```

### 4. Caché de Gráficos

```typescript
// Cache LRU para gráficos frecuentes
const chartCache = new LRUCache<string, ChartImage>({
  max: 50,
  ttl: 1000 * 60 * 30 // 30 minutos
})
```

---

## 🔐 SEGURIDAD

### 1. Sanitización de Datos

```typescript
// Prevenir inyección en PDFs
const sanitizeForPDF = (text: string): string => {
  return text
    .replace(/[<>]/g, '') // Remove HTML
    .substring(0, 1000)   // Limit length
}
```

### 2. Validación de Inputs

```typescript
// Zod schema para opciones
const reportOptionsSchema = z.object({
  includeErrors: z.boolean(),
  includeCharts: z.boolean(),
  maxPages: z.number().max(500),
  format: z.enum(['A4', 'Letter'])
})
```

---

## 📊 ESTRUCTURA DE TEMPLATES

### Template Base (pdfmake)

```typescript
interface PDFTemplate {
  pageSize: 'A4' | 'Letter'
  pageOrientation: 'portrait' | 'landscape'
  pageMargins: [number, number, number, number] // [left, top, right, bottom]

  header?: (currentPage: number, pageCount: number) => Content
  footer?: (currentPage: number, pageCount: number) => Content

  content: Content[]

  styles: Record<string, StyleDefinition>

  defaultStyle: {
    font: string
    fontSize: number
    color: string
  }
}
```

### Ejemplo: Template Reporte Completo

```typescript
const validationReportTemplate: PDFTemplate = {
  pageSize: 'A4',
  pageOrientation: 'portrait',
  pageMargins: [40, 60, 40, 60],

  header: (currentPage, pageCount) => ({
    columns: [
      { image: certusLogo, width: 80 },
      {
        text: 'Reporte de Validación CONSAR',
        style: 'header',
        alignment: 'right'
      }
    ],
    margin: [40, 20, 40, 10]
  }),

  footer: (currentPage, pageCount) => ({
    text: `Página ${currentPage} de ${pageCount}`,
    alignment: 'center',
    margin: [0, 10, 0, 0]
  }),

  content: [
    // Portada
    { text: 'REPORTE DE VALIDACIÓN', style: 'title' },
    { text: '\n\n' },

    // Metadata
    {
      table: {
        widths: ['30%', '70%'],
        body: [
          ['Archivo:', '${fileName}'],
          ['Fecha:', '${fileDate}'],
          ['RFC:', '${rfc}']
        ]
      }
    },

    // Charts
    { image: '${errorChart}', width: 500 },

    // Tables
    {
      table: {
        headerRows: 1,
        widths: ['auto', '*', 'auto', 'auto'],
        body: [
          ['Línea', 'Error', 'Campo', 'Severidad'],
          // ... data rows
        ]
      }
    }
  ],

  styles: {
    title: {
      fontSize: 24,
      bold: true,
      alignment: 'center',
      color: '#1E40AF'
    },
    header: {
      fontSize: 12,
      bold: true
    }
  }
}
```

---

## 🧪 TESTING

### Unit Tests

```typescript
describe('PDFGeneratorService', () => {
  it('should generate valid PDF from parsed data', async () => {
    const pdf = await service.generateValidationReport(mockData)
    expect(pdf).toBeInstanceOf(Blob)
    expect(pdf.type).toBe('application/pdf')
  })

  it('should include all sections', async () => {
    const pdf = await service.generateValidationReport(mockData)
    const text = await extractTextFromPDF(pdf)
    expect(text).toContain('Resumen Ejecutivo')
    expect(text).toContain('Estadísticas')
  })
})
```

---

## 📦 ESTRUCTURA DE ARCHIVOS

```
app/src/
├── lib/
│   ├── pdf/
│   │   ├── generators/
│   │   │   ├── pdf-generator.service.ts
│   │   │   ├── validation-report.generator.ts
│   │   │   ├── error-report.generator.ts
│   │   │   ├── executive-summary.generator.ts
│   │   │   └── comparison-report.generator.ts
│   │   ├── templates/
│   │   │   ├── base.template.ts
│   │   │   ├── validation.template.ts
│   │   │   ├── error.template.ts
│   │   │   └── executive.template.ts
│   │   ├── charts/
│   │   │   ├── chart-builder.service.ts
│   │   │   ├── error-distribution.chart.tsx
│   │   │   ├── validation-trend.chart.tsx
│   │   │   └── compliance-gauge.chart.tsx
│   │   ├── utils/
│   │   │   ├── chart-to-image.ts
│   │   │   ├── pdf-styles.ts
│   │   │   └── sanitize.ts
│   │   ├── workers/
│   │   │   └── pdf-generator.worker.ts
│   │   └── types/
│   │       ├── pdf-template.ts
│   │       ├── report-options.ts
│   │       └── chart-config.ts
│   └── optimizations/
│       ├── streaming-parser.ts        # Parser optimizado
│       ├── buffer-reader.ts           # Lectura por buffers
│       └── validation-cache.ts        # Cache de validaciones
├── components/
│   └── reports/
│       ├── ReportViewer.tsx
│       ├── ReportPreview.tsx
│       ├── ChartPreview.tsx
│       └── PDFDownloadButton.tsx
└── hooks/
    └── useReportGeneration.ts
```

---

## 🚀 PLAN DE IMPLEMENTACIÓN

### Fase 1: Setup (2h)
- ✅ Instalar dependencias (pdfmake, recharts)
- ✅ Configurar tipos TypeScript
- ✅ Crear estructura de carpetas

### Fase 2: Templates (4h)
- ✅ Crear templates base
- ✅ Template reporte completo
- ✅ Template reporte errores
- ✅ Template ejecutivo

### Fase 3: Chart Builder (4h)
- ✅ Componentes Recharts
- ✅ Conversión SVG → PNG
- ✅ Integración con pdfmake

### Fase 4: PDF Generator (8h)
- ✅ Service principal
- ✅ Generadores específicos
- ✅ Headers/Footers
- ✅ Paginación automática

### Fase 5: Optimizaciones (6h)
- ✅ Web Worker
- ✅ Lazy loading
- ✅ Caché de gráficos
- ✅ Streaming

### Fase 6: UI Components (4h)
- ✅ Botón descarga PDF
- ✅ Preview de reporte
- ✅ Selector de opciones

### Fase 7: Testing (4h)
- ✅ Unit tests
- ✅ Integration tests
- ✅ Performance tests

**Total: 32 horas**

---

## 📈 MÉTRICAS DE ÉXITO

- ✅ Generación PDF < 3s para reportes de 20 páginas
- ✅ Bundle size < 4MB (con lazy loading)
- ✅ Calidad gráficos 300 DPI
- ✅ Soporte archivos de 100k+ registros
- ✅ PDFs compatibles con Adobe Reader
- ✅ Cumplimiento normativa CONSAR

---

**Última actualización**: 22 de Enero de 2025
**Estado**: 📋 ARQUITECTURA COMPLETA - LISTO PARA IMPLEMENTACIÓN
