<div class="flex flex-col justify-center items-center h-64">
	<div class="minimalist-loader relative w-20 h-20 mb-6">
		<div class="spinner"></div>
		<div class="spinner-inner"></div>
	</div>
	<p class="text-gray-300 mt-4 text-lg font-medium tracking-wider">
		<span class="typing-text">Analizando respuesta...</span>
	</p>
</div>

<style>
	.minimalist-loader {
		position: relative;
	}
	
	.spinner {
		position: absolute;
		width: 100%;
		height: 100%;
		border: 3px solid rgba(255, 255, 255, 0.1);
		border-top: 3px solid rgba(255, 255, 255, 0.5);
		border-radius: 50%;
		animation: spin 1.5s linear infinite;
	}
	
	.spinner-inner {
		position: absolute;
		top: 25%;
		left: 25%;
		width: 50%;
		height: 50%;
		border: 3px solid rgba(255, 255, 255, 0.1);
		border-bottom: 3px solid rgba(255, 255, 255, 0.5);
		border-radius: 50%;
		animation: spin 1s linear infinite reverse;
	}
	
	.typing-text {
		display: inline-block;
		border-right: 2px solid rgba(255, 255, 255, 0.5);
		white-space: nowrap;
		animation:
			typing 3s steps(30) infinite alternate-reverse,
			blink 1s step-end infinite;
	}
	
	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
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
