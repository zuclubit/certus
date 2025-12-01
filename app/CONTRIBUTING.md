# Guia de Contribucion - Certus App

Gracias por tu interes en contribuir a Certus App. Este documento proporciona las guias y mejores practicas para contribuir al proyecto frontend.

## Tabla de Contenidos

- [Codigo de Conducta](#codigo-de-conducta)
- [Configuracion del Entorno](#configuracion-del-entorno)
- [Estandares de Codigo](#estandares-de-codigo)
- [Componentes](#componentes)
- [Testing](#testing)
- [Commits](#commits)

## Codigo de Conducta

Este proyecto sigue un codigo de conducta profesional. Esperamos que todos los contribuidores sean respetuosos y profesionales.

## Configuracion del Entorno

### Prerrequisitos

- Node.js 20+
- npm 10+
- VS Code (recomendado)

### Extensiones de VS Code Recomendadas

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript Importer
- Auto Rename Tag

### Setup Local

```bash
# Clonar el repositorio
git clone https://github.com/sh-certus/certus-app.git
cd certus-app

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.development

# Iniciar desarrollo
npm run dev
```

## Estandares de Codigo

### TypeScript

- Usar tipos estrictos, evitar `any`
- Definir interfaces para props de componentes
- Usar enums para valores constantes

```typescript
// Correcto
interface UserCardProps {
  user: User;
  onSelect: (id: string) => void;
}

// Incorrecto
interface UserCardProps {
  user: any;
  onSelect: Function;
}
```

### React

- Usar componentes funcionales con hooks
- Aplicar React.memo para optimizacion cuando sea necesario
- Usar custom hooks para logica reutilizable

```tsx
// Correcto
export const UserCard = memo(function UserCard({ user, onSelect }: UserCardProps) {
  const handleClick = useCallback(() => {
    onSelect(user.id);
  }, [user.id, onSelect]);

  return (
    <Card onClick={handleClick}>
      <h3>{user.name}</h3>
    </Card>
  );
});

// Incorrecto
export const UserCard = (props: any) => {
  return (
    <div onClick={() => props.onSelect(props.user.id)}>
      {props.user.name}
    </div>
  );
};
```

### Styling con Tailwind

- Usar el design system existente
- Evitar estilos inline
- Agrupar clases logicamente

```tsx
// Correcto
<div className={cn(
  "flex items-center gap-4",
  "rounded-lg border border-border",
  "p-4 bg-card",
  "hover:bg-accent transition-colors"
)}>

// Incorrecto
<div style={{ display: 'flex', padding: '16px' }}>
```

### Imports

Ordenar imports en este orden:
1. React y librerias externas
2. Componentes
3. Hooks
4. Utils y types
5. Styles

```typescript
// React y librerias
import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';

// Componentes
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// Hooks
import { useValidations } from '@/hooks/useValidations';

// Utils y types
import { formatDate } from '@/lib/utils';
import type { Validation } from '@/types';
```

## Componentes

### Estructura de Archivos

```
src/components/validations/
├── ValidationCard.tsx       # Componente principal
├── ValidationCard.test.tsx  # Tests
├── index.ts                 # Export
└── types.ts                 # Types locales (si aplica)
```

### Nomenclatura

- Componentes: PascalCase (`ValidationCard`)
- Hooks: camelCase con prefijo `use` (`useValidations`)
- Utils: camelCase (`formatCurrency`)
- Types/Interfaces: PascalCase (`ValidationStatus`)

### Ejemplo de Componente

```tsx
import { memo } from 'react';
import { cn } from '@/lib/utils';
import type { ValidationCardProps } from './types';

export const ValidationCard = memo(function ValidationCard({
  validation,
  className,
  onSelect,
}: ValidationCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card p-4",
        "hover:border-primary transition-colors",
        className
      )}
      onClick={() => onSelect?.(validation.id)}
    >
      <h3 className="font-semibold">{validation.fileName}</h3>
      <p className="text-sm text-muted-foreground">
        {validation.status}
      </p>
    </div>
  );
});

ValidationCard.displayName = 'ValidationCard';
```

## State Management

### Zustand para Estado Global

```typescript
import { create } from 'zustand';

interface AppState {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useAppStore = create<AppState>((set) => ({
  theme: 'light',
  setTheme: (theme) => set({ theme }),
}));
```

### React Query para Datos del Servidor

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';

export function useValidations() {
  return useQuery({
    queryKey: ['validations'],
    queryFn: fetchValidations,
    staleTime: 5 * 60 * 1000,
  });
}
```

## Testing

### Tests Unitarios

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ValidationCard } from './ValidationCard';

describe('ValidationCard', () => {
  const mockValidation = {
    id: '1',
    fileName: 'test.txt',
    status: 'completed',
  };

  it('renders validation info', () => {
    render(<ValidationCard validation={mockValidation} />);
    expect(screen.getByText('test.txt')).toBeInTheDocument();
  });

  it('calls onSelect when clicked', async () => {
    const onSelect = vi.fn();
    render(<ValidationCard validation={mockValidation} onSelect={onSelect} />);

    await userEvent.click(screen.getByText('test.txt'));
    expect(onSelect).toHaveBeenCalledWith('1');
  });
});
```

### Tests E2E

```typescript
import { test, expect } from '@playwright/test';

test('user can view validations', async ({ page }) => {
  await page.goto('/validations');
  await expect(page.getByRole('heading', { name: 'Validaciones' })).toBeVisible();
});
```

## Commits

### Formato de Commits

Seguimos [Conventional Commits](https://www.conventionalcommits.org/):

```
<tipo>(<alcance>): <descripcion>
```

### Tipos de Commit

- `feat`: Nueva funcionalidad
- `fix`: Correccion de bug
- `docs`: Documentacion
- `style`: Cambios de formato/estilo
- `refactor`: Refactoring
- `test`: Tests
- `chore`: Tareas de mantenimiento

### Ejemplos

```bash
feat(validations): add file preview component
fix(auth): resolve token refresh issue
style(ui): update button hover states
refactor(hooks): simplify useValidations logic
test(dashboard): add unit tests for metrics
```

## Preguntas?

Si tienes dudas, puedes:
- Abrir un Discussion en GitHub
- Contactar al equipo en soporte@hergon.digital
