#!/bin/bash

# Hergon Frontend Initialization Script
# Modern React 19 + TypeScript + Vite application
# Version: 1.0.0

set -e

echo "🚀 Inicializando Hergon Frontend Application..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Por favor instala Node.js 22+ primero."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 22 ]; then
    echo "⚠️  Node.js versión $NODE_VERSION detectada. Se recomienda Node.js 22+."
fi

# Create app directory
echo -e "${BLUE}📁 Creando estructura de directorios...${NC}"
mkdir -p app
cd app

# Initialize package.json
echo -e "${BLUE}📦 Inicializando proyecto...${NC}"
npm init -y

# Install dependencies
echo -e "${BLUE}📥 Instalando dependencias principales...${NC}"
echo -e "${YELLOW}⚠️  Usando --legacy-peer-deps para compatibilidad React 19${NC}"
npm install --legacy-peer-deps \
  react@^19.0.0 \
  react-dom@^19.0.0 \
  react-router-dom@^7.0.0 \
  @tanstack/react-query@^5.64.0 \
  @tanstack/react-table@^8.20.0 \
  @tanstack/react-virtual@^3.10.8 \
  zustand@^5.0.0 \
  react-hook-form@^7.53.0 \
  zod@^3.24.0 \
  @hookform/resolvers@^3.9.0 \
  @azure/msal-browser@^3.28.0 \
  @azure/msal-react@^2.0.22 \
  @microsoft/signalr@^8.0.7 \
  @microsoft/applicationinsights-web@^3.3.3 \
  axios@^1.7.9 \
  lucide-react@^0.468.0 \
  recharts@^2.13.3 \
  react-dropzone@^14.3.5 \
  date-fns@^4.1.0 \
  clsx@^2.1.1 \
  tailwind-merge@^2.5.5 \
  class-variance-authority@^0.7.0 \
  react-i18next@^15.1.3 \
  i18next@^24.2.0 \
  @radix-ui/react-dialog@latest \
  @radix-ui/react-dropdown-menu@latest \
  @radix-ui/react-select@latest \
  @radix-ui/react-tabs@latest \
  @radix-ui/react-toast@latest \
  @radix-ui/react-tooltip@latest \
  @radix-ui/react-popover@latest \
  @radix-ui/react-avatar@latest \
  @radix-ui/react-label@latest \
  @radix-ui/react-slot@latest

echo -e "${BLUE}📥 Instalando dependencias de desarrollo...${NC}"
npm install -D --legacy-peer-deps \
  @types/react@^19.0.0 \
  @types/react-dom@^19.0.0 \
  @vitejs/plugin-react-swc@^3.7.2 \
  vite@^6.0.0 \
  typescript@^5.7.2 \
  tailwindcss@^3.4.18 \
  autoprefixer@^10.4.20 \
  postcss@^8.4.49 \
  vitest@^3.0.0 \
  @testing-library/react@^16.0.0 \
  @testing-library/user-event@^14.5.2 \
  @testing-library/jest-dom@^6.6.3 \
  @vitest/ui@^3.0.0 \
  jsdom@^25.0.0 \
  @playwright/test@^1.50.0 \
  eslint@^9.17.0 \
  @eslint/js@^9.17.0 \
  typescript-eslint@^8.18.1 \
  eslint-plugin-react-hooks@^5.1.0 \
  eslint-plugin-react-refresh@^0.4.16 \
  prettier@^3.4.2 \
  prettier-plugin-tailwindcss@^0.6.9

# Create directory structure
echo -e "${BLUE}📁 Creando estructura de proyecto...${NC}"
mkdir -p src/{app,components/{ui,layout,forms,tables,charts},features/{auth,validations,reports,catalogs,settings}/{components,hooks},lib/{api,auth,utils,constants},hooks,stores,types,assets/{fonts,images}}
mkdir -p public
mkdir -p tests/{unit,integration,e2e}

# Create configuration files
echo -e "${BLUE}⚙️  Creando archivos de configuración...${NC}"

