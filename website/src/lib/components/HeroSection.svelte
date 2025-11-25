<script>
	import {
		ArrowRight,
		CheckCircle,
		Shield,
		Zap,
		TrendingUp,
		Clock,
		FileCheck,
		Users,
		Award
	} from 'lucide-svelte';
	import { onMount } from 'svelte';

	let mounted = $state(false);
	let filesProcessed = $state(0);
	let validationRate = $state(0);
	let responseTime = $state(0);

	// Animated counters
	onMount(() => {
		mounted = true;

		// Animate counters
		const duration = 2000;
		const fps = 60;
		const frames = duration / (1000 / fps);

		let frame = 0;
		const interval = setInterval(() => {
			frame++;
			const progress = frame / frames;
			const easeOut = 1 - Math.pow(1 - progress, 3);

			filesProcessed = Math.floor(easeOut * 124);
			validationRate = Math.floor(easeOut * 98);
			responseTime = (easeOut * 2.4).toFixed(1);

			if (frame >= frames) {
				clearInterval(interval);
			}
		}, 1000 / fps);

		return () => clearInterval(interval);
	});

	const trustBadges = [
		{ icon: Shield, label: 'SOC 2', status: 'En proceso' },
		{ icon: Award, label: 'ISO 27001', status: 'En proceso' },
		{ icon: CheckCircle, label: 'CONSAR', status: 'Certificado' }
	];

	const stats = [
		{ value: '99.9%', label: 'Uptime SLA', icon: TrendingUp },
		{ value: '<3s', label: 'Response Time', icon: Clock },
		{ value: '30+', label: 'Validaciones', icon: FileCheck },
		{ value: '10K+', label: 'Archivos/Mes', icon: Users }
	];
</script>

