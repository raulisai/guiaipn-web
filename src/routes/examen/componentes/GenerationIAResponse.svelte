<script>
	let { pregunta, id, iscorrect } = $props();
	import MathForm from './Math.svelte';

	let respuesta = $state({
		correcta: '',
		usuario: ''
	});
	let showModal = $state(false);
	let explication = $state();
	let isLoading = $state(false); // Nueva variable para controlar el estado de carga
	// svelte-ignore non_reactive_update
	let preguntaAct = pregunta; // Inicializar preguntaAct como un estado
    let classTopic = $state('margin-top: 0px;'); // Nueva variable para controlar la clase del modal

	export function toogleModal() {
		showModal = !showModal;

		if (!showModal) {
			// Si el modal se cierra, restablece la clase a su valor inicial
			classTopic = 'margin-top: 0px;';
		}
	}

	export async function updateData(respUser, resCorrect) {
		preguntaAct = pregunta;
		respuesta.usuario = respUser;
		respuesta.correcta = resCorrect;
		isLoading = true; // Activar el estado de carga

	

		try {
			explication = await enviarRespuesta(pregunta, respuesta.correcta);
			//console.log('Explicación:', explication);
		} catch (error) {
			console.error('Error al obtener la explicación:', error);
		} finally {
			isLoading = false; // Desactivar el estado de carga
			classTopic ='margin-modal';
		}
	}

	async function enviarRespuesta(question, Respuesta) {
		const urlAPI = 'https://pqedqxmb2h.execute-api.us-east-2.amazonaws.com/ChatGpt';

		try {
			const response = await fetch(urlAPI, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					idreactivo: id,
					respuesta: Respuesta,
					isCorrect: iscorrect,
					pregunta: question
				})
			});

			if (!response.ok) {
				throw new Error('Network response was not ok ' + response.statusText);
			}

			const data = await response.json();
			//console.log('resp:', data);
			return data;
		} catch (error) {
			console.error('There was a problem with the fetch operation:', error);
		}
	}

	function closeModal() {
		const modal = document.getElementById('modal');
		modal.classList.add('modal-out');
		toogleModal();

		setTimeout(() => {
			modal.classList.add('hidden');
		}, 200); // Duración de la animación
	}
</script>

