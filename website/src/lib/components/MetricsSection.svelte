<script>
	import {
		TrendingUp,
		Clock,
		Shield,
		Zap,
		DollarSign,
		Users,
		CheckCircle,
		Activity,
		Target,
		BarChart3,
		Gauge,
		Award,
		AlertCircle,
		ArrowRight,
		ArrowDown
	} from 'lucide-svelte';
	import { onMount } from 'svelte';

	let mounted = $state(false);
	let activeMetricIndex = $state(0);

	// Animated counters
	let uptimeValue = $state(0);
	let responseTime = $state(0);
	let filesPerMonth = $state(0);
	let costSavings = $state(0);
	let errorReduction = $state(0);
	let timeReduction = $state(0);

	onMount(() => {
		mounted = true;

		// Animate counters
		const duration = 2500;
		const fps = 60;
		const frames = duration / (1000 / fps);
		let frame = 0;

		const interval = setInterval(() => {
			frame++;
			const progress = frame / frames;
			const easeOut = 1 - Math.pow(1 - progress, 3);

			uptimeValue = Math.min(99.9, easeOut * 99.9);
			responseTime = Math.min(2.8, easeOut * 2.8);
			filesPerMonth = Math.floor(easeOut * 10000);
			costSavings = Math.floor(easeOut * 86);
			errorReduction = Math.floor(easeOut * 98);
			timeReduction = Math.floor(easeOut * 99.9);

			if (frame >= frames) {
				clearInterval(interval);
			}
		}, 1000 / fps);

		// Rotate active metric
		const metricRotation = setInterval(() => {
			activeMetricIndex = (activeMetricIndex + 1) % keyMetrics.length;
		}, 4000);

		return () => {
			clearInterval(interval);
			clearInterval(metricRotation);
		};
	});

	const keyMetrics = [
		{
			icon: TrendingUp,
			label: 'Uptime SLA',
			value: '99.9%',
			description: 'Disponibilidad garantizada',
			detail: 'Solo 8.76 horas de downtime al año',
			color: 'success',
			comparison: { before: '95%', after: '99.9%', improvement: '+5%' }
		},
		{
			icon: Clock,
			label: 'Response Time',
			value: '<3s',
			description: 'Latencia p95',
			detail: '2.8s promedio de procesamiento',
			color: 'primary',
			comparison: { before: '48h', after: '<3s', improvement: '99.9%' }
		},
		{
			icon: CheckCircle,
			label: 'Validaciones',
			value: '37',
			description: 'Reglas automatizadas',
			detail: 'Cobertura completa CONSAR 2026',
			color: 'warning',
			comparison: { before: '12', after: '37', improvement: '+208%' }
		},
		{
			icon: Activity,
			label: 'Archivos/Mes',
			value: '10K+',
			description: 'Throughput mensual',
			detail: 'Escalable a 100K+ con auto-scaling',
			color: 'primary',
			comparison: { before: '500', after: '10K+', improvement: '+1900%' }
		}
	];

	const impactMetrics = [
		{
			category: 'Eficiencia Operativa',
			icon: Zap,
			metrics: [
				{
					name: 'Reducción de tiempo',
					before: '48 horas',
					after: '<3 segundos',
					saving: '99.9%',
					icon: Clock
				},
				{
					name: 'Archivos procesados',
					before: '500/mes',
					after: '10K+/mes',
					saving: '+1900%',
					icon: Activity
				},
				{
					name: 'Personal requerido',
					before: '5 FTE',
					after: '1 FTE',
					saving: '80%',
					icon: Users
				}
			]
		},
		{
			category: 'Calidad y Precisión',
			icon: Target,
			metrics: [
				{
					name: 'Tasa de error',
					before: '37%',
					after: '0.1%',
					saving: '99.7%',
					icon: AlertCircle
				},
				{
					name: 'Precisión validación',
					before: '63%',
					after: '99.9%',
					saving: '+58%',
					icon: CheckCircle
				},
				{
					name: 'Rechazos CONSAR',
					before: '23/mes',
					after: '0.2/mes',
					saving: '99%',
					icon: Shield
				}
			]
		},
		{
			category: 'Costos y ROI',
			icon: DollarSign,
			metrics: [
				{
					name: 'Costo anual',
					before: '$180K',
					after: '$25K',
					saving: '86%',
					icon: DollarSign
				},
				{
					name: 'Costo por archivo',
					before: '$360',
					after: '$2.50',
					saving: '99.3%',
					icon: BarChart3
				},
				{
					name: 'ROI año 1',
					before: 'N/A',
					after: '520%',
					saving: 'Positivo',
					icon: TrendingUp
				}
			]
		}
	];

	const achievements = [
		{
			icon: Award,
			title: '2 AFOREs Activas',
			description: 'En producción en México',
			stat: '100%',
			label: 'Satisfacción cliente'
		},
		{
			icon: Shield,
			title: 'Certificación CONSAR',
			description: 'Compliance verificado',
			stat: '37/37',
			label: 'Validaciones activas'
		},
		{
			icon: Activity,
			title: '50K+ Eventos/Día',
			description: 'Event sourcing en producción',
			stat: '7+',
			label: 'Años retención'
		},
		{
			icon: Gauge,
			title: 'Performance SLA',
			description: '99.9% uptime garantizado',
			stat: '<3s',
			label: 'Response time p95'
		}
	];
