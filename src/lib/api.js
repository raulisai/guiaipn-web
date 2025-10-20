/**
 * Cliente HTTP para comunicarse con el backend Flask
 * Base URL: http://localhost:5000/api/v1
 */

import { PUBLIC_SOCKET_URL } from '$env/static/public';

const API_BASE_URL = `${PUBLIC_SOCKET_URL}/api/v1`;

/**
 * Realiza una petición HTTP al backend
 * @param {string} endpoint - Endpoint relativo (ej: '/auth/verify')
 * @param {object} options - Opciones de fetch
 * @returns {Promise<any>}
 */
async function request(endpoint, options = {}) {
	const url = `${API_BASE_URL}${endpoint}`;
	
	// Obtener el origin actual del navegador
	const origin = typeof window !== 'undefined' ? window.location.origin : '';
	
	const config = {
		headers: {
			'Content-Type': 'application/json',
			'Origin': origin,
			...options.headers
		},
		...options
	};

	try {
		const response = await fetch(url, config);
		const data = await response.json();

		if (!response.ok) {
			throw {
				status: response.status,
				message: data.error || 'Error en la petición',
				data
			};
		}

		return data;
	} catch (error) {
		console.error(`Error en petición a ${endpoint}:`, error);
		throw error;
	}
}

/**
 * API de Autenticación
 */
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

/**
 * API de Preguntas
 */
export const questionsAPI = {
	/**
	 * Obtiene una pregunta aleatoria
	 * @param {string} token - JWT token
	 * @param {string} subject - Materia (matematicas, fisica, etc.)
	 * @param {string} difficulty - Dificultad (easy, medium, hard)
	 */
	getRandom: async (token, subject = 'matematicas', difficulty = 'medium') => {
		return request(`/questions/random?subject=${subject}&difficulty=${difficulty}`, {
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${token}`
			}
		});
	},

	/**
	 * Valida una respuesta
	 * @param {string} token - JWT token
	 * @param {string} questionId - ID de la pregunta
	 * @param {string} userAnswer - Respuesta del usuario (a, b, c, d)
	 */
	answer: async (token, questionId, userAnswer) => {
		return request(`/questions/${questionId}/answer`, {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${token}`
			},
			body: JSON.stringify({ user_answer: userAnswer })
		});
	},

	/**
	 * Obtiene una pregunta específica
	 * @param {string} token - JWT token
	 * @param {string} questionId - ID de la pregunta
	 */
	getById: async (token, questionId) => {
		return request(`/questions/${questionId}`, {
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${token}`
			}
		});
	}
};

/**
 * API de Sesiones
 */
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
