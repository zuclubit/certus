<script>
	import {
		CheckCircle,
		Zap,
		Lock,
		Globe,
		BarChart3,
		Shield,
		Database,
		Cloud,
		Clock,
		FileCheck,
		Activity,
		TrendingUp,
		Code,
		Layers,
		GitBranch,
		ArrowRight,
		Sparkles,
		Cpu,
		Server,
		HardDrive
	} from 'lucide-svelte';
	import { onMount } from 'svelte';

	let mounted = $state(false);
	let activeCategory = $state('all'); // 'all', 'validation', 'infrastructure', 'security'

	onMount(() => {
		mounted = true;
	});

	const categories = [
		{ id: 'all', label: 'Todas', icon: Sparkles },
		{ id: 'validation', label: 'Validación', icon: CheckCircle },
		{ id: 'infrastructure', label: 'Infraestructura', icon: Cloud },
		{ id: 'security', label: 'Seguridad', icon: Shield }
	];

	const features = [
		{
			category: 'validation',
			icon: CheckCircle,
			badge: 'Core',
			title: 'Validación Automática Inteligente',
			description:
				'Sistema de validación con 30+ reglas base configurables que verifica cumplimiento CONSAR, estructura de archivos y detecta inconsistencias automáticamente. Se adapta a las necesidades específicas de su AFORE.',
			specs: [
				{ label: 'Validadores base', value: '30+', unit: 'reglas' },
				{ label: 'Tiempo de ejecución', value: '<3', unit: 'segundos' },
				{ label: 'Precisión', value: '99.9', unit: '%' },
				{ label: 'Concurrencia', value: '100', unit: 'archivos' }
			],
			techStack: ['Validación Automática', 'Reglas de Negocio', 'Detección Inteligente'],
			highlights: [
				'Valida CSV, Excel y archivos de texto',
				'Reglas CONSAR actualizadas 2026',
				'Detecta errores e inconsistencias',
				'Sugerencias de corrección automáticas'
			]
		},
		{
			category: 'validation',
			icon: Zap,
			badge: 'Performance',
			title: 'Resultados Instantáneos',
			description:
				'Sistema que procesa sus archivos de forma inmediata y crece automáticamente con su volumen de operaciones, garantizando tiempos de respuesta consistentes sin importar la carga.',
			specs: [
				{ label: 'Latencia p95', value: '2.8', unit: 'seg' },
				{ label: 'Latencia p99', value: '3.2', unit: 'seg' },
				{ label: 'Throughput', value: '10K', unit: 'archivos/mes' },
				{ label: 'Auto-scaling', value: '0-100', unit: 'instancias' }
			],
			techStack: ['Procesamiento Rápido', 'Cola de Trabajo', 'Optimización'],
			highlights: [
				'Procesa múltiples archivos simultáneamente',
				'Sistema resiliente ante fallos',
				'Optimización automática de resultados',
				'Protección contra interrupciones'
			]
		},
		{
			category: 'security',
			icon: Lock,
			badge: 'Enterprise',
			title: 'Trazabilidad Total & Auditoría',
			description:
				'Registro inmutable de todas las operaciones que permite reconstruir el histórico completo de actividades y cumplir con los requisitos de auditoría CONSAR de 7+ años.',
			specs: [
				{ label: 'Retención', value: '7+', unit: 'años' },
				{ label: 'Eventos/día', value: '50K', unit: 'eventos' },
				{ label: 'Almacenamiento', value: 'Inmutable', unit: '' },
				{ label: 'Replay time', value: '<1', unit: 'min' }
			],
			techStack: ['Registro Permanente', 'Almacenamiento Seguro', 'Auditoría Completa'],
			highlights: [
				'Registros que nunca se pueden modificar',
				'Consulte histórico de cualquier momento',
				'Sepa quién hizo qué y cuándo',
				'Cumplimiento CONSAR de 7+ años'
			]
		},
		{
			category: 'infrastructure',
			icon: Globe,
			badge: 'Multi-Region',
			title: 'Expansión Latinoamericana',
			description:
				'Sistema diseñado para operar en múltiples países, con soporte específico para las regulaciones de cada mercado, permitiendo expansión rápida y eficiente.',
			specs: [
				{ label: 'Países soportados', value: '4', unit: 'países' },
				{ label: 'AFOREs activas', value: '2', unit: 'clientes' },
				{ label: 'Reglas por país', value: '30+', unit: 'validaciones' },
				{ label: 'Deployment', value: 'Multi', unit: 'region' }
			],
			techStack: ['Aislamiento por Cliente', 'Configuración Flexible', 'Multi-idioma'],
			highlights: [
				'México: CONSAR compliance completo',
				'Chile: SuperPensiones (roadmap Q2)',
				'Colombia: SuperFinanciera (roadmap Q3)',
				'Perú: SBS (roadmap Q4)'
			]
		},
		{
			category: 'validation',
			icon: BarChart3,
			badge: 'Analytics',
			title: 'Reportes e Inteligencia de Negocio',
			description:
				'Tableros de control en tiempo real con métricas operativas clave, análisis de tendencias y alertas tempranas basadas en su histórico de operaciones.',
			specs: [
				{ label: 'Actualización', value: 'Real', unit: 'time' },
				{ label: 'Métricas', value: '50+', unit: 'KPIs' },
				{ label: 'Retención datos', value: '365', unit: 'días' },
				{ label: 'Exportación', value: 'CSV/Excel', unit: '' }
			],
			techStack: ['Business Intelligence', 'Cloud Analytics', 'Custom Dashboards'],
			highlights: [
				'Panel ejecutivo actualizado en tiempo real',
				'Identifique tendencias y anomalías',
				'Alertas tempranas de posibles problemas',
				'Reportes personalizados para su AFORE'
			]
		},
		{
			category: 'security',
			icon: Shield,
			badge: 'Compliance',
			title: 'Seguridad Bancaria',
			description:
				'Protección de múltiples capas con encriptación total de datos, aislamiento completo entre clientes y cumplimiento de estándares internacionales de seguridad.',
			specs: [
				{ label: 'Encriptación', value: 'AES-256', unit: '' },
				{ label: 'TLS', value: '1.3', unit: 'protocol' },
				{ label: 'Key rotation', value: '90', unit: 'días' },
				{ label: 'Pen testing', value: 'Trimestral', unit: '' }
			],
			techStack: ['Gestión de Claves', 'Inicio de Sesión Único', 'Aislamiento de Datos'],
			highlights: [
				'Certificación SOC 2 (en proceso Q2 2026)',
				'Certificación ISO 27001 (en proceso Q4 2026)',
				'Sus datos completamente aislados',
				'Pruebas de seguridad trimestrales'
			]
		},
		{
			category: 'infrastructure',
			icon: Cloud,
			badge: 'Cloud Native',
			title: 'Infraestructura Confiable',
			description:
				'Infraestructura en la nube con alta disponibilidad (99.9%), recuperación automática ante desastres y capacidad de crecimiento sin límites.',
			specs: [
				{ label: 'Uptime SLA', value: '99.9', unit: '%' },
				{ label: 'RPO', value: '<1', unit: 'hora' },
				{ label: 'RTO', value: '<4', unit: 'horas' },
				{ label: 'Backups', value: 'Diario', unit: '' }
			],
			techStack: ['Servicios en la Nube', 'Base de Datos', 'Procesamiento Automático'],
			highlights: [
				'Operación en múltiples regiones',
				'Crece automáticamente según demanda',
				'Recuperación automática ante fallas',
				'99.9% disponibilidad garantizada'
			]
		},
		{
			category: 'infrastructure',
			icon: Database,
			badge: 'Data',
			title: 'Respaldo y Protección de Datos',
			description:
				'Almacenamiento seguro en la nube con respaldos automáticos diarios, encriptación y retención de datos según normativa CONSAR.',
			specs: [
				{ label: 'Retención', value: '7+', unit: 'años' },
				{ label: 'Backup', value: 'Diario', unit: '' },
				{ label: 'Encriptación', value: 'AES-256', unit: '' },
				{ label: 'Redundancia', value: 'Multi', unit: 'región' }
			],
			techStack: ['Almacenamiento Seguro', 'Respaldos Automáticos', 'Encriptación de Datos'],
			highlights: [
				'Sus datos completamente separados',
				'Respaldos automáticos encriptados',
				'Retención de 7+ años (normativa CONSAR)',
				'Recuperación garantizada ante desastres'
			]
		}
	];

	$effect(() => {
		// Filter features based on active category
		filteredFeatures = activeCategory === 'all'
			? features
			: features.filter(f => f.category === activeCategory);
	});

	let filteredFeatures = $state(features);

	function setCategory(categoryId) {
		activeCategory = categoryId;
	}
