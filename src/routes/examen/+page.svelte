<script lang="ts">
	import { reactivos } from '$lib/reactivos';
	import ExamProgress from './Examprogres.svelte';
    import Timer from './Timer.svelte';
	import { onMount } from 'svelte';

	let currentQuestion = 1;
	const totalQuestions = 140;
	let Pregunta = 'cuanto es 2+2';
	let answers: { [key: number]: string } = {};
	let idreactivoActual = 'exm2024V1Math04';
	let iscorrectQuestion = false;
	let respuestas;
	let respuestaCorrecta = '';

	onMount(() => {
		// Inicializar el temporizador
		let idRandom = Math.floor(Math.random() * 18);
		console.log(reactivos[idRandom]);

		respuestaCorrecta = reactivos[idRandom].respuestaCorrecta;
		Pregunta = reactivos[idRandom].pregunta;
		respuestas = Object.entries(reactivos[idRandom].opciones).map(([key, value]) => ({
			key,
			value
		}));

		console.log(respuestas);
	});

	function selectOption(resp) {
		//validar la respuesta
		if (resp === respuestaCorrecta) {
			iscorrectQuestion = true;
			document.getElementById('btn-' + resp).classList.add('bg-green-500');
			document.getElementById('btn-' + resp).classList.remove('bg-white/10');
		} else {
			iscorrectQuestion = false;
			document.getElementById('btn-' + resp).classList.add('bg-red-500');
			document.getElementById('btn-' + resp).classList.remove('bg-white/10');
		}
	}
</script>

<div class=" mb-56 mt-36">
	<div class="max-w-3xl text-center space-y-8 ">
		<h1 class="text-5xl font-bold text-white mb-6">Examen del IPN Asistido por IA</h1>

        

		<!-- Separador -->
		<div class="border-t border-white/20 w-24 mx-auto"></div>

		<ExamProgress {currentQuestion} {totalQuestions} {answers} />
       
		<!-- Pregunta -->
		<div
			class="w-full px-6 py-4 rounded-md backdrop-blur-sm
            border border-white/30 text-white"
		>
			{Pregunta}
			<p id="question"></p>
		</div>
        
		<!-- Respuesta -->
		<div class="relative mt-12 max-w-md mx-auto">
			<!-- Contenedor de tarjetas -->
			<div class="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mt-12">
				{#each respuestas as respuesta, index}
					<button
						class="card bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4
                hover:shadow-lg cursor-pointer transition-all duration-300
                min-h-[100px] flex items-center justify-center"
						onclick={() => selectOption(respuesta.key)}
						id="btn-{respuesta.key}"
						aria-label="Respuesta {respuesta.key}"
					>
						<p class="text-white font-medium">{respuesta.key + ':' + respuesta.value}</p>
					</button>
				{/each}
			</div>
		    
			<div class="fixed top-4 left-4 z-50">
				<a href="/" class="flex items-center justify-center">
					<img src="logoipnburrito.png" alt="Logo de la guia del IPN" class="w-[150px]" />
				</a>
			</div>
		</div>
	</div>

     <!-- Temporizador y Estadísticas -->
     <div class="flex flex-col mt-16 md:flex-row items-center justify-between gap-6 bg-white/5 rounded-lg p-4 backdrop-blur-sm border border-white/20">
        <!-- Temporizador circular -->
        <div class="timer-circle flex-shrink-0">
            
            <Timer initialSeconds={0} />
        </div>
        
        <!-- Estadísticas de habilidades con trapecios -->
        <div class="w-full">
            <h3 class="text-white text-lg font-medium mb-3">Estadísticas de habilidades</h3>
            <div class="grid grid-cols-2 gap-3">
                <div class="skill-bar">
                    <div class="flex justify-between mb-1">
                        <span class="text-sm text-white/80">Matemáticas</span>
                        <span class="text-sm text-white/80">75%</span>
                    </div>
                    <div class="h-6 relative">
                        <div class="absolute inset-0 bg-white/10" style="clip-path: polygon(0% 0%, 100% 20%, 100% 80%, 0% 100%)"></div>
                        <div class="absolute inset-0 bg-blue-500" style="clip-path: polygon(0% 0%, 75% 20%, 75% 80%, 0% 100%)"></div>
                    </div>
                </div>
                <div class="skill-bar">
                    <div class="flex justify-between mb-1">
                        <span class="text-sm text-white/80">Física</span>
                        <span class="text-sm text-white/80">60%</span>
                    </div>
                    <div class="h-6 relative">
                        <div class="absolute inset-0 bg-white/10" style="clip-path: polygon(0% 0%, 100% 20%, 100% 80%, 0% 100%)"></div>
                        <div class="absolute inset-0 bg-green-500" style="clip-path: polygon(0% 0%, 60% 20%, 60% 80%, 0% 100%)"></div>
                    </div>
                </div>
                <div class="skill-bar">
                    <div class="flex justify-between mb-1">
                        <span class="text-sm text-white/80">Química</span>
                        <span class="text-sm text-white/80">80%</span>
                    </div>
                    <div class="h-6 relative">
                        <div class="absolute inset-0 bg-white/10" style="clip-path: polygon(0% 0%, 100% 20%, 100% 80%, 0% 100%)"></div>
                        <div class="absolute inset-0 bg-purple-500" style="clip-path: polygon(0% 0%, 80% 20%, 80% 80%, 0% 100%)"></div>
                    </div>
                </div>
                <div class="skill-bar">
                    <div class="flex justify-between mb-1">
                        <span class="text-sm text-white/80">Biología</span>
                        <span class="text-sm text-white/80">45%</span>
                    </div>
                    <div class="h-6 relative">
                        <div class="absolute inset-0 bg-white/10" style="clip-path: polygon(0% 0%, 100% 20%, 100% 80%, 0% 100%)"></div>
                        <div class="absolute inset-0 bg-yellow-500" style="clip-path: polygon(0% 0%, 45% 20%, 45% 80%, 0% 100%)"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>

	<!-- Símbolo decorativo -->
	<div class="absolute bottom-8 right-8 text-white/50 text-2xl">※dj</div>
</div>

<style>
	.card {
		transition: all 0.3s ease;
	}
	.card:hover,
	.card.selected {
		transform: scale(1.05);
		border-color: #22d3ee !important;
	}
	.timer-container {
		background-color: #216271;
		box-shadow:
			inset 4px 4px 10px #2a7986,
			inset -4px -4px 10px #2a7986;
		backdrop-filter: blur(8px);
	}
</style>
