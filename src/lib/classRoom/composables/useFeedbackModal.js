/**
 * Composable para manejo del modal de feedback
 * Gestiona estado y acciones del feedback del usuario
 */

import { goto } from '$app/navigation';
import { socketService } from '$lib/api/socket';
import { explanationStore } from '$lib/stores';
import { syncService } from '$lib/services/syncService';

/**
 * Hook para manejo de feedback modal
 * @returns {Object} Estado y funciones del modal
 */
export function useFeedbackModal() {
	/**
	 * Enviar feedback al backend (opcional)
	 * @param {string} rating - Rating del usuario (bad, neutral, good, excellent)
	 * @param {string} comment - Comentario opcional
	 */
	function submitFeedback(rating, comment) {
		// Log del feedback (aquí podrías enviar al backend)
		console.log('Feedback:', { rating, comment });

		// Limpiar y volver al examen
		cleanup();
		goto('/examen');
	}

	/**
	 * Omitir feedback y volver al examen
	 */
	function skipFeedback() {
		cleanup();
		goto('/examen');
	}

	/**
	 * Limpiar recursos antes de salir
	 */
	function cleanup() {
		// Detener sincronización
		syncService.stop();
		// Desconectar socket
		socketService.disconnect();
		// Resetear store
		explanationStore.reset();
	}

	return {
		submitFeedback,
		skipFeedback
	};
}
