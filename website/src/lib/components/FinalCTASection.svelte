<script>
	import {
		ArrowRight,
		CheckCircle2,
		Zap,
		Shield,
		TrendingUp,
		Clock,
		Users,
		Award,
		Star,
		Sparkles,
		Video,
		FileText,
		Calendar,
		Target,
		BarChart3,
		DollarSign,
		ChevronRight,
		Building2,
		MessageSquare,
		Phone
	} from 'lucide-svelte';
	import { onMount } from 'svelte';

	let mounted = $state(false);
	let activeStep = $state(0);

	onMount(() => {
		mounted = true;

		// Auto-rotate steps
		const interval = setInterval(() => {
			activeStep = (activeStep + 1) % nextSteps.length;
		}, 3000);

		return () => clearInterval(interval);
	});

	const nextSteps = [
		{
			step: 1,
			icon: MessageSquare,
			title: 'Contacto Inicial',
			description: 'Agende una llamada de 15 min',
			duration: 'Hoy',
			color: 'primary'
		},
		{
			step: 2,
			icon: Video,
			title: 'Demo Personalizada',
			description: 'Vea Hergon con sus archivos',
			duration: '2-3 días',
			color: 'success'
		},
		{
			step: 3,
			icon: FileText,
			title: 'Propuesta & ROI',
			description: 'Análisis detallado de valor',
			duration: '1 semana',
			color: 'warning'
		},
		{
			step: 4,
			icon: Zap,
			title: 'Implementación',
			description: 'Go-live en 2-4 semanas',
			duration: '2-4 semanas',
			color: 'primary'
		}
	];

	const finalBenefits = [
		{
			icon: Clock,
			stat: '99.9%',
			label: 'Reducción de Tiempo',
			description: 'De 48 horas a 3 segundos'
		},
		{
			icon: DollarSign,
			stat: '86%',
			label: 'Reducción de Costos',
			description: 'Ahorro anual promedio'
		},
		{
			icon: Shield,
			stat: '99.7%',
			label: 'Menos Errores',
			description: 'Precisión automatizada'
		},
		{
			icon: TrendingUp,
			stat: '520%',
			label: 'ROI Año 1',
			description: 'Retorno verificado'
		}
	];

	const socialProof = [
		{
			icon: Building2,
			value: '2',
			label: 'AFOREs Activas'
		},
		{
			icon: FileText,
			value: '10K+',
			label: 'Archivos/Mes'
		},
		{
			icon: Award,
			value: '37',
			label: 'Validaciones'
		},
		{
			icon: Users,
			value: '100%',
			label: 'Satisfacción'
		}
	];

	const urgencyReasons = [
		{
			icon: Target,
			title: 'Cumplimiento CONSAR 2026',
			description: 'Nuevas normativas requieren automatización'
		},
		{
			icon: TrendingUp,
			title: 'Ventaja Competitiva',
			description: 'Sus competidores ya están automatizando'
		},
		{
			icon: DollarSign,
			title: 'Ahorro Inmediato',
			description: 'Cada mes sin Hergon es dinero perdido'
		}
	];
</script>

<!-- Final CTA Section -->
<section
	class="relative py-24 px-4 md:px-8 bg-gradient-to-br from-primary-dark via-primary to-primary-dark text-white overflow-hidden"
