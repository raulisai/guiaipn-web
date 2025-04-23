<script lang="ts">
	import { reactivos } from '$lib/reactivos';
	import ExamProgress from './componentes/Examprogres.svelte';
	import Estadisticas from './componentes/Estadisticas.svelte';
	import ModalResponse from './componentes/ModalResponse.svelte';
	import ModalFinish from './componentes/ModalFinish.svelte';
	import MathForm from './componentes/Math.svelte';
	import { onMount } from 'svelte';
	import { Eye, EyeOff } from 'lucide-svelte'; // Example using lucide icons

	const totalQuestions = 20;
	let answers = $state<{ [key: number]: string }>({});
	let respuesta;
	let currentQuestion = $state(0);
	let materiaQuestion = $state('Matematicas'); // Materia de la pregunta
	let apiImg = 'https://img-reactivos.s3.us-east-2.amazonaws.com/'; // URL de la imagen

	let finish = $state(false); // Estado para controlar el modal de finalización

	let modalRef; // Referencia al componente hijo
	let showOptionalImage = $state(false); // State to control visibility of optional image

	let reactivo = $state({
		id: 'exm2024V1Math04',
		currentQuestion: '0',
		pregunta: 'cagando pregunta...si continua asi recarga la pagina',
		iscorrectQuestion: false,
		opciones: [],
		respuestaCorrecta: 'A',
		pathImg: apiImg + '2024Algebra03.png',
		altIMg: 'guia ipn Imagen de reactivo',
		imgAct: false // Initialize imgAct
	});

	onMount(() => { getQuestionRandom();});

	function finishExam() { finish = true; }	



	function UpdateResponseOfModal(resp, resCorrect) {
		let opcionSeleccionada = reactivo.opciones.find((opcion) => opcion.key === resp);
		let opcionCorrecta = reactivo.opciones.find((opcion) => opcion.key === resCorrect); // Correct answer
		if (modalRef) {
			modalRef.updateData(opcionSeleccionada.value, opcionCorrecta.value); // Llama a la función del hijo
		}
	}

	function getQuestionRandom() {
		// Reset UI state
		showOptionalImage = false;
		
		// Increment question counter and check if exam is complete
		currentQuestion += 1;
		if (currentQuestion > totalQuestions) {
			finishExam();
			return;
		}
		
		// Validate reactivos data
		if (!reactivos.length) {
			console.error('Reactivos data is empty.');
			reactivo.pregunta = 'Error al cargar la pregunta.';
			return;
		}
		
		// Select random question
		const idRandom = Math.floor(Math.random() * reactivos.length);
		const selectedReactivo = reactivos[idRandom];
		
		if (!selectedReactivo) {
			console.error(`Reactivo with index ${idRandom} not found.`);
			reactivo.pregunta = 'Error al cargar la pregunta.';
			return;
		}
		
		// Update reactivo state with selected question data
		const { id, resuesta, pregunta, opciones, imgActive } = selectedReactivo;
		
		reactivo.id = id;
		reactivo.respuestaCorrecta = resuesta;
		reactivo.pregunta = pregunta;
		reactivo.imgAct = imgActive === true;
		reactivo.pathImg = apiImg + id + '.png';
		reactivo.currentQuestion = currentQuestion.toString();
		
		// Extract materia from id
		materiaQuestion = id.length > 6 ? id.substring(4, id.length - 2) : 'Desconocida';
		
		// Format options
		reactivo.opciones = Object.entries(opciones).map(([key, value]) => ({
			key,
			value: String(value)
		}));
	}

	const toggleOptionalImage = () => showOptionalImage = !showOptionalImage;

	function selectOption(resp) {
		respuesta = resp;
		//validar la respuesta
		if (resp === reactivo.respuestaCorrecta) {
			reactivo.iscorrectQuestion = true;
			answers[currentQuestion] = 'true'; // Store correct answer
			alert('Correcto!');
		} else {
			reactivo.iscorrectQuestion = false;
			answers[currentQuestion] = 'false'; // Store correct answer
			modalRef.toogleModal(); // Abre el modal
			UpdateResponseOfModal(resp, reactivo.respuestaCorrecta); // Pass the correct answer
		}

		getQuestionRandom();
	}
</script>

