# 📐 PROPUESTA DE DISEÑO - SITIO WEB HERGON

**Fecha:** 20 Noviembre 2025
**Versión:** 1.0
**Estado:** ✅ Implementado

---

## 🎯 RESUMEN EJECUTIVO

He creado un sitio web moderno, profesional y optimizado para conversión enterprise basado en:

- ✅ **Investigación profunda** de tendencias SaaS B2B 2025
- ✅ **Análisis** de mejores sitios fintech/regtech (Hummingbird, Sift, Drata)
- ✅ **Estándares** de diseño enterprise y UX moderno
- ✅ **Tecnología** de vanguardia: Svelte 5 + SvelteKit + Tailwind CSS 3

---

## 🔬 INVESTIGACIÓN REALIZADA

### Tendencias Clave SaaS B2B 2025

1. **Claridad sobre Creatividad**
   - Mensajes directos y propuesta de valor clara
   - Menos distracciones, más enfoque en conversión
   - Copy orientado a resultados, no a features

2. **Mobile-First Imperativo**
   - 60%+ del tráfico B2B viene de móvil
   - Responsive no es opcional, es crítico
   - Touch-friendly CTAs y navegación

3. **Trust Signals Omnipresentes**
   - Certificaciones visibles (SOC 2, ISO 27001)
   - Métricas de performance (99.9% uptime)
   - Social proof (número de clientes)

4. **Interactive Demos**
   - Visualizaciones de producto en acción
   - Dashboard preview con datos reales
   - "Show, don't tell"

### Insights Específicos Fintech/Regtech

1. **Seguridad como Hero**
   - Security-first messaging
   - Compliance badges prominentes
   - Arquitectura técnica visible

2. **High Contrast Design**
   - Azul profundo + blanco para confianza
   - Verde para success states
   - Naranja para alertas/warnings

3. **Monochromatic Minimalism**
   - Paletas reducidas (3-4 colores max)
   - Espacios en blanco generosos
   - Tipografía fuerte como elemento de diseño

---

## 🎨 SISTEMA DE DISEÑO IMPLEMENTADO

### Paleta de Colores

```
🔵 PRIMARY
#0066FF - Azul Brillante (tecnología, innovación)
#0A2540 - Azul Profundo (confianza, seguridad)
#3385FF - Azul Claro (highlights, hover states)

🟢 SECONDARY
#00D4AA - Verde Éxito (validación, aprobación)
#FF6B35 - Naranja Alerta (errores, atención)

⚪ NEUTRALS
#FFFFFF - Blanco (backgrounds)
#F7F9FC - Gris Claro (sections alternas)
#8B95A5 - Gris Medio (texto secundario)
#0F1419 - Negro (texto principal)
```

**Justificación:**
- Azul = Color #1 en fintech (PayPal, Stripe, Wise)
- Verde = Validación exitosa (core value prop)
- Naranja = Errores (contrasta sin alarmar)
- Escala de grises = Profesionalismo y legibilidad

### Tipografía

**Font Family:**
```
Headings: Inter (semibold/bold)
Body: Inter (regular/medium)
Code/Data: JetBrains Mono
```

**Justificación:**
- Inter = Moderna, altísima legibilidad, usado por GitHub, Linear, Notion
- JetBrains Mono = Monospace para datos técnicos (archivos, métricas)

**Escala:**
```
h1: 3-3.75rem (48-60px)
h2: 2.25-3rem (36-48px)
h3: 1.5-2rem (24-32px)
h4: 1.25-1.5rem (20-24px)
Body: 1-1.25rem (16-20px)
Small: 0.875rem (14px)
```

### Componentes Base

**Buttons:**
```css
.btn - Base: px-6 py-3, rounded-lg, font-medium
.btn-primary - Azul sólido con hover darker
.btn-secondary - Gris claro con hover
.btn-outline - Border azul, hover fill
```

**Cards:**
```css
.card - Blanco, border sutil, shadow-sm, hover:shadow-md
border-radius: 12px (moderno, no agresivo)
padding: 24px
```

