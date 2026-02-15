<script>
	import { onMount, onDestroy } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { explanationStore } from '$lib/stores';
	import { createClassRoomController } from '$lib/classRoom';
	import { normalizeComponentCommand } from '$lib/classRoom/component_commands/index.js';
	import { speechService } from '$lib/services/speechService';

	// Componentes
	import CollapsibleSteps from './components/CollapsibleSteps.svelte';
	import FloatingControls from './components/FloatingControls.svelte';
	import LoadingState from './components/LoadingState.svelte';
	import ErrorState from './components/ErrorState.svelte';
	import Pizarron from './components/Pizarron.svelte';
	import ComponentCommandRenderer from '$lib/classRoom/component_commands/ComponentCommandRenderer.svelte';
	import ProgressIndicator from './components/ProgressIndicator.svelte';
	import MathComponent from '../examen/componentes/Math.svelte';

	// Estados de UI
	let isConnecting = $state(true);
	let connectionError = $state(null);
	let showFeedbackModal = $state(false);
	let feedbackRating = $state(null);
	let feedbackComment = $state('');
	let voiceMuted = $state(false);
	let renderProgress = $state(0);
	let hasStarted = $state(false);
	let hasClearedBeforeStart = $state(false);
	let lastQuestionHash = $state(null);
	let autoFeedbackShown = $state(false);

	let isExplanationCollapsed = $state(false);
	let viewQuestionBtnCollapsed = $state(false);

	// Crear controlador
	const controller = createClassRoomController($page.url.searchParams);

	// Comandos de canvas filtrados por progreso
	const currentCanvasCommands = $derived(
		controller.getVisibleCanvasCommands(
			$explanationStore.currentStep,
			$explanationStore.stepProgress.percentage
		)
	);

	// Component commands filtrados por progreso para el panel
	const currentPanelComponentCommands = $derived.by(() => {
		const rawCommands =
			controller.getVisibleComponentCommands(
				$explanationStore.currentStep,
				$explanationStore.stepProgress.percentage,
				'panel'
			) || [];

		const normalized = rawCommands.map((cmd) => normalizeComponentCommand(cmd)).filter(Boolean);

		if (normalized.length > 0) {
			console.log('🧩 Component commands visibles (panel):', normalized);
		}

		return normalized;
	});

	// Datos de la pregunta desde el controlador
	const questionData = $derived(controller.getQuestionData());

	const explanationFinished = $derived(
		hasStarted &&
			$explanationStore.buffer.isComplete &&
			!$explanationStore.isExplaining &&
			!$explanationStore.render.isRendering &&
			renderProgress >= 99
	);

	$effect(() => {
		const currentHash = $explanationStore.questionHash;
		if (currentHash && currentHash !== lastQuestionHash) {
			lastQuestionHash = currentHash;
			hasClearedBeforeStart = false;
			autoFeedbackShown = false;
			showFeedbackModal = false;
			feedbackRating = null;
			feedbackComment = '';
		}
	});

	$effect(() => {
		if (!hasStarted && !hasClearedBeforeStart && $explanationStore.buffer.isComplete) {
			explanationStore.clearRenderedContent();
			hasClearedBeforeStart = true;
		}
	});

	$effect(() => {
		if (explanationFinished && !autoFeedbackShown && !showFeedbackModal) {
			showFeedbackModal = true;
			autoFeedbackShown = true;
			// Restaurar vista al finalizar
			isExplanationCollapsed = false;
		}
	});

	// Auto-colapsar botón de "Ver Pregunta" después de un tiempo
	$effect(() => {
		if (hasStarted && !explanationFinished && !isExplanationCollapsed) {
			viewQuestionBtnCollapsed = false;
			const timer = setTimeout(() => {
				viewQuestionBtnCollapsed = true;
			}, 3000); // 3 segundos antes de minimizar
			return () => clearTimeout(timer);
		}
	});

	// Auto-colapsar al iniciar para modo inmersivo
	$effect(() => {
		if (hasStarted && !explanationFinished && renderProgress > 0 && renderProgress < 5) {
			// Solo colapsar si acaba de empezar
			if (!isExplanationCollapsed) {
				isExplanationCollapsed = true;
			}
		}
	});

	// Limpieza al desmontar
	onDestroy(() => {
		if (typeof window !== 'undefined') {
			window.removeEventListener('resize', checkMobile);
			window.removeEventListener('beforeunload', handleCleanup);
		}
		handleCleanup();
	});

	function handleCleanup() {
		console.log('🧹 Limpiando recursos de la clase...');

		// 1. Detener servicio principal (si tiene método stop)
		if (speechService) {
			speechService.stop?.();
		}

		// 2. Parada de emergencia de síntesis nativa del navegador
		if (typeof window !== 'undefined' && window.speechSynthesis) {
			console.log('🛑 Cancelando síntesis de voz nativa');
			window.speechSynthesis.cancel();
		}

		// 3. Parada de librería externa (ResponsiveVoice) si existe
		// @ts-ignore
		if (typeof window !== 'undefined' && window.responsiveVoice) {
			// @ts-ignore
			window.responsiveVoice.cancel();
		}

		controller.cleanup(); // Llamar al cleanup del controlador
	}

	function checkMobile() {
		// Detectar si es móvil para colapsar explicación
		if (typeof window !== 'undefined' && window.innerWidth < 1024) {
			isExplanationCollapsed = true;
		}
	}

	onMount(async () => {
		// Colapsar por defecto en móvil/tablet al cargar
		checkMobile();
		if (typeof window !== 'undefined') {
			window.addEventListener('resize', checkMobile);
			// Manejar cierre de pestaña/navegación externa
			window.addEventListener('beforeunload', handleCleanup);
		}

		// Si no hay datos, volver (protección)
		const controllerData = controller.getQuestionData();
		if (!$explanationStore.currentQuestion && (!controllerData || !controllerData.id)) {
			goto('/home');
			return;
		}

		await controller.initialize({
			onConnecting: () => {
				isConnecting = true;
			},
			onConnected: () => {
				isConnecting = false;
			},
			onError: (error) => {
				connectionError = error;
				isConnecting = false;
			}
		});
	});

	// Handlers de UI

	function handleStop() {
		controller.stop();
	}

	function handlePauseToggle() {
		if ($explanationStore.isPaused) {
			controller.resume();
		} else {
			controller.pause();
		}
	}

	function handleRetry() {
		connectionError = null;
		isConnecting = true;
		controller.retry(async () => {
			await controller.initialize({
				onConnected: () => (isConnecting = false),
				onError: (err) => {
					connectionError = err;
					isConnecting = false;
				}
			});
		});
	}

	function handleGoBack() {
		// Mostrar modal de feedback antes de volver
		showFeedbackModal = true;
	}

	function submitFeedback() {
		controller.submitFeedback(feedbackRating, feedbackComment);
	}

	function skipFeedback() {
		controller.skipFeedback();
	}

	// Callbacks ya están configurados en el controlador

	function handlePlay() {
		if (hasStarted) return;
		hasStarted = true;
		controller.startRendering((progress) => {
			renderProgress = progress;
		});
	}

	function toggleVoice() {
		voiceMuted = !voiceMuted;
		controller.toggleVoice(!voiceMuted);
	}

	function toggleExplanationCollapse() {
		isExplanationCollapsed = !isExplanationCollapsed;
	}

	// Tracking de progreso manejado por el controlador

	onDestroy(() => {
		controller.cleanup();
	});
