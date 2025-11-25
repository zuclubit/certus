# 🚀 INSTRUCCIONES DE USO - SITIO WEB HERGON

## 📦 Instalación Rápida

```bash
# 1. Navegar al directorio del sitio web
cd website

# 2. Instalar dependencias
npm install

# 3. Iniciar servidor de desarrollo
npm run dev

# 4. Abrir en el navegador
# El servidor estará en http://localhost:5173
```

---

## 🛠️ Comandos Disponibles

### Desarrollo

```bash
# Iniciar servidor de desarrollo con hot reload
npm run dev

# Servidor estará en http://localhost:5173
# Los cambios se reflejan automáticamente
```

### Producción

```bash
# Construir para producción
npm run build

# El output estará en .svelte-kit/output/

# Preview del build de producción
npm run preview

# Servidor de preview en http://localhost:4173
```

### Verificación

```bash
# Sync SvelteKit (genera tipos y config)
npx svelte-kit sync

# Check de tipos (si usas TypeScript)
npm run check

# Check continuo con watch mode
npm run check:watch
```

---

## 📁 Estructura del Proyecto

```
website/
├── src/
│   ├── lib/
│   │   └── components/       # Componentes reutilizables
│   │       ├── Header.svelte # Navegación principal
│   │       └── Footer.svelte # Footer del sitio
│   ├── routes/
│   │   ├── +layout.svelte    # Layout global
│   │   └── +page.svelte      # Página principal (home)
│   ├── app.html              # HTML template base
│   └── app.css               # Estilos globales (Tailwind)
├── static/
│   └── favicon.png           # Favicon (reemplazar)
├── svelte.config.js          # Configuración SvelteKit
├── vite.config.js            # Configuración Vite
├── tailwind.config.js        # Configuración Tailwind CSS
├── postcss.config.js         # PostCSS plugins
├── package.json              # Dependencias
└── README.md                 # Documentación
```

---

## ✏️ Cómo Editar Contenido

### Cambiar Textos

**Archivo:** `src/routes/+page.svelte`

Los textos están organizados en secciones. Ejemplo:

```svelte
<!-- Hero Section -->
<h1 class="...">
  Validación Automatizada para
  <span class="gradient-text">AFOREs</span>
</h1>
```

Para cambiar el título, simplemente edita el texto dentro del `<h1>`.

### Modificar Colores

**Archivo:** `tailwind.config.js`

```javascript
colors: {
  primary: {
    DEFAULT: '#0066FF',  // Color principal
    dark: '#0A2540',     // Azul oscuro
    light: '#3385FF'     // Azul claro
  },
  success: '#00D4AA',    // Verde
  warning: '#FF6B35'     // Naranja
}
```

Cambia los valores hexadecimales para ajustar la paleta.

### Actualizar Características

**Archivo:** `src/routes/+page.svelte`

Busca el array `features`:

```javascript
const features = [
  {
    icon: '✓',
    title: '37 Validaciones Automatizadas',
    description: 'Sistema completo de validación...'
  },
  // Agrega o edita features aquí
];
```

### Modificar Precios

**Archivo:** `src/routes/+page.svelte`

Busca el array `pricingTiers`:

```javascript
const pricingTiers = [
  {
    name: 'Starter',
    price: '$7,500',
    period: 'USD/año por fondo',
    features: [
      '37 validaciones automatizadas',
      // Agrega más features
    ]
  }
];
```

---

## 🎨 Personalización de Diseño

### Cambiar Fuentes

**Archivo:** `src/app.html`

```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
```

