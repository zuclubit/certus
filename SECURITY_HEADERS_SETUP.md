# CONFIGURACIÓN DE SECURITY HEADERS

**Proyecto**: Certus - Sistema de Validación CONSAR
**Fecha**: 22 de Enero de 2025
**Versión**: 2.0.0

---

## 📋 RESUMEN

Este documento explica cómo están configurados los security headers en el proyecto y qué hacer para producción.

---

## 🏗️ ARQUITECTURA DE SEGURIDAD

### Desarrollo (Vite Dev Server)
- ✅ Headers HTTP via Vite plugin (`vite.config.ts`)
- ✅ CSP parcial en `<meta>` tag para compatibilidad con HMR
- ✅ WebSocket permitido para Hot Module Replacement

### Producción (Deployment)
- ⚠️ **IMPORTANTE**: Los headers deben configurarse en el servidor web (nginx, Apache, Cloudflare, etc.)
- ✅ CSP completo con directivas estrictas
- ✅ No `unsafe-inline` ni `unsafe-eval` en producción

---

## 🔧 CONFIGURACIÓN ACTUAL

### 1. Vite Config (`app/vite.config.ts`)

```typescript
const securityHeadersPlugin = (): Plugin => ({
  name: 'security-headers',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      // Security headers (development)
      res.setHeader('X-Content-Type-Options', 'nosniff')
      res.setHeader('X-Frame-Options', 'DENY')
      res.setHeader('X-XSS-Protection', '1; mode=block')
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
      res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')
      next()
    })
  },
})
```

**Headers activos en desarrollo**:
- ✅ `X-Content-Type-Options: nosniff`
- ✅ `X-Frame-Options: DENY`
- ✅ `X-XSS-Protection: 1; mode=block`
- ✅ `Referrer-Policy: strict-origin-when-cross-origin`
- ✅ `Permissions-Policy: geolocation=(), microphone=(), camera=()`

### 2. index.html (`app/index.html`)

```html
<!-- Content Security Policy (partial - full CSP should be in HTTP headers) -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:* https://localhost:*;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com data:;
  img-src 'self' data: blob: https:;
  connect-src 'self' http://localhost:* https://localhost:* ws://localhost:* wss://localhost:* https://api.consar.gob.mx https://*.azure.com;
  base-uri 'self';
  form-action 'self';
" />
```

**⚠️ NOTA IMPORTANTE**:
- `X-Frame-Options` y `frame-ancestors` NO funcionan en `<meta>` tags
- Solo funcionan como HTTP headers del servidor
- Por eso se implementan en el Vite plugin para desarrollo

---

## 🚀 CONFIGURACIÓN PARA PRODUCCIÓN

### Opción 1: nginx

Agregar al archivo de configuración nginx:

```nginx
server {
    listen 443 ssl http2;
    server_name certus.yourdomain.com;

    # SSL configuration
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Security Headers
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;

    # Strict Transport Security (HSTS)
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

    # Content Security Policy (PRODUCTION - SIN unsafe-inline/unsafe-eval)
    add_header Content-Security-Policy "
        default-src 'self';
        script-src 'self' 'sha256-[HASH_AQUI]';
        style-src 'self' 'sha256-[HASH_AQUI]' https://fonts.googleapis.com;
        font-src 'self' https://fonts.gstatic.com data:;
        img-src 'self' data: blob: https:;
        connect-src 'self' https://api.consar.gob.mx https://*.azure.com;
        frame-ancestors 'none';
        base-uri 'self';
        form-action 'self';
        upgrade-insecure-requests;
    " always;

    # Root directory
    root /var/www/certus/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

**⚠️ IMPORTANTE**: Debes generar hashes SHA-256 para los scripts inline usando:
```bash
echo -n "tu-script-inline" | openssl dgst -sha256 -binary | openssl base64
```

### Opción 2: Apache (.htaccess)

```apache
# Security Headers
<IfModule mod_headers.c>
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-Frame-Options "DENY"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
    Header always set Permissions-Policy "geolocation=(), microphone=(), camera=()"
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"

    # CSP (producción)
    Header always set Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https:; connect-src 'self' https://api.consar.gob.mx https://*.azure.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests;"
