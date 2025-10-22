<script>
	import { onMount, onDestroy } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { socketService } from '$lib/api/socket';
	import { explanationStore } from '$lib/stores';
	import { supabase } from '$lib/services';
	import { syncService } from '$lib/services/syncService';

	// Componentes
	import CollapsibleSteps from './components/CollapsibleSteps.svelte';
	import FloatingControls from './components/FloatingControls.svelte';
	import LoadingState from './components/LoadingState.svelte';
	import ErrorState from './components/ErrorState.svelte';
	import CanvasVisualization from './components/CanvasVisualization.svelte';
	import VerticalTimeline from './components/VerticalTimeline.svelte';
	import Math from '../examen/componentes/Math.svelte';
	import { speechService } from '$lib/services/speechService';

	// Estados
	let isConnecting = $state(true);
	let connectionError = $state(null);
	let questionData = $state(null);
	let showFeedbackModal = $state(false);
	let feedbackRating = $state(null);
	let feedbackComment = $state('');
	let voiceEnabled = $state(true); // Activar voz por defecto
	let voiceMuted = $state(false); // Control de muteo
	let renderProgress = $state(0);
	let hasStarted = $state(false); // Si ya inició la explicación
	let completedSteps = $state([]); // Pasos que ya terminaron de renderizar
	let isExplanationCollapsed = $state(false); // Control de colapso de la columna de explicación

	// Comandos de canvas filtrados por pasos COMPLETADOS
	// Solo muestra comandos de pasos que ya terminaron de renderizar su texto
	const currentCanvasCommands = $derived(
		$explanationStore.buffer.canvasCommands.filter((cmd) => completedSteps.includes(cmd.step))
	);

	// Obtener parámetros de la URL
	const searchParams = $derived($page.url.searchParams);

	onMount(async () => {
		// Habilitar voz cuando el usuario interactúe (click en play)
		speechService.setEnabled(true);
		console.log('📍 Sistema listo');

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
			const {
				data: { session },
				error: sessionError
			} = await supabase.auth.getSession();

			if (sessionError || !session) {
				throw new Error('No hay sesión activa');
			}

			const token = session.access_token;

			// Configurar listeners antes de conectar
			setupSocketListeners();

			// Conectar al socket
			await socketService.connect(token);

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
			if (voiceEnabled) {
				speechService.speak(data.message);
			}
		});

		// Listener de inicio de explicación
		socketService.onExplanationStart((data) => {
			explanationStore.startExplanation(data);
			console.log('✅ Explicación iniciada, esperando buffer completo...');
		});

		// Listener de inicio de paso
		socketService.onStepStart((data) => {
			explanationStore.startStep(data);

			// Procesar comandos de canvas si vienen en el paso
			if (data.canvas_commands && Array.isArray(data.canvas_commands)) {
				data.canvas_commands.forEach((cmd) => {
					explanationStore.addCanvasCommand({
						step_number: data.step_number,
						command: cmd
					});
				});
			}
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
			console.log('✅ Buffer completo, listo para iniciar');
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
		// Detener sincronización
		syncService.stop();
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
		// Mostrar modal de feedback antes de volver
		showFeedbackModal = true;
	}

	function submitFeedback() {
		// Aquí podrías enviar el feedback al backend si lo deseas
		console.log('Feedback:', { rating: feedbackRating, comment: feedbackComment });

		// Desconectar y volver al examen
		socketService.disconnect();
		explanationStore.reset();
		goto('/examen');
	}

	function skipFeedback() {
		// Detener sincronización
		syncService.stop();
		// Volver sin dar feedback
		socketService.disconnect();
		explanationStore.reset();
		goto('/examen');
	}

	// Configurar callbacks del syncService
	syncService.onStepStart((checkpoint, stepIndex) => {
		console.log('🎬 Paso iniciado:', checkpoint.title);
		// Actualizar currentStep en el store
		explanationStore.setCurrentStep(checkpoint.step);
	});

	syncService.onStepComplete((checkpoint, stepIndex) => {
		console.log('✅ Paso completado:', checkpoint.title);
		// Agregar este paso a los completados para mostrar sus comandos de canvas
		completedSteps = [...completedSteps, checkpoint.step];
		
		// Marcar el paso como completado en el store
		explanationStore.markStepComplete(checkpoint.step);
	});

	syncService.onCharRender((checkpoint, charIndex) => {
		// Tracking opcional
	});

	// Filtrar comandos de canvas por paso
	function getCanvasCommandsForStep(stepNumber) {
		return $explanationStore.canvasCommands.filter((cmd) => cmd.step === stepNumber);
	}

	// Función para iniciar la explicación
	function handlePlay() {
		if (hasStarted) return;

		hasStarted = true;
		console.log('▶️ Iniciando explicación...');

		// Iniciar syncService INMEDIATAMENTE
		syncService.start();
		startProgressTracking();
	}

	// Función para mutear/desmutear voz (NO detiene nada)
	function toggleVoice() {
		voiceMuted = !voiceMuted;
		syncService.toggleVoice(!voiceMuted);

		if (voiceMuted) {
			console.log('🔇 Voz muteada');
		} else {
			console.log('🔊 Voz activada');
		}
	}

	function toggleExplanationCollapse() {
		isExplanationCollapsed = !isExplanationCollapsed;
	}

	// Tracking de progreso
	let progressInterval = null;
	function startProgressTracking() {
		if (progressInterval) clearInterval(progressInterval);

		progressInterval = setInterval(() => {
			renderProgress = syncService.getProgress();

			if (renderProgress >= 100) {
				clearInterval(progressInterval);
				progressInterval = null;
			}
		}, 100);
	}

	// Limpiar al desmontar
	onDestroy(() => {
		if (progressInterval) {
			clearInterval(progressInterval);
		}
		syncService.stop();
		if (socketService.isSocketConnected()) {
			socketService.disconnect();
		}
		speechService.stop();
	});
</script>

<!-- Fondo dark futurista - Single page sin scroll -->
<div
	class="h-screen overflow-hidden bg-gradient-to-br from-gray-950/20 via-slate-900/20 to-gray-950/20 text-white"
>
	<div class="h-full flex flex-col px-6 py-6">
		<!-- Pregunta original compacta -->
		{#if questionData}
			<!-- Header compacto con indicador de progreso -->
			<div class="flex-shrink-0">
				<div class="flex flex-col items-center justify-center">
					<div class="">
						<h1 class="text-2xl font-bold text-indigo-400">Question</h1>
					</div>
					<div class="flex items-center gap-3 -mt-10">
						<button
							onclick={handleGoBack}
							class="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-all border border-slate-700 hover:border-indigo-500 text-sm"
						>
							← Volver
						</button>
						{#if questionData.lengMathPregunta}
							<Math content={questionData.pregunta} isBlock={false} />
						{:else}
							<p class="text-yellow-300 text-2xl italic">{questionData.pregunta}</p>
						{/if}
					</div>
					{#if $explanationStore.render.isRendering && renderProgress < 100}
						<div class="progress-indicator">
							<div class="progress-bar" style="width: {renderProgress}%"></div>
							<span class="progress-text">{renderProgress}%</span>
						</div>
					{/if}
					<div class="flex gap-3 text-xs max-w-[600px] -mt-5">
						<div class="flex-1 px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-lg">
							<span class="text-red-400 font-medium">Tu:</span>
							<span class="text-gray-300 ml-1">{questionData.respuestaUsuario}</span>
						</div>
						<div class="flex-1 px-3 py-2 bg-green-500/10 border border-green-500/30 rounded-lg">
							<span class="text-green-400 font-medium">Correcta:</span>
							<span class="text-gray-300 ml-1 text-xs sm:text-sm truncate"
								>{questionData.respuestaCorrecta}</span
							>
						</div>
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
		{:else if $explanationStore.isLoading || (!$explanationStore.buffer.isComplete && !hasStarted)}
			<!-- Mostrar loading mientras se carga el buffer completo -->
			<LoadingState
				bufferSteps={$explanationStore.buffer.steps.length}
				totalSteps={$explanationStore.totalSteps}
				isBuffering={$explanationStore.buffer.steps.length > 0}
			/>
		{:else if $explanationStore.buffer.isComplete && !hasStarted}
			<!-- Botón de PLAY para iniciar (solo cuando el buffer está completo) -->
			<div class="flex-1 flex items-center justify-center">
				<button onclick={handlePlay} class="play-button">
					<svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
						<polygon points="5 3 19 12 5 21 5 3"></polygon>
					</svg>
					<span>Iniciar Explicación</span>
				</button>
			</div>
		{:else}
			<!-- Pizarrón y Explicación con colapso dinámico -->
			{#if $explanationStore.steps.length > 0}
				<div class="flex-1 flex gap-6 min-h-0 mt-4 overflow-hidden relative">
					<!-- Pizarrón (expande cuando explicación está colapsada) -->
					<div class="flex flex-col min-h-0 transition-all duration-300" class:flex-1={isExplanationCollapsed} class:lg:flex-[3]={!isExplanationCollapsed}>
						
						<div class="flex-1 overflow-auto">
							<CanvasVisualization commands={currentCanvasCommands} />
						</div>
					</div>

					<!-- Explicación (1/4) - Se oculta cuando está colapsada -->
					{#if !isExplanationCollapsed}
						<div class="flex flex-col lg:flex-1 min-h-0 transition-all duration-300">
							<CollapsibleSteps 
								steps={$explanationStore.steps}
								currentStep={$explanationStore.currentStep}
							/>
						</div>
					{/if}
					
					<!-- Botón de colapso tipo "cachito" -->
					<button
						type="button"
						onclick={toggleExplanationCollapse}
						class="collapse-tab-main"
						class:expanded={!isExplanationCollapsed}
						aria-label={isExplanationCollapsed ? 'Mostrar explicación' : 'Ocultar explicación'}
					>
						<svg 
							class="collapse-icon-main" 
							class:rotated={isExplanationCollapsed}
							viewBox="0 0 24 24" 
							fill="none" 
							stroke="currentColor" 
							stroke-width="2.5"
						>
							<path d="M15 18l-6-6 6-6"/>
						</svg>
					</button>
				</div>
			{/if}
		{/if}
	</div>
</div>

<!-- Controles flotantes en la parte inferior -->
{#if $explanationStore.steps.length > 0}
	<FloatingControls onStop={handleStop} onToggleVoice={toggleVoice} voiceEnabled={!voiceMuted} />
{/if}

<!-- Modal de Feedback -->
{#if showFeedbackModal}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="modal-overlay" onclick={() => (showFeedbackModal = false)}>
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="modal-content" onclick={(e) => e.stopPropagation()}>
			<h2 class="modal-title">¿Te fue útil la explicación?</h2>
			<p class="modal-subtitle">Tu opinión nos ayuda a mejorar</p>

			<!-- Botones de rating -->
			<div class="rating-buttons">
				<button
					class="rating-btn"
					class:selected={feedbackRating === 'bad'}
					onclick={() => (feedbackRating = 'bad')}
				>
					😞
				</button>
				<button
					class="rating-btn"
					class:selected={feedbackRating === 'neutral'}
					onclick={() => (feedbackRating = 'neutral')}
				>
					😐
				</button>
				<button
					class="rating-btn"
					class:selected={feedbackRating === 'good'}
					onclick={() => (feedbackRating = 'good')}
				>
					😊
				</button>
				<button
					class="rating-btn"
					class:selected={feedbackRating === 'excellent'}
					onclick={() => (feedbackRating = 'excellent')}
				>
					🤩
				</button>
			</div>

			<!-- Comentario opcional -->
			<textarea
				class="comment-input"
				bind:value={feedbackComment}
				placeholder="Cuéntanos más (opcional)..."
			></textarea>

			<!-- Acciones -->
			<div class="modal-actions">
				<button class="modal-btn secondary" onclick={skipFeedback}> Omitir </button>
				<button class="modal-btn primary" onclick={submitFeedback}> Enviar y continuar </button>
			</div>
		</div>
	</div>
{/if}

<style>
	/* Modal de feedback */
	.modal-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.7);
		backdrop-filter: blur(4px);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 50;
		animation: fadeIn 0.2s ease-out;
	}

	.modal-content {
		background: linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%);
		border: 1px solid rgba(99, 102, 241, 0.3);
		border-radius: 16px;
		padding: 32px;
		max-width: 480px;
		width: 90%;
		box-shadow:
			0 20px 60px rgba(0, 0, 0, 0.6),
			0 0 0 1px rgba(99, 102, 241, 0.2);
		animation: slideUp 0.3s ease-out;
	}

	.modal-title {
		color: #818cf8;
		font-size: 1.25rem;
		font-weight: 600;
		margin-bottom: 8px;
		text-align: center;
	}

	.modal-subtitle {
		color: rgba(226, 232, 240, 0.7);
		font-size: 0.875rem;
		text-align: center;
		margin-bottom: 24px;
	}

	.rating-buttons {
		display: flex;
		gap: 12px;
		justify-content: center;
		margin-bottom: 20px;
	}

	.rating-btn {
		width: 56px;
		height: 56px;
		border-radius: 12px;
		border: 1px solid rgba(99, 102, 241, 0.3);
		background: rgba(15, 23, 42, 0.6);
		font-size: 1.5rem;
		cursor: pointer;
		transition: all 0.2s ease;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.rating-btn:hover {
		border-color: rgba(99, 102, 241, 0.5);
		background: rgba(99, 102, 241, 0.2);
		transform: scale(1.05);
	}

	.rating-btn.selected {
		border-color: rgba(99, 102, 241, 0.8);
		background: rgba(99, 102, 241, 0.3);
		box-shadow: 0 0 20px rgba(99, 102, 241, 0.4);
	}

	.comment-input {
		width: 100%;
		min-height: 80px;
		padding: 12px;
		border-radius: 8px;
		border: 1px solid rgba(99, 102, 241, 0.3);
		background: rgba(15, 23, 42, 0.6);
		color: #e2e8f0;
		font-size: 0.875rem;
		resize: vertical;
		margin-bottom: 20px;
		transition: all 0.2s ease;
	}

	.comment-input:focus {
		outline: none;
		border-color: rgba(99, 102, 241, 0.6);
		box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
	}

	.comment-input::placeholder {
		color: rgba(226, 232, 240, 0.4);
	}

	.modal-actions {
		display: flex;
		gap: 12px;
	}

	.modal-btn {
		flex: 1;
		padding: 12px 24px;
		border-radius: 8px;
		font-size: 0.875rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		border: none;
	}

	.modal-btn.primary {
		background: rgba(99, 102, 241, 0.8);
		color: white;
	}

	.modal-btn.primary:hover {
		background: rgba(99, 102, 241, 1);
		box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
	}

	.modal-btn.secondary {
		background: rgba(71, 85, 105, 0.6);
		color: #e2e8f0;
	}

	.modal-btn.secondary:hover {
		background: rgba(71, 85, 105, 0.8);
	}

	@keyframes slideUp {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* Botón de PLAY */
	.play-button {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16px;
		padding: 32px 48px;
		background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(129, 140, 248, 0.2));
		border: 2px solid rgba(99, 102, 241, 0.5);
		border-radius: 24px;
		color: #818cf8;
		font-size: 1.25rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
		animation: pulse 2s ease-in-out infinite;
	}

	.play-button:hover {
		background: linear-gradient(135deg, rgba(99, 102, 241, 0.3), rgba(129, 140, 248, 0.3));
		border-color: rgba(99, 102, 241, 0.8);
		transform: scale(1.05);
		box-shadow: 0 0 40px rgba(99, 102, 241, 0.5);
	}

	.play-button:active {
		transform: scale(0.98);
	}

	@keyframes pulse {
		0%,
		100% {
			box-shadow: 0 0 20px rgba(99, 102, 241, 0.3);
		}
		50% {
			box-shadow: 0 0 40px rgba(99, 102, 241, 0.6);
		}
	}

	/* Indicador de progreso */
	.progress-indicator {
		position: relative;
		width: 200px;
		height: 24px;
		background: rgba(15, 23, 42, 0.6);
		border-radius: 12px;
		border: 1px solid rgba(99, 102, 241, 0.3);
		overflow: hidden;
	}

	.progress-bar {
		position: absolute;
		top: 0;
		left: 0;
		height: 100%;
		background: linear-gradient(90deg, rgba(99, 102, 241, 0.6), rgba(129, 140, 248, 0.8));
		transition: width 0.3s ease;
		border-radius: 12px;
	}

	.progress-text {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		font-size: 0.7rem;
		font-weight: 600;
		color: #e2e8f0;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
	}

	/* Botón de colapso principal tipo "cachito" */
	.collapse-tab-main {
		position: absolute;
		top: 50%;
		right: 0;
		transform: translateY(-50%);
		width: 1rem;
		height: 4rem;
		background: linear-gradient(to bottom right, rgba(99, 102, 241, 0.7), rgba(79, 70, 229, 0.8));
		border: none;
		border-top-left-radius: 0.75rem;
		border-bottom-left-radius: 0.75rem;
		border-top-right-radius: 0;
		border-bottom-right-radius: 0;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		opacity: 0.6;
		transition: all 0.3s ease;
		box-shadow: -3px 0 10px rgba(99, 102, 241, 0.3);
		backdrop-filter: blur(4px);
		z-index: 20;
	}
	
	.collapse-tab-main:hover {
		width: 2rem;
		opacity: 1;
		box-shadow: -5px 0 15px rgba(99, 102, 241, 0.5);
	}
	
	.collapse-tab-main.expanded {
		background: linear-gradient(to bottom right, rgba(99, 102, 241, 0.8), rgba(79, 70, 229, 0.9));
	}
	
	.collapse-icon-main {
		width: 1.25rem;
		height: 1.25rem;
		color: white;
		transition: transform 0.3s ease;
		opacity: 0;
	}
	
	.collapse-tab-main:hover .collapse-icon-main {
		opacity: 1;
	}
	
	.collapse-icon-main.rotated {
		transform: rotate(180deg);
	}
	
	/* Animación de pulso cuando está colapsado */
	.collapse-tab-main:not(.expanded) {
		animation: mainTabPulse 2s ease-in-out infinite;
	}
	
	@keyframes mainTabPulse {
		0%, 100% {
			opacity: 0.6;
		}
		50% {
			opacity: 0.9;
		}
	}
	
	/* Responsive - Mobile */
	@media (max-width: 768px) {
		.collapse-tab-main {
			width: 0.875rem;
			height: 3rem;
		}
		
		.collapse-tab-main:hover {
			width: 1.5rem;
		}
		
		.collapse-icon-main {
			width: 1rem;
			height: 1rem;
		}
	}
</style>
