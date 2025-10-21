<script>
	import { explanationStore } from '$lib/stores';
	import { socketService } from '$lib/api/socket';

	let { onStop = null } = $props();

	function handlePause() {
		if ($explanationStore.isPaused) {
			// Reanudar
			socketService.emitResumeExplanation();
			explanationStore.resumeExplanation();
		} else {
			// Pausar
			socketService.emitPauseExplanation($explanationStore.currentStep, 0);
			explanationStore.pauseExplanation();
		}
	}

	function handleStop() {
		if (onStop) {
			onStop();
		}
	}
</script>

<div class="playback-controls flex items-center gap-4 p-4 bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-lg border border-gray-700">
	<!-- Estado de reproducción -->
	<div class="status-indicator flex items-center gap-2">
		{#if $explanationStore.isLoading}
			<div class="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
			<span class="text-sm text-yellow-400">Cargando...</span>
		{:else if $explanationStore.isPaused}
			<div class="w-3 h-3 bg-yellow-500 rounded-full"></div>
			<span class="text-sm text-yellow-400">Pausado</span>
		{:else if $explanationStore.isExplaining}
			<div class="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
			<span class="text-sm text-green-400">Explicando...</span>
		{:else}
			<div class="w-3 h-3 bg-gray-500 rounded-full"></div>
			<span class="text-sm text-gray-400">Listo</span>
		{/if}
	</div>

	<!-- Controles -->
	<div class="controls flex items-center gap-2 ml-auto">
		<!-- Botón Pausar/Reanudar -->
		<button
			onclick={handlePause}
			disabled={!$explanationStore.isExplaining && !$explanationStore.isPaused}
			class="control-btn px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
			class:bg-yellow-600={!$explanationStore.isPaused}
			class:hover:bg-yellow-700={!$explanationStore.isPaused}
			class:bg-green-600={$explanationStore.isPaused}
			class:hover:bg-green-700={$explanationStore.isPaused}
			aria-label={$explanationStore.isPaused ? 'Reanudar explicación' : 'Pausar explicación'}
		>
			{#if $explanationStore.isPaused}
				▶️ Reanudar
			{:else}
				⏸️ Pausar
			{/if}
		</button>

		<!-- Botón Detener -->
		<button
			onclick={handleStop}
			disabled={!$explanationStore.isExplaining && !$explanationStore.isPaused}
			class="control-btn px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
			aria-label="Detener explicación"
		>
			⏹️ Detener
		</button>
	</div>
</div>

<style>
	.control-btn {
		touch-action: manipulation;
		user-select: none;
	}

	.control-btn:active:not(:disabled) {
		transform: scale(0.95);
	}

	@keyframes pulse {
		0%, 100% {
			opacity: 1;
		}
		50% {
			opacity: 0.5;
		}
	}

	.animate-pulse {
		animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
	}
</style>
