<!-- filepath: c:\Users\raul_\Documents\code\guiaipn-web\src\routes\examen\+page.svelte -->
<script lang="ts">
	import { reactivos } from '$lib/data';
	import { examStore } from '$lib/stores/examStore';
	import { questionsAPI } from '$lib/api';
	import { supabase } from '$lib/services';
	import ExamProgress from './componentes/Examprogres.svelte';
	import ModalFinish from './componentes/ModalFinish.svelte';
	import QuestionDisplay from './componentes/QuestionDisplay.svelte';
	import AnswerOptions from './componentes/AnswerOptions.svelte';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	let respuesta;
	let loadingQuestions = true;
	let errorLoadingQuestions = false;

	// Animation state variables
	let isNavigating = false;
	let animateQuestionLeft = false;
	let animateAnswersRight = false;
	let animateProgressOut = false;
	let animateChartOut = false;
	let mainContentFading = false;
	let showMobileChart = false;

	onMount(async () => {
		await loadQuestionsFromAPI();
		if (!errorLoadingQuestions) {
			getQuestionRandom();
		}
	});

	// Cargar preguntas desde la API
	async function loadQuestionsFromAPI() {
		try {
			loadingQuestions = true;
			
			// Obtener token de autenticación
			const { data: { session }, error: sessionError } = await supabase.auth.getSession();
			
			if (sessionError || !session) {
				console.warn('⚠️ No hay sesión activa, usando preguntas locales');
				errorLoadingQuestions = true;
				return;
			}

			const token = session.access_token;
			
			// Llamar a la API para obtener 20 preguntas
			const response = await questionsAPI.getQuestions(token, 1, 20);
			
			if (response && response.questions && response.questions.length > 0) {
				console.log('✅ Preguntas cargadas desde la API:', response.questions.length);
				examStore.loadAPIQuestions(response.questions);
				errorLoadingQuestions = false;
			} else {
				console.warn('⚠️ No se obtuvieron preguntas de la API, usando preguntas locales');
				errorLoadingQuestions = true;
			}
		} catch (error) {
			console.error('❌ Error al cargar preguntas desde la API:', error);
			errorLoadingQuestions = true;
		} finally {
			loadingQuestions = false;
		}
	}

	function finishExam() {
		examStore.finishExam();
	}

	function navigateToExplanation(resp, resCorrect) {
		// Prevent multiple navigation attempts
		if (isNavigating) return;
		isNavigating = true;
		
		let opcionSeleccionada = $examStore.reactivo.opciones.find((opcion) => opcion.key === resp);
		let opcionCorrecta = $examStore.reactivo.opciones.find((opcion) => opcion.key === resCorrect);
		
		// Save current question data to localStorage for possible recovery
		localStorage.setItem('current_question_id', $examStore.reactivo.id);
		localStorage.setItem('current_question_text', $examStore.reactivo.pregunta);
		localStorage.setItem('current_user_answer', opcionSeleccionada.value);
		localStorage.setItem('current_correct_answer', opcionCorrecta.value);
		localStorage.setItem('current_is_correct', $examStore.reactivo.iscorrectQuestion.toString());
		localStorage.setItem('current_is_math_pregunta', ($examStore.reactivo.lengMathPregunta || false).toString());
		localStorage.setItem('current_is_math_opciones', ($examStore.reactivo.lengMathOpciones || false).toString());
		
		// Create URL with query parameters for classroom
		const queryParams = new URLSearchParams({
			id: $examStore.reactivo.id,
			pregunta: $examStore.reactivo.pregunta,
			respuestaUsuario: opcionSeleccionada.value,
			respuestaCorrecta: opcionCorrecta.value,
			iscorrect: $examStore.reactivo.iscorrectQuestion.toString(),
			lengMathPregunta: ($examStore.reactivo.lengMathPregunta || false).toString(),
			lengMathOpciones: ($examStore.reactivo.lengMathOpciones || false).toString()
		});
		
		// Trigger animations using Svelte reactivity
		animateQuestionLeft = true;
		animateAnswersRight = true;
		animateProgressOut = true;
		animateChartOut = true;
		mainContentFading = true;
		
		// Wait for animations to complete before navigation
		setTimeout(() => {
			// Navigate to classroom page with parameters
			goto(`/classRoom?${queryParams.toString()}`);
		}, 900);
	}	// When user returns from explanation page, we need to clean up and continue the exam
	function getQuestionRandom() {
		// Reset UI state
		if ($examStore.showOptionalImage) {
			examStore.toggleOptionalImage();
		}

		// Check if we're returning from explanation page
		const returnFromExplanation = localStorage.getItem('return_from_explanation');
		if (returnFromExplanation === 'true') {
			// Clear the flag
			localStorage.removeItem('return_from_explanation');
			// Clear current question data
			localStorage.removeItem('current_question_id');
			localStorage.removeItem('current_question_text');
			localStorage.removeItem('current_user_answer');
			localStorage.removeItem('current_correct_answer');
			localStorage.removeItem('current_is_correct');
			localStorage.removeItem('current_is_math');
			
			// Add a subtle entrance animation when returning from explanation
			const mainContent = document.querySelector('.text-gray-100') as HTMLElement;
			if (mainContent) {
				mainContent.style.opacity = '0';
				mainContent.style.transition = 'opacity 0.3s ease-in';
				setTimeout(() => {
					mainContent.style.opacity = '1';
				}, 50);
			}
		}

		// Increment question counter and check if exam is complete
		examStore.nextQuestion();
		if ($examStore.currentQuestion > $examStore.totalQuestions) {
			finishExam();
			return;
		}

		// Use API questions if loaded, otherwise fallback to local reactivos
		if ($examStore.questionsLoaded && $examStore.apiQuestions.length > 0) {
			// Use question from API by current index
			const questionIndex = $examStore.currentQuestion - 1;
			const apiQuestion = $examStore.apiQuestions[questionIndex];
			
			if (!apiQuestion) {
				console.error(`API Question with index ${questionIndex} not found.`);
				const updatedReactivo = { ...$examStore.reactivo };
				updatedReactivo.pregunta = 'Error al cargar la pregunta.';
				examStore.setReactivo(updatedReactivo);
				return;
			}
			
			// Extract subject from API question
			const materia = apiQuestion.subject || 'Desconocida';
			examStore.updateMateria(materia);
			
			// Format options from API
			const formattedOptions = Object.entries(apiQuestion.options).map(([key, value]) => ({
				key,
				value: String(value)
			}));
			
			// Update the reactivo in the store with API data
			const updatedReactivo = {
				id: apiQuestion.code,
				respuestaCorrecta: apiQuestion.correct_answer,
				pregunta: apiQuestion.question,
				imgAct: apiQuestion.img_active === true,
				pathImg: $examStore.apiImg + apiQuestion.code + '.png',
				currentQuestion: $examStore.currentQuestion.toString(),
				opciones: formattedOptions,
				iscorrectQuestion: false,
				altIMg: 'guia ipn Imagen de reactivo',
				lengMathPregunta: apiQuestion.leng_math_pregunta,
				lengMathOpciones: apiQuestion.leng_math_opciones
			};
			
			examStore.setReactivo(updatedReactivo);
		} else {
			// Fallback to local reactivos
			if (!reactivos.length) {
				console.error('Reactivos data is empty.');
				const updatedReactivo = { ...$examStore.reactivo };
				updatedReactivo.pregunta = 'Error al cargar la pregunta.';
				examStore.setReactivo(updatedReactivo);
				return;
			}

			// Select random question from local data
			const idRandom = Math.floor(Math.random() * reactivos.length);
			const selectedReactivo = reactivos[idRandom];

			if (!selectedReactivo) {
				console.error(`Reactivo with index ${idRandom} not found.`);
				const updatedReactivo = { ...$examStore.reactivo };
				updatedReactivo.pregunta = 'Error al cargar la pregunta.';
				examStore.setReactivo(updatedReactivo);
				return;
			}

			// Update reactivo state with selected question data
			const { id, resuesta, pregunta, opciones, imgActive, lengMathPregunta, lengMathOpciones } = selectedReactivo;

			// Extract materia from id
			const materia = id.length > 6 ? id.substring(4, id.length - 2) : 'Desconocida';
			examStore.updateMateria(materia);

			// Format options
			const formattedOptions = Object.entries(opciones).map(([key, value]) => ({
				key,
				value: String(value)
			}));

			// Update the reactivo in the store
			const updatedReactivo = {
				id,
				respuestaCorrecta: resuesta,
				pregunta,
				imgAct: imgActive === true,
				pathImg: $examStore.apiImg + id + '.png',
				currentQuestion: $examStore.currentQuestion.toString(),
				opciones: formattedOptions,
				iscorrectQuestion: false,
				altIMg: 'guia ipn Imagen de reactivo',
				lengMathPregunta: lengMathPregunta,
				lengMathOpciones: lengMathOpciones
			};

			examStore.setReactivo(updatedReactivo);
		}
	}

	// Función para alternar la visualización de la imagen opcional
	function toggleOptionalImage() {
		examStore.toggleOptionalImage();
	}
	// Función para alternar la visualización de la solución
	function toggleSolution() {
		examStore.toggleSolution();
	}
	function selectOption(resp) {
		respuesta = resp;
		// Validar la respuesta
		if (resp === $examStore.reactivo.respuestaCorrecta) {
			// Actualizar estado para marcar como correcta
			const updatedReactivo = { ...$examStore.reactivo, iscorrectQuestion: true };
			examStore.setReactivo(updatedReactivo);

			// Guardar respuesta correcta
			examStore.saveAnswer($examStore.currentQuestion, true);
		} else {
			// Actualizar estado para marcar como incorrecta
			const updatedReactivo = { ...$examStore.reactivo, iscorrectQuestion: false };
			examStore.setReactivo(updatedReactivo);

			// Guardar respuesta incorrecta
			examStore.saveAnswer($examStore.currentQuestion, false);

			if ($examStore.showSolution) {
				// Navigate to explanation page
				navigateToExplanation(resp, $examStore.reactivo.respuestaCorrecta);
				return; // Don't proceed to next question yet
			}
		}

		// Pasar a la siguiente pregunta
		getQuestionRandom();
	}
