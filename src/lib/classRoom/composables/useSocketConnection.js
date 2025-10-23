/**
 * Composable para manejo de conexión Socket.IO
 * Gestiona autenticación, conexión y setup de listeners
 */

import { socketService } from '$lib/api/socket';
import { explanationStore } from '$lib/stores';
import { supabase } from '$lib/services';
import { speechService } from '$lib/services/speechService';

/**
 * Hook para manejo de conexión Socket.IO
 * @returns {Object} Funciones y estado de conexión
 */
export function useSocketConnection() {
	/**
	 * Conectar al socket con autenticación
	 * @param {Function} onSuccess - Callback cuando conexión exitosa
	 * @param {Function} onError - Callback cuando hay error
	 */
	async function connect(onSuccess, onError) {
		try {
			// Obtener token de Supabase
			const {
				data: { session },
				error: sessionError
			} = await supabase.auth.getSession();

			if (sessionError || !session) {
				throw new Error('No hay sesión activa');
			}

			const token = session.access_token;

			// Conectar al socket
			await socketService.connect(token);

			// Callback de éxito
			if (onSuccess) onSuccess();
		} catch (error) {
			console.error('Error al conectar:', error);
			if (onError) {
				onError({
					code: 'CONNECTION_ERROR',
					message: error.message
				});
			}
		}
	}

	/**
	 * Configurar listeners de Socket.IO
	 * @param {boolean} voiceEnabled - Si la voz está habilitada
	 */
	function setupListeners(voiceEnabled = true) {
		// Listener de frases de espera
		socketService.onWaitingPhrase((data) => {
			explanationStore.setWaitingMessage(data.message);
			if (voiceEnabled) {
				speechService.speak(data.message);
			}
		});

		// Listener de inicio de explicación
		socketService.onExplanationStart((data) => {
			explanationStore.startExplanation(data);
			console.log('✅ Explicación iniciada, esperando buffer completo...');
		});

		// Listener de inicio de paso
		socketService.onStepStart((data) => {
			explanationStore.startStep(data);

			// Procesar comandos de canvas si vienen en el paso
			if (Array.isArray(data.canvas_commands)) {
				data.canvas_commands.forEach((cmd) => {
					explanationStore.addCanvasCommand({
						step_number: data.step_number,
						command: cmd
					});
				});
			}

			// Procesar comandos de componentes si vienen en el paso
			if (Array.isArray(data.component_commands)) {
				data.component_commands.forEach((cmd) => {
					explanationStore.addComponentCommand({
						step_number: data.step_number,
						command: cmd
					});
				});
			}
		});

		// Listener de chunks de contenido
		socketService.onContentChunk((data) => {
			explanationStore.addContentChunk(data);
		});

		// Listener de comandos de canvas
		socketService.onCanvasCommand((data) => {
			explanationStore.addCanvasCommand(data);
		});

		// Listener de comandos de componentes
		socketService.onComponentCommand?.((data) => {
			explanationStore.addComponentCommand(data);
		});

		// Listener de paso completado
		socketService.onStepComplete((data) => {
			explanationStore.completeStep(data);
		});

		// Listener de explicación completada
		socketService.onExplanationComplete((data) => {
			explanationStore.completeExplanation(data);
			console.log('✅ Buffer completo, listo para iniciar');
		});

		// Listener de errores
		socketService.onError((error) => {
			explanationStore.setError(error);
		});
	}

	/**
	 * Desconectar del socket
	 */
	function disconnect() {
		if (socketService.isSocketConnected()) {
			socketService.disconnect();
		}
	}

	/**
	 * Verificar si está conectado
	 * @returns {boolean}
	 */
	function isConnected() {
		return socketService.isSocketConnected();
	}

	return {
		connect,
		setupListeners,
		disconnect,
		isConnected
	};
}