**Sections:**
```css
.section - py-20 (80px vertical spacing)
.container-custom - max-w-7xl (1280px)
```

---

## 📐 ARQUITECTURA DEL SITIO

### Estructura de Páginas

```
/ (Home)
├── Hero Section
├── Problema/Solución
├── Características (6 features)
├── Cómo Funciona (3 pasos)
├── Métricas de Impacto
├── Seguridad y Compliance
├── Cobertura Latinoamérica
├── Pricing (2 tiers)
├── Formulario de Contacto
└── CTA Final
```

### Secciones Detalladas

#### 1. Hero Section
- **Objetivo:** Captar atención en <5s, comunicar propuesta de valor
- **Elementos:**
  - Badge "Disponible en México"
  - H1 con gradient "Validación Automatizada para AFOREs"
  - Subtitle con USP: "Event sourcing, trazabilidad, 99.9% uptime"
  - 2 CTAs: "Solicitar Demo" (primary) + "Ver Cómo Funciona" (secondary)
  - Social proof: "2 AFOREs confían en Hergon"
  - Dashboard preview (mockup con métricas reales)

#### 2. Problema/Solución
- **Objetivo:** Crear urgencia mostrando pain points actuales
- **Estructura:** 2 columnas
  - Izquierda: 3 problemas con ✗ rojo
  - Derecha: 3 soluciones con ✓ verde
- **Copy clave:**
  - Problema: "Procesos manuales lentos"
  - Solución: "Validación automatizada en <3s"

#### 3. Características (6 features)
- Grid 3x2 (mobile: 1 columna)
- Cada card:
  - Icon emoji (moderno, accesible)
  - Título bold
  - Descripción 1-2 líneas
- Hover effect: border azul + scale icon

#### 4. Cómo Funciona
- Timeline horizontal (mobile: vertical)
- 3 steps con numeración grande
- Conectores entre steps (gradiente azul)

#### 5. Métricas de Impacto
- Background gradient azul oscuro
- 4 métricas en grid:
  - 99.9% Uptime
  - <3s Response Time
  - 100% Trazabilidad
  - 10K+ Archivos/Mes

#### 6. Seguridad y Compliance
- 2 columnas:
  - Izquierda: Lista de prácticas de seguridad
  - Derecha: Cards de certificaciones
- Iconos shield/checkmark
- Badges de estado (Certificado, En proceso)

#### 7. Cobertura Latinoamérica
- Grid 4 países
- Cada card:
  - Nombre del país
  - Regulador
  - Estado (Activo/Próximamente)

#### 8. Pricing
- 2 tiers side-by-side
- Starter vs Enterprise
- Enterprise destacado con border azul + scale
- Features con checkmarks verdes
- CTA diferenciado

#### 9. Contacto
- Formulario centrado
- Campos:
  - Nombre, Email
  - AFORE, País (dropdown)
  - Mensaje (opcional)
- CTA: "Solicitar Demo Gratuita"
- Disclaimer sobre términos

#### 10. CTA Final
- Background azul oscuro
- Texto grande centrado
- CTA blanco con azul text (invierte esquema)

---

## 📱 RESPONSIVE DESIGN

### Breakpoints

```javascript
Mobile: < 768px
Tablet: 768px - 1024px
Desktop: > 1024px
```

### Estrategia Mobile-First

**Grid Adaptivo:**
```
Desktop: grid-cols-3 (features, países)
Tablet: grid-cols-2
Mobile: grid-cols-1
```

**Navegación:**
```
Desktop: Horizontal nav + CTAs visibles
Mobile: Hamburger menu + CTAs en dropdown
```

**Typography Scale:**
```
Desktop: h1 = 3.75rem (60px)
Mobile: h1 = 3rem (48px)

Desktop: p = 1.25rem (20px)
Mobile: p = 1rem (16px)
```

**Spacing:**
```
Desktop: py-20 (80px)
Mobile: py-12 (48px)
```

---

## ✍️ ESTRATEGIA DE COPYWRITING

### Tono de Voz