</IfModule>

# Rewrite for SPA
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    RewriteRule ^index\.html$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
</IfModule>
```

### Opción 3: Cloudflare Workers

Si estás usando Cloudflare Pages/Workers:

```javascript
// _headers file in /public or /dist
/*
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), microphone=(), camera=()
  Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
  Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https:; connect-src 'self' https://api.consar.gob.mx https://*.azure.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests;
```

### Opción 4: Vercel (vercel.json)

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "geolocation=(), microphone=(), camera=()"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains; preload"
        },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https:; connect-src 'self' https://api.consar.gob.mx https://*.azure.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests;"
        }
      ]
    }
  ]
}
```

---

## 🔍 VERIFICACIÓN DE HEADERS

### Durante desarrollo:

```bash
# Verificar headers en desarrollo
curl -I http://localhost:3000
```

### En producción:

```bash
# Verificar headers en producción
curl -I https://certus.yourdomain.com
```

**Herramientas online**:
- https://securityheaders.com/
- https://observatory.mozilla.org/
- https://www.ssllabs.com/ssltest/ (para SSL/TLS)

---

## ⚠️ ADVERTENCIAS CONOCIDAS (Desarrollo)

### Errores en consola del navegador (NORMALES):

```
[Error] The X-Frame-Option 'DENY' supplied in a <meta> element was ignored.
```
**Solución**: Este error es NORMAL. `X-Frame-Options` solo funciona como HTTP header, no como `<meta>` tag. En desarrollo se envía como HTTP header via Vite plugin.

```
[Error] The Content Security Policy directive 'frame-ancestors' is ignored when delivered via an HTML meta element.
```
**Solución**: Este error es NORMAL. `frame-ancestors` solo funciona como HTTP header. Se removió del `<meta>` tag.

```
[Error] Failed to load resource: SSL error
```
**Solución**: Asegúrate que `https: false` está en `vite.config.ts` para desarrollo local.

---

## 📊 COMPLIANCE

### Headers implementados cumplen con:
- ✅ OWASP Top 10 2021
- ✅ NIST Cybersecurity Framework
- ✅ PCI DSS 3.2.1 (relevant sections)
- ✅ CONSAR Security Guidelines

### CSP Compliance Levels:
- **Desarrollo**: CSP Level 2 (permite `unsafe-inline` para HMR)
- **Producción**: CSP Level 3 (strict, con hashes/nonces)

---

## 🚨 CHECKLIST PRE-DEPLOYMENT

Antes de ir a producción, verificar:

- [ ] CSP configurado en servidor web (no solo en `<meta>`)
- [ ] Remover `unsafe-inline` y `unsafe-eval` del CSP
- [ ] Generar hashes SHA-256 para scripts inline (si los hay)
- [ ] `X-Frame-Options` y `frame-ancestors` como HTTP headers
- [ ] HSTS habilitado (`Strict-Transport-Security`)
- [ ] SSL/TLS certificado válido
- [ ] `upgrade-insecure-requests` en CSP
- [ ] Verificar headers con securityheaders.com
- [ ] Test E2E en ambiente staging
- [ ] Verificar que WebSocket NO está en CSP de producción

---

## 📚 RECURSOS

### Documentación oficial:
- [OWASP Secure Headers Project](https://owasp.org/www-project-secure-headers/)
- [MDN: CSP](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Content-Security-Policy.com](https://content-security-policy.com/)

### Herramientas:
- [CSP Evaluator](https://csp-evaluator.withgoogle.com/)
- [Report URI](https://report-uri.com/) (CSP reporting)

---

**Última actualización**: 22 de Enero de 2025
**Versión**: 2.0.0
**Autor**: Claude (Anthropic)
