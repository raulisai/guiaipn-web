/**
 * Socket.IO Service
 * Maneja la conexión WebSocket con el backend Flask para explicaciones en tiempo real
 */

import { io } from 'socket.io-client';
import { browser } from '$app/environment';

// URL del servidor Socket.IO (desde variables de entorno)
const SOCKET_URL = import.meta.env.PUBLIC_SOCKET_URL || 'http://localhost:5000';

// Configuración de reconexión
const RECONNECTION_CONFIG = {
	reconnection: true,
	reconnectionDelay: 1000,
	reconnectionDelayMax: 5000,
	reconnectionAttempts: 5
};

/**
 * Clase SocketService
 * Singleton para manejar la conexión Socket.IO
 */
class SocketService {
	constructor() {
		this.socket = null;
		this.sessionId = null;
		this.isConnected = false;
		this.listeners = new Map(); // Guardar referencias de listeners
		this.token = null; // Guardar token JWT para incluirlo en eventos
	}

	/**
	 * Conecta al servidor Socket.IO
	 * @param {string} token - JWT token de Supabase
	 * @returns {Promise<void>}
	 */
	connect(token) {
		return new Promise((resolve, reject) => {
			if (!browser) {
				reject(new Error('Socket.IO solo funciona en el navegador'));
				return;
			}

			if (!token) {
				reject(new Error('Token JWT requerido para conectar'));
				return;
			}

			// Si ya está conectado, resolver inmediatamente
			if (this.socket?.connected) {
				console.log('✅ Socket ya conectado');
				resolve();
				return;
			}

			// Guardar token para usarlo en eventos
			this.token = token;

			// Logging del token
			console.log('🔐 Conectando con token:', {
				tokenLength: token.length,
				tokenPreview: token.substring(0, 50) + '...',
				socketUrl: SOCKET_URL
			});

			// Crear nueva conexión
			this.socket = io(SOCKET_URL, {
				auth: { token },
				transports: ['websocket'],
				...RECONNECTION_CONFIG
			});

			// Event listeners básicos
			this.socket.on('connect', () => {
				console.log('✅ Conectado al servidor Socket.IO');
				console.log('📡 Socket ID:', this.socket.id);
				this.isConnected = true;
			});

			this.socket.on('disconnect', (reason) => {
				console.log('❌ Desconectado del servidor:', reason);
				this.isConnected = false;
				this.sessionId = null;

				if (reason === 'io server disconnect') {
					console.warn('⚠️ Servidor forzó la desconexión (posible token inválido)');
				}
			});

			this.socket.on('connection_established', (data) => {
				console.log('🎉 Sesión establecida:', data);
				this.sessionId = data.session_id;

				// Guardar en localStorage para persistencia
				if (browser) {
					localStorage.setItem('socket_session_id', data.session_id);
				}

				resolve(data);
			});

			this.socket.on('error', (error) => {
				console.error('🚫 Error de Socket.IO:', error);
				this.handleError(error);
				reject(error);
			});

			// Timeout de conexión (10 segundos)
			setTimeout(() => {
				if (!this.isConnected) {
					reject(new Error('Timeout: No se pudo conectar al servidor'));
				}
			}, 10000);
		});
	}

	/**
	 * Desconecta del servidor
	 */
	disconnect() {
		if (this.socket) {
			console.log('🔌 Desconectando Socket.IO...');
			this.socket.removeAllListeners();
			this.socket.disconnect();
			this.socket = null;
			this.sessionId = null;
			this.isConnected = false;
			this.token = null; // Limpiar token
			this.listeners.clear();

			// Limpiar localStorage
			if (browser) {
				localStorage.removeItem('socket_session_id');
			}
		}
	}

	/**
	 * Obtiene la instancia del socket
	 * @returns {Object|null}
	 */
	getSocket() {
		return this.socket;
	}

	/**
	 * Verifica si está conectado
	 * @returns {boolean}
	 */
	isSocketConnected() {
		return this.socket?.connected || false;
	}