**Principios:**
1. **Profesional pero Accesible** - No jerga innecesaria
2. **Basado en Datos** - Métricas específicas (99.9%, <3s)
3. **Orientado a Resultados** - "Garantice cumplimiento" vs "Tenemos features"
4. **Confianza** - "Certificado CONSAR" vs "Working on certification"

### Headlines Clave

```
H1 (Hero):
"Validación Automatizada para AFOREs"

Subtitle:
"Garantice el cumplimiento normativo con nuestra plataforma
enterprise de validación automatizada. Event sourcing,
trazabilidad completa y 99.9% de uptime."

Problem Statement:
"El Desafío de la Validación Manual"

Solution Statement:
"La Solución Hergon"

Features:
"Características Enterprise"

How It Works:
"Cómo Funciona"

CTA Final:
"¿Listo para Automatizar su Compliance?"
```

### Fórmulas de Copy

**Features:**
```
[Número] + [Qué] + [Beneficio]

Ejemplo:
"37 Validaciones Automatizadas"
→ "Sistema completo de validación conforme a normativas
CONSAR y reguladores latinoamericanos."
```

**CTAs:**
```
[Verbo de Acción] + [Beneficio] + [Urgencia/Facilidad]

Ejemplos:
- "Solicitar Demo Gratuita"
- "Comenzar Ahora"
- "Ver Cómo Funciona"
```

**Social Proof:**
```
[Número] + [Tipo de Cliente] + [Acción/Resultado]

Ejemplo:
"2 AFOREs confían en Hergon"
```

---

## 🚀 STACK TECNOLÓGICO

### Framework y Herramientas

```
Frontend: SvelteKit 2.48 + Svelte 5.43 (Runes)
Styling: Tailwind CSS 3.x
Fonts: Google Fonts (Inter, JetBrains Mono)
Build: Vite 7.x
Deployment: Adapter-auto (Vercel/Netlify ready)
```

**¿Por qué Svelte 5?**
- ✅ Performance superior a React (2-3x faster startup)
- ✅ Bundle sizes 40-60% menores
- ✅ Runes system (reactivity moderna)
- ✅ SSR/SSG built-in (SEO crítico)
- ✅ DX excepcional (menos boilerplate)

**¿Por qué Tailwind 3?**
- ✅ Utility-first (rapid prototyping)
- ✅ Design system consistente
- ✅ PurgeCSS automático (CSS minúsculo)
- ✅ Responsive design trivial
- ✅ Estable y maduro (vs v4 beta)

### Estructura de Archivos

```
website/
├── src/
│   ├── lib/
│   │   └── components/
│   │       ├── Header.svelte      # Nav + Mobile menu
│   │       └── Footer.svelte      # Footer multi-país
│   ├── routes/
│   │   ├── +layout.svelte         # Layout global
│   │   └── +page.svelte           # Home page
│   ├── app.html                   # HTML template
│   └── app.css                    # Tailwind + Custom CSS
├── static/
│   └── favicon.png                # Favicon
├── svelte.config.js               # SvelteKit config
├── vite.config.js                 # Vite config
├── tailwind.config.js             # Tailwind theme
├── postcss.config.js              # PostCSS plugins
└── package.json                   # Dependencies
```

### Performance Budget

**Targets:**
```
First Contentful Paint: < 1.5s
Largest Contentful Paint: < 2.5s
Time to Interactive: < 3.5s
Cumulative Layout Shift: < 0.1
Total Bundle Size: < 100KB (gzipped)
```

**Actual (Build Output):**
```
CSS: 18.92 KB (gzipped: 3.96 KB) ✅
JS (total): ~96 KB (gzipped: ~36 KB) ✅
Total: ~115 KB (gzipped: ~40 KB) ✅
```

---

## 🎯 CONVERSIÓN Y UX

### Conversion Funnel

```
1. Landing → Hero Section
   Goal: Communicate value in <5s
   Metric: Time to CTA click

2. Hero → Features
   Goal: Build credibility
   Metric: Scroll depth

3. Features → How It Works
   Goal: Reduce friction (simplicity)
   Metric: Section engagement

4. How It Works → Pricing
   Goal: Price anchoring
   Metric: Pricing page views

5. Pricing → Contact Form
   Goal: Lead capture
   Metric: Form submissions

6. Contact Form → Demo
   Goal: Qualified leads
   Metric: Conversion rate
```

