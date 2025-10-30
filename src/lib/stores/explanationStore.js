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
		explanationSessionId: null,
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
		
		// Progreso detallado del paso actual
		stepProgress: {
			stepNumber: 0,
			percentage: 0, // 0-100
			charIndex: 0,
			totalChars: 0,
			canvasTriggered: false // Si ya se activó el canvas al 50%
		},

		// Contenido de los pasos
		steps: [], // Array de { step, title, type, content, isComplete }

		// SISTEMA DE BUFFER
		// Almacena TODA la información recibida del backend
		buffer: {
			steps: [], // Pasos completos con todo su contenido
			canvasCommands: [], // Todos los comandos de canvas
			componentCommands: [], // Comandos para componentes adicionales
			isComplete: false // Si ya se recibió toda la información
		},

		// ESTADO DE RENDERIZADO
		// Controla qué se está mostrando actualmente
		render: {
			currentStepIndex: 0, // Índice del paso que se está renderizando
			currentCharIndex: 0, // Índice del carácter dentro del paso
			currentCanvasIndex: 0, // Índice del comando de canvas
			isRendering: false, // Si está en proceso de renderizado
			renderSpeed: 30 // Milisegundos por carácter
		},

		// Comandos del canvas (para compatibilidad)
		canvasCommands: [],
		componentCommands: [],

		// Errores
		error: null,

		// Pregunta actual
		currentQuestion: null,
		pauseContext: null
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

		setExplanationSessionId(sessionId) {
			update((state) => ({
				...state,
				explanationSessionId: sessionId ?? null
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
			update((state) => {
				const normalizedCurrentQuestion = (() => {
					if (!data.original_question) {
						if (state.currentQuestion && typeof state.currentQuestion === 'string') {
							return { pregunta: state.currentQuestion };
						}
						return state.currentQuestion;
					}

					if (state.currentQuestion && typeof state.currentQuestion === 'object') {
						return {
							...state.currentQuestion,
							original_question: data.original_question,
							pregunta: state.currentQuestion.pregunta || data.original_question
						};
					}

					return {
						pregunta: data.original_question,
						original_question: data.original_question
					};
				})();

				return {
					...state,
					isExplaining: true,
					isLoading: false,
					isPaused: false,
					waitingMessage: null,
					totalSteps: data.total_steps,
					currentStep: 0,
					estimatedDuration: data.estimated_duration,
					questionHash: data.question_hash,
					explanationSessionId: data.session_id ?? state.explanationSessionId,
					currentQuestion: normalizedCurrentQuestion,
					steps: [],
					canvasCommands: [],
					componentCommands: [],
					buffer: {
						steps: [],
						canvasCommands: [],
						componentCommands: [],
						isComplete: false
					},
					stepProgress: {
						stepNumber: 0,
						percentage: 0,
						charIndex: 0,
						totalChars: 0,
						canvasTriggered: false
					},
					render: {
						currentStepIndex: 0,
						currentCharIndex: 0,
						currentCanvasIndex: 0,
						currentComponentIndex: 0,
						isRendering: false,
						renderSpeed: state.render.renderSpeed
					},
					error: null
				};
			});
		},

		/**
		 * Inicia un nuevo paso
		 * ALMACENA EN BUFFER
		 * @param {Object} data - Datos del paso
		 */
		startStep(data) {
			update((state) => {
				const stepNumber = data.step_number || data.step;
				const newStep = {
					step: stepNumber,
					title: data.title,
					type: data.content_type || data.type,
					content: '',
					isComplete: false
				};

				return {
					...state,
					currentStep: stepNumber,
					buffer: {
						...state.buffer,
						steps: [...state.buffer.steps, newStep]
					}
				};
			});
		},

		/**
		 * Agrega un comando de componente
		 * ALMACENA EN BUFFER
		 * @param {Object} data - Datos del comando (puede tener step_number y command anidado)
		 */
		addComponentCommand(data) {
			update((state) => {
				const stepNumber = data.step_number || data.step;
				const normalizedCommand = {
					step: stepNumber,
					command: data.command,
					renderedAt: null
				};

				console.log('🧩 Component command guardado:', normalizedCommand);

				return {
					...state,
					buffer: {
						...state.buffer,
						componentCommands: [...state.buffer.componentCommands, normalizedCommand]
					},
					componentCommands: [...state.componentCommands, normalizedCommand]
				};
			});
		},

		/**
		 * Agrega contenido a un paso (streaming)
		 * ALMACENA EN BUFFER sin renderizar inmediatamente
		 * @param {Object} data - Chunk de contenido
		 */
		addContentChunk(data) {
			update((state) => {
				const bufferSteps = [...state.buffer.steps];
				const stepNumber = data.step_number || data.step;
				const stepIndex = bufferSteps.findIndex((s) => s.step === stepNumber);

				if (stepIndex !== -1) {
					bufferSteps[stepIndex] = {
						...bufferSteps[stepIndex],
						content: bufferSteps[stepIndex].content + data.chunk
					};
				}

				return { 
					...state, 
					buffer: {
						...state.buffer,
						steps: bufferSteps
					}
				};
			});
		},

		/**
		 * Agrega un comando de canvas
		 * ALMACENA EN BUFFER
		 * @param {Object} data - Datos del comando (puede tener step_number y command anidado)
		 */
		addCanvasCommand(data) {
			update((state) => {
				// Normalizar estructura del backend
				const stepNumber = data.step_number || data.step;
				
				// El backend envía: { step_number: 2, command: { command: "draw_equation", parameters: {...} } }
				// Guardamos la estructura completa
				const normalizedCommand = {
					step: stepNumber,
					command: data.command, // Guardar el objeto command completo
					renderedAt: null // Timestamp de cuándo se renderizó
				};
				
				console.log('📊 Canvas command guardado:', normalizedCommand);
				
				return {
					...state,
					buffer: {
						...state.buffer,
						canvasCommands: [...state.buffer.canvasCommands, normalizedCommand]
					},
					canvasCommands: [...state.canvasCommands, normalizedCommand]
				};
			});
		},

		/**
		 * Marca un paso como completado en el buffer
		 * @param {Object} data - Datos del paso completado
		 */
		completeStep(data) {
			update((state) => {
				const bufferSteps = [...state.buffer.steps];
				const stepNumber = data.step_number || data.step;
				const stepIndex = bufferSteps.findIndex((s) => s.step === stepNumber);

				if (stepIndex !== -1) {
					bufferSteps[stepIndex] = {
						...bufferSteps[stepIndex],
						isComplete: true
					};
				}

				return { 
					...state, 
					buffer: {
						...state.buffer,
						steps: bufferSteps
					}
				};
			});
		},

		/**
		 * Finaliza la explicación
		 * Marca el buffer como completo
		 * @param {Object} data - Datos de finalización
		 */
		completeExplanation(data) {
			update((state) => ({
				...state,
				isExplaining: false,
				isLoading: false,
				isPaused: false,
				buffer: {
					...state.buffer,
					isComplete: true
				}
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

		applyExplanationPaused(payload = {}) {
			update((state) => ({
				...state,
				isPaused: true,
				explanationSessionId: payload.session_id ?? state.explanationSessionId,
				pauseContext: payload.pause_position ?? state.pauseContext
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

		savePauseContext(context) {
			update((state) => ({
				...state,
				pauseContext: context
			}));
		},

		clearPauseContext() {
			update((state) => ({
				...state,
				pauseContext: null
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
		 * Obtiene el texto de la pregunta original (para contexto de aclaraciones)
		 */
		getOriginalQuestion() {
			let originalQuestion = null;
			const unsubscribe = subscribe((state) => {
				if (state.currentQuestion?.pregunta) {
					originalQuestion = state.currentQuestion.pregunta;
				} else if (typeof state.currentQuestion === 'string') {
					originalQuestion = state.currentQuestion;
				}
			});
			unsubscribe?.();
			return originalQuestion;
		},

		/**
		 * Actualiza el estado de renderizado
		 * @param {Object} renderState - Nuevo estado de renderizado
		 */
		updateRenderState(renderState) {
			update((state) => ({
				...state,
				render: {
					...state.render,
					...renderState
				}
			}));
		},

		/**
		 * Renderiza el siguiente fragmento (carácter o comando)
		 * Retorna true si hay más para renderizar
		 */
		renderNextChunk() {
			let hasMore = false;
			
			update((state) => {
				const { buffer, render, steps, canvasCommands, componentCommands } = state;
				
				// Si no hay pasos en buffer, no hay nada que renderizar
				if (buffer.steps.length === 0) {
					return state;
				}
				
				const currentBufferStep = buffer.steps[render.currentStepIndex];
				
				if (!currentBufferStep) {
					// No hay más pasos
					return {
						...state,
						render: { ...render, isRendering: false }
					};
				}
				
				// Clonar arrays para modificar
				const newSteps = [...steps];
				const newCanvasCommands = [...canvasCommands];
				const newComponentCommands = [...componentCommands];
				
				// Buscar o crear el paso en el array de renderizado
				let renderStepIndex = newSteps.findIndex(s => s.step === currentBufferStep.step);
				
				if (renderStepIndex === -1) {
					// Crear nuevo paso
					newSteps.push({
						step: currentBufferStep.step,
						title: currentBufferStep.title,
						type: currentBufferStep.type,
						content: '',
						isComplete: false
					});
					renderStepIndex = newSteps.length - 1;
				}
				
				const renderStep = newSteps[renderStepIndex];
				
				// Renderizar siguiente carácter del contenido
				if (render.currentCharIndex < currentBufferStep.content.length) {
					renderStep.content = currentBufferStep.content.substring(0, render.currentCharIndex + 1);
					newSteps[renderStepIndex] = renderStep;
					hasMore = true;
					
					return {
						...state,
						steps: newSteps,
						currentStep: currentBufferStep.step,
						render: {
							...render,
							currentCharIndex: render.currentCharIndex + 1,
							isRendering: true
						}
					};
				}
				
				// Contenido completo, renderizar comandos de canvas de este paso
				const stepCanvasCommands = buffer.canvasCommands.filter(cmd => cmd.step === currentBufferStep.step);
				
				if (render.currentCanvasIndex < stepCanvasCommands.length) {
					const canvasCmd = stepCanvasCommands[render.currentCanvasIndex];
					newCanvasCommands.push(canvasCmd);
					hasMore = true;
					
					return {
						...state,
						steps: newSteps,
						canvasCommands: newCanvasCommands,
						render: {
							...render,
							currentCanvasIndex: render.currentCanvasIndex + 1,
							isRendering: true
						}
					};
				}
				
				// Contenido completo, renderizar comandos de componentes de este paso
				const stepComponentCommands = buffer.componentCommands.filter(cmd => cmd.step === currentBufferStep.step);
				
				if (render.currentComponentIndex < stepComponentCommands.length) {
					const componentCmd = stepComponentCommands[render.currentComponentIndex];
					newComponentCommands.push(componentCmd);
					hasMore = true;
					
					return {
						...state,
						steps: newSteps,
						componentCommands: newComponentCommands,
						render: {
							...render,
							currentComponentIndex: render.currentComponentIndex + 1,
							isRendering: true
						}
					};
				}
				
				// Paso completado, marcar como completo
				renderStep.isComplete = currentBufferStep.isComplete;
				newSteps[renderStepIndex] = renderStep;
				
				// Avanzar al siguiente paso
				if (render.currentStepIndex < buffer.steps.length - 1) {
					hasMore = true;
					const nextStepIndex = render.currentStepIndex + 1;
					const nextBufferStep = buffer.steps[nextStepIndex];
					
					console.log(' Avanzando al paso:', nextStepIndex, 'Step number:', nextBufferStep?.step);
					
					return {
						...state,
						steps: newSteps,
						currentStep: nextBufferStep ? nextBufferStep.step : state.currentStep,
						render: {
							...render,
							currentStepIndex: nextStepIndex,
							currentCharIndex: 0,
							currentCanvasIndex: 0,
							currentComponentIndex: 0,
							isRendering: true
						}
					};
				}
				
				// Todo renderizado
				return {
					...state,
					steps: newSteps,
					render: {
						...render,
						isRendering: false
					}
				};
			});
			
			return hasMore;
		},

		/**
		 * Inicia el proceso de renderizado progresivo
		 */
		startRendering() {
			update((state) => ({
				...state,
				render: {
					...state.render,
					isRendering: true,
					currentStepIndex: 0,
					currentCharIndex: 0,
					currentCanvasIndex: 0,
					currentComponentIndex: 0
				}
			}));
		},

		/**
		 * Detiene el renderizado progresivo
		 */
		stopRendering() {
			update((state) => ({
				...state,
				render: {
					...state.render,
					isRendering: false
				}
			}));
		},

		/**
		 * Actualiza el contenido de un paso específico (para renderizado progresivo)
		 */
		updateStepContent(stepIndex, content) {
			update(state => {
				const newSteps = [...state.steps];
				if (newSteps[stepIndex]) {
					newSteps[stepIndex] = {
						...newSteps[stepIndex],
						content: content
					};
				}
				return {
					...state,
					steps: newSteps
				};
			});
		},

		/**
		 * Actualiza el paso actual
		 */
		setCurrentStep(stepNumber) {
			update(state => ({
				...state,
				currentStep: stepNumber,
				stepProgress: {
					stepNumber: stepNumber,
					percentage: 0,
					charIndex: 0,
					totalChars: 0,
					canvasTriggered: false
				}
			}));
		},
		
		/**
		 * Actualiza el progreso del paso actual
		 */
		updateStepProgress(stepNumber, percentage, charIndex, totalChars) {
			update(state => ({
				...state,
				stepProgress: {
					stepNumber,
					percentage,
					charIndex,
					totalChars,
					canvasTriggered: state.stepProgress.canvasTriggered || percentage >= 50
				}
			}));
		},

		/**
		 * Inicializa los pasos en el store (para syncService)
		 */
		initializeSteps(steps) {
			update(state => ({
				...state,
				steps: steps.map(step => ({
					step: step.step,
					title: step.title,
					content: step.content || '',
					isComplete: step.isComplete || false
				}))
			}));
		},

		clearRenderedContent() {
			update((state) => ({
				...state,
				steps: [],
				canvasCommands: [],
				componentCommands: [],
				currentStep: 0,
				stepProgress: {
					stepNumber: 0,
					percentage: 0,
					charIndex: 0,
					totalChars: 0,
					canvasTriggered: false
				},
				render: {
					...state.render,
					currentStepIndex: 0,
					currentCharIndex: 0,
					currentCanvasIndex: 0,
					currentComponentIndex: 0,
					isRendering: false
				}
			}));
		},

		/**
		 * Marca un paso como completado
		 */
		markStepComplete(stepNumber) {
			update(state => {
				const newSteps = state.steps.map(step => {
					if (step.step === stepNumber) {
						return { ...step, isComplete: true };
					}
					return step;
				});
				return {
					...state,
					steps: newSteps
				};
			});
		},

		/**
		 * Resetea el store a su estado inicial
		 */
		reset() {
			set({
				isConnected: false,
				sessionId: null,
				explanationSessionId: null,
				connectionError: null,
				isExplaining: false,
				isPaused: false,
				isLoading: false,
				waitingMessage: null,
				totalSteps: 0,
				currentStep: 0,
				estimatedDuration: 0,
				questionHash: null,
				stepProgress: {
					stepNumber: 0,
					percentage: 0,
					charIndex: 0,
					totalChars: 0,
					canvasTriggered: false
				},
				steps: [],
				canvasCommands: [],
				componentCommands: [],
				buffer: {
					steps: [],
					canvasCommands: [],
					componentCommands: [],
					isComplete: false
				},
				render: {
					currentStepIndex: 0,
					currentCharIndex: 0,
					currentCanvasIndex: 0,
					currentComponentIndex: 0,
					isRendering: false,
					renderSpeed: 15 // Más rápido para sincronizar mejor con voz
				},
				error: null,
				currentQuestion: null,
				pauseContext: null
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
