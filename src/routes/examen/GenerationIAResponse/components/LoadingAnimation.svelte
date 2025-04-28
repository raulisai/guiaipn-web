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
	<p
		class="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-500 mt-8 text-lg font-medium tracking-wider glow-text"
	>
		<span class="typing-text">Analizando respuesta...</span>
	</p>
</div>

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
