<script>
	import {
		Upload,
		Zap,
		FileCheck,
		CheckCircle,
		ArrowRight,
		Clock,
		Activity,
		Code,
		Database,
		Shield,
		BarChart3,
		PlayCircle,
		Download,
		AlertCircle,
		TrendingUp,
		Cpu,
		FileText,
		Send
	} from 'lucide-svelte';
	import { onMount } from 'svelte';

	let mounted = $state(false);
	let activeStep = $state(0);
	let isAutoPlaying = $state(false);
	let autoPlayInterval = null;

	onMount(() => {
		mounted = true;
		return () => {
			if (autoPlayInterval) clearInterval(autoPlayInterval);
		};
	});

	const steps = [
		{
			id: 0,
			number: '01',
			title: 'Carga de Archivos',
			icon: Upload,
			color: 'primary',
			description:
				'Suba sus archivos regulatorios de forma segura mediante nuestra interfaz web o integración automática. Soportamos todos los formatos requeridos por CONSAR.',
			details: {
				methods: [
					{ name: 'API REST', endpoint: 'POST /api/v1/files/upload', auth: 'OAuth 2.0 + JWT' },
					{ name: 'Web Upload', description: 'Drag & drop interface', maxSize: '100MB' },
					{ name: 'SFTP', description: 'Batch upload nocturno', schedule: 'Automatizado' }
				],
				formats: ['CSV', 'Excel (.xlsx)', 'XML', 'Fixed-width text'],
				validation: 'Validación de formato previo a procesamiento',
				encryption: 'TLS 1.3 en tránsito, AES-256 en reposo'
			},
			metrics: [
				{ label: 'Max file size', value: '100MB', icon: FileText },
				{ label: 'Concurrent uploads', value: '100', icon: Upload },
				{ label: 'Upload speed', value: '~5s', icon: TrendingUp }
			],
			codeExample: `POST /api/v1/files/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "file": <binary>,
  "afore_id": "AFORE_001",
  "file_type": "CONSAR_LAYOUT_01",
  "metadata": {
    "period": "2026-01",
    "fund_id": "F001"
  }
}`
		},
		{
			id: 1,
			number: '02',
			title: 'Validación Paralela',
			icon: Zap,
			color: 'warning',
			description:
				'Más de 30 validaciones se ejecutan simultáneamente, verificando la estructura del archivo, datos y cumplimiento normativo en segundos. El sistema se adapta a nuevas regulaciones de forma automática.',
			details: {
				validators: [
					{ category: 'Estructural', count: 12, description: 'Formato, columnas, tipos de dato' },
					{
						category: 'Negocio',
						count: 18,
						description: 'Reglas CONSAR, rangos válidos, coherencia'
					},
					{ category: 'Anomalías', count: 7, description: 'Detección ML de patrones inusuales' }
				],
				architecture: 'Sistema en la nube con procesamiento simultáneo',
				scaling: 'Crece automáticamente según su demanda',
				errorHandling: 'Reintentos automáticos y protección contra errores'
			},
			metrics: [
				{ label: 'Validadores base', value: '30+', icon: Cpu },
				{ label: 'Ejecución paralela', value: '100%', icon: Activity },
				{ label: 'Latencia p95', value: '2.8s', icon: Clock }
			],
			codeExample: `// Sistema de validación automática
Ejecuta validaciones en paralelo:
- Estructura del archivo (formato y columnas)
- Reglas de negocio CONSAR
- Detección de inconsistencias

Resultado en tiempo real:
✓ 34 validaciones exitosas
✗ 1 error detectado
⚡ Tiempo total: 2.4 segundos`
		},
		{
			id: 2,
			number: '03',
			title: 'Generación de Resultados',
			icon: FileCheck,
			color: 'success',
			description:
				'Reporte detallado con errores identificados, sugerencias de corrección automáticas, y certificación de cumplimiento listo para envío a CONSAR.',
			details: {
				reportTypes: [
					{
						name: 'Reporte Ejecutivo',
						format: 'PDF',
						content: 'Resumen de validación + métricas'
					},
					{
						name: 'Reporte Técnico',
						format: 'Excel',
						content: 'Errores detallados línea por línea'
					},
					{
						name: 'Certificado Compliance',
						format: 'PDF firmado',
						content: 'Validación CONSAR oficial'
					},
					{ name: 'API Response', format: 'JSON', content: 'Integración programática' }
				],
				features: [
					'Identificación exacta de errores (línea, columna)',
					'Sugerencias de corrección automáticas',
					'Histórico de validaciones previas',
					'Comparativa con períodos anteriores'
				]
			},
			metrics: [
				{ label: 'Tiempo reporte', value: '<1s', icon: Clock },
				{ label: 'Formatos export', value: '4', icon: Download },
				{ label: 'Retención', value: '7 años', icon: Database }
			],
			codeExample: `// Respuesta JSON de validación
{
  "file_id": "f_abc123",
  "status": "completed",
  "validation": {
    "passed": true,
    "score": 98.5,
    "errors": [
      {
        "line": 145,
        "column": "fecha_nacimiento",
        "error": "Formato inválido",
        "suggestion": "Usar YYYY-MM-DD"
      }
    ],
    "warnings": 3,
    "processing_time": "2.4s"
  },
  "reports": {
    "executive_pdf": "/reports/exec_abc123.pdf",
    "technical_xlsx": "/reports/tech_abc123.xlsx",
    "certificate": "/reports/cert_abc123.pdf"
  }
}`
		},
		{
			id: 3,
			number: '04',
			title: 'Envío y Trazabilidad',
			icon: Send,
			color: 'primary',
			description:
				'Event sourcing inmutable registra cada operación para auditoría completa. Envío automático a CONSAR con tracking de estado en tiempo real.',
			details: {
				eventSourcing: [
					'Cada evento almacenado inmutablemente',
					'Reconstrucción de estado en cualquier momento',
					'Auditoría completa con usuario/timestamp',
					'Retención 7+ años cumplimiento CONSAR'
				],
				integrations: [
					{ name: 'CONSAR API', status: 'Activo', protocol: 'SOAP/REST' },
					{ name: 'Email notifications', status: 'Configurable', format: 'HTML + PDF' },
					{ name: 'Webhook callbacks', status: 'Opcional', format: 'JSON' },
					{ name: 'Dashboard real-time', status: 'Incluido', tech: 'WebSocket' }
				],
				tracking: 'Estado en tiempo real con notificaciones push'
			},
			metrics: [
				{ label: 'Eventos/día', value: '50K', icon: Activity },
				{ label: 'Retención', value: '7+ años', icon: Shield },
				{ label: 'Uptime SLA', value: '99.9%', icon: TrendingUp }
			],
			codeExample: `// Event Sourcing - Evento inmutable
{
  "event_id": "evt_xyz789",
  "event_type": "FILE_VALIDATED",
  "timestamp": "2026-01-20T10:30:45Z",
  "user_id": "user_123",
  "afore_id": "AFORE_001",
  "payload": {
    "file_id": "f_abc123",
    "validation_result": "passed",
    "score": 98.5
  },
  "metadata": {
    "ip": "192.168.1.1",
    "user_agent": "Hergon Client v1.0"
  }
}

// Envío automático a CONSAR
await consarAPI.submitFile({
  file: validatedFile,
  certificate: complianceCert,
  tracking_id: "track_xyz"
});`
		}
	];

	function selectStep(index) {
		activeStep = index;
		stopAutoPlay();
	}

	function nextStep() {
		activeStep = (activeStep + 1) % steps.length;
	}

	function prevStep() {
		activeStep = (activeStep - 1 + steps.length) % steps.length;
	}

	function toggleAutoPlay() {
		isAutoPlaying = !isAutoPlaying;
		if (isAutoPlaying) {
			autoPlayInterval = setInterval(() => {
				nextStep();
			}, 5000);
		} else {
			stopAutoPlay();
		}
	}

	function stopAutoPlay() {
		isAutoPlaying = false;
		if (autoPlayInterval) {
			clearInterval(autoPlayInterval);
			autoPlayInterval = null;
		}
	}

	$effect(() => {
		// Cleanup on component destroy
		return () => {
			if (autoPlayInterval) clearInterval(autoPlayInterval);
		};
	});
