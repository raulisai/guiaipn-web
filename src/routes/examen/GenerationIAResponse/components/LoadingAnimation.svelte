<script>
	let loadingMessages = [
		"Analizando respuesta...", 
		"Procesando datos...", 
		"Calculando resultados...", 
		"Generando explicación..."
	];
	let currentMessageIndex = 0;
	
	// Cycle through loading messages
	setInterval(() => {
		currentMessageIndex = (currentMessageIndex + 1) % loadingMessages.length;
	}, 2000);
</script>

<div class="flex flex-col justify-center items-center h-80">
	<div class="cyber-loader">
		<div class="hexagon-container">
			<div class="hexagon h1"></div>
			<div class="hexagon h2"></div>
			<div class="hexagon h3"></div>
		</div>
		
		<!-- Binary data animation -->
		<div class="binary-stream">
			<div class="binary-text">01001100 01001111 01000001 01000100 01001001 01001110 01000111</div>
		</div>
		
		<!-- Progress bar -->
		<div class="cyber-progress-container">
			<div class="cyber-progress-bar"></div>
			<div class="cyber-progress-glitch"></div>
		</div>
	</div>
	
	<p class="text-cyan-300 mt-6 text-lg font-mono tracking-wider flex items-center">
		<span class="typing-text">{loadingMessages[currentMessageIndex]}</span>
		<span class="cyber-cursor">_</span>
	</p>
</div>

<style>
	.cyber-loader {
		position: relative;
		width: 180px;
		height: 180px;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	
	/* Hexagon animation */
	.hexagon-container {
		position: relative;
		width: 100px;
		height: 100px;
	}
	
	.hexagon {
		position: absolute;
		width: 100%;
		height: 100%;
		border-radius: 10px;
		border: 2px solid rgba(0, 255, 255, 0.7);
		transform-origin: center;
	}
	
	.h1 {
		animation: rotateHexagon 3s linear infinite;
		box-shadow: 0 0 15px rgba(0, 255, 255, 0.5);
	}
	
	.h2 {
		animation: rotateHexagon 3s linear infinite reverse;
		transform: scale(0.8);
		border-color: rgba(255, 0, 222, 0.7);
		box-shadow: 0 0 15px rgba(255, 0, 222, 0.5);
	}
	
	.h3 {
		animation: rotateHexagon 2s linear infinite;
		transform: scale(0.6);
		border-color: rgba(0, 221, 255, 0.7);
		box-shadow: 0 0 15px rgba(0, 221, 255, 0.5);
	}
	
	@keyframes rotateHexagon {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}
	
	/* Binary stream effect */
	.binary-stream {
		position: absolute;
		top: 100%;
		left: 50%;
		transform: translateX(-50%);
		width: 180px;
		height: 30px;
		margin-top: 15px;
		overflow: hidden;
		background: rgba(0, 0, 0, 0.2);
		border: 1px solid rgba(0, 255, 255, 0.3);
		border-radius: 4px;
	}
	
	.binary-text {
		font-family: monospace;
		font-size: 10px;
		color: rgba(0, 255, 255, 0.8);
		white-space: nowrap;
		animation: scrollBinary 10s linear infinite;
	}
	
	@keyframes scrollBinary {
		0% { transform: translateX(180px); }
		100% { transform: translateX(-100%); }
	}
	
	/* Progress bar */
	.cyber-progress-container {
		position: absolute;
		bottom: -35px;
		left: 50%;
		transform: translateX(-50%);
		width: 160px;
		height: 8px;
		background: rgba(0, 0, 0, 0.3);
		border: 1px solid rgba(0, 255, 255, 0.3);
		overflow: hidden;
	}
	
	.cyber-progress-bar {
		height: 100%;
		width: 50%;
		background: linear-gradient(90deg, rgba(0, 255, 255, 0.7), rgba(255, 0, 255, 0.7));
		animation: progressBarAnimation 2s ease-in-out infinite alternate;
	}
	
	.cyber-progress-glitch {
		position: absolute;
		top: 0;
		left: 0;
		height: 100%;
		width: 100%;
		background: linear-gradient(90deg, 
			transparent, 
			transparent,
			rgba(255, 255, 255, 0.7),
			transparent,
			transparent
		);
		animation: progressGlitch 1.5s ease-out infinite;
		opacity: 0.5;
	}
	
	@keyframes progressBarAnimation {
		0% { width: 10%; }
		50% { width: 40%; }
		100% { width: 80%; }
	}
	
	@keyframes progressGlitch {
		0% { transform: translateX(-100%); }
		100% { transform: translateX(100%); }
	}
	
	.typing-text {
		color: rgba(0, 255, 255, 0.9);
		text-shadow: 0 0 5px rgba(0, 255, 255, 0.5);
	}
	
	.cyber-cursor {
		animation: cursorBlink 1s step-end infinite;
		margin-left: 2px;
	}
	
	@keyframes cursorBlink {
		0%, 100% { opacity: 0; }
		50% { opacity: 1; }
	}
</style>
