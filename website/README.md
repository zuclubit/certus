# Hergon Website

[![CI Pipeline](https://github.com/sh-certus/hergon-website/actions/workflows/ci.yml/badge.svg)](https://github.com/sh-certus/hergon-website/actions/workflows/ci.yml)
[![Deploy](https://github.com/sh-certus/hergon-website/actions/workflows/deploy.yml/badge.svg)](https://github.com/sh-certus/hergon-website/actions/workflows/deploy.yml)
[![SvelteKit](https://img.shields.io/badge/SvelteKit-2.0-FF3E00)](https://kit.svelte.dev/)
[![Svelte](https://img.shields.io/badge/Svelte-5.0-FF3E00)](https://svelte.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-06B6D4)](https://tailwindcss.com/)

Sitio web corporativo de **Hergon** - Plataforma de validacion automatizada para AFOREs y AFPs en Latinoamerica.

## Caracteristicas

- **Framework Moderno**: SvelteKit 2 con Svelte 5 (Runes)
- **Estilos**: TailwindCSS 3.4 con design system personalizado
- **Performance**: SSG (Static Site Generation) optimizado
- **SEO**: Meta tags optimizados, sitemap, robots.txt
- **Responsive**: Mobile-first, adaptativo a todos los dispositivos
- **Accesibilidad**: WCAG 2.1 AA compliant

## Stack Tecnologico

| Categoria | Tecnologia |
|-----------|------------|
| Framework | SvelteKit 2 |
| UI Library | Svelte 5 |
| Styling | TailwindCSS 3.4 |
| Icons | Lucide Svelte |
| Build | Vite 7 |
| Deployment | Vercel / Cloudflare Pages |

## Secciones del Sitio

1. **Hero** - Propuesta de valor principal con CTA
2. **Problema/Solucion** - Comparativa del desafio vs solucion
3. **Caracteristicas** - 6 features principales del producto
4. **Como Funciona** - Proceso en 3 pasos
5. **Metricas de Impacto** - KPIs (99.9% uptime, <3s response)
6. **Seguridad y Compliance** - Certificaciones
7. **Cobertura Latinoamerica** - Mexico, Chile, Colombia, Peru
8. **Pricing** - Planes Starter y Enterprise
9. **Contacto** - Formulario de lead generation
10. **Roadmap** - Proximas funcionalidades

## Inicio Rapido

### Prerrequisitos

- [Node.js 20+](https://nodejs.org/)
- [npm 10+](https://www.npmjs.com/)

### Instalacion

```bash
# Clonar el repositorio
git clone https://github.com/sh-certus/hergon-website.git
cd hergon-website

# Instalar dependencias
npm install

# Desarrollo local
npm run dev
```

El sitio estara disponible en: http://localhost:5173

## Scripts Disponibles

| Script | Descripcion |
|--------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de produccion (SSG) |
| `npm run preview` | Preview del build |
| `npm run check` | Svelte type checking |
| `npm run check:watch` | Type checking en modo watch |

## Arquitectura

```
website/
├── src/
│   ├── lib/
│   │   └── components/       # Componentes Svelte
│   │       ├── Header.svelte
│   │       ├── Footer.svelte
│   │       ├── HeroSection.svelte
│   │       ├── FeaturesSection.svelte
│   │       ├── PricingSection.svelte
│   │       └── ...
│   ├── routes/
│   │   ├── +layout.svelte    # Layout principal
│   │   ├── +layout.js        # Prerender config
│   │   ├── +page.svelte      # Homepage
│   │   └── roadmap/
│   │       └── +page.svelte  # Pagina de roadmap
│   ├── app.html              # Template HTML
│   └── app.css               # Estilos globales
├── static/
│   └── favicon.png
├── svelte.config.js
├── vite.config.js
├── tailwind.config.js
└── package.json
```

## Sistema de Diseno

### Colores

```js
Primary:
  - DEFAULT: #0066FF  // Azul brillante - tecnologia
  - dark: #0A2540     // Azul profundo - confianza
  - light: #3385FF    // Azul claro - highlights

Secondary:
  - success: #00D4AA  // Verde - validacion exitosa
  - warning: #FF6B35  // Naranja - alertas

Neutrals:
  - 50-900            // Escala de grises
```

### Tipografia

- **Headings**: Inter (semibold, bold)
- **Body**: Inter (regular, medium)
- **Code**: JetBrains Mono

### Componentes

```css
.btn-primary    - Boton CTA principal
.btn-secondary  - Boton secundario
.btn-outline    - Boton outline
.card           - Contenedor tarjeta
.gradient-text  - Texto con gradiente
```

## Deployment

### Vercel (Recomendado)

```bash
npm install -g vercel
vercel
```

### Cloudflare Pages

```bash
npm run build
# Deploy carpeta build/
```

### Azure Static Web Apps

```yaml
Build command: npm run build
App location: /
Output location: build
```

## Performance

- **Lighthouse Score**: 95+ en todas las categorias
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **SSG**: Paginas pre-renderizadas

## SEO

- Meta tags optimizados por pagina
- Open Graph para redes sociales
- Twitter Cards
- Sitemap XML automatico
- Robots.txt configurado

## Contribuir

1. Fork el repositorio
2. Crea una rama (`git checkout -b feature/nueva-seccion`)
3. Commit cambios (`git commit -m 'feat: add nueva seccion'`)
4. Push (`git push origin feature/nueva-seccion`)
5. Abre un Pull Request

## Equipo

Desarrollado por **Hergon Digital**.

## Licencia

Este proyecto es software propietario. Todos los derechos reservados.

Copyright (c) 2024-2025 Hergon Digital
