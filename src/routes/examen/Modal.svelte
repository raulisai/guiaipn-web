<script>
	let { pregunta, id, iscorrect } = $props();

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
			console.log('Explicación:', explication);
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
    class="fixed inset-0 bg-custom-modal w-full backdrop-blur-md z-50 flex items-center justify-center p-4"
>
    <div
        class="basemodal bg-gradient-to-b from-[#04153a] via-[#04153a]/70 to-blue-950 backdrop-blur-sm rounded-xl max-w-[80%] max-h-[90vh] overflow-y-auto p-4 md:p-6 lg:p-8 border border-white/30"
        style={classTopic}
    >
        <div class="mb-4 md:mb-6">
            <!-- Header with close button -->
            <div class="flex justify-between items-center mb-3 md:mb-4">
                <h3 class="text-lg md:text-xl font-bold text-white/90">Análisis de respuesta</h3>
                <button
                    onclick={closeModal}
                    class="text-white/70 hover:text-white transition-colors text-xl h-8 w-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
                >
                    ✕
                </button>
            </div>
            
            <!-- Question and answers container -->
            <div class="bg-gradient-to-b from-[#04153a] via-[#030e28]/70 to-sky/60 rounded-lg p-3 md:p-4 border border-white/20 mb-4">
                <div class="mb-3">
                    <p class="text-white/80 text-sm md:text-md uppercase mb-1">Pregunta</p>
                    <p class="text-white text-secondary">{preguntaAct}</p>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                    <div class="bg-blue-900/30 py-2 px-2 md:py-3 rounded border border-blue-400/30">
                        <p class="text-blue-300/80 text-sm md:text-sm uppercase mb-1">Tu respuesta</p>
                        <p class="text-white text-secondary">{respuesta.usuario}</p>
                    </div>
                    
                    <div class="bg-green-900/30 py-2 px-2 md:py-3 rounded border border-green-400/30">
                        <p class="text-green-300/80 text-sm md:text-sm uppercase mb-1">Respuesta correcta</p>
                        <p class="text-white text-secondary">{respuesta.correcta}</p>
                    </div>
                </div>
            </div>
        </div>
        <div class="space-y-4 md:space-y-6">
            {#if isLoading}
           <!-- Futuristic loading indicator with holographic effect -->
					<div class="flex flex-col justify-center items-center h-80">
						<div class="cyberpulse-loader relative w-80 h-40">
							<!-- Holographic rings -->
							<div class="absolute inset-0 flex items-center justify-center">
								<span class="ring ring-1"></span>
								<span class="ring ring-2"></span>
								<span class="ring ring-3"></span>
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
						<p
							class="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-500 mt-8 text-lg font-medium tracking-wider glow-text"
						>
							<span class="typing-text">Creando explicacion...</span>
						</p>
					</div>
            {:else}
                <!-- Contenido responsivo -->
                <div class="bg-gradient-to-b from-[#04153a] via-[#030e28]/70 to-sky/60 rounded-lg p-4 md:p-6 border border-white/30">
                    <p class="text-white/80 text-sm md:text-lg uppercase mb-2 md:mb-3">Explicacion Problema</p>
                    <p class="text-white text-secondary">{explication.explicacionRespuesta}</p>
                </div>

                <div class="bg-gradient-to-b from-[#04153a] via-[#030e28]/70 to-sky/60 rounded-lg p-4 md:p-6 border border-white/30">
                    <p class="text-white/80 text-sm md:text-lg uppercase mb-2 md:mb-3">Tips</p>
                    <p class="text-white text-secondary">{explication.Tip}</p>
                </div>

                <div class="bg-gradient-to-b from-[#04153a] via-[#030e28]/70 to-sky/60 rounded-lg p-4 md:p-6 border border-white/30">
                    <p class="text-white/80 text-sm md:text-lg uppercase mb-2 md:mb-3">Pasos para resolver</p>
                    <div class="text-white text-secondary">
                        <ol class="list-decimal pl-4 md:pl-6 space-y-2 md:space-y-3">
                            {#each explication.pasosParaResolverElProblema as paso, i}
                                <li class="leading-relaxed">{paso}</li>
                            {/each}
                        </ol>
                    </div>
                </div>
				<div class="bg-gradient-to-b from-[#04153a] via-[#030e28]/70 to-sky/60  rounded-lg p-4 md:p-6 border border-white/30">
                    <h4 class="text-white/80 text-base md:text-lg uppercase mb-2 md:mb-3">Formulas</h4>
                    <p class="text-white text-sm md:text-base lg:text-lg">{explication.conceptosORecordatorios}</p>
                </div>
				<div class="bg-gradient-to-b from-[#04153a] via-[#030e28]/70 to-sky/60 rounded-lg p-4 md:p-6 border border-white/30">
                    <h4 class="text-white/80 text-base md:text-lg uppercase mb-2 md:mb-3">Ejemplo</h4>
                    <p class="text-white text-sm md:text-base lg:text-lg">{explication.ejemploSimilar}</p>
                </div>
                
                {/if}
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

	.ring {
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
	}

	@keyframes slideIn {
		from {
			transform: translateX(100%);
			opacity: 0;
		}
		to {
			transform: translateX(0);
			opacity: 1;
		}
	}

	@keyframes slideOut {
		from {
			transform: translateX(0);
			opacity: 1;
		}
		to {
			transform: translateX(-100%);
			opacity: 0;
		}
	}
	
</style>
