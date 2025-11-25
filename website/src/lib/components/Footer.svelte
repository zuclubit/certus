<script>
	import {
		Mail,
		Phone,
		MapPin,
		Linkedin,
		Twitter,
		Github,
		Send,
		Shield,
		Award,
		CheckCircle2,
		Globe,
		Clock,
		ArrowRight,
		ExternalLink
	} from 'lucide-svelte';
	import { onMount } from 'svelte';

	let mounted = $state(false);
	let newsletterEmail = $state('');
	let newsletterSuccess = $state(false);
	let newsletterError = $state('');

	onMount(() => {
		mounted = true;
	});

	async function handleNewsletterSubmit(e) {
		e.preventDefault();
		newsletterError = '';

		if (!newsletterEmail || !newsletterEmail.includes('@')) {
			newsletterError = 'Email inválido';
			return;
		}

		// Simulate API call
		await new Promise((resolve) => setTimeout(resolve, 1000));

		newsletterSuccess = true;
		newsletterEmail = '';

		setTimeout(() => {
			newsletterSuccess = false;
		}, 5000);
	}

	const footerSections = [
		{
			title: 'Producto',
			links: [
				{ label: 'Características', href: '#features' },
				{ label: 'Cómo Funciona', href: '#how-it-works' },
				{ label: 'Seguridad & Compliance', href: '#security' },
				{ label: 'Precios', href: '#pricing' },
				{ label: 'Casos de Uso', href: '#contact' },
				{ label: 'Integraciones', href: '#contact' }
			]
		},
		{
			title: 'Soluciones',
			links: [
				{ label: 'Para AFOREs', href: '#contact' },
				{ label: 'Para AFPs', href: '#contact' },
				{ label: 'Grupos Financieros', href: '#contact' },
				{ label: 'Consultorías', href: '#contact' },
				{ label: 'Reguladores', href: '#contact' }
			]
		},
		{
			title: 'Recursos',
			links: [
				{ label: 'Documentación', href: '#contact' },
				{ label: 'API Reference', href: '#contact' },
				{ label: 'Centro de Ayuda', href: '#contact' },
				{ label: 'Blog', href: '#contact' },
				{ label: 'Webinars', href: '#contact' },
				{ label: 'Casos de Éxito', href: '#contact' }
			]
		},
		{
			title: 'Empresa',
			links: [
				{ label: 'Nosotros', href: '#contact' },
				{ label: 'Carreras', href: '#contact' },
				{ label: 'Partners', href: '#contact' },
				{ label: 'Prensa', href: '#contact' },
				{ label: 'Contacto', href: '#contact' }
			]
		}
	];

	const legalLinks = [
		{ label: 'Privacidad', href: '/privacy' },
		{ label: 'Términos de Servicio', href: '/terms' },
		{ label: 'SLA', href: '/sla' },
		{ label: 'Compliance', href: '/compliance' },
		{ label: 'Seguridad', href: '/security' }
	];

	const certifications = [
		{ name: 'SOC 2', status: 'En Proceso' },
		{ name: 'ISO 27001', status: 'En Proceso' },
		{ name: 'CONSAR', status: 'Certificado' }
	];

	const offices = [
		{
			country: 'México',
			flag: '🇲🇽',
			address: 'Paseo de la Reforma 505, CDMX',
			phone: '+52 55 1234 5678',
			email: 'mexico@hergon.com'
		},
		{
			country: 'Chile',
			flag: '🇨🇱',
			address: 'Av. Apoquindo 4800, Santiago',
			phone: '+56 2 2345 6789',
			email: 'chile@hergon.com'
		}
	];

	const socialLinks = [
		{
			name: 'LinkedIn',
			icon: Linkedin,
			href: 'https://linkedin.com',
			color: 'hover:text-[#0A66C2]'
		},
		{
			name: 'Twitter',
			icon: Twitter,
			href: 'https://twitter.com',
			color: 'hover:text-[#1DA1F2]'
		},
		{
			name: 'GitHub',
			icon: Github,
			href: 'https://github.com',
			color: 'hover:text-white'
		}
	];
</script>

<footer
	class="relative bg-gradient-to-br from-primary-dark via-primary to-primary-dark text-white overflow-hidden"