	/**
	 * Maneja errores del servidor
	 * @param {Object} error - Error del servidor
	 */
	handleError(error) {
		const errorHandlers = {
			AUTH_REQUIRED: () => {
				console.error('❌ Token no proporcionado');
				// NO redirigir automáticamente - dejar que el componente maneje
			},
			AUTH_FAILED: () => {
				console.error('❌ Autenticación fallida - Token inválido o expirado');
				// NO redirigir automáticamente - dejar que el componente maneje
			},
			VALIDATION_ERROR: () => {
				console.error('❌ Error de validación:', error.message);
			},
			AI_GENERATION_ERROR: () => {
				console.error('❌ Error generando respuesta IA');
			},
			SESSION_NOT_FOUND: () => {
				console.error('❌ Sesión no encontrada');
			},
			default: () => {
				console.error('❌ Error desconocido:', error);
			}
		};

		const handler = errorHandlers[error.code] || errorHandlers.default;
		handler();
	}

	// ==========================================
	// EMISIÓN DE EVENTOS (Cliente → Servidor)
	// ==========================================

	/**
	 * Envía una pregunta libre al profesor IA
	 * @param {string} question - Pregunta del usuario
	 * @param {Object} context - Contexto adicional (materia, dificultad, etc.)
	 * @param {string} userId - ID del usuario (opcional, se extrae del token si no se proporciona)
	 */
	emitAskQuestion(question, context = {}, userId = null) {
		if (!this.isSocketConnected()) {
			console.error('❌ Socket no conectado');
			return;
		}

		if (!this.token) {
			console.error('❌ Token no disponible');
			return;
		}

		console.log('📤 Enviando pregunta:', question);
		
		const payload = {
			token: this.token,
			question,
			context
		};

		// Incluir user_id si se proporciona explícitamente
		if (userId) {
			payload.user_id = userId;
		}

		this.socket.emit('ask_question', payload);
	}

	/**
	 * Solicita explicación de una pregunta de examen
	 * @param {Object} questionData - Datos de la pregunta
	 */
	emitStartExplanation(questionData) {
		if (!this.isSocketConnected()) {
			console.error('❌ Socket no conectado');
			return;
		}

		if (!this.token) {
			console.error('❌ Token no disponible');
			return;
		}

		console.log('📤 Solicitando explicación:', questionData);
		this.socket.emit('start_explanation', {
			token: this.token,
			question_id: questionData.id,
			question_text: questionData.pregunta,
			correct_answer: questionData.resuesta,
			user_answer: questionData.userAnswer,
			options: questionData.opciones
		});
	}

	/**
	 * Pausa la explicación actual
	 * @param {number} currentStep - Paso actual
	 * @param {number} positionInStep - Posición en el paso
	 */
	emitPauseExplanation(currentStep, positionInStep = 0) {
		if (!this.isSocketConnected()) {
			console.error('❌ Socket no conectado');
			return;
		}

		if (!this.token) {
			console.error('❌ Token no disponible');
			return;
		}

		console.log('⏸️ Pausando explicación');
		this.socket.emit('pause_explanation', {
			token: this.token,
			current_step: currentStep,
			position_in_step: positionInStep
		});
	}

	/**
	 * Reanuda la explicación pausada
	 */
	emitResumeExplanation() {
		if (!this.isSocketConnected()) {
			console.error('❌ Socket no conectado');
			return;
		}

		if (!this.token) {
			console.error('❌ Token no disponible');
			return;
		}

		console.log('▶️ Reanudando explicación');
		this.socket.emit('resume_explanation', {
			token: this.token
		});
	}

	/**
	 * Hace una pregunta de seguimiento durante la explicación
	 * @param {string} question - Pregunta de seguimiento
	 * @param {Object} previousContext - Contexto de la explicación anterior
	 */
	emitAskFollowUp(question, previousContext = {}) {
		if (!this.isSocketConnected()) {
			console.error('❌ Socket no conectado');
			return;
		}

		if (!this.token) {
			console.error('❌ Token no disponible');
			return;
		}

		console.log('📤 Pregunta de seguimiento:', question);
		this.socket.emit('ask_follow_up_question', {
			token: this.token,
			question,
			context: previousContext
		});
	}

	/**
	 * Interrumpe la explicación para hacer una aclaración
	 * @param {string} question - Pregunta de interrupción
	 */
	emitInterruptExplanation(question) {
		if (!this.isSocketConnected()) {
			console.error('❌ Socket no conectado');
			return;
		}

		if (!this.token) {
			console.error('❌ Token no disponible');
			return;
		}

		console.log('✋ Interrumpiendo explicación:', question);
		this.socket.emit('interrupt_explanation', {
			token: this.token,
			question
		});
	}

