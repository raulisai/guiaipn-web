<script>
	import { onMount, onDestroy } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { socketService } from '$lib/api/socket';
	import { explanationStore } from '$lib/stores';
	import { supabase } from '$lib/services';
	
	// Componentes
	import ExplanationContainer from './components/ExplanationContainer.svelte';
	import StepCard from './components/StepCard.svelte';
	import PlaybackControls from './components/PlaybackControls.svelte';
	import FeedbackPanel from './components/FeedbackPanel.svelte';
	import LoadingState from './components/LoadingState.svelte';
	import ErrorState from './components/ErrorState.svelte';
	import Math from '../examen/componentes/Math.svelte';

	// Estados
	let isConnecting = $state(true);
	let connectionError = $state(null);
	let questionData = $state(null);

	// Obtener parámetros de la URL
	const searchParams = $derived($page.url.searchParams);

	onMount(async () => {
		// Extraer datos de la pregunta desde URL
		questionData = {
			id: searchParams.get('id'),
			pregunta: searchParams.get('pregunta'),
			respuestaUsuario: searchParams.get('respuestaUsuario'),
			respuestaCorrecta: searchParams.get('respuestaCorrecta'),
			iscorrect: searchParams.get('iscorrect') === 'true',
			lengMathPregunta: searchParams.get('lengMathPregunta') === 'true',
			lengMathOpciones: searchParams.get('lengMathOpciones') === 'true'
		};

		// Validar que tenemos los datos necesarios
		if (!questionData.id || !questionData.pregunta) {
			connectionError = {
				code: 'VALIDATION_ERROR',
				message: 'No se encontraron datos de la pregunta. Por favor, regresa al examen.'
			};
			isConnecting = false;
			return;
		}

		// Guardar pregunta en el store
		explanationStore.setCurrentQuestion(questionData);

		// Conectar al socket
		await connectToSocket();
	});

	async function connectToSocket() {
		try {
			// Obtener token de Supabase
			const { data: { session }, error: sessionError } = await supabase.auth.getSession();
			
			if (sessionError || !session) {
				throw new Error('No hay sesión activa');
			}

			const token = session.access_token;

			// Configurar listeners antes de conectar
			setupSocketListeners();

			// Conectar al socket
			await socketService.connect(token);

			// Esperar un momento para asegurar que la conexión está establecida
			await new Promise(resolve => setTimeout(resolve, 500));

			// Iniciar explicación automáticamente
			startExplanation();

			isConnecting = false;
		} catch (error) {
			console.error('Error al conectar:', error);
			connectionError = {
				code: 'CONNECTION_ERROR',
				message: error.message
			};
			isConnecting = false;
		}
	}

	function setupSocketListeners() {
		// Listener de frases de espera
		socketService.onWaitingPhrase((data) => {
			explanationStore.setWaitingMessage(data.message);
		});

		// Listener de inicio de explicación
		socketService.onExplanationStart((data) => {
			explanationStore.startExplanation(data);
		});

		// Listener de inicio de paso
		socketService.onStepStart((data) => {
			explanationStore.startStep(data);
		});

		// Listener de chunks de contenido
		socketService.onContentChunk((data) => {
			explanationStore.addContentChunk(data);
		});

		// Listener de comandos de canvas
		socketService.onCanvasCommand((data) => {
			explanationStore.addCanvasCommand(data);
		});

		// Listener de paso completado
		socketService.onStepComplete((data) => {
			explanationStore.completeStep(data);
		});

		// Listener de explicación completada
		socketService.onExplanationComplete((data) => {
			explanationStore.completeExplanation(data);
		});

		// Listener de errores
		socketService.onError((error) => {
			explanationStore.setError(error);
			connectionError = error;
		});
	}

	function startExplanation() {
		if (!questionData) return;

		// Emitir evento para iniciar explicación
		socketService.emitStartExplanation({
			id: questionData.id,
			pregunta: questionData.pregunta,
			resuesta: questionData.respuestaCorrecta,
			userAnswer: questionData.respuestaUsuario,
			opciones: {}
		});
	}

	function handleStop() {
		// Desconectar socket
		socketService.disconnect();
		// Resetear store
		explanationStore.reset();
		// Volver al examen
		goto('/examen');
	}

	function handleRetry() {
		// Limpiar error
		connectionError = null;
		explanationStore.clearError();
		isConnecting = true;
		// Reintentar conexión
		connectToSocket();
	}

	function handleGoBack() {
		// Desconectar y volver
		socketService.disconnect();
		explanationStore.reset();
		goto('/examen');
	}

	// Filtrar comandos de canvas por paso
	function getCanvasCommandsForStep(stepNumber) {
		return $explanationStore.canvasCommands.filter(cmd => cmd.step === stepNumber);
	}

	// Limpiar al desmontar
	onDestroy(() => {
		if (socketService.isSocketConnected()) {
			socketService.disconnect();
		}
	});