</script>

<!-- How It Works Section -->
<section
	id="how-it-works"
	class="relative py-24 px-4 md:px-8 bg-gradient-to-b from-white via-neutral-50 to-white overflow-hidden"
>
	<!-- Background decoration -->
	<div class="absolute inset-0 opacity-[0.02]">
		<div
			class="absolute inset-0"
			style="background-image: radial-gradient(circle at 1px 1px, rgb(0 102 255) 1px, transparent 0); background-size: 40px 40px;"
		></div>
	</div>

	<div class="container-custom relative z-10">
		<!-- Section Header -->
		<div class="text-center mb-16 {mounted ? 'animate-fade-in-up' : 'opacity-0'}">
			<div
				class="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/10 to-success/10 border border-primary/20 rounded-full text-sm font-medium text-primary mb-4"
			>
				<Activity class="w-4 h-4" />
				Proceso Automatizado
			</div>
			<h2 class="text-4xl md:text-5xl font-bold text-primary-dark mb-4">
				De Archivo a
				<span class="bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
					Certificación CONSAR
				</span>
				en 3 Segundos
			</h2>
			<p class="text-xl text-neutral-600 max-w-3xl mx-auto">
				4 pasos automatizados con event sourcing, validación paralela, y trazabilidad completa.
				Cada operación auditada y certificada.
			</p>
		</div>

		<!-- Auto-play control -->
		<div class="flex justify-center mb-12 {mounted ? 'animate-fade-in-up delay-300' : 'opacity-0'}">
			<button
				onclick={toggleAutoPlay}
				class="flex items-center gap-2 px-6 py-3 bg-white border-2 border-primary/20 rounded-xl hover:border-primary/40 transition-all shadow-md hover:shadow-lg"
			>
				<PlayCircle class="w-5 h-5 {isAutoPlaying ? 'text-success' : 'text-primary'}" />
				<span class="font-semibold text-neutral-700">
					{isAutoPlaying ? 'Detener Auto-play' : 'Iniciar Auto-play'}
				</span>
			</button>
		</div>

		<!-- Progress Timeline -->
		<div class="mb-16 {mounted ? 'animate-fade-in-up delay-500' : 'opacity-0'}">
			<div class="relative flex items-center justify-between max-w-4xl mx-auto">
				<!-- Progress bar background -->
				<div
					class="absolute top-1/2 left-0 right-0 h-1 bg-neutral-200 -translate-y-1/2 rounded-full"
				></div>
				<!-- Active progress -->
				<div
					class="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-primary to-success -translate-y-1/2 rounded-full transition-all duration-500"
					style="width: {(activeStep / (steps.length - 1)) * 100}%"
				></div>

				<!-- Step indicators -->
				{#each steps as step, index}
					{@const StepIcon = step.icon}
					<button
						onclick={() => selectStep(index)}
						class="relative z-10 group flex flex-col items-center gap-2 transition-all {index <=
						activeStep
							? 'scale-110'
							: ''}"
					>
						<div
							class="w-16 h-16 rounded-full flex items-center justify-center border-4 transition-all duration-300 {index <=
							activeStep
								? 'bg-gradient-to-br from-primary to-success border-white shadow-xl'
								: 'bg-white border-neutral-300 group-hover:border-primary/30'}"
						>
							<StepIcon
								class="w-7 h-7 {index <= activeStep ? 'text-white' : 'text-neutral-400 group-hover:text-primary'}"
							/>
						</div>
						<span
							class="text-sm font-semibold {index <= activeStep ? 'text-primary' : 'text-neutral-400'} hidden md:block"
						>
							{step.number}
						</span>
					</button>
				{/each}
			</div>
		</div>

		<!-- Step Content -->
		{#each steps as step, index}
			{#if activeStep === index}
				{@const StepIcon = step.icon}
				<div class="animate-fade-in-up">
					<div
						class="grid lg:grid-cols-2 gap-12 items-start bg-white rounded-3xl p-8 md:p-12 shadow-2xl border-2 border-{step.color}/20"
					>
						<!-- Left: Details -->
						<div class="space-y-8">
							<!-- Header -->
							<div>
								<div
									class="inline-flex items-center gap-3 px-4 py-2 bg-{step.color}/10 rounded-full mb-4"
								>
									<span class="text-3xl font-bold text-{step.color}">{step.number}</span>
									<div class="w-1 h-6 bg-{step.color}/30 rounded-full"></div>
									<StepIcon class="w-6 h-6 text-{step.color}" />
								</div>
								<h3 class="text-4xl font-bold text-neutral-900 mb-4">
									{step.title}
								</h3>
								<p class="text-lg text-neutral-600 leading-relaxed">
									{step.description}
								</p>
							</div>

							<!-- Metrics -->
							<div class="grid grid-cols-3 gap-4">
								{#each step.metrics as metric}
									{@const MetricIcon = metric.icon}
									<div
										class="p-4 bg-gradient-to-br from-{step.color}/5 to-{step.color}/10 rounded-xl border border-{step.color}/20"
									>
										<MetricIcon class="w-6 h-6 text-{step.color} mb-2" />
										<div class="text-2xl font-bold text-{step.color} mb-1">
											{metric.value}
										</div>
										<div class="text-xs text-neutral-600">{metric.label}</div>
									</div>
								{/each}
							</div>

							<!-- Details sections -->
							<div class="space-y-6">
								{#if step.details.methods}
									<div>
										<h4 class="font-semibold text-neutral-900 mb-3 flex items-center gap-2">
											<Upload class="w-5 h-5 text-{step.color}" />
											Métodos de Carga
										</h4>
										<div class="space-y-2">
											{#each step.details.methods as method}
												<div
													class="p-3 bg-neutral-50 rounded-lg border border-neutral-200 hover:border-{step.color}/30 transition-colors"
												>
													<div class="font-semibold text-neutral-900 text-sm">
														{method.name}
													</div>
													<div class="text-xs text-neutral-600">
														{method.endpoint || method.description || ''}
														{#if method.auth}
															• {method.auth}
														{/if}
														{#if method.maxSize}
															• Max: {method.maxSize}
														{/if}
													</div>
												</div>
											{/each}
										</div>
									</div>
								{/if}

								{#if step.details.validators}
									<div>
										<h4 class="font-semibold text-neutral-900 mb-3 flex items-center gap-2">
											<Cpu class="w-5 h-5 text-{step.color}" />
											Categorías de Validación
										</h4>
										<div class="space-y-2">
											{#each step.details.validators as validator}
												<div
													class="p-3 bg-neutral-50 rounded-lg border border-neutral-200 hover:border-{step.color}/30 transition-colors"
												>
													<div class="flex items-center justify-between mb-1">
														<span class="font-semibold text-neutral-900 text-sm">
															{validator.category}
														</span>
														<span
															class="px-2 py-0.5 bg-{step.color}/10 text-{step.color} text-xs font-bold rounded-full"
														>
															{validator.count} reglas
														</span>
													</div>
													<div class="text-xs text-neutral-600">{validator.description}</div>
												</div>
											{/each}
										</div>
									</div>
								{/if}

								{#if step.details.reportTypes}
									<div>
										<h4 class="font-semibold text-neutral-900 mb-3 flex items-center gap-2">
											<FileCheck class="w-5 h-5 text-{step.color}" />
											Tipos de Reporte
										</h4>
										<div class="grid grid-cols-2 gap-2">
											{#each step.details.reportTypes as report}
												<div
													class="p-3 bg-neutral-50 rounded-lg border border-neutral-200 hover:border-{step.color}/30 transition-colors"
												>
													<div class="font-semibold text-neutral-900 text-sm">
														{report.name}
													</div>
													<div class="text-xs text-{step.color} font-medium">{report.format}</div>
												</div>
											{/each}
										</div>
									</div>
								{/if}

								{#if step.details.eventSourcing}
									<div>
										<h4 class="font-semibold text-neutral-900 mb-3 flex items-center gap-2">
											<Database class="w-5 h-5 text-{step.color}" />
											Event Sourcing
										</h4>
										<ul class="space-y-2">
											{#each step.details.eventSourcing as feature}
												<li class="flex items-start gap-2 text-sm text-neutral-600">
													<CheckCircle class="w-4 h-4 text-{step.color} flex-shrink-0 mt-0.5" />
													<span>{feature}</span>
												</li>
											{/each}
										</ul>
									</div>
								{/if}
							</div>
						</div>

						<!-- Right: Code Example -->
						<div class="space-y-6">
							<div>
								<h4 class="font-semibold text-neutral-900 mb-3 flex items-center gap-2">
									<Code class="w-5 h-5 text-{step.color}" />
									Ejemplo Técnico
								</h4>
								<div class="relative">
									<pre
										class="p-6 bg-neutral-900 text-neutral-100 rounded-2xl overflow-x-auto text-sm leading-relaxed font-mono border-2 border-{step.color}/30 shadow-xl"
									><code>{step.codeExample}</code></pre>
									<div
										class="absolute top-4 right-4 px-3 py-1 bg-{step.color}/20 backdrop-blur-sm text-{step.color} text-xs font-semibold rounded-full"
									>
										{#if index === 0}
											REST API
										{:else if index === 1}
											JavaScript
										{:else if index === 2}
											JSON Response
										{:else}
											Event Store
										{/if}
									</div>
								</div>
							</div>

							<!-- Additional info -->
							<div
								class="p-6 bg-gradient-to-br from-{step.color}/5 to-{step.color}/10 rounded-2xl border border-{step.color}/20"
							>
								<div class="flex items-start gap-3">
									<AlertCircle class="w-6 h-6 text-{step.color} flex-shrink-0 mt-1" />
									<div>
										<h5 class="font-semibold text-neutral-900 mb-2">Nota Técnica</h5>
										<p class="text-sm text-neutral-600 leading-relaxed">
											{#if index === 0}
												Los archivos son validados preliminarmente al momento de carga para detectar
												problemas de formato antes del procesamiento completo.
											{:else if index === 1}
												El procesamiento paralelo permite validar archivos grandes en segundos,
												escalando automáticamente según la carga.
											{:else if index === 2}
												Todos los reportes incluyen links directos a la documentación CONSAR
												relevante para cada error detectado.
											{:else}
												Cada evento es criptográficamente firmado y almacenado inmutablemente,
												garantizando integridad para auditorías.
											{/if}
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>

					<!-- Navigation -->
					<div class="flex justify-center gap-4 mt-8">
						<button
							onclick={prevStep}
							class="px-6 py-3 bg-white border-2 border-neutral-200 rounded-xl hover:border-primary/40 transition-all font-semibold text-neutral-700 flex items-center gap-2 shadow-md hover:shadow-lg"
						>
							<ArrowRight class="w-5 h-5 rotate-180" />
							Anterior
						</button>
						<button
							onclick={nextStep}
							class="px-6 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all hover:scale-105"
						>
							Siguiente
							<ArrowRight class="w-5 h-5" />
						</button>
					</div>
				</div>
			{/if}
		{/each}

		<!-- Bottom CTA -->
		<div class="mt-16 text-center {mounted ? 'animate-fade-in-up delay-700' : 'opacity-0'}">
			<div
				class="inline-block p-8 bg-gradient-to-br from-primary/5 to-success/5 rounded-2xl border border-primary/20"
			>
				<p class="text-lg text-neutral-700 mb-6 max-w-2xl">
					<span class="font-bold text-primary">100% automatizado</span> - Sin intervención manual.
					De archivo cargado a certificado CONSAR en menos de 3 segundos.
				</p>
				<a
					href="#contact"
					class="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
				>
					<span>Ver Demo en Vivo del Proceso</span>
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

	pre {
		white-space: pre-wrap;
		word-wrap: break-word;
	}

	code {
		display: block;
	}
</style>
