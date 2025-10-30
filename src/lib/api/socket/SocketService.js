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
		this.externalListeners = new Map(); // Listeners externos registrados antes de conectar
		this.lastPausePayload = null;
		this.lastResumePayload = null;
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

			// Registrar listeners externos que fueron configurados antes de conectar
			this.registerExternalListeners();

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

				// Llamar a listeners externos registrados
				const externalCallback = this.externalListeners.get('connection_established');
				if (externalCallback) {
					externalCallback(data);
				}

				resolve(data);
			});

			this.socket.on('error', (error) => {
				console.error('🚫 Error de Socket.IO:', error);
				if (error?.code === 'RESUME_ERROR' && this.lastResumePayload) {
					console.error('ℹ️ Último payload enviado en resume_explanation:', this.lastResumePayload);
				}
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
			this.externalListeners.clear(); // Limpiar listeners externos

			// Limpiar localStorage
			if (browser) {
				localStorage.removeItem('socket_session_id');
			}
		}
	}

	/**
	 * Registra todos los listeners externos guardados en el socket
	 * Se llama después de crear el socket
	 */
	registerExternalListeners() {
		if (!this.socket) return;

		// Mapeo de eventos a métodos de registro
		const eventMap = {
			'waiting_phrase': (cb) => {
				const listener = (data) => {
					console.log('⏳ Frase de espera:', data.message);
					cb(data);
				};
				this.socket.on('waiting_phrase', listener);
				this.listeners.set('waiting_phrase', listener);
			},
			'explanation_start': (cb) => {
				const listener = (data) => {
					console.log('🎬 Explicación iniciada:', data);
					cb(data);
				};
				this.socket.on('explanation_start', listener);
				this.listeners.set('explanation_start', listener);
			},
			'step_start': (cb) => {
				const listener = (data) => {
					console.log(`📝 Paso ${data.step_number} iniciado:`, data.title);
					cb(data);
				};
				this.socket.on('step_start', listener);
				this.listeners.set('step_start', listener);
			},
			'content_chunk': (cb) => {
				const listener = (data) => cb(data);
				this.socket.on('content_chunk', listener);
				this.listeners.set('content_chunk', listener);
			},
			'canvas_command': (cb) => {
				const listener = (data) => {
					console.log('🎨 Comando de canvas:', data.command);
					cb(data);
				};
				this.socket.on('canvas_command', listener);
				this.listeners.set('canvas_command', listener);
			},
			'component_command': (cb) => {
				const listener = (data) => {
					console.log('🧩 Comando de componente:', data);
					cb(data);
				};
				this.socket.on('component_command', listener);
				this.listeners.set('component_command', listener);
			},
			'step_complete': (cb) => {
				const listener = (data) => {
					console.log(`✅ Paso ${data.step_number} completado`);
					cb(data);
				};
				this.socket.on('step_complete', listener);
				this.listeners.set('step_complete', listener);
			},
			'explanation_complete': (cb) => {
				const listener = (data) => {
					console.log('🎉 Explicación completada:', data);
					cb(data);
				};
				this.socket.on('explanation_complete', listener);
				this.listeners.set('explanation_complete', listener);
			},
			'explanation_paused': (cb) => {
				const listener = (data) => {
					console.log('⏸️ Explicación pausada por servidor:', data);
					cb(data);
				};
				this.socket.on('explanation_paused', listener);
				this.listeners.set('explanation_paused', listener);
			},
			'clarification_message': (cb) => {
				const listener = (data) => {
					console.log('💬 Clarification message recibido:', data);
					cb(data);
				};
				this.socket.on('clarification_message', listener);
				this.listeners.set('clarification_message', listener);
			},
			'error': (cb) => {
				const listener = (error) => {
					console.error('🚫 Error del servidor:', error);
					cb(error);
				};
				this.socket.on('error', listener);
				this.listeners.set('error', listener);
			}
		};

		// Registrar todos los listeners externos guardados
		for (const [eventName, callback] of this.externalListeners.entries()) {
			if (eventName !== 'connection_established' && eventMap[eventName]) {
				eventMap[eventName](callback);
			}
		}

		// Si ya existe un listener externo para component_command, engancharlo inmediatamente
		const componentCallback = this.externalListeners.get('component_command');
		if (componentCallback && !this.listeners.has('component_command')) {
			const listener = (data) => {
				console.log('🧩 Comando de componente:', data);
				componentCallback(data);
			};
			this.socket.on('component_command', listener);
			this.listeners.set('component_command', listener);
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
	 * Obtiene el session ID actual
	 * @returns {string|null}
	 */
	getSessionId() {
		return this.sessionId;
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
	emitPauseExplanation(currentStep = null, positionInStep = 0) {
		if (!this.isSocketConnected()) {
			console.error('❌ Socket no conectado');
			return;
		}

		if (!this.token) {
			console.error('❌ Token no disponible');
			return;
		}

		console.warn('⚠️ emitPauseExplanation omitido: endpoint backend no disponible');
		return;

		const payload = {
			token: this.token
		};

		if (typeof currentStep === 'number' && currentStep > 0) {
			payload.current_step = currentStep;
			payload.position_in_step = positionInStep ?? 0;
		}

		this.lastPausePayload = payload;
		console.log('⏸️ Pausando explicación', payload);
		this.socket.emit('pause_explanation', payload);
	}

	/**
	 * Reanuda la explicación pausada
	 * @param {number|null} currentStep - Paso en el que se reanuda
	 * @param {number} positionInStep - Índice dentro del paso
	 */
	emitResumeExplanation(currentStep = null, positionInStep = 0) {
		if (!this.isSocketConnected()) {
			console.error('❌ Socket no conectado');
			return;
		}

		if (!this.token) {
			console.error('❌ Token no disponible');
			return;
		}

		console.warn('⚠️ emitResumeExplanation omitido: endpoint backend no disponible');
		return;

		let resumeStep = currentStep;
		let resumePosition = positionInStep;

		if (!(typeof resumeStep === 'number' && resumeStep > 0) && this.lastPausePayload) {
			resumeStep = this.lastPausePayload.current_step ?? resumeStep;
			resumePosition = this.lastPausePayload.position_in_step ?? resumePosition;
		}

		const payload = {
			token: this.token
		};

		if (typeof resumeStep === 'number' && resumeStep > 0) {
			payload.current_step = resumeStep;
			payload.position_in_step = resumePosition ?? 0;
		}

		console.log('▶️ Reanudando explicación', payload);
		this.lastResumePayload = payload;
		this.socket.emit('resume_explanation', payload);
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
	 * Interrumpe la explicación para hacer una aclaración breve
	 * @param {string} clarificationQuestion - Pregunta de aclaración
	 * @param {Object} currentContext - Contexto actual { original_question, current_step, topic }
	 * @param {('brief'|'detailed')} responseMode - Modo de respuesta (por defecto 'brief')
	 * @param {string|null} sessionId - Session ID de la explicación (opcional)
	 */
	emitInterruptExplanation(clarificationQuestion, currentContext = {}, responseMode = 'brief', sessionId = null) {
		if (!this.isSocketConnected()) {
			console.error('❌ Socket no conectado');
			return;
		}

		if (!this.token) {
			console.error('❌ Token no disponible');
			return;
		}

		if (!clarificationQuestion || typeof clarificationQuestion !== 'string') {
			console.warn('⚠️ clarification_question inválida, omitiendo emisión');
			return;
		}

		const payload = {
			token: this.token,
			clarification_question: clarificationQuestion,
			current_context: {
				original_question: currentContext?.original_question ?? null,
				current_step: currentContext?.current_step ?? null,
				topic: currentContext?.topic ?? null
			},
			response_mode: responseMode
		};

		if (sessionId) {
			payload.session_id = sessionId;
		}

		console.log('✋ Interrumpiendo explicación con payload:', payload);
		this.socket.emit('interrupt_explanation', payload);
	}

	/**
	 * Escucha cuando la explicación queda pausada desde el servidor
	 * @param {Function} callback - Función a ejecutar
	 */
	onExplanationPaused(callback) {
		this.externalListeners.set('explanation_paused', callback);

		if (this.socket) {
			const listener = (data) => {
				console.log('⏸️ Explicación pausada (listener directo):', data);
				callback(data);
			};
			this.socket.on('explanation_paused', listener);
			this.listeners.set('explanation_paused', listener);
		}
	}

	// ==========================================
	// LISTENERS DE EVENTOS (Servidor → Cliente)
	// ==========================================

	/**
	 * Escucha el evento de conexión establecida
	 * @param {Function} callback - Función a ejecutar
	 */
	onConnectionEstablished(callback) {
		// Guardar callback para que se llame cuando se reciba el evento
		this.externalListeners.set('connection_established', callback);

		// Si ya está conectado y tiene sessionId, llamar inmediatamente
		if (this.isConnected && this.sessionId) {
			callback({ session_id: this.sessionId });
		}
	}

	/**
	 * Escucha frases de espera
	 * @param {Function} callback - Función a ejecutar
	 */
	onWaitingPhrase(callback) {
		this.externalListeners.set('waiting_phrase', callback);
		
		if (this.socket) {
			const listener = (data) => {
				console.log('⏳ Frase de espera:', data.message);
				callback(data);
			};
			this.socket.on('waiting_phrase', listener);
			this.listeners.set('waiting_phrase', listener);
		}
	}

	/**
	 * Escucha el inicio de una explicación
	 * @param {Function} callback - Función a ejecutar
	 */
	onExplanationStart(callback) {
		this.externalListeners.set('explanation_start', callback);
		
		if (this.socket) {
			const listener = (data) => {
				console.log('🎬 Explicación iniciada:', data);
				callback(data);
			};
			this.socket.on('explanation_start', listener);
			this.listeners.set('explanation_start', listener);
		}
	}

	/**
	 * Escucha el inicio de un paso
	 * @param {Function} callback - Función a ejecutar
	 */
	onStepStart(callback) {
		this.externalListeners.set('step_start', callback);
		
		if (this.socket) {
			const listener = (data) => {
				console.log(`📝 Paso ${data.step_number} iniciado:`, data.title);
				callback(data);
			};
			this.socket.on('step_start', listener);
			this.listeners.set('step_start', listener);
		}
	}

	/**
	 * Escucha chunks de contenido (streaming)
	 * @param {Function} callback - Función a ejecutar
	 */
	onContentChunk(callback) {
		this.externalListeners.set('content_chunk', callback);
		
		if (this.socket) {
			const listener = (data) => {
				callback(data);
			};
			this.socket.on('content_chunk', listener);
			this.listeners.set('content_chunk', listener);
		}
	}

	/**
	 * Escucha comandos para el canvas/pizarrón
	 * @param {Function} callback - Función a ejecutar
	 */
	onCanvasCommand(callback) {
		this.externalListeners.set('canvas_command', callback);
		
		if (this.socket) {
			const listener = (data) => {
				console.log('🎨 Comando de canvas:', data.command);
				callback(data);
			};
			this.socket.on('canvas_command', listener);
			this.listeners.set('canvas_command', listener);
		}
	}

	/**
	 * Escucha comandos para componentes interactivos
	 * @param {Function} callback - Función a ejecutar
	 */
	onComponentCommand(callback) {
		this.externalListeners.set('component_command', callback);
		
		if (this.socket) {
			const listener = (data) => {
				console.log('🧩 Comando de componente:', data.command);
				callback(data);
			};
			this.socket.on('component_command', listener);
			this.listeners.set('component_command', listener);
		}
	}

	/**
	 * Escucha la finalización de un paso
	 * @param {Function} callback - Función a ejecutar
	 */
	onStepComplete(callback) {
		this.externalListeners.set('step_complete', callback);
		
		if (this.socket) {
			const listener = (data) => {
				console.log(`✅ Paso ${data.step_number} completado`);
				callback(data);
			};
			this.socket.on('step_complete', listener);
			this.listeners.set('step_complete', listener);
		}
	}

	/**
	 * Escucha la finalización de la explicación completa
	 * @param {Function} callback - Función a ejecutar
	 */
	onExplanationComplete(callback) {
		this.externalListeners.set('explanation_complete', callback);
		
		if (this.socket) {
			const listener = (data) => {
				console.log('🎉 Explicación completada:', data);
				callback(data);
			};
			this.socket.on('explanation_complete', listener);
			this.listeners.set('explanation_complete', listener);
		}
	}

	/**
	 * Escucha mensajes de aclaración breve
	 * @param {Function} callback - Función a ejecutar con el payload breve
	 */
	onClarificationMessage(callback) {
		this.externalListeners.set('clarification_message', callback);

		if (this.socket) {
			const listener = (data) => {
				console.log('💬 Clarification message recibido:', data);
				callback(data);
			};
			this.socket.on('clarification_message', listener);
			this.listeners.set('clarification_message', listener);
		}
	}

	/**
	 * Escucha errores del servidor
	 * @param {Function} callback - Función a ejecutar
	 */
	onError(callback) {
		this.externalListeners.set('error', callback);
		
		if (this.socket) {
			const listener = (error) => {
				console.error('🚫 Error del servidor:', error);
				callback(error);
			};
			this.socket.on('error', listener);
			this.listeners.set('error', listener);
		}
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
