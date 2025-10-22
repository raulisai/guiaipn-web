/**
 * Composable para callbacks del syncService
 * Gestiona eventos de progreso, inicio y finalización de pasos
 */

import { syncService } from '$lib/services/syncService';
import { explanationStore } from '$lib/stores';
import { get } from 'svelte/store';

/**
 * Hook para configurar callbacks del syncService
 * @param {Object} options - Opciones de configuración
 * @param {Function} [options.onStepStarted] - Callback cuando inicia un paso
 * @param {Function} [options.onStepCompleted] - Callback cuando termina un paso
 * @param {Function} [options.onProgressUpdate] - Callback de progreso
 * @returns {Object} Funciones de utilidad
 */
export function useSyncCallbacks(options = {}) {
	const {
		onStepStarted = null,
		onStepCompleted = null,
		onProgressUpdate = null
	} = options;

	/**
	 * Configurar callbacks del syncService
	 * @param {Array} completedSteps - Array reactivo de pasos completados
	 */
	function setupCallbacks(completedSteps = []) {
		// Callback cuando inicia un paso
		syncService.onStepStart((checkpoint, stepIndex) => {
			console.log('🎬 Paso iniciado:', checkpoint.title);
			
			// Actualizar currentStep en el store
			explanationStore.setCurrentStep(checkpoint.step);
			
			// Callback personalizado
			if (onStepStarted) {
				onStepStarted(checkpoint, stepIndex);
			}
		});

		// Callback cuando termina un paso
		syncService.onStepComplete((checkpoint, stepIndex) => {
			console.log('✅ Paso completado:', checkpoint.title);
			
			// Agregar paso a completados (si se pasa el array)
			if (Array.isArray(completedSteps)) {
				completedSteps.push(checkpoint.step);
			}
			
			// Marcar el paso como completado en el store
			explanationStore.markStepComplete(checkpoint.step);
			
			// Forzar renderizado completo del canvas
			console.log('🎨 Forzando renderizado completo del canvas para paso:', checkpoint.step);
			
			// Callback personalizado
			if (onStepCompleted) {
				onStepCompleted(checkpoint, stepIndex);
			}
		});

		// Callback de progreso
		syncService.onProgress((checkpoint, progress, charIndex, totalChars) => {
			// Monitorear progreso del renderizado
			console.log(`📊 Progreso paso ${checkpoint.step}: ${progress}% (${charIndex}/${totalChars} chars)`);
			
			// Calcular triggers dinámicos según cantidad de comandos
			logCanvasTriggers(checkpoint, progress);
			
			// Callback personalizado
			if (onProgressUpdate) {
				onProgressUpdate(checkpoint, progress, charIndex, totalChars);
			}
		});

		// Callback de renderizado de caracteres (opcional)
		syncService.onCharRender((checkpoint, charIndex) => {
			// Tracking opcional - puede usarse para animaciones específicas
		});
	}

	/**
	 * Loguear triggers de canvas según progreso
	 * @param {Object} checkpoint - Checkpoint actual
	 * @param {number} progress - Progreso en porcentaje
	 */
	function logCanvasTriggers(checkpoint, progress) {
		const store = get(explanationStore);
		const stepCommands = store.buffer.canvasCommands.filter(
			c => c.step === checkpoint.step
		);
		const totalCommands = stepCommands.length;
		
		if (totalCommands > 0) {
			const percentagePerCommand = 100 / totalCommands;
			
			// Verificar si alcanzamos un trigger
			for (let i = 0; i < totalCommands; i++) {
				const triggerPercentage = Math.round((i + 1) * percentagePerCommand);
				
				if (progress === triggerPercentage) {
					console.log(`🎯 TRIGGER ${triggerPercentage}% - Activando comando ${i + 1}/${totalCommands}`);
					console.log(`🎨 Comandos canvas disponibles: ${store.buffer.canvasCommands.length}`);
				}
			}
		}
	}

	/**
	 * Calcular comandos de canvas visibles según progreso
	 * @param {number} currentStep - Paso actual
	 * @param {number} stepProgress - Progreso del paso actual (0-100)
	 * @returns {Array} Comandos visibles
	 */
	function getVisibleCanvasCommands(currentStep, stepProgress) {
		const store = get(explanationStore);
		return store.buffer.canvasCommands.filter((cmd) => {
			// Pasos anteriores: mostrar todos
			if (cmd.step < currentStep) {
				return true;
			}
			
			// Paso actual: calcular según progreso
			if (cmd.step === currentStep) {
				const stepCommands = store.buffer.canvasCommands.filter(
					c => c.step === currentStep
				);
				const totalCommandsInStep = stepCommands.length;
				
				if (totalCommandsInStep === 0) return false;
				
				const commandIndexInStep = stepCommands.findIndex(c => c === cmd);
				const percentagePerCommand = 100 / totalCommandsInStep;
				const requiredPercentage = (commandIndexInStep + 1) * percentagePerCommand;
				
				return stepProgress >= requiredPercentage;
			}
			
			// Pasos futuros: no mostrar
			return false;
		});
	}

	return {
		setupCallbacks,
		getVisibleCanvasCommands,
		logCanvasTriggers
	};
}
