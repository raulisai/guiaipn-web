/**
 * Cliente HTTP base para comunicarse con el backend Flask
 * Maneja timeout, errores y logging
 */

import { PUBLIC_SOCKET_URL } from '$env/static/public';

export const API_BASE_URL = `${PUBLIC_SOCKET_URL}/api/v1`;
export const DEFAULT_TIMEOUT = 30000; // 30 segundos

/**
 * Realiza una petición HTTP al backend con timeout
 * @param {string} endpoint - Endpoint relativo (ej: '/auth/verify')
 * @param {object} [options] - Opciones de fetch
 * @param {number} [options.timeout] - Timeout en ms (default: 30000)
 * @param {object} [options.headers] - Headers adicionales
 * @param {string} [options.method] - Método HTTP
 * @param {string} [options.body] - Body de la petición
 * @returns {Promise<any>}
 */
export async function request(endpoint, options = {}) {
	const url = `${API_BASE_URL}${endpoint}`;
	const timeout = options.timeout || DEFAULT_TIMEOUT;
	
	// Obtener el origin actual del navegador
	const origin = typeof window !== 'undefined' ? window.location.origin : '';
	
	// Configurar AbortController para timeout
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), timeout);
	
	const config = {
		headers: {
			'Content-Type': 'application/json',
			'Origin': origin,
			...options.headers
		},
		signal: controller.signal,
		...options
	};

	try {
		const startTime = Date.now();
		const response = await fetch(url, config);
		const responseTime = Date.now() - startTime;
		
		clearTimeout(timeoutId);
		
		const data = await response.json();

		if (!response.ok) {
			// Error HTTP (4xx, 5xx)
			const error = {
				type: 'HTTP_ERROR',
				status: response.status,
				message: data.error || 'Error en la petición',
				endpoint,
				responseTime,
				data
			};
			
			console.error(`❌ HTTP Error [${response.status}] en ${endpoint}:`, {
				message: error.message,
				time: `${responseTime}ms`,
				data: error.data
			});
			
			throw error;
		}

		// Log exitoso (solo en desarrollo)
		if (import.meta.env.DEV) {
			console.log(`✅ ${endpoint} - ${responseTime}ms`);
		}

		return data;
	} catch (error) {
		clearTimeout(timeoutId);
		
		// Error de timeout
		if (error.name === 'AbortError') {
			const timeoutError = {
				type: 'TIMEOUT_ERROR',
				message: `La petición excedió el tiempo límite de ${timeout}ms`,
				endpoint,
				timeout
			};
			
			console.error(`⏱️ Timeout en ${endpoint}:`, timeoutError);
			throw timeoutError;
		}
		
		// Error de red (sin conexión, CORS, etc.)
		if (error instanceof TypeError) {
			const networkError = {
				type: 'NETWORK_ERROR',
				message: 'Error de red. Verifica tu conexión a internet.',
				endpoint,
				originalError: error.message
			};
			
			console.error(`🚫 Error de red en ${endpoint}:`, networkError);
			throw networkError;
		}
		
		// Re-lanzar errores HTTP ya formateados
		if (error.type === 'HTTP_ERROR') {
			throw error;
		}
		
		// Error desconocido
		console.error(`⚠️ Error desconocido en ${endpoint}:`, error);
		throw error;
	}
}
