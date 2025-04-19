<script lang="ts">
	import { reactivos } from '$lib/reactivos';
	import ExamProgress from './componentes/Examprogres.svelte';
	import Estadisticas from './componentes/Estadisticas.svelte';
	import ModalResponse from './componentes/ModalResponse.svelte';
	import ModalFinish from './componentes/ModalFinish.svelte';
	import MathForm from './componentes/Math.svelte';
	import { onMount } from 'svelte';

	const totalQuestions = 4;
	let answers = $state<{ [key: number]: string }>({});
	let respuesta;
	let currentQuestion = $state(0);
	let apiImg = 'https://img-reactivos.s3.us-east-2.amazonaws.com/'; // URL de la imagen

	let finish = $state(false); // Estado para controlar el modal de finalización

	let modalRef; // Referencia al componente hijo

	let reactivo = $state({
		id: 'exm2024V1Math04',
		currentQuestion: '0',
		pregunta: 'cuanto es 2+2',
		iscorrectQuestion: false,
		opciones: [],
		respuestaCorrecta: 'A',
		pathImg: apiImg + '2024Algebra03.png',
		altIMg: 'guia ipn Imagen de reactivo'
	});

	onMount(() => {
		// Inicializar el temporizador
		getQuestionRandom();
	});

	function finishExam() {
		finish = true; // Cambia el estado para mostrar el modal de finalización
	}

	function UpdateResponseOfModal(resp, resCorrect) {
		let opcionSeleccionada = reactivo.opciones.find((opcion) => opcion.key === resp);
		let opcionCorrecta = reactivo.opciones.find((opcion) => opcion.key === resCorrect); // Correct answer
		if (modalRef) {
			modalRef.updateData(opcionSeleccionada.value, opcionCorrecta.value); // Llama a la función del hijo
		}
	}

	function getQuestionRandom() {
		let idRandom = Math.floor(Math.random() * 100);
		currentQuestion = currentQuestion + 1;

		if (currentQuestion > totalQuestions) {
			finishExam(); // Llama a la función para finalizar el examen
			return;
		}
		let id = reactivos[idRandom].id;
		reactivo.respuestaCorrecta = reactivos[idRandom].resuesta;
		reactivo.pregunta = reactivos[idRandom].pregunta;

		reactivo.pathImg = apiImg + id + '.png'; // Actualiza la ruta de la imagen
		reactivo.opciones = Object.entries(reactivos[idRandom].opciones).map(([key, value]) => ({
			key,
			value
		}));
		reactivo.currentQuestion = currentQuestion.toString();
	}

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

<div class="flex flex-col items-center justify-center min-h-screen main_container">
	<div class="w-full max-w-[80vw] p-6 rounded-lg">
		<div class="text-center">
			<h1 class="text-5xl font-bold mb-6 relative cyberpunk-title">
				<span class="cyberpunk-title text-transparent bg-clip-text texto-rojo">
					Examen del IPN
				</span>
				<span class="block text-3xl mt-1 text-cyan-300 font-light tracking-widest">
					Asistido por IA
				</span>
				<div class="absolute-left-2 top-1/2 w-4 h-8 bg-cyan-400/30 blur-sm"></div>
				<div
					class="absolute-bottom-1 left-0 h-px w-full bg-gradient-to-r from-cyan-500 to-transparent"
				></div>
			</h1>
		</div>
		<div class="">
			<ExamProgress {currentQuestion} {totalQuestions} {answers} />

				<div class="question-container">
					<div class="card_color glow-effect backdrop-blur-sm border border-white/20 px-4 py-6">
						<div class="question-header">
							<span class="question-number">Pregunta {reactivo.currentQuestion}</span>
							<span class="question-badge">Matemáticas</span>
						</div>
						<div class="question-content flex flex-col items-center gap-4 rounded-md">
							<div id="question" class="relative question question-text  break-words p-4">
								<p class="text-center break-words md:whitespace-normal">
									<MathForm isBlock={false} content={reactivo.pregunta} />
								</p>
							</div>
							<div class="flex question-imgreference w-full justify-center">
								<img
									src={reactivo.pathImg}
									alt={reactivo.altIMg}
									class="w-auto h-auto max-w-full max-h-[60vh] object-contain"
								/>
							</div>
						</div>
					</div>

					<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mx-auto mt-12">
						{#each reactivo.opciones as respuesta, index}
							<button
								class="block w-full px-4 py-2 mt-2 text-left text-gray-700 rounded card card_color glow-effect backdrop-blur-sm border border-white/20"
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
					<Estadisticas />
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
</div>

<style>
	.texto-rojo {
		text-shadow:
			0 0 10px #512a2aaa,
			0 0 20px #82585855,
			0 0 2px #ddc8c8;
		color: #e30000;
	}

	.main_container {
		width: 95vw;
	}

	.question-container {
		border-radius: 0.5rem;
		animation: fadeIn 0.5s ease-out;
	}
	.question-header {
		display: flex;
		justify-content: space-between;
		margin-bottom: 1rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
		padding-bottom: 0.5rem;
	}

	.question-number {
		font-weight: 600;
		color: rgba(255, 255, 255, 0.9);
	}

	.question-badge {
		background-color: rgba(59, 130, 246, 0.3);
		padding: 0.25rem 0.75rem;
		border-radius: 9999px;
		font-size: 0.75rem;
		font-weight: 600;
	}

	.question-content {
		display: flex;
		justify-content: center;
		gap: 1rem;
	}
/*
	.question-icon {
		flex-shrink: 0;
		color: rgba(255, 255, 255, 0.7);
		margin-top: 0.25rem;
	}
	 */
	.question-imgreference {
    position: relative;
    min-height: 100px; /* Altura mínima preventiva */
    margin: 1rem 0;
}

.question-imgreference img {
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
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

@media (min-width: 1920px) {
    .question-imgreference {
        max-width: 80%;
        margin: 2rem auto;
    }
}
</style>