# Update package.json with correct scripts
cat > package.json << 'EOF'
{
  "name": "hergon-app",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:e2e": "playwright test",
    "lint": "eslint .",
    "format": "prettier --write \"src/**/*.{ts,tsx,js,jsx,json,css}\""
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router-dom": "^7.0.0",
    "@tanstack/react-query": "^5.64.0",
    "@tanstack/react-table": "^8.20.0",
    "@tanstack/react-virtual": "^3.10.8",
    "zustand": "^5.0.0",
    "react-hook-form": "^7.53.0",
    "zod": "^3.24.0",
    "@hookform/resolvers": "^3.9.0",
    "@azure/msal-browser": "^3.28.0",
    "@azure/msal-react": "^2.0.22",
    "@microsoft/signalr": "^8.0.7",
    "@microsoft/applicationinsights-web": "^3.3.3",
    "axios": "^1.7.9",
    "lucide-react": "^0.468.0",
    "recharts": "^2.13.3",
    "react-dropzone": "^14.3.5",
    "date-fns": "^4.1.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.5.5",
    "class-variance-authority": "^0.7.0",
    "react-i18next": "^15.1.3",
    "i18next": "^24.2.0",
    "@radix-ui/react-dialog": "latest",
    "@radix-ui/react-dropdown-menu": "latest",
    "@radix-ui/react-select": "latest",
    "@radix-ui/react-tabs": "latest",
    "@radix-ui/react-toast": "latest",
    "@radix-ui/react-tooltip": "latest",
    "@radix-ui/react-popover": "latest",
    "@radix-ui/react-avatar": "latest",
    "@radix-ui/react-label": "latest",
    "@radix-ui/react-slot": "latest"
  },
  "devDependencies": {
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react-swc": "^3.7.2",
    "vite": "^6.0.0",
    "typescript": "^5.7.2",
    "tailwindcss": "^3.4.18",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.49",
    "vitest": "^3.0.0",
    "@testing-library/react": "^16.0.0",
    "@testing-library/user-event": "^14.5.2",
    "@testing-library/jest-dom": "^6.6.3",
    "@vitest/ui": "^3.0.0",
    "jsdom": "^25.0.0",
    "@playwright/test": "^1.50.0",
    "eslint": "^9.17.0",
    "@eslint/js": "^9.17.0",
    "typescript-eslint": "^8.18.1",
    "eslint-plugin-react-hooks": "^5.1.0",
    "eslint-plugin-react-refresh": "^0.4.16",
    "prettier": "^3.4.2",
    "prettier-plugin-tailwindcss": "^0.6.9"
  }
}
EOF

echo -e "${GREEN}✅ package.json creado${NC}"

# Create vite.config.ts
cat > vite.config.ts << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    target: 'es2020',
    minify: 'esbuild',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'query-vendor': ['@tanstack/react-query', '@tanstack/react-table', '@tanstack/react-virtual'],
          'ui-vendor': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs'
          ]
        }
      }
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.ts',
    css: true
  }
})
EOF

echo -e "${GREEN}✅ vite.config.ts creado${NC}"

# Create tsconfig.json
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,

    /* Path aliases */
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
EOF

echo -e "${GREEN}✅ tsconfig.json creado${NC}"

# Create tailwind.config.js
cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0066FF',
          dark: '#0A2540',
          light: '#3385FF',
          50: '#E6F0FF',
          100: '#CCE0FF',
          200: '#99C2FF',
          300: '#66A3FF',
          400: '#3385FF',
          500: '#0066FF',
          600: '#0052CC',
          700: '#003D99',
          800: '#002966',
          900: '#001433'
        },
        success: {
          DEFAULT: '#00D4AA',
          light: '#33DDBB',
          dark: '#00A789'
        },
        warning: {
          DEFAULT: '#FF6B35',
          light: '#FF8A5E',
          dark: '#CC5629'
        },
        danger: {
          DEFAULT: '#EF4444',
          light: '#F87171',
          dark: '#DC2626'
        },
        neutral: {
          50: '#F7F9FC',
          100: '#EDF1F7',
          200: '#E1E8F0',
          300: '#C7D2E0',
          400: '#8B95A5',
          500: '#5B6B7D',
          600: '#404E5F',
          700: '#2D3748',
          800: '#1A202C',
          900: '#0F1419'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      borderRadius: {
        lg: '0.75rem',
        md: '0.5rem',
        sm: '0.375rem'
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }
    }
  },
  plugins: []
}
EOF

echo -e "${GREEN}✅ tailwind.config.js creado${NC}"

# Create postcss.config.js
cat > postcss.config.js << 'EOF'
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
}
EOF

echo -e "${GREEN}✅ postcss.config.js creado${NC}"

# Create eslint.config.js
cat > eslint.config.js << 'EOF'
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn'
    }
  }
)
EOF

echo -e "${GREEN}✅ eslint.config.js creado${NC}"

# Create .prettierrc
cat > .prettierrc << 'EOF'
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "plugins": ["prettier-plugin-tailwindcss"]
}
EOF

echo -e "${GREEN}✅ .prettierrc creado${NC}"

# Create .env files
cat > .env.development << 'EOF'
VITE_API_URL=http://localhost:5000/api
VITE_SIGNALR_URL=http://localhost:5000
VITE_AZURE_CLIENT_ID=your-dev-client-id
VITE_AZURE_TENANT_ID=common
VITE_APP_INSIGHTS_CONNECTION_STRING=
EOF

cat > .env.production << 'EOF'
VITE_API_URL=https://api.hergon.com/api
VITE_SIGNALR_URL=https://api.hergon.com
VITE_AZURE_CLIENT_ID=your-prod-client-id
VITE_AZURE_TENANT_ID=your-tenant-id
VITE_APP_INSIGHTS_CONNECTION_STRING=your-connection-string
EOF

cat > .env.example << 'EOF'
# API Configuration
VITE_API_URL=http://localhost:5000/api
VITE_SIGNALR_URL=http://localhost:5000

# Azure AD Configuration
VITE_AZURE_CLIENT_ID=your-client-id
VITE_AZURE_TENANT_ID=common

# Application Insights
VITE_APP_INSIGHTS_CONNECTION_STRING=your-connection-string
EOF

