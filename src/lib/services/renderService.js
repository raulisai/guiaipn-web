/**
 * Servicio de Renderizado Progresivo
 * Controla el flujo de renderizado de contenido y canvas de forma secuencial y fluida
 */

import { explanationStore } from '$lib/stores';
import { get } from 'svelte/store';

class RenderService {
	constructor() {
		this.renderTimer = null;
		this.isActive = false;
		this.onStepChangeCallback = null;
		this.onCharRenderCallback = null;
		this.onCanvasRenderCallback = null;
	}

	/**
	 * Inicia el renderizado progresivo
	 */
	start() {
		if (this.isActive) {
			console.log('RenderService ya está activo');
			return;
		}

		console.log('🎬 Iniciando renderizado progresivo');
		this.isActive = true;
		explanationStore.startRendering();
		this.scheduleNextRender();
	}

	/**
	 * Detiene el renderizado progresivo
	 */
	stop() {
		console.log('⏹️ Deteniendo renderizado progresivo');
		this.isActive = false;
		if (this.renderTimer) {
			clearTimeout(this.renderTimer);
			this.renderTimer = null;
		}
		explanationStore.stopRendering();
	}

	/**
	 * Pausa el renderizado
	 */
	pause() {
		console.log('⏸️ Pausando renderizado');
		this.isActive = false;
		if (this.renderTimer) {
			clearTimeout(this.renderTimer);
			this.renderTimer = null;
		}
	}

	/**
	 * Reanuda el renderizado
	 */
	resume() {
		if (this.isActive) {
			console.log('RenderService ya está activo');
			return;
		}

		console.log('▶️ Reanudando renderizado');
		this.isActive = true;
		this.scheduleNextRender();
	}

	/**
	 * Programa el siguiente renderizado
	 */
	scheduleNextRender() {
		if (!this.isActive) return;

		const state = get(explanationStore);
		const speed = state.render.renderSpeed;

		this.renderTimer = setTimeout(() => {
			this.renderNext();
		}, speed);
	}

	/**
	 * Renderiza el siguiente fragmento
	 */
	renderNext() {
		if (!this.isActive) return;

		const stateBefore = get(explanationStore);
		const prevStepIndex = stateBefore.render.currentStepIndex;
		const prevCharIndex = stateBefore.render.currentCharIndex;
		const prevCanvasIndex = stateBefore.render.currentCanvasIndex;

		// Debug: ver estado del buffer
		if (prevCharIndex === 0 && prevCanvasIndex === 0) {
			console.log('🎬 Renderizando paso:', prevStepIndex);
			console.log('Buffer steps:', stateBefore.buffer.steps.length);
			console.log('Buffer step actual:', stateBefore.buffer.steps[prevStepIndex]);
		}

		// Renderizar siguiente chunk
		const hasMore = explanationStore.renderNextChunk();

		const stateAfter = get(explanationStore);
		const newStepIndex = stateAfter.render.currentStepIndex;
		const newCharIndex = stateAfter.render.currentCharIndex;
		const newCanvasIndex = stateAfter.render.currentCanvasIndex;

		// Detectar cambios para callbacks
		if (newStepIndex !== prevStepIndex) {
			// Cambió de paso
			if (this.onStepChangeCallback) {
				const currentStep = stateAfter.buffer.steps[newStepIndex];
				this.onStepChangeCallback(currentStep, newStepIndex);
			}
		}

		if (newCharIndex !== prevCharIndex) {
			// Se renderizó un carácter
			if (this.onCharRenderCallback) {
				const currentStep = stateAfter.buffer.steps[newStepIndex];
				this.onCharRenderCallback(currentStep, newCharIndex);
			}
		}

		if (newCanvasIndex !== prevCanvasIndex) {
			// Se renderizó un comando de canvas
			if (this.onCanvasRenderCallback) {
				const stepCanvasCommands = stateAfter.buffer.canvasCommands.filter(
					cmd => cmd.step === stateAfter.buffer.steps[newStepIndex]?.step
				);
				const canvasCmd = stepCanvasCommands[newCanvasIndex - 1];
				this.onCanvasRenderCallback(canvasCmd, newCanvasIndex - 1);
			}
		}

		// Continuar si hay más
		if (hasMore) {
			this.scheduleNextRender();
		} else {
			console.log('✅ Renderizado completo');
			this.isActive = false;
			explanationStore.stopRendering();
		}
	}

	/**
	 * Registra callback para cambio de paso
	 */
	onStepChange(callback) {
		this.onStepChangeCallback = callback;
	}

	/**
	 * Registra callback para renderizado de carácter
	 */
	onCharRender(callback) {
		this.onCharRenderCallback = callback;
	}

	/**
	 * Registra callback para renderizado de canvas
	 */
	onCanvasRender(callback) {
		this.onCanvasRenderCallback = callback;
	}

	/**
	 * Verifica si está activo
	 */
	isRendering() {
		return this.isActive;
	}

	/**
	 * Renderiza todo inmediatamente (modo "mostrar todo")
	 */
	renderAll() {
		console.log('⚡ Renderizando todo inmediatamente');
		this.stop();

		const state = get(explanationStore);
		
		// Copiar todo del buffer a los arrays de renderizado
		explanationStore.update((s) => ({
			...s,
			steps: [...state.buffer.steps],
			canvasCommands: [...state.buffer.canvasCommands],
			currentStep: state.buffer.steps[state.buffer.steps.length - 1]?.step || 0,
			render: {
				...s.render,
				isRendering: false,
				currentStepIndex: state.buffer.steps.length - 1,
				currentCharIndex: state.buffer.steps[state.buffer.steps.length - 1]?.content.length || 0,
				currentCanvasIndex: state.buffer.canvasCommands.length
			}
		}));

		console.log('✅ Todo renderizado');
	}

	/**
	 * Obtiene el progreso de renderizado (0-100)
	 */
	getProgress() {
		const state = get(explanationStore);
		const { buffer, render } = state;

		if (buffer.steps.length === 0) return 0;

		// Calcular total de "unidades" a renderizar
		let totalUnits = 0;
		let renderedUnits = 0;

		buffer.steps.forEach((step, index) => {
			// Cada carácter es una unidad
			totalUnits += step.content.length;

			// Cada comando de canvas es una unidad
			const stepCanvasCommands = buffer.canvasCommands.filter(cmd => cmd.step === step.step);
			totalUnits += stepCanvasCommands.length;

			// Contar renderizados
			if (index < render.currentStepIndex) {
				// Paso completamente renderizado
				renderedUnits += step.content.length;
				renderedUnits += stepCanvasCommands.length;
			} else if (index === render.currentStepIndex) {
				// Paso actual
				renderedUnits += render.currentCharIndex;
				renderedUnits += render.currentCanvasIndex;
			}
		});

		if (totalUnits === 0) return 0;
		return Math.round((renderedUnits / totalUnits) * 100);
	}
}

// Exportar instancia única
export const renderService = new RenderService();
