<script>
	import Header from '$lib/components/Header.svelte';
	import HeroSection from '$lib/components/HeroSection.svelte';
	import ProblemSolutionSection from '$lib/components/ProblemSolutionSection.svelte';
	import FeaturesSection from '$lib/components/FeaturesSection.svelte';
	import HowItWorksSection from '$lib/components/HowItWorksSection.svelte';
	import MetricsSection from '$lib/components/MetricsSection.svelte';
	import SecurityComplianceSection from '$lib/components/SecurityComplianceSection.svelte';
	import LatinAmericaSection from '$lib/components/LatinAmericaSection.svelte';
	import PricingSection from '$lib/components/PricingSection.svelte';
	import ContactSection from '$lib/components/ContactSection.svelte';
	import FinalCTASection from '$lib/components/FinalCTASection.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import {
		CheckCircle,
		Zap,
		Lock,
		Globe,
		BarChart3,
		Shield,
		X,
		ArrowRight
	} from 'lucide-svelte';

	const features = [
		{
			icon: CheckCircle,
			title: '37 Validaciones Automatizadas',
			description:
				'Sistema completo de validación conforme a normativas CONSAR y reguladores latinoamericanos.'
		},
		{
			icon: Zap,
			title: 'Procesamiento en Tiempo Real',
			description:
				'Validación de hasta 100 archivos concurrentes con respuesta en menos de 3 segundos.'
		},
		{
			icon: Lock,
			title: 'Event Sourcing & Auditoría',
			description:
				'Trazabilidad completa de todas las operaciones con almacenamiento inmutable de eventos.'
		},
		{
			icon: Globe,
			title: 'Multi-País desde Diseño',
			description:
				'Soporte nativo para México, Chile, Colombia y Perú con reglas específicas por país.'
		},
		{
			icon: BarChart3,
			title: 'Reportes y Analytics',
			description:
				'Dashboards en tiempo real con métricas de cumplimiento y análisis predictivo.'
		},
		{
			icon: Shield,
			title: 'Seguridad Enterprise',
			description:
				'Certificaciones SOC 2, ISO 27001, encriptación end-to-end y cumplimiento regulatorio.'
		}
	];

	const howItWorks = [
		{
			step: '01',
			title: 'Carga de Archivos',
			description:
				'Sus AFOREs suben archivos mediante API REST segura o interfaz web. Soportamos todos los formatos regulatorios.'
		},
		{
			step: '02',
			title: 'Validación Automática',
			description:
				'37 validadores paralelos analizan estructura, datos y cumplimiento normativo en tiempo real.'
		},
		{
			step: '03',
			title: 'Resultados Instantáneos',
			description:
				'Reciba reportes detallados con errores identificados, sugerencias de corrección y certificación de cumplimiento.'
		}
	];
</script>

<svelte:head>
	<title>Hergon - Validación Automatizada para AFOREs en Latinoamérica</title>
	<meta
		name="description"
		content="Plataforma enterprise de validación automatizada de archivos para AFOREs y AFPs. Cumplimiento regulatorio garantizado con event sourcing y trazabilidad completa."
	/>
</svelte:head>

<Header />

<HeroSection />

<ProblemSolutionSection />

<FeaturesSection />

<HowItWorksSection />

<MetricsSection />

<SecurityComplianceSection />

<LatinAmericaSection />

<PricingSection />

<ContactSection />

<FinalCTASection />

<Footer />
