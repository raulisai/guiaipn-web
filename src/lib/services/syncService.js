/**
 * Servicio de Sincronización Voz-Texto con Checkpoints
 * Sistema robusto que garantiza sincronización perfecta
 */

import { get } from 'svelte/store';
import { explanationStore } from '$lib/stores';
import { speechService } from './speechService';

class SyncService {
	constructor() {
		this.currentStepIndex = -1;
		this.isPlaying = false;
		this.isPaused = false;
		this.voiceEnabled = true;
		this.checkpoints = [];
		this.renderInterval = null;
		this.currentUtterance = null;
		
		// Callbacks
		this.onStepStartCallback = null;
		this.onStepCompleteCallback = null;
		this.onCharRenderCallback = null;
		this.onProgressCallback = null;
	}

	/**
	 * Inicializa el sistema de sincronización
	 */
	async start() {
		console.log('🎬 SyncService: Iniciando sincronización');
		
		const state = get(explanationStore);
		
		if (state.buffer.steps.length === 0) {
			console.warn('⚠️ No hay pasos en el buffer');
			return;
		}

		// Crear checkpoints para cada paso
		this.createCheckpoints(state.buffer.steps);
		
		// Iniciar desde el primer paso
		this.currentStepIndex = 0;
		this.isPlaying = true;
		this.isPaused = false;
		
		// Esperar 2 segundos y empezar
		setTimeout(() => {
			if (this.voiceEnabled) {
				this.speakIntroduction();
			}
			
			setTimeout(() => {
				this.playStep(0);
			}, this.voiceEnabled ? 3000 : 500);
		}, 2000);
	}

	/**
	 * Crea checkpoints para cada paso
	 */
	createCheckpoints(steps) {
		this.checkpoints = steps.map((step, index) => ({
			stepIndex: index,
			step: step.step,
			title: step.title,
			content: step.content,
			contentLength: step.content.length,
			canvasCommands: [],
			isComplete: false,
			voiceStarted: false,
			voiceCompleted: false,
			renderStarted: false,
			renderCompleted: false
		}));
		
		console.log('✅ Checkpoints creados:', this.checkpoints.length);
		
		// Inicializar pasos en el store (vacíos al inicio)
		explanationStore.initializeSteps(this.checkpoints.map(cp => ({
			step: cp.step,
			title: cp.title,
			content: '', // Vacío al inicio, se llenará progresivamente
			isComplete: false
		})));
	}

	/**
	 * Habla la introducción
	 */
	speakIntroduction() {
		if (!this.voiceEnabled) {
			console.log('🔇 Voz desactivada, saltando introducción');
			return;
		}
		console.log('🔊 Hablando introducción');
		speechService.speak('Vamos a explicar el problema paso a paso');
	}

	/**
	 * Reproduce un paso completo (voz + renderizado)
	 */
	async playStep(stepIndex) {
		if (!this.isPlaying || this.isPaused) return;
		if (stepIndex >= this.checkpoints.length) {
			console.log('✅ Todos los pasos completados');
			this.stop();
			return;
		}

		const checkpoint = this.checkpoints[stepIndex];
		console.log(`\n🎯 Reproduciendo paso ${stepIndex}:`, checkpoint.title);
		
		// Marcar paso como iniciado
		checkpoint.renderStarted = true;
		this.currentStepIndex = stepIndex;
		
		// Callback de inicio de paso
		if (this.onStepStartCallback) {
			this.onStepStartCallback(checkpoint, stepIndex);
		}

		// 1. Anunciar título
		if (this.voiceEnabled && checkpoint.title) {
			await this.speakTitle(checkpoint);
		}

		// Esperar 1 segundo después del título
		await this.wait(1000);

		// 2. Iniciar voz del contenido Y renderizado al mismo tiempo
		// Ejecutar ambos en paralelo y esperar a que ambos terminen
		const voicePromise = checkpoint.content ? this.speakContent(checkpoint) : Promise.resolve();
		const renderPromise = this.renderContent(checkpoint);
		
		// 3. Esperar a que AMBOS terminen (voz y renderizado)
		await Promise.all([voicePromise, renderPromise]);

		// 4. Marcar como completo
		checkpoint.renderCompleted = true;
		checkpoint.isComplete = true;
		
		if (this.onStepCompleteCallback) {
			this.onStepCompleteCallback(checkpoint, stepIndex);
		}

		// 5. Esperar un momento antes del siguiente paso
		await this.wait(500); // Reducido a 500ms ya que esperamos la voz completa

		// 6. Siguiente paso
		if (this.isPlaying && !this.isPaused) {
			this.playStep(stepIndex + 1);
		}
	}

	/**
	 * Habla el título del paso
	 */
	async speakTitle(checkpoint) {
		return new Promise((resolve) => {
			const text = `Paso ${checkpoint.step}: ${checkpoint.title}`;
			console.log('🔊 Anunciando:', text);
			
			checkpoint.voiceStarted = true;
			
			// Crear utterance con callbacks
			const utterance = speechService.createUtterance(text);
			
			utterance.onend = () => {
				console.log('✅ Título completado');
				resolve();
			};
			
			utterance.onerror = (error) => {
				console.error('❌ Error en título:', error);
				resolve(); // Continuar aunque falle
			};
			
			speechService.speakUtterance(utterance);
		});
	}

