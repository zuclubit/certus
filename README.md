<p align="center">
  <img src="app/src/assets/images/certus-logo.svg" alt="Certus Logo" width="200" height="200" />
</p>

<h1 align="center">Certus</h1>

<p align="center">
  <strong>Sistema de Validación CONSAR de Nueva Generación</strong>
</p>

<p align="center">
  Plataforma empresarial moderna para la validación automatizada de archivos CONSAR con procesamiento en tiempo real y análisis avanzado.
</p>

<p align="center">
  <a href="https://github.com/oscarvalois/hergon-vector01/actions/workflows/ci.yml">
    <img src="https://github.com/oscarvalois/hergon-vector01/actions/workflows/ci.yml/badge.svg" alt="CI Status" />
  </a>
  <a href="https://github.com/oscarvalois/hergon-vector01/actions/workflows/codeql.yml">
    <img src="https://github.com/oscarvalois/hergon-vector01/actions/workflows/codeql.yml/badge.svg" alt="CodeQL" />
  </a>
  <a href="https://codecov.io/gh/oscarvalois/hergon-vector01">
    <img src="https://codecov.io/gh/oscarvalois/hergon-vector01/branch/main/graph/badge.svg" alt="Coverage" />
  </a>
  <a href="https://github.com/oscarvalois/hergon-vector01/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/oscarvalois/hergon-vector01" alt="License" />
  </a>
</p>

<p align="center">
  <a href="https://react.dev/">
    <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" alt="React 19" />
  </a>
  <a href="https://www.typescriptlang.org/">
    <img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  </a>
  <a href="https://vitejs.dev/">
    <img src="https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite&logoColor=white" alt="Vite" />
  </a>
  <a href="https://tailwindcss.com/">
    <img src="https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  </a>
</p>

---

## Tabla de Contenidos

