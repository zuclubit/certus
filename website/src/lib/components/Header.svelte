<script>
	import {
		Menu,
		X,
		ChevronDown,
		Shield,
		Zap,
		BarChart3,
		Lock,
		FileCheck,
		Globe,
		ArrowRight,
		CheckCircle
	} from 'lucide-svelte';

	let isScrolled = $state(false);
	let mobileMenuOpen = $state(false);
	let activeDropdown = $state(null);
	let scrollProgress = $state(0);

	const menuItems = [
		{
			label: 'Producto',
			href: '#features',
			dropdown: [
				{
					icon: CheckCircle,
					title: 'Validaciones',
					description: '37 validadores automáticos',
					href: '#features'
				},
				{
					icon: Zap,
					title: 'Performance',
					description: 'Procesamiento en tiempo real',
					href: '#how-it-works'
				},
				{
					icon: BarChart3,
					title: 'Analytics',
					description: 'Dashboards y reportes',
					href: '#features'
				}
			]
		},
		{
			label: 'Seguridad',
			href: '#security',
			dropdown: [
				{
					icon: Shield,
					title: 'Compliance',
					description: 'SOC 2, ISO 27001',
					href: '#security'
				},
				{
					icon: Lock,
					title: 'Encriptación',
					description: 'TLS 1.3 y AES-256',
					href: '#security'
				},
				{
					icon: FileCheck,
					title: 'Auditoría',
					description: 'Event sourcing completo',
					href: '#security'
				}
			]
		},
		{
			label: 'Cobertura',
			href: '#countries',
			dropdown: [
				{
					icon: Globe,
					title: 'México',
					description: '2 AFOREs activas',
					href: '#countries'
				},
				{
					icon: Globe,
					title: 'Latam',
					description: 'Chile, Colombia, Perú',
					href: '#countries'
				}
			]
		},
		{
			label: 'Precios',
			href: '#pricing',
			dropdown: null
		}
	];

	if (typeof window !== 'undefined') {
		window.addEventListener('scroll', () => {
			const scrolled = window.scrollY;
			isScrolled = scrolled > 20;

			// Calculate scroll progress
			const winScroll = document.documentElement.scrollTop;
			const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
			scrollProgress = (winScroll / height) * 100;
		});
	}

	function toggleDropdown(index) {
		if (activeDropdown === index) {
			activeDropdown = null;
		} else {
			activeDropdown = index;
		}
	}

	function closeDropdown() {
		activeDropdown = null;
	}

	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen;
		if (mobileMenuOpen) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
		}
	}
</script>

<svelte:window onclick={() => closeDropdown()} />

<!-- Scroll Progress Bar -->
<div class="fixed top-0 left-0 right-0 h-1 bg-neutral-100 z-[60]">
	<div
		class="h-full bg-gradient-to-r from-primary via-primary-dark to-primary transition-all duration-300"
		style="width: {scrollProgress}%"
	></div>
</div>

<header
	class="fixed top-1 left-0 right-0 z-50 transition-all duration-500 ease-out"