>
	<!-- Background decoration -->
	<div class="absolute inset-0 opacity-5">
		<div
			class="absolute inset-0"
			style="background-image: radial-gradient(circle at 2px 2px, white 1px, transparent 0); background-size: 40px 40px;"
		></div>
	</div>

	<!-- Gradient orbs -->
	<div class="absolute top-0 right-0 w-[400px] h-[400px] bg-white/5 rounded-full blur-3xl"></div>
	<div
		class="absolute bottom-0 left-0 w-[400px] h-[400px] bg-success/10 rounded-full blur-3xl"
	></div>

	<div class="container-custom relative z-10">
		<!-- Top Section: Newsletter & Quick Contact -->
		<div
			class="py-12 border-b border-white/10 {mounted ? 'animate-fade-in-up' : 'opacity-0'}"
		>
			<div class="grid lg:grid-cols-2 gap-12 items-center">
				<!-- Newsletter -->
				<div>
					<h3 class="text-2xl font-bold mb-3">Manténgase Actualizado</h3>
					<p class="text-white/80 mb-6">
						Reciba actualizaciones sobre nuevas funcionalidades, normativas CONSAR, y mejores
						prácticas.
					</p>

					{#if newsletterSuccess}
						<div
							class="p-4 bg-success/20 border border-success/40 rounded-xl flex items-center gap-3"
						>
							<CheckCircle2 class="w-5 h-5 text-success flex-shrink-0" />
							<p class="text-sm">¡Gracias por suscribirse! Revise su email para confirmar.</p>
						</div>
					{:else}
						<form onsubmit={handleNewsletterSubmit} class="flex gap-3">
							<div class="flex-1">
								<input
									type="email"
									bind:value={newsletterEmail}
									placeholder="su-email@empresa.com"
									class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:bg-white/15 focus:border-white/40 transition-all"
								/>
								{#if newsletterError}
									<p class="text-xs text-danger mt-1">{newsletterError}</p>
								{/if}
							</div>
							<button
								type="submit"
								class="px-6 py-3 bg-white text-primary font-semibold rounded-xl hover:bg-neutral-100 transition-all hover:scale-105 flex items-center gap-2"
							>
								<Send class="w-4 h-4" />
								<span class="hidden sm:inline">Suscribirse</span>
							</button>
						</form>
					{/if}
				</div>

				<!-- Quick Contact -->
				<div class="grid sm:grid-cols-2 gap-6">
					<a
						href="tel:+525512345678"
						class="p-4 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl hover:bg-white/15 transition-all group"
					>
						<Phone class="w-6 h-6 mb-3 text-success" />
						<div class="text-sm text-white/70 mb-1">Llámenos</div>
						<div class="font-semibold group-hover:text-success transition-colors">
							+52 55 1234 5678
						</div>
					</a>

					<a
						href="mailto:info@hergon.com"
						class="p-4 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl hover:bg-white/15 transition-all group"
					>
						<Mail class="w-6 h-6 mb-3 text-primary" />
						<div class="text-sm text-white/70 mb-1">Email</div>
						<div class="font-semibold group-hover:text-primary transition-colors">
							info@hergon.com
						</div>
					</a>
				</div>
			</div>
		</div>

		<!-- Main Footer Content -->
		<div class="py-12 border-b border-white/10">
			<div class="grid lg:grid-cols-5 gap-12">
				<!-- Brand Column -->
				<div class="lg:col-span-1 {mounted ? 'animate-fade-in-up delay-200' : 'opacity-0'}">
					<!-- Logo -->
					<div class="flex items-center gap-2 mb-6">
						<div
							class="w-12 h-12 bg-gradient-to-br from-white to-success rounded-xl flex items-center justify-center shadow-lg"
						>
							<span class="text-primary font-bold text-2xl">H</span>
						</div>
						<div>
							<div class="text-2xl font-bold">Hergon</div>
							<div class="text-xs text-white/60">By Vector01</div>
						</div>
					</div>

					<p class="text-white/70 text-sm mb-6 leading-relaxed">
						Plataforma enterprise de validación automatizada para AFOREs y AFPs en Latinoamérica.
					</p>

					<!-- Social Links -->
					<div class="flex gap-3">
						{#each socialLinks as social}
							{@const Icon = social.icon}
							<a
								href={social.href}
								target="_blank"
								rel="noopener noreferrer"
								class="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center {social.color} transition-all hover:scale-110"
								aria-label={social.name}
							>
								<Icon class="w-5 h-5" />
							</a>
						{/each}
					</div>
				</div>

				<!-- Link Columns -->
				{#each footerSections as section, index}
					<div class={mounted ? `animate-fade-in-up delay-${(index + 3) * 100}` : 'opacity-0'}>
						<h3 class="font-bold text-lg mb-4">{section.title}</h3>
						<ul class="space-y-3">
							{#each section.links as link}
								<li>
									<a
										href={link.href}
										class="text-white/70 hover:text-white transition-colors text-sm flex items-center gap-1 group"
									>
										<span>{link.label}</span>
										{#if link.href.startsWith('http')}
											<ExternalLink class="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
										{/if}
									</a>
								</li>
							{/each}
						</ul>
					</div>
				{/each}
			</div>
		</div>

		<!-- Offices Section -->
		<div class="py-12 border-b border-white/10 {mounted ? 'animate-fade-in-up delay-600' : 'opacity-0'}">
			<h3 class="font-bold text-xl mb-8 text-center">Nuestras Oficinas</h3>
			<div class="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
				{#each offices as office}
					<div
						class="p-6 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl hover:bg-white/15 transition-all"
					>
						<div class="flex items-center gap-3 mb-4">
							<span class="text-4xl">{office.flag}</span>
							<h4 class="text-xl font-bold">{office.country}</h4>
						</div>

						<div class="space-y-3 text-sm">
							<div class="flex items-start gap-3">
								<MapPin class="w-4 h-4 text-white/60 flex-shrink-0 mt-0.5" />
								<span class="text-white/80">{office.address}</span>
							</div>
							<div class="flex items-center gap-3">
								<Phone class="w-4 h-4 text-white/60 flex-shrink-0" />
								<a href="tel:{office.phone}" class="text-white/80 hover:text-white">
									{office.phone}
								</a>
							</div>
							<div class="flex items-center gap-3">
								<Mail class="w-4 h-4 text-white/60 flex-shrink-0" />
								<a href="mailto:{office.email}" class="text-white/80 hover:text-white">
									{office.email}
								</a>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- Certifications & Trust Badges -->
		<div class="py-8 border-b border-white/10 {mounted ? 'animate-fade-in-up delay-800' : 'opacity-0'}">
			<div class="flex flex-wrap justify-center items-center gap-8">
				<div class="flex items-center gap-2">
					<Shield class="w-5 h-5 text-success" />
					<span class="text-sm text-white/80">Encriptación TLS 1.3</span>
				</div>

				{#each certifications as cert}
					<div class="flex items-center gap-2">
						<Award class="w-5 h-5 text-warning" />
						<span class="text-sm text-white/80">
							{cert.name}
							<span class="text-xs text-white/60">({cert.status})</span>
						</span>
					</div>
				{/each}

				<div class="flex items-center gap-2">
					<CheckCircle2 class="w-5 h-5 text-success" />
					<span class="text-sm text-white/80">99.9% Uptime SLA</span>
				</div>

				<div class="flex items-center gap-2">
					<Globe class="w-5 h-5 text-primary" />
					<span class="text-sm text-white/80">4 Países</span>
				</div>
			</div>
		</div>

		<!-- Bottom Bar: Legal & Copyright -->
		<div class="py-8 {mounted ? 'animate-fade-in-up delay-1000' : 'opacity-0'}">
			<div class="flex flex-col md:flex-row justify-between items-center gap-6">
				<!-- Legal Links -->
				<div class="flex flex-wrap justify-center gap-6 text-sm">
					{#each legalLinks as link}
						<a href={link.href} class="text-white/60 hover:text-white transition-colors">
							{link.label}
						</a>
					{/each}
				</div>

				<!-- Copyright -->
				<div class="text-sm text-white/60 text-center md:text-right">
					<p>© 2026 Hergon. Todos los derechos reservados.</p>
					<p class="text-xs mt-1">Hecho con ❤️ en Latinoamérica</p>
				</div>
			</div>
		</div>

		<!-- Very Bottom: Additional Info -->
		<div class="pb-6 text-center {mounted ? 'animate-fade-in-up delay-1200' : 'opacity-0'}">
			<p class="text-xs text-white/50">
				Hergon es una plataforma de Vector01 dedicada a la automatización de compliance para
				instituciones financieras. Cumplimos con las normativas de CONSAR, SuperPensiones,
				SuperFinanciera y SBS.
			</p>
		</div>
	</div>
</footer>

<style>
	@keyframes fade-in-up {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.animate-fade-in-up {
		animation: fade-in-up 0.6s ease-out forwards;
	}

	.delay-200 {
		animation-delay: 200ms;
	}

	.delay-300 {
		animation-delay: 300ms;
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

	.delay-1200 {
		animation-delay: 1200ms;
	}
</style>