<!-- Hero Section -->
<section class="relative min-h-[70vh] flex items-center overflow-hidden pt-24 pb-12 px-4 md:px-8">
	<!-- Animated Background -->
	<div class="absolute inset-0 bg-gradient-to-br from-neutral-50 via-white to-primary/5"></div>

	<!-- Grid Pattern -->
	<div
		class="absolute inset-0 opacity-[0.03]"
		style="background-image: radial-gradient(circle at 1px 1px, rgb(0 102 255) 1px, transparent 0); background-size: 40px 40px;"
	></div>

	<!-- Gradient Orbs -->
	<div
		class="absolute top-20 right-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse"
	></div>
	<div
		class="absolute bottom-20 left-20 w-96 h-96 bg-primary-dark/10 rounded-full blur-3xl animate-pulse delay-1000"
	></div>

	<!-- Content -->
	<div class="container-custom relative z-10">
		<div class="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
			<!-- Left Column: Content -->
			<div class="space-y-8 {mounted ? 'animate-fade-in-up' : 'opacity-0'}">
				<!-- Headline -->
				<div class="space-y-4">
					<h1
						class="text-5xl md:text-6xl lg:text-7xl font-bold text-primary-dark leading-[1.1]"
					>
						Compliance
						<span
							class="block bg-gradient-to-r from-primary via-primary-dark to-primary bg-clip-text text-transparent"
						>
							Automatizado
						</span>
						para AFOREs
					</h1>
					<p class="text-xl md:text-2xl text-neutral-600 leading-relaxed max-w-2xl">
						Valide archivos regulatorios en <span class="font-bold text-primary">{'<'}3 segundos</span>
						con trazabilidad completa y disponibilidad garantizada. Cumplimiento CONSAR automatizado.
					</p>
				</div>

				<!-- CTAs -->
				<div class="flex flex-col sm:flex-row gap-4">
					<a
						href="#contact"
						class="group relative px-8 py-4 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-3 overflow-hidden"
					>
						<div
							class="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"
						></div>
						<span class="relative z-10">Solicitar Demo Gratuita</span>
						<ArrowRight class="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
					</a>
					<a
						href="#how-it-works"
						class="px-8 py-4 bg-white border-2 border-primary text-primary font-semibold rounded-xl hover:bg-primary hover:text-white transition-all duration-300 flex items-center justify-center gap-3 shadow-lg"
					>
						Ver Cómo Funciona
						<Zap class="w-5 h-5" />
					</a>
				</div>

				<!-- Trust Badges -->
				<div class="pt-4">
					<p class="text-sm text-neutral-500 font-medium mb-3">CERTIFICACIONES Y COMPLIANCE</p>
					<div class="flex flex-wrap gap-4">
						{#each trustBadges as badge}
							{@const BadgeIcon = badge.icon}
							<div
								class="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
							>
								<BadgeIcon class="w-5 h-5 text-primary" />
								<div class="text-left">
									<div class="text-sm font-semibold text-neutral-900">{badge.label}</div>
									<div
										class="text-xs {badge.status === 'Certificado'
											? 'text-success'
											: 'text-primary'}"
									>
										{badge.status}
									</div>
								</div>
							</div>
						{/each}
					</div>
				</div>

				<!-- Stats Row -->
				<div class="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
					{#each stats as stat}
						{@const StatIcon = stat.icon}
						<div
							class="p-4 bg-gradient-to-br from-white to-neutral-50 border border-neutral-200 rounded-xl shadow-sm hover:shadow-md transition-all hover:scale-105"
						>
							<StatIcon class="w-6 h-6 text-primary mb-2" />
							<div class="text-2xl font-bold text-primary-dark">{stat.value}</div>
							<div class="text-xs text-neutral-600 mt-1">{stat.label}</div>
						</div>
					{/each}
				</div>
			</div>

			<!-- Right Column: Dashboard Preview -->
			<div class="relative {mounted ? 'animate-fade-in-up delay-300' : 'opacity-0'}">
				<!-- Floating Elements -->
				<div
					class="absolute -top-8 -left-8 w-24 h-24 bg-success/20 rounded-2xl backdrop-blur-sm border border-success/30 flex items-center justify-center shadow-xl animate-float"
				>
					<CheckCircle class="w-12 h-12 text-success" />
				</div>
				<div
					class="absolute -bottom-8 -right-8 w-20 h-20 bg-primary/20 rounded-2xl backdrop-blur-sm border border-primary/30 flex items-center justify-center shadow-xl animate-float delay-500"
				>
					<Shield class="w-10 h-10 text-primary" />
				</div>

				<!-- Main Dashboard Card -->
				<div
					class="relative bg-gradient-to-br from-primary via-primary to-primary-dark rounded-3xl p-1 shadow-2xl"
				>
					<!-- Glow Effect -->
					<div
						class="absolute inset-0 bg-gradient-to-br from-primary to-primary-dark rounded-3xl blur-xl opacity-50"
					></div>

					<!-- Inner Card -->
					<div class="relative bg-white rounded-3xl p-6 md:p-8 space-y-6">
						<!-- Header -->
						<div class="flex items-center justify-between pb-4 border-b border-neutral-200">
							<div class="flex items-center gap-3">
								<div
									class="w-3 h-3 bg-success rounded-full animate-pulse shadow-lg shadow-success/50"
								></div>
								<span class="font-mono text-sm font-semibold text-neutral-900">
									Sistema Activo
								</span>
							</div>
							<div class="flex gap-2">
								<div class="w-3 h-3 rounded-full bg-warning"></div>
								<div class="w-3 h-3 rounded-full bg-success"></div>
								<div class="w-3 h-3 rounded-full bg-primary"></div>
							</div>
						</div>

						<!-- Main Metric -->
						<div class="space-y-3">
							<div class="flex items-baseline justify-between">
								<span class="text-sm font-medium text-neutral-600">Archivos Procesados Hoy</span>
								<div class="flex items-baseline gap-1">
									<span class="text-4xl font-bold text-primary font-mono">{filesProcessed}</span>
									<TrendingUp class="w-5 h-5 text-success mb-1" />
								</div>
							</div>
							<div class="relative h-3 bg-neutral-100 rounded-full overflow-hidden">
								<div
									class="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-primary-dark rounded-full transition-all duration-1000 shadow-lg"
									style="width: {(filesProcessed / 124) * 100}%"
								></div>
								<div
									class="absolute inset-y-0 left-0 bg-gradient-to-r from-white/40 to-transparent rounded-full"
									style="width: {(filesProcessed / 124) * 100}%"
								></div>
							</div>
						</div>

						<!-- Stats Grid -->
						<div class="grid grid-cols-3 gap-4">
							<div
								class="p-4 bg-gradient-to-br from-success/10 to-success/5 rounded-xl border border-success/20"
							>
								<div class="text-3xl font-bold text-success font-mono">{validationRate}%</div>
								<div class="text-xs text-neutral-600 mt-1">Válidos</div>
								<div class="flex items-center gap-1 mt-2">
									<div class="flex-1 h-1 bg-success/20 rounded-full">
										<div
											class="h-1 bg-success rounded-full transition-all duration-1000"
											style="width: {validationRate}%"
										></div>
									</div>
								</div>
							</div>

							<div
								class="p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/20"
							>
								<div class="text-3xl font-bold text-primary font-mono">{responseTime}s</div>
								<div class="text-xs text-neutral-600 mt-1">Promedio</div>
								<div class="flex items-center gap-1 mt-2">
									<Clock class="w-3 h-3 text-primary" />
									<span class="text-xs text-primary font-medium">Tiempo Real</span>
								</div>
							</div>

							<div
								class="p-4 bg-gradient-to-br from-warning/10 to-warning/5 rounded-xl border border-warning/20"
							>
								<div class="text-3xl font-bold text-warning font-mono">
									{100 - validationRate}%
								</div>
								<div class="text-xs text-neutral-600 mt-1">Errores</div>
								<div class="flex items-center gap-1 mt-2">
									<div class="flex-1 h-1 bg-warning/20 rounded-full">
										<div
											class="h-1 bg-warning rounded-full transition-all duration-1000"
											style="width: {100 - validationRate}%"
										></div>
									</div>
								</div>
							</div>
						</div>

						<!-- Recent Activity -->
						<div class="space-y-2">
							<p class="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
								Actividad Reciente
							</p>
							<div class="space-y-2">
								{#each [
									{ file: 'AFORE_MX_001.csv', status: 'success', time: '2m' },
									{ file: 'AFORE_MX_002.csv', status: 'success', time: '5m' },
									{ file: 'AFORE_MX_003.csv', status: 'warning', time: '8m' }
								] as activity}
									<div
										class="flex items-center justify-between p-3 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors"
									>
										<div class="flex items-center gap-3">
											<div
												class="w-2 h-2 rounded-full {activity.status === 'success'
													? 'bg-success'
													: 'bg-warning'}"
											></div>
											<span class="text-sm font-mono text-neutral-700">{activity.file}</span>
										</div>
										<span class="text-xs text-neutral-500">{activity.time}</span>
									</div>
								{/each}
							</div>
						</div>
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

	@keyframes float {
		0%,
		100% {
			transform: translateY(0px);
		}
		50% {
			transform: translateY(-20px);
		}
	}

	.animate-fade-in-up {
		animation: fade-in-up 0.8s ease-out forwards;
	}

	.animate-float {
		animation: float 6s ease-in-out infinite;
	}

	.delay-300 {
		animation-delay: 300ms;
	}

	.delay-500 {
		animation-delay: 500ms;
	}

	.delay-1000 {
		animation-delay: 1000ms;
	}
</style>