</script>

<!-- Features Section -->
<section id="features" class="relative py-24 px-4 md:px-8 bg-gradient-to-b from-neutral-50 to-white overflow-hidden">
	<!-- Background decoration -->
	<div class="absolute inset-0 opacity-[0.02]">
		<div class="absolute inset-0" style="background-image: radial-gradient(circle at 1px 1px, rgb(0 102 255) 1px, transparent 0); background-size: 40px 40px;"></div>
	</div>

	<!-- Gradient orbs -->
	<div class="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
	<div class="absolute bottom-0 left-0 w-96 h-96 bg-success/10 rounded-full blur-3xl"></div>

	<div class="container-custom relative z-10">
		<!-- Section Header -->
		<div class="text-center mb-16 {mounted ? 'animate-fade-in-up' : 'opacity-0'}">
			<div class="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/10 to-success/10 border border-primary/20 rounded-full text-sm font-medium text-primary mb-4">
				<Sparkles class="w-4 h-4" />
				Características Enterprise
			</div>
			<h2 class="text-4xl md:text-5xl font-bold text-primary-dark mb-4">
				Plataforma Completa para
				<span class="bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
					Compliance Automatizado
				</span>
			</h2>
			<p class="text-xl text-neutral-600 max-w-3xl mx-auto">
				8 módulos core diseñados para instituciones financieras que requieren máxima seguridad,
				trazabilidad y cumplimiento normativo garantizado.
			</p>
		</div>

		<!-- Category Filter -->
		<div class="flex justify-center mb-12 {mounted ? 'animate-fade-in-up delay-300' : 'opacity-0'}">
			<div class="inline-flex flex-wrap gap-3 p-2 bg-white rounded-2xl shadow-lg border border-neutral-200">
				{#each categories as category}
					{@const CategoryIcon = category.icon}
					<button
						class="px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 {activeCategory === category.id
							? 'bg-gradient-to-r from-primary to-primary-dark text-white shadow-md scale-105'
							: 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'}"
						onclick={() => setCategory(category.id)}
					>
						<CategoryIcon class="w-5 h-5" />
						<span>{category.label}</span>
						{#if category.id === 'all'}
							<span class="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs">{features.length}</span>
						{:else}
							<span class="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs">
								{features.filter(f => f.category === category.id).length}
							</span>
						{/if}
					</button>
				{/each}
			</div>
		</div>

		<!-- Features Grid -->
		<div class="grid md:grid-cols-2 gap-8 {mounted ? 'animate-fade-in-up delay-500' : 'opacity-0'}">
			{#each filteredFeatures as feature, index}
				{@const FeatureIcon = feature.icon}
				<div
					class="group relative bg-white rounded-3xl p-8 border-2 border-neutral-200 hover:border-primary/30 shadow-lg hover:shadow-2xl transition-all duration-500"
					style="animation-delay: {index * 50}ms"
				>
					<!-- Gradient overlay on hover -->
					<div class="absolute inset-0 bg-gradient-to-br from-primary/5 to-success/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

					<!-- Content -->
					<div class="relative">
						<!-- Header -->
						<div class="flex items-start justify-between mb-6">
							<div class="flex items-center gap-4">
								<div class="w-16 h-16 bg-gradient-to-br from-primary/20 to-success/20 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
									<FeatureIcon class="w-8 h-8 text-primary" />
								</div>
								<div>
									<div class="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full mb-2">
										{feature.badge}
									</div>
									<h3 class="text-2xl font-bold text-neutral-900 group-hover:text-primary transition-colors">
										{feature.title}
									</h3>
								</div>
							</div>
						</div>

						<!-- Description -->
						<p class="text-neutral-600 leading-relaxed mb-6">
							{feature.description}
						</p>

						<!-- Specs Grid -->
						<div class="grid grid-cols-2 gap-4 mb-6 p-4 bg-neutral-50 rounded-xl">
							{#each feature.specs as spec}
								<div class="text-center">
									<div class="text-2xl font-bold text-primary mb-1">
										{spec.value}<span class="text-sm text-neutral-500 ml-1">{spec.unit}</span>
									</div>
									<div class="text-xs text-neutral-600">{spec.label}</div>
								</div>
							{/each}
						</div>

						<!-- Tech Stack -->
						<div class="mb-6">
							<div class="flex items-center gap-2 mb-3">
								<Code class="w-4 h-4 text-neutral-500" />
								<span class="text-sm font-semibold text-neutral-700">Stack Tecnológico:</span>
							</div>
							<div class="flex flex-wrap gap-2">
								{#each feature.techStack as tech}
									<span class="px-3 py-1 bg-gradient-to-r from-neutral-100 to-neutral-50 border border-neutral-200 text-neutral-700 text-xs font-mono rounded-lg">
										{tech}
									</span>
								{/each}
							</div>
						</div>

						<!-- Highlights -->
						<div>
							<div class="flex items-center gap-2 mb-3">
								<Sparkles class="w-4 h-4 text-success" />
								<span class="text-sm font-semibold text-neutral-700">Características Clave:</span>
							</div>
							<ul class="space-y-2">
								{#each feature.highlights as highlight}
									<li class="flex items-start gap-2 text-sm text-neutral-600">
										<CheckCircle class="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
										<span>{highlight}</span>
									</li>
								{/each}
							</ul>
						</div>

						<!-- Hover Arrow -->
						<div class="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
							<div class="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
								<ArrowRight class="w-5 h-5 text-white" />
							</div>
						</div>
					</div>
				</div>
			{/each}
		</div>

		<!-- Bottom Stats -->
		<div class="mt-16 {mounted ? 'animate-fade-in-up delay-700' : 'opacity-0'}">
			<div class="grid md:grid-cols-4 gap-6">
				<div class="text-center p-6 bg-gradient-to-br from-white to-neutral-50 rounded-2xl border border-neutral-200 shadow-md">
					<div class="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
						<Cpu class="w-6 h-6 text-primary" />
					</div>
					<div class="text-3xl font-bold text-primary mb-1">37</div>
					<div class="text-sm text-neutral-600">Validadores Activos</div>
				</div>
				<div class="text-center p-6 bg-gradient-to-br from-white to-neutral-50 rounded-2xl border border-neutral-200 shadow-md">
					<div class="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center mx-auto mb-4">
						<Activity class="w-6 h-6 text-success" />
					</div>
					<div class="text-3xl font-bold text-success mb-1">99.9%</div>
					<div class="text-sm text-neutral-600">Precisión Garantizada</div>
				</div>
				<div class="text-center p-6 bg-gradient-to-br from-white to-neutral-50 rounded-2xl border border-neutral-200 shadow-md">
					<div class="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
						<Server class="w-6 h-6 text-primary" />
					</div>
					<div class="text-3xl font-bold text-primary mb-1">{'<'}3s</div>
					<div class="text-sm text-neutral-600">Tiempo de Respuesta</div>
				</div>
				<div class="text-center p-6 bg-gradient-to-br from-white to-neutral-50 rounded-2xl border border-neutral-200 shadow-md">
					<div class="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center mx-auto mb-4">
						<HardDrive class="w-6 h-6 text-success" />
					</div>
					<div class="text-3xl font-bold text-success mb-1">7+</div>
					<div class="text-sm text-neutral-600">Años Retención</div>
				</div>
			</div>
		</div>

		<!-- CTA -->
		<div class="mt-12 text-center {mounted ? 'animate-fade-in-up delay-900' : 'opacity-0'}">
			<a
				href="#contact"
				class="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
			>
				<span>Ver Demo de Plataforma Completa</span>
				<ArrowRight class="w-5 h-5 group-hover:translate-x-1 transition-transform" />
			</a>
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
</style>
