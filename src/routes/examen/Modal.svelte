<script>
	let { pregunta, id, iscorrect } = $props();

	let respuesta = $state('');
	let showModal = $state(false);
	let explication = $state();
	let isLoading = $state(false); // Nueva variable para controlar el estado de carga

	export function toogleModal() {
		showModal = !showModal;
		console.log('Modal abierto:', showModal);
	}

	export async function updateData(resp) {
		respuesta = resp;
		isLoading = true; // Activar el estado de carga

	

		try {
			explication = await enviarRespuesta(pregunta, respuesta);
			//console.log('Explicación:', explication);
		} catch (error) {
			console.error('Error al obtener la explicación:', error);
		} finally {
			isLoading = false; // Desactivar el estado de carga
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
		class="fixed inset-0 bg-custom-modal backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-auto"
	>
		<div
			class="bg-white/20 backdrop-blur-sm rounded-xl max-w-3xl w-full p-8 border border-white/30"
		>
			<div class="flex justify-between items-center mb-6">
				<h3 class="text-2xl font-bold text-white">
					Respuesta seleccionada: <span class="font-semibold">{respuesta}</span>
				</h3>
				<button
					onclick={closeModal}
					class="text-white/70 hover:text-white transition-colors text-3xl"
				>
					✕
				</button>
			</div>
			<div class="space-y-6">
				{#if isLoading}
					<!-- Futuristic loading indicator with holographic effect -->
					<div class="flex flex-col justify-center items-center h-80">
						<div class="cyberpulse-loader relative w-40 h-40">
							<!-- Holographic rings -->
							<div class="absolute inset-0 rings">
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
					<!-- Problem description -->
					<div class="bg-white/10 rounded-lg p-6 border border-white/30">
						<h4 class="text-white/80 text-lg uppercase mb-3">Problema</h4>
						<p class="text-white text-lg">{explication.shortDescripcionDelProblema}</p>
					</div>

					<!-- Explanation -->
					<div class="bg-white/10 rounded-lg p-6 border border-white/30">
						<h4 class="text-white/80 text-lg uppercase mb-3">Explicación</h4>
						<p class="text-white text-lg">{explication.explicacionRespuesta}</p>
					</div>

					<!-- Solution steps -->
					<div class="bg-white/10 rounded-lg p-6 border border-white/30">
						<h4 class="text-white/80 text-lg uppercase mb-3">Pasos para resolver</h4>
						<div class="text-white text-lg">
							<ol class="list-decimal pl-6 space-y-3">
								{#each explication.pasoParResolverElProblema as paso, i}
									<li class="leading-relaxed">{paso}</li>
								{/each}
							</ol>
						</div>
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
		perspective: 800px;
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
		overflow: hidden;
		border-right: 2px solid rgba(32, 216, 255, 0.8);
		white-space: nowrap;
		animation:
			typing 3s steps(30) infinite alternate-reverse,
			blink 1s step-end infinite;
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
</style>
