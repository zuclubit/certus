# Certus App

[![CI Pipeline](https://github.com/sh-certus/certus-app/actions/workflows/ci.yml/badge.svg)](https://github.com/sh-certus/certus-app/actions/workflows/ci.yml)
[![CD Pipeline](https://github.com/sh-certus/certus-app/actions/workflows/cd.yml/badge.svg)](https://github.com/sh-certus/certus-app/actions/workflows/cd.yml)
[![React](https://img.shields.io/badge/React-19.0-61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-Proprietary-red)](LICENSE)

Frontend para el **Sistema de Validacion CONSAR - Certus**. Aplicacion web enterprise para validacion de archivos regulatorios del Sistema de Ahorro para el Retiro (SAR) en Mexico.

## Caracteristicas Principales

- **Dashboard Enterprise**: Metricas en tiempo real, graficos interactivos y KPIs
- **Validacion de Archivos**: Upload, procesamiento y visualizacion de resultados
- **Sistema de Aprobaciones**: Workflow visual de revision y aprobacion
- **Gestion de Usuarios**: Administracion de usuarios, roles y permisos
- **Reportes PDF/Excel**: Generacion y exportacion de reportes
- **Real-time Updates**: Notificaciones en tiempo real via SignalR
- **Design System VisionOS**: UI/UX premium con glassmorphism y animaciones
- **Multi-tenant Ready**: Soporte para multiples AFOREs

## Stack Tecnologico

| Categoria | Tecnologia |
|-----------|------------|
| Framework | React 19 |
| Lenguaje | TypeScript 5.7 |
| Build Tool | Vite 6 |
| Styling | TailwindCSS 3.4 |
| State Management | Zustand 5 |
| Data Fetching | TanStack Query 5 |
| Routing | React Router 7 |
| Forms | React Hook Form + Zod |
| UI Components | Radix UI |
| Animations | Framer Motion |
| Charts | Recharts |
| Real-time | SignalR |
| Auth | Azure MSAL |
| Testing | Vitest + Playwright |

## Arquitectura

```
src/
├── components/          # Componentes React reutilizables
│   ├── ui/             # Design system (buttons, cards, modals)
│   ├── layout/         # Layout components (Header, Sidebar, Footer)
│   ├── shared/         # Componentes compartidos
│   ├── charts/         # Graficos y visualizaciones
│   ├── validations/    # Componentes de validacion
│   ├── approval/       # Workflow de aprobaciones
│   └── auth/           # Autenticacion
│
├── pages/              # Paginas/Rutas de la aplicacion
│   ├── Dashboard       # Dashboard principal
│   ├── Validations     # Modulo de validaciones
│   ├── Users           # Gestion de usuarios
│   ├── Reports         # Generacion de reportes
│   ├── Catalogs        # Catalogos del sistema
│   ├── approvals/      # Workflow de aprobaciones
│   ├── compliance/     # Portal de cumplimiento
│   └── scrapers/       # Gestion de scrapers
│
├── hooks/              # Custom React hooks
├── stores/             # Estado global (Zustand)
├── lib/                # Utilidades y servicios
│   ├── api/           # Cliente API
│   ├── services/      # Servicios de negocio
│   ├── utils/         # Funciones utilitarias
│   ├── schemas/       # Esquemas Zod
│   ├── parsers/       # Parsers de archivos
│   ├── exporters/     # Exportadores (Excel, CSV)
│   └── pdf/           # Generacion de PDFs
│
├── styles/             # Estilos globales y tokens
├── types/              # TypeScript types
└── features/           # Feature modules
```

## Inicio Rapido

### Prerrequisitos

- [Node.js 20+](https://nodejs.org/)
- [npm 10+](https://www.npmjs.com/)
- [Git](https://git-scm.com/)

### Instalacion

1. **Clonar el repositorio:**
```bash
git clone https://github.com/sh-certus/certus-app.git
cd certus-app
```

2. **Instalar dependencias:**
```bash
npm install
```

3. **Configurar variables de entorno:**
```bash
cp .env.example .env.development
# Editar .env.development con tus configuraciones
```

4. **Iniciar servidor de desarrollo:**
```bash
npm run dev
```

La aplicacion estara disponible en: http://localhost:3000

## Scripts Disponibles

| Script | Descripcion |
|--------|-------------|
| `npm run dev` | Servidor de desarrollo (puerto 3000) |
| `npm run build` | Build de produccion |
| `npm run preview` | Preview del build |
| `npm run test` | Tests unitarios (Vitest) |
| `npm run test:ui` | Tests con UI interactiva |
| `npm run test:coverage` | Tests con coverage |
| `npm run test:e2e` | Tests E2E (Playwright) |
| `npm run lint` | ESLint |
| `npm run lint:fix` | ESLint con auto-fix |
| `npm run format` | Prettier |
| `npm run typecheck` | TypeScript check |

## Variables de Entorno

```env
# API Configuration
VITE_API_URL=http://localhost:5000/api
VITE_SIGNALR_URL=http://localhost:5000

# Mock Services (desarrollo)
VITE_USE_MOCK_SERVICES=false

# Azure AD Configuration
VITE_AZURE_CLIENT_ID=your-client-id
VITE_AZURE_TENANT_ID=common

# Application Insights
VITE_APP_INSIGHTS_CONNECTION_STRING=your-connection-string
```

## Estructura de Componentes UI

El proyecto incluye un design system premium inspirado en VisionOS:

### Componentes Base
- `Button` - Botones con variantes premium
- `Card` - Tarjetas con glassmorphism
- `Modal` - Modales responsivos
- `Table` - Tablas de datos con virtualizacion

### Componentes Avanzados
- `GlassmorphicCard` - Tarjetas con efecto glass
- `PremiumButton` - Botones con animaciones
- `PremiumDataTable` - Tablas enterprise
- `PremiumTimeline` - Timeline de eventos
- `LottieIcon` - Iconos animados

### Animaciones
- Transiciones suaves con Framer Motion
- Skeleton loaders premium
- Micro-interacciones

## Testing

### Tests Unitarios (Vitest)

```bash
# Ejecutar tests
npm run test

# Con coverage
npm run test:coverage

# Con UI
npm run test:ui
```

### Tests E2E (Playwright)

```bash
# Ejecutar tests E2E
npm run test:e2e

# Con UI interactiva
npm run test:e2e:ui
```

## Build y Deploy

### Build de Produccion

```bash
npm run build
```

Los archivos se generan en `dist/`.

### Docker

```bash
# Build imagen
docker build -t certus-app .

# Ejecutar contenedor
docker run -p 80:80 certus-app
```

## Estructura de Rutas

| Ruta | Descripcion |
|------|-------------|
| `/` | Dashboard principal |
| `/validations` | Lista de validaciones |
| `/validations/:id` | Detalle de validacion |
| `/users` | Gestion de usuarios |
| `/catalogs` | Catalogos del sistema |
| `/reports` | Generacion de reportes |
| `/approvals` | Workflow de aprobaciones |
| `/compliance` | Portal de cumplimiento |
| `/settings` | Configuracion |
| `/login` | Login |

## Performance

- **Code Splitting**: Lazy loading de paginas y componentes
- **Virtualizacion**: Listas grandes con TanStack Virtual
- **Caching**: React Query para cache de datos
- **Bundle Optimization**: Tree shaking y minificacion
- **Assets**: Optimizacion de imagenes y fuentes

## Contribuir

Por favor lee [CONTRIBUTING.md](CONTRIBUTING.md) para detalles sobre nuestro proceso de contribucion.

## Seguridad

Para reportar vulnerabilidades de seguridad, por favor lee [SECURITY.md](SECURITY.md).

## Equipo

Desarrollado por el equipo de **Hergon Digital** para el ecosistema Certus.

## Licencia

Este proyecto es software propietario. Todos los derechos reservados.

Copyright (c) 2024-2025 Hergon Digital
