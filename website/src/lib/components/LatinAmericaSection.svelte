<script>
	import {
		Globe,
		Building2,
		CheckCircle2,
		Clock,
		FileText,
		Shield,
		TrendingUp,
		Users,
		Calendar,
		MapPin,
		Target,
		Zap,
		ArrowRight,
		ChevronRight,
		AlertCircle,
		Award,
		Database,
		BarChart3,
		Activity
	} from 'lucide-svelte';
	import { onMount } from 'svelte';

	let mounted = $state(false);
	let activeCountry = $state('mexico');
	let activeTab = $state('overview'); // 'overview', 'regulations', 'roadmap'

	onMount(() => {
		mounted = true;
	});

	const countries = [
		{
			id: 'mexico',
			name: 'México',
			flag: '🇲🇽',
			status: 'active',
			statusLabel: 'Activo en Producción',
			regulator: {
				name: 'CONSAR',
				fullName: 'Comisión Nacional del Sistema de Ahorro para el Retiro',
				website: 'www.consar.gob.mx'
			},
			metrics: {
				afores: 2,
				aforeNames: ['AFORE Principal', 'AFORE XXX'],
				filesPerMonth: '10,000+',
				validations: 37,
				uptime: '99.9%',
				goLiveDate: 'Enero 2024'
			},
			marketInfo: {
				totalAfores: 10,
				marketSize: '4.2M trabajadores',
				regulatoryComplexity: 'Alta',
				participants: '68M cuentas'
			},
			regulations: [
				{
					category: 'Archivos Obligatorios',
					icon: FileText,
					items: [
						{ name: 'Archivo de Aportaciones', frequency: 'Bimestral', format: 'CSV/TXT' },
						{ name: 'Archivo de Traspasos', frequency: 'Mensual', format: 'CSV/TXT' },
						{ name: 'Archivo de Retiros', frequency: 'Mensual', format: 'CSV/TXT' },
						{ name: 'Archivo de Pensiones', frequency: 'Mensual', format: 'CSV/TXT' }
					]
				},
				{
					category: 'Validaciones Críticas',
					icon: Shield,
					items: [
						{ name: 'Estructura de campos', count: '12 validadores', priority: 'Crítica' },
						{ name: 'Formato de datos', count: '8 validadores', priority: 'Alta' },
						{ name: 'Reglas de negocio', count: '10 validadores', priority: 'Crítica' },
						{ name: 'Integridad referencial', count: '7 validadores', priority: 'Media' }
					]
				},
				{
					category: 'Reportes Regulatorios',
					icon: BarChart3,
					items: [
						{ name: 'Reporte de Cumplimiento', frequency: 'Mensual', automated: true },
						{ name: 'Estadísticas de Validación', frequency: 'Semanal', automated: true },
						{ name: 'Auditoría de Operaciones', frequency: 'Trimestral', automated: true },
						{ name: 'Incidencias y Resoluciones', frequency: 'Mensual', automated: true }
					]
				}
			],
			roadmap: [
				{
					phase: 'Fase 1 - Validación Core',
					status: 'completed',
					date: 'Q4 2023',
					items: ['30+ validaciones base CONSAR', 'API REST v1', 'Dashboard básico']
				},
				{
					phase: 'Fase 2 - Producción',
					status: 'completed',
					date: 'Q1 2024',
					items: ['2 AFOREs activas', 'Event sourcing', 'SLA 99.9%']
				},
				{
					phase: 'Fase 3 - Escala',
					status: 'in_progress',
					date: 'Q2 2026',
					items: ['Auto-scaling', 'ML predictions', 'Advanced analytics']
				},
				{
					phase: 'Fase 4 - Expansión',
					status: 'planned',
					date: 'Q3 2026',
					items: ['5+ AFOREs', 'White-label', 'Custom validations']
				}
			],
			features: [
				'Validaciones CONSAR 2026 completas',
				'Integración con PROCESAR',
				'Soporte multi-fondo (Básica, Ahorro, etc.)',
				'Reportes regulatorios automatizados',
				'Auditoría completa 7+ años',
				'SLA 99.9% garantizado'
			]
		},
		{
			id: 'chile',
			name: 'Chile',
			flag: '🇨🇱',
			status: 'development',
			statusLabel: 'En Desarrollo',
			regulator: {
				name: 'SuperPensiones',
				fullName: 'Superintendencia de Pensiones',
				website: 'www.spensiones.cl'
			},
			metrics: {
				afores: 0,
				aforeNames: [],
				filesPerMonth: 'Próximamente',
				validations: 28,
				uptime: 'N/A',
				goLiveDate: 'Q3 2026'
			},
			marketInfo: {
				totalAfores: 6,
				marketSize: '2.8M trabajadores',
				regulatoryComplexity: 'Media-Alta',
				participants: '11M afiliados'
			},
			regulations: [
				{
					category: 'Archivos Obligatorios',
					icon: FileText,
					items: [
						{ name: 'Archivo de Cotizaciones', frequency: 'Mensual', format: 'CSV/XML' },
						{ name: 'Archivo de Traspasos AFP', frequency: 'Mensual', format: 'CSV/XML' },
						{ name: 'Archivo de Pensiones', frequency: 'Mensual', format: 'CSV/XML' }
					]
				},
				{
					category: 'Validaciones Adaptadas',
					icon: Shield,
					items: [
						{ name: 'Estructura específica AFP', count: '10 validadores', priority: 'Crítica' },
						{ name: 'Formato datos chilenos', count: '6 validadores', priority: 'Alta' },
						{ name: 'Reglas SuperPensiones', count: '8 validadores', priority: 'Crítica' },
						{ name: 'Validación RUT', count: '4 validadores', priority: 'Alta' }
					]
				}
			],
			roadmap: [
				{
					phase: 'Fase 1 - Investigación',
					status: 'completed',
					date: 'Q2 2024',
					items: ['Análisis regulatorio', 'Mapeo de validaciones', 'Diseño arquitectura']
				},
				{
					phase: 'Fase 2 - Desarrollo',
					status: 'in_progress',
					date: 'Q2 2026',
					items: ['28 validaciones AFP', 'Adaptación API', 'Testing regulatorio']
				},
				{
					phase: 'Fase 3 - Piloto',
					status: 'planned',
					date: 'Q3 2026',
					items: ['1 AFP piloto', 'Certificación SuperPensiones', 'Go-live']
				},
				{
					phase: 'Fase 4 - Expansión',
					status: 'planned',
					date: 'Q4 2026',
					items: ['3+ AFPs', 'Optimizaciones', 'Full compliance']
				}
			],
			features: [
				'Validaciones SuperPensiones en desarrollo',
				'Formato RUT chileno nativo',
				'Integración con sistema AFP',
				'Multifondo (A, B, C, D, E)',
				'Roadmap Q3 2026',
				'Arquitectura cloud-native'
			]
		},
		{
			id: 'colombia',
			name: 'Colombia',
			flag: '🇨🇴',
			status: 'planning',
			statusLabel: 'En Planificación',
			regulator: {
				name: 'SuperFinanciera',
				fullName: 'Superintendencia Financiera de Colombia',
				website: 'www.superfinanciera.gov.co'
			},
			metrics: {
				afores: 0,
				aforeNames: [],
				filesPerMonth: 'Roadmap 2026',
				validations: 0,
				uptime: 'N/A',
				goLiveDate: 'Q4 2026'
			},
			marketInfo: {
				totalAfores: 4,
				marketSize: '1.9M trabajadores',
				regulatoryComplexity: 'Media',
				participants: '16M afiliados'
			},
			regulations: [
				{
					category: 'Regulación Identificada',
					icon: FileText,
					items: [
						{ name: 'Archivo de Aportes', frequency: 'Mensual', format: 'Por definir' },
						{ name: 'Archivo de Traslados', frequency: 'Mensual', format: 'Por definir' },
						{ name: 'Normativa SuperFinanciera', frequency: 'Variable', format: 'En análisis' }
					]
				},
				{
					category: 'Validaciones Estimadas',
					icon: Shield,
					items: [
						{ name: 'Estructura de datos', count: 'Por estimar', priority: 'Crítica' },
						{ name: 'Formato colombiano', count: 'Por estimar', priority: 'Alta' },
						{ name: 'Reglas regulatorias', count: 'Por estimar', priority: 'Crítica' }
					]
				}
			],
			roadmap: [
				{
					phase: 'Fase 1 - Análisis',
					status: 'planned',
					date: 'Q2 2026',
					items: ['Estudio regulatorio', 'Partnership local', 'Definición scope']
				},
				{
					phase: 'Fase 2 - Desarrollo',
					status: 'planned',
					date: 'Q3 2026',
					items: ['Validaciones colombianas', 'Adaptación plataforma', 'Testing']
				},
				{
					phase: 'Fase 3 - Piloto',
					status: 'planned',
					date: 'Q4 2026',
					items: ['1 fondo piloto', 'Certificación', 'Lanzamiento']
				},
				{
					phase: 'Fase 4 - Crecimiento',
					status: 'planned',
					date: 'Q1 2026',
					items: ['Expansión mercado', 'Múltiples fondos', 'Optimización']
				}
			],
			features: [
				'Análisis regulatorio en progreso',
				'Partnership estratégico en desarrollo',
				'Arquitectura multi-país lista',
				'Roadmap Q4 2026 estimado',
				'Soporte SuperFinanciera planeado',
				'Escalabilidad garantizada'
			]
		},
		{
			id: 'peru',
			name: 'Perú',
			flag: '🇵🇪',
			status: 'planning',
			statusLabel: 'En Planificación',
			regulator: {
				name: 'SBS',
				fullName: 'Superintendencia de Banca, Seguros y AFP',
				website: 'www.sbs.gob.pe'
			},
			metrics: {
				afores: 0,
				aforeNames: [],
				filesPerMonth: 'Roadmap 2026',
				validations: 0,
				uptime: 'N/A',
				goLiveDate: 'Q2 2026'
			},
			marketInfo: {
				totalAfores: 4,
				marketSize: '1.5M trabajadores',
				regulatoryComplexity: 'Media',
				participants: '7M afiliados'
			},
			regulations: [
				{
					category: 'Marco Regulatorio',
					icon: FileText,
					items: [
						{ name: 'Normativa SBS', frequency: 'Variable', format: 'En investigación' },
						{ name: 'Archivos AFP', frequency: 'Por definir', format: 'En investigación' },
						{ name: 'Reportes requeridos', frequency: 'Por definir', format: 'En investigación' }
					]
				},
				{
					category: 'Validaciones Futuras',
					icon: Shield,
					items: [
						{ name: 'Reglas SBS', count: 'Por definir', priority: 'Crítica' },
						{ name: 'Formato peruano', count: 'Por definir', priority: 'Alta' },
						{ name: 'Compliance AFP', count: 'Por definir', priority: 'Media' }
					]
				}
			],
			roadmap: [
				{
					phase: 'Fase 1 - Investigación',
					status: 'planned',
					date: 'Q4 2026',
					items: ['Análisis SBS', 'Contacto regulador', 'Estudio de mercado']
				},
				{
					phase: 'Fase 2 - Diseño',
					status: 'planned',
					date: 'Q1 2026',
					items: ['Mapeo validaciones', 'Arquitectura AFP', 'Plan implementación']
				},
				{
					phase: 'Fase 3 - Desarrollo',
					status: 'planned',
					date: 'Q2 2026',
					items: ['Build validaciones', 'Testing', 'Certificación']
				},
				{
					phase: 'Fase 4 - Lanzamiento',
					status: 'planned',
					date: 'Q3 2026',
					items: ['Piloto AFP', 'Go-live', 'Soporte']
				}
			],
			features: [
				'Roadmap 2026 planificado',
				'Arquitectura escalable lista',
				'Experiencia multi-país aplicable',
				'Investigación regulatoria pendiente',
				'Partnership estratégico futuro',
				'Compliance SBS en diseño'
			]
		}
	];

	$effect(() => {
		const selectedCountry = countries.find((c) => c.id === activeCountry);
	});

	function selectCountry(countryId) {
		activeCountry = countryId;
		activeTab = 'overview';
	}

	const getStatusColor = (status) => {
		switch (status) {
			case 'active':
				return 'success';
			case 'development':
				return 'primary';
			case 'planning':
				return 'warning';
			default:
				return 'neutral';
		}
	};

	const getRoadmapStatusColor = (status) => {
		switch (status) {
			case 'completed':
				return 'success';
			case 'in_progress':
				return 'primary';
			case 'planned':
				return 'neutral';
			default:
				return 'neutral';
		}
	};

	const selectedCountry = $derived(countries.find((c) => c.id === activeCountry));
