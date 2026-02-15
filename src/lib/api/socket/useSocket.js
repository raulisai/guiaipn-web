/**
 * Composable para usar Socket.IO en componentes Svelte
 * Facilita la integración del socketService con explanationStore
 */

import { socketService } from './SocketService.js';
import { explanationStore } from '$lib/stores/explanationStore.js';
import { onMount, onDestroy } from 'svelte';

/**
 * Hook para usar Socket.IO en componentes
 * Configura automáticamente los listeners y limpia al desmontar
 * @param {string} token - JWT token de Supabase
 * @returns {Object} - Métodos y estado del socket
 */
export function useSocket(token) {
	let isInitialized = false;

	/**
	 * Inicializa la conexión y configura listeners
	 */
	async function initialize() {
		if (isInitialized) return;

		try {
			// Conectar al servidor
			await socketService.connect(token);

			// Configurar listeners de conexión
			socketService.onConnectionEstablished((data) => {
				explanationStore.setConnected(data.session_id);
			});

			// Configurar listeners de streaming
			socketService.onWaitingPhrase((data) => {
				explanationStore.setWaitingMessage(data.message);
			});

			socketService.onExplanationStart((data) => {
				explanationStore.startExplanation(data);
			});

			socketService.onStepStart((data) => {
				explanationStore.startStep(data);
			});

			socketService.onContentChunk((data) => {
				explanationStore.addContentChunk(data);
			});

			socketService.onCanvasCommand((data) => {
				explanationStore.addCanvasCommand(data);
			});

			socketService.onStepComplete((data) => {
				explanationStore.completeStep(data);
			});

			socketService.onExplanationComplete((data) => {
				explanationStore.completeExplanation(data);
			});

			socketService.onError((error) => {
				explanationStore.setError(error);
			});

			isInitialized = true;
		} catch (error) {
			console.error('❌ Error inicializando socket:', error);
			explanationStore.setConnectionError(error);
		}
	}

	/**
	 * Limpia la conexión y listeners
	 */
	function cleanup() {
		socketService.removeAllListeners();
		socketService.disconnect();
		explanationStore.setDisconnected();
		isInitialized = false;
	}

	/**
	 * Solicita explicación de una pregunta de examen
	 * @param {Object} questionData - Datos de la pregunta
	 */
	function askExplanation(questionData) {
		explanationStore.setCurrentQuestion(questionData);
		socketService.emitStartExplanation(questionData);
	}

	/**
	 * Hace una pregunta libre
	 * @param {string} question - Pregunta del usuario
	 * @param {Object} context - Contexto adicional
	 * @param {string} userId - ID del usuario
	 */
	function askQuestion(question, context = {}, userId = null) {
		socketService.emitAskQuestion(question, context, userId);
	}

	/**
	 * Pausa la explicación actual
	 */
	function pause() {
		const state = explanationStore;
		// Obtener estado actual para saber en qué paso pausar
		let currentStep = 0;
		state.subscribe((s) => {
			currentStep = s.currentStep;
		})();

		socketService.emitPauseExplanation(currentStep);
		explanationStore.pauseExplanation();
	}

	/**
	 * Reanuda la explicación pausada
	 */
	function resume() {
		socketService.emitResumeExplanation();
		explanationStore.resumeExplanation();
	}

	/**
	 * Hace una pregunta de seguimiento
	 * @param {string} question - Pregunta de seguimiento
	 */
	function askFollowUp(question) {
		socketService.emitAskFollowUp(question);
	}

	/**
	 * Interrumpe para hacer una aclaración
	 * @param {string} question - Pregunta de interrupción
	 */
	function interrupt(question) {
		socketService.emitInterruptExplanation(question);
	}

	return {
		initialize,
		cleanup,
		askExplanation,
		askQuestion,
		pause,
		resume,
		askFollowUp,
		interrupt,
		isConnected: () => socketService.isSocketConnected()
	};
}

/**
 * Hook para auto-inicializar Socket.IO en onMount
 * @param {string} token - JWT token
 * @returns {Object} - Métodos del socket
 */
export function useSocketAutoInit(token) {
	const socket = useSocket(token);

	onMount(async () => {
		await socket.initialize();
	});

	onDestroy(() => {
		socket.cleanup();
	});

	return socket;
}
