/**
 * Composable para callbacks del syncService
 * Gestiona eventos de progreso, inicio y finalización de pasos
 */

import { syncService } from '$lib/services/syncService';
import { explanationStore } from '$lib/stores';
import { normalizeComponentCommand } from '../component_commands/index.js';
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
				const triggerPercentage = Math.round(i * percentagePerCommand);
				
				if (progress === triggerPercentage) {
					console.log(`🎯 TRIGGER ${triggerPercentage}% - Activando comando ${i + 1}/${totalCommands}`);
					console.log(`🎨 Comandos canvas disponibles: ${store.buffer.canvasCommands.length}`);
				}
			}
		}
	}

	/**
	 * Filtrar comandos según progreso
	 * @param {Array} commands - Comandos a filtrar
	 * @param {number} currentStep - Paso actual
	 * @param {number} stepProgress - Progreso del paso actual (0-100)
	 * @returns {Array} Comandos visibles
	 */
	function filterCommandsByProgress(commands, currentStep, stepProgress) {
		return commands.filter((cmd) => {
			if (cmd.step < currentStep) {
				return true;
			}

			if (cmd.step === currentStep) {
				const commandsForStep = commands.filter((c) => c.step === currentStep);
				const totalCommandsInStep = commandsForStep.length;

				if (totalCommandsInStep === 0) return false;

				const commandIndexInStep = commandsForStep.findIndex((c) => c === cmd);
				const percentagePerCommand = 100 / totalCommandsInStep;
				const requiredPercentage = commandIndexInStep * percentagePerCommand;

				return stepProgress >= requiredPercentage;
			}

			return false;
		});
	}

	/**
	 * Calcular comandos de canvas visibles según progreso
	 * @param {number} currentStep - Paso actual
	 * @param {number} stepProgress - Progreso del paso actual (0-100)
	 * @returns {Array} Comandos visibles
	 */
	function getVisibleCanvasCommands(currentStep, stepProgress) {
		const store = get(explanationStore);
		return filterCommandsByProgress(store.buffer.canvasCommands, currentStep, stepProgress);
	}

	/**
	 * Calcular comandos de componentes visibles según progreso
	 * @param {number} currentStep - Paso actual
	 * @param {number} stepProgress - Progreso del paso actual (0-100)
	 * @param {string} placement - Ubicación del componente (opcional, por defecto 'panel')
	 * @returns {Array} Comandos visibles
	 */
	function getVisibleComponentCommands(currentStep, stepProgress, placement = 'panel') {
		const store = get(explanationStore);

		return store.buffer.componentCommands.filter((cmd) => {
			const normalized = normalizeComponentCommand(cmd);
			if (!normalized) return false;
			if (normalized.placement !== placement) return false;

			const triggerPercentage = normalized.params?.triggerPercentage ?? normalized.params?.trigger_percentage ?? 0;
			const clampedTrigger = Math.min(100, Math.max(0, triggerPercentage));

			if (normalized.step < currentStep) {
				return true;
			}

			if (normalized.step === currentStep) {
				return stepProgress >= clampedTrigger;
			}

			return false;
		});
	}

	return {
		setupCallbacks,
		getVisibleCanvasCommands,
		getVisibleComponentCommands,
		logCanvasTriggers
	};
}
