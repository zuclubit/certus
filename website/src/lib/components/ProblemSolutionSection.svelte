<script>
	import {
		X,
		CheckCircle,
		Clock,
		AlertTriangle,
		TrendingDown,
		FileX,
		Users,
		Zap,
		Shield,
		TrendingUp,
		FileCheck,
		Activity,
		Target,
		BarChart3,
		ArrowRight
	} from 'lucide-svelte';
	import { onMount } from 'svelte';

	let mounted = $state(false);
	let activeTab = $state('problem'); // 'problem' or 'solution'

	onMount(() => {
		mounted = true;
	});

	const problemStats = [
		{
			icon: Clock,
			value: '48h',
			label: 'Tiempo de validación',
			color: 'warning',
			trend: 'down'
		},
		{
			icon: AlertTriangle,
			value: '37%',
			label: 'Tasa de error humano',
			color: 'danger',
			trend: 'down'
		},
		{
			icon: FileX,
			value: '$180K',
			label: 'Costo anual operativo',
			color: 'danger',
			trend: 'down'
		},
		{
			icon: TrendingDown,
			value: '0%',
			label: 'Trazabilidad completa',
			color: 'danger',
			trend: 'down'
		}
	];

	const solutionStats = [
		{
			icon: Zap,
			value: '<3s',
			label: 'Tiempo de validación',
			color: 'success',
			trend: 'up'
		},
		{
			icon: Target,
			value: '99.9%',
			label: 'Precisión automatizada',
			color: 'success',
			trend: 'up'
		},
		{
			icon: FileCheck,
			value: '$25K',
			label: 'Costo anual total',
			color: 'success',
			trend: 'up'
		},
		{
			icon: Activity,
			value: '100%',
			label: 'Trazabilidad completa',
			color: 'success',
			trend: 'up'
		}
	];

	const problems = [
		{
			icon: Clock,
			title: 'Procesos Manuales Lentos',
			description:
				'La validación manual de archivos regulatorios toma entre 24-48 horas por lote, creando cuellos de botella operativos.',
			impact: 'Retrasos en reportes a CONSAR y riesgo de multas regulatorias'
		},
		{
			icon: AlertTriangle,
			title: 'Alta Tasa de Error Humano',
			description:
				'Validaciones manuales tienen hasta 37% de error, especialmente en archivos con miles de registros y reglas complejas.',
			impact: 'Rechazos de la CONSAR y reproceso costoso de archivos'
		},
		{
			icon: FileX,
			title: 'Falta de Trazabilidad',
			description:
				'Sin event sourcing, es imposible reconstruir el estado histórico o auditar quién modificó qué y cuándo.',
			impact: 'Incumplimiento de normativa de auditoría de 7 años'
		},
		{
			icon: Users,
			title: 'Escalabilidad Limitada',
			description:
				'Crecer el equipo de validación es costoso y lento. No hay forma de procesar picos de 10K+ archivos/mes.',
			impact: 'Costos operativos crecen linealmente con el volumen'
		}
	];

	const solutions = [
		{
			icon: Zap,
			title: 'Validación Automatizada en Tiempo Real',
			description:
				'37 validadores paralelos procesan archivos en menos de 3 segundos, eliminando cuellos de botella operativos.',
			benefit: '99.9% de precisión con reportes instantáneos a CONSAR',
			metrics: { before: '48 horas', after: '<3 segundos', improvement: '99.9%' }
		},
		{
			icon: Target,
			title: 'Precisión y Detección Inteligente',
			description:
				'Sistema de validación basado en reglas de negocio que detecta errores e inconsistencias automáticamente, con sugerencias de corrección.',
			benefit: 'Eliminación de 98% de errores humanos y reprocesos',
			metrics: { before: '37% error', after: '0.1% error', improvement: '99.7%' }
		},
		{
			icon: Shield,
			title: 'Trazabilidad y Auditoría Completa',
			description:
				'Cada operación queda registrada de forma permanente, permitiendo consultar el histórico completo en cualquier momento.',
			benefit: 'Cumplimiento garantizado de normativa CONSAR de 7 años',
			metrics: { before: '0% trazabilidad', after: '100% trazabilidad', improvement: 'infinito' }
		},
		{
			icon: BarChart3,
			title: 'Escalabilidad Cloud-Native',
			description:
				'Arquitectura cloud multi-proveedor que escala automáticamente de 100 a 10,000 archivos/mes sin intervención.',
			benefit: 'Costos reducidos en 86% vs equipo manual',
			metrics: { before: '$180K/año', after: '$25K/año', improvement: '86%' }
		}
	];

	function switchTab(tab) {
		activeTab = tab;
	}
