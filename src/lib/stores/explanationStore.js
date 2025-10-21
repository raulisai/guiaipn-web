/**
 * Explanation Store
 * Maneja el estado de las explicaciones con IA en tiempo real
 */

import { writable, derived } from 'svelte/store';

// Estado de la explicación
function createExplanationStore() {
	const { subscribe, set, update } = writable({
		// Estado de conexión
		isConnected: false,
		sessionId: null,
		connectionError: null,

		// Estado de la explicación actual
		isExplaining: false,
		isPaused: false,
		isLoading: false,
		waitingMessage: null,

		// Metadata de la explicación
		totalSteps: 0,
		currentStep: 0,
		estimatedDuration: 0,
		questionHash: null,

		// Contenido de los pasos
		steps: [], // Array de { step, title, type, content, isComplete }

		// Comandos del canvas
		canvasCommands: [],

		// Errores
		error: null,

		// Pregunta actual
		currentQuestion: null
	});

	return {
		subscribe,

		// ==========================================
		// ACCIONES DE CONEXIÓN
		// ==========================================

		/**
		 * Marca la conexión como establecida
		 * @param {string} sessionId - ID de la sesión
		 */
		setConnected(sessionId) {
			update((state) => ({
				...state,
				isConnected: true,
				sessionId,
				connectionError: null
			}));
		},

		/**
		 * Marca la conexión como desconectada
		 */
		setDisconnected() {
			update((state) => ({
				...state,
				isConnected: false,
				sessionId: null
			}));
		},

		/**
		 * Establece un error de conexión
		 * @param {Object} error - Error de conexión
		 */
		setConnectionError(error) {
			update((state) => ({
				...state,
				connectionError: error,
				isConnected: false
			}));
		},

		// ==========================================
		// ACCIONES DE EXPLICACIÓN
		// ==========================================

		/**
		 * Muestra un mensaje de espera
		 * @param {string} message - Mensaje de espera
		 */
		setWaitingMessage(message) {
			update((state) => ({
				...state,
				isLoading: true,
				waitingMessage: message
			}));
		},

		/**
		 * Inicia una nueva explicación
		 * @param {Object} data - Datos de inicio
		 */
		startExplanation(data) {
			update((state) => ({
				...state,
				isExplaining: true,
				isLoading: false,
				isPaused: false,
				waitingMessage: null,
				totalSteps: data.total_steps,
				currentStep: 0,
				estimatedDuration: data.estimated_duration,
				questionHash: data.question_hash,
				steps: [],
				canvasCommands: [],
				error: null
			}));
		},

		/**
		 * Inicia un nuevo paso
		 * @param {Object} data - Datos del paso
		 */
		startStep(data) {
			update((state) => {
				const newStep = {
					step: data.step,
					title: data.title,
					type: data.type,
					content: '',
					isComplete: false
				};

				return {
					...state,
					currentStep: data.step,
					steps: [...state.steps, newStep]
				};
			});
		},

		/**
		 * Agrega contenido a un paso (streaming)
		 * @param {Object} data - Chunk de contenido
		 */
		addContentChunk(data) {
			update((state) => {
				const steps = [...state.steps];
				const stepIndex = steps.findIndex((s) => s.step === data.step);

				if (stepIndex !== -1) {
					steps[stepIndex] = {
						...steps[stepIndex],
						content: steps[stepIndex].content + data.chunk
					};
				}

				return { ...state, steps };
			});
		},

		/**
		 * Agrega un comando de canvas
		 * @param {Object} command - Comando del canvas
		 */
		addCanvasCommand(command) {
			update((state) => ({
				...state,
				canvasCommands: [...state.canvasCommands, command]
			}));
		},

		/**
		 * Marca un paso como completado
		 * @param {Object} data - Datos del paso completado
		 */
		completeStep(data) {
			update((state) => {
				const steps = [...state.steps];
				const stepIndex = steps.findIndex((s) => s.step === data.step);

				if (stepIndex !== -1) {
					steps[stepIndex] = {
						...steps[stepIndex],
						isComplete: true
					};
				}

				return { ...state, steps };
			});
		},

		/**
		 * Finaliza la explicación
		 * @param {Object} data - Datos de finalización
		 */
		completeExplanation(data) {
			update((state) => ({
				...state,
				isExplaining: false,
				isLoading: false,
				isPaused: false
			}));
		},

		/**
		 * Pausa la explicación
		 */
		pauseExplanation() {
			update((state) => ({
				...state,
				isPaused: true
			}));
		},

		/**
		 * Reanuda la explicación
		 */
		resumeExplanation() {
			update((state) => ({
				...state,
				isPaused: false
			}));
		},

		/**
		 * Establece un error
		 * @param {Object} error - Error
		 */
		setError(error) {
			update((state) => ({
				...state,
				error,
				isLoading: false,
				isExplaining: false
			}));
		},

		/**
		 * Limpia el error
		 */
		clearError() {
			update((state) => ({
				...state,
				error: null
			}));
		},

		/**
		 * Establece la pregunta actual
		 * @param {Object} question - Pregunta
		 */
		setCurrentQuestion(question) {
			update((state) => ({
				...state,
				currentQuestion: question
			}));
		},

		/**
		 * Resetea el store a su estado inicial
		 */
		reset() {
			set({
				isConnected: false,
				sessionId: null,
				connectionError: null,
				isExplaining: false,
				isPaused: false,
				isLoading: false,
				waitingMessage: null,
				totalSteps: 0,
				currentStep: 0,
				estimatedDuration: 0,
				questionHash: null,
				steps: [],
				canvasCommands: [],
				error: null,
				currentQuestion: null
			});
		}
	};
}

export const explanationStore = createExplanationStore();

// ==========================================
// DERIVED STORES
// ==========================================

/**
 * Progreso de la explicación (0-100)
 */
export const explanationProgress = derived(explanationStore, ($store) => {
	if ($store.totalSteps === 0) return 0;
	return Math.round(($store.currentStep / $store.totalSteps) * 100);
});

/**
 * Paso actual completo
 */
export const currentStepData = derived(explanationStore, ($store) => {
	return $store.steps.find((s) => s.step === $store.currentStep) || null;
});

/**
 * Indica si hay una explicación activa
 */
export const hasActiveExplanation = derived(
	explanationStore,
	($store) => $store.isExplaining || $store.isPaused
);

/**
 * Indica si puede pausar/reanudar
 */
export const canControlPlayback = derived(
	explanationStore,
	($store) => $store.isExplaining && !$store.isLoading
);
