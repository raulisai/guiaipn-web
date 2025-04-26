<!-- filepath: c:\Users\raul_\Documents\code\guiaipn-web\src\routes\examen\+page.svelte -->
<script lang="ts">
	import { reactivos } from '$lib/reactivos';
	import { examStore } from '$lib/stores/examStore';
	import ExamProgress from './componentes/Examprogres.svelte';
	import IAResponse from './componentes/GenerationIAResponse.svelte';
	import ModalFinish from './componentes/ModalFinish.svelte';
	import QuestionDisplay from './componentes/QuestionDisplay.svelte';
	import QuestionHeader from './componentes/QuestionHeader.svelte';
	import AnswerOptions from './componentes/AnswerOptions.svelte';
	import RadarChart from './componentes/RadarChart.svelte';
	import { onMount } from 'svelte';

	let respuesta;
	let modalRef; // Referencia al componente hijo

	onMount(() => {
		getQuestionRandom();
	});

	function finishExam() {
		examStore.finishExam();
	}

	function UpdateResponseOfModal(resp, resCorrect) {
		let opcionSeleccionada = $examStore.reactivo.opciones.find((opcion) => opcion.key === resp);
		let opcionCorrecta = $examStore.reactivo.opciones.find((opcion) => opcion.key === resCorrect);
		if (modalRef) {
			modalRef.updateData(opcionSeleccionada.value, opcionCorrecta.value);
		}
	}

	function getQuestionRandom() {
		// Reset UI state
		if ($examStore.showOptionalImage) {
			examStore.toggleOptionalImage();
		}

		// Increment question counter and check if exam is complete
		examStore.nextQuestion();
		if ($examStore.currentQuestion > $examStore.totalQuestions) {
			finishExam();
			return;
		}

		// Validate reactivos data
		if (!reactivos.length) {
			console.error('Reactivos data is empty.');

			const updatedReactivo = { ...$examStore.reactivo };
			updatedReactivo.pregunta = 'Error al cargar la pregunta.';
			examStore.setReactivo(updatedReactivo);
			return;
		}

		// Select random question
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
		const { id, resuesta, pregunta, opciones, imgActive } = selectedReactivo;

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
			altIMg: 'guia ipn Imagen de reactivo'
		};

		examStore.setReactivo(updatedReactivo);
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
				// Abrir modal con la respuesta correcta
				modalRef.toogleModal();
				UpdateResponseOfModal(resp, $examStore.reactivo.respuestaCorrecta);
			}
		}

		// Pasar a la siguiente pregunta
		getQuestionRandom();
	}
</script>

<!-- Add a wrapper for positioning bubbles -->
<div class="text-gray-100 overflow-hidden">
	<!-- Main content container -->
	<div class="relative z-10 flex flex-col items-center justify-center min-h-screen p-4 sm:p-6">
		<div class="w-full max-w-4xl space-y-6">
			<!-- Progress bar component -->
			<div class="flex flex-wrap items-center justify-between gap-4 ">
				<div class="flex-1 min-w-[65%] mt-12">
					<ExamProgress
						currentQuestion={$examStore.currentQuestion}
						totalQuestions={$examStore.totalQuestions}
						answers={$examStore.answers}
					/>
				</div>
				{#if Object.keys($examStore.answers).length > 0}
					<div class="stat-chart-container animate-fadeIn">
						<div class="stat-title text-xs text-center text-cyan-300 mb-1 font-medium">
							<span class="flex items-center justify-center">
								<span class="w-1.5 h-1.5 bg-cyan-400 rounded-full mr-1 animate-pulse"></span>
								Rendimiento
							</span>
						</div>
						<RadarChart
							answers={$examStore.answers}
							size="140px"
							height="140px"
							customClass="compact-chart"
							showTitle={false}
						/>
					</div>
				{/if}
			</div>

			<!-- Question Card -->
			<section
				class="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4 sm:p-6 shadow-lg space-y-4"
			>
				<!-- Question header with solution toggle -->
				<QuestionHeader {toggleSolution} />

				<!-- Question content and image -->
				<QuestionDisplay {toggleOptionalImage} />
			</section>

			<!-- Answer options component -->
			<AnswerOptions {selectOption} />

			<!-- Modal components -->
			<IAResponse
				bind:this={modalRef}
				pregunta={$examStore.reactivo.pregunta}
				id={$examStore.reactivo.id}
				iscorrect={$examStore.reactivo.iscorrectQuestion}
			/>

			{#if $examStore.finish}
				<ModalFinish answers={$examStore.answers} />
			{/if}
		</div>
	</div>
</div>

<style>
	   .animate-fadeIn {
        animation: fadeIn 0.5s ease-out forwards;
    }
    
    
    .stat-chart-container {
        position: relative;
        z-index: 5;
        margin-top: 0.5rem;
        border-radius: 0.5rem;
        overflow: hidden;
        box-shadow: 0 0 10px rgba(0, 183, 255, 0.1);
        transition: all 0.3s ease;
        background: rgba(17, 24, 39, 0.7);
        border: 1px solid rgba(0, 183, 255, 0.2);
        backdrop-filter: blur(4px);
    }
    
    .stat-title {
        text-shadow: 0 0 5px rgba(0, 183, 255, 0.5);
        letter-spacing: 0.5px;
    }
    
    .stat-chart-container:hover {
        transform: translateY(-2px) scale(1.03);
        box-shadow: 0 0 15px rgba(0, 183, 255, 0.2);
    }
    
</style>
