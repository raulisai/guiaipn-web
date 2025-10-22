/**
 * ClassRoomController - Controlador principal del salón de clase
 * Orquesta todos los composables y maneja el flujo completo de la explicación
 */

import { speechService } from '$lib/services/speechService';
import {
	useSocketConnection,
	useExplanationControl,
	useSyncCallbacks,
	useFeedbackModal,
	useQuestionData,
	useProgressTracking
} from '../composables/index.js';

/**
 * Controlador principal del ClassRoom
 * @param {URLSearchParams} searchParams - Parámetros de la URL
 * @returns {Object} API del controlador
 */
export function createClassRoomController(searchParams) {
	// Inicializar composables
	const socketConnection = useSocketConnection();
	const explanationControl = useExplanationControl();
	const syncCallbacks = useSyncCallbacks();
	const feedbackModal = useFeedbackModal();
	const questionData = useQuestionData(searchParams);
	const progressTracking = useProgressTracking();

	// Estado interno
	// Extraer datos de pregunta inmediatamente
	let currentQuestionData = questionData.extractQuestionData();
	let completedSteps = [];
	let voiceEnabled = true;

	/**
	 * Inicializar el sistema completo
	 * @param {Object} callbacks - Callbacks para actualizar UI
	 * @param {Function} [callbacks.onConnecting] - Cuando está conectando
	 * @param {Function} [callbacks.onConnected] - Cuando conectó exitosamente
	 * @param {Function} [callbacks.onError] - Cuando hay error
	 * @param {Function} [callbacks.onProgressUpdate] - Actualización de progreso
	 */
	async function initialize(callbacks = {}) {
		const {
			onConnecting = null,
			onConnected = null,
			onError = null,
			onProgressUpdate = null
		} = callbacks;

		// Habilitar voz
		speechService.setEnabled(true);
		console.log('📍 Sistema listo');

		// Validar datos de pregunta (ya extraídos al crear el controlador)
		const validationError = questionData.validateQuestionData(currentQuestionData);

		if (validationError) {
			if (onError) onError(validationError);
			return;
		}

		// Guardar pregunta en store
		questionData.saveToStore(currentQuestionData);

		// Configurar callbacks del syncService
		syncCallbacks.setupCallbacks(completedSteps);

		// Notificar que está conectando
		if (onConnecting) onConnecting();

		// Configurar listeners del socket
		socketConnection.setupListeners(voiceEnabled);

		// Conectar al socket
		await socketConnection.connect(
			() => {
				// Éxito: iniciar explicación
				explanationControl.startExplanation(currentQuestionData);
				if (onConnected) onConnected();
			},
			(error) => {
				// Error
				if (onError) onError(error);
			}
		);
	}

	/**
	 * Iniciar el renderizado progresivo
	 * @param {Function} onProgressUpdate - Callback de progreso
	 */
	function startRendering(onProgressUpdate) {
		explanationControl.startRendering();
		
		// Iniciar tracking de progreso
		if (onProgressUpdate) {
			progressTracking.startTracking(onProgressUpdate);
		}
	}

	/**
	 * Alternar voz (mutear/desmutear)
	 * @param {boolean} enabled - Si la voz está habilitada
	 */
	function toggleVoice(enabled) {
		voiceEnabled = enabled;
		explanationControl.toggleVoice(enabled);
	}

	/**
	 * Detener explicación
	 */
	function stop() {
		explanationControl.stop();
	}

	/**
	 * Reintentar conexión
	 * @param {Function} onRetry - Callback para reintentar
	 */
	function retry(onRetry) {
		explanationControl.retry(onRetry);
	}

	/**
	 * Volver al examen (muestra modal de feedback)
	 * @param {Function} onGoBack - Callback antes de volver
	 */
	function goBack(onGoBack) {
		explanationControl.goBack(onGoBack);
	}

	/**
	 * Enviar feedback y volver
	 * @param {string} rating - Rating del usuario
	 * @param {string} comment - Comentario opcional
	 */
	function submitFeedback(rating, comment) {
		feedbackModal.submitFeedback(rating, comment);
	}

	/**
	 * Omitir feedback y volver
	 */
	function skipFeedback() {
		feedbackModal.skipFeedback();
	}

	/**
	 * Obtener comandos de canvas visibles según progreso
	 * @param {number} currentStep - Paso actual
	 * @param {number} stepProgress - Progreso del paso (0-100)
	 * @returns {Array} Comandos visibles
	 */
	function getVisibleCanvasCommands(currentStep, stepProgress) {
		return syncCallbacks.getVisibleCanvasCommands(currentStep, stepProgress);
	}

	/**
	 * Obtener progreso actual
	 * @returns {number} Progreso (0-100)
	 */
	function getProgress() {
		return explanationControl.getProgress();
	}

	/**
	 * Obtener datos de la pregunta actual
	 * @returns {Object} Datos de la pregunta
	 */
	function getQuestionData() {
		return currentQuestionData;
	}

	/**
	 * Obtener pasos completados
	 * @returns {Array} Array de números de pasos completados
	 */
	function getCompletedSteps() {
		return completedSteps;
	}

	/**
	 * Limpiar recursos al desmontar
	 */
	function cleanup() {
		progressTracking.cleanup();
		explanationControl.cleanup();
	}

	// API pública del controlador
	return {
		// Ciclo de vida
		initialize,
		cleanup,
		
		// Control de renderizado
		startRendering,
		getProgress,
		
		// Control de voz
		toggleVoice,
		
		// Navegación
		stop,
		retry,
		goBack,
		
		// Feedback
		submitFeedback,
		skipFeedback,
		
		// Canvas
		getVisibleCanvasCommands,
		
		// Datos
		getQuestionData,
		getCompletedSteps
	};
}