{#if showModal}
<!-- Modal -->
<div
    id="modal"
    class="fixed inset-0 bg-black/60 w-full backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
>
    <div
        class="basemodal bg-gray-900/90 rounded-2xl max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl mt-32 shadow-cyan-500/20 border border-cyan-500/30 transition-all duration-300 ease-in-out"
        style={classTopic}
    >
        <!-- Decorative elements -->
        <div class="absolute -top-3 left-10 w-40 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-pulse"></div>
        <div class="absolute -bottom-3 right-10 w-40 h-1 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full animate-pulse"></div>
        
        <div class="p-4 md:p-6 lg:p-8 relative">
            <div class="mb-6 relative">
                <!-- Header with speech bubble -->
                <div class="flex justify-between items-center mb-6">
                    <button
                        onclick={closeModal}
                        class="text-cyan-300 hover:text-white transition-all duration-300 text-xl h-10 w-10 flex items-center justify-center rounded-full bg-gray-800/80 hover:bg-cyan-900/50 hover:scale-110 border border-cyan-500/30"
                    >
                        ✕
                    </button>
                </div>
                
                <!-- Question and answers container -->
                <div class="bg-gray-800/60 rounded-xl p-4 md:p-5 border border-cyan-500/20 mb-6 transform hover:scale-[1.01] transition-all duration-300 shadow-lg shadow-cyan-500/10">
                    <div class="question mb-4 break-words md:whitespace-normal relative group">
                        <p class="text-cyan-300/90 text-sm font-semibold mb-2 uppercase flex items-center">
                            <span class="inline-block w-2 h-2 bg-cyan-400 rounded-full mr-2 animate-ping"></span>
                            Pregunta
                        </p>
                        <div class="text-white text-secondary bg-gray-900/40 p-3 rounded-lg border-l-2 border-cyan-400/70 group-hover:border-cyan-400 transition-all duration-300">
                            <MathForm isBlock={false} content={preguntaAct} />
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="transform hover:translate-y-[-2px] transition-all duration-300 group">
                            <div class="bg-gray-800/80 py-3 px-4 rounded-lg border-l-2 border-blue-400/50 group-hover:border-blue-400 transition-all">
                                <p class="text-blue-300 text-sm font-semibold mb-2 uppercase flex items-center">
                                    <span class="inline-block w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                                    Tu respuesta
                                </p>
                                <div class="text-gray-100 text-secondary"><MathForm isBlock={false} content={respuesta.usuario} /></div>
                            </div>
                        </div>
                        
                        <div class="transform hover:translate-y-[-2px] transition-all duration-300 group">
                            <div class="bg-gray-800/80 py-3 px-4 rounded-lg border-l-2 border-emerald-400/50 group-hover:border-emerald-400 transition-all">
                                <p class="text-emerald-300 text-sm font-semibold mb-2 uppercase flex items-center">
                                    <span class="inline-block w-2 h-2 bg-emerald-400 rounded-full mr-2"></span>
                                    Respuesta correcta
                                </p>
                                <div class="text-gray-100 text-secondary"><MathForm isBlock={false} content={respuesta.correcta} /></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="space-y-6">
                {#if isLoading}
                <!-- Futuristic loading indicator with holographic effect -->
                <div class="flex flex-col justify-center items-center h-80">
                    <div class="cyberpulse-loader relative w-80 h-40">
                        <!-- Holographic rings -->
                        <div class="absolute inset-0 flex items-center justify-center">
                            <span class="custom-ring ring-1"></span>
                            <span class="custom-ring ring-2"></span>
                            <span class="custom-ring ring-3"></span>
                        </div>
                        <!-- Central core -->
                        <div class="core absolute inset-0 flex items-center justify-center">
                            <div class="pulse-core"></div>
                            <div class="scan-line"></div>
                        </div>
                        <!-- Orbiting particles -->
                        <div class="orbital-particles">
                            {#each Array(8) as _, i}
                                <div class="particle" style="--particle-index: {i}"></div>
                            {/each}
                        </div>
                    </div>
                    <p class="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-500 mt-8 text-lg font-medium tracking-wider glow-text">
                        <span class="typing-text">Analizando respuesta...</span>
                    </p>
                </div>
                {:else}
                <!-- Contenido responsivo con animaciones -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <!-- Explicación Problema -->
                    <div class="bg-gray-800/50 rounded-xl p-5 border border-cyan-500/20 shadow-lg shadow-cyan-900/10 hover:shadow-cyan-500/30 transition-all duration-500 group">
                        <p class="text-cyan-300 text-sm font-semibold uppercase mb-3 flex items-center">
                            <span class="inline-block w-1.5 h-1.5 bg-cyan-400 rounded-full mr-2 group-hover:animate-ping"></span>
                            Explicación Problema
                        </p>
                        <div class="text-gray-200 text-secondary bg-gray-900/40 p-4 rounded-lg border-l-2 border-cyan-400/30 group-hover:border-cyan-400 transition-all duration-300">
                            {explication.explicacionRespuesta}
                        </div>
                    </div>

                    <!-- Tips -->
                    <div class="bg-gray-800/50 rounded-xl p-5 border border-blue-500/20 shadow-lg shadow-blue-900/10 hover:shadow-blue-500/30 transition-all duration-500 group">
                        <p class="text-blue-300 text-sm font-semibold uppercase mb-3 flex items-center">
                            <span class="inline-block w-1.5 h-1.5 bg-blue-400 rounded-full mr-2 group-hover:animate-ping"></span>
                            Tips
                        </p>
                        <div class="text-gray-200 text-secondary bg-gray-900/40 p-4 rounded-lg border-l-2 border-blue-400/30 group-hover:border-blue-400 transition-all duration-300">
                            {explication.Tip}
                        </div>
                    </div>
                </div>

                <!-- Pasos para resolver -->
                <div class="bg-gray-800/50 rounded-xl p-5 border border-purple-500/20 shadow-lg shadow-purple-900/10 hover:shadow-purple-500/30 transition-all duration-500 group animate-fadeIn animation-delay-200">
                    <p class="text-purple-300 text-sm font-semibold uppercase mb-3 flex items-center">
                        <span class="inline-block w-1.5 h-1.5 bg-purple-400 rounded-full mr-2 group-hover:animate-ping"></span>
                        Pasos para resolver
                    </p>
                    <div class="text-gray-200 text-secondary bg-gray-900/40 p-4 rounded-lg border-l-2 border-purple-400/30 group-hover:border-purple-400 transition-all duration-300">
                        <ol class="list-none pl-0 space-y-3">
                            {#each explication.pasosParaResolverElProblema as paso, i}
                                <li class="flex items-start group/item hover:translate-x-1 transition-all duration-300">
                                    <span class="flex-shrink-0 inline-flex items-center justify-center h-6 w-6 rounded-full bg-purple-900/50 text-purple-300 mr-3 border border-purple-500/30 group-hover/item:bg-purple-800/80 transition-all duration-300">
                                        {i + 1}
                                    </span>
                                    <span class="leading-relaxed">{paso}</span>
                                </li>
                            {/each}
                        </ol>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <!-- Formulas -->
                    <div class="bg-gray-800/50 rounded-xl p-5 border border-emerald-500/20 shadow-lg shadow-emerald-900/10 hover:shadow-emerald-500/30 transition-all duration-500 group animate-fadeIn animation-delay-300">
                        <p class="text-emerald-300 text-sm font-semibold uppercase mb-3 flex items-center">
                            <span class="inline-block w-1.5 h-1.5 bg-emerald-400 rounded-full mr-2 group-hover:animate-ping"></span>
                            Fórmulas
                        </p>
                        <div class="text-gray-200 text-secondary bg-gray-900/40 p-4 rounded-lg border-l-2 border-emerald-400/30 group-hover:border-emerald-400 transition-all duration-300">
                            {explication.conceptosORecordatorios}
                        </div>
                    </div>

                    <!-- Ejemplo -->
                    <div class="bg-gray-800/50 rounded-xl p-5 border border-amber-500/20 shadow-lg shadow-amber-900/10 hover:shadow-amber-500/30 transition-all duration-500 group animate-fadeIn animation-delay-400">
                        <p class="text-amber-300 text-sm font-semibold uppercase mb-3 flex items-center">
                            <span class="inline-block w-1.5 h-1.5 bg-amber-400 rounded-full mr-2 group-hover:animate-ping"></span>
                            Ejemplo
                        </p>
                        <div class="text-gray-200 text-secondary bg-gray-900/40 p-4 rounded-lg border-l-2 border-amber-400/30 group-hover:border-amber-400 transition-all duration-300">
                            {explication.ejemploSimilar}
                        </div>
                    </div>
                </div>
                {/if}
            </div>
        </div>
    </div>
</div>
{/if}

<style>
	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}

	/* Futuristic loader styles */
	.cyberpulse-loader {
		perspective: 80rem;
	}

	.custom-ring {
		position: absolute;
		border-radius: 50%;
		border: 2px solid rgba(32, 216, 255, 0.3);
		transform-style: preserve-3d;
		animation: ring-rotate 3s infinite linear;
	}

	.ring-1 {
		width: 100%;
		height: 100%;
		border-color: rgba(32, 216, 255, 0.6);
		box-shadow: 0 0 20px rgba(32, 216, 255, 0.4);
	}

	.ring-2 {
		width: 70%;
		height: 70%;
		top: 15%;
		left: 15%;
		border-color: rgba(0, 247, 255, 0.5);
		animation-duration: 4s;
		animation-direction: reverse;
	}

	.ring-3 {
		width: 40%;
		height: 40%;
		top: 30%;
		left: 30%;
		border-color: rgba(90, 200, 250, 0.7);
		animation-duration: 2s;
	}

	.pulse-core {
		width: 20px;
		height: 20px;
		background: radial-gradient(circle, rgba(255, 255, 255, 1) 0%, rgba(32, 216, 255, 0.8) 70%);
		border-radius: 50%;
		box-shadow: 0 0 15px 5px rgba(32, 216, 255, 0.8);
		animation: pulse 2s infinite alternate;
	}

	.scan-line {
		position: absolute;
		width: 100%;
		height: 2px;
		background: linear-gradient(90deg, transparent, rgba(32, 216, 255, 0.8), transparent);
		animation: scan 2s infinite linear;
	}

	.orbital-particles .particle {
		position: absolute;
		width: 6px;
		height: 6px;
		background-color: #20d8ff;
		border-radius: 50%;
		box-shadow: 0 0 10px 2px rgba(32, 216, 255, 0.8);
		transform: translateX(-50%) translateY(-50%);
		top: 50%;
		left: 50%;
		animation: orbit 3s infinite linear;
		animation-delay: calc(var(--particle-index) * -0.375s);
	}

	.glow-text {
		text-shadow: 0 0 10px rgba(32, 216, 255, 0.8);
	}

	.typing-text {
		display: inline-block;
		border-right: 2px solid rgba(32, 216, 255, 0.8);
		white-space: nowrap;
		animation:
			typing 3s steps(30) infinite alternate-reverse,
			blink 1s step-end infinite;
	}

	.text-secondary{
		font-size:16px;
	}
	
	@media screen and (max-width: 768px) {
		.text-secondary{
			font-size:12px;
		}
	}

	/* Nueva animación de fadeIn para elementos */
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

	.animate-fadeIn {
		animation: fadeIn 0.5s ease forwards;
	}

	/* Animaciones con retraso */
	.animation-delay-200 {
		animation-delay: 0.2s;
	}

	.animation-delay-300 {
		animation-delay: 0.3s;
	}

	.animation-delay-400 {
		animation-delay: 0.4s;
	}

	@keyframes ring-rotate {
		0% {
			transform: rotateX(0deg) rotateY(0deg);
		}
		100% {
			transform: rotateX(360deg) rotateY(180deg);
		}
	}

	@keyframes pulse {
		0% {
			transform: scale(0.8);
			opacity: 0.7;
		}
		100% {
			transform: scale(1.2);
			opacity: 1;
		}
	}

	@keyframes scan {
		0% {
			transform: translateY(-40px);
		}
		100% {
			transform: translateY(40px);
		}
	}

	@keyframes orbit {
		0% {
			transform: translateX(-50%) translateY(-50%) rotate(0deg) translateX(60px) rotate(0deg);
		}
		100% {
			transform: translateX(-50%) translateY(-50%) rotate(360deg) translateX(60px) rotate(-360deg);
		}
	}

	@keyframes typing {
		from {
			width: 0;
		}
		to {
			width: 100%;
		}
	}

	@keyframes blink {
		50% {
			border-color: transparent;
		}
	}

	.basemodal {
		animation: slideIn 0.4s ease;
		animation-fill-mode: forwards;
		transform-origin: center;
		transition: all 0.3s ease-in-out;
	}

	@keyframes slideIn {
		from {
			transform: translateY(50px);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}

	@keyframes slideOut {
		from {
			transform: translateY(0);
			opacity: 1;
		}
		to {
			transform: translateY(-50px);
			opacity: 0;
		}
	}
</style>
