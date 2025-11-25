<script>
	import {
		Shield,
		Lock,
		Key,
		Database,
		FileCheck,
		CheckCircle,
		Clock,
		AlertCircle,
		TrendingUp,
		Users,
		Eye,
		Code,
		Server,
		Cloud,
		Layers,
		Activity,
		Award,
		Calendar,
		Target,
		Zap,
		Download,
		ArrowRight
	} from 'lucide-svelte';
	import { onMount } from 'svelte';

	let mounted = $state(false);
	let activeLayer = $state(0); // For security layers
	let activeCert = $state(0); // For certifications

	onMount(() => {
		mounted = true;

		// Rotate active security layer
		const layerInterval = setInterval(() => {
			activeLayer = (activeLayer + 1) % securityLayers.length;
		}, 4000);

		return () => clearInterval(layerInterval);
	});

	const securityLayers = [
		{
			id: 0,
			name: 'Network Security',
			icon: Shield,
			color: 'primary',
			features: [
				'TLS 1.3 encryption en tránsito',
				'Protección DDoS multi-cloud',
				'Web Application Firewall (WAF)',
				'IP whitelisting configurable',
				'Rate limiting por tenant'
			],
			specs: {
				'Encryption': 'TLS 1.3',
				'DDoS Protection': 'Enterprise',
				'WAF Rules': '50+ reglas',
				'Latency': '+2ms overhead'
			}
		},
		{
			id: 1,
			name: 'Application Security',
			icon: Code,
			color: 'success',
			features: [
				'OAuth 2.0 + JWT authentication',
				'SSO enterprise integration',
				'Multi-factor authentication (MFA)',
				'Session management seguro',
				'CSRF & XSS protection'
			],
			specs: {
				'Auth Protocol': 'OAuth 2.0',
				'Token Expiry': '1 hora',
				'MFA': 'TOTP/SMS',
				'Password Policy': 'NIST 800-63'
			}
		},
		{
			id: 2,
			name: 'Data Security',
			icon: Database,
			color: 'warning',
			features: [
				'AES-256 encryption en reposo',
				'Gestión de claves enterprise',
				'Key rotation automático (90 días)',
				'Backup encriptado diario',
				'Data masking en logs'
			],
			specs: {
				'Encryption': 'AES-256-GCM',
				'Key Management': 'Enterprise HSM',
				'Rotation': '90 días',
				'Backup': 'Diario encriptado'
			}
		},
		{
			id: 3,
			name: 'Access Control',
			icon: Lock,
			color: 'danger',
			features: [
				'Row-Level Security (RLS) por tenant',
				'Role-Based Access Control (RBAC)',
				'Least privilege principle',
				'Audit log de todos los accesos',
				'Segregación de funciones'
			],
			specs: {
				'Model': 'RBAC + RLS',
				'Roles': '5 niveles',
				'Audit': '100% accesos',
				'Isolation': 'Tenant-level'
			}
		}
	];

	const certifications = [
		{
			name: 'SOC 2 Type I',
			status: 'En Proceso',
			progress: 75,
			date: 'Q2 2026',
			quarter: 'Q2',
			year: '2026',
			icon: Award,
			description: 'Seguridad, disponibilidad, integridad de procesamiento',
			details: [
				'Auditoría externa en curso',
				'Controles implementados: 85/100',
				'Documentación: 90% completa',
				'Auditor: Firma Big 4'
			],
			color: 'primary'
		},
		{
			name: 'ISO 27001',
			status: 'En Proceso',
			progress: 45,
			date: 'Q4 2026',
			quarter: 'Q4',
			year: '2026',
			icon: Shield,
			description: 'Sistema de gestión de seguridad de la información',
			details: [
				'Gap analysis completado',
				'Políticas definidas: 60/80',
				'Certificación programada: Dic 2026',
				'Certificadora: BSI Group'
			],
			color: 'success'
		},
		{
			name: 'Penetration Testing',
			status: 'Activo',
			progress: 100,
			date: 'Trimestral',
			quarter: 'Q1-Q4',
			year: '2026',
			icon: Target,
			description: 'Testing de seguridad por firma especializada',
			details: [
				'Última prueba: Enero 2026',
				'Vulnerabilidades críticas: 0',
				'Vulnerabilidades medias: 2 (resueltas)',
				'Próxima prueba: Abril 2026'
			],
			color: 'warning'
		},
		{
			name: 'CONSAR Compliance',
			status: 'Certificado',
			progress: 100,
			date: '2026',
			quarter: 'Activo',
			year: '2026',
			icon: CheckCircle,
			description: 'Cumplimiento normativo CONSAR México',
			details: [
				'30+ validaciones base (extensibles)',
				'Event sourcing 7+ años',
				'Auditoría completa disponible',
				'Certificado vigente'
			],
			color: 'success'
		}
	];

	const complianceFeatures = [
		{
			category: 'Event Sourcing & Auditoría',
			icon: FileCheck,
			items: [
				{
					name: 'Inmutabilidad garantizada',
					description: 'Append-only event store con hash chain verification',
					status: 'implemented'
				},
				{
					name: 'Reconstrucción de estado',
					description: 'Replay de eventos en cualquier punto temporal',
					status: 'implemented'
				},
				{
					name: 'Retención 7+ años',
					description: 'Cumplimiento CONSAR con archivado automático',
					status: 'implemented'
				},
				{
					name: 'Audit trail completo',
					description: 'Usuario, timestamp, IP, user-agent en cada evento',
					status: 'implemented'
				}
			]
		},
		{
			category: 'Multi-Tenancy & Isolation',
			icon: Layers,
			items: [
				{
					name: 'Row-Level Security',
					description: 'Aislamiento completo por AFORE',
					status: 'implemented'
				},
				{
					name: 'Tenant ID en cada query',
					description: 'Imposible acceder a datos de otro tenant',
					status: 'implemented'
				},
				{
					name: 'Recursos dedicados',
					description: 'Instancias serverless por tenant en alta carga',
					status: 'implemented'
				},
				{
					name: 'Segregación de backups',
					description: 'Backups separados por tenant con encriptación única',
					status: 'implemented'
				}
			]
		},
		{
			category: 'Monitoring & Incident Response',
			icon: Activity,
			items: [
				{
					name: 'Monitoring 24/7',
					description: 'Observabilidad cloud enterprise',
					status: 'implemented'
				},
				{
					name: 'Alertas automáticas',
					description: 'PagerDuty integration para incidentes críticos',
					status: 'implemented'
				},
				{
					name: 'Incident response plan',
					description: 'Proceso documentado con RTO < 4h, RPO < 1h',
					status: 'implemented'
				},
				{
					name: 'Post-mortem públicos',
					description: 'Transparencia total en incidentes (para clientes)',
					status: 'planned'
				}
			]
		}
	];

	const penetrationResults = {
		lastTest: 'Enero 2026',
		firm: 'CyberSecurity Partners',
		duration: '2 semanas',
		scope: 'API, Web App, Infrastructure',
		findings: {
			critical: 0,
			high: 0,
			medium: 2,
			low: 5,
			info: 12
		},
		resolved: {
			critical: 0,
			high: 0,
			medium: 2,
			low: 3,
			info: 8
		}
	};

	function selectLayer(index) {
		activeLayer = index;
	}

	function selectCert(index) {
		activeCert = index;
	}
