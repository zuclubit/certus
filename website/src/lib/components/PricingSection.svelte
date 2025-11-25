<script>
	import {
		Check,
		X,
		Zap,
		Building2,
		TrendingUp,
		DollarSign,
		Calculator,
		ArrowRight,
		Info,
		Star,
		Shield,
		Clock,
		Users,
		BarChart3,
		Sparkles,
		ChevronRight,
		FileText,
		Headphones,
		Award,
		Lock,
		Globe,
		CheckCircle2,
		AlertCircle,
		Settings
	} from 'lucide-svelte';
	import { onMount } from 'svelte';

	let mounted = $state(false);
	let billingCycle = $state('annual'); // 'annual' or 'monthly'
	let showComparison = $state(false);
	let selectedTier = $state(null);

	// ROI Calculator states
	let fondos = $state(5);
	let archivosPerMonth = $state(500);
	let currentStaff = $state(3);
	let currentErrorRate = $state(25);

	let calculatedSavings = $state({
		staffSavings: 0,
		timeSavings: 0,
		errorSavings: 0,
		totalAnnualSavings: 0,
		roi: 0,
		paybackMonths: 0
	});

	onMount(() => {
		mounted = true;
		calculateROI();
	});

	$effect(() => {
		calculateROI();
	});

	function calculateROI() {
		// Cálculos basados en métricas reales
		const hourlyRate = 25; // USD por hora
		const hoursPerFile = 0.5; // 30 minutos manuales vs 3 segundos automatizado
		const errorCostPerFile = 50; // Costo promedio de reprocesamiento

		// Ahorro de personal
		const currentAnnualStaffCost = currentStaff * 35000; // $35K por FTE
		const newStaffNeeded = Math.ceil(currentStaff * 0.2); // 80% reducción
		const staffSavings = currentAnnualStaffCost - newStaffNeeded * 35000;

		// Ahorro de tiempo
		const annualFiles = archivosPerMonth * 12;
		const timeSavings = annualFiles * hoursPerFile * hourlyRate;

		// Ahorro por reducción de errores
		const currentErrors = annualFiles * (currentErrorRate / 100);
		const newErrors = annualFiles * 0.001; // 0.1% error rate
		const errorSavings = (currentErrors - newErrors) * errorCostPerFile;

		const totalAnnualSavings = staffSavings + timeSavings + errorSavings;

		// Costo estimado de Hergon
		const hergonAnnualCost = fondos * 7500; // $7,500 por fondo

		const roi = ((totalAnnualSavings - hergonAnnualCost) / hergonAnnualCost) * 100;
		const paybackMonths = (hergonAnnualCost / (totalAnnualSavings / 12)).toFixed(1);

		calculatedSavings = {
			staffSavings,
			timeSavings,
			errorSavings,
			totalAnnualSavings,
			roi,
			paybackMonths: parseFloat(paybackMonths)
		};
	}

	const pricingTiers = [
		{
			id: 'starter',
			name: 'Starter',
			tagline: 'Para AFOREs en crecimiento',
			badge: null,
			monthlyPrice: 750,
			annualPrice: 7500,
			priceUnit: 'por fondo',
			description: 'Perfecto para AFOREs con hasta 5 fondos que buscan automatizar su validación',
			maxFunds: 5,
			filesPerMonth: '5,000',
			recommended: false,
			features: [
				{
					category: 'Validación',
					items: [
						{ name: '30+ validaciones base CONSAR', included: true },
						{ name: 'Validación en tiempo real (<3s)', included: true },
						{ name: 'Formatos CSV, Excel, TXT', included: true },
						{ name: 'Validaciones personalizadas configurables', included: false },
						{ name: 'Machine Learning predictions', included: false }
					]
				},
				{
					category: 'Infraestructura',
					items: [
						{ name: 'API REST completa', included: true },
						{ name: 'Webhooks para eventos', included: true },
						{ name: 'SLA 99.9% uptime', included: true },
						{ name: 'Auto-scaling', included: true },
						{ name: 'Dedicated infrastructure', included: false }
					]
				},
				{
					category: 'Reportes & Analytics',
					items: [
						{ name: 'Dashboard en tiempo real', included: true },
						{ name: 'Reportes de cumplimiento', included: true },
						{ name: 'Exportación CSV/Excel/PDF', included: true },
						{ name: 'Análisis predictivo', included: false },
						{ name: 'Custom dashboards', included: false }
					]
				},
				{
					category: 'Soporte & SLA',
					items: [
						{ name: 'Soporte por email', included: true },
						{ name: 'Documentación completa', included: true },
						{ name: 'Response time: 24 horas', included: true },
						{ name: 'Soporte telefónico 24/7', included: false },
						{ name: 'Technical account manager', included: false }
					]
				},
				{
					category: 'Seguridad & Compliance',
					items: [
						{ name: 'Encriptación TLS 1.3', included: true },
						{ name: 'Multi-tenancy con RLS', included: true },
						{ name: 'Auditoría completa (7+ años)', included: true },
						{ name: 'SSO/SAML integration', included: false },
						{ name: 'Custom security policies', included: false }
					]
				}
			],
			highlights: [
				'Ideal para empezar rápido',
				'Sin costos de setup',
				'Escalable según crezca',
				'ROI típico: 400%+'
			],
			cta: 'Comenzar Ahora',
			ctaType: 'primary'
		},
		{
			id: 'professional',
			name: 'Professional',
			tagline: 'Para AFOREs establecidas',
			badge: 'Más Popular',
			monthlyPrice: 1500,
			annualPrice: 15000,
			priceUnit: 'por fondo',
			description: 'Para AFOREs medianas que necesitan capacidades avanzadas y soporte prioritario',
			maxFunds: 15,
			filesPerMonth: '20,000',
			recommended: true,
			features: [
				{
					category: 'Validación',
					items: [
						{ name: '30+ validaciones base CONSAR', included: true },
						{ name: 'Validación en tiempo real (<3s)', included: true },
						{ name: 'Formatos CSV, Excel, TXT', included: true },
						{ name: 'Validaciones personalizadas configurables', included: true, detail: 'Hasta 10 reglas custom' },
						{ name: 'Machine Learning predictions', included: true, detail: 'Detección anomalías' }
					]
				},
				{
					category: 'Infraestructura',
					items: [
						{ name: 'API REST completa', included: true },
						{ name: 'Webhooks para eventos', included: true },
						{ name: 'SLA 99.9% uptime', included: true },
						{ name: 'Auto-scaling', included: true },
						{ name: 'Dedicated infrastructure', included: true, detail: 'Pool dedicado' }
					]
				},
				{
					category: 'Reportes & Analytics',
					items: [
						{ name: 'Dashboard en tiempo real', included: true },
						{ name: 'Reportes de cumplimiento', included: true },
						{ name: 'Exportación CSV/Excel/PDF', included: true },
						{ name: 'Análisis predictivo', included: true, detail: 'Tendencias y forecasting' },
						{ name: 'Custom dashboards', included: true, detail: 'Hasta 5 dashboards' }
					]
				},
				{
					category: 'Soporte & SLA',
					items: [
						{ name: 'Soporte por email', included: true },
						{ name: 'Documentación completa', included: true },
						{ name: 'Response time: 24 horas', included: true, detail: '4 horas para críticos' },
						{ name: 'Soporte telefónico 24/7', included: true },
						{ name: 'Technical account manager', included: false }
					]
				},
				{
					category: 'Seguridad & Compliance',
					items: [
						{ name: 'Encriptación TLS 1.3', included: true },
						{ name: 'Multi-tenancy con RLS', included: true },
						{ name: 'Auditoría completa (7+ años)', included: true },
						{ name: 'SSO/SAML integration', included: true },
						{ name: 'Custom security policies', included: true }
					]
				}
			],
			highlights: [
				'Validaciones personalizadas',
				'Soporte telefónico 24/7',
				'ML predictions incluido',
				'ROI típico: 520%+'
			],
			cta: 'Comenzar Ahora',
			ctaType: 'primary'
		},
		{
			id: 'enterprise',
			name: 'Enterprise',
			tagline: 'Para grupos financieros',
			badge: 'Más Completo',
			monthlyPrice: null,
			annualPrice: null,
			priceUnit: 'contactar',
			description: 'Solución completa para AFOREs grandes o grupos con múltiples entidades',
			maxFunds: 'Ilimitado',
			filesPerMonth: '100K+',
			recommended: false,
			features: [
				{
					category: 'Validación',
					items: [
						{ name: '30+ validaciones base CONSAR', included: true },
						{ name: 'Validación en tiempo real (<3s)', included: true },
						{ name: 'Formatos CSV, Excel, TXT', included: true },
						{ name: 'Validaciones personalizadas configurables', included: true, detail: 'Ilimitadas' },
						{ name: 'Machine Learning predictions', included: true, detail: 'Modelos custom' }
					]
				},
				{
					category: 'Infraestructura',
					items: [
						{ name: 'API REST completa', included: true },
						{ name: 'Webhooks para eventos', included: true },
						{ name: 'SLA 99.95% uptime', included: true, detail: 'Con penalizaciones' },
						{ name: 'Auto-scaling', included: true },
						{ name: 'Dedicated infrastructure', included: true, detail: 'Cluster dedicado' }
					]
				},
				{
					category: 'Reportes & Analytics',
					items: [
						{ name: 'Dashboard en tiempo real', included: true },
						{ name: 'Reportes de cumplimiento', included: true },
						{ name: 'Exportación CSV/Excel/PDF', included: true },
						{ name: 'Análisis predictivo', included: true, detail: 'Advanced analytics' },
						{ name: 'Custom dashboards', included: true, detail: 'Ilimitados' }
					]
				},
				{
					category: 'Soporte & SLA',
					items: [
						{ name: 'Soporte por email', included: true },
						{ name: 'Documentación completa', included: true },
						{ name: 'Response time: 24 horas', included: true, detail: '1 hora para críticos' },
						{ name: 'Soporte telefónico 24/7', included: true },
						{ name: 'Technical account manager', included: true, detail: 'Dedicado' }
					]
				},
				{
					category: 'Seguridad & Compliance',
					items: [
						{ name: 'Encriptación TLS 1.3', included: true },
						{ name: 'Multi-tenancy con RLS', included: true },
						{ name: 'Auditoría completa (7+ años)', included: true },
						{ name: 'SSO/SAML integration', included: true },
						{ name: 'Custom security policies', included: true, detail: 'Completamente customizable' }
					]
				}
			],
			highlights: [
				'Account manager dedicado',
				'Capacitación on-site',
				'Consultoría regulatoria',
				'SLA 99.95% con penalizaciones',
				'Integración personalizada',
				'Soporte 1 hora críticos'
			],
			cta: 'Contactar Ventas',
			ctaType: 'outline'
		}
	];

	const addOns = [
		{
			id: 'advanced-ml',
			name: 'Advanced ML Analytics',
			icon: Sparkles,
			description: 'Modelos de machine learning personalizados para predicción de errores y optimización',
			price: 2500,
			priceUnit: '/mes',
			features: [
				'Modelos predictivos custom',
				'Detección de anomalías avanzada',
				'Forecasting de volumen',
				'Optimización automática'
			]
		},
		{
			id: 'multi-country',
			name: 'Multi-Country Support',
			icon: Globe,
			description: 'Soporte adicional para Chile, Colombia y Perú con validaciones específicas',
			price: 5000,
			priceUnit: '/país/año',
			features: [
				'Validaciones por regulador',
				'Formatos locales',
				'Compliance regional',
				'Soporte en zona horaria local'
			]
		},
		{
			id: 'white-label',
			name: 'White Label',
			icon: Award,
			description: 'Plataforma completamente personalizada con su marca y dominio',
			price: 15000,
			priceUnit: '/año',
			features: [
				'Branding completo',
				'Dominio personalizado',
				'UI/UX customizado',
				'Email templates branded'
			]
		},
		{
			id: 'consulting',
			name: 'Consultoría Regulatoria',
			icon: Users,
			description: 'Horas de consultoría con expertos en normativa CONSAR y regulación',
			price: 200,
			priceUnit: '/hora',
			features: [
				'Expertos certificados',
				'Análisis de compliance',
				'Preparación auditorías',
				'Training personalizado'
			]
		}
	];

	const comparisonCategories = [
		'Validación',
		'Infraestructura',
		'Reportes & Analytics',
		'Soporte & SLA',
		'Seguridad & Compliance'
	];

	function formatPrice(tier) {
		if (!tier.annualPrice) return 'Personalizado';
		const price = billingCycle === 'annual' ? tier.annualPrice : tier.monthlyPrice;
		return `$${price.toLocaleString()}`;
	}

	function formatCurrency(value) {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(value);
	}
