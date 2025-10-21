/**
 * Constantes de eventos Socket.IO
 * Centraliza todos los nombres de eventos para evitar typos
 */

// ==========================================
// EVENTOS DEL CICLO DE VIDA
// ==========================================

export const LIFECYCLE_EVENTS = {
	CONNECT: 'connect',
	DISCONNECT: 'disconnect',
	CONNECTION_ESTABLISHED: 'connection_established',
	ERROR: 'error'
};

// ==========================================
// EVENTOS CLIENTE → SERVIDOR
// ==========================================

export const CLIENT_EVENTS = {
	ASK_QUESTION: 'ask_question',
	START_EXPLANATION: 'start_explanation',
	PAUSE_EXPLANATION: 'pause_explanation',
	RESUME_EXPLANATION: 'resume_explanation',
	ASK_FOLLOW_UP: 'ask_follow_up_question',
	INTERRUPT_EXPLANATION: 'interrupt_explanation'
};

// ==========================================
// EVENTOS SERVIDOR → CLIENTE
// ==========================================

export const SERVER_EVENTS = {
	WAITING_PHRASE: 'waiting_phrase',
	EXPLANATION_START: 'explanation_start',
	STEP_START: 'step_start',
	CONTENT_CHUNK: 'content_chunk',
	CANVAS_COMMAND: 'canvas_command',
	STEP_COMPLETE: 'step_complete',
	EXPLANATION_COMPLETE: 'explanation_complete'
};

// ==========================================
// CÓDIGOS DE ERROR
// ==========================================

export const ERROR_CODES = {
	AUTH_REQUIRED: 'AUTH_REQUIRED',
	AUTH_FAILED: 'AUTH_FAILED',
	INVALID_PAYLOAD: 'INVALID_PAYLOAD',
	VALIDATION_ERROR: 'VALIDATION_ERROR',
	AI_GENERATION_ERROR: 'AI_GENERATION_ERROR',
	SESSION_NOT_FOUND: 'SESSION_NOT_FOUND',
	PROCESSING_ERROR: 'PROCESSING_ERROR',
	NO_SESSION: 'NO_SESSION',
	PAUSE_ERROR: 'PAUSE_ERROR',
	RESUME_ERROR: 'RESUME_ERROR'
};

// ==========================================
// TIPOS DE PASO
// ==========================================

export const STEP_TYPES = {
	TEXT: 'text',
	MATH: 'math',
	IMAGE: 'image'
};

// ==========================================
// COMANDOS DE CANVAS
// ==========================================

export const CANVAS_COMMANDS = {
	DRAW_EQUATION: 'draw_equation',
	DRAW_DIAGRAM: 'draw_diagram',
	DRAW_LINE: 'draw_line',
	DRAW_ARROW: 'draw_arrow',
	CLEAR: 'clear',
	HIGHLIGHT: 'highlight'
};

// ==========================================
// ESTADOS DE CONEXIÓN
// ==========================================

export const CONNECTION_STATES = {
	DISCONNECTED: 'disconnected',
	CONNECTING: 'connecting',
	CONNECTED: 'connected',
	RECONNECTING: 'reconnecting',
	ERROR: 'error'
};

// ==========================================
// FRASES DE ESPERA (ejemplos)
// ==========================================

export const WAITING_PHRASES = [
	'Analizando tu pregunta...',
	'Consultando la base de conocimiento...',
	'Preparando una explicación detallada...',
	'Organizando los pasos de la solución...',
	'Déjame pensar un momento...'
];
