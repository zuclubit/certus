<script>
	import {
		Mail,
		Phone,
		MapPin,
		Send,
		Calendar,
		MessageSquare,
		Clock,
		CheckCircle2,
		Building2,
		Users,
		Zap,
		Shield,
		ArrowRight,
		Globe,
		Linkedin,
		Twitter,
		Star,
		Award,
		Target,
		TrendingUp,
		AlertCircle,
		Info,
		Video,
		FileText,
		Headphones
	} from 'lucide-svelte';
	import { onMount } from 'svelte';

	let mounted = $state(false);
	let contactMethod = $state('demo'); // 'demo', 'contact', 'support'
	let selectedPlan = $state('professional');
	let industry = $state('');
	let preferredTime = $state('');

	// Form state
	let formData = $state({
		name: '',
		email: '',
		company: '',
		country: 'mexico',
		phone: '',
		fondos: '',
		archivosPerMonth: '',
		currentSolution: '',
		message: '',
		agreeToTerms: false
	});

	let formErrors = $state({
		name: '',
		email: '',
		company: '',
		phone: ''
	});

	let isSubmitting = $state(false);
	let submitSuccess = $state(false);

	onMount(() => {
		mounted = true;
	});

	function validateEmail(email) {
		const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return re.test(email);
	}

	function validateForm() {
		let isValid = true;
		const errors = {
			name: '',
			email: '',
			company: '',
			phone: ''
		};

		if (!formData.name.trim()) {
			errors.name = 'El nombre es requerido';
			isValid = false;
		}

		if (!formData.email.trim()) {
			errors.email = 'El email es requerido';
			isValid = false;
		} else if (!validateEmail(formData.email)) {
			errors.email = 'Email inválido';
			isValid = false;
		}

		if (!formData.company.trim()) {
			errors.company = 'La empresa es requerida';
			isValid = false;
		}

		formErrors = errors;
		return isValid;
	}

	async function handleSubmit(e) {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		isSubmitting = true;

		// Simulate API call
		await new Promise((resolve) => setTimeout(resolve, 2000));

		isSubmitting = false;
		submitSuccess = true;

		// Reset form after success
		setTimeout(() => {
			submitSuccess = false;
			formData = {
				name: '',
				email: '',
				company: '',
				country: 'mexico',
				phone: '',
				fondos: '',
				archivosPerMonth: '',
				currentSolution: '',
				message: '',
				agreeToTerms: false
			};
		}, 5000);
	}

	const contactMethods = [
		{
			id: 'demo',
			icon: Video,
			title: 'Agendar Demo',
			description: 'Demo personalizada de 30 minutos',
			badge: 'Más Popular',
			benefits: [
				'Demo en vivo con experto',
				'Análisis de sus archivos',
				'Prueba con datos reales',
				'ROI personalizado'
			]
		},
		{
			id: 'contact',
			icon: MessageSquare,
			title: 'Contacto General',
			description: 'Información y cotización',
			badge: null,
			benefits: ['Respuesta en 24 horas', 'Cotización detallada', 'Plan personalizado', 'Sin compromiso']
		},
		{
			id: 'support',
			icon: Headphones,
			title: 'Soporte Técnico',
			description: 'Para clientes actuales',
			badge: 'Clientes',
			benefits: [
				'Soporte prioritario',
				'Acceso a documentación',
				'Chat en vivo',
				'Portal de tickets'
			]
		}
	];

	const offices = [
		{
			country: 'México',
			flag: '🇲🇽',
			city: 'Ciudad de México',
			address: 'Paseo de la Reforma 505',
			neighborhood: 'Cuauhtémoc',
			zipCode: '06500',
			phone: '+52 55 1234 5678',
			email: 'mexico@hergon.com',
			hours: 'Lun-Vie: 9:00 - 18:00',
			timezone: 'GMT-6',
			isPrimary: true
		},
		{
			country: 'Chile',
			flag: '🇨🇱',
			city: 'Santiago',
			address: 'Av. Apoquindo 4800',
			neighborhood: 'Las Condes',
			zipCode: '7550000',
			phone: '+56 2 2345 6789',
			email: 'chile@hergon.com',
			hours: 'Lun-Vie: 9:00 - 18:00',
			timezone: 'GMT-3',
			isPrimary: false
		}
	];

	const countries = [
		{ value: 'mexico', label: 'México' },
		{ value: 'chile', label: 'Chile' },
		{ value: 'colombia', label: 'Colombia' },
		{ value: 'peru', label: 'Perú' },
		{ value: 'other', label: 'Otro' }
	];

	const timeSlots = [
		{ value: 'morning', label: 'Mañana (9:00 - 12:00)' },
		{ value: 'afternoon', label: 'Tarde (12:00 - 15:00)' },
		{ value: 'evening', label: 'Tarde-Noche (15:00 - 18:00)' }
	];

	const plans = [
		{ value: 'starter', label: 'Starter (1-5 fondos)' },
		{ value: 'professional', label: 'Professional (6-15 fondos)' },
		{ value: 'enterprise', label: 'Enterprise (15+ fondos)' },
		{ value: 'not-sure', label: 'No estoy seguro' }
	];

	const faqs = [
		{
			question: '¿Cuánto tiempo toma la implementación?',
			answer:
				'La implementación típica toma 2-4 semanas desde el contrato hasta go-live. Incluye setup, integración con sus sistemas, capacitación y validación con archivos reales.'
		},
		{
			question: '¿Ofrecen período de prueba?',
			answer:
				'Sí, ofrecemos un piloto de 30 días donde puede probar la plataforma con sus archivos reales. Sin compromiso y con soporte completo durante el período de prueba.'
		},
		{
			question: '¿Qué tipo de soporte incluyen?',
			answer:
				'Todos los planes incluyen soporte técnico por email. Professional y Enterprise incluyen soporte telefónico 24/7. Enterprise incluye account manager dedicado.'
		},
		{
			question: '¿Los datos están seguros?',
			answer:
				'Absolutamente. Utilizamos encriptación TLS 1.3, almacenamiento AES-256, multi-tenancy con RLS, y cumplimos con SOC 2 e ISO 27001. Auditorías trimestrales de penetration testing.'
		}
	];

	function getMethodIcon(method) {
		const m = contactMethods.find((cm) => cm.id === method);
		return m ? m.icon : MessageSquare;
	}
