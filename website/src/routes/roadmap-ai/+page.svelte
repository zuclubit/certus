<script>
	import {
		Calendar,
		CheckCircle,
		ChevronDown,
		Clock,
		Code2,
		Database,
		GitBranch,
		Layers,
		Lock,
		Rocket,
		Server,
		Shield,
		Smartphone,
		Terminal,
		Workflow,
		Zap,
		Target,
		TrendingUp,
		Users,
		Package,
		CloudCog,
		FileCode,
		Activity,
		Sparkles,
		Bot,
		ArrowRight,
		TrendingDown
	} from 'lucide-svelte';

	let expandedPhase = $state(null);

	function togglePhase(index) {
		expandedPhase = expandedPhase === index ? null : index;
	}

	// AI-Accelerated Roadmap data starting December 2025
	const roadmapPhases = [
		{
			phase: 'Fundación',
			month: 'Diciembre 2025',
			durationOriginal: '2-3 semanas',
			duration: '1-2 semanas',
			effortOriginal: '10-15 días',
			effort: '6-10 días',
			reduction: '45%',
			icon: Database,
			color: 'from-blue-500 to-cyan-500',
			bgColor: 'bg-blue-50',
			borderColor: 'border-blue-200',
			textColor: 'text-blue-700',
			components: [
				{
					name: 'Infraestructura AWS Base',
					type: 'Infrastructure',
					stack: ['Terraform', 'AWS VPC', 'Security Groups', 'IAM'],
					responsibility:
						'Red privada multi-AZ, segmentación por capas (pública, app, datos)',
					effortOriginal: '3-5 días',
					effort: '2-3 días',
					technical:
						'VPC con 3 AZs, subnets públicas/privadas, NAT Gateways, VPC Endpoints (S3, DynamoDB)',
					aiBoost: 'Módulos Terraform generados por IA, validación automatizada',
					priority: 'Crítico'
				},
				{
					name: 'PostgreSQL RDS - Catálogo',
					type: 'Database',
					stack: ['PostgreSQL 16', 'RDS Graviton4', 'Flyway'],
					responsibility: 'AFOREs, usuarios, archivos metadata, catálogos normativos',
					effortOriginal: '2-3 días',
					effort: '1-2 días',
					technical:
						'db.r7g.large Multi-AZ, Row-Level Security por AFORE, índices en aforeId + fecha',
					aiBoost: 'DDL scripts y migrations generadas por IA',
					priority: 'Crítico'
				},
				{
					name: 'PostgreSQL RDS - Validación',
					type: 'Database',
					stack: ['PostgreSQL 16', 'RDS Graviton4', 'Flyway'],
					responsibility: 'Reglas CONSAR, resultados de validación, históricos 7+ años',
					effortOriginal: '2-3 días',
					effort: '1-2 días',
					technical:
						'db.r7g.xlarge Multi-AZ, particionamiento por fecha, optimización queries pesadas',
					aiBoost: 'Schema design optimizado, índices sugeridos automáticamente',
					priority: 'Crítico'
				},
				{
					name: 'DynamoDB Event Store',
					type: 'NoSQL',
					stack: ['DynamoDB', 'Event Sourcing', 'AWS SDK'],
					responsibility: 'Audit trail inmutable, compliance CONSAR (7 años)',
					effortOriginal: '1-2 días',
					effort: '1 día',
					technical: 'TTL 2555 días, GSI por eventType/aforeId, DynamoDB Streams habilitado',
					aiBoost: 'Terraform y configuración GSI automatizada',
					priority: 'Crítico'
				},
				{
					name: 'ElastiCache Redis',
					type: 'Cache',
					stack: ['Redis 7', 'Graviton3', 'StackExchange.Redis'],
					responsibility: 'Cache distribuido, sesiones, rate limiting, catálogos hot',
					effortOriginal: '1 día',
					effort: '0.5 días',
					technical: 'cache.r7g.large, cluster mode, auth token, encriptación in-transit',
					aiBoost: 'Configuración automatizada por IA',
					priority: 'Alto'
				},
				{
					name: 'Secrets & Configuration',
					type: 'Security',
					stack: ['AWS Secrets Manager', 'Azure AD'],
					responsibility: 'Gestión de secrets, configuración Azure AD',
					effortOriginal: '1 día',
					effort: '0.5 días',
					technical: 'Rotación automática cada 90 días',
					aiBoost: 'Scripts de rotación generados por IA',
					priority: 'Crítico'
				}
			]
		},
		{
			phase: 'Core Backend',
			month: 'Enero - Febrero 2026',
			durationOriginal: '10-12 semanas',
			duration: '6-8 semanas',
			effortOriginal: '60-90 días',
			effort: '33-50 días',
			reduction: '45%',
			icon: Server,
			color: 'from-purple-500 to-pink-500',
			bgColor: 'bg-purple-50',
			borderColor: 'border-purple-200',
			textColor: 'text-purple-700',
			components: [
				{
					name: 'API Gateway + JWT Authorizer',
					type: 'API Gateway',
					stack: ['AWS API Gateway v2', 'Azure AD', 'JWT', 'WAF'],
					responsibility: 'Routing, autenticación Azure AD, rate limiting 2000 req/s',
					effortOriginal: '2 días',
					effort: '1 día',
					technical: 'VPC Link a ALB, JWT issuer validation, throttling por ambiente, WAF rules',
					aiBoost: 'Terraform completo generado por IA',
					priority: 'Crítico'
				},
				{
					name: 'Shared Libraries',
					type: 'Library',
					stack: ['.NET 8', 'C#'],
					responsibility: 'DTOs compartidos, extensions, helpers, validators',
					effortOriginal: '3-5 días',
					effort: '2-3 días',
					technical: 'Azure.Identity, AWSSDK.*, Serilog, FluentValidation',
					aiBoost: 'DTOs y validators generados automáticamente',
					priority: 'Alto'
				},
				{
					name: 'Authentication Service',
					type: 'Microservice',
					stack: ['.NET 8', 'Azure.Identity', 'JWT', 'Redis'],
					responsibility: 'Validación tokens, extracción claims (aforeId, role), autorización',
					effortOriginal: '3-5 días',
					effort: '2-3 días',
					technical: 'Middleware custom, cache JWKS keys (1h TTL), Row-Level Security injection',
					aiBoost: 'Middleware y boilerplate generado por IA',
					priority: 'Crítico'
				},
				{
					name: 'Catalog Service',
					type: 'Microservice',
					stack: ['.NET 8', 'EF Core', 'Dapper', 'MediatR'],
					responsibility: 'CRUD AFOREs, usuarios, archivos, catálogos normativos',
					effortOriginal: '5-7 días',
					effort: '3-4 días',
					technical: 'ECS Fargate ARM64, CQRS pattern, health checks /health, Redis caching layer',
					aiBoost: 'CRUD completo, repositories y controllers generados',
					priority: 'Crítico'
				},
				{
					name: 'File Upload Service',
					type: 'Microservice',
					stack: ['.NET 8', 'AWSSDK.S3', 'Multipart Upload'],
					responsibility: 'Upload archivos CONSAR TXT a S3, validación formato, metadata DB',
					effortOriginal: '3-5 días',
					effort: '2-3 días',
					technical:
						'Chunk upload 5MB, progress tracking, S3 presigned URLs, max 500MB, virus scan',
					aiBoost: 'S3 integration code generado por IA',
					priority: 'Alto'
				},
				{
					name: 'Validation Engine',
					type: 'Microservice',
					stack: ['.NET 8', 'MediatR', 'SQS', 'EventBridge'],
					responsibility: 'Orquestación 37 validadores, dispatch asíncrono, resultados agregados',
					effortOriginal: '5-7 días',
					effort: '3-4 días',
					technical: 'CQRS commands, idempotencia con correlation IDs, saga pattern para rollback',
					aiBoost: 'MediatR handlers y CQRS patterns generados',
					priority: 'Crítico'
				},
				{
					name: '37 Lambda Validators',
					type: 'Serverless',
					stack: ['.NET 8 Lambda ARM64', 'AWSSDK'],
					responsibility: '37 reglas de negocio CONSAR automatizadas',
					effortOriginal: '15-21 días',
					effort: '9-13 días',
					technical:
						'SnapStart, ARM64 Graviton4, provisioned concurrency, batch processing',
					aiBoost: 'Handlers Lambda y lógica de validación generados',
					priority: 'Crítico'
				},
				{
					name: 'Results Aggregator Service',
					type: 'Microservice',
					stack: ['.NET 8 Worker', 'MediatR'],
					responsibility: 'Agregación de resultados de validaciones Lambda',
					effortOriginal: '3-5 días',
					effort: '2-3 días',
					technical: 'ECS Fargate worker, long-running tasks, auto-scaling',
					aiBoost: 'Worker patterns generados por IA',
					priority: 'Alto'
				},
				{
					name: 'Report Generator Service',
					type: 'Microservice',
					stack: ['.NET 8 Worker', 'QuestPDF'],
					responsibility: 'Generación de reportes PDF/Excel de validaciones',
					effortOriginal: '5-7 días',
					effort: '3-4 días',
					technical: 'Async generation, SQS trigger, templates personalizables',
					aiBoost: 'Templates PDF generados por IA',
					priority: 'Alto'
				},
				{
					name: 'Notification Service',
					type: 'Microservice',
					stack: ['.NET 8 Worker', 'AWS SES/SNS'],
					responsibility: 'Notificaciones email/SMS a AFOREs sobre validaciones',
					effortOriginal: '3-5 días',
					effort: '2-3 días',
					technical: 'Templates de emails, retry logic, DLQ para fallos',
					aiBoost: 'Email templates y lógica generados',
					priority: 'Medio'
				},
				{
					name: 'Event Processor + Audit Service',
					type: 'Microservice',
					stack: ['.NET 8', 'DynamoDB Streams', 'EF Core'],
					responsibility: 'Procesamiento de eventos, consulta de audit trail',
					effortOriginal: '6-10 días',
					effort: '4-6 días',
					technical: 'Stream consumer, exactly-once processing, query builders',
					aiBoost: 'Event handlers y query builders generados',
					priority: 'Alto'
				}
			]
		},
		{
			phase: 'Frontend & UX',
			month: 'Marzo - Abril 2026',
			durationOriginal: '6-8 semanas',
			duration: '3-4 semanas',
			effortOriginal: '31-47 días',
			effort: '18-28 días',
			reduction: '55%',
			icon: Smartphone,
			color: 'from-green-500 to-emerald-500',
			bgColor: 'bg-green-50',
			borderColor: 'border-green-200',
			textColor: 'text-green-700',
			components: [
				{
					name: 'React 18 Web App - Core',
					type: 'Frontend',
					stack: ['React 18', 'TypeScript', 'Vite', 'TanStack Query'],
					responsibility: 'SPA para AFOREs, dashboard, upload de archivos',
					effortOriginal: '10-15 días',
					effort: '5-8 días',
					technical: 'S3 + CloudFront hosting, Azure AD B2C authentication',
					aiBoost: 'Component scaffolding completo por IA',
					priority: 'Crítico'
				},
				{
					name: 'Azure AD Authentication UI',
					type: 'Frontend',
					stack: ['React', '@azure/msal-react', 'msal-browser'],
					responsibility: 'Login con Azure AD, refresh tokens, logout',
					effortOriginal: '3-5 días',
					effort: '2-3 días',
					technical: 'PKCE flow, token refresh automático, secure storage',
					aiBoost: 'Auth components generados por IA',
					priority: 'Crítico'
				},
				{
					name: 'File Upload UI',
					type: 'Frontend',
					stack: ['React', 'react-dropzone', 'axios'],
					responsibility: 'UI para subir archivos CONSAR TXT',
					effortOriginal: '3-5 días',
					effort: '2-3 días',
					technical: 'Chunk upload, progress bar, validación client-side',
					aiBoost: 'Upload UI completo generado',
					priority: 'Alto'
				},
				{
					name: 'Validation Dashboard',
					type: 'Frontend',
					stack: ['React', 'Recharts', 'TanStack Table'],
					responsibility: 'Dashboard de validaciones ejecutadas, resultados',
					effortOriginal: '5-7 días',
					effort: '3-4 días',
					technical: 'Real-time updates (WebSocket o polling), filtros, exportación',
					aiBoost: 'Dashboard components y charts generados',
					priority: 'Crítico'
				},
				{
					name: 'Reports Viewer',
					type: 'Frontend',
					stack: ['React', 'react-pdf', 'xlsx'],
					responsibility: 'Visualización de reportes PDF/Excel generados',
					effortOriginal: '3-5 días',
					effort: '2-3 días',
					technical: 'PDF viewer embebido, descarga directa desde S3',
					aiBoost: 'Viewer components generados',
					priority: 'Medio'
				},
				{
					name: 'Audit Trail UI',
					type: 'Frontend',
					stack: ['React', 'TanStack Table'],
					responsibility: 'Visualización de audit log para compliance',
					effortOriginal: '3-5 días',
					effort: '2-3 días',
					technical: 'Filtros avanzados, paginación server-side, export CSV',
					aiBoost: 'Table components generados',
					priority: 'Medio'
				},
				{
					name: 'Admin Panel',
					type: 'Frontend',
					stack: ['React', 'Ant Design', 'React Router'],
					responsibility: 'Panel de administración para operadores Hergon',
					effortOriginal: '7-10 días',
					effort: '4-5 días',
					technical: 'RBAC, gestión de usuarios, configuración de reglas',
					aiBoost: 'CRUD admin panels generados',
					priority: 'Alto'
				}
			]
		},
		{
			phase: 'Testing & QA',
			month: 'Mayo 2026',
			durationOriginal: '4-5 semanas',
			duration: '2-3 semanas',
			effortOriginal: '20-29 días',
			effort: '10-14 días',
			reduction: '55%',
			icon: CheckCircle,
			color: 'from-orange-500 to-red-500',
			bgColor: 'bg-orange-50',
			borderColor: 'border-orange-200',
			textColor: 'text-orange-700',
			components: [
				{
					name: 'Unit Tests - Backend',
					type: 'Testing',
					stack: ['xUnit', 'Moq', 'FluentAssertions', 'Testcontainers'],
					responsibility: 'Tests unitarios de servicios, validators, helpers',
					effortOriginal: '5-7 días',
					effort: '2-3 días',
					technical: 'Coverage >80%, AAA pattern, test doubles para AWS services',
					aiBoost: 'Unit tests generados automáticamente',
					priority: 'Crítico'
				},
				{
					name: 'Integration Tests - Backend',
					type: 'Testing',
					stack: ['xUnit', 'Testcontainers', 'WireMock', 'LocalStack'],
					responsibility: 'Tests de integración con DB, S3, SQS, DynamoDB',
					effortOriginal: '7-10 días',
					effort: '3-4 días',
					technical: 'Testcontainers para PostgreSQL/Redis, LocalStack para AWS',
					aiBoost: 'Integration tests generados',
					priority: 'Crítico'
				},
				{
					name: 'E2E Tests - Frontend',
					type: 'Testing',
					stack: ['Playwright', 'TypeScript'],
					responsibility: 'Tests end-to-end del flujo completo de usuario',
					effortOriginal: '5-7 días',
					effort: '3-4 días',
					technical: 'CI/CD integration, screenshots on failure, parallelización',
					aiBoost: 'E2E scenarios generados',
					priority: 'Alto'
				},
				{
					name: 'Load Testing',
					type: 'Testing',
					stack: ['k6', 'Grafana', 'Artillery'],
					responsibility: 'Tests de carga, stress testing, capacity planning',
					effortOriginal: '3-5 días',
					effort: '2-3 días',
					technical: 'Simular 10 AFOREs, 1000 validaciones/día, métricas SLA',
					aiBoost: 'Load test scripts generados',
					priority: 'Alto'
				}
			]
		},
		{
			phase: 'DevOps & Security',
			month: 'Mayo - Junio 2026',
			durationOriginal: '5-6 semanas',
			duration: '3-4 semanas',
			effortOriginal: '26-38 días',
			effort: '15-25 días',
			reduction: '42%',
			icon: Shield,
			color: 'from-red-500 to-rose-500',
			bgColor: 'bg-red-50',
			borderColor: 'border-red-200',
			textColor: 'text-red-700',
			components: [
				{
					name: 'CI/CD Pipelines',
					type: 'DevOps',
					stack: ['GitHub Actions', 'Docker', 'ECR', 'ECS'],
					responsibility: 'Build, test, push images, deploy to ECS/Lambda/S3',
					effortOriginal: '7-11 días',
					effort: '4-6 días',
					technical: 'Multi-stage builds ARM64, semantic versioning, blue-green deploy',
					aiBoost: 'Workflows completos generados',
					priority: 'Crítico'
				},
				{
					name: 'Database Migrations + DR',
					type: 'DevOps',
					stack: ['Flyway', 'PostgreSQL', 'AWS Backup'],
					responsibility: 'Migrations versionadas, backups automáticos, DR drills',
					effortOriginal: '4-6 días',
					effort: '2-4 días',
					technical: 'RPO=1h, RTO=4h, snapshots cross-region',
					aiBoost: 'Migration scripts y backup configs generados',
					priority: 'Alto'
				},
				{
					name: 'Secrets Rotation',
					type: 'DevOps',
					stack: ['AWS Secrets Manager', 'Lambda', 'EventBridge'],
					responsibility: 'Rotación automática de passwords, client secrets',
					effortOriginal: '2-3 días',
					effort: '1-2 días',
					technical: 'Rotación cada 90 días, zero-downtime rotation',
					aiBoost: 'Rotation lambdas generadas',
					priority: 'Medio'
				},
				{
					name: 'Security Audit',
					type: 'Security',
					stack: ['AWS Config', 'Prowler', 'IAM Access Analyzer'],
					responsibility: 'Auditoría de seguridad, compliance checks',
					effortOriginal: '3-5 días',
					effort: '2-4 días',
					technical: 'Checks: encryption, public access, IAM policies, compliance',
					aiBoost: 'Automated scanning acelerado',
					priority: 'Crítico'
				},
				{
					name: 'Penetration Testing',
					type: 'Security',
					stack: ['OWASP ZAP', 'Burp Suite'],
					responsibility: 'Pentesting de API, WAF rules validation',
					effortOriginal: '5-7 días',
					effort: '4-5 días',
					technical: 'OWASP Top 10, SQL injection, XSS, CSRF, auth bypass',
					aiBoost: 'Automated vulnerability scanning',
					priority: 'Crítico'
				},
				{
					name: 'Compliance Documentation',
					type: 'Security',
					stack: ['Markdown', 'Confluence'],
					responsibility: 'Documentación SOC 2, ISO 27001, CONSAR',
					effortOriginal: '5-7 días',
					effort: '2-3 días',
					technical: 'Políticas, procedimientos, evidencia de controles',
					aiBoost: 'Docs generados automáticamente (70% reducción)',
					priority: 'Alto'
				}
			]
		},
		{
			phase: 'Pre-Production',
			month: 'Junio 2026',
			durationOriginal: '3-4 semanas',
			duration: '2 semanas',
			effortOriginal: '16-25 días',
			effort: '9-14 días',
			reduction: '50%',
			icon: FileCode,
			color: 'from-teal-500 to-cyan-500',
			bgColor: 'bg-teal-50',
			borderColor: 'border-teal-200',
			textColor: 'text-teal-700',
			components: [
				{
					name: 'API Documentation',
					type: 'Documentation',
					stack: ['Swagger/OpenAPI', 'Redoc', 'Postman'],
					responsibility: 'Documentación de APIs REST, ejemplos, schemas',
					effortOriginal: '3-5 días',
					effort: '1-2 días',
					technical: 'OpenAPI 3.0, ejemplos de requests/responses, autenticación',
					aiBoost: 'OpenAPI generado desde código (70% reducción)',
					priority: 'Alto'
				},
				{
					name: 'User Manuals',
					type: 'Documentation',
					stack: ['Markdown', 'Docusaurus', 'videos'],
					responsibility: 'Manuales de usuario para AFOREs y admins',
					effortOriginal: '5-7 días',
					effort: '2-3 días',
					technical: 'Screenshots, videos tutoriales, troubleshooting guides',
					aiBoost: 'User guides generados (70% reducción)',
					priority: 'Alto'
				},
				{
					name: 'Operations Runbooks',
					type: 'Documentation',
					stack: ['Markdown', 'incident response templates'],
					responsibility: 'Runbooks para incidentes, deployment, rollback',
					effortOriginal: '3-5 días',
					effort: '1-2 días',
					technical: 'Incident response, escalation, playbooks por tipo de issue',
					aiBoost: 'Runbooks generados (70% reducción)',
					priority: 'Medio'
				},
				{
					name: 'Team Training',
					type: 'Training',
					stack: ['Workshops', 'documentation review'],
					responsibility: 'Capacitación del equipo técnico en arquitectura y ops',
					effortOriginal: '3-5 días',
					effort: '3-4 días',
					technical: 'AWS services, Azure AD, troubleshooting, monitoring',
					aiBoost: 'Training materials generados',
					priority: 'Alto'
				},
				{
					name: 'User Training',
					type: 'Training',
					stack: ['Workshops', 'videos', 'user manuals'],
					responsibility: 'Capacitación de usuarios AFORE en el sistema',
					effortOriginal: '2-3 días',
					effort: '2-3 días',
					technical: 'Upload de archivos, interpretación de reportes, soporte',
					aiBoost: 'Training videos generados',
					priority: 'Alto'
				}
			]
		},
		{
			phase: 'Production Launch',
			month: 'Julio 2026',
			durationOriginal: '3-5 semanas',
			duration: '2-4 semanas',
			effortOriginal: '17-35 días',
			effort: '14-30 días',
			reduction: '15%',
			icon: Rocket,
			color: 'from-indigo-500 to-blue-500',
			bgColor: 'bg-indigo-50',
			borderColor: 'border-indigo-200',
			textColor: 'text-indigo-700',
			components: [
				{
					name: 'Production Deployment',
					type: 'Deployment',
					stack: ['Terraform', 'AWS', 'blue-green deployment'],
					responsibility: 'Despliegue a producción con estrategia blue-green',
					effortOriginal: '3-5 días',
					effort: '2-3 días',
					technical: 'Validar staging, backups, rollback plan, monitoring 24/7',
					aiBoost: 'Deployment automation mejorada',
					priority: 'Crítico'
				},
				{
					name: 'Hypercare Period',
					type: 'Operations',
					stack: ['CloudWatch', 'PagerDuty', 'team on-call'],
					responsibility: 'Monitoreo intensivo post-go-live, respuesta rápida',
					effortOriginal: '14-30 días',
					effort: '12-27 días',
					technical: 'Equipo on-call 24/7, análisis diario de métricas, ajustes',
					aiBoost: 'Alerting automation (10% reducción)',
					priority: 'Crítico'
				}
			]
		},
		{
			phase: 'Post-Launch',
			month: 'Agosto 2026+',
			durationOriginal: 'Continuo',
			duration: 'Continuo',
			effortOriginal: 'Continuo',
			effort: 'Continuo (20% más eficiente)',
			reduction: '20%',
			icon: TrendingUp,
			color: 'from-pink-500 to-purple-500',
			bgColor: 'bg-pink-50',
			borderColor: 'border-pink-200',
			textColor: 'text-pink-700',
			components: [
				{
					name: 'Performance Optimization',
					type: 'Optimization',
					stack: ['CloudWatch', 'X-Ray', 'profiling tools'],
					responsibility: 'Optimización basada en métricas reales de producción',
					effortOriginal: 'Continuo',
					effort: 'Continuo (20% más eficiente)',
					technical: 'Query optimization, cache tuning, right-sizing resources',
					aiBoost: 'IA analiza métricas y sugiere optimizaciones',
					priority: 'Continuo'
				},
				{
					name: 'Cost Optimization',
					type: 'FinOps',
					stack: ['AWS Cost Explorer', 'Savings Plans', 'Reserved Instances'],
					responsibility: 'Análisis de costos, implementación de Savings Plans',
					effortOriginal: 'Continuo',
					effort: 'Continuo (20% más eficiente)',
					technical: 'Identificar recursos idle, rightsizing, commitment discounts',
					aiBoost: 'IA sugiere ahorros automáticamente',
					priority: 'Continuo'
				}
			]
		}
	];

	// Summary stats
	const summaryStats = {
		totalComponents: 56,
		effortOriginal: '189-293 días',
		effortWithAI: '112-181 días',
		reduction: '42%',
		durationOriginal: '9-10 meses',
		durationWithAI: '5-6 meses',
		timeSavings: '4 meses'
	};
