import { w as sanitize_props, x as spread_props, v as slot, N as head, F as ensure_array_like, z as attr_class, J as stringify } from "../../../chunks/index.js";
import { A as Activity, C as Calendar, L as Layers, U as Users, T as Target } from "../../../chunks/users.js";
import { I as Icon, b as Clock, C as Chevron_down, c as Server, a as Circle_check_big, S as Shield, T as Trending_up, D as Database } from "../../../chunks/trending-up.js";
import { S as Smartphone, R as Rocket, P as Package, F as File_code } from "../../../chunks/smartphone.js";
import { k as escape_html } from "../../../chunks/context.js";
function Cloud_cog($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const iconNode = [
    ["path", { "d": "m10.852 19.772-.383.924" }],
    ["path", { "d": "m13.148 14.228.383-.923" }],
    [
      "path",
      { "d": "M13.148 19.772a3 3 0 1 0-2.296-5.544l-.383-.923" }
    ],
    [
      "path",
      { "d": "m13.53 20.696-.382-.924a3 3 0 1 1-2.296-5.544" }
    ],
    ["path", { "d": "m14.772 15.852.923-.383" }],
    ["path", { "d": "m14.772 18.148.923.383" }],
    [
      "path",
      {
        "d": "M4.2 15.1a7 7 0 1 1 9.93-9.858A7 7 0 0 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.2"
      }
    ],
    ["path", { "d": "m9.228 15.852-.923-.383" }],
    ["path", { "d": "m9.228 18.148-.923.383" }]
  ];
  Icon($$renderer, spread_props([
    { name: "cloud-cog" },
    $$sanitized_props,
    {
      /**
       * @component @name CloudCog
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJtMTAuODUyIDE5Ljc3Mi0uMzgzLjkyNCIgLz4KICA8cGF0aCBkPSJtMTMuMTQ4IDE0LjIyOC4zODMtLjkyMyIgLz4KICA8cGF0aCBkPSJNMTMuMTQ4IDE5Ljc3MmEzIDMgMCAxIDAtMi4yOTYtNS41NDRsLS4zODMtLjkyMyIgLz4KICA8cGF0aCBkPSJtMTMuNTMgMjAuNjk2LS4zODItLjkyNGEzIDMgMCAxIDEtMi4yOTYtNS41NDQiIC8+CiAgPHBhdGggZD0ibTE0Ljc3MiAxNS44NTIuOTIzLS4zODMiIC8+CiAgPHBhdGggZD0ibTE0Ljc3MiAxOC4xNDguOTIzLjM4MyIgLz4KICA8cGF0aCBkPSJNNC4yIDE1LjFhNyA3IDAgMSAxIDkuOTMtOS44NThBNyA3IDAgMCAxIDE1LjcxIDhoMS43OWE0LjUgNC41IDAgMCAxIDIuNSA4LjIiIC8+CiAgPHBhdGggZD0ibTkuMjI4IDE1Ljg1Mi0uOTIzLS4zODMiIC8+CiAgPHBhdGggZD0ibTkuMjI4IDE4LjE0OC0uOTIzLjM4MyIgLz4KPC9zdmc+Cg==) - https://lucide.dev/icons/cloud-cog
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      iconNode,
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {});
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function Code_xml($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const iconNode = [
    ["path", { "d": "m18 16 4-4-4-4" }],
    ["path", { "d": "m6 8-4 4 4 4" }],
    ["path", { "d": "m14.5 4-5 16" }]
  ];
  Icon($$renderer, spread_props([
    { name: "code-xml" },
    $$sanitized_props,
    {
      /**
       * @component @name CodeXml
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJtMTggMTYgNC00LTQtNCIgLz4KICA8cGF0aCBkPSJtNiA4LTQgNCA0IDQiIC8+CiAgPHBhdGggZD0ibTE0LjUgNC01IDE2IiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/code-xml
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      iconNode,
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {});
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function Terminal($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const iconNode = [
    ["path", { "d": "M12 19h8" }],
    ["path", { "d": "m4 17 6-6-6-6" }]
  ];
  Icon($$renderer, spread_props([
    { name: "terminal" },
    $$sanitized_props,
    {
      /**
       * @component @name Terminal
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMTIgMTloOCIgLz4KICA8cGF0aCBkPSJtNCAxNyA2LTYtNi02IiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/terminal
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      iconNode,
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {});
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function Workflow($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const iconNode = [
    [
      "rect",
      { "width": "8", "height": "8", "x": "3", "y": "3", "rx": "2" }
    ],
    ["path", { "d": "M7 11v4a2 2 0 0 0 2 2h4" }],
    [
      "rect",
      { "width": "8", "height": "8", "x": "13", "y": "13", "rx": "2" }
    ]
  ];
  Icon($$renderer, spread_props([
    { name: "workflow" },
    $$sanitized_props,
    {
      /**
       * @component @name Workflow
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiB4PSIzIiB5PSIzIiByeD0iMiIgLz4KICA8cGF0aCBkPSJNNyAxMXY0YTIgMiAwIDAgMCAyIDJoNCIgLz4KICA8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiB4PSIxMyIgeT0iMTMiIHJ4PSIyIiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/workflow
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      iconNode,
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {});
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function _page($$renderer) {
  const roadmapPhases = [
    {
      phase: "Fundación",
      month: "Diciembre 2025",
      duration: "2-3 semanas",
      icon: Database,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      textColor: "text-blue-700",
      components: [
        {
          name: "Infraestructura AWS Base",
          type: "Infrastructure",
          stack: ["Terraform", "AWS VPC", "Security Groups", "IAM"],
          responsibility: "Red privada multi-AZ, segmentación por capas (pública, app, datos)",
          effort: "3-5 días",
          technical: "VPC con 3 AZs, subnets públicas/privadas, NAT Gateways, VPC Endpoints (S3, DynamoDB)",
          priority: "Crítico"
        },
        {
          name: "PostgreSQL RDS - Catálogo",
          type: "Database",
          stack: ["PostgreSQL 16", "RDS Graviton4", "Flyway"],
          responsibility: "AFOREs, usuarios, archivos metadata, catálogos normativos",
          effort: "2-3 días",
          technical: "db.r7g.large Multi-AZ, Row-Level Security por AFORE, índices en aforeId + fecha",
          priority: "Crítico"
        },
        {
          name: "PostgreSQL RDS - Validación",
          type: "Database",
          stack: ["PostgreSQL 16", "RDS Graviton4", "Flyway"],
          responsibility: "Reglas CONSAR, resultados de validación, históricos 7+ años",
          effort: "2-3 días",
          technical: "db.r7g.xlarge Multi-AZ, particionamiento por fecha, optimización queries pesadas",
          priority: "Crítico"
        },
        {
          name: "DynamoDB Event Store",
          type: "NoSQL",
          stack: ["DynamoDB", "Event Sourcing", "AWS SDK"],
          responsibility: "Audit trail inmutable, compliance CONSAR (7 años)",
          effort: "1-2 días",
          technical: "TTL 2555 días, GSI por eventType/aforeId, DynamoDB Streams habilitado",
          priority: "Crítico"
        },
        {
          name: "ElastiCache Redis",
          type: "Cache",
          stack: ["Redis 7", "Graviton3", "StackExchange.Redis"],
          responsibility: "Cache distribuido, sesiones, rate limiting, catálogos hot",
          effort: "1 día",
          technical: "cache.r7g.large, cluster mode, auth token, encriptación in-transit",
          priority: "Alto"
        }
      ]
    },
    {
      phase: "Core Backend",
      month: "Enero - Marzo 2026",
      duration: "10-12 semanas",
      icon: Server,
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      textColor: "text-purple-700",
      components: [
        {
          name: "API Gateway + JWT Authorizer",
          type: "API Gateway",
          stack: ["AWS API Gateway v2", "Azure AD", "JWT", "WAF"],
          responsibility: "Routing, autenticación Azure AD, rate limiting 2000 req/s",
          effort: "2 días",
          technical: "VPC Link a ALB, JWT issuer validation, throttling por ambiente, WAF rules",
          priority: "Crítico"
        },
        {
          name: "Authentication Service",
          type: "Microservice",
          stack: [".NET 8", "Azure.Identity", "JWT", "Redis"],
          responsibility: "Validación tokens, extracción claims (aforeId, role), autorización",
          effort: "3-5 días",
          technical: "Middleware custom, cache JWKS keys (1h TTL), Row-Level Security injection",
          priority: "Crítico"
        },
        {
          name: "Catalog Service",
          type: "Microservice",
          stack: [".NET 8", "EF Core", "Dapper", "MediatR"],
          responsibility: "CRUD AFOREs, usuarios, archivos, catálogos normativos",
          effort: "5-7 días",
          technical: "ECS Fargate ARM64, CQRS pattern, health checks /health, Redis caching layer",
          priority: "Crítico"
        },
        {
          name: "File Upload Service",
          type: "Microservice",
          stack: [".NET 8", "AWSSDK.S3", "Multipart Upload"],
          responsibility: "Upload archivos CONSAR TXT a S3, validación formato, metadata DB",
          effort: "3-5 días",
          technical: "Chunk upload 5MB, progress tracking, S3 presigned URLs, max 500MB, virus scan",
          priority: "Alto"
        },
        {
          name: "Validation Engine",
          type: "Microservice",
          stack: [".NET 8", "MediatR", "SQS", "EventBridge"],
          responsibility: "Orquestación 37 validadores, dispatch asíncrono, resultados agregados",
          effort: "5-7 días",
          technical: "CQRS commands, idempotencia con correlation IDs, saga pattern para rollback",
          priority: "Crítico"
        },
        {
          name: "Lambda Validators (37 reglas)",
          type: "Serverless",
          stack: [".NET 8 Lambda", "ARM64", "SnapStart", "Dapper"],
          responsibility: "Estructura, formato, reglas negocio, integridad, consistencia",
          effort: "12-15 días",
          technical: "Provisioned concurrency=10, timeout 5 min, memoria 1GB, batch processing",
          priority: "Crítico"
        }
      ]
    },
    {
      phase: "Frontend & UX",
      month: "Abril - Mayo 2026",
      duration: "7-9 semanas",
      icon: Smartphone,
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      textColor: "text-green-700",
      components: [
        {
          name: "Web App Core (React)",
          type: "Frontend",
          stack: ["React 18", "TypeScript", "Vite", "TanStack Query"],
          responsibility: "SPA para AFOREs, dashboard validaciones, reportes, audit trail",
          effort: "10-15 días",
          technical: "S3 + CloudFront hosting, code splitting, React.lazy(), service workers PWA",
          priority: "Crítico"
        },
        {
          name: "Authentication UI (Azure AD)",
          type: "Frontend",
          stack: ["@azure/msal-react", "PKCE flow", "React Context"],
          responsibility: "Login Azure AD B2C, refresh tokens, logout, session management",
          effort: "3-5 días",
          technical: "PKCE flow, silent refresh, secure storage tokens, MFA support",
          priority: "Crítico"
        },
        {
          name: "File Upload UI",
          type: "Frontend",
          stack: ["react-dropzone", "axios", "Web Workers"],
          responsibility: "Drag & drop archivos, progress bar, validación client-side",
          effort: "3-5 días",
          technical: "Chunk upload paralelo, file type validation, preview metadata, retry logic",
          priority: "Alto"
        },
        {
          name: "Dashboard Validaciones",
          type: "Frontend",
          stack: ["Recharts", "TanStack Table", "WebSocket"],
          responsibility: "Vista real-time validaciones, métricas, gráficas cumplimiento",
          effort: "5-7 días",
          technical: "Real-time updates (polling 5s), filtros avanzados, paginación server-side",
          priority: "Alto"
        },
        {
          name: "Admin Panel",
          type: "Frontend",
          stack: ["React", "Ant Design", "React Router"],
          responsibility: "Gestión usuarios, AFOREs, configuración reglas, audit logs",
          effort: "7-10 días",
          technical: "RBAC roles (admin, operator, viewer), gestión catálogos normativos",
          priority: "Medio"
        }
      ]
    },
    {
      phase: "Testing & QA",
      month: "Junio 2026",
      duration: "4-5 semanas",
      icon: Target,
      color: "from-orange-500 to-red-500",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      textColor: "text-orange-700",
      components: [
        {
          name: "Unit Tests Backend",
          type: "Testing",
          stack: ["xUnit", "Moq", "FluentAssertions", "Testcontainers"],
          responsibility: "Tests servicios, validadores, helpers, coverage >80%",
          effort: "5-7 días",
          technical: "AAA pattern, test doubles AWS services, parallel execution",
          priority: "Crítico"
        },
        {
          name: "Integration Tests",
          type: "Testing",
          stack: ["xUnit", "Testcontainers", "LocalStack", "WireMock"],
          responsibility: "Tests integración DB, S3, SQS, DynamoDB, API Gateway",
          effort: "7-10 días",
          technical: "Testcontainers PostgreSQL/Redis, LocalStack para AWS, fixtures factories",
          priority: "Crítico"
        },
        {
          name: "E2E Tests Frontend",
          type: "Testing",
          stack: ["Playwright", "TypeScript", "CI/CD"],
          responsibility: "Tests end-to-end flujos usuario, upload, validación, reportes",
          effort: "5-7 días",
          technical: "Screenshots on failure, videos, parallel browsers, retry flaky tests",
          priority: "Alto"
        },
        {
          name: "Load Testing",
          type: "Testing",
          stack: ["k6", "Grafana", "Artillery"],
          responsibility: "Stress testing, capacity planning, 1000 validaciones/día",
          effort: "3-5 días",
          technical: "Simular 10 AFOREs concurrentes, ramp-up gradual, métricas p99 latency",
          priority: "Alto"
        }
      ]
    },
    {
      phase: "DevOps & Security",
      month: "Julio 2026",
      duration: "4-5 semanas",
      icon: Cloud_cog,
      color: "from-indigo-500 to-blue-500",
      bgColor: "bg-indigo-50",
      borderColor: "border-indigo-200",
      textColor: "text-indigo-700",
      components: [
        {
          name: "CI/CD Pipelines",
          type: "DevOps",
          stack: ["GitHub Actions", "Docker ARM64", "ECR", "ECS"],
          responsibility: "Build, test, deploy automático backend/frontend/Lambda",
          effort: "3-5 días",
          technical: "Multi-stage builds, semantic versioning, blue-green deploy, rollback automático",
          priority: "Crítico"
        },
        {
          name: "Database Migrations",
          type: "DevOps",
          stack: ["Flyway", "PostgreSQL", "GitHub Actions"],
          responsibility: "Migrations versionadas, rollback, validación en staging",
          effort: "2-3 días",
          technical: "Migrations por ambiente, validación pre-prod, backup antes de aplicar",
          priority: "Alto"
        },
        {
          name: "Security Audit",
          type: "Security",
          stack: ["AWS Config", "Prowler", "OWASP ZAP"],
          responsibility: "Auditoría seguridad, compliance checks, pentesting",
          effort: "3-5 días",
          technical: "Checks encryption, IAM policies, public access, SQL injection, XSS, CSRF",
          priority: "Crítico"
        },
        {
          name: "Secrets Rotation",
          type: "DevOps",
          stack: ["Secrets Manager", "Lambda", "EventBridge"],
          responsibility: "Rotación automática passwords, client secrets cada 90 días",
          effort: "2-3 días",
          technical: "Zero-downtime rotation, validación post-rotation, alertas fallos",
          priority: "Alto"
        }
      ]
    },
    {
      phase: "Pre-Production",
      month: "Agosto 2026",
      duration: "3-4 semanas",
      icon: File_code,
      color: "from-pink-500 to-rose-500",
      bgColor: "bg-pink-50",
      borderColor: "border-pink-200",
      textColor: "text-pink-700",
      components: [
        {
          name: "API Documentation",
          type: "Documentation",
          stack: ["OpenAPI 3.0", "Swagger", "Redoc", "Postman"],
          responsibility: "Docs APIs REST, ejemplos requests/responses, autenticación",
          effort: "3-5 días",
          technical: "OpenAPI spec automática, ejemplos código cURL/Python/.NET, Try it out",
          priority: "Alto"
        },
        {
          name: "User Manuals",
          type: "Documentation",
          stack: ["Markdown", "Docusaurus", "Videos"],
          responsibility: "Manuales usuario AFOREs, troubleshooting guides",
          effort: "5-7 días",
          technical: "Screenshots, videos tutoriales, FAQ, soporte multi-idioma",
          priority: "Alto"
        },
        {
          name: "Team Training",
          type: "Training",
          stack: ["Workshops", "Documentation", "Hands-on"],
          responsibility: "Capacitación equipo técnico en arquitectura, ops, troubleshooting",
          effort: "3-5 días",
          technical: "AWS services, monitoring dashboards, incident response, escalation",
          priority: "Alto"
        },
        {
          name: "Staging Validation",
          type: "Validation",
          stack: ["Manual Testing", "Real Data", "Performance"],
          responsibility: "Validación completa staging con datos reales AFOREs",
          effort: "5-7 días",
          technical: "Tests con archivos reales, validación 37 reglas, performance baselines",
          priority: "Crítico"
        }
      ]
    },
    {
      phase: "Production Launch",
      month: "Septiembre 2026",
      duration: "2-3 semanas",
      icon: Rocket,
      color: "from-yellow-500 to-amber-500",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      textColor: "text-yellow-700",
      components: [
        {
          name: "Production Deployment",
          type: "Deployment",
          stack: ["Terraform", "AWS", "Blue-Green"],
          responsibility: "Despliegue producción con rollback plan, monitoreo 24/7",
          effort: "3-5 días",
          technical: "Blue-green deployment, smoke tests post-deploy, backup RDS, rollback plan",
          priority: "Crítico"
        },
        {
          name: "First AFORE Onboarding",
          type: "Operations",
          stack: ["Training", "Support", "Monitoring"],
          responsibility: "Onboarding primera AFORE, configuración, capacitación",
          effort: "3-5 días",
          technical: "SSO setup, user provisioning, data migration, validation rules tuning",
          priority: "Crítico"
        },
        {
          name: "Hypercare Period",
          type: "Operations",
          stack: ["CloudWatch", "PagerDuty", "On-call"],
          responsibility: "Monitoreo intensivo 24/7, respuesta rápida incidentes",
          effort: "14-30 días",
          technical: "Equipo on-call, análisis diario métricas, ajustes performance, hotfixes",
          priority: "Crítico"
        }
      ]
    },
    {
      phase: "Post-Launch",
      month: "Octubre 2026+",
      duration: "Continuo",
      icon: Trending_up,
      color: "from-teal-500 to-cyan-500",
      bgColor: "bg-teal-50",
      borderColor: "border-teal-200",
      textColor: "text-teal-700",
      components: [
        {
          name: "Performance Optimization",
          type: "Optimization",
          stack: ["CloudWatch", "X-Ray", "Profiling"],
          responsibility: "Optimización basada en métricas reales producción",
          effort: "Continuo",
          technical: "Query optimization, cache tuning, right-sizing instances, CDN optimization",
          priority: "Alto"
        },
        {
          name: "Cost Optimization",
          type: "FinOps",
          stack: ["AWS Cost Explorer", "Savings Plans", "Reserved Instances"],
          responsibility: "Análisis costos, Savings Plans, rightsizing recursos",
          effort: "Continuo",
          technical: "Identificar recursos idle, commitment discounts, spot instances evaluación",
          priority: "Medio"
        },
        {
          name: "Feature Expansion",
          type: "Development",
          stack: ["Roadmap", "User Feedback", "Agile"],
          responsibility: "Nuevas features basadas en feedback AFOREs, expansión países",
          effort: "Continuo",
          technical: "Chile/Colombia/Perú rules, ML validación predictiva, API v2 GraphQL",
          priority: "Alto"
        }
      ]
    }
  ];
  const keyMetrics = [
    {
      label: "Duración Total",
      value: "9-10 meses",
      icon: Calendar,
      description: "Desde fundación hasta producción estable"
    },
    {
      label: "Componentes",
      value: "56",
      icon: Package,
      description: "Microservicios, Lambda, frontend, infraestructura"
    },
    {
      label: "Equipo",
      value: "5-7",
      icon: Users,
      description: "Desarrolladores backend, frontend, DevOps, QA"
    },
    {
      label: "Investment",
      value: "$200K",
      icon: Trending_up,
      description: "Desarrollo completo + 2 meses operación"
    }
  ];
  const techStack = {
    backend: [
      { name: ".NET 8", category: "Runtime" },
      { name: "ECS Fargate", category: "Compute" },
      { name: "Lambda ARM64", category: "Serverless" },
      { name: "PostgreSQL 16", category: "Database" },
      { name: "DynamoDB", category: "NoSQL" },
      { name: "Redis 7", category: "Cache" }
    ],
    frontend: [
      { name: "React 18", category: "Framework" },
      { name: "TypeScript", category: "Language" },
      { name: "TanStack Query", category: "Data Fetching" },
      { name: "Tailwind CSS", category: "Styling" },
      { name: "Vite", category: "Build Tool" }
    ],
    infrastructure: [
      { name: "Terraform", category: "IaC" },
      { name: "AWS", category: "Cloud" },
      { name: "GitHub Actions", category: "CI/CD" },
      { name: "CloudWatch", category: "Monitoring" },
      { name: "Azure AD", category: "Authentication" }
    ]
  };
  let expandedComponent = null;
  head("1bad6w3", $$renderer, ($$renderer2) => {
    $$renderer2.title(($$renderer3) => {
      $$renderer3.push(`<title>Roadmap Técnico - Hergon Platform</title>`);
    });
    $$renderer2.push(`<meta name="description" content="Roadmap completo de construcción de la plataforma Hergon con arquitectura, stack tecnológico y timeline de implementación."/>`);
  });
  $$renderer.push(`<div class="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-blue-50/30"><section class="pt-24 pb-16 px-4 md:px-8"><div class="container-custom"><div class="text-center mb-12"><div class="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">`);
  Activity($$renderer, { class: "w-4 h-4 text-primary" });
  $$renderer.push(`<!----> <span class="text-sm font-semibold text-primary">Roadmap Técnico</span></div> <h1 class="text-5xl md:text-6xl font-bold text-primary-dark mb-6">Plan de Construcción <span class="gradient-text">Hergon Platform</span></h1> <p class="text-xl text-neutral-600 max-w-3xl mx-auto mb-8">Arquitectura técnica completa, stack tecnológico y timeline de implementación desde
					fundación hasta producción. <span class="font-semibold text-primary">Inicio: Diciembre 2025</span></p> <div class="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto mt-12"><!--[-->`);
  const each_array = ensure_array_like(keyMetrics);
  for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
    let metric = each_array[$$index];
    const Icon2 = metric.icon;
    $$renderer.push(`<div class="card hover:scale-105 transition-all duration-300 border-2 border-primary/10 svelte-1bad6w3"><div class="flex flex-col items-center text-center"><div class="w-12 h-12 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center mb-3 shadow-lg"><!---->`);
    Icon2($$renderer, { class: "w-6 h-6 text-white" });
    $$renderer.push(`<!----></div> <div class="text-3xl font-bold text-primary mb-1">${escape_html(metric.value)}</div> <div class="text-sm font-semibold text-neutral-900 mb-1">${escape_html(metric.label)}</div> <div class="text-xs text-neutral-600">${escape_html(metric.description)}</div></div></div>`);
  }
  $$renderer.push(`<!--]--></div></div></div></section> <section class="pb-20 px-4 md:px-8"><div class="container-custom max-w-7xl"><div class="space-y-8"><!--[-->`);
  const each_array_1 = ensure_array_like(roadmapPhases);
  for (let phaseIndex = 0, $$length = each_array_1.length; phaseIndex < $$length; phaseIndex++) {
    let phase = each_array_1[phaseIndex];
    const Icon2 = phase.icon;
    $$renderer.push(`<div${attr_class(`relative ${stringify(phase.bgColor)} border-2 ${stringify(phase.borderColor)} rounded-2xl overflow-hidden`, "svelte-1bad6w3")}><div${attr_class(`bg-gradient-to-r ${stringify(phase.color)} p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4`, "svelte-1bad6w3")}><div class="flex items-start gap-4 flex-1"><div class="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg"><!---->`);
    Icon2($$renderer, { class: "w-8 h-8 text-white" });
    $$renderer.push(`<!----></div> <div class="flex-1"><div class="flex items-center gap-3 mb-2"><span class="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold text-white uppercase tracking-wider">Fase ${escape_html(phaseIndex + 1)}</span> <span class="text-white/80 text-sm font-medium flex items-center gap-1">`);
    Clock($$renderer, { class: "w-4 h-4" });
    $$renderer.push(`<!----> ${escape_html(phase.duration)}</span></div> <h2 class="text-3xl font-bold text-white mb-2">${escape_html(phase.phase)}</h2> <div class="flex items-center gap-2 text-white/90">`);
    Calendar($$renderer, { class: "w-4 h-4" });
    $$renderer.push(`<!----> <span class="font-semibold">${escape_html(phase.month)}</span></div></div></div> <div class="text-right"><div class="text-white/90 text-sm mb-1">Componentes</div> <div class="text-4xl font-bold text-white">${escape_html(phase.components.length)}</div></div></div> <div class="p-6 md:p-8 space-y-4"><!--[-->`);
    const each_array_2 = ensure_array_like(phase.components);
    for (let componentIndex = 0, $$length2 = each_array_2.length; componentIndex < $$length2; componentIndex++) {
      let component = each_array_2[componentIndex];
      const isExpanded = expandedComponent === `${phaseIndex}-${componentIndex}`;
      $$renderer.push(`<div${attr_class(`bg-white border-2 border-neutral-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 ${stringify(isExpanded ? "ring-2 ring-primary ring-offset-2" : "")}`, "svelte-1bad6w3")}><button class="w-full p-5 flex items-start justify-between gap-4 hover:bg-neutral-50 transition-colors"><div class="flex items-start gap-4 flex-1 text-left"><div${attr_class(`w-10 h-10 bg-gradient-to-br ${stringify(phase.color)} rounded-lg flex items-center justify-center flex-shrink-0 shadow-md`, "svelte-1bad6w3")}>`);
      Code_xml($$renderer, { class: "w-5 h-5 text-white" });
      $$renderer.push(`<!----></div> <div class="flex-1"><div class="flex items-center gap-2 mb-2"><h3 class="text-lg font-bold text-neutral-900">${escape_html(component.name)}</h3> <span class="px-2 py-0.5 bg-neutral-100 rounded-md text-xs font-medium text-neutral-600">${escape_html(component.type)}</span> `);
      if (component.priority === "Crítico") {
        $$renderer.push("<!--[-->");
        $$renderer.push(`<span class="px-2 py-0.5 bg-red-100 rounded-md text-xs font-bold text-red-700">Crítico</span>`);
      } else {
        $$renderer.push("<!--[!-->");
        if (component.priority === "Alto") {
          $$renderer.push("<!--[-->");
          $$renderer.push(`<span class="px-2 py-0.5 bg-orange-100 rounded-md text-xs font-bold text-orange-700">Alto</span>`);
        } else {
          $$renderer.push("<!--[!-->");
        }
        $$renderer.push(`<!--]-->`);
      }
      $$renderer.push(`<!--]--></div> <p class="text-sm text-neutral-600 mb-2">${escape_html(component.responsibility)}</p> <div class="flex flex-wrap gap-1.5"><!--[-->`);
      const each_array_3 = ensure_array_like(component.stack);
      for (let $$index_1 = 0, $$length3 = each_array_3.length; $$index_1 < $$length3; $$index_1++) {
        let tech = each_array_3[$$index_1];
        $$renderer.push(`<span class="px-2 py-1 bg-primary/5 border border-primary/20 rounded-md text-xs font-mono font-medium text-primary">${escape_html(tech)}</span>`);
      }
      $$renderer.push(`<!--]--></div></div></div> <div class="flex flex-col items-end gap-2 flex-shrink-0"><span class="px-3 py-1 bg-neutral-100 rounded-lg text-sm font-semibold text-neutral-700">${escape_html(component.effort)}</span> <div${attr_class(`w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center transition-transform ${stringify(isExpanded ? "rotate-180" : "")}`)}>`);
      Chevron_down($$renderer, { class: "w-4 h-4 text-primary" });
      $$renderer.push(`<!----></div></div></button> `);
      if (isExpanded) {
        $$renderer.push("<!--[-->");
        $$renderer.push(`<div class="px-5 pb-5 pt-2 border-t border-neutral-200 bg-gradient-to-br from-neutral-50 to-primary/5 space-y-4 animate-in slide-in-from-top duration-300 svelte-1bad6w3"><div><div class="flex items-center gap-2 mb-2">`);
        Terminal($$renderer, { class: "w-4 h-4 text-primary" });
        $$renderer.push(`<!----> <h4 class="font-semibold text-neutral-900">Detalles Técnicos</h4></div> <p class="text-sm text-neutral-700 leading-relaxed font-mono">${escape_html(component.technical)}</p></div> <div class="grid md:grid-cols-2 gap-4"><div class="p-3 bg-white border border-neutral-200 rounded-lg"><div class="flex items-center gap-2 mb-1">`);
        Layers($$renderer, { class: "w-4 h-4 text-primary" });
        $$renderer.push(`<!----> <span class="text-xs font-semibold text-neutral-600 uppercase">Stack Tecnológico</span></div> <div class="flex flex-wrap gap-1"><!--[-->`);
        const each_array_4 = ensure_array_like(component.stack);
        for (let $$index_2 = 0, $$length3 = each_array_4.length; $$index_2 < $$length3; $$index_2++) {
          let tech = each_array_4[$$index_2];
          $$renderer.push(`<code class="px-2 py-1 bg-primary/10 rounded text-xs font-mono font-bold text-primary">${escape_html(tech)}</code>`);
        }
        $$renderer.push(`<!--]--></div></div> <div class="p-3 bg-white border border-neutral-200 rounded-lg"><div class="flex items-center gap-2 mb-1">`);
        Workflow($$renderer, { class: "w-4 h-4 text-primary" });
        $$renderer.push(`<!----> <span class="text-xs font-semibold text-neutral-600 uppercase">Tipo &amp; Prioridad</span></div> <div class="flex items-center gap-2"><span class="px-2 py-1 bg-neutral-100 rounded text-xs font-semibold">${escape_html(component.type)}</span> <span${attr_class(`px-2 py-1 rounded text-xs font-bold ${stringify(component.priority === "Crítico" ? "bg-red-100 text-red-700" : component.priority === "Alto" ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700")}`)}>${escape_html(component.priority)}</span></div></div></div></div>`);
      } else {
        $$renderer.push("<!--[!-->");
      }
      $$renderer.push(`<!--]--></div>`);
    }
    $$renderer.push(`<!--]--></div></div>`);
  }
  $$renderer.push(`<!--]--></div></div></section> <section class="pb-20 px-4 md:px-8 bg-gradient-to-br from-primary-dark to-primary text-white"><div class="container-custom py-16"><div class="text-center mb-12"><h2 class="text-4xl font-bold mb-4">Stack Tecnológico Completo</h2> <p class="text-white/80 text-lg max-w-2xl mx-auto">Tecnologías modernas, probadas en producción y optimizadas para alta disponibilidad.</p></div> <div class="grid md:grid-cols-3 gap-8"><div class="card bg-white/10 backdrop-blur-lg border-white/20"><div class="flex items-center gap-3 mb-6"><div class="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shadow-lg">`);
  Server($$renderer, { class: "w-6 h-6 text-white" });
  $$renderer.push(`<!----></div> <h3 class="text-2xl font-bold text-white">Backend</h3></div> <div class="space-y-2"><!--[-->`);
  const each_array_5 = ensure_array_like(techStack.backend);
  for (let $$index_5 = 0, $$length = each_array_5.length; $$index_5 < $$length; $$index_5++) {
    let tech = each_array_5[$$index_5];
    $$renderer.push(`<div class="flex items-center justify-between p-3 bg-white/5 rounded-lg"><span class="font-mono text-white">${escape_html(tech.name)}</span> <span class="text-xs text-white/60 uppercase">${escape_html(tech.category)}</span></div>`);
  }
  $$renderer.push(`<!--]--></div></div> <div class="card bg-white/10 backdrop-blur-lg border-white/20"><div class="flex items-center gap-3 mb-6"><div class="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shadow-lg">`);
  Smartphone($$renderer, { class: "w-6 h-6 text-white" });
  $$renderer.push(`<!----></div> <h3 class="text-2xl font-bold text-white">Frontend</h3></div> <div class="space-y-2"><!--[-->`);
  const each_array_6 = ensure_array_like(techStack.frontend);
  for (let $$index_6 = 0, $$length = each_array_6.length; $$index_6 < $$length; $$index_6++) {
    let tech = each_array_6[$$index_6];
    $$renderer.push(`<div class="flex items-center justify-between p-3 bg-white/5 rounded-lg"><span class="font-mono text-white">${escape_html(tech.name)}</span> <span class="text-xs text-white/60 uppercase">${escape_html(tech.category)}</span></div>`);
  }
  $$renderer.push(`<!--]--></div></div> <div class="card bg-white/10 backdrop-blur-lg border-white/20"><div class="flex items-center gap-3 mb-6"><div class="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shadow-lg">`);
  Cloud_cog($$renderer, { class: "w-6 h-6 text-white" });
  $$renderer.push(`<!----></div> <h3 class="text-2xl font-bold text-white">Infrastructure</h3></div> <div class="space-y-2"><!--[-->`);
  const each_array_7 = ensure_array_like(techStack.infrastructure);
  for (let $$index_7 = 0, $$length = each_array_7.length; $$index_7 < $$length; $$index_7++) {
    let tech = each_array_7[$$index_7];
    $$renderer.push(`<div class="flex items-center justify-between p-3 bg-white/5 rounded-lg"><span class="font-mono text-white">${escape_html(tech.name)}</span> <span class="text-xs text-white/60 uppercase">${escape_html(tech.category)}</span></div>`);
  }
  $$renderer.push(`<!--]--></div></div></div></div></section> <section class="py-16 px-4 md:px-8 bg-white"><div class="container-custom text-center"><div class="max-w-3xl mx-auto"><div class="inline-flex items-center gap-2 px-4 py-2 bg-success/10 rounded-full mb-6">`);
  Circle_check_big($$renderer, { class: "w-4 h-4 text-success" });
  $$renderer.push(`<!----> <span class="text-sm font-semibold text-success">Roadmap Actualizado - 2025</span></div> <h2 class="text-4xl font-bold text-primary-dark mb-4">¿Preguntas sobre la Arquitectura?</h2> <p class="text-xl text-neutral-600 mb-8">Este roadmap técnico es un documento vivo que evoluciona con el feedback del equipo y
					las necesidades del producto.</p> <div class="flex flex-col sm:flex-row gap-4 justify-center"><a href="/" class="btn btn-primary text-lg">`);
  Shield($$renderer, { class: "w-5 h-5" });
  $$renderer.push(`<!----> Volver al Sitio</a> <a href="#top" class="btn btn-outline text-lg">`);
  Rocket($$renderer, { class: "w-5 h-5" });
  $$renderer.push(`<!----> Ir Arriba</a></div></div></div></section></div>`);
}
export {
  _page as default
};
