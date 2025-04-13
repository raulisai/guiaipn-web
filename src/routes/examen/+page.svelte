<script lang="ts">
	import { reactivos } from '$lib/reactivos';
	import ExamProgress from './Examprogres.svelte';
	import Estadisticas from './Estadisticas.svelte';
	import ModalResponse from './ModalResponse.svelte';
	import ModalFinish from './ModalFinish.svelte';
	import MathForm from './Math.svelte';
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
		pathImg: apiImg+'2024Algebra03.png',
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
		reactivo.respuestaCorrecta = reactivos[idRandom].respuestaCorrecta;
		reactivo.pregunta = reactivos[idRandom].pregunta;
		
		reactivo.pathImg = apiImg+id+'.png'; // Actualiza la ruta de la imagen
		console.log(reactivo.pathImg);
		reactivo.opciones = Object.entries(reactivos[idRandom].opciones).map(([key, value]) => ({
			key,
			value
		}));
		reactivo.currentQuestion = currentQuestion.toString();

		//console.log(reactivo.opciones);
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

<div class="mb-20 mt-36">
	<div class="max-w-6xl px-6 text-center space-y-8">
		<h1 class="text-5xl font-bold mb-6 relative cyberpunk-title">
			<span class="cyberpunk-title text-transparent bg-clip-text texto-rojo"> Examen del IPN </span>
			<span class="block text-3xl mt-1 text-cyan-300 font-light tracking-widest"
				>Asistido por IA</span
			>
			
			<div class="absolute -left-2 top-1/2 w-4 h-8 bg-cyan-400/30 blur-sm"></div>
			<div
				class="absolute -bottom-1 left-0 h-px w-full bg-gradient-to-r from-cyan-500 to-transparent"
			></div>
		</h1>

		<!-- Separador -->
		<div class="border-t border-white/20 w-24 mx-auto"></div>

		<ExamProgress {currentQuestion} {totalQuestions} {answers} />
		
		<!-- Pregunta -->
		<div
			class="w-full px-6 py-4 rounded-md backdrop-blur-sm
            border border-white/30 text-white card_color glow-effect"
		>
			<div class="question-container">
				<div class="question-header">
					<span class="question-number">Pregunta {reactivo.currentQuestion}
					</span>
					<span class="question-badge">Matemáticas</span>
				</div>
				<div class="question-content">
					<svg
						class="question-icon"
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"
						></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg
					>
					<div id="question" class=" contrast-more:text-white/90 text-sm sm:text-base line-clamp-3 overflow-hidden">
				
							<MathForm isBlock={false} content={reactivo.pregunta}  />
						
					</div>
				</div>
				<img src={reactivo.pathImg} alt="">
			</div>
		</div>
		<!-- Respuesta -->
		<div class="relative mt-12 mx-auto">
			<!-- Contenedor de tarjetas -->
			<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mx-auto mt-12">
				{#each reactivo.opciones as respuesta, index}
					<button
						class="card card_color glow-effect backdrop-blur-sm border border-white/20 rounded-lg p-4
                hover:shadow-lg cursor-pointer transition-all duration-300
                min-h-[100px] flex items-center justify-center"
						onclick={() => selectOption(respuesta.key)}
						id="btn-{respuesta.key}"
						aria-label="Respuesta {respuesta.key}"
					>
						<div class="w-full h-full flex flex-col justify-center">
							<span class="text-white font-bold text-lg mb-1">{respuesta.key}</span>
							<p class="text-white/90 text-sm sm:text-base line-clamp-3 overflow-hidden">
								<MathForm isBlock={false} content={respuesta.value}  />
							</p>
						</div>
					</button>
				{/each}
			</div>
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

<style>
	.card {
		transition: all 0.3s ease;
	}

	.question-container {
		padding: 1.5rem;
		border-radius: 0.5rem;
		background-color: rgba(255, 255, 255, 0.05);
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
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
		align-items: flex-start;
		gap: 1rem;
	}

	.question-icon {
		flex-shrink: 0;
		color: rgba(255, 255, 255, 0.7);
		margin-top: 0.25rem;
	}

	.question-text {
		font-size: 1.25rem;
		line-height: 1.6;
		font-weight: 500;
		color: rgba(255, 255, 255, 0.95);
		text-align: left;
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

	.animate-text-glow {
		animation: text-glow 2s ease-in-out infinite alternate;
	}

	.animate-line-glow {
		animation: line-glow 1.5s ease-in-out infinite;
	}

	@keyframes text-glow {
		from {
			filter: drop-shadow(0 0 5px rgba(32, 74, 44, 0.3));
		}
		to {
			filter: drop-shadow(0 0 15px rgba(34, 211, 238, 0.6));
		}
	}

	@keyframes line-glow {
		0% {
			opacity: 0.4;
		}
		50% {
			opacity: 1;
		}
		100% {
			opacity: 0.4;
		}
	}

	.texto-rojo {
		text-shadow:
			0 0 10px #512a2aaa,
			0 0 20px #82585855,
			0 0 2px #ddc8c8;
		color: #e30000;
	}
</style>