echo -e "${GREEN}✅ Archivos .env creados${NC}"

# Create .gitignore
cat > .gitignore << 'EOF'
# Dependencies
node_modules
/.pnp
.pnp.js

# Testing
/coverage
playwright-report
test-results

# Production
/dist
/build

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode
.idea
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# Misc
*.log
.cache
EOF

echo -e "${GREEN}✅ .gitignore creado${NC}"

# Create index.html
cat > index.html << 'EOF'
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Sistema de Validación CONSAR - Hergon" />
    <title>Hergon - Sistema de Validación</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
EOF

echo -e "${GREEN}✅ index.html creado${NC}"

# Create src/main.tsx
cat > src/main.tsx << 'EOF'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
EOF

echo -e "${GREEN}✅ src/main.tsx creado${NC}"

# Create src/index.css
cat > src/index.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --radius: 0.5rem;
  }

  * {
    @apply border-neutral-200;
  }

  body {
    @apply bg-neutral-50 text-neutral-900 antialiased;
    font-feature-settings: 'rlig' 1, 'calt' 1;
  }
}

@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
}
EOF

echo -e "${GREEN}✅ src/index.css creado${NC}"

# Create src/App.tsx
cat > src/App.tsx << 'EOF'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 3
    }
  }
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-primary-600">Hergon</h1>
          <p className="mt-4 text-2xl text-neutral-600">Sistema de Validación CONSAR</p>
          <p className="mt-2 text-lg text-neutral-500">Frontend inicializado correctamente</p>
          <div className="mt-8 rounded-lg bg-white p-8 shadow-xl">
            <p className="text-neutral-700">
              ✅ React 19 + TypeScript + Vite configurado
            </p>
            <p className="mt-2 text-neutral-700">
              ✅ TanStack Query + Zustand listo
            </p>
            <p className="mt-2 text-neutral-700">
              ✅ Tailwind CSS + shadcn/ui preparado
            </p>
          </div>
        </div>
      </div>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export default App
EOF

echo -e "${GREEN}✅ src/App.tsx creado${NC}"

# Create test setup
cat > tests/setup.ts << 'EOF'
import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

// Cleanup after each test
afterEach(() => {
  cleanup()
})
EOF

echo -e "${GREEN}✅ tests/setup.ts creado${NC}"

# Create Playwright config
cat > playwright.config.ts << 'EOF'
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    }
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI
  }
})
EOF

echo -e "${GREEN}✅ playwright.config.ts creado${NC}"

# Create README
cat > README.md << 'EOF'
# Hergon - Sistema de Validación CONSAR

Aplicación frontend moderna para el sistema de validación automatizada de archivos CONSAR.

## Stack Tecnológico

- **React 19** con TypeScript
- **Vite 6** para desarrollo y build
- **TanStack Query** para manejo de estado del servidor
- **Zustand** para estado de cliente
- **Tailwind CSS** + **shadcn/ui** para UI
- **React Hook Form** + **Zod** para formularios
- **SignalR** para actualizaciones en tiempo real
- **Azure AD (MSAL)** para autenticación

## Desarrollo

```bash
# Instalar dependencias
npm install

# Modo desarrollo
npm run dev

# Build producción
npm run build

# Preview build
npm run preview

# Tests
npm test
npm run test:ui
npm run test:e2e

# Linting
npm run lint
npm run format
```

## Estructura del Proyecto

```
src/
├── app/              # Rutas React Router
├── components/       # Componentes reutilizables
├── features/         # Módulos por funcionalidad
├── lib/             # Utilidades y configuraciones
├── hooks/           # Custom hooks
├── stores/          # Zustand stores
└── types/           # TypeScript types
```

## Variables de Entorno

Copiar `.env.example` a `.env.development` y configurar:

- `VITE_API_URL` - URL del API backend
- `VITE_AZURE_CLIENT_ID` - Azure AD Client ID
- `VITE_AZURE_TENANT_ID` - Azure AD Tenant ID

## Documentación

Ver `docs/ARQUITECTURA_FRONTEND_2024-2026.md` para detalles completos de la arquitectura.
EOF

echo -e "${GREEN}✅ README.md creado${NC}"

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ ¡Proyecto frontend inicializado exitosamente!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}📁 Estructura creada en:${NC} ./app"
echo ""
echo -e "${YELLOW}Próximos pasos:${NC}"
echo ""
echo -e "  1. cd app"
echo -e "  2. Configurar variables de entorno (.env.development)"
echo -e "  3. npm run dev"
echo ""
echo -e "${BLUE}🌐 La aplicación estará disponible en:${NC} http://localhost:3000"
echo ""
echo -e "${YELLOW}Comandos útiles:${NC}"
echo -e "  npm run dev         → Modo desarrollo"
echo -e "  npm test            → Tests unitarios"
echo -e "  npm run test:e2e    → Tests E2E (Playwright)"
echo -e "  npm run lint        → Linting"
echo -e "  npm run format      → Formateo de código"
echo ""
echo -e "${GREEN}¡Happy coding! 🚀${NC}"
echo ""
