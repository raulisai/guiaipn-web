/**
 * API de Preguntas
 * Endpoints relacionados con preguntas de examen
 */

import { request } from '../client.js';

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
	},

	/**
	 * Obtiene múltiples preguntas con paginación
	 * @param {string} token - JWT token
	 * @param {number} page - Número de página (default: 1)
	 * @param {number} limit - Límite de preguntas (default: 20)
	 */
	getQuestions: async (token, page = 1, limit = 20, subject = '') => {
		const params = new URLSearchParams({
			page: String(page),
			limit: String(limit)
		});

		if (subject) {
			params.append('subject', subject);
		}

		return request(`/questions/?${params.toString()}`, {
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${token}`
			}
		});
	},

	/**
	 * Envía el examen para su calificación
	 * @param {string} token - JWT token (opcional si se maneja cookie)
	 * @param {Array} answers - Lista de respuestas {question_id, user_answer}
	 * @param {string} userId - ID del usuario
	 */
	submitExam: async (token, answers, userId) => {
		return request('/questions/exam/submit', {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${token}`
			},
			body: JSON.stringify({ answers, userId })
		});
	},

	/**
	 * Obtiene las estadísticas del usuario
	 * @param {string} token - JWT token
	 * @param {string} userId - ID del usuario
	 */
	getUserStats: async (token, userId) => {
		return request(`/stats/user?userId=${userId}`, {
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${token}`
			}
		});
	}
};
