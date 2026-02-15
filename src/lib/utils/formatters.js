/**
 * Funciones de formateo
 */

/**
 * Formatea un tiempo en segundos a formato mm:ss
 * @param {number} seconds
 * @returns {string}
 */
export const formatTime = (seconds) => {
	const mins = Math.floor(seconds / 60);
	const secs = seconds % 60;
	return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Formatea un porcentaje
 * @param {number} value - Valor entre 0 y 1
 * @param {number} decimals - Número de decimales
 * @returns {string}
 */
export const formatPercentage = (value, decimals = 0) => {
	return `${(value * 100).toFixed(decimals)}%`;
};

/**
 * Formatea una fecha relativa (ej: "hace 2 horas")
 * @param {Date|string} date
 * @returns {string}
 */
export const formatRelativeTime = (date) => {
	const now = new Date();
	const past = new Date(date);
	const diffMs = now.getTime() - past.getTime();
	const diffSecs = Math.floor(diffMs / 1000);
	const diffMins = Math.floor(diffSecs / 60);
	const diffHours = Math.floor(diffMins / 60);
	const diffDays = Math.floor(diffHours / 24);

	if (diffSecs < 60) return 'hace unos segundos';
	if (diffMins < 60) return `hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
	if (diffHours < 24) return `hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
	if (diffDays < 7) return `hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
	
	return past.toLocaleDateString('es-MX');
};

/**
 * Trunca un texto
 * @param {string} text
 * @param {number} maxLength
 * @returns {string}
 */
export const truncate = (text, maxLength = 100) => {
	if (!text || text.length <= maxLength) return text;
	return text.substring(0, maxLength) + '...';
};

/**
 * Capitaliza la primera letra
 * @param {string} text
 * @returns {string}
 */
export const capitalize = (text) => {
	if (!text) return '';
	return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

/**
 * Formatea un número con separadores de miles
 * @param {number} num
 * @returns {string}
 */
export const formatNumber = (num) => {
	return new Intl.NumberFormat('es-MX').format(num);
};