>
	<nav
		class="container-custom mx-auto transition-all duration-500 {isScrolled
			? 'bg-white/80 backdrop-blur-xl shadow-lg border border-neutral-200/50 rounded-2xl mt-2'
			: 'bg-white/60 backdrop-blur-md rounded-2xl'}"
	>
		<div class="flex items-center justify-between px-6 py-4">
			<!-- Logo -->
			<a href="/" class="flex items-center gap-3 group">
				<div
					class="relative w-11 h-11 bg-gradient-to-br from-primary via-primary to-primary-dark rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105"
				>
					<div
						class="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-xl"
					></div>
					<Shield class="w-6 h-6 text-white relative z-10" />
				</div>
				<div class="flex flex-col">
					<span
						class="text-2xl font-bold bg-gradient-to-r from-primary-dark to-primary bg-clip-text text-transparent"
					>
						Hergon
					</span>
					<span class="text-[10px] text-neutral-500 font-medium tracking-wider uppercase -mt-1">
						Compliance Platform
					</span>
				</div>
			</a>

			<!-- Desktop Navigation -->
			<div class="hidden lg:flex items-center gap-1">
				{#each menuItems as item, index}
					<div class="relative" role="presentation" onclick={(e) => e.stopPropagation()}>
						{#if item.dropdown}
							<button
								class="px-4 py-2 rounded-lg text-neutral-700 hover:text-primary font-medium transition-all duration-200 flex items-center gap-1 group hover:bg-primary/5"
								onmouseenter={() => (activeDropdown = index)}
								onclick={() => toggleDropdown(index)}
							>
								{item.label}
								<ChevronDown
									class="w-4 h-4 transition-transform duration-200 {activeDropdown ===
									index
										? 'rotate-180'
										: ''}"
								/>
							</button>

							{#if activeDropdown === index}
								<div
									class="absolute top-full left-0 mt-2 w-80 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-neutral-200/50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300"
									role="menu"
									onmouseleave={closeDropdown}
								>
									<div class="p-2">
										{#each item.dropdown as subItem}
											{@const Icon = subItem.icon}
											<a
												href={subItem.href}
												class="flex items-start gap-4 p-4 rounded-xl hover:bg-primary/5 transition-all duration-200 group"
												onclick={() => {
													closeDropdown();
													mobileMenuOpen = false;
												}}
											>
												<div
													class="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors"
												>
													<Icon class="w-5 h-5 text-primary" />
												</div>
												<div class="flex-1">
													<div
														class="font-semibold text-neutral-900 group-hover:text-primary transition-colors"
													>
														{subItem.title}
													</div>
													<div class="text-sm text-neutral-600 mt-0.5">
														{subItem.description}
													</div>
												</div>
												<ArrowRight
													class="w-4 h-4 text-neutral-400 opacity-0 group-hover:opacity-100 transition-all duration-200 -translate-x-2 group-hover:translate-x-0"
												/>
											</a>
										{/each}
									</div>
								</div>
							{/if}
						{:else}
							<a
								href={item.href}
								class="px-4 py-2 rounded-lg text-neutral-700 hover:text-primary font-medium transition-all duration-200 hover:bg-primary/5"
							>
								{item.label}
							</a>
						{/if}
					</div>
				{/each}
			</div>

			<!-- CTA Buttons -->
			<div class="hidden lg:flex items-center gap-3">
				<a
					href="#contact"
					class="px-5 py-2.5 rounded-xl text-neutral-700 font-medium hover:bg-neutral-100 transition-all duration-200"
				>
					Contactar
				</a>
				<a
					href="#contact"
					class="px-6 py-2.5 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 flex items-center gap-2 group"
				>
					Demo Gratuita
					<ArrowRight
						class="w-4 h-4 group-hover:translate-x-1 transition-transform"
					/>
				</a>
			</div>

			<!-- Mobile Menu Button -->
			<button
				class="lg:hidden p-2.5 rounded-xl hover:bg-neutral-100 transition-colors text-neutral-700"
				onclick={toggleMobileMenu}
				aria-label="Toggle menu"
			>
				{#if mobileMenuOpen}
					<X class="w-6 h-6" />
				{:else}
					<Menu class="w-6 h-6" />
				{/if}
			</button>
		</div>
	</nav>
</header>

<!-- Mobile Menu Overlay -->
{#if mobileMenuOpen}
	<div
		class="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-300"
		onclick={toggleMobileMenu}
		role="presentation"
	></div>

	<!-- Mobile Menu Panel -->
	<div
		class="fixed top-20 left-4 right-4 bottom-4 bg-white rounded-3xl shadow-2xl z-40 lg:hidden overflow-y-auto animate-in slide-in-from-bottom duration-500"
	>
		<div class="p-6 space-y-1">
			<!-- Mobile Menu Items -->
			{#each menuItems as item, index}
				<div class="border-b border-neutral-100 last:border-0 pb-4 mb-4 last:pb-0 last:mb-0">
					{#if item.dropdown}
						<button
							class="w-full flex items-center justify-between p-4 rounded-xl hover:bg-neutral-50 transition-colors text-left"
							onclick={() => toggleDropdown(index)}
						>
							<span class="font-semibold text-neutral-900">{item.label}</span>
							<ChevronDown
								class="w-5 h-5 text-neutral-500 transition-transform {activeDropdown ===
								index
									? 'rotate-180'
									: ''}"
							/>
						</button>

						{#if activeDropdown === index}
							<div class="mt-2 ml-4 space-y-2 animate-in slide-in-from-top-2 duration-200">
								{#each item.dropdown as subItem}
									{@const Icon = subItem.icon}
									<a
										href={subItem.href}
										class="flex items-start gap-3 p-3 rounded-lg hover:bg-primary/5 transition-colors group"
										onclick={() => {
											toggleMobileMenu();
											closeDropdown();
										}}
									>
										<div
											class="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors"
										>
											<Icon class="w-5 h-5 text-primary" />
										</div>
										<div class="flex-1">
											<div class="font-medium text-neutral-900 group-hover:text-primary transition-colors">
												{subItem.title}
											</div>
											<div class="text-sm text-neutral-600 mt-0.5">
												{subItem.description}
											</div>
										</div>
									</a>
								{/each}
							</div>
						{/if}
					{:else}
						<a
							href={item.href}
							class="flex items-center justify-between p-4 rounded-xl hover:bg-neutral-50 transition-colors"
							onclick={toggleMobileMenu}
						>
							<span class="font-semibold text-neutral-900">{item.label}</span>
							<ArrowRight class="w-5 h-5 text-neutral-400" />
						</a>
					{/if}
				</div>
			{/each}

			<!-- Mobile CTAs -->
			<div class="pt-6 space-y-3 border-t border-neutral-200">
				<a
					href="#contact"
					class="w-full px-5 py-3 rounded-xl text-neutral-700 font-medium hover:bg-neutral-100 transition-colors text-center block"
					onclick={toggleMobileMenu}
				>
					Contactar
				</a>
				<a
					href="#contact"
					class="w-full px-6 py-3 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 group"
					onclick={toggleMobileMenu}
				>
					Demo Gratuita
					<ArrowRight
						class="w-5 h-5 group-hover:translate-x-1 transition-transform"
					/>
				</a>
			</div>

			<!-- Mobile Footer Info -->
			<div class="pt-6 border-t border-neutral-200">
				<div class="flex items-center gap-3 p-4 bg-gradient-to-br from-primary/5 to-primary-dark/5 rounded-xl">
					<div class="w-12 h-12 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center shadow-lg">
						<Shield class="w-7 h-7 text-white" />
					</div>
					<div class="flex-1">
						<div class="font-semibold text-neutral-900">Hergon Platform</div>
						<div class="text-xs text-neutral-600">Compliance Enterprise</div>
					</div>
				</div>
				<div class="mt-4 grid grid-cols-2 gap-4 text-center">
					<div class="p-3 bg-neutral-50 rounded-xl">
						<div class="text-xl font-bold text-primary">99.9%</div>
						<div class="text-xs text-neutral-600">Uptime</div>
					</div>
					<div class="p-3 bg-neutral-50 rounded-xl">
						<div class="text-xl font-bold text-primary">{'<'}3s</div>
						<div class="text-xs text-neutral-600">Response</div>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	@keyframes slide-in-from-top-2 {
		from {
			opacity: 0;
			transform: translateY(-8px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes slide-in-from-bottom {
		from {
			opacity: 0;
			transform: translateY(100%);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes fade-in {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.animate-in {
		animation-fill-mode: both;
	}

	.fade-in {
		animation-name: fade-in;
	}

	.slide-in-from-top-2 {
		animation-name: slide-in-from-top-2;
	}

	.slide-in-from-bottom {
		animation-name: slide-in-from-bottom;
	}

	.duration-200 {
		animation-duration: 200ms;
	}

	.duration-300 {
		animation-duration: 300ms;
	}

	.duration-500 {
		animation-duration: 500ms;
	}
</style>
