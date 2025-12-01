# Politica de Seguridad - Certus App

## Versiones Soportadas

| Version | Soportada          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reportar una Vulnerabilidad

La seguridad de Certus App es una prioridad. Si descubres una vulnerabilidad de seguridad, te pedimos que la reportes de manera responsable.

### Como Reportar

**NO reportes vulnerabilidades de seguridad a traves de issues publicos de GitHub.**

En su lugar, envialas a:

- **Email**: security@hergon.digital
- **Asunto**: [SECURITY] Certus App - Descripcion breve

### Que Incluir

1. **Descripcion**: Descripcion clara de la vulnerabilidad
2. **Pasos para reproducir**: Instrucciones detalladas
3. **Impacto**: Evaluacion del impacto potencial
4. **Browser/OS**: Navegador y sistema operativo afectados
5. **Screenshots/Videos**: Evidencia visual si aplica

## Mejores Practicas de Seguridad

### Para Contribuidores

1. **Nunca commitear secretos**
   - No incluir API keys, tokens, o credenciales
   - Usar variables de entorno (.env)
   - Verificar antes de commit

2. **XSS Prevention**
   - Nunca usar `dangerouslySetInnerHTML` sin sanitizar
   - Usar librerias como DOMPurify si es necesario
   - Validar y escapar input del usuario

3. **CSRF Protection**
   - Incluir tokens CSRF en requests
   - Validar origen de requests

4. **Autenticacion**
   - Usar Azure MSAL para auth
   - Validar tokens en cada request
   - Implementar refresh token correctamente

5. **Datos Sensibles**
   - No almacenar datos sensibles en localStorage
   - Usar sessionStorage o cookies seguras
   - Limpiar datos al logout

### Ejemplo de Codigo Seguro

```tsx
// Correcto: Sanitizar HTML
import DOMPurify from 'dompurify';

const SafeHTML = ({ html }: { html: string }) => (
  <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }} />
);

// Incorrecto: XSS vulnerable
const UnsafeHTML = ({ html }: { html: string }) => (
  <div dangerouslySetInnerHTML={{ __html: html }} />
);
```

```tsx
// Correcto: Validar input
import { z } from 'zod';

const userSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
});

// Incorrecto: Sin validacion
const handleSubmit = (data: any) => {
  api.post('/users', data);
};
```

## Dependencias

- Mantenemos las dependencias actualizadas via Dependabot
- Ejecutamos `npm audit` en CI
- Revisamos actualizaciones de seguridad semanalmente

## Headers de Seguridad

La aplicacion desplegada incluye:

- `Content-Security-Policy`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security`

## Contacto

Para cualquier duda sobre seguridad:

- **Email**: security@hergon.digital
- **Equipo**: @sh-certus/security
