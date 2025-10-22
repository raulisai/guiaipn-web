/**
 * Composable para tracking de progreso de renderizado
 * Gestiona intervalos y actualización de progreso
 */

import { syncService } from '$lib/services/syncService';

/**
 * Hook para tracking de progreso
 * @returns {Object} Funciones de tracking
 */
export function useProgressTracking() {
	let progressInterval = null;

	/**
	 * Iniciar tracking de progreso
	 * @param {Function} onUpdate - Callback con el progreso actual (0-100)
	 */
	function startTracking(onUpdate) {
		if (progressInterval) {
			clearInterval(progressInterval);
		}

		progressInterval = setInterval(() => {
			const progress = syncService.getProgress();
			
			if (onUpdate) {
				onUpdate(progress);
			}

			// Detener cuando llegue a 100%
			if (progress >= 100) {
				stopTracking();
			}
		}, 100);
	}

	/**
	 * Detener tracking de progreso
	 */
	function stopTracking() {
		if (progressInterval) {
			clearInterval(progressInterval);
			progressInterval = null;
		}
	}

	/**
	 * Limpiar recursos
	 */
	function cleanup() {
		stopTracking();
	}

	return {
		startTracking,
		stopTracking,
		cleanup
	};
}
