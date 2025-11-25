# Certus App

Esta es la aplicación frontend principal de Certus. Para documentación completa, consulta el [README principal](../README.md).

## Inicio Rápido

```bash
# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Build
npm run build

# Tests
npm test
```

## Estructura

```
src/
├── components/     # Componentes React
├── features/       # Módulos por funcionalidad
├── pages/          # Páginas/Rutas
├── hooks/          # Custom hooks
├── stores/         # Estado global (Zustand)
├── lib/            # Utilidades y servicios
└── types/          # TypeScript types
```

## Scripts

| Script | Descripción |
|--------|-------------|
| `dev` | Servidor de desarrollo |
| `build` | Build de producción |
| `preview` | Preview del build |
| `test` | Tests unitarios |
| `test:e2e` | Tests E2E |
| `lint` | ESLint |
| `format` | Prettier |

## Variables de Entorno

Ver `.env.example` para la lista completa de variables requeridas.
