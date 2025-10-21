<script>
	import { onMount } from 'svelte';

	let currentPhraseIndex = $state(0);
	
	const loadingPhrases = [
		'Analizando tu pregunta...',
		'Consultando la base de conocimiento...',
		'Preparando una explicación detallada...',
		'Organizando los pasos de la solución...',
		'Generando visualizaciones...',
		'Casi listo...'
	];

	onMount(() => {
		const interval = setInterval(() => {
			currentPhraseIndex = (currentPhraseIndex + 1) % loadingPhrases.length;
		}, 3000);

		return () => clearInterval(interval);
	});
</script>

<div class="loading-state flex flex-col items-center justify-center min-h-[400px] p-8">
	<!-- Spinner -->
	<div class="spinner-container mb-6">
		<div class="spinner"></div>
		<div class="spinner-inner"></div>
	</div>

	<!-- Frase de carga -->
	<p class="loading-phrase text-xl text-gray-300 text-center mb-4 transition-opacity duration-500">
		{loadingPhrases[currentPhraseIndex]}
	</p>

	<!-- Barra de progreso indeterminada -->
	<div class="progress-bar-container w-full max-w-md">
		<div class="progress-bar-indeterminate"></div>
	</div>

	<!-- Mensaje adicional -->
	<p class="text-sm text-gray-500 mt-6 text-center">
		Esto puede tomar unos segundos...
	</p>
</div>

<style>
	.loading-state {
		animation: fadeIn 0.3s ease-in;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	/* Spinner principal */
	.spinner-container {
		position: relative;
		width: 80px;
		height: 80px;
	}

	.spinner {
		position: absolute;
		width: 100%;
		height: 100%;
		border: 4px solid rgba(59, 130, 246, 0.2);
		border-top-color: #3b82f6;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	.spinner-inner {
		position: absolute;
		top: 10px;
		left: 10px;
		right: 10px;
		bottom: 10px;
		border: 4px solid rgba(16, 185, 129, 0.2);
		border-top-color: #10b981;
		border-radius: 50%;
		animation: spin 1.5s linear infinite reverse;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	/* Barra de progreso indeterminada */
	.progress-bar-container {
		height: 4px;
		background-color: rgba(59, 130, 246, 0.2);
		border-radius: 2px;
		overflow: hidden;
	}

	.progress-bar-indeterminate {
		height: 100%;
		background: linear-gradient(
			90deg,
			transparent,
			#3b82f6,
			transparent
		);
		animation: indeterminate 1.5s ease-in-out infinite;
	}

	@keyframes indeterminate {
		0% {
			transform: translateX(-100%);
		}
		100% {
			transform: translateX(100%);
		}
	}

	.loading-phrase {
		animation: phraseChange 0.5s ease-in-out;
	}

	@keyframes phraseChange {
		0% {
			opacity: 0;
			transform: translateY(-10px);
		}
		100% {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