</script>

<!-- Pricing Section -->
<section id="pricing" class="relative py-24 px-4 md:px-8 bg-white overflow-hidden">
	<!-- Background decoration -->
	<div class="absolute inset-0 opacity-5">
		<div
			class="absolute inset-0"
			style="background-image: radial-gradient(circle at 2px 2px, #0066FF 1px, transparent 0); background-size: 50px 50px;"
		></div>
	</div>

	<!-- Gradient orbs -->
	<div
		class="absolute top-0 right-0 w-[600px] h-[600px] bg-success/5 rounded-full blur-3xl"
	></div>
	<div
		class="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl"
	></div>

	<div class="container-custom relative z-10">
		<!-- Section Header -->
		<div class="text-center mb-16 {mounted ? 'animate-fade-in-up' : 'opacity-0'}">
			<div
				class="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-sm font-medium text-primary mb-4"
			>
				<DollarSign class="w-4 h-4" />
				Precios Transparentes y Escalables
			</div>
			<h2 class="text-4xl md:text-5xl font-bold text-primary-dark mb-4">
				Planes que
				<span class="bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
					Escalan con Tu AFORE
				</span>
			</h2>
			<p class="text-xl text-neutral-600 max-w-3xl mx-auto mb-8">
				Sin costos ocultos, sin sorpresas. Pague solo por lo que usa con la flexibilidad de
				escalar según sus necesidades crecen.
			</p>

			<!-- Billing Toggle -->
			<div class="inline-flex items-center gap-4 p-2 bg-neutral-100 rounded-full">
				<button
					onclick={() => (billingCycle = 'monthly')}
					class="px-6 py-2 rounded-full font-semibold transition-all duration-300 {billingCycle ===
					'monthly'
						? 'bg-white text-primary shadow-md'
						: 'text-neutral-600 hover:text-primary'}"
				>
					Mensual
				</button>
				<button
					onclick={() => (billingCycle = 'annual')}
					class="px-6 py-2 rounded-full font-semibold transition-all duration-300 relative {billingCycle ===
					'annual'
						? 'bg-white text-primary shadow-md'
						: 'text-neutral-600 hover:text-primary'}"
				>
					Anual
					<span
						class="absolute -top-2 -right-2 px-2 py-0.5 bg-success text-white text-xs font-bold rounded-full"
					>
						-17%
					</span>
				</button>
			</div>
		</div>

		<!-- Pricing Cards -->
		<div class="grid lg:grid-cols-3 gap-8 mb-16 {mounted ? 'animate-fade-in-up delay-200' : 'opacity-0'}">
			{#each pricingTiers as tier}
				<div
					class="relative p-8 bg-white border-2 rounded-3xl transition-all duration-300 hover:shadow-2xl {tier.recommended
						? 'border-primary shadow-xl scale-105'
						: 'border-neutral-200 hover:border-primary/50'}"
				>
					<!-- Recommended Badge -->
					{#if tier.badge}
						<div
							class="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-primary to-success text-white text-sm font-bold rounded-full shadow-lg"
						>
							{tier.badge}
						</div>
					{/if}

					<!-- Tier Header -->
					<div class="text-center mb-6">
						<h3 class="text-2xl font-bold text-primary-dark mb-2">{tier.name}</h3>
						<p class="text-neutral-600 text-sm mb-4">{tier.tagline}</p>

						<!-- Price -->
						<div class="mb-4">
							{#if tier.annualPrice}
								<div class="text-5xl font-bold text-primary mb-2">
									{formatPrice(tier)}
								</div>
								<div class="text-neutral-600 text-sm">
									{tier.priceUnit} / {billingCycle === 'annual' ? 'año' : 'mes'}
								</div>
							{:else}
								<div class="text-4xl font-bold text-primary mb-2">Personalizado</div>
								<div class="text-neutral-600 text-sm">Contactar ventas</div>
							{/if}
						</div>

						<p class="text-sm text-neutral-600">{tier.description}</p>
					</div>

					<!-- Key Metrics -->
					<div class="grid grid-cols-2 gap-4 mb-6 p-4 bg-neutral-50 rounded-xl">
						<div class="text-center">
							<div class="text-2xl font-bold text-primary-dark">{tier.maxFunds}</div>
							<div class="text-xs text-neutral-600">Fondos</div>
						</div>
						<div class="text-center">
							<div class="text-2xl font-bold text-primary-dark">{tier.filesPerMonth}</div>
							<div class="text-xs text-neutral-600">Archivos/Mes</div>
						</div>
					</div>

					<!-- Highlights -->
					<div class="mb-6">
						<h4 class="text-sm font-semibold text-neutral-900 mb-3">Características Destacadas:</h4>
						<ul class="space-y-2">
							{#each tier.highlights as highlight}
								<li class="flex items-center gap-2 text-sm">
									<CheckCircle2 class="w-4 h-4 text-success flex-shrink-0" />
									<span class="text-neutral-700">{highlight}</span>
								</li>
							{/each}
						</ul>
					</div>

					<!-- CTA Button -->
					<a
						href="#contact"
						class="block w-full px-6 py-4 rounded-xl font-semibold text-center transition-all duration-300 hover:scale-105 {tier.recommended
							? 'bg-gradient-to-r from-primary to-success text-white shadow-lg hover:shadow-xl'
							: tier.ctaType === 'primary'
								? 'bg-primary text-white hover:bg-primary-dark'
								: 'border-2 border-primary text-primary hover:bg-primary hover:text-white'}"
					>
						{tier.cta}
					</a>

					<!-- View Details -->
					<button
						onclick={() => (selectedTier = selectedTier === tier.id ? null : tier.id)}
						class="w-full mt-4 px-4 py-2 text-sm text-primary font-semibold hover:text-primary-dark transition-colors flex items-center justify-center gap-2"
					>
						<span>{selectedTier === tier.id ? 'Ocultar' : 'Ver'} Detalles Completos</span>
						<ChevronRight
							class="w-4 h-4 transition-transform {selectedTier === tier.id ? 'rotate-90' : ''}"
						/>
					</button>

					<!-- Expanded Details -->
					{#if selectedTier === tier.id}
						<div class="mt-6 pt-6 border-t border-neutral-200 space-y-4">
							{#each tier.features as category}
								<div>
									<h5 class="text-sm font-bold text-neutral-900 mb-3">{category.category}</h5>
									<ul class="space-y-2">
										{#each category.items as item}
											<li class="flex items-start gap-2 text-xs">
												{#if item.included}
													<Check class="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
												{:else}
													<X class="w-4 h-4 text-neutral-300 flex-shrink-0 mt-0.5" />
												{/if}
												<div class="flex-1">
													<span class={item.included ? 'text-neutral-700' : 'text-neutral-400'}>
														{item.name}
													</span>
													{#if item.detail}
														<span class="text-neutral-500 ml-1">({item.detail})</span>
													{/if}
												</div>
											</li>
										{/each}
									</ul>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			{/each}
		</div>

		<!-- Feature Comparison Toggle -->
		<div class="text-center mb-12 {mounted ? 'animate-fade-in-up delay-400' : 'opacity-0'}">
			<button
				onclick={() => (showComparison = !showComparison)}
				class="inline-flex items-center gap-3 px-8 py-4 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 rounded-xl font-semibold text-primary-dark transition-all duration-300 group"
			>
				<BarChart3 class="w-5 h-5" />
				<span>{showComparison ? 'Ocultar' : 'Ver'} Comparación Completa de Planes</span>
				<ChevronRight
					class="w-5 h-5 transition-transform {showComparison ? 'rotate-90' : ''}"
				/>
			</button>
		</div>

		<!-- Full Feature Comparison Matrix -->
		{#if showComparison}
			<div class="mb-16 overflow-x-auto {mounted ? 'animate-fade-in-up delay-500' : 'opacity-0'}">
				<div class="min-w-[900px] p-8 bg-white border border-neutral-200 rounded-3xl shadow-lg">
					<h3 class="text-2xl font-bold text-primary-dark mb-8 text-center">
						Comparación Detallada de Características
					</h3>

					{#each comparisonCategories as category}
						{@const categoryFeatures = pricingTiers[0].features.find((f) => f.category === category)}
						<div class="mb-8">
							<h4 class="text-lg font-bold text-neutral-900 mb-4 pb-2 border-b-2 border-primary/20">
								{category}
							</h4>
							<div class="space-y-3">
								{#each categoryFeatures.items as item}
									<div class="grid grid-cols-4 gap-4 items-center py-3 hover:bg-neutral-50 rounded-lg px-4">
										<div class="col-span-1 text-sm font-medium text-neutral-700">
											{item.name}
										</div>
										{#each pricingTiers as tier}
											{@const tierFeature = tier.features
												.find((f) => f.category === category)
												?.items.find((i) => i.name === item.name)}
											<div class="text-center">
												{#if tierFeature?.included}
													<div class="inline-flex flex-col items-center">
														<CheckCircle2 class="w-6 h-6 text-success mb-1" />
														{#if tierFeature.detail}
															<span class="text-xs text-neutral-500">{tierFeature.detail}</span>
														{/if}
													</div>
												{:else}
													<X class="w-6 h-6 text-neutral-300 mx-auto" />
												{/if}
											</div>
										{/each}
									</div>
								{/each}
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		<!-- ROI Calculator -->
		<div class="mb-16 {mounted ? 'animate-fade-in-up delay-600' : 'opacity-0'}">
			<div
				class="p-8 bg-gradient-to-br from-primary-dark via-primary to-primary-dark text-white rounded-3xl"
			>
				<div class="text-center mb-8">
					<div class="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-4">
						<Calculator class="w-4 h-4" />
						Calculadora de ROI
					</div>
					<h3 class="text-3xl font-bold mb-2">Calcule Su Retorno de Inversión</h3>
					<p class="text-white/80 max-w-2xl mx-auto">
						Vea cuánto puede ahorrar su AFORE con Hergon basado en sus métricas actuales
					</p>
				</div>

				<div class="grid lg:grid-cols-2 gap-8">
					<!-- Calculator Inputs -->
					<div class="space-y-6">
						<div class="p-6 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20">
							<h4 class="text-lg font-semibold mb-6">Sus Métricas Actuales</h4>

							<!-- Fondos -->
							<div class="mb-6">
								<label for="fondos-slider" class="block text-sm font-medium mb-2">
									Número de Fondos
									<span class="text-white/60">(Básica, Ahorro, etc.)</span>
								</label>
								<input
									id="fondos-slider"
									type="range"
									min="1"
									max="20"
									bind:value={fondos}
									class="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
								/>
								<div class="flex justify-between text-sm text-white/80 mt-2">
									<span>1</span>
									<span class="text-xl font-bold text-white">{fondos} fondos</span>
									<span>20</span>
								</div>
							</div>

							<!-- Archivos por mes -->
							<div class="mb-6">
								<label for="archivos-slider" class="block text-sm font-medium mb-2">
									Archivos Procesados por Mes
								</label>
								<input
									id="archivos-slider"
									type="range"
									min="100"
									max="10000"
									step="100"
									bind:value={archivosPerMonth}
									class="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
								/>
								<div class="flex justify-between text-sm text-white/80 mt-2">
									<span>100</span>
									<span class="text-xl font-bold text-white">{archivosPerMonth.toLocaleString()}</span>
									<span>10K</span>
								</div>
							</div>

							<!-- Personal actual -->
							<div class="mb-6">
								<label for="staff-slider" class="block text-sm font-medium mb-2">
									Personal Dedicado a Validación (FTE)
								</label>
								<input
									id="staff-slider"
									type="range"
									min="1"
									max="10"
									bind:value={currentStaff}
									class="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
								/>
								<div class="flex justify-between text-sm text-white/80 mt-2">
									<span>1</span>
									<span class="text-xl font-bold text-white">{currentStaff} personas</span>
									<span>10</span>
								</div>
							</div>

							<!-- Tasa de error actual -->
							<div>
								<label for="error-slider" class="block text-sm font-medium mb-2">
									Tasa de Error Actual (%)
								</label>
								<input
									id="error-slider"
									type="range"
									min="5"
									max="50"
									bind:value={currentErrorRate}
									class="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
								/>
								<div class="flex justify-between text-sm text-white/80 mt-2">
									<span>5%</span>
									<span class="text-xl font-bold text-white">{currentErrorRate}%</span>
									<span>50%</span>
								</div>
							</div>
						</div>
					</div>

					<!-- Results -->
					<div class="space-y-4">
						<div class="p-6 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20">
							<h4 class="text-lg font-semibold mb-6">Resultados Estimados</h4>

							<!-- Savings Breakdown -->
							<div class="space-y-4 mb-6">
								<div class="p-4 bg-white/5 rounded-xl">
									<div class="flex items-center justify-between mb-2">
										<div class="flex items-center gap-2">
											<Users class="w-5 h-5 text-success" />
											<span class="text-sm">Ahorro en Personal</span>
										</div>
										<span class="text-xl font-bold">{formatCurrency(calculatedSavings.staffSavings)}</span>
									</div>
									<div class="text-xs text-white/60">
										Reducción de {currentStaff} a {Math.ceil(currentStaff * 0.2)} FTE (80% reducción)
									</div>
								</div>

								<div class="p-4 bg-white/5 rounded-xl">
									<div class="flex items-center justify-between mb-2">
										<div class="flex items-center gap-2">
											<Clock class="w-5 h-5 text-success" />
											<span class="text-sm">Ahorro en Tiempo</span>
										</div>
										<span class="text-xl font-bold">{formatCurrency(calculatedSavings.timeSavings)}</span>
									</div>
									<div class="text-xs text-white/60">
										De 30 min/archivo a 3 segundos (99.9% más rápido)
									</div>
								</div>

								<div class="p-4 bg-white/5 rounded-xl">
									<div class="flex items-center justify-between mb-2">
										<div class="flex items-center gap-2">
											<Shield class="w-5 h-5 text-success" />
											<span class="text-sm">Ahorro por Reducción de Errores</span>
										</div>
										<span class="text-xl font-bold">{formatCurrency(calculatedSavings.errorSavings)}</span>
									</div>
									<div class="text-xs text-white/60">
										De {currentErrorRate}% a 0.1% tasa de error
									</div>
								</div>
							</div>

							<!-- Total Savings & ROI -->
							<div class="pt-6 border-t border-white/20">
								<div class="mb-4">
									<div class="text-sm text-white/80 mb-1">Ahorro Anual Total</div>
									<div class="text-4xl font-bold text-success">
										{formatCurrency(calculatedSavings.totalAnnualSavings)}
									</div>
								</div>

								<div class="grid grid-cols-2 gap-4">
									<div class="p-4 bg-white/5 rounded-xl text-center">
										<div class="text-2xl font-bold text-warning mb-1">
											{calculatedSavings.roi.toFixed(0)}%
										</div>
										<div class="text-xs text-white/80">ROI Año 1</div>
									</div>
									<div class="p-4 bg-white/5 rounded-xl text-center">
										<div class="text-2xl font-bold text-warning mb-1">
											{calculatedSavings.paybackMonths}
										</div>
										<div class="text-xs text-white/80">Meses de Payback</div>
									</div>
								</div>
							</div>
						</div>

						<a
							href="#contact"
							class="block w-full px-6 py-4 bg-white text-primary font-bold text-center rounded-xl hover:bg-neutral-100 transition-all duration-300 hover:scale-105"
						>
							Solicitar Análisis Detallado
						</a>
					</div>
				</div>
			</div>
		</div>

		<!-- Add-ons Section -->
		<div class="mb-16 {mounted ? 'animate-fade-in-up delay-800' : 'opacity-0'}">
			<div class="text-center mb-12">
				<h3 class="text-3xl font-bold text-primary-dark mb-4">Servicios Adicionales</h3>
				<p class="text-lg text-neutral-600 max-w-2xl mx-auto">
					Expanda las capacidades de su plataforma con nuestros servicios complementarios
				</p>
			</div>

			<div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
				{#each addOns as addon}
					{@const Icon = addon.icon}
					<div
						class="p-6 bg-white border border-neutral-200 rounded-2xl hover:border-primary hover:shadow-lg transition-all duration-300 group"
					>
						<div class="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
							<Icon class="w-6 h-6 text-primary" />
						</div>

						<h4 class="text-lg font-bold text-primary-dark mb-2">{addon.name}</h4>
						<p class="text-sm text-neutral-600 mb-4">{addon.description}</p>

						<div class="mb-4">
							<span class="text-2xl font-bold text-primary">${addon.price.toLocaleString()}</span>
							<span class="text-sm text-neutral-600">{addon.priceUnit}</span>
						</div>

						<ul class="space-y-2">
							{#each addon.features as feature}
								<li class="flex items-center gap-2 text-xs text-neutral-700">
									<Check class="w-3 h-3 text-success flex-shrink-0" />
									<span>{feature}</span>
								</li>
							{/each}
						</ul>
					</div>
				{/each}
			</div>
		</div>

		<!-- FAQ / Common Questions -->
		<div class="text-center {mounted ? 'animate-fade-in-up delay-1000' : 'opacity-0'}">
			<div class="p-8 bg-neutral-50 border border-neutral-200 rounded-3xl max-w-4xl mx-auto">
				<Info class="w-12 h-12 text-primary mx-auto mb-4" />
				<h3 class="text-2xl font-bold text-primary-dark mb-4">¿Preguntas sobre Precios?</h3>
				<p class="text-neutral-600 mb-6">
					Todos los planes incluyen actualizaciones automáticas, soporte técnico, y acceso completo
					a nuevas funcionalidades sin costo adicional. Los precios se ajustan automáticamente al
					crecer su número de fondos.
				</p>
				<div class="flex flex-wrap justify-center gap-4">
					<a
						href="#contact"
						class="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-all duration-300"
					>
						<span>Hablar con Ventas</span>
						<ArrowRight class="w-5 h-5" />
					</a>
					<a
						href="#contact"
						class="inline-flex items-center gap-2 px-6 py-3 border-2 border-primary text-primary font-semibold rounded-xl hover:bg-primary hover:text-white transition-all duration-300"
					>
						<span>Solicitar Demo</span>
						<ArrowRight class="w-5 h-5" />
					</a>
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

	.delay-500 {
		animation-delay: 500ms;
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

	/* Custom slider styles */
	.slider::-webkit-slider-thumb {
		appearance: none;
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background: white;
		cursor: pointer;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
	}

	.slider::-moz-range-thumb {
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background: white;
		cursor: pointer;
		border: none;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
	}
</style>
