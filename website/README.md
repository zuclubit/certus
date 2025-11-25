# Hergon - Sitio Web Corporativo

Sitio web oficial de Hergon, plataforma de validación automatizada para AFOREs y AFPs en Latinoamérica.

## 🚀 Stack Tecnológico

- **Framework**: SvelteKit 2 con Svelte 5 (Runes)
- **Estilos**: Tailwind CSS 4
- **Deployment**: Adaptador automático (Vercel, Netlify, etc.)
- **Fuentes**: Inter (sans-serif), JetBrains Mono (monospace)

## 📋 Características

### Diseño Moderno 2025
- ✅ Mobile-first responsive
- ✅ Dark mode ready (preparado para implementación futura)
- ✅ Animaciones sutiles con Tailwind
- ✅ Paleta de colores enterprise fintech
- ✅ Tipografía profesional con Inter

### Secciones del Sitio
1. **Hero Section** - Propuesta de valor principal con CTA
2. **Problema/Solución** - Comparativa del desafío vs. solución Hergon
3. **Características** - 6 features principales del producto
4. **Cómo Funciona** - Proceso en 3 pasos
5. **Métricas de Impacto** - KPIs clave (99.9% uptime, <3s response, etc.)
6. **Seguridad y Compliance** - Certificaciones y práticas de seguridad
7. **Cobertura Latinoamérica** - México, Chile, Colombia, Perú
8. **Pricing** - Planes Starter y Enterprise
9. **Formulario de Contacto** - Lead generation
10. **CTA Final** - Conversión

### Componentes Reutilizables
- `Header.svelte` - Navegación fija con scroll effect
- `Footer.svelte` - Footer con links y multi-país

## 🎨 Sistema de Diseño

### Colores

```js
Primary:
  - DEFAULT: #0066FF (Azul brillante - tecnología)
  - dark: #0A2540 (Azul profundo - confianza)
  - light: #3385FF (Azul claro - highlights)

Secondary:
  - success: #00D4AA (Verde - validación exitosa)
  - warning: #FF6B35 (Naranja - alertas/errores)

Neutrals:
  - 50-900: Escala de grises para texto y backgrounds
```

### Tipografía

- **Headings**: Inter (semibold, bold)
- **Body**: Inter (regular, medium)
- **Code/Data**: JetBrains Mono

### Componentes Utility

```css
.btn - Base button styles
.btn-primary - Primary CTA button
.btn-secondary - Secondary button
.btn-outline - Outline button
.card - Card container
.section - Section spacing
.container-custom - Max-width container
.gradient-text - Gradient text effect
```

## 🛠️ Desarrollo

### Instalación

```bash
cd website
npm install
```

### Comandos

```bash
# Desarrollo local
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview

# Type checking (si se agrega TypeScript)
npm run check
```

### Estructura de Archivos

```
website/
├── src/
│   ├── lib/
│   │   └── components/
│   │       ├── Header.svelte
│   │       └── Footer.svelte
│   ├── routes/
│   │   ├── +layout.svelte
│   │   └── +page.svelte
│   ├── app.html
│   └── app.css
├── static/
│   └── favicon.png
├── svelte.config.js
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

## 📱 Responsive Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🎯 SEO y Performance

- Meta tags optimizados
- Preconnect a Google Fonts
- Lazy loading de imágenes (cuando se agreguen)
- Tailwind CSS purge automático
- SSR/SSG ready

## 🚢 Deployment

### Vercel (Recomendado)

```bash
npm install -g vercel
vercel
```

### Netlify

```bash
npm run build
# Deploy la carpeta build/
```

### Azure Static Web Apps

```bash
# Configurar en Azure Portal
# Build command: npm run build
# App location: /
# Output location: build
```

## 📝 Mejoras Futuras

- [ ] Agregar animaciones con Framer Motion o Motion One
- [ ] Implementar dark mode toggle
- [ ] Agregar internacionalización (i18n) para inglés
- [ ] Integrar analytics (Plausible, Google Analytics)
- [ ] Agregar testimonios de clientes
- [ ] Blog section para content marketing
- [ ] Documentación técnica interactiva
- [ ] Portal de clientes (login)
- [ ] Dashboard de demo interactivo

## 📄 Licencia

MIT

## 👥 Contacto

Para más información: contact@hergon.com
