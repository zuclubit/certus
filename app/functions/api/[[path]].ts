// Cloudflare Pages Function - API Proxy
// Proxies requests from HTTPS frontend to HTTP backend
// Fixed: CORS preflight, credentials, content-type handling

const API_BACKEND = 'http://certus-api-dev.eastus2.azurecontainer.io:8080';

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  'https://certus-admin.pages.dev',
  'https://certus-6ob.pages.dev',
  'https://certus-app.pages.dev',
  'https://hergon-certus.pages.dev',
  'https://certus.hergon.digital',
  'https://hergon.pages.dev',
  'http://localhost:3000',
  'http://localhost:5173',
];

interface Env {
  API_BACKEND_URL?: string;
}

// Helper to get CORS headers
function getCorsHeaders(origin: string | null): Headers {
  const headers = new Headers();

  // Check if origin is allowed
  const allowedOrigin = origin && ALLOWED_ORIGINS.some(allowed =>
    origin === allowed || origin.endsWith('.pages.dev')
  ) ? origin : ALLOWED_ORIGINS[0];

  headers.set('Access-Control-Allow-Origin', allowedOrigin);
  headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-Tenant-ID');
  headers.set('Access-Control-Allow-Credentials', 'true');
  headers.set('Access-Control-Expose-Headers', 'X-Pagination, X-Total-Count, X-Request-Id');
  headers.set('Access-Control-Max-Age', '86400');

  return headers;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, params, env } = context;
  const origin = request.headers.get('Origin');

  // Handle CORS preflight FIRST - before any other processing
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: getCorsHeaders(origin),
    });
  }

  // Get the path from the URL
  const path = (params.path as string[])?.join('/') || '';
  const url = new URL(request.url);

  // Use environment variable or default
  const backendUrl = `${env.API_BACKEND_URL || API_BACKEND}/api/${path}${url.search}`;

  // Clone and filter headers
  const headers = new Headers();

  // Forward important headers
  const headersToForward = [
    'content-type',
    'authorization',
    'accept',
    'accept-language',
    'x-tenant-id',
    'x-requested-with',
  ];

  for (const header of headersToForward) {
    const value = request.headers.get(header);
    if (value) {
      headers.set(header, value);
    }
  }

  // Add forwarding headers
  headers.set('X-Forwarded-For', request.headers.get('CF-Connecting-IP') || '');
  headers.set('X-Forwarded-Proto', 'https');

  try {
    // Handle request body based on content type
    let body: BodyInit | null = null;

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      const contentType = request.headers.get('content-type') || '';

      if (contentType.includes('multipart/form-data')) {
        // For file uploads, pass the body as-is
        body = await request.arrayBuffer();
      } else if (contentType.includes('application/json')) {
        body = await request.text();
      } else {
        body = await request.text();
      }
    }

    const response = await fetch(backendUrl, {
      method: request.method,
      headers: headers,
      body: body,
    });

    // Create response headers with CORS
    const responseHeaders = getCorsHeaders(origin);

    // Copy response headers (except CORS ones we set ourselves)
    response.headers.forEach((value, key) => {
      const lowerKey = key.toLowerCase();
      if (!lowerKey.startsWith('access-control-')) {
        responseHeaders.set(key, value);
      }
    });

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('Proxy error:', error);

    const errorHeaders = getCorsHeaders(origin);
    errorHeaders.set('Content-Type', 'application/json');

    return new Response(JSON.stringify({
      type: 'https://certus.mx/errors/proxy',
      title: 'Backend Unavailable',
      status: 502,
      detail: error instanceof Error ? error.message : 'Unknown error',
      instance: `/api/${path}`,
    }), {
      status: 502,
      headers: errorHeaders,
    });
  }
};