</script>

<svelte:head>
	<title>Roadmap Técnico con IA - Hergon Platform</title>
	<meta
		name="description"
		content="Roadmap técnico acelerado con AI agents (Claude Code, Copilot) - 5-6 meses, 42% más rápido"
	/>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-50">
	<!-- AI Badge Header -->
	<div class="bg-gradient-to-r from-primary via-purple-600 to-pink-600 text-white py-2">
		<div class="container-custom mx-auto px-6">
			<div class="flex items-center justify-center gap-2 text-sm font-medium">
				<Sparkles class="w-4 h-4" />
				<span>Roadmap acelerado con AI Agents (Claude Code, GitHub Copilot)</span>
				<Sparkles class="w-4 h-4" />
			</div>
		</div>
	</div>

	<!-- Hero Section -->
	<section class="py-16 bg-gradient-to-br from-primary-dark via-primary to-primary-dark text-white">
		<div class="container-custom mx-auto px-6">
			<div class="flex items-center justify-center gap-3 mb-6">
				<Bot class="w-12 h-12" />
				<h1 class="text-5xl font-bold">Roadmap Técnico con IA</h1>
			</div>

			<p class="text-xl text-center max-w-4xl mx-auto mb-12 text-white/90">
				Plan de construcción optimizado con <strong>Agentes de IA</strong> - Claude Code, GitHub
				Copilot, y más. Reducción del <strong>42%</strong> en tiempo de desarrollo.
			</p>

			<!-- Key Metrics -->
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
				<div class="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
					<div class="flex items-center gap-3 mb-3">
						<Clock class="w-8 h-8 text-success" />
						<div>
							<div class="text-sm text-white/70">Duración</div>
							<div class="text-2xl font-bold">{summaryStats.durationWithAI}</div>
							<div class="text-xs text-white/60 line-through">
								{summaryStats.durationOriginal}
							</div>
						</div>
					</div>
				</div>

				<div class="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
					<div class="flex items-center gap-3 mb-3">
						<TrendingDown class="w-8 h-8 text-success" />
						<div>
							<div class="text-sm text-white/70">Reducción</div>
							<div class="text-2xl font-bold">{summaryStats.reduction}</div>
							<div class="text-xs text-white/60">{summaryStats.timeSavings} ahorrados</div>
						</div>
					</div>
				</div>

				<div class="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
					<div class="flex items-center gap-3 mb-3">
						<Package class="w-8 h-8 text-success" />
						<div>
							<div class="text-sm text-white/70">Componentes</div>
							<div class="text-2xl font-bold">{summaryStats.totalComponents}</div>
							<div class="text-xs text-white/60">Automatizados</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Comparison Bar -->
			<div class="mt-12 max-w-4xl mx-auto">
				<div class="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
					<h3 class="text-xl font-semibold mb-6 text-center">Timeline Comparativo</h3>
					<div class="space-y-4">
						<div>
							<div class="flex justify-between items-center mb-2">
								<span class="text-sm">Sin IA</span>
								<span class="text-sm font-semibold">{summaryStats.effortOriginal}</span>
							</div>
							<div class="h-3 bg-white/20 rounded-full overflow-hidden">
								<div class="h-full bg-red-400 w-full"></div>
							</div>
						</div>
						<div>
							<div class="flex justify-between items-center mb-2">
								<span class="text-sm flex items-center gap-2">
									<Sparkles class="w-4 h-4" />
									Con IA
								</span>
								<span class="text-sm font-semibold">{summaryStats.effortWithAI}</span>
							</div>
							<div class="h-3 bg-white/20 rounded-full overflow-hidden">
								<div class="h-full bg-gradient-to-r from-success to-emerald-400 w-[58%]"></div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- MVP Fast-Track Option -->
			<div class="mt-12 max-w-4xl mx-auto">
				<div class="bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-md rounded-2xl p-8 border-2 border-orange-400">
					<div class="flex items-center justify-center gap-3 mb-4">
						<Rocket class="w-8 h-8 text-orange-600" />
						<h3 class="text-2xl font-bold text-orange-900">⚡ Opción MVP: Go-Live en 3 Meses</h3>
					</div>
					<p class="text-center text-orange-800 mb-6">
						Fast-track para validar producto con 1-2 AFOREs piloto antes de full rollout
					</p>
					<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
						<div class="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center">
							<div class="text-3xl font-bold text-orange-600">3 meses</div>
							<div class="text-sm text-neutral-600">vs 5-6 meses Full</div>
						</div>
						<div class="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center">
							<div class="text-3xl font-bold text-orange-600">$114K</div>
							<div class="text-sm text-neutral-600">vs $197K Full</div>
						</div>
						<div class="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center">
							<div class="text-3xl font-bold text-orange-600">10 validators</div>
							<div class="text-sm text-neutral-600">vs 37 completos</div>
						</div>
					</div>
					<div class="bg-white/60 backdrop-blur-sm rounded-xl p-4 mb-4">
						<h4 class="font-semibold text-neutral-900 mb-2">✅ Incluido en MVP:</h4>
						<ul class="text-sm text-neutral-700 space-y-1">
							<li>• Infraestructura AWS completa</li>
							<li>• 10 Lambda Validators críticos (70% validaciones)</li>
							<li>• Frontend básico funcional (sin admin panel)</li>
							<li>• CI/CD + Testing básico</li>
							<li>• Go-live con 1-2 AFOREs piloto</li>
						</ul>
					</div>
					<div class="bg-white/60 backdrop-blur-sm rounded-xl p-4">
						<h4 class="font-semibold text-neutral-900 mb-2">📈 Estrategia Post-MVP (Meses 4-6):</h4>
						<ul class="text-sm text-neutral-700 space-y-1">
							<li>• Agregar 27 validators restantes</li>
							<li>• Admin panel completo</li>
							<li>• Frontend avanzado (charts, drag&drop)</li>
							<li>• Compliance docs (SOC 2, ISO 27001)</li>
							<li>• Escalamiento a múltiples AFOREs</li>
						</ul>
					</div>
					<div class="text-center mt-6">
						<a
							href="#mvp-details"
							class="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl transition-colors"
						>
							Ver Timeline MVP Detallado
							<ArrowRight class="w-5 h-5" />
						</a>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Roadmap Phases -->
	<section class="py-20">
		<div class="container-custom mx-auto px-6">
			<div class="max-w-6xl mx-auto">
				<!-- Timeline -->
				<div class="space-y-8">
					{#each roadmapPhases as phase, index}
						{@const Icon = phase.icon}
						<div
							class="relative bg-white rounded-3xl shadow-xl border-2 {phase.borderColor} overflow-hidden transition-all duration-300 hover:shadow-2xl"
						>
							<!-- Phase Header -->
							<button
								class="w-full p-6 flex items-center justify-between cursor-pointer {phase.bgColor} hover:opacity-90 transition-opacity"
								onclick={() => togglePhase(index)}
							>
								<div class="flex items-center gap-4">
									<div
										class="w-16 h-16 rounded-2xl bg-gradient-to-br {phase.color} flex items-center justify-center shadow-lg"
									>
										<Icon class="w-8 h-8 text-white" />
									</div>
									<div class="text-left">
										<h3 class="text-2xl font-bold {phase.textColor}">
											{index + 1}. {phase.phase}
										</h3>
										<p class="text-sm text-neutral-600 mt-1">{phase.month}</p>
										<div class="flex items-center gap-4 mt-2">
											<div class="flex items-center gap-2 text-sm">
												<Sparkles class="w-4 h-4 text-success" />
												<span class="font-semibold text-success">{phase.duration}</span>
												<span class="text-neutral-500 line-through text-xs">
													{phase.durationOriginal}
												</span>
											</div>
											<div
												class="px-3 py-1 bg-success/20 text-success text-xs font-bold rounded-full"
											>
												-{phase.reduction}
											</div>
										</div>
									</div>
								</div>

								<div class="flex items-center gap-4">
									<div class="text-right">
										<div class="text-sm text-neutral-600">Esfuerzo</div>
										<div class="text-xl font-bold {phase.textColor}">{phase.effort}</div>
										<div class="text-xs text-neutral-500 line-through">
											{phase.effortOriginal}
										</div>
									</div>
									<ChevronDown
										class="w-6 h-6 {phase.textColor} transition-transform duration-300 {expandedPhase ===
										index
											? 'rotate-180'
											: ''}"
									/>
								</div>
							</button>

							<!-- Components List (Expandable) -->
							{#if expandedPhase === index}
								<div class="p-6 bg-white border-t-2 {phase.borderColor}">
									<div class="space-y-4">
										{#each phase.components as component}
											<div
												class="p-5 bg-neutral-50 rounded-xl border border-neutral-200 hover:border-{phase.borderColor.replace(
													'border-',
													''
												)} transition-all duration-200"
											>
												<div class="flex items-start justify-between mb-3">
													<div class="flex-1">
														<div class="flex items-center gap-3 mb-2">
															<h4 class="text-lg font-semibold text-neutral-900">
																{component.name}
															</h4>
															<span
																class="px-2 py-1 bg-{component.priority === 'Crítico'
																	? 'red'
																	: component.priority === 'Alto'
																		? 'orange'
																		: 'blue'}-100 text-{component.priority === 'Crítico'
																	? 'red'
																	: component.priority === 'Alto'
																		? 'orange'
																		: 'blue'}-700 text-xs font-semibold rounded-full"
															>
																{component.priority}
															</span>
														</div>
														<p class="text-sm text-neutral-600 mb-3">
															{component.responsibility}
														</p>

														<!-- Stack -->
														<div class="flex flex-wrap gap-2 mb-3">
															{#each component.stack as tech}
																<code
																	class="px-2 py-1 bg-white border border-neutral-300 text-xs font-mono text-neutral-700 rounded"
																>
																	{tech}
																</code>
															{/each}
														</div>

														<!-- AI Boost -->
														{#if component.aiBoost}
															<div
																class="flex items-start gap-2 p-3 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg"
															>
																<Sparkles class="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
																<div class="text-sm text-purple-700">
																	<strong>IA Boost:</strong>
																	{component.aiBoost}
																</div>
															</div>
														{/if}

														<!-- Technical Details -->
														<details class="mt-3">
															<summary
																class="text-sm text-neutral-600 cursor-pointer hover:text-primary"
															>
																Detalles técnicos
															</summary>
															<p class="text-sm text-neutral-700 mt-2 pl-4 border-l-2 border-neutral-300">
																{component.technical}
															</p>
														</details>
													</div>

													<div class="text-right ml-4">
														<div class="text-sm text-neutral-600 mb-1">Esfuerzo</div>
														<div class="flex items-center gap-2">
															<Sparkles class="w-4 h-4 text-success" />
															<span class="text-lg font-bold text-success">{component.effort}</span>
														</div>
														<div class="text-xs text-neutral-500 line-through mt-1">
															{component.effortOriginal}
														</div>
													</div>
												</div>
											</div>
										{/each}
									</div>
								</div>
							{/if}
						</div>
					{/each}
				</div>

				<!-- Footer CTA -->
				<div class="mt-16 text-center">
					<div class="bg-gradient-to-r from-primary to-purple-600 text-white rounded-3xl p-12">
						<div class="flex items-center justify-center gap-3 mb-4">
							<Bot class="w-12 h-12" />
							<h2 class="text-3xl font-bold">Desarrollo Acelerado con IA</h2>
						</div>
						<p class="text-xl mb-8 text-white/90">
							Ahorra <strong>4 meses</strong> de desarrollo con AI-powered development
						</p>
						<div class="flex items-center justify-center gap-4">
							<a
								href="/roadmap"
								class="px-8 py-4 bg-white text-primary font-semibold rounded-xl hover:bg-neutral-100 transition-all duration-200 flex items-center gap-2"
							>
								Ver Roadmap Original
								<ArrowRight class="w-5 h-5" />
							</a>
							<a
								href="/"
								class="px-8 py-4 bg-white/20 backdrop-blur-md text-white font-semibold rounded-xl hover:bg-white/30 transition-all duration-200 border border-white/30"
							>
								Volver al Inicio
							</a>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>
</div>

<style>
	.container-custom {
		max-width: 1400px;
	}
</style>