</script>

<!-- Problem/Solution Section -->
<section class="relative py-24 px-4 md:px-8 overflow-hidden bg-gradient-to-b from-white to-neutral-50">
	<!-- Background decoration -->
	<div class="absolute inset-0 opacity-[0.03]">
		<div
			class="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent"
		></div>
	</div>

	<div class="container-custom relative z-10">
		<!-- Section Header -->
		<div class="text-center mb-16 {mounted ? 'animate-fade-in-up' : 'opacity-0'}">
			<div
				class="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-warning/10 to-danger/10 border border-warning/20 rounded-full text-sm font-medium text-warning mb-4"
			>
				<AlertTriangle class="w-4 h-4" />
				El costo de la validación manual
			</div>
			<h2 class="text-4xl md:text-5xl font-bold text-primary-dark mb-4">
				De Proceso Manual a
				<span class="bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
					Automatización Enterprise
				</span>
			</h2>
			<p class="text-xl text-neutral-600 max-w-3xl mx-auto">
				Transforme 48 horas de validación manual en 3 segundos automatizados, con trazabilidad
				completa y 99.9% de precisión.
			</p>
		</div>

		<!-- Tab Selector -->
		<div
			class="flex justify-center mb-12 {mounted ? 'animate-fade-in-up delay-300' : 'opacity-0'}"
		>
			<div
				class="inline-flex bg-white rounded-2xl p-2 shadow-lg border border-neutral-200"
				role="tablist"
			>
				<button
					class="px-8 py-4 rounded-xl font-semibold transition-all duration-300 {activeTab ===
					'problem'
						? 'bg-gradient-to-r from-warning/10 to-danger/10 text-warning shadow-md'
						: 'text-neutral-600 hover:text-neutral-900'}"
					onclick={() => switchTab('problem')}
					role="tab"
					aria-selected={activeTab === 'problem'}
				>
					<div class="flex items-center gap-2">
						<X class="w-5 h-5" />
						<span>El Problema</span>
					</div>
				</button>
				<button
					class="px-8 py-4 rounded-xl font-semibold transition-all duration-300 {activeTab ===
					'solution'
						? 'bg-gradient-to-r from-primary/10 to-success/10 text-primary shadow-md'
						: 'text-neutral-600 hover:text-neutral-900'}"
					onclick={() => switchTab('solution')}
					role="tab"
					aria-selected={activeTab === 'solution'}
				>
					<div class="flex items-center gap-2">
						<CheckCircle class="w-5 h-5" />
						<span>La Solución</span>
					</div>
				</button>
			</div>
		</div>

		<!-- Stats Comparison -->
		<div class="mb-16 {mounted ? 'animate-fade-in-up delay-500' : 'opacity-0'}">
			<div class="grid md:grid-cols-4 gap-6">
				{#if activeTab === 'problem'}
					{#each problemStats as stat}
						{@const StatIcon = stat.icon}
						<div
							class="relative group p-6 bg-gradient-to-br from-white to-neutral-50 rounded-2xl border-2 border-danger/20 shadow-lg hover:shadow-xl transition-all duration-300"
						>
							<div
								class="absolute inset-0 bg-gradient-to-br from-danger/5 to-warning/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"
							></div>
							<div class="relative">
								<div class="flex items-center justify-between mb-3">
									<div
										class="w-12 h-12 bg-danger/10 rounded-xl flex items-center justify-center"
									>
										<StatIcon class="w-6 h-6 text-danger" />
									</div>
									<TrendingDown class="w-5 h-5 text-danger" />
								</div>
								<div class="text-3xl font-bold text-danger mb-1">{stat.value}</div>
								<div class="text-sm text-neutral-600">{stat.label}</div>
							</div>
						</div>
					{/each}
				{:else}
					{#each solutionStats as stat}
						{@const StatIcon = stat.icon}
						<div
							class="relative group p-6 bg-gradient-to-br from-white to-neutral-50 rounded-2xl border-2 border-success/20 shadow-lg hover:shadow-xl transition-all duration-300"
						>
							<div
								class="absolute inset-0 bg-gradient-to-br from-success/5 to-primary/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"
							></div>
							<div class="relative">
								<div class="flex items-center justify-between mb-3">
									<div
										class="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center"
									>
										<StatIcon class="w-6 h-6 text-success" />
									</div>
									<TrendingUp class="w-5 h-5 text-success" />
								</div>
								<div class="text-3xl font-bold text-success mb-1">{stat.value}</div>
								<div class="text-sm text-neutral-600">{stat.label}</div>
							</div>
						</div>
					{/each}
				{/if}
			</div>
		</div>

		<!-- Content Cards -->
		<div class="space-y-6 {mounted ? 'animate-fade-in-up delay-700' : 'opacity-0'}">
			{#if activeTab === 'problem'}
				{#each problems as problem, index}
					{@const ProblemIcon = problem.icon}
					<div
						class="group relative bg-white rounded-2xl p-8 border-2 border-neutral-200 hover:border-danger/30 shadow-lg hover:shadow-xl transition-all duration-300"
						style="animation-delay: {index * 100}ms"
					>
						<!-- Problem indicator -->
						<div
							class="absolute top-6 right-6 w-12 h-12 bg-danger/10 rounded-full flex items-center justify-center"
						>
							<X class="w-6 h-6 text-danger" />
						</div>

						<div class="flex gap-6 pr-16">
							<div
								class="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-danger/20 to-warning/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform"
							>
								<ProblemIcon class="w-8 h-8 text-danger" />
							</div>

							<div class="flex-1">
								<h3 class="text-2xl font-bold text-neutral-900 mb-3 group-hover:text-danger transition-colors">
									{problem.title}
								</h3>
								<p class="text-lg text-neutral-700 mb-4 leading-relaxed">
									{problem.description}
								</p>
								<div
									class="flex items-start gap-3 p-4 bg-danger/5 border-l-4 border-danger rounded-lg"
								>
									<AlertTriangle class="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
									<div>
										<p class="text-sm font-semibold text-danger mb-1">Impacto Real:</p>
										<p class="text-sm text-neutral-700">{problem.impact}</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				{/each}
			{:else}
				{#each solutions as solution, index}
					{@const SolutionIcon = solution.icon}
					<div
						class="group relative bg-white rounded-2xl p-8 border-2 border-neutral-200 hover:border-success/30 shadow-lg hover:shadow-xl transition-all duration-300"
						style="animation-delay: {index * 100}ms"
					>
						<!-- Solution indicator -->
						<div
							class="absolute top-6 right-6 w-12 h-12 bg-success/10 rounded-full flex items-center justify-center"
						>
							<CheckCircle class="w-6 h-6 text-success" />
						</div>

						<div class="flex gap-6 pr-16">
							<div
								class="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-primary/20 to-success/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform"
							>
								<SolutionIcon class="w-8 h-8 text-primary" />
							</div>

							<div class="flex-1">
								<h3 class="text-2xl font-bold text-neutral-900 mb-3 group-hover:text-primary transition-colors">
									{solution.title}
								</h3>
								<p class="text-lg text-neutral-700 mb-4 leading-relaxed">
									{solution.description}
								</p>

								<!-- Benefit Badge -->
								<div
									class="flex items-start gap-3 p-4 bg-gradient-to-r from-success/10 to-primary/10 border-l-4 border-success rounded-lg mb-4"
								>
									<CheckCircle class="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
									<div>
										<p class="text-sm font-semibold text-success mb-1">Beneficio Clave:</p>
										<p class="text-sm text-neutral-700">{solution.benefit}</p>
									</div>
								</div>

								<!-- Metrics Improvement -->
								<div class="grid grid-cols-3 gap-4">
									<div class="text-center p-3 bg-neutral-50 rounded-lg">
										<div class="text-xs text-neutral-500 mb-1">Antes</div>
										<div class="text-sm font-bold text-danger">{solution.metrics.before}</div>
									</div>
									<div class="flex items-center justify-center">
										<ArrowRight class="w-5 h-5 text-primary" />
									</div>
									<div class="text-center p-3 bg-success/10 rounded-lg">
										<div class="text-xs text-neutral-500 mb-1">Después</div>
										<div class="text-sm font-bold text-success">{solution.metrics.after}</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				{/each}
			{/if}
		</div>

		<!-- Bottom CTA -->
		<div class="mt-16 text-center {mounted ? 'animate-fade-in-up delay-900' : 'opacity-0'}">
			<div class="inline-block p-8 bg-gradient-to-br from-primary/5 to-success/5 rounded-2xl border border-primary/20">
				<p class="text-lg text-neutral-700 mb-6 max-w-2xl">
					{#if activeTab === 'problem'}
						¿Le suena familiar? <span class="font-bold text-primary">Más de 100 AFOREs</span> en Latinoamérica
						enfrentan estos desafíos diariamente.
					{:else}
						<span class="font-bold text-primary">2 AFOREs en México</span> ya automatizaron su compliance
						con Hergon. ¿Cuándo será su turno?
					{/if}
				</p>
				<a
					href="#contact"
					class="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
				>
					{#if activeTab === 'problem'}
						Ver la Solución
					{:else}
						Solicitar Demo Gratuita
					{/if}
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