	// ==========================================
	// LISTENERS DE EVENTOS (Servidor → Cliente)
	// ==========================================

	/**
	 * Escucha el evento de conexión establecida
	 * @param {Function} callback - Función a ejecutar
	 */
	onConnectionEstablished(callback) {
		if (!this.socket) return;

		const listener = (data) => {
			console.log('📥 Conexión establecida:', data);
			callback(data);
		};

		this.socket.on('connection_established', listener);
		this.listeners.set('connection_established', listener);
	}

	/**
	 * Escucha frases de espera
	 * @param {Function} callback - Función a ejecutar
	 */
	onWaitingPhrase(callback) {
		if (!this.socket) return;

		const listener = (data) => {
			console.log('⏳ Frase de espera:', data.message);
			callback(data);
		};

		this.socket.on('waiting_phrase', listener);
		this.listeners.set('waiting_phrase', listener);
	}

	/**
	 * Escucha el inicio de una explicación
	 * @param {Function} callback - Función a ejecutar
	 */
	onExplanationStart(callback) {
		if (!this.socket) return;

		const listener = (data) => {
			console.log('🎬 Explicación iniciada:', data);
			callback(data);
		};

		this.socket.on('explanation_start', listener);
		this.listeners.set('explanation_start', listener);
	}

	/**
	 * Escucha el inicio de un paso
	 * @param {Function} callback - Función a ejecutar
	 */
	onStepStart(callback) {
		if (!this.socket) return;

		const listener = (data) => {
			console.log(`📝 Paso ${data.step} iniciado:`, data.title);
			callback(data);
		};

		this.socket.on('step_start', listener);
		this.listeners.set('step_start', listener);
	}

	/**
	 * Escucha chunks de contenido (streaming)
	 * @param {Function} callback - Función a ejecutar
	 */
	onContentChunk(callback) {
		if (!this.socket) return;

		const listener = (data) => {
			callback(data);
		};

		this.socket.on('content_chunk', listener);
		this.listeners.set('content_chunk', listener);
	}

	/**
	 * Escucha comandos para el canvas/pizarrón
	 * @param {Function} callback - Función a ejecutar
	 */
	onCanvasCommand(callback) {
		if (!this.socket) return;

		const listener = (data) => {
			console.log('🎨 Comando de canvas:', data.command);
			callback(data);
		};

		this.socket.on('canvas_command', listener);
		this.listeners.set('canvas_command', listener);
	}

	/**
	 * Escucha la finalización de un paso
	 * @param {Function} callback - Función a ejecutar
	 */
	onStepComplete(callback) {
		if (!this.socket) return;

		const listener = (data) => {
			console.log(`✅ Paso ${data.step} completado`);
			callback(data);
		};

		this.socket.on('step_complete', listener);
		this.listeners.set('step_complete', listener);
	}

	/**
	 * Escucha la finalización de la explicación completa
	 * @param {Function} callback - Función a ejecutar
	 */
	onExplanationComplete(callback) {
		if (!this.socket) return;

		const listener = (data) => {
			console.log('🎉 Explicación completada:', data);
			callback(data);
		};

		this.socket.on('explanation_complete', listener);
		this.listeners.set('explanation_complete', listener);
	}

	/**
	 * Escucha errores del servidor
	 * @param {Function} callback - Función a ejecutar
	 */
	onError(callback) {
		if (!this.socket) return;

		const listener = (error) => {
			console.error('🚫 Error del servidor:', error);
			callback(error);
		};

		this.socket.on('error', listener);
		this.listeners.set('error', listener);
	}

	/**
	 * Remueve un listener específico
	 * @param {string} eventName - Nombre del evento
	 */
	removeListener(eventName) {
		if (this.socket && this.listeners.has(eventName)) {
			const listener = this.listeners.get(eventName);
			this.socket.off(eventName, listener);
			this.listeners.delete(eventName);
		}
	}

	/**
	 * Remueve todos los listeners
	 */
	removeAllListeners() {
		if (this.socket) {
			this.socket.removeAllListeners();
			this.listeners.clear();
		}
	}
}

// Exportar instancia singleton
export const socketService = new SocketService();

// Exportar clase para testing
export { SocketService };