	/**
	 * Habla el contenido del paso (retorna promesa que se resuelve cuando termina)
	 */
	async speakContent(checkpoint) {
		if (!this.voiceEnabled) {
			console.log('🔇 Voz desactivada, saltando audio');
			return Promise.resolve();
		}
		
		return new Promise((resolve) => {
			console.log('🔊 Hablando contenido:', checkpoint.content.substring(0, 50) + '...');
			
			const utterance = speechService.createUtterance(checkpoint.content);
			
			if (!utterance) {
				console.warn('⚠️ No se pudo crear utterance');
				resolve();
				return;
			}
			
			utterance.onend = () => {
				checkpoint.voiceCompleted = true;
				console.log('✅ Voz completada para paso:', checkpoint.stepIndex);
				resolve();
			};
			
			utterance.onerror = (error) => {
				console.error('❌ Error en voz:', error);
				checkpoint.voiceCompleted = true;
				resolve(); // Resolver aunque falle para continuar
			};
			
			this.currentUtterance = utterance;
			speechService.speakUtterance(utterance);
		});
	}

	/**
	 * Renderiza el contenido carácter por carácter
	 */
	async renderContent(checkpoint) {
		const content = checkpoint.content;
		const speed = this.calculateSpeed(content.length);
		
		console.log(`✍️ Renderizando ${content.length} caracteres a ${speed}ms/char`);

		for (let i = 0; i <= content.length; i++) {
			// Verificar si se pausó o detuvo
			while (this.isPaused && this.isPlaying) {
				await this.wait(100);
			}
			
			if (!this.isPlaying) break;

			// Actualizar store con el contenido parcial
			explanationStore.updateStepContent(checkpoint.stepIndex, content.substring(0, i));
			
			// Callback de carácter renderizado
			if (this.onCharRenderCallback) {
				this.onCharRenderCallback(checkpoint, i);
			}
			
			// Callback de progreso (porcentaje del paso actual)
			const progress = Math.round((i / content.length) * 100);
			
			// Actualizar progreso en el store
			explanationStore.updateStepProgress(checkpoint.step, progress, i, content.length);
			
			if (this.onProgressCallback) {
				this.onProgressCallback(checkpoint, progress, i, content.length);
			}

			// Esperar según velocidad
			await this.wait(speed);
		}
	}

	/**
	 * Calcula velocidad de renderizado según longitud
	 */
	calculateSpeed(length) {
		if (length < 100) return 25;
		if (length < 300) return 20;
		return 15;
	}

	/**
	 * Pausa la reproducción
	 */
	pause() {
		console.log('⏸️ Pausando sincronización');
		this.isPaused = true;
		
		// Pausar voz si está hablando
		if (this.voiceEnabled && speechService.synth) {
			speechService.synth.pause();
		}
	}

	/**
	 * Reanuda la reproducción
	 */
	resume() {
		console.log('▶️ Reanudando sincronización');
		this.isPaused = false;
		
		// Reanudar voz si estaba hablando
		if (this.voiceEnabled && speechService.synth) {
			speechService.synth.resume();
		}
	}

	/**
	 * Detiene la reproducción
	 */
	stop() {
		console.log('⏹️ Deteniendo sincronización');
		this.isPlaying = false;
		this.isPaused = false;
		
		// Detener voz
		if (speechService.synth) {
			speechService.synth.cancel();
		}
		
		this.currentUtterance = null;
	}

	/**
	 * Activa/desactiva la voz (sin detener el renderizado)
	 */
	toggleVoice(enabled) {
		console.log('🔊 Voz:', enabled ? 'ACTIVADA' : 'DESACTIVADA');
		this.voiceEnabled = enabled;
		speechService.setEnabled(enabled);
		
		if (!enabled && speechService.synth) {
			// Cancelar voz actual pero continuar renderizado
			speechService.synth.cancel();
			// Marcar el checkpoint actual como completado en voz para no quedarse esperando
			if (this.currentStepIndex >= 0 && this.currentStepIndex < this.checkpoints.length) {
				this.checkpoints[this.currentStepIndex].voiceCompleted = true;
			}
		}
	}

	/**
	 * Obtiene el progreso actual
	 */
	getProgress() {
		if (this.checkpoints.length === 0) return 0;
		
		const completedSteps = this.checkpoints.filter(cp => cp.isComplete).length;
		return Math.round((completedSteps / this.checkpoints.length) * 100);
	}

	/**
	 * Obtiene el paso actual
	 */
	getCurrentStep() {
		return this.checkpoints[this.currentStepIndex] || null;
	}

	/**
	 * Espera un tiempo determinado
	 */
	wait(ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}

	/**
	 * Registra callback de inicio de paso
	 */
	onStepStart(callback) {
		this.onStepStartCallback = callback;
	}

	/**
	 * Registra callback de paso completo
	 */
	onStepComplete(callback) {
		this.onStepCompleteCallback = callback;
	}

	/**
	 * Registra callback de carácter renderizado
	 */
	onCharRender(callback) {
		this.onCharRenderCallback = callback;
	}

	/**
	 * Registra callback de progreso de renderizado
	 */
	onProgress(callback) {
		this.onProgressCallback = callback;
	}
}

export const syncService = new SyncService();