>
	<!-- Animated background -->
	<div class="absolute inset-0 opacity-10">
		<div
			class="absolute inset-0"
			style="background-image: radial-gradient(circle at 2px 2px, white 1px, transparent 0); background-size: 50px 50px;"
		></div>
	</div>

	<!-- Gradient orbs -->
	<div class="absolute top-0 right-0 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl"></div>
	<div
		class="absolute bottom-0 left-0 w-[600px] h-[600px] bg-success/10 rounded-full blur-3xl"
	></div>

	<div class="container-custom relative z-10">
		<!-- Main Headline -->
		<div class="text-center mb-16 {mounted ? 'animate-fade-in-up' : 'opacity-0'}">
			<div
				class="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full text-sm font-medium mb-6"
			>
				<Sparkles class="w-4 h-4" />
				Transforme su Validación Hoy
			</div>

			<h2 class="text-4xl md:text-6xl font-bold mb-6 leading-tight">
				¿Listo para Automatizar
				<br />
				<span class="bg-gradient-to-r from-success to-warning bg-clip-text text-transparent">
					su Compliance?
				</span>
			</h2>

			<p class="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-8">
				Únase a las AFOREs que ya confían en Hergon para validación automatizada, cumplimiento
				garantizado, y ROI del 520% en el primer año.
			</p>

			<!-- Primary CTAs -->
			<div class="flex flex-wrap justify-center gap-4 mb-8">
				<a
					href="#contact"
					class="inline-flex items-center gap-3 px-8 py-5 bg-white text-primary font-bold text-lg rounded-xl hover:bg-neutral-100 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 group"
				>
					<Video class="w-6 h-6" />
					<span>Agendar Demo Gratuita</span>
					<ArrowRight class="w-6 h-6 group-hover:translate-x-1 transition-transform" />
				</a>

				<a
					href="#pricing"
					class="inline-flex items-center gap-3 px-8 py-5 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white font-bold text-lg rounded-xl hover:bg-white/20 transition-all duration-300 hover:scale-105"
				>
					<FileText class="w-6 h-6" />
					<span>Ver Planes y Precios</span>
				</a>
			</div>

			<p class="text-sm text-white/70">
				✓ Demo en vivo con sus archivos &nbsp;&nbsp;
				✓ Sin compromiso &nbsp;&nbsp;
				✓ Respuesta en 24 horas
			</p>
		</div>

		<!-- Next Steps Timeline -->
		<div class="mb-20 {mounted ? 'animate-fade-in-up delay-200' : 'opacity-0'}">
			<h3 class="text-2xl md:text-3xl font-bold text-center mb-12">
				Su Camino hacia la Automatización
			</h3>

			<div class="max-w-5xl mx-auto">
				<!-- Desktop Timeline -->
				<div class="hidden md:block">
					<div class="relative">
						<!-- Progress Line -->
						<div class="absolute top-16 left-0 right-0 h-1 bg-white/20">
							<div
								class="h-full bg-gradient-to-r from-success to-warning transition-all duration-1000"
								style="width: {((activeStep + 1) / nextSteps.length) * 100}%"
							></div>
						</div>

						<!-- Steps -->
						<div class="grid grid-cols-4 gap-4">
							{#each nextSteps as step, index}
								{@const StepIcon = step.icon}
								<div class="relative">
									<button
										onclick={() => (activeStep = index)}
										class="w-full p-6 bg-white/10 backdrop-blur-lg border-2 rounded-2xl transition-all duration-300 {activeStep ===
										index
											? 'border-white shadow-2xl shadow-white/20 scale-105'
											: 'border-white/30 hover:border-white/50'}"
									>
										<!-- Step Number Circle -->
										<div
											class="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center font-bold text-2xl transition-all duration-300 {activeStep ===
											index
												? 'bg-white text-primary scale-110'
												: 'bg-white/20 text-white'}"
										>
											{step.step}
										</div>

										<!-- Icon -->
										<div class="mb-4">
											<StepIcon
												class="w-8 h-8 mx-auto {activeStep === index ? 'text-white' : 'text-white/70'}"
											/>
										</div>

										<!-- Content -->
										<h4 class="font-bold mb-2 text-white">{step.title}</h4>
										<p class="text-sm text-white/80 mb-3">{step.description}</p>
										<div
											class="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-semibold"
										>
											{step.duration}
										</div>
									</button>
								</div>
							{/each}
						</div>
					</div>
				</div>

				<!-- Mobile Timeline -->
				<div class="md:hidden space-y-4">
					{#each nextSteps as step, index}
						{@const StepIcon = step.icon}
						<button
							onclick={() => (activeStep = index)}
							class="w-full p-6 bg-white/10 backdrop-blur-lg border-2 rounded-2xl transition-all duration-300 {activeStep ===
							index
								? 'border-white shadow-lg'
								: 'border-white/30'}"
						>
							<div class="flex items-center gap-4">
								<div
									class="w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl {activeStep ===
									index
										? 'bg-white text-primary'
										: 'bg-white/20 text-white'}"
								>
									{step.step}
								</div>
								<div class="flex-1 text-left">
									<h4 class="font-bold mb-1 text-white">{step.title}</h4>
									<p class="text-sm text-white/80">{step.description}</p>
								</div>
								<div class="px-3 py-1 bg-white/20 rounded-full text-xs font-semibold">
									{step.duration}
								</div>
							</div>
						</button>
					{/each}
				</div>
			</div>
		</div>

		<!-- Final Benefits Grid -->
		<div class="mb-20 {mounted ? 'animate-fade-in-up delay-400' : 'opacity-0'}">
			<h3 class="text-2xl md:text-3xl font-bold text-center mb-12">
				El Impacto que Puede Esperar
			</h3>

			<div class="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
				{#each finalBenefits as benefit}
					{@const Icon = benefit.icon}
					<div
						class="p-6 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl hover:bg-white/15 transition-all duration-300 hover:scale-105 group"
					>
						<div
							class="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
						>
							<Icon class="w-7 h-7 text-white" />
						</div>
						<div class="text-4xl font-bold mb-2">{benefit.stat}</div>
						<div class="text-sm font-semibold mb-2">{benefit.label}</div>
						<div class="text-xs text-white/70">{benefit.description}</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- Social Proof Bar -->
		<div class="mb-20 {mounted ? 'animate-fade-in-up delay-600' : 'opacity-0'}">
			<div
				class="p-8 bg-white/10 backdrop-blur-xl border border-white/30 rounded-3xl max-w-5xl mx-auto"
			>
				<div class="grid grid-cols-2 md:grid-cols-4 gap-8">
					{#each socialProof as proof}
						{@const Icon = proof.icon}
						<div class="text-center">
							<Icon class="w-8 h-8 text-white/70 mx-auto mb-3" />
							<div class="text-3xl md:text-4xl font-bold mb-1">{proof.value}</div>
							<div class="text-sm text-white/80">{proof.label}</div>
						</div>
					{/each}
				</div>
			</div>
		</div>

		<!-- Urgency Section -->
		<div class="mb-16 {mounted ? 'animate-fade-in-up delay-800' : 'opacity-0'}">
			<div class="max-w-4xl mx-auto">
				<h3 class="text-2xl md:text-3xl font-bold text-center mb-8">
					Por Qué Actuar Ahora
				</h3>

				<div class="grid md:grid-cols-3 gap-6">
					{#each urgencyReasons as reason}
						{@const Icon = reason.icon}
						<div
							class="p-6 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl hover:bg-white/15 transition-all duration-300"
						>
							<div class="w-12 h-12 bg-warning/20 rounded-xl flex items-center justify-center mb-4">
								<Icon class="w-6 h-6 text-warning" />
							</div>
							<h4 class="font-bold mb-2 text-lg">{reason.title}</h4>
							<p class="text-sm text-white/80">{reason.description}</p>
						</div>
					{/each}
				</div>
			</div>
		</div>

		<!-- Final Multiple CTAs -->
		<div class="text-center {mounted ? 'animate-fade-in-up delay-1000' : 'opacity-0'}">
			<div class="mb-8">
				<h3 class="text-3xl md:text-4xl font-bold mb-4">
					Elija su Siguiente Paso
				</h3>
				<p class="text-xl text-white/90 max-w-2xl mx-auto">
					Múltiples formas de comenzar. Todas sin compromiso.
				</p>
			</div>

			<div class="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
				<!-- Demo CTA -->
				<div
					class="p-6 bg-white/10 backdrop-blur-lg border-2 border-white/30 rounded-2xl hover:bg-white/15 hover:border-white/50 transition-all duration-300 hover:scale-105 group"
				>
					<Video class="w-12 h-12 mx-auto mb-4 text-success" />
					<h4 class="font-bold text-lg mb-2">Demo Personalizada</h4>
					<p class="text-sm text-white/80 mb-6">
						30 minutos con experto. Vea Hergon con sus archivos.
					</p>
					<a
						href="#contact"
						class="inline-flex items-center gap-2 px-6 py-3 bg-success text-white font-semibold rounded-xl hover:bg-success/90 transition-all w-full justify-center group-hover:scale-105"
					>
						<span>Agendar Demo</span>
						<ArrowRight class="w-5 h-5" />
					</a>
				</div>

				<!-- Talk to Sales CTA -->
				<div
					class="p-6 bg-white/10 backdrop-blur-lg border-2 border-white/30 rounded-2xl hover:bg-white/15 hover:border-white/50 transition-all duration-300 hover:scale-105 group"
				>
					<Phone class="w-12 h-12 mx-auto mb-4 text-primary" />
					<h4 class="font-bold text-lg mb-2">Hablar con Ventas</h4>
					<p class="text-sm text-white/80 mb-6">
						Discuta sus necesidades específicas y obtenga una cotización.
					</p>
					<a
						href="tel:+525512345678"
						class="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary font-semibold rounded-xl hover:bg-neutral-100 transition-all w-full justify-center group-hover:scale-105"
					>
						<span>Llamar Ahora</span>
						<Phone class="w-5 h-5" />
					</a>
				</div>

				<!-- Download Info CTA -->
				<div
					class="p-6 bg-white/10 backdrop-blur-lg border-2 border-white/30 rounded-2xl hover:bg-white/15 hover:border-white/50 transition-all duration-300 hover:scale-105 group"
				>
					<FileText class="w-12 h-12 mx-auto mb-4 text-warning" />
					<h4 class="font-bold text-lg mb-2">Descargar Info</h4>
					<p class="text-sm text-white/80 mb-6">
						PDF con casos de uso, ROI y especificaciones técnicas.
					</p>
					<a
						href="#contact"
						class="inline-flex items-center gap-2 px-6 py-3 bg-warning text-white font-semibold rounded-xl hover:bg-warning/90 transition-all w-full justify-center group-hover:scale-105"
					>
						<span>Solicitar PDF</span>
						<ArrowRight class="w-5 h-5" />
					</a>
				</div>
			</div>

			<!-- Trust Badges -->
			<div class="flex flex-wrap justify-center items-center gap-8 text-sm text-white/70">
				<div class="flex items-center gap-2">
					<CheckCircle2 class="w-5 h-5 text-success" />
					<span>Sin tarjeta de crédito</span>
				</div>
				<div class="flex items-center gap-2">
					<CheckCircle2 class="w-5 h-5 text-success" />
					<span>Demo en 24 horas</span>
				</div>
				<div class="flex items-center gap-2">
					<CheckCircle2 class="w-5 h-5 text-success" />
					<span>Setup en 2-4 semanas</span>
				</div>
				<div class="flex items-center gap-2">
					<CheckCircle2 class="w-5 h-5 text-success" />
					<span>ROI garantizado</span>
				</div>
			</div>
		</div>

		<!-- Bottom Guarantee -->
		<div class="mt-16 text-center {mounted ? 'animate-fade-in-up delay-1200' : 'opacity-0'}">
			<div
				class="inline-block p-8 bg-white/5 backdrop-blur-lg border border-white/20 rounded-3xl max-w-3xl"
			>
				<Shield class="w-16 h-16 mx-auto mb-4 text-success" />
				<h4 class="text-2xl font-bold mb-3">Garantía de Satisfacción</h4>
				<p class="text-white/90 mb-4">
					Si en los primeros 30 días Hergon no cumple con sus expectativas, le devolvemos el
					100% de su inversión. Sin preguntas.
				</p>
				<div class="flex items-center justify-center gap-2 text-sm text-success">
					<Star class="w-5 h-5 fill-current" />
					<Star class="w-5 h-5 fill-current" />
					<Star class="w-5 h-5 fill-current" />
					<Star class="w-5 h-5 fill-current" />
					<Star class="w-5 h-5 fill-current" />
					<span class="ml-2 font-semibold">100% Satisfacción de Clientes</span>
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

	.delay-800 {
		animation-delay: 800ms;
	}

	.delay-1000 {
		animation-delay: 1000ms;
	}

	.delay-1200 {
		animation-delay: 1200ms;
	}
</style>
