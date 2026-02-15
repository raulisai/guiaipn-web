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

<div class="playback-controls">
	<!-- Estado de reproducción compacto -->
	<div class="status-indicator">
		{#if $explanationStore.isLoading}
			<div class="status-dot loading"></div>
			<span class="status-text">Cargando</span>
		{:else if $explanationStore.isPaused}
			<div class="status-dot paused"></div>
			<span class="status-text">Pausado</span>
		{:else if $explanationStore.isExplaining}
			<div class="status-dot active"></div>
			<span class="status-text">Explicando</span>
		{:else}
			<div class="status-dot"></div>
			<span class="status-text">Listo</span>
		{/if}
	</div>

	<!-- Controles compactos -->
	<div class="controls">
		<!-- Botón Pausar/Reanudar -->
		<button
			onclick={handlePause}
			disabled={!$explanationStore.isExplaining && !$explanationStore.isPaused}
			class="control-btn"
			class:paused={$explanationStore.isPaused}
			aria-label={$explanationStore.isPaused ? 'Reanudar explicación' : 'Pausar explicación'}
		>
			{#if $explanationStore.isPaused}
				▶
			{:else}
				⏸
			{/if}
		</button>

		<!-- Botón Detener -->
		<button
			onclick={handleStop}
			disabled={!$explanationStore.isExplaining && !$explanationStore.isPaused}
			class="control-btn stop"
			aria-label="Detener explicación"
		>
			⏹
		</button>
	</div>
</div>

<style>
	.playback-controls {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 8px 14px;
		background: rgba(15, 23, 42, 0.2);
		border: 1px solid rgba(99, 102, 241, 0.15);
		border-radius: 8px;
		backdrop-filter: blur(6px);
	}

	.status-indicator {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.status-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: rgba(148, 163, 184, 0.5);
	}

	.status-dot.loading {
		background: #fbbf24;
		animation: pulse 1.5s ease-in-out infinite;
	}

	.status-dot.paused {
		background: #fbbf24;
	}

	.status-dot.active {
		background: #4ade80;
		animation: pulse 2s ease-in-out infinite;
	}

	.status-text {
		font-size: 0.75rem;
		color: rgba(203, 213, 225, 0.8);
		font-weight: 500;
	}

	.controls {
		display: flex;
		gap: 6px;
	}

	.control-btn {
		padding: 6px 12px;
		border-radius: 6px;
		font-size: 0.875rem;
		font-weight: 500;
		border: 1px solid rgba(99, 102, 241, 0.3);
		background: rgba(99, 102, 241, 0.15);
		color: #818cf8;
		cursor: pointer;
		transition: all 0.2s ease;
		touch-action: manipulation;
		user-select: none;
	}

	.control-btn:hover:not(:disabled) {
		background: rgba(99, 102, 241, 0.25);
		border-color: rgba(99, 102, 241, 0.4);
	}

	.control-btn:active:not(:disabled) {
		transform: scale(0.95);
	}

	.control-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.control-btn.paused {
		background: rgba(74, 222, 128, 0.15);
		border-color: rgba(74, 222, 128, 0.3);
		color: #4ade80;
	}

	.control-btn.paused:hover:not(:disabled) {
		background: rgba(74, 222, 128, 0.25);
		border-color: rgba(74, 222, 128, 0.4);
	}

	.control-btn.stop {
		background: rgba(239, 68, 68, 0.15);
		border-color: rgba(239, 68, 68, 0.3);
		color: #ef4444;
	}

	.control-btn.stop:hover:not(:disabled) {
		background: rgba(239, 68, 68, 0.25);
		border-color: rgba(239, 68, 68, 0.4);
	}

	@keyframes pulse {
		0%, 100% {
			opacity: 1;
		}
		50% {
			opacity: 0.4;
		}
	}
</style>