</script>

<!-- Metrics Section -->
<section class="relative py-24 px-4 md:px-8 bg-gradient-to-br from-primary-dark via-primary to-primary-dark text-white overflow-hidden">
	<!-- Animated background -->
	<div class="absolute inset-0 opacity-10">
		<div class="absolute inset-0" style="background-image: radial-gradient(circle at 2px 2px, white 1px, transparent 0); background-size: 50px 50px;"></div>
	</div>

	<!-- Gradient orbs -->
	<div class="absolute top-0 right-0 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl"></div>
	<div class="absolute bottom-0 left-0 w-[600px] h-[600px] bg-success/10 rounded-full blur-3xl"></div>

	<div class="container-custom relative z-10">
		<!-- Section Header -->
		<div class="text-center mb-16 {mounted ? 'animate-fade-in-up' : 'opacity-0'}">
			<div class="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-sm font-medium mb-4">
				<BarChart3 class="w-4 h-4" />
				Impacto Medible y Verificable
			</div>
			<h2 class="text-4xl md:text-5xl font-bold mb-4">
				Números que
				<span class="bg-gradient-to-r from-success to-warning bg-clip-text text-transparent">
					Demuestran Resultados
				</span>
			</h2>
			<p class="text-xl text-white/80 max-w-3xl mx-auto">
				Métricas reales de AFOREs en producción. Reducción de costos del 86%, eliminación de
				errores del 99.7%, y ROI del 520% en el primer año.
			</p>
		</div>

		<!-- Key Metrics Carousel -->
		<div class="mb-20 {mounted ? 'animate-fade-in-up delay-300' : 'opacity-0'}">
			<div class="grid md:grid-cols-4 gap-6">
				{#each keyMetrics as metric, index}
					{@const MetricIcon = metric.icon}
					<div
						class="relative group p-8 bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl hover:bg-white/15 transition-all duration-500 {activeMetricIndex ===
						index
							? 'scale-105 shadow-2xl shadow-white/20 border-white/40'
							: ''}"
					>
						<!-- Glow effect -->
						{#if activeMetricIndex === index}
							<div
								class="absolute inset-0 bg-gradient-to-br from-{metric.color}/20 to-transparent rounded-3xl"
							></div>
						{/if}

						<div class="relative">
							<!-- Icon -->
							<div
								class="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"
							>
								<MetricIcon class="w-8 h-8 text-white" />
							</div>

							<!-- Value -->
							<div class="text-5xl font-bold mb-2 font-mono">
								{#if index === 0}
									{uptimeValue.toFixed(1)}%
								{:else if index === 1}
									{'<'}{responseTime.toFixed(1)}s
								{:else if index === 2}
									{metric.value}
								{:else}
									{Math.floor(filesPerMonth / 1000)}K+
								{/if}
							</div>

							<!-- Label -->
							<div class="text-sm text-white/60 mb-1">{metric.label}</div>
							<div class="text-lg font-semibold mb-4">{metric.description}</div>

							<!-- Detail -->
							<div class="text-sm text-white/70 mb-4">{metric.detail}</div>

							<!-- Comparison -->
							<div class="pt-4 border-t border-white/10">
								<div class="flex items-center justify-between text-xs">
									<div class="text-white/60">
										Antes: <span class="font-mono">{metric.comparison.before}</span>
									</div>
									<div class="flex items-center gap-1 text-success">
										<TrendingUp class="w-3 h-3" />
										<span class="font-bold">{metric.comparison.improvement}</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- Impact Metrics Breakdown -->
		<div class="mb-20 {mounted ? 'animate-fade-in-up delay-500' : 'opacity-0'}">
			<h3 class="text-3xl font-bold text-center mb-12">Impacto Detallado por Categoría</h3>

			<div class="grid lg:grid-cols-3 gap-8">
				{#each impactMetrics as category}
					{@const CategoryIcon = category.icon}
					<div
						class="p-8 bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl hover:bg-white/15 transition-all duration-300"
					>
						<!-- Category Header -->
						<div class="flex items-center gap-3 mb-8">
							<div class="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
								<CategoryIcon class="w-6 h-6 text-white" />
							</div>
							<h4 class="text-xl font-bold">{category.category}</h4>
						</div>

						<!-- Metrics List -->
						<div class="space-y-6">
							{#each category.metrics as metric}
								{@const Icon = metric.icon}
								<div class="group/metric">
									<div class="flex items-center gap-2 mb-3">
										<Icon class="w-4 h-4 text-white/70" />
										<div class="text-sm font-semibold text-white/80">{metric.name}</div>
									</div>

									<!-- Before/After Bars -->
									<div class="space-y-2 mb-2">
										<!-- Before -->
										<div class="flex items-center gap-3">
											<span class="text-xs text-white/50 w-16">Antes:</span>
											<div class="flex-1 relative">
												<div class="h-8 bg-danger/30 rounded-lg flex items-center px-3">
													<span class="text-sm font-mono text-white/80">{metric.before}</span>
												</div>
											</div>
										</div>

										<!-- After -->
										<div class="flex items-center gap-3">
											<span class="text-xs text-white/50 w-16">Después:</span>
											<div class="flex-1 relative">
												<div
													class="h-8 bg-success/40 rounded-lg flex items-center justify-between px-3"
												>
													<span class="text-sm font-mono font-semibold">{metric.after}</span>
													<div
														class="flex items-center gap-1 px-2 py-0.5 bg-success/30 rounded-full"
													>
														<ArrowDown class="w-3 h-3" />
														<span class="text-xs font-bold">{metric.saving}</span>
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
							{/each}
						</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- Achievements Grid -->
		<div class="mb-12 {mounted ? 'animate-fade-in-up delay-700' : 'opacity-0'}">
			<h3 class="text-3xl font-bold text-center mb-12">Logros y Certificaciones</h3>

			<div class="grid md:grid-cols-4 gap-6">
				{#each achievements as achievement}
					{@const Icon = achievement.icon}
					<div
						class="p-6 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl hover:bg-white/15 transition-all duration-300 group"
					>
						<div class="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
							<Icon class="w-6 h-6 text-white" />
						</div>
						<div class="text-3xl font-bold mb-2 font-mono">{achievement.stat}</div>
						<div class="text-xs text-white/60 mb-2">{achievement.label}</div>
						<div class="text-sm font-semibold mb-1">{achievement.title}</div>
						<div class="text-xs text-white/70">{achievement.description}</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- ROI Calculator Preview -->
		<div class="text-center {mounted ? 'animate-fade-in-up delay-900' : 'opacity-0'}">
			<div
				class="inline-block p-8 bg-white/10 backdrop-blur-xl border border-white/30 rounded-3xl"
			>
				<div class="flex flex-wrap items-center justify-center gap-8 mb-6">
					<div class="text-center">
						<div class="text-sm text-white/60 mb-2">Inversión Anual</div>
						<div class="text-4xl font-bold text-danger">$25K</div>
					</div>
					<ArrowRight class="w-8 h-8 text-white/40" />
					<div class="text-center">
						<div class="text-sm text-white/60 mb-2">Ahorro Anual</div>
						<div class="text-4xl font-bold text-success">$155K</div>
					</div>
					<div class="w-px h-16 bg-white/20 hidden sm:block"></div>
					<div class="text-center">
						<div class="text-sm text-white/60 mb-2">ROI Año 1</div>
						<div class="text-5xl font-bold text-warning">520%</div>
					</div>
				</div>

				<p class="text-white/80 mb-6 max-w-2xl">
					Cálculo basado en AFORE con <span class="font-bold">10,000 archivos/mes</span>.
					Incluye reducción de personal, eliminación de multas, y automatización completa.
				</p>

				<a
					href="#contact"
					class="inline-flex items-center gap-3 px-8 py-4 bg-white text-primary-dark font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
				>
					<span>Calcular ROI para tu AFORE</span>
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
</style>