Para cambiar a otra fuente:
1. Ve a [Google Fonts](https://fonts.google.com)
2. Selecciona tu fuente
3. Reemplaza el link
4. Actualiza `tailwind.config.js`:

```javascript
fontFamily: {
  sans: ['TuFuente', 'system-ui', 'sans-serif']
}
```

### Ajustar Espaciado

**Archivo:** `src/app.css`

```css
.section {
  @apply py-20 px-4 md:px-8;
  /* py-20 = 80px vertical */
  /* Cambia a py-16 para menos espacio */
}
```

### Modificar Botones

**Archivo:** `src/app.css`

```css
.btn-primary {
  @apply bg-primary text-white hover:bg-primary-dark;
  /* Agrega más estilos aquí */
}
```

---

## 🌐 Deployment

### Opción 1: Vercel (Recomendado)

```bash
# 1. Instalar Vercel CLI
npm install -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel

# 4. Deploy a producción
vercel --prod
```

Tu sitio estará en: `https://tu-proyecto.vercel.app`

### Opción 2: Netlify

```bash
# 1. Construir el proyecto
npm run build

# 2. Instalar Netlify CLI
npm install -g netlify-cli

# 3. Login
netlify login

# 4. Deploy
netlify deploy --prod --dir=build
```

### Opción 3: Azure Static Web Apps

1. Ir a Azure Portal
2. Crear "Static Web App"
3. Conectar con GitHub repo
4. Configurar:
   - **Build command:** `npm run build`
   - **App location:** `/website`
   - **Output location:** `build`

---

## 🔧 Configuración Avanzada

### Agregar Nueva Página

1. Crear archivo en `src/routes/`:

```bash
# Crear página "about"
# Archivo: src/routes/about/+page.svelte
```

2. Agregar contenido:

```svelte
<script>
  import Header from '$lib/components/Header.svelte';
  import Footer from '$lib/components/Footer.svelte';
</script>

<Header />

<main>
  <h1>Sobre Nosotros</h1>
  <p>Contenido de la página</p>
</main>

<Footer />
```

3. La página estará en: `/about`

### Crear Componente Reutilizable

1. Crear archivo en `src/lib/components/`:

```bash
# Archivo: src/lib/components/MiComponente.svelte
```

2. Agregar código:

```svelte
<script>
  export let titulo = 'Default';
  export let descripcion;
</script>

<div class="card">
  <h3>{titulo}</h3>
  <p>{descripcion}</p>
</div>
```

3. Usar en cualquier página:

```svelte
<script>
  import MiComponente from '$lib/components/MiComponente.svelte';
</script>

<MiComponente
  titulo="Hola"
  descripcion="Esto es un ejemplo"
/>
```

### Integrar Analytics

**Google Analytics:**

1. Editar `src/app.html`:

```html
<head>
  <!-- Google Analytics -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-XXXXXXXXXX');
  </script>
</head>
```

**Plausible (Recomendado para privacidad):**

```html
<head>
  <script defer data-domain="hergon.com" src="https://plausible.io/js/script.js"></script>
</head>
```

---

## 🐛 Troubleshooting

### Error: "Cannot find module"

**Solución:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Error: "Port already in use"

**Solución:**
```bash
# Cambiar puerto en package.json:
"dev": "vite dev --port 3000"
```

### Estilos no se aplican

**Solución:**
```bash
# Limpiar cache de Vite
rm -rf .svelte-kit
npx svelte-kit sync
npm run dev
```

### Build falla

**Solución:**
```bash
# Verificar sintaxis Svelte
npx svelte-check

# Verificar configuración Tailwind
npx tailwindcss -c tailwind.config.js
```

---

## 📚 Recursos Útiles

### Documentación Oficial

- **SvelteKit:** https://kit.svelte.dev/docs
- **Svelte 5:** https://svelte.dev/docs/svelte/overview
- **Tailwind CSS:** https://tailwindcss.com/docs
- **Vite:** https://vitejs.dev/guide

### Tutoriales

- **SvelteKit Tutorial:** https://learn.svelte.dev/
- **Tailwind Components:** https://tailwindui.com/components
- **Svelte Examples:** https://svelte.dev/examples

### Comunidad

- **Svelte Discord:** https://svelte.dev/chat
- **Stack Overflow:** Tag `svelte` o `sveltekit`
- **GitHub Discussions:** https://github.com/sveltejs/kit/discussions

---

## 🔐 Seguridad

### Antes de Deploy

- [ ] Remover console.logs
- [ ] Verificar no hay API keys hardcoded
- [ ] Configurar CORS si usas API
- [ ] Habilitar HTTPS (automático en Vercel/Netlify)
- [ ] Agregar `robots.txt` y `sitemap.xml`

### Headers de Seguridad

**Archivo:** `svelte.config.js`

```javascript
const config = {
  kit: {
    adapter: adapter(),
    csp: {
      directives: {
        'script-src': ['self']
      }
    }
  }
};
```

---

## 📞 Soporte

### Para Preguntas Técnicas

1. Revisar este documento
2. Consultar documentación oficial (links arriba)
3. Buscar en GitHub Issues de SvelteKit

### Para Cambios de Contenido

1. Editar archivos `.svelte` en `src/routes/`
2. Verificar cambios en `http://localhost:5173`
3. Hacer commit y push a GitHub
4. Deploy automático (si configuraste CI/CD)

---

## ✅ Checklist de Lanzamiento

Antes de poner el sitio en producción:

- [ ] Contenido revisado (sin typos)
- [ ] Imágenes optimizadas (WebP, lazy load)
- [ ] Favicon de alta calidad
- [ ] Meta tags SEO (title, description)
- [ ] Open Graph tags (para compartir en redes)
- [ ] Analytics configurado
- [ ] Formulario de contacto funcional
- [ ] SSL/HTTPS habilitado
- [ ] Dominio personalizado configurado
- [ ] Testing en múltiples navegadores
- [ ] Testing en mobile/tablet
- [ ] Lighthouse score >90

---

## 🎉 ¡Listo!

Tu sitio web está completamente funcional. Para cualquier duda:

1. Consulta `PROPUESTA_DISEÑO.md` para entender las decisiones de diseño
2. Consulta `README.md` para información general del proyecto
3. Consulta este archivo para instrucciones prácticas

**¡Éxito con el lanzamiento de Hergon! 🚀**