</script>

<!-- Fondo dark futurista - Single page sin scroll -->
<div
	class="h-screen overflow-hidden bg-gradient-to-br from-gray-950/20 via-slate-900/20 to-gray-950/20 text-white"
>
	<div class="h-full flex flex-col px-3 py-2 md:px-6 md:py-6">
		<!-- Pregunta original compacta -->
		{#if questionData}
			<!-- Header compacto con indicador de progreso -->
			<!-- Header Colapsable -->
			<div
				class="flex-shrink-0 w-full max-w-4xl mx-auto transition-all duration-500 ease-in-out z-30"
				class:opacity-100={!hasStarted}
				class:opacity-0={hasStarted && !explanationFinished && isExplanationCollapsed === false}
				class:h-auto={!hasStarted || explanationFinished || isExplanationCollapsed}
				class:h-0={hasStarted && !explanationFinished && !isExplanationCollapsed}
				class:overflow-hidden={hasStarted && !explanationFinished && !isExplanationCollapsed}
				class:pointer-events-none={hasStarted && !explanationFinished && !isExplanationCollapsed}
			>
				<div
					class="flex flex-col items-center justify-center gap-4 py-2 bg-slate-950/80 backdrop-blur-md md:bg-transparent md:backdrop-filter-none rounded-b-2xl shadow-lg md:shadow-none border-b border-indigo-500/20 md:border-none px-4 pb-4 md:pb-0"
				>
					<!-- Título y Botón Volver (Layout Flex seguro sin absolutos peligrosos en móvil) -->
					<div class="w-full flex items-center justify-between gap-2">
						<button
							onclick={handleGoBack}
							class="flex items-center justify-center w-10 h-10 md:w-auto md:h-auto md:px-4 md:py-2 bg-slate-800/80 hover:bg-slate-700/80 rounded-full md:rounded-lg transition-all border border-slate-700 hover:border-indigo-500 text-sm backdrop-blur-sm shadow-sm group"
							aria-label="Volver"
						>
							<span class="md:hidden">←</span>
							<span class="hidden md:inline">← Volver</span>
						</button>

						<h1
							class="text-lg md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 text-center flex-1"
						>
							Pregunta
						</h1>

						<!-- Boton fantasma para balancear o menú futuro -->
						<div class="w-10 md:w-[88px]"></div>
					</div>

					<!-- Pregunta con scroll suave -->
					<div class="w-full flex justify-center">
						{#if questionData.lengMathPregunta}
							<div
								class="bg-slate-900/50 px-4 py-3 rounded-lg border border-slate-700/50 backdrop-blur-sm w-full overflow-x-auto shadow-inner scrollbar-hide"
							>
								<div class="min-w-fit">
									<MathComponent content={questionData.pregunta} isBlock={false} />
								</div>
							</div>
						{:else}
							<p
								class="text-yellow-300 text-base md:text-xl italic text-center leading-snug drop-shadow-sm max-w-3xl"
							>
								{questionData.pregunta}
							</p>
						{/if}
					</div>

					<!-- Respuestas Compactas -->
					<div class="grid grid-cols-2 gap-3 w-full">
						<div
							class="flex flex-col items-center p-2 bg-red-500/10 border border-red-500/20 rounded-lg backdrop-blur-sm"
						>
							<span class="text-[10px] uppercase tracking-wider text-red-400 font-semibold"
								>Tu Respuesta</span
							>
							<span class="text-gray-200 font-bold text-center text-sm"
								><MathComponent content={questionData.respuestaUsuario} isBlock={false} /></span
							>
						</div>
						<div
							class="flex flex-col items-center p-2 bg-green-500/10 border border-green-500/20 rounded-lg backdrop-blur-sm"
						>
							<span class="text-[10px] uppercase tracking-wider text-green-400 font-semibold"
								>Correcta</span
							>
							<span class="text-gray-200 font-bold text-center text-sm truncate max-w-full"
								><MathComponent content={questionData.respuestaCorrecta} isBlock={false} /></span
							>
						</div>
					</div>
				</div>
			</div>

			<!-- Botones Flotantes (Solo aparecen cuando el header está oculto) -->
			{#if hasStarted && !explanationFinished && !isExplanationCollapsed}
				<div class="absolute top-24 right-4 z-40 flex flex-col gap-3 items-end">
					<!-- Botón Ver Pregunta (Auto-colapsable) -->
					<button
						onclick={() => (isExplanationCollapsed = true)}
						class="flex items-center justify-center gap-2 bg-slate-800/90 hover:bg-slate-700 text-indigo-300 font-medium rounded-full border border-indigo-500/30 shadow-lg backdrop-blur-sm transition-all duration-500 ease-out overflow-hidden group"
						class:w-10={viewQuestionBtnCollapsed}
						class:h-10={viewQuestionBtnCollapsed}
						class:w-auto={!viewQuestionBtnCollapsed}
						class:h-auto={!viewQuestionBtnCollapsed}
						class:px-0={viewQuestionBtnCollapsed}
						class:px-4={!viewQuestionBtnCollapsed}
						class:py-2={!viewQuestionBtnCollapsed}
					>
						<span
							class="whitespace-nowrap transition-all duration-300"
							class:opacity-100={!viewQuestionBtnCollapsed}
							class:opacity-0={viewQuestionBtnCollapsed}
							class:w-0={viewQuestionBtnCollapsed}
							class:hidden={viewQuestionBtnCollapsed}
						>
							Ver Pregunta
						</span>
						<div class="flex-shrink-0 relative w-5 h-5 flex items-center justify-center">
							<svg
								width="20"
								height="20"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								class="absolute transition-all duration-300"
								class:rotate-180={!isExplanationCollapsed}
							>
								<path d="M15 18l-6-6 6-6" />
							</svg>
						</div>
					</button>

					<!-- Botón Volver (Siempre accesible en este modo también) -->
					<button
						onclick={handleGoBack}
						class="flex items-center justify-center w-10 h-10 bg-red-500/20 hover:bg-red-500/40 text-red-300 rounded-full border border-red-500/30 shadow-lg backdrop-blur-sm transition-all"
						aria-label="Volver"
					>
						<svg
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
						>
							<path d="M15 19l-7-7 7-7" />
						</svg>
					</button>
				</div>
			{/if}

			<!-- Indicador de Progreso Discreto (siempre visible si está renderizando) -->
			{#if $explanationStore.render.isRendering && renderProgress < 100}
				<div class="absolute top-0 left-0 w-full h-1 bg-slate-800 z-50">
					<div
						class="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)] transition-all duration-300"
						style="width: {renderProgress}%"
					></div>
				</div>
			{/if}
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
				<!-- Indicador de progreso -->
				{#if hasStarted && $explanationStore.render.isRendering}
					<ProgressIndicator stepProgress={$explanationStore.stepProgress} />
				{/if}

				<!-- Panel didactico que se auto ajusta -->
				<div class="flex flex-1 min-h-0 relative overflow-hidden">
					<!-- 
						PIZARRÓN: Ocupa todo el espacio siempre en móvil.
						En Desktop se ajusta si hay panel lateral.
					-->
					<div
						class="flex flex-col min-h-0 bg-slate-900/40 backdrop-blur-sm rounded-xl border border-slate-700/30 transition-all duration-500 relative z-0"
						class:w-full={true}
						class:h-full={true}
						class:lg:mr-4={!isExplanationCollapsed}
						class:lg:flex-[3]={!isExplanationCollapsed}
						class:lg:w-auto={!isExplanationCollapsed}
					>
						<div class="flex-1 w-full h-full overflow-hidden rounded-xl">
							<Pizarron
								commands={currentCanvasCommands}
								currentStep={$explanationStore.currentStep}
								isRendering={$explanationStore.render.isRendering}
							/>
						</div>
					</div>

					<!-- Componentes dinámicos (Overlay en móvil, lateral en desktop si hay espacio) -->
					{#if currentPanelComponentCommands.length > 0}
						<div
							class="absolute inset-0 z-10 pointer-events-none lg:pointer-events-auto lg:static lg:h-full"
						>
							<div class="w-full h-full pointer-events-auto lg:w-auto">
								{#each currentPanelComponentCommands as componentCommand, idx (idx)}
									<ComponentCommandRenderer
										command={componentCommand}
										context="panel"
										onRender={(normalized) =>
											console.log('🧩 ComponentCommandRenderer render:', normalized)}
									/>
								{/each}
							</div>
						</div>
					{/if}

					<!-- 
						EXPLICACIÓN: 
						Móvil: Panel Overlay (Bottom Sheet) 
						Desktop: Columna lateral
					-->
					<div
						class="
							transition-all duration-500 ease-spring
							lg:relative lg:flex lg:flex-col lg:min-h-0 lg:border-none lg:bg-transparent lg:shadow-none
							/* Estilos Móvil (Overlay) */
							fixed inset-x-0 bottom-0 z-20
							bg-slate-950/70 backdrop-blur-md
							border-t border-indigo-500/30 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)]
							pb-safe-area
						"
						class:lg:flex-1={!isExplanationCollapsed}
						class:lg:w-auto={!isExplanationCollapsed}
						class:lg:translate-y-0={true}
						class:lg:opacity-100={!isExplanationCollapsed}
						class:lg:w-0={isExplanationCollapsed}
						class:lg:overflow-hidden={isExplanationCollapsed}
						class:translate-y-full={isExplanationCollapsed}
						class:translate-y-0={!isExplanationCollapsed}
						style="height: {isExplanationCollapsed ? '0' : '65vh'};"
					>
						<!-- Barra de arrastre (Handle) solo móvil -->
						<div
							class="w-full h-6 flex items-center justify-center lg:hidden cursor-grab active:cursor-grabbing border-b border-indigo-500/10 mb-2"
						>
							<div class="w-12 h-1.5 bg-indigo-500/40 rounded-full"></div>
						</div>

						<div class="flex-1 min-h-0 overflow-y-auto px-4 pb-20 lg:pb-0 lg:px-0 scrollbar-hide">
							<CollapsibleSteps
								steps={$explanationStore.steps}
								currentStep={$explanationStore.currentStep}
							/>
						</div>
					</div>

					<!-- Botón flotante para alternar explicación en móvil/desktop -->
					<button
						onclick={toggleExplanationCollapse}
						class="absolute z-30 flex items-center justify-center bg-indigo-600/90 hover:bg-indigo-500 text-white shadow-lg backdrop-blur-sm transition-all duration-300 lg:top-1/2 lg:right-0 lg:-translate-y-1/2 lg:translate-x-1/2 lg:w-8 lg:h-12 lg:rounded-l-lg bottom-24 right-4 w-12 h-12 rounded-full border border-indigo-400/30"
						aria-label={isExplanationCollapsed ? 'Mostrar explicación' : 'Ocultar explicación'}
					>
						<!-- Icono Desktop (Flecha Lateral) -->
						<svg
							class="hidden lg:block w-5 h-5 transition-transform duration-300"
							class:rotate-180={isExplanationCollapsed}
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2.5"
						>
							<path d="M15 18l-6-6 6-6" />
						</svg>

						<!-- Icono Móvil (Libro/Texto) -->
						<svg
							class="lg:hidden w-6 h-6"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
						>
							{#if isExplanationCollapsed}
								<!-- Icono Abrir Libro/Texto -->
								<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
								<path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
							{:else}
								<!-- Icono Cerrar (X o Flecha abajo) -->
								<path d="M18 6L6 18M6 6l12 12" />
							{/if}
						</svg>
					</button>
				</div>
			{/if}
		{/if}
	</div>
</div>

<!-- Controles flotantes en la parte inferior -->
{#if $explanationStore.steps.length > 0}
	<FloatingControls
		onStop={handleStop}
		onToggleVoice={toggleVoice}
		onPauseToggle={handlePauseToggle}
		voiceEnabled={!voiceMuted}
	/>
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
		0%,
		100% {
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

	.protagonist {
		z-index: 20;
	}

	.shadow-indigo-500_10 {
		box-shadow: 0 0 50px rgba(99, 102, 241, 0.15);
	}
</style>
