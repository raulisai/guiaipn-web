/**
 * Punto de entrada principal para la API
 * Re-exporta el cliente y todos los endpoints
 */

// Cliente HTTP
export { request, API_BASE_URL, DEFAULT_TIMEOUT } from './client.js';

// Endpoints
export * from './endpoints/index.js';

// Re-exporta Socket.IO
export * from './socket/index.js';