</script>

<!-- Contact Section -->
<section
	id="contact"
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
		class="absolute top-0 left-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl"
	></div>
	<div
		class="absolute bottom-0 right-0 w-[600px] h-[600px] bg-success/5 rounded-full blur-3xl"
	></div>

	<div class="container-custom relative z-10">
		<!-- Section Header -->
		<div class="text-center mb-16 {mounted ? 'animate-fade-in-up' : 'opacity-0'}">
			<div
				class="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-sm font-medium text-primary mb-4"
			>
				<MessageSquare class="w-4 h-4" />
				Comience Hoy Mismo
			</div>
			<h2 class="text-4xl md:text-5xl font-bold text-primary-dark mb-4">
				Hable con
				<span class="bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
					Nuestro Equipo
				</span>
			</h2>
			<p class="text-xl text-neutral-600 max-w-3xl mx-auto">
				Solicite una demo personalizada, obtenga una cotización o consulte con nuestros expertos
				en compliance. Respuesta garantizada en 24 horas.
			</p>
		</div>

		<!-- Contact Method Selector -->
		<div class="mb-12 {mounted ? 'animate-fade-in-up delay-200' : 'opacity-0'}">
			<div class="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
				{#each contactMethods as method}
					{@const Icon = method.icon}
					<button
						onclick={() => (contactMethod = method.id)}
						class="relative p-6 bg-white border-2 rounded-2xl transition-all duration-300 text-left hover:shadow-xl hover:-translate-y-1 {contactMethod ===
						method.id
							? 'border-primary shadow-lg shadow-primary/20'
							: 'border-neutral-200 hover:border-primary/50'}"
					>
						{#if method.badge}
							<div
								class="absolute -top-3 right-4 px-3 py-1 bg-gradient-to-r from-primary to-success text-white text-xs font-bold rounded-full"
							>
								{method.badge}
							</div>
						{/if}

						<div class="flex items-start gap-4 mb-4">
							<div
								class="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"
							>
								<Icon class="w-6 h-6 text-primary" />
							</div>
							<div class="flex-1">
								<h3 class="text-lg font-bold text-primary-dark mb-1">{method.title}</h3>
								<p class="text-sm text-neutral-600">{method.description}</p>
							</div>
						</div>

						<ul class="space-y-2">
							{#each method.benefits as benefit}
								<li class="flex items-center gap-2 text-sm text-neutral-700">
									<CheckCircle2 class="w-4 h-4 text-success flex-shrink-0" />
									<span>{benefit}</span>
								</li>
							{/each}
						</ul>

						{#if contactMethod === method.id}
							<div class="absolute -bottom-3 left-1/2 -translate-x-1/2">
								<div
									class="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-primary"
								></div>
							</div>
						{/if}
					</button>
				{/each}
			</div>
		</div>

		<!-- Contact Form & Info Grid -->
		<div class="grid lg:grid-cols-3 gap-8 mb-16 {mounted ? 'animate-fade-in-up delay-400' : 'opacity-0'}">
			<!-- Contact Form -->
			<div class="lg:col-span-2">
				<div class="p-8 bg-white border border-neutral-200 rounded-3xl shadow-lg">
					{#if submitSuccess}
						<!-- Success Message -->
						<div class="text-center py-12">
							<div
								class="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6"
							>
								<CheckCircle2 class="w-10 h-10 text-success" />
							</div>
							<h3 class="text-2xl font-bold text-primary-dark mb-4">
								¡Solicitud Recibida con Éxito!
							</h3>
							<p class="text-neutral-600 mb-6">
								Gracias por su interés en Hergon. Un miembro de nuestro equipo se pondrá en contacto
								con usted en las próximas 24 horas.
							</p>
							<div class="p-4 bg-primary/10 border border-primary/20 rounded-xl inline-block">
								<p class="text-sm text-primary font-medium">
									📧 Le hemos enviado un email de confirmación a <strong>{formData.email}</strong>
								</p>
							</div>
						</div>
					{:else}
						<!-- Form -->
						<form onsubmit={handleSubmit} class="space-y-6">
							<div>
								<h3 class="text-2xl font-bold text-primary-dark mb-2">
									{#if contactMethod === 'demo'}
										Agendar Demo Personalizada
									{:else if contactMethod === 'support'}
										Soporte Técnico
									{:else}
										Solicitar Información
									{/if}
								</h3>
								<p class="text-sm text-neutral-600">
									Complete el formulario y nos pondremos en contacto lo antes posible
								</p>
							</div>

							<!-- Name & Email -->
							<div class="grid md:grid-cols-2 gap-6">
								<div>
									<label for="name" class="block text-sm font-medium text-neutral-700 mb-2">
										Nombre Completo *
									</label>
									<input
										type="text"
										id="name"
										bind:value={formData.name}
										class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all {formErrors.name
											? 'border-danger'
											: 'border-neutral-300'}"
										placeholder="Juan Pérez"
									/>
									{#if formErrors.name}
										<p class="text-xs text-danger mt-1">{formErrors.name}</p>
									{/if}
								</div>

								<div>
									<label for="email" class="block text-sm font-medium text-neutral-700 mb-2">
										Email Corporativo *
									</label>
									<input
										type="email"
										id="email"
										bind:value={formData.email}
										class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all {formErrors.email
											? 'border-danger'
											: 'border-neutral-300'}"
										placeholder="juan.perez@afore.com"
									/>
									{#if formErrors.email}
										<p class="text-xs text-danger mt-1">{formErrors.email}</p>
									{/if}
								</div>
							</div>

							<!-- Company & Country -->
							<div class="grid md:grid-cols-2 gap-6">
								<div>
									<label for="company" class="block text-sm font-medium text-neutral-700 mb-2">
										AFORE / AFP *
									</label>
									<input
										type="text"
										id="company"
										bind:value={formData.company}
										class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all {formErrors.company
											? 'border-danger'
											: 'border-neutral-300'}"
										placeholder="AFORE XXX"
									/>
									{#if formErrors.company}
										<p class="text-xs text-danger mt-1">{formErrors.company}</p>
									{/if}
								</div>

								<div>
									<label for="country" class="block text-sm font-medium text-neutral-700 mb-2">
										País *
									</label>
									<select
										id="country"
										bind:value={formData.country}
										class="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
									>
										{#each countries as country}
											<option value={country.value}>{country.label}</option>
										{/each}
									</select>
								</div>
							</div>

							<!-- Phone & Fondos -->
							<div class="grid md:grid-cols-2 gap-6">
								<div>
									<label for="phone" class="block text-sm font-medium text-neutral-700 mb-2">
										Teléfono
									</label>
									<input
										type="tel"
										id="phone"
										bind:value={formData.phone}
										class="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
										placeholder="+52 55 1234 5678"
									/>
								</div>

								<div>
									<label for="fondos" class="block text-sm font-medium text-neutral-700 mb-2">
										Número de Fondos
									</label>
									<input
										type="number"
										id="fondos"
										bind:value={formData.fondos}
										class="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
										placeholder="5"
										min="1"
									/>
								</div>
							</div>

							{#if contactMethod === 'demo'}
								<!-- Demo-specific fields -->
								<div class="grid md:grid-cols-2 gap-6">
									<div>
										<label for="plan" class="block text-sm font-medium text-neutral-700 mb-2">
											Plan de Interés
										</label>
										<select
											id="plan"
											bind:value={selectedPlan}
											class="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
										>
											{#each plans as plan}
												<option value={plan.value}>{plan.label}</option>
											{/each}
										</select>
									</div>

									<div>
										<label for="time" class="block text-sm font-medium text-neutral-700 mb-2">
											Horario Preferido
										</label>
										<select
											id="time"
											bind:value={preferredTime}
											class="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
										>
											<option value="">Seleccionar horario</option>
											{#each timeSlots as slot}
												<option value={slot.value}>{slot.label}</option>
											{/each}
										</select>
									</div>
								</div>

								<div>
									<label for="archivos" class="block text-sm font-medium text-neutral-700 mb-2">
										Archivos Procesados por Mes (aprox)
									</label>
									<input
										type="number"
										id="archivos"
										bind:value={formData.archivosPerMonth}
										class="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
										placeholder="500"
										min="0"
									/>
								</div>
							{/if}

							{#if contactMethod === 'contact'}
								<div>
									<label for="current" class="block text-sm font-medium text-neutral-700 mb-2">
										Solución Actual (si aplica)
									</label>
									<input
										type="text"
										id="current"
										bind:value={formData.currentSolution}
										class="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
										placeholder="Proceso manual, Excel, otra plataforma..."
									/>
								</div>
							{/if}

							<!-- Message -->
							<div>
								<label for="message" class="block text-sm font-medium text-neutral-700 mb-2">
									Mensaje / Comentarios
								</label>
								<textarea
									id="message"
									bind:value={formData.message}
									rows="4"
									class="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
									placeholder="Cuéntenos sobre sus necesidades de validación..."
								></textarea>
							</div>

							<!-- Terms -->
							<div class="flex items-start gap-3">
								<input
									type="checkbox"
									id="terms"
									bind:checked={formData.agreeToTerms}
									class="mt-1 w-4 h-4 text-primary border-neutral-300 rounded focus:ring-primary"
								/>
								<label for="terms" class="text-sm text-neutral-600">
									Acepto los términos de servicio y política de privacidad de Hergon. Autorizo el
									contacto comercial.
								</label>
							</div>

							<!-- Submit Button -->
							<button
								type="submit"
								disabled={isSubmitting || !formData.agreeToTerms}
								class="w-full px-8 py-4 bg-gradient-to-r from-primary to-success text-white font-bold rounded-xl hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3"
							>
								{#if isSubmitting}
									<div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
									<span>Enviando...</span>
								{:else}
									<span>
										{contactMethod === 'demo'
											? 'Agendar Demo Gratuita'
											: contactMethod === 'support'
												? 'Enviar Solicitud de Soporte'
												: 'Solicitar Información'}
									</span>
									<ArrowRight class="w-5 h-5" />
								{/if}
							</button>

							<p class="text-xs text-neutral-500 text-center">
								* Respuesta garantizada en menos de 24 horas hábiles
							</p>
						</form>
					{/if}
				</div>
			</div>

			<!-- Contact Info Sidebar -->
			<div class="space-y-6">
				<!-- Quick Stats -->
				<div class="p-6 bg-white border border-neutral-200 rounded-2xl shadow-sm">
					<h4 class="text-lg font-bold text-primary-dark mb-4">Por Qué Elegirnos</h4>
					<div class="space-y-4">
						<div class="flex items-start gap-3">
							<div class="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center flex-shrink-0">
								<Zap class="w-5 h-5 text-success" />
							</div>
							<div>
								<div class="text-2xl font-bold text-primary-dark">24h</div>
								<div class="text-sm text-neutral-600">Tiempo de respuesta</div>
							</div>
						</div>

						<div class="flex items-start gap-3">
							<div class="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
								<Users class="w-5 h-5 text-primary" />
							</div>
							<div>
								<div class="text-2xl font-bold text-primary-dark">2</div>
								<div class="text-sm text-neutral-600">AFOREs en producción</div>
							</div>
						</div>

						<div class="flex items-start gap-3">
							<div class="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center flex-shrink-0">
								<TrendingUp class="w-5 h-5 text-warning" />
							</div>
							<div>
								<div class="text-2xl font-bold text-primary-dark">520%</div>
								<div class="text-sm text-neutral-600">ROI promedio año 1</div>
							</div>
						</div>

						<div class="flex items-start gap-3">
							<div class="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center flex-shrink-0">
								<Shield class="w-5 h-5 text-success" />
							</div>
							<div>
								<div class="text-2xl font-bold text-primary-dark">99.9%</div>
								<div class="text-sm text-neutral-600">Uptime SLA</div>
							</div>
						</div>
					</div>
				</div>

				<!-- Office Locations -->
				<div class="p-6 bg-white border border-neutral-200 rounded-2xl shadow-sm">
					<h4 class="text-lg font-bold text-primary-dark mb-4">Nuestras Oficinas</h4>
					<div class="space-y-4">
						{#each offices as office}
							<div class="p-4 bg-neutral-50 rounded-xl">
								<div class="flex items-center gap-2 mb-3">
									<span class="text-2xl">{office.flag}</span>
									<div>
										<div class="font-bold text-neutral-900">{office.city}</div>
										<div class="text-xs text-neutral-600">{office.country}</div>
									</div>
									{#if office.isPrimary}
										<span
											class="ml-auto px-2 py-0.5 bg-primary/10 text-primary text-xs font-semibold rounded-full"
										>
											Principal
										</span>
									{/if}
								</div>

								<div class="space-y-2 text-sm">
									<div class="flex items-start gap-2">
										<MapPin class="w-4 h-4 text-neutral-400 flex-shrink-0 mt-0.5" />
										<div class="text-neutral-600">
											{office.address}<br />
											{office.neighborhood}, {office.zipCode}
										</div>
									</div>
									<div class="flex items-center gap-2">
										<Phone class="w-4 h-4 text-neutral-400 flex-shrink-0" />
										<a href="tel:{office.phone}" class="text-primary hover:underline"
											>{office.phone}</a
										>
									</div>
									<div class="flex items-center gap-2">
										<Mail class="w-4 h-4 text-neutral-400 flex-shrink-0" />
										<a href="mailto:{office.email}" class="text-primary hover:underline"
											>{office.email}</a
										>
									</div>
									<div class="flex items-center gap-2">
										<Clock class="w-4 h-4 text-neutral-400 flex-shrink-0" />
										<span class="text-neutral-600">{office.hours}</span>
									</div>
								</div>
							</div>
						{/each}
					</div>
				</div>

				<!-- Alternative Contact -->
				<div class="p-6 bg-gradient-to-br from-primary to-primary-dark text-white rounded-2xl">
					<h4 class="text-lg font-bold mb-4">Contacto Directo</h4>
					<div class="space-y-3 text-sm">
						<a href="mailto:info@hergon.com" class="flex items-center gap-3 hover:text-white/80">
							<Mail class="w-5 h-5" />
							<span>info@hergon.com</span>
						</a>
						<a href="tel:+525512345678" class="flex items-center gap-3 hover:text-white/80">
							<Phone class="w-5 h-5" />
							<span>+52 55 1234 5678</span>
						</a>
						<div class="pt-4 border-t border-white/20">
							<p class="text-xs text-white/80 mb-3">Síguenos en:</p>
							<div class="flex gap-3">
								<a
									href="https://linkedin.com"
									target="_blank"
									rel="noopener noreferrer"
									class="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors"
									aria-label="LinkedIn"
								>
									<Linkedin class="w-5 h-5" />
								</a>
								<a
									href="https://twitter.com"
									target="_blank"
									rel="noopener noreferrer"
									class="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors"
									aria-label="Twitter"
								>
									<Twitter class="w-5 h-5" />
								</a>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- FAQs -->
		<div class="mb-16 {mounted ? 'animate-fade-in-up delay-800' : 'opacity-0'}">
			<h3 class="text-2xl font-bold text-primary-dark text-center mb-8">
				Preguntas Frecuentes
			</h3>
			<div class="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
				{#each faqs as faq}
					<div class="p-6 bg-white border border-neutral-200 rounded-2xl">
						<div class="flex items-start gap-3 mb-3">
							<Info class="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
							<h4 class="font-bold text-neutral-900">{faq.question}</h4>
						</div>
						<p class="text-sm text-neutral-600 pl-8">{faq.answer}</p>
					</div>
				{/each}
			</div>
		</div>

		<!-- Final CTA -->
		<div class="text-center {mounted ? 'animate-fade-in-up delay-1000' : 'opacity-0'}">
			<div class="p-8 bg-neutral-50 border border-neutral-200 rounded-3xl max-w-4xl mx-auto">
				<h3 class="text-2xl font-bold text-primary-dark mb-4">
					¿Listo para Transformar su Validación?
				</h3>
				<p class="text-neutral-600 mb-6">
					Únase a las AFOREs que ya confían en Hergon para validación automatizada y cumplimiento
					garantizado. Demo gratuita, sin compromiso.
				</p>
				<div class="flex flex-wrap justify-center gap-4">
					<button
						onclick={() => {
							contactMethod = 'demo';
							document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
						}}
						class="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-success text-white font-bold rounded-xl hover:shadow-xl transition-all duration-300 hover:scale-105"
					>
						<Video class="w-5 h-5" />
						<span>Agendar Demo</span>
					</button>
					<a
						href="#pricing"
						class="inline-flex items-center gap-2 px-8 py-4 border-2 border-primary text-primary font-bold rounded-xl hover:bg-primary hover:text-white transition-all duration-300"
					>
						<FileText class="w-5 h-5" />
						<span>Ver Planes</span>
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

	.delay-800 {
		animation-delay: 800ms;
	}

	.delay-1000 {
		animation-delay: 1000ms;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.animate-spin {
		animation: spin 1s linear infinite;
	}
</style>