<!-- Add a wrapper for positioning bubbles -->
<div class=" text-gray-100 overflow-hidden">
	<!-- ...existing bubble container... -->

	<!-- Main content container -->
	<div class="relative z-10 flex flex-col items-center justify-center min-h-screen p-4 sm:p-6">
		<div class="w-full max-w-4xl space-y-6">
			<!-- ...existing header... -->

			<ExamProgress {currentQuestion} {totalQuestions} {answers} />

			<!-- Question Card -->
			<section class="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4 sm:p-6 shadow-lg space-y-4">
				<div class="flex justify-between items-center pb-2 border-b border-gray-700/50">
					<span class="font-semibold text-gray-200">Pregunta {reactivo.currentQuestion}</span>
					<!-- Updated badge style: transparent background, light border, adjusted text color -->
					<span class="question-badge text-xs font-medium border border-blue-400/30 text-blue-300 px-3 py-1 rounded-full bg-transparent shadow-sm">
						{materiaQuestion}
					</span>
				</div>
				<div class="question-content flex flex-col items-center gap-4 rounded-md">
					<!-- Container for question text - enables horizontal scroll on mobile -->
					<div id="question" class="question-text-container relative w-full p-4">
						<!-- Inner div to handle nowrap -->
						<div class="question-text-content">
							<MathForm isBlock={false} content={reactivo.pregunta} />
						</div>
					</div>

					<!-- Image Container - Conditional Display -->
					<div class="flex question-imgreference w-full justify-center items-center min-h-[50px]">
						{#if reactivo.imgAct}
							<!-- Image shown by default if imgAct is true -->
							<img
								src={reactivo.pathImg}
								alt={reactivo.altIMg}
								class="w-auto h-auto max-w-full max-h-[60vh] object-contain rounded border border-gray-700/30"
							/>
						{:else if reactivo.pathImg}
							<!-- Image is optional (imgAct is false but path exists) -->
							{#if showOptionalImage}
								<!-- Show image if button was clicked -->
								<img
									src={reactivo.pathImg}
									alt={reactivo.altIMg}
									class="w-auto h-auto max-w-full max-h-[60vh] object-contain rounded border border-gray-700/30"
								/>
							{:else}
								<!-- Show button to reveal image -->
								<button
									onclick={toggleOptionalImage}
									class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/50 rounded-md text-blue-200 transition text-sm"
									aria-label="Mostrar imagen de referencia"
								>
									<Eye size={16} />
									Mostrar Imagen
								</button>
							{/if}
						{/if}
						<!-- No image or button is rendered if reactivo.pathImg is empty -->
					</div>
				</div>
			</section>

			<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mx-auto mt-12">
				{#each reactivo.opciones as respuesta, index}
					<button
						class="block w-full px-4 py-2 mt-2 text-left text-gray-700 rounded card bg-gray-800/10 glow-effect backdrop-blur-sm border border-white/20"
						onclick={() => selectOption(respuesta.key)}
						id="btn-{respuesta.key}"
						aria-label="Respuesta {respuesta.key}"
					>
						<div class="w-full h-full flex flex-col justify-center">
							<span class="text-white font-bold text-lg mb-1">{respuesta.key}</span>
							<p class="text-white/90 text-sm sm:text-base line-clamp-3 overflow-hidden">
								<MathForm isBlock={false} content={respuesta.value} />
							</p>
						</div>
					</button>
				{/each}
			</div>
			<!-- <Estadisticas /> -->
			
			<ModalResponse
				bind:this={modalRef}
				pregunta={reactivo.pregunta}
				id={reactivo.id}
				iscorrect={reactivo.iscorrectQuestion}
			/>
			{#if finish}
				<ModalFinish {answers} />
			{/if}
		</div>
	</div>
</div>

<style>

	.question-text-content {
		text-align: center; /* Center text on larger screens */
		word-wrap: break-word; /* Ensure long words wrap */
	}

	.question-imgreference {
    position: relative;
    min-height: 100px; /* Altura mínima preventiva */
    margin: 1rem 0;
}

.question-imgreference img {
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.027);
}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* Apply horizontal scroll only on small screens */
	@media (max-width: 640px) {
		.question-text-container {
			overflow-x: auto; /* Enable horizontal scroll */
			/* Add some padding for scrollbar visibility if needed */
			padding-bottom: 12px;
			/* Optional: Style the scrollbar for webkit browsers */
			scrollbar-width: thin; /* Firefox */
			scrollbar-color: rgba(107, 114, 128, 0.5) transparent; /* Firefox */
		}
		.question-text-container::-webkit-scrollbar {
			height: 4px; /* Height of horizontal scrollbar */
		}
		.question-text-container::-webkit-scrollbar-track {
			background: transparent; /* Track background */
		}
		.question-text-container::-webkit-scrollbar-thumb {
			background-color: rgba(107, 114, 128, 0.5); /* Scrollbar color */
			border-radius: 20px; /* Roundness of the scrollbar */
			border: 3px solid transparent; /* Creates padding around scroll thumb */
		}

		.question-text-content {
			white-space: nowrap; /* Prevent text wrapping */
			display: inline-block; /* Necessary for nowrap */
			min-width: 100%; /* Ensure it takes at least the container width */
			text-align: left; /* Align text left when scrolling */
		}
	}

	@media (min-width: 1920px) {
		.question-imgreference {
			max-width: 80%;
			margin: 2rem auto;
		}
	}
</style>