</script>

<!-- Security & Compliance Section -->
<section
	id="security"
	class="relative py-24 px-4 md:px-8 bg-gradient-to-b from-white via-neutral-50 to-white overflow-hidden"
>
	<!-- Background decoration -->
	<div class="absolute inset-0 opacity-[0.02]">
		<div
			class="absolute inset-0"
			style="background-image: radial-gradient(circle at 1px 1px, rgb(0 102 255) 1px, transparent 0); background-size: 40px 40px;"
		></div>
	</div>

	<div class="container-custom relative z-10">
		<!-- Section Header -->
		<div class="text-center mb-16 {mounted ? 'animate-fade-in-up' : 'opacity-0'}">
			<div
				class="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/10 to-success/10 border border-primary/20 rounded-full text-sm font-medium text-primary mb-4"
			>
				<Shield class="w-4 h-4" />
				Seguridad y Compliance Enterprise
			</div>
			<h2 class="text-4xl md:text-5xl font-bold text-primary-dark mb-4">
				Arquitectura de Seguridad
				<span class="bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
					Multi-Capa
				</span>
			</h2>
			<p class="text-xl text-neutral-600 max-w-3xl mx-auto">
				4 capas de seguridad, certificaciones enterprise, y cumplimiento normativo garantizado
				para instituciones financieras.
			</p>
		</div>

		<!-- Security Layers Interactive -->
		<div class="mb-20 {mounted ? 'animate-fade-in-up delay-300' : 'opacity-0'}">
			<h3 class="text-2xl font-bold text-center text-neutral-900 mb-8">
				Capas de Seguridad Implementadas
			</h3>

			<!-- Layer Selector -->
			<div class="flex flex-wrap justify-center gap-4 mb-12">
				{#each securityLayers as layer, index}
					{@const LayerIcon = layer.icon}
					<button
						onclick={() => selectLayer(index)}
						class="px-6 py-4 rounded-2xl font-semibold transition-all duration-300 flex items-center gap-3 {activeLayer ===
						index
							? 'bg-gradient-to-r from-primary to-primary-dark text-white shadow-xl scale-105'
							: 'bg-white border-2 border-neutral-200 text-neutral-700 hover:border-primary/30'}"
					>
						<LayerIcon class="w-5 h-5" />
						<span>{layer.name}</span>
					</button>
				{/each}
			</div>

			<!-- Active Layer Content -->
			{#each securityLayers as layer, index}
				{#if activeLayer === index}
					{@const LayerIcon = layer.icon}
					<div class="animate-fade-in-up">
						<div
							class="grid lg:grid-cols-2 gap-12 bg-white rounded-3xl p-8 md:p-12 shadow-2xl border-2 border-{layer.color}/20"
						>
							<!-- Left: Features -->
							<div>
								<div
									class="w-20 h-20 bg-gradient-to-br from-{layer.color}/20 to-{layer.color}/10 rounded-2xl flex items-center justify-center mb-6"
								>
									<LayerIcon class="w-10 h-10 text-{layer.color}" />
								</div>

								<h4 class="text-3xl font-bold text-neutral-900 mb-6">{layer.name}</h4>

								<ul class="space-y-4">
									{#each layer.features as feature}
										<li class="flex items-start gap-3">
											<CheckCircle class="w-5 h-5 text-{layer.color} flex-shrink-0 mt-0.5" />
											<span class="text-neutral-700">{feature}</span>
										</li>
									{/each}
								</ul>
							</div>

							<!-- Right: Specs -->
							<div>
								<h5 class="font-semibold text-neutral-900 mb-6 flex items-center gap-2">
									<Code class="w-5 h-5 text-{layer.color}" />
									Especificaciones Técnicas
								</h5>

								<div class="space-y-4">
									{#each Object.entries(layer.specs) as [key, value]}
										<div
											class="p-4 bg-gradient-to-br from-neutral-50 to-white border border-neutral-200 rounded-xl"
										>
											<div class="text-sm text-neutral-500 mb-1">{key}</div>
											<div class="text-lg font-bold text-{layer.color}">{value}</div>
										</div>
									{/each}
								</div>

								<!-- Layer indicator -->
								<div class="mt-8 p-6 bg-{layer.color}/5 border border-{layer.color}/20 rounded-xl">
									<div class="flex items-center gap-2 mb-2">
										<Eye class="w-5 h-5 text-{layer.color}" />
										<span class="font-semibold text-neutral-900">Capa {index + 1} de 4</span>
									</div>
									<p class="text-sm text-neutral-600">
										Seguridad en profundidad (Defense in Depth) - Múltiples capas redundantes
										garantizan protección incluso si una capa falla.
									</p>
								</div>
							</div>
						</div>
					</div>
				{/if}
			{/each}
		</div>

		<!-- Certifications Timeline -->
		<div class="mb-20 {mounted ? 'animate-fade-in-up delay-500' : 'opacity-0'}">
			<h3 class="text-2xl font-bold text-center text-neutral-900 mb-12">
				Roadmap de Certificaciones
			</h3>

			<div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
				{#each certifications as cert}
					{@const CertIcon = cert.icon}
					<button
						onclick={() => selectCert(certifications.indexOf(cert))}
						class="p-6 bg-white border-2 rounded-2xl transition-all duration-300 text-left {activeCert ===
						certifications.indexOf(cert)
							? 'border-' + cert.color + '/40 shadow-xl scale-105'
							: 'border-neutral-200 hover:border-' + cert.color + '/30'}"
					>
						<div class="flex items-center justify-between mb-4">
							<div
								class="w-12 h-12 bg-{cert.color}/10 rounded-xl flex items-center justify-center"
							>
								<CertIcon class="w-6 h-6 text-{cert.color}" />
							</div>
							<span
								class="px-3 py-1 bg-{cert.color}/10 text-{cert.color} text-xs font-bold rounded-full"
							>
								{cert.status}
							</span>
						</div>

						<h4 class="font-bold text-neutral-900 mb-2">{cert.name}</h4>
						<p class="text-sm text-neutral-600 mb-4">{cert.description}</p>

						<!-- Progress bar -->
						<div class="mb-2">
							<div class="flex items-center justify-between text-xs mb-1">
								<span class="text-neutral-500">Progreso</span>
								<span class="font-bold text-{cert.color}">{cert.progress}%</span>
							</div>
							<div class="h-2 bg-neutral-100 rounded-full overflow-hidden">
								<div
									class="h-full bg-{cert.color} transition-all duration-1000"
									style="width: {cert.progress}%"
								></div>
							</div>
						</div>

						<div class="flex items-center gap-2 text-xs text-neutral-500">
							<Calendar class="w-3 h-3" />
							{cert.date}
						</div>
					</button>
				{/each}
			</div>

			<!-- Active Cert Details -->
			{#each certifications as cert, index}
				{#if activeCert === index}
					<div class="mt-8 animate-fade-in-up">
						<div
							class="p-8 bg-gradient-to-br from-{cert.color}/5 to-white border-2 border-{cert.color}/20 rounded-3xl"
						>
							<h4 class="text-2xl font-bold text-neutral-900 mb-6">
								Detalles: {cert.name}
							</h4>
							<div class="grid md:grid-cols-2 gap-6">
								{#each cert.details as detail}
									<div class="flex items-start gap-3">
										<CheckCircle class="w-5 h-5 text-{cert.color} flex-shrink-0 mt-0.5" />
										<span class="text-neutral-700">{detail}</span>
									</div>
								{/each}
							</div>
						</div>
					</div>
				{/if}
			{/each}
		</div>

		<!-- Compliance Features -->
		<div class="mb-20 {mounted ? 'animate-fade-in-up delay-700' : 'opacity-0'}">
			<h3 class="text-2xl font-bold text-center text-neutral-900 mb-12">
				Características de Compliance
			</h3>

			<div class="grid lg:grid-cols-3 gap-8">
				{#each complianceFeatures as category}
					{@const CategoryIcon = category.icon}
					<div
						class="p-8 bg-white border-2 border-neutral-200 rounded-3xl hover:border-primary/30 hover:shadow-xl transition-all duration-300"
					>
						<div class="flex items-center gap-3 mb-6">
							<div class="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
								<CategoryIcon class="w-6 h-6 text-primary" />
							</div>
							<h4 class="font-bold text-neutral-900">{category.category}</h4>
						</div>

						<div class="space-y-4">
							{#each category.items as item}
								<div class="group">
									<div class="flex items-start gap-3 mb-2">
										<div
											class="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 {item.status ===
											'implemented'
												? 'border-success bg-success'
												: 'border-neutral-300 bg-white'}"
										>
											{#if item.status === 'implemented'}
												<CheckCircle class="w-3 h-3 text-white" />
											{:else}
												<Clock class="w-3 h-3 text-neutral-400" />
											{/if}
										</div>
										<div class="flex-1">
											<div class="font-semibold text-neutral-900 text-sm mb-1">
												{item.name}
											</div>
											<div class="text-xs text-neutral-600">{item.description}</div>
										</div>
									</div>
								</div>
							{/each}
						</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- Penetration Testing Results -->
		<div class="mb-12 {mounted ? 'animate-fade-in-up delay-900' : 'opacity-0'}">
			<h3 class="text-2xl font-bold text-center text-neutral-900 mb-8">
				Resultados Penetration Testing
			</h3>

			<div
				class="max-w-4xl mx-auto p-8 bg-gradient-to-br from-white to-neutral-50 border-2 border-neutral-200 rounded-3xl"
			>
				<div class="grid md:grid-cols-4 gap-6 mb-8">
					<div class="text-center">
						<div class="text-sm text-neutral-500 mb-2">Última Prueba</div>
						<div class="font-bold text-neutral-900">{penetrationResults.lastTest}</div>
					</div>
					<div class="text-center">
						<div class="text-sm text-neutral-500 mb-2">Firma</div>
						<div class="font-bold text-neutral-900">{penetrationResults.firm}</div>
					</div>
					<div class="text-center">
						<div class="text-sm text-neutral-500 mb-2">Duración</div>
						<div class="font-bold text-neutral-900">{penetrationResults.duration}</div>
					</div>
					<div class="text-center">
						<div class="text-sm text-neutral-500 mb-2">Alcance</div>
						<div class="font-bold text-neutral-900 text-sm">{penetrationResults.scope}</div>
					</div>
				</div>

				<div class="grid grid-cols-5 gap-4">
					<div class="text-center p-4 bg-danger/5 border border-danger/20 rounded-xl">
						<div class="text-3xl font-bold text-danger mb-1">
							{penetrationResults.findings.critical}
						</div>
						<div class="text-xs text-neutral-600">Críticas</div>
					</div>
					<div class="text-center p-4 bg-warning/5 border border-warning/20 rounded-xl">
						<div class="text-3xl font-bold text-warning mb-1">
							{penetrationResults.findings.high}
						</div>
						<div class="text-xs text-neutral-600">Altas</div>
					</div>
					<div class="text-center p-4 bg-primary/5 border border-primary/20 rounded-xl">
						<div class="text-3xl font-bold text-primary mb-1">
							{penetrationResults.findings.medium}
						</div>
						<div class="text-xs text-neutral-600">Medias</div>
					</div>
					<div class="text-center p-4 bg-success/5 border border-success/20 rounded-xl">
						<div class="text-3xl font-bold text-success mb-1">
							{penetrationResults.findings.low}
						</div>
						<div class="text-xs text-neutral-600">Bajas</div>
					</div>
					<div class="text-center p-4 bg-neutral-100 border border-neutral-200 rounded-xl">
						<div class="text-3xl font-bold text-neutral-600 mb-1">
							{penetrationResults.findings.info}
						</div>
						<div class="text-xs text-neutral-600">Info</div>
					</div>
				</div>

				<div class="mt-6 p-4 bg-success/10 border border-success/30 rounded-xl flex items-start gap-3">
					<CheckCircle class="w-6 h-6 text-success flex-shrink-0 mt-0.5" />
					<div>
						<div class="font-semibold text-success mb-1">Estado: Seguro</div>
						<div class="text-sm text-neutral-700">
							{penetrationResults.resolved.medium}/{penetrationResults.findings.medium} vulnerabilidades
							medias resueltas. Próxima prueba programada para Abril 2026.
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- CTA -->
		<div class="text-center {mounted ? 'animate-fade-in-up delay-1000' : 'opacity-0'}">
			<div
				class="inline-block p-8 bg-gradient-to-br from-primary/5 to-success/5 rounded-2xl border border-primary/20"
			>
				<p class="text-lg text-neutral-700 mb-6 max-w-2xl">
					¿Necesita documentación de seguridad completa para su comité de riesgos?
					<span class="font-bold text-primary">Descargue nuestro Security Whitepaper.</span>
				</p>
				<a
					href="#contact"
					class="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
				>
					<Download class="w-5 h-5" />
					<span>Descargar Security Whitepaper</span>
					<ArrowRight class="w-5 h-5 group-hover:translate-x-1 transition-transform" />
				</a>
			</div>
		</div>
	</div>
</section>

<style>
	@keyframes fade-in-up {
		from {
			opacity: 0;
			transform: translateY(30px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.animate-fade-in-up {
		animation: fade-in-up 0.8s ease-out forwards;
	}

	.delay-300 {
		animation-delay: 300ms;
	}

	.delay-500 {
		animation-delay: 500ms;
	}

	.delay-700 {
		animation-delay: 700ms;
	}

	.delay-900 {
		animation-delay: 900ms;
	}

	.delay-1000 {
		animation-delay: 1000ms;
	}
</style>