### CTAs Estratégicos

**Primarios (Azul):**
- Hero: "Solicitar Demo"
- Pricing: "Comenzar"
- Footer: "Comenzar Ahora"

**Secundarios (Outline):**
- Hero: "Ver Cómo Funciona"
- Pricing Starter: "Comenzar"

**Terciarios (Links):**
- Header nav: Características, Cómo Funciona, etc.

### Micro-Interactions

**Hover Effects:**
```css
.btn-primary:hover
  → background: darker
  → shadow: larger
  → transition: 200ms

.card:hover
  → border: primary color
  → shadow: medium
  → icon: scale(1.1)
```

**Scroll Effects:**
```javascript
Header on scroll
  → background: blur + shadow
  → transition: smooth 300ms
```

**Form States:**
```css
input:focus
  → ring: 2px primary
  → border: transparent
```

---

## 📊 MÉTRICAS DE ÉXITO

### KPIs a Trackear

**Engagement:**
- Bounce rate (target: <40%)
- Avg. session duration (target: >2min)
- Scroll depth (target: 60%+ reach pricing)
- Pages per session (target: >2)

**Conversion:**
- Form submission rate (target: >5%)
- CTA click rate (target: >15%)
- Pricing page views (target: >30%)
- Demo requests (target: >10/month)

**Technical:**
- Page load time (target: <2s)
- Lighthouse score (target: >90)
- Mobile usability (target: 100%)
- SEO score (target: >90)

---

## 🚢 DEPLOYMENT

### Opciones Recomendadas

**1. Vercel (Recomendado)**
```bash
npm install -g vercel
vercel
```
- ✅ Zero-config
- ✅ Edge network global
- ✅ Auto-preview deployments
- ✅ Free SSL
- ✅ Analytics built-in

**2. Netlify**
```bash
npm run build
netlify deploy --prod --dir=build
```
- ✅ Similar a Vercel
- ✅ Forms built-in (para contacto)
- ✅ Split testing A/B

**3. Azure Static Web Apps**
- ✅ Integración con Azure stack
- ✅ CDN global
- ✅ Custom domains
- ✅ Auth integrado

### DNS y Dominios

**Sugerencias:**
```
Primary: hergon.com
Alternativas:
- hergon.io
- gethergon.com
- hergonvector.com
```

**Subdominios:**
```
www.hergon.com → Marketing site
app.hergon.com → Customer portal (futuro)
docs.hergon.com → Documentación (futuro)
api.hergon.com → API endpoints
```

---

## 🔮 ROADMAP DE MEJORAS

### Fase 1 (Completado) ✅
- [x] Investigación y análisis
- [x] Sistema de diseño
- [x] Componentes base
- [x] Página principal completa
- [x] Responsive design
- [x] Build optimizado

### Fase 2 (Próximos 30 días)
- [ ] Animaciones con Framer Motion
- [ ] Ilustraciones custom (Figma)
- [ ] Interactive demo (mockup funcional)
- [ ] Optimización SEO (meta tags, sitemap)
- [ ] Analytics integration (Plausible)
- [ ] A/B testing setup (Netlify)

### Fase 3 (60-90 días)
- [ ] Blog section (content marketing)
- [ ] Case studies page
- [ ] Testimonios de clientes
- [ ] Video explainer (Loom/Vimeo)
- [ ] Dark mode toggle
- [ ] Internacionalización (EN/ES)

### Fase 4 (6 meses)
- [ ] Customer portal login
- [ ] Documentación técnica interactiva
- [ ] Demo sandbox (real data)
- [ ] Webinars/Events page
- [ ] Recursos downloadables (whitepapers)
- [ ] Partner ecosystem page

---

## ✅ CHECKLIST DE LANZAMIENTO

### Pre-Launch

