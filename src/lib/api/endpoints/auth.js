/**
 * API de Autenticación
 * Endpoints relacionados con auth, perfiles y sesiones de usuario
 */

import { request } from '../client.js';

export const authAPI = {
	/**
	 * Verifica un token JWT de Supabase
	 * @param {string} token - JWT token de Supabase
	 */
	verify: async (token) => {
		return request('/auth/verify', {
			method: 'POST',
			body: JSON.stringify({ token })
		});
	},

	/**
	 * Inicializa el perfil de un nuevo usuario
	 * Crea el perfil en la base de datos y inicializa el progreso para 8 materias
	 * @param {string} token - JWT token de Supabase
	 */
	initialize: async (token) => {
		return request('/auth/initialize', {
			method: 'POST',
			body: JSON.stringify({ token })
		});
	},

	/**
	 * Obtiene el perfil completo del usuario
	 * @param {string} token - JWT token de Supabase
	 */
	getProfile: async (token) => {
		return request('/auth/profile', {
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${token}`
			}
		});
	}
};