</script>

<!-- Add a wrapper for positioning bubbles -->
<div class="text-gray-100 overflow-hidden" class:opacity-30={mainContentFading} class:transition-all={mainContentFading} class:duration-500={mainContentFading}>
	<!-- Main content container - Mobile optimized -->
	<div class="relative z-10 flex flex-col items-center justify-center min-h-screen container-mobile py-4 sm:py-6">
		<div class="w-full max-w-4xl space-y-4 sm:space-y-6">
			
			{#if loadingQuestions}
				<!-- Loading State -->
				<div class="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
					<div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
					<p class="text-lg text-gray-300">Cargando preguntas desde el servidor...</p>
				</div>
			{:else if errorLoadingQuestions}
				<!-- Error State - Using Local Questions -->
				<div class="bg-yellow-900/20 border border-yellow-600/50 rounded-lg p-4 mb-4">
					<p class="text-yellow-300 text-sm">
						⚠️ No se pudieron cargar las preguntas desde el servidor. Usando preguntas locales.
					</p>
				</div>
			{/if}
			
			{#if !loadingQuestions}
				<!-- Question Card - Mobile optimized -->
				<section
					class="spacing-mobile sm:p-6 shadow-lg space-y-3 sm:space-y-4 animate-mobile-fade"
					class:animate-slide-left={animateQuestionLeft}
				>
					<!-- Question content and image -->
					<QuestionDisplay {toggleOptionalImage} {toggleSolution}  />
					<div class="flex-1 min-w-[65%] animate-mobile-fade" class:animate-fade-out={animateProgressOut}>
						<ExamProgress
							currentQuestion={$examStore.currentQuestion}
							totalQuestions={$examStore.totalQuestions}
							answers={$examStore.answers}
						/>
					</div>
				</section>
				
				<!-- Answer options component - Mobile optimized -->
				<div class="animate-mobile-slide" class:animate-slide-right={animateAnswersRight}>
					<AnswerOptions {selectOption} />
				</div>

				{#if $examStore.finish}
					<ModalFinish answers={$examStore.answers} />
				{/if}
			{/if}
		</div>
	</div>
</div>

<style>
    /* New animations for transitions */
	@keyframes slideLeft {
		0% { transform: translateX(0); opacity: 1; }
		100% { transform: translateX(-100px); opacity: 0; }
	}
	
	@keyframes slideRight {
		0% { transform: translateX(0); opacity: 1; }
		100% { transform: translateX(100px); opacity: 0; }
	}
	
	@keyframes fadeOut {
		0% { opacity: 1; }
		100% { opacity: 0; }
	}
	
	.animate-slide-left {
		animation: slideLeft 0.5s ease-out forwards;
	}
	
	.animate-slide-right {
		animation: slideRight 0.5s ease-out forwards;
	}
	
	.animate-fade-out {
		animation: fadeOut 0.4s ease-out forwards;
	}
	
	/* Add entrance animations for when returning from explanation */
	@keyframes slideInLeft {
		0% { transform: translateX(-100px); opacity: 0; }
		100% { transform: translateX(0); opacity: 1; }
	}
	
	@keyframes slideInRight {
		0% { transform: translateX(100px); opacity: 0; }
		100% { transform: translateX(0); opacity: 1; }
	}
</style>
