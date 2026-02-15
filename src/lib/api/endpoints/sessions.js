/**
 * API de Sesiones
 * Endpoints relacionados con sesiones de Socket.IO
 */

import { request } from '../client.js';

export const sessionsAPI = {
	/**
	 * Obtiene una sesión específica
	 * @param {string} token - JWT token
	 * @param {string} sessionId - ID de la sesión
	 */
	getById: async (token, sessionId) => {
		return request(`/sessions/${sessionId}`, {
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${token}`
			}
		});
	}
};

/**
 * Health Check
 */
export const healthAPI = {
	/**
	 * Verifica el estado del servicio
	 */
	check: async () => {
		return request('/health', {
			method: 'GET'
		});
	}
};