</script>

<!-- Latin America Coverage Section -->
<section
	class="relative py-24 px-4 md:px-8 bg-gradient-to-br from-neutral-50 via-white to-neutral-50 overflow-hidden"
>
	<!-- Background decoration -->
	<div class="absolute inset-0 opacity-5">
		<div
			class="absolute inset-0"
			style="background-image: radial-gradient(circle at 2px 2px, #0066FF 1px, transparent 0); background-size: 40px 40px;"
		></div>
	</div>

	<!-- Gradient orbs -->
	<div
		class="absolute top-20 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl"
	></div>
	<div
		class="absolute bottom-0 left-0 w-[500px] h-[500px] bg-success/5 rounded-full blur-3xl"
	></div>

	<div class="container-custom relative z-10">
		<!-- Section Header -->
		<div class="text-center mb-16 {mounted ? 'animate-fade-in-up' : 'opacity-0'}">
			<div
				class="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-sm font-medium text-primary mb-4"
			>
				<Globe class="w-4 h-4" />
				Expansión Latinoamericana
			</div>
			<h2 class="text-4xl md:text-5xl font-bold text-primary-dark mb-4">
				Cobertura
				<span class="bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
					Regional Completa
				</span>
			</h2>
			<p class="text-xl text-neutral-600 max-w-3xl mx-auto">
				Comenzamos en México con 2 AFOREs activas. Expandiéndonos a Chile, Colombia y Perú con
				validaciones específicas por país y expertise regulatorio comprobado.
			</p>
		</div>

		<!-- Country Selector -->
		<div class="mb-12 {mounted ? 'animate-fade-in-up delay-200' : 'opacity-0'}">
			<div class="grid md:grid-cols-4 gap-4">
				{#each countries as country}
					{@const statusColor = getStatusColor(country.status)}
					<button
						onclick={() => selectCountry(country.id)}
						class="relative p-6 bg-white border-2 rounded-2xl transition-all duration-300 text-left group hover:shadow-xl hover:-translate-y-1 {activeCountry ===
						country.id
							? `border-${statusColor} shadow-lg shadow-${statusColor}/20`
							: 'border-neutral-200 hover:border-neutral-300'}"
					>
						<!-- Active indicator -->
						{#if activeCountry === country.id}
							<div
								class="absolute inset-0 bg-gradient-to-br from-{statusColor}/5 to-transparent rounded-2xl"
							></div>
						{/if}

						<div class="relative">
							<!-- Flag & Status Badge -->
							<div class="flex items-start justify-between mb-3">
								<span class="text-5xl">{country.flag}</span>
								<span
									class="px-2 py-1 bg-{statusColor}/10 text-{statusColor} text-xs font-semibold rounded-full"
								>
									{country.status === 'active'
										? 'Activo'
										: country.status === 'development'
											? 'En Desarrollo'
											: 'Planeado'}
								</span>
							</div>

							<!-- Country Info -->
							<h3 class="text-xl font-bold text-primary-dark mb-1">{country.name}</h3>
							<p class="text-sm text-neutral-600 mb-3">{country.regulator.name}</p>

							<!-- Metrics Preview -->
							<div class="space-y-2">
								{#if country.status === 'active'}
									<div class="flex items-center gap-2 text-sm">
										<Building2 class="w-4 h-4 text-success" />
										<span class="text-neutral-700"
											><strong>{country.metrics.afores}</strong> AFOREs activas</span
										>
									</div>
									<div class="flex items-center gap-2 text-sm">
										<Shield class="w-4 h-4 text-success" />
										<span class="text-neutral-700"
											><strong>{country.metrics.validations}</strong> validaciones</span
										>
									</div>
								{:else if country.status === 'development'}
									<div class="flex items-center gap-2 text-sm">
										<Clock class="w-4 h-4 text-primary" />
										<span class="text-neutral-700">Go-live {country.metrics.goLiveDate}</span>
									</div>
									<div class="flex items-center gap-2 text-sm">
										<Activity class="w-4 h-4 text-primary" />
										<span class="text-neutral-700"
											>{country.metrics.validations} validaciones en desarrollo</span
										>
									</div>
								{:else}
									<div class="flex items-center gap-2 text-sm">
										<Target class="w-4 h-4 text-warning" />
										<span class="text-neutral-700">Roadmap {country.metrics.goLiveDate}</span>
									</div>
									<div class="flex items-center gap-2 text-sm">
										<MapPin class="w-4 h-4 text-warning" />
										<span class="text-neutral-700">{country.marketInfo.totalAfores} AFPs/AFOREs</span
										>
									</div>
								{/if}
							</div>

							<!-- Chevron indicator -->
							{#if activeCountry === country.id}
								<div class="absolute -bottom-4 left-1/2 -translate-x-1/2">
									<div class="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-{statusColor}"></div>
								</div>
							{/if}
						</div>
					</button>
				{/each}
			</div>
		</div>

		<!-- Country Details Panel -->
		{#if selectedCountry}
			<div class="mb-12 {mounted ? 'animate-fade-in-up delay-400' : 'opacity-0'}">
				<!-- Tab Navigation -->
				<div class="flex gap-2 mb-8 border-b border-neutral-200">
					<button
						onclick={() => (activeTab = 'overview')}
						class="px-6 py-3 font-semibold transition-all duration-300 border-b-2 {activeTab ===
						'overview'
							? 'border-primary text-primary'
							: 'border-transparent text-neutral-600 hover:text-primary'}"
					>
						Resumen General
					</button>
					<button
						onclick={() => (activeTab = 'regulations')}
						class="px-6 py-3 font-semibold transition-all duration-300 border-b-2 {activeTab ===
						'regulations'
							? 'border-primary text-primary'
							: 'border-transparent text-neutral-600 hover:text-primary'}"
					>
						Marco Regulatorio
					</button>
					<button
						onclick={() => (activeTab = 'roadmap')}
						class="px-6 py-3 font-semibold transition-all duration-300 border-b-2 {activeTab ===
						'roadmap'
							? 'border-primary text-primary'
							: 'border-transparent text-neutral-600 hover:text-primary'}"
					>
						Roadmap
					</button>
				</div>

				<!-- Tab Content -->
				<div class="min-h-[500px]">
					<!-- Overview Tab -->
					{#if activeTab === 'overview'}
						<div class="grid lg:grid-cols-2 gap-8">
							<!-- Left Column: Market & Regulator Info -->
							<div class="space-y-6">
								<!-- Regulator Card -->
								<div class="p-6 bg-white border border-neutral-200 rounded-2xl shadow-sm">
									<div class="flex items-start gap-4 mb-4">
										<div class="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
											<Shield class="w-6 h-6 text-primary" />
										</div>
										<div class="flex-1">
											<h4 class="text-sm text-neutral-600 mb-1">Regulador</h4>
											<h3 class="text-xl font-bold text-primary-dark">
												{selectedCountry.regulator.name}
											</h3>
											<p class="text-sm text-neutral-600 mt-1">
												{selectedCountry.regulator.fullName}
											</p>
										</div>
									</div>
									<div class="pt-4 border-t border-neutral-200">
										<a
											href="https://{selectedCountry.regulator.website}"
											target="_blank"
											rel="noopener noreferrer"
											class="inline-flex items-center gap-2 text-sm text-primary hover:text-primary-dark font-medium"
										>
											<Globe class="w-4 h-4" />
											{selectedCountry.regulator.website}
											<ArrowRight class="w-4 h-4" />
										</a>
									</div>
								</div>

								<!-- Market Info Card -->
								<div class="p-6 bg-white border border-neutral-200 rounded-2xl shadow-sm">
									<div class="flex items-center gap-3 mb-6">
										<div class="w-10 h-10 bg-success/10 rounded-xl flex items-center justify-center">
											<BarChart3 class="w-5 h-5 text-success" />
										</div>
										<h3 class="text-lg font-bold text-primary-dark">Información de Mercado</h3>
									</div>

									<div class="grid grid-cols-2 gap-4">
										<div class="p-4 bg-neutral-50 rounded-xl">
											<div class="text-2xl font-bold text-primary-dark mb-1">
												{selectedCountry.marketInfo.totalAfores}
											</div>
											<div class="text-xs text-neutral-600">AFPs/AFOREs</div>
										</div>
										<div class="p-4 bg-neutral-50 rounded-xl">
											<div class="text-2xl font-bold text-primary-dark mb-1">
												{selectedCountry.marketInfo.marketSize}
											</div>
											<div class="text-xs text-neutral-600">Trabajadores</div>
										</div>
										<div class="p-4 bg-neutral-50 rounded-xl">
											<div class="text-2xl font-bold text-primary-dark mb-1">
												{selectedCountry.marketInfo.participants}
											</div>
											<div class="text-xs text-neutral-600">Participantes</div>
										</div>
										<div class="p-4 bg-neutral-50 rounded-xl">
											<div class="text-sm font-bold text-primary-dark mb-1">
												{selectedCountry.marketInfo.regulatoryComplexity}
											</div>
											<div class="text-xs text-neutral-600">Complejidad</div>
										</div>
									</div>
								</div>

								<!-- Status Card -->
								<div class="p-6 bg-white border border-neutral-200 rounded-2xl shadow-sm">
									<div class="flex items-center gap-3 mb-6">
										<div
											class="w-10 h-10 bg-{getStatusColor(
												selectedCountry.status
											)}/10 rounded-xl flex items-center justify-center"
										>
											{#if selectedCountry.status === 'active'}
												<CheckCircle2 class="w-5 h-5 text-success" />
											{:else if selectedCountry.status === 'development'}
												<Zap class="w-5 h-5 text-primary" />
											{:else}
												<Clock class="w-5 h-5 text-warning" />
											{/if}
										</div>
										<div>
											<h3 class="text-lg font-bold text-primary-dark">Estado Actual</h3>
											<p class="text-sm text-neutral-600">{selectedCountry.statusLabel}</p>
										</div>
									</div>

									<div class="space-y-3">
										<div class="flex items-center justify-between">
											<span class="text-sm text-neutral-600">AFOREs/AFPs:</span>
											<span class="font-semibold text-primary-dark"
												>{selectedCountry.metrics.afores || 'Próximamente'}</span
											>
										</div>
										<div class="flex items-center justify-between">
											<span class="text-sm text-neutral-600">Validaciones:</span>
											<span class="font-semibold text-primary-dark"
												>{selectedCountry.metrics.validations || 'En desarrollo'}</span
											>
										</div>
										<div class="flex items-center justify-between">
											<span class="text-sm text-neutral-600">Archivos/Mes:</span>
											<span class="font-semibold text-primary-dark"
												>{selectedCountry.metrics.filesPerMonth}</span
											>
										</div>
										{#if selectedCountry.status === 'active'}
											<div class="flex items-center justify-between">
												<span class="text-sm text-neutral-600">Uptime:</span>
												<span class="font-semibold text-success"
													>{selectedCountry.metrics.uptime}</span
												>
											</div>
										{/if}
										<div class="flex items-center justify-between pt-3 border-t border-neutral-200">
											<span class="text-sm text-neutral-600">Go-Live:</span>
											<span class="font-semibold text-primary"
												>{selectedCountry.metrics.goLiveDate}</span
											>
										</div>
									</div>
								</div>
							</div>

							<!-- Right Column: Features & Capabilities -->
							<div class="space-y-6">
								<!-- Features List -->
								<div class="p-6 bg-white border border-neutral-200 rounded-2xl shadow-sm">
									<div class="flex items-center gap-3 mb-6">
										<div class="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
											<Award class="w-5 h-5 text-primary" />
										</div>
										<h3 class="text-lg font-bold text-primary-dark">Características y Capacidades</h3>
									</div>

									<ul class="space-y-3">
										{#each selectedCountry.features as feature}
											<li class="flex items-start gap-3 group">
												<div class="flex-shrink-0 mt-0.5">
													<CheckCircle2 class="w-5 h-5 text-success group-hover:scale-110 transition-transform" />
												</div>
												<span class="text-neutral-700">{feature}</span>
											</li>
										{/each}
									</ul>
								</div>

								<!-- Active AFOREs (if applicable) -->
								{#if selectedCountry.status === 'active' && selectedCountry.metrics.aforeNames.length > 0}
									<div class="p-6 bg-gradient-to-br from-success/10 to-primary/10 border border-success/20 rounded-2xl">
										<div class="flex items-center gap-3 mb-4">
											<div class="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
												<Building2 class="w-5 h-5 text-success" />
											</div>
											<h3 class="text-lg font-bold text-primary-dark">AFOREs en Producción</h3>
										</div>

										<div class="space-y-2">
											{#each selectedCountry.metrics.aforeNames as afore}
												<div class="p-3 bg-white rounded-xl flex items-center justify-between">
													<span class="font-semibold text-neutral-900">{afore}</span>
													<span
														class="px-2 py-1 bg-success/10 text-success text-xs font-semibold rounded-full"
													>
														Activo
													</span>
												</div>
											{/each}
										</div>
									</div>
								{/if}

								<!-- Call to Action -->
								<div class="p-6 bg-gradient-to-br from-primary to-primary-dark text-white rounded-2xl">
									<h3 class="text-xl font-bold mb-2">
										{selectedCountry.status === 'active'
											? '¿Listo para unirse?'
											: selectedCountry.status === 'development'
												? '¿Interesado en el piloto?'
												: '¿Quiere ser el primero?'}
									</h3>
									<p class="text-white/90 mb-4">
										{selectedCountry.status === 'active'
											? 'Únase a las AFOREs que ya confían en Hergon en ' + selectedCountry.name
											: selectedCountry.status === 'development'
												? 'Sea parte del programa piloto en ' + selectedCountry.name
												: 'Regístrese para actualizaciones sobre ' + selectedCountry.name}
									</p>
									<a
										href="#contact"
										class="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary font-semibold rounded-xl hover:bg-neutral-100 transition-all duration-300 hover:scale-105 group"
									>
										<span>Contactar Ahora</span>
										<ArrowRight class="w-5 h-5 group-hover:translate-x-1 transition-transform" />
									</a>
								</div>
							</div>
						</div>
					{/if}

					<!-- Regulations Tab -->
					{#if activeTab === 'regulations'}
						<div class="space-y-6">
							<div class="p-6 bg-white border border-neutral-200 rounded-2xl shadow-sm mb-6">
								<div class="flex items-center gap-3">
									<FileText class="w-6 h-6 text-primary" />
									<div>
										<h3 class="text-xl font-bold text-primary-dark">
											Marco Regulatorio - {selectedCountry.name}
										</h3>
										<p class="text-sm text-neutral-600">
											{selectedCountry.status === 'active'
												? 'Validaciones activas en producción'
												: selectedCountry.status === 'development'
													? 'En desarrollo y adaptación'
													: 'En investigación y análisis'}
										</p>
									</div>
								</div>
							</div>

							<div class="grid lg:grid-cols-3 gap-6">
								{#each selectedCountry.regulations as category}
									{@const CategoryIcon = category.icon}
									<div class="p-6 bg-white border border-neutral-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
										<div class="flex items-center gap-3 mb-6">
											<div class="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
												<CategoryIcon class="w-5 h-5 text-primary" />
											</div>
											<h4 class="text-lg font-bold text-primary-dark">{category.category}</h4>
										</div>

										<div class="space-y-4">
											{#each category.items as item}
												<div class="p-4 bg-neutral-50 rounded-xl">
													<div class="font-semibold text-neutral-900 mb-2">{item.name}</div>
													<div class="space-y-1">
														{#if item.frequency}
															<div class="flex items-center justify-between text-sm">
																<span class="text-neutral-600">Frecuencia:</span>
																<span class="font-medium text-neutral-900">{item.frequency}</span>
															</div>
														{/if}
														{#if item.format}
															<div class="flex items-center justify-between text-sm">
																<span class="text-neutral-600">Formato:</span>
																<span class="font-medium text-neutral-900">{item.format}</span>
															</div>
														{/if}
														{#if item.count}
															<div class="flex items-center justify-between text-sm">
																<span class="text-neutral-600">Validadores:</span>
																<span class="font-medium text-neutral-900">{item.count}</span>
															</div>
														{/if}
														{#if item.priority}
															<div class="flex items-center justify-between text-sm">
																<span class="text-neutral-600">Prioridad:</span>
																<span
																	class="px-2 py-0.5 rounded-full text-xs font-semibold {item.priority ===
																	'Crítica'
																		? 'bg-danger/10 text-danger'
																		: item.priority === 'Alta'
																			? 'bg-warning/10 text-warning'
																			: 'bg-primary/10 text-primary'}"
																>
																	{item.priority}
																</span>
															</div>
														{/if}
														{#if item.automated !== undefined}
															<div class="flex items-center justify-between text-sm">
																<span class="text-neutral-600">Automatizado:</span>
																<span class="text-success font-semibold">
																	{item.automated ? 'Sí' : 'No'}
																</span>
															</div>
														{/if}
													</div>
												</div>
											{/each}
										</div>
									</div>
								{/each}
							</div>
						</div>
					{/if}

					<!-- Roadmap Tab -->
					{#if activeTab === 'roadmap'}
						<div class="space-y-6">
							<div class="p-6 bg-white border border-neutral-200 rounded-2xl shadow-sm mb-6">
								<div class="flex items-center gap-3">
									<Calendar class="w-6 h-6 text-primary" />
									<div>
										<h3 class="text-xl font-bold text-primary-dark">
											Roadmap de Implementación - {selectedCountry.name}
										</h3>
										<p class="text-sm text-neutral-600">
											Planificación y ejecución por fases
										</p>
									</div>
								</div>
							</div>

							<!-- Timeline -->
							<div class="relative">
								<!-- Vertical line -->
								<div class="absolute left-8 top-0 bottom-0 w-0.5 bg-neutral-200"></div>

								<div class="space-y-8">
									{#each selectedCountry.roadmap as phase, index}
										{@const statusColor = getRoadmapStatusColor(phase.status)}
										<div class="relative pl-20">
											<!-- Timeline dot -->
											<div
												class="absolute left-0 w-16 h-16 bg-white border-4 border-{statusColor} rounded-full flex items-center justify-center shadow-lg"
											>
												{#if phase.status === 'completed'}
													<CheckCircle2 class="w-8 h-8 text-success" />
												{:else if phase.status === 'in_progress'}
													<Zap class="w-8 h-8 text-primary animate-pulse" />
												{:else}
													<Clock class="w-8 h-8 text-neutral-400" />
												{/if}
											</div>

											<!-- Phase Card -->
											<div
												class="p-6 bg-white border-2 border-{statusColor} rounded-2xl shadow-sm hover:shadow-md transition-all duration-300"
											>
												<div class="flex items-start justify-between mb-4">
													<div>
														<h4 class="text-xl font-bold text-primary-dark mb-1">{phase.phase}</h4>
														<p class="text-sm text-neutral-600">
															{phase.status === 'completed'
																? 'Completado'
																: phase.status === 'in_progress'
																	? 'En Progreso'
																	: 'Planeado'}
														</p>
													</div>
													<span
														class="px-3 py-1 bg-{statusColor}/10 text-{statusColor} font-semibold rounded-full text-sm"
													>
														{phase.date}
													</span>
												</div>

												<!-- Items list -->
												<ul class="space-y-2">
													{#each phase.items as item}
														<li class="flex items-center gap-3">
															<ChevronRight class="w-4 h-4 text-{statusColor}" />
															<span class="text-neutral-700">{item}</span>
														</li>
													{/each}
												</ul>
											</div>
										</div>
									{/each}
								</div>
							</div>
						</div>
					{/if}
				</div>
			</div>
		{/if}

		<!-- Regional Summary Stats -->
		<div class="mt-16 {mounted ? 'animate-fade-in-up delay-600' : 'opacity-0'}">
			<div
				class="p-8 bg-gradient-to-br from-primary-dark via-primary to-primary-dark text-white rounded-3xl"
			>
				<h3 class="text-2xl font-bold text-center mb-8">Hergon en Latinoamérica</h3>

				<div class="grid md:grid-cols-4 gap-6">
					<div class="text-center">
						<div class="text-4xl font-bold mb-2">4</div>
						<div class="text-white/80">Países en Roadmap</div>
					</div>
					<div class="text-center">
						<div class="text-4xl font-bold mb-2">2</div>
						<div class="text-white/80">AFOREs Activas</div>
					</div>
					<div class="text-center">
						<div class="text-4xl font-bold mb-2">37+</div>
						<div class="text-white/80">Validaciones Totales</div>
					</div>
					<div class="text-center">
						<div class="text-4xl font-bold mb-2">10.3M</div>
						<div class="text-white/80">Trabajadores Potenciales</div>
					</div>
				</div>
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

	.delay-200 {
		animation-delay: 200ms;
	}

	.delay-400 {
		animation-delay: 400ms;
	}

	.delay-600 {
		animation-delay: 600ms;
	}
</style>