</script>

<!-- Fondo consistente con el examen -->
<div class="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white">
	<div class="container mx-auto px-4 py-8">
		<!-- Header -->
		<div class="mb-8">
			<div class="flex items-center justify-between">
				<div>
					<h1 class="text-3xl font-bold mb-2">🎓 Salón de Clase IA</h1>
					<p class="text-gray-400">Explicación detallada paso a paso</p>
				</div>
				<button
					onclick={handleGoBack}
					class="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
				>
					← Volver al examen
				</button>
			</div>
		</div>

		<!-- Mostrar pregunta original -->
		{#if questionData}
			<div class="bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-lg p-6 mb-6 border border-gray-700">
				<h2 class="text-xl font-semibold mb-3 text-blue-400">📝 Pregunta Original</h2>
				<div class="mb-4">
					{#if questionData.lengMathPregunta}
						<Math content={questionData.pregunta} isBlock={false} />
					{:else}
						<p class="text-gray-200">{questionData.pregunta}</p>
					{/if}
				</div>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
					<div class="p-3 bg-red-900 bg-opacity-20 border border-red-500 border-opacity-30 rounded-lg">
						<span class="text-red-400 font-medium">Tu respuesta:</span>
						<p class="text-gray-200 mt-1">{questionData.respuestaUsuario}</p>
					</div>
					<div class="p-3 bg-green-900 bg-opacity-20 border border-green-500 border-opacity-30 rounded-lg">
						<span class="text-green-400 font-medium">Respuesta correcta:</span>
						<p class="text-gray-200 mt-1">{questionData.respuestaCorrecta}</p>
					</div>
				</div>
			</div>
		{/if}

		<!-- Estados principales -->
		{#if isConnecting}
			<LoadingState />
		{:else if connectionError || $explanationStore.error}
			<ErrorState 
				error={connectionError || $explanationStore.error} 
				onRetry={handleRetry}
				onGoBack={handleGoBack}
			/>
		{:else if $explanationStore.isLoading}
			<LoadingState />
		{:else}
			<!-- Controles de reproducción -->
			{#if $explanationStore.isExplaining || $explanationStore.isPaused}
				<div class="mb-6">
					<PlaybackControls onStop={handleStop} />
				</div>
			{/if}

			<!-- Contenedor de explicación -->
			{#if $explanationStore.steps.length > 0}
				<ExplanationContainer>
					{#each $explanationStore.steps as step (step.step)}
						<StepCard 
							step={step}
							isActive={step.step === $explanationStore.currentStep}
							canvasCommands={getCanvasCommandsForStep(step.step)}
						/>
					{/each}
				</ExplanationContainer>
			{/if}

			<!-- Panel de feedback (solo cuando la explicación está completa) -->
			{#if !$explanationStore.isExplaining && !$explanationStore.isPaused && $explanationStore.steps.length > 0}
				<div class="mt-8">
					<FeedbackPanel />
				</div>
			{/if}
		{/if}
	</div>
</div>