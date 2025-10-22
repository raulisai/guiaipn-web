/**
 * Composable para control de explicación
 * Gestiona inicio, pausa, detención y navegación
 */

import { goto } from '$app/navigation';
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
		cleanup
	};
}
