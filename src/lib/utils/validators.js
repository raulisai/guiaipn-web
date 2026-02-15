/**
 * Funciones de validación
 */

import { ANSWER_OPTIONS } from './constants.js';

/**
 * Valida un email
 * @param {string} email
 * @returns {boolean}
 */
export const validateEmail = (email) => {
	const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return regex.test(email);
};

/**
 * Valida una contraseña
 * @param {string} password
 * @returns {boolean}
 */
export const validatePassword = (password) => {
	return password && password.length >= 8;
};

/**
 * Valida una respuesta de examen
 * @param {string} answer
 * @returns {boolean}
 */
export const validateAnswer = (answer) => {
	return ANSWER_OPTIONS.includes(answer?.toLowerCase());
};

/**
 * Valida un nombre completo
 * @param {string} name
 * @returns {boolean}
 */
export const validateFullName = (name) => {
	return name && name.trim().length >= 3;
};

/**
 * Valida un token JWT
 * @param {string} token
 * @returns {boolean}
 */
export const validateToken = (token) => {
	if (!token) return false;
	const parts = token.split('.');
	return parts.length === 3;
};
