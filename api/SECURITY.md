# Politica de Seguridad - Certus API

## Versiones Soportadas

| Version | Soportada          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reportar una Vulnerabilidad

La seguridad de Certus API es una prioridad. Si descubres una vulnerabilidad de seguridad, te pedimos que la reportes de manera responsable.

### Como Reportar

**NO reportes vulnerabilidades de seguridad a traves de issues publicos de GitHub.**

En su lugar, envialas a:

- **Email**: security@hergon.digital
- **Asunto**: [SECURITY] Certus API - Descripcion breve

### Que Incluir en el Reporte

1. **Descripcion**: Descripcion clara de la vulnerabilidad
2. **Pasos para reproducir**: Instrucciones detalladas
3. **Impacto**: Evaluacion del impacto potencial
4. **Prueba de concepto**: Si es posible, codigo o evidencia
5. **Sugerencias**: Ideas para mitigar o resolver

### Proceso de Respuesta

1. **Confirmacion**: Confirmaremos la recepcion en 24 horas
2. **Evaluacion**: Evaluaremos la vulnerabilidad en 72 horas
3. **Actualizacion**: Te mantendremos informado del progreso
4. **Resolucion**: Trabajaremos en una solucion
5. **Divulgacion**: Coordinada una vez resuelto

### Tiempo de Respuesta Esperado

- **Severidad Critica**: 24-48 horas
- **Severidad Alta**: 72 horas
- **Severidad Media**: 1 semana
- **Severidad Baja**: 2 semanas

## Mejores Practicas de Seguridad

### Para Contribuidores

1. **Nunca commitear secretos**
   - No incluir API keys, passwords, o tokens
   - Usar variables de entorno o Azure Key Vault
   - Verificar con `git diff` antes de commit

2. **Validacion de entrada**
   - Siempre validar entrada del usuario
   - Usar FluentValidation para requests
   - Sanitizar datos antes de procesarlos

3. **Autenticacion y Autorizacion**
   - Usar atributos `[Authorize]` en endpoints
   - Verificar permisos especificos con policies
   - No confiar en datos del cliente

4. **SQL Injection**
   - Usar Entity Framework con parametros
   - Nunca concatenar strings para queries
   - Revisar queries raw SQL

5. **Logging**
   - No loguear informacion sensible
   - Usar Serilog con destructuring seguro
   - Enmascarar datos PII

### Ejemplo de Codigo Seguro

```csharp
// Correcto: Usar parametros
var users = await _context.Users
    .Where(u => u.Email == email)
    .ToListAsync();

// Incorrecto: Vulnerable a SQL Injection
var users = await _context.Users
    .FromSqlRaw($"SELECT * FROM Users WHERE Email = '{email}'")
    .ToListAsync();
```

## Dependencias

- Mantenemos las dependencias actualizadas via Dependabot
- Ejecutamos escaneo de vulnerabilidades en CI
- Revisamos actualizaciones de seguridad semanalmente

## Configuracion de Seguridad

### Headers de Seguridad

La API incluye los siguientes headers:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=31536000`

### CORS

- Solo origenes permitidos en configuracion
- No usar `*` en produccion

### Rate Limiting

- Implementado para prevenir abuse
- Configurable por endpoint

## Contacto

Para cualquier duda sobre seguridad:

- **Email**: security@hergon.digital
- **Equipo**: @sh-certus/security

## Reconocimientos

Agradecemos a quienes han reportado vulnerabilidades responsablemente:

*Esta seccion se actualizara con contribuidores de seguridad.*