- [Características](#características)
- [Stack Tecnológico](#stack-tecnológico)
- [Inicio Rápido](#inicio-rápido)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Scripts Disponibles](#scripts-disponibles)
- [Configuración](#configuración)
- [Testing](#testing)
- [Despliegue](#despliegue)
- [Contribuir](#contribuir)
- [Seguridad](#seguridad)
- [Licencia](#licencia)

## Características

- **Validación Automatizada** - Procesamiento inteligente de archivos CONSAR con validación de reglas en tiempo real
- **Dashboard Interactivo** - Visualizaciones avanzadas con Recharts y métricas en tiempo real
- **Actualizaciones en Tiempo Real** - SignalR para notificaciones y estados instantáneos
- **Exportación Múltiple** - Generación de reportes en PDF, Excel y CSV
- **Autenticación Empresarial** - Integración con Azure AD y soporte MFA
- **Diseño Responsivo** - UI adaptativa con diseño inspirado en VisionOS
- **Modo Oscuro** - Tema claro/oscuro con transiciones suaves
- **Internacionalización** - Soporte multiidioma con i18next
- **Accesibilidad** - Cumplimiento WCAG 2.1 con Radix UI

## Stack Tecnológico

### Frontend Core
| Tecnología | Versión | Descripción |
|------------|---------|-------------|
| [React](https://react.dev/) | 19.0 | Biblioteca UI con Concurrent Features |
| [TypeScript](https://www.typescriptlang.org/) | 5.7 | Tipado estático con modo strict |
| [Vite](https://vitejs.dev/) | 6.0 | Build tool ultrarrápido |

### Estado y Data Fetching
| Tecnología | Descripción |
|------------|-------------|
| [TanStack Query](https://tanstack.com/query) | Server state management |
| [Zustand](https://zustand-demo.pmnd.rs/) | Client state management |
| [React Hook Form](https://react-hook-form.com/) | Formularios performantes |
| [Zod](https://zod.dev/) | Validación de esquemas |

### UI y Estilos
| Tecnología | Descripción |
|------------|-------------|
| [Tailwind CSS](https://tailwindcss.com/) | Utility-first CSS |
| [Radix UI](https://www.radix-ui.com/) | Primitivos accesibles |
| [Recharts](https://recharts.org/) | Visualización de datos |
| [Lucide Icons](https://lucide.dev/) | Iconografía |
| [Lottie](https://lottiefiles.com/) | Animaciones vectoriales |

### Autenticación y Backend
| Tecnología | Descripción |
|------------|-------------|
| [MSAL React](https://github.com/AzureAD/microsoft-authentication-library-for-js) | Azure AD Authentication |
| [SignalR](https://dotnet.microsoft.com/apps/aspnet/signalr) | Comunicación en tiempo real |
| [Axios](https://axios-http.com/) | HTTP Client |
| [Application Insights](https://docs.microsoft.com/azure/azure-monitor/app/app-insights-overview) | Monitoreo y telemetría |

## Inicio Rápido

### Prerrequisitos

- Node.js 20.x o superior
- npm 10.x o superior
- Git

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/oscarvalois/hergon-vector01.git
cd hergon-vector01

# Navegar al directorio de la aplicación
cd app

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.development

# Iniciar servidor de desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## Estructura del Proyecto

```
hergon-vector01/
├── .github/                 # Configuración GitHub
│   ├── workflows/          # GitHub Actions
│   ├── ISSUE_TEMPLATE/     # Templates de issues
│   └── PULL_REQUEST_TEMPLATE.md
├── app/                     # Aplicación principal
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   │   ├── ui/        # Componentes base (shadcn)
│   │   │   ├── layout/    # Layout components
│   │   │   ├── charts/    # Visualizaciones
│   │   │   └── shared/    # Componentes compartidos
│   │   ├── features/       # Módulos por funcionalidad
│   │   │   ├── auth/      # Autenticación
│   │   │   ├── validations/ # Validaciones CONSAR
│   │   │   └── settings/  # Configuración usuario
│   │   ├── pages/          # Páginas/Rutas
│   │   ├── hooks/          # Custom React hooks
│   │   ├── stores/         # Zustand stores
│   │   ├── lib/            # Utilidades y servicios
│   │   │   ├── api/       # Cliente API
│   │   │   ├── auth/      # Configuración MSAL
│   │   │   ├── exporters/ # PDF, Excel, CSV
│   │   │   └── utils/     # Helpers
│   │   └── types/          # TypeScript definitions
│   ├── tests/              # Tests
│   │   ├── e2e/           # Playwright E2E
│   │   └── unit/          # Vitest unit tests
│   └── public/             # Assets estáticos
├── docs/                    # Documentación
├── terraform/               # Infrastructure as Code
└── scripts/                 # Scripts de automatización
```

## Scripts Disponibles

```bash
# Desarrollo
npm run dev           # Servidor de desarrollo (puerto 3000)
npm run build         # Build de producción
npm run preview       # Preview del build

# Testing
npm run test          # Tests unitarios con Vitest
npm run test:ui       # Tests con UI interactiva
npm run test:e2e      # Tests E2E con Playwright
npm run test:coverage # Cobertura de tests

# Calidad de Código
npm run lint          # ESLint
npm run format        # Prettier
npm run typecheck     # TypeScript check

# Análisis
npm run build:analyze # Análisis del bundle
```

## Configuración

### Variables de Entorno

Crear `.env.development` basado en `.env.example`:

```env
# API Configuration
VITE_API_URL=http://localhost:5000/api
VITE_SIGNALR_URL=http://localhost:5000

# Azure AD Configuration
VITE_AZURE_CLIENT_ID=your-client-id
VITE_AZURE_TENANT_ID=your-tenant-id

# Application Insights (opcional)
VITE_APP_INSIGHTS_CONNECTION_STRING=your-connection-string
```

### Configuración de Azure AD

1. Registrar aplicación en Azure Portal
2. Configurar redirect URIs
3. Habilitar tokens de acceso y ID
4. Copiar Client ID y Tenant ID a `.env`

## Testing

### Tests Unitarios (Vitest)

```bash
# Ejecutar tests
npm run test

# Con cobertura
npm run test:coverage

# Modo watch
npm run test -- --watch

# UI interactiva
npm run test:ui
```

### Tests E2E (Playwright)

```bash
# Ejecutar todos los tests E2E
npm run test:e2e

# Solo Chromium
npm run test:e2e -- --project=chromium

# Con UI
npx playwright test --ui

# Generar reporte
npx playwright show-report
```

## Despliegue

### Cloudflare Pages

El proyecto está configurado para despliegue automático en Cloudflare Pages:

```bash
# Despliegue manual
npm run build
npx wrangler pages deploy dist --project-name=certus
```

### GitHub Actions

Los workflows de CI/CD se ejecutan automáticamente:

- **CI**: Lint, test, build en cada PR
- **Deploy**: Despliegue automático a preview/producción
- **CodeQL**: Análisis de seguridad semanal

## Contribuir

¡Las contribuciones son bienvenidas! Por favor lee nuestra [Guía de Contribución](CONTRIBUTING.md) antes de enviar un PR.

### Proceso Rápido

1. Fork el repositorio
2. Crear branch: `git checkout -b feature/mi-feature`
3. Commit cambios: `git commit -m 'feat: agregar nueva funcionalidad'`
4. Push: `git push origin feature/mi-feature`
5. Abrir Pull Request

### Convención de Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: nueva funcionalidad
fix: corrección de bug
docs: cambios en documentación
style: cambios de formato
refactor: refactorización de código
test: agregar o modificar tests
chore: tareas de mantenimiento
```

## Seguridad

Para reportar vulnerabilidades, por favor revisa nuestra [Política de Seguridad](SECURITY.md).

**No reportes vulnerabilidades en issues públicos.**

## Roadmap

- [ ] Soporte offline con Service Workers
- [ ] PWA completa
- [ ] Dashboard personalizable
- [ ] API GraphQL
- [ ] Integración con más AFOREs

## Agradecimientos

- [shadcn/ui](https://ui.shadcn.com/) por los componentes base
- [Radix UI](https://www.radix-ui.com/) por los primitivos accesibles
- [TanStack](https://tanstack.com/) por las herramientas de data fetching

## Licencia

Este proyecto está bajo la licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

---

<p align="center">
  Hecho con ❤️ por el equipo de <a href="https://hergon.com">Hergon</a>
</p>

<p align="center">
  <a href="https://certus.hergon.com">Website</a> •
  <a href="https://docs.certus.hergon.com">Docs</a> •
  <a href="https://github.com/oscarvalois/hergon-vector01/discussions">Discussions</a>
</p>