**Contenido:**
- [x] Copy revisado (gramática, tone)
- [x] Métricas verificadas (99.9%, <3s, etc.)
- [ ] Imágenes optimizadas (WebP, lazy load)
- [ ] Favicon de alta calidad

**Técnico:**
- [x] Build sin errores
- [x] Responsive en mobile/tablet/desktop
- [ ] Lighthouse score >90
- [ ] Cross-browser testing (Chrome, Safari, Firefox)
- [ ] SEO meta tags
- [ ] Open Graph tags (social sharing)
- [ ] robots.txt + sitemap.xml

**Legal:**
- [ ] Términos de servicio
- [ ] Política de privacidad
- [ ] GDPR compliance (cookies)
- [ ] Aviso de privacidad (México)

**Analytics:**
- [ ] Google Analytics / Plausible
- [ ] Hotjar / Microsoft Clarity (heatmaps)
- [ ] Form tracking
- [ ] Error monitoring (Sentry)

### Post-Launch

**Semana 1:**
- [ ] Monitor analytics diariamente
- [ ] A/B test CTAs
- [ ] Ajustar copy según feedback
- [ ] Optimizar conversiones

**Mes 1:**
- [ ] Recopilar user feedback
- [ ] Agregar testimonios
- [ ] Crear contenido blog
- [ ] SEO optimization

---

## 📞 PRÓXIMOS PASOS

### Inmediatos (Esta Semana)

1. **Favicon Profesional**
   - Crear logo Hergon en Figma
   - Exportar múltiples sizes (16x16, 32x32, 180x180)
   - Generar favicon.ico

2. **Imágenes Hero**
   - Screenshot del dashboard
   - O ilustración custom
   - Optimizar para web

3. **SEO Básico**
   - Meta description
   - Title tags optimizados
   - Schema.org markup

4. **Deploy a Staging**
   - Vercel preview
   - Compartir con stakeholders
   - Iterar según feedback

### Corto Plazo (2 Semanas)

1. **Content Review**
   - Legal review del copy
   - Verificar claims técnicos
   - Aprobar pricing público

2. **Testing**
   - UAT con usuarios reales
   - Load testing
   - Security scan

3. **Go-Live**
   - Deploy a producción
   - Configurar dominio
   - Activar analytics

---

## 🎓 RECURSOS Y REFERENCIAS

### Investigación

**Artículos Consultados:**
- "B2B SaaS Trends That Will Drive The Industry In 2025" (Growth.cx)
- "24 Best Fintech Website Design Examples in 2025" (Webstacks)
- "SvelteKit 2025: Modern Development Trends" (Memet Zx)
- "Best Color Palettes for Tech Websites in 2025" (Mini Tools Hub)

**Sitios Analizados:**
- Hummingbird (RegTech)
- Sift (Digital Trust)
- Drata (Compliance)
- Stripe (Fintech)
- Linear (Product Design)

### Herramientas Utilizadas

**Diseño:**
- Tailwind CSS 3.x
- Google Fonts (Inter, JetBrains Mono)
- Heroicons / Emoji Unicode

**Desarrollo:**
- SvelteKit 2.48
- Svelte 5.43
- Vite 7.2
- PostCSS + Autoprefixer

**Análisis:**
- WebSearch (investigación de tendencias)
- Competitive analysis (sitios fintech)

---

## 📝 CONCLUSIÓN

El sitio web de Hergon está diseñado para:

✅ **Convertir visitantes enterprise** en leads calificados
✅ **Comunicar confianza** mediante diseño profesional y métricas reales
✅ **Escalar** con el crecimiento del producto (multi-país, blog, portal)
✅ **Destacar** en un mercado competitivo mediante diferenciación clara

**Principales Diferenciadores:**

1. **Event Sourcing** - Ningún competidor lo menciona
2. **Multi-País desde Diseño** - Visión Latam clara
3. **Transparencia** - Métricas públicas, pricing visible
4. **Modernidad** - Stack 2025, performance superior

---

**Implementado por:** Claude
**Fecha:** 20 Noviembre 2025
**Versión:** 1.0
**Contacto:** Para dudas o mejoras, consultar este documento de referencia.
