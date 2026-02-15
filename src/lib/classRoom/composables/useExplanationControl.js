/**
 * Composable para control de explicación
 * Gestiona inicio, pausa, detención y navegación
 */

import { goto } from '$app/navigation';
import { get } from 'svelte/store';
import { socketService } from '$lib/api/socket';
import { explanationStore } from '$lib/stores';
import { syncService } from '$lib/services/syncService';
import { speechService } from '$lib/services/speechService';

/**
 * Hook para control de explicación
 * @returns {Object} Funciones de control
 */
export function useExplanationControl() {
	/**
	 * Iniciar explicación con datos de pregunta
	 * @param {Object} questionData - Datos de la pregunta
	 */
	function startExplanation(questionData) {
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

	/**
	 * Iniciar renderizado progresivo
	 */
	function startRendering() {
		console.log('▶️ Iniciando explicación...');
		syncService.start();
	}

	/**
	 * Detener explicación y limpiar
	 */
	function stop() {
		// Detener sincronización
		syncService.stop();
		// Desconectar socket
		socketService.disconnect();
		// Resetear store
		explanationStore.reset();
		// Volver al examen
		goto('/examen');
	}

	/**
	 * Reintentar conexión
	 * @param {Function} onRetry - Callback para reintentar
	 */
	function retry(onRetry) {
		if (onRetry) onRetry();
	}

	/**
	 * Volver al examen
	 * @param {Function} onGoBack - Callback antes de volver
	 */
	function goBack(onGoBack) {
		if (onGoBack) {
			onGoBack();
		} else {
			stop();
		}
	}

	/**
	 * Alternar voz (mutear/desmutear)
	 * @param {boolean} enabled - Si la voz está habilitada
	 */
	function toggleVoice(enabled) {
		syncService.toggleVoice(enabled);
		
		if (enabled) {
			console.log('🔊 Voz activada');
		} else {
			console.log('🔇 Voz muteada');
		}
	}

	function buildPauseContext(state) {
		const stepIndex = state.render.currentStepIndex ?? 0;
		const displayStep = state.buffer.steps[stepIndex] || state.steps[stepIndex] || null;
		const renderedStep = state.steps[stepIndex] || null;

		return {
			timestamp: Date.now(),
			stepNumber: state.stepProgress.stepNumber || displayStep?.step || state.currentStep,
			charIndex: state.stepProgress.charIndex ?? 0,
			totalChars: state.stepProgress.totalChars ?? displayStep?.content?.length ?? 0,
			currentContent: renderedStep?.content || '',
			title: displayStep?.title || renderedStep?.title || null
		};
	}

	function pause() {
		const state = get(explanationStore);
		if (state.isPaused) {
			return state.pauseContext || null;
		}

		const context = buildPauseContext(state);
		explanationStore.pauseExplanation();
		explanationStore.savePauseContext(context);
		speechService.pause();
		syncService.pause();
		console.log('⏸️ Explicación pausada en contexto:', context);
		return context;
	}

	function resume() {
		const state = get(explanationStore);
		if (!state.isPaused) {
			return;
		}

		syncService.resume();
		explanationStore.resumeExplanation();
		speechService.resume();
		explanationStore.clearPauseContext();
		console.log('▶️ Explicación reanudada');
	}

	function savePauseContext(context) {
		explanationStore.savePauseContext(context);
	}

	function clearPauseContext() {
		explanationStore.clearPauseContext();
	}

	function getPauseContext() {
		const state = get(explanationStore);
		return state.pauseContext;
	}

	/**
	 * Obtener progreso actual
	 * @returns {number} Progreso en porcentaje (0-100)
	 */
	function getProgress() {
		return syncService.getProgress();
	}

	/**
	 * Limpiar recursos al desmontar
	 */
	function cleanup() {
		syncService.stop();
		if (socketService.isSocketConnected()) {
			socketService.disconnect();
		}
		speechService.stop();
	}

	return {
		startExplanation,
		startRendering,
		stop,
		retry,
		goBack,
		toggleVoice,
		getProgress,
		pause,
		resume,
		savePauseContext,
		clearPauseContext,
		getPauseContext,
		cleanup
	};
}
