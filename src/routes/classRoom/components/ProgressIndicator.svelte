<script>
	/**
	 * Indicador de progreso del paso actual
	 * Muestra el paso, porcentaje y estado del canvas
	 */
	let { stepProgress } = $props();
</script>

<div class="progress-indicator">
	<div class="progress-header">
		<span class="step-number">Paso {stepProgress.stepNumber}</span>
		<span class="percentage" class:at-50={stepProgress.percentage >= 50}>
			{stepProgress.percentage}%
		</span>
	</div>
	
	<div class="progress-bar-container">
		<div class="progress-bar" style="width: {stepProgress.percentage}%">
			{#if stepProgress.percentage >= 50}
				<div class="trigger-marker">
					<span class="marker-icon">🎨</span>
				</div>
			{/if}
		</div>
		<div class="marker-50">50%</div>
	</div>
	
	<div class="progress-details">
		<span class="chars-count">{stepProgress.charIndex} / {stepProgress.totalChars} caracteres</span>
		{#if stepProgress.canvasTriggered}
			<span class="canvas-status active">✓ Canvas activado</span>
		{:else}
			<span class="canvas-status pending">○ Esperando 50%</span>
		{/if}
	</div>
</div>

<style>
	.progress-indicator {
		position: fixed;
		top: 80px;
		right: 20px;
		background: rgba(15, 23, 42, 0.95);
		border: 1px solid rgba(99, 102, 241, 0.3);
		border-radius: 12px;
		padding: 16px;
		min-width: 280px;
		backdrop-filter: blur(8px);
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
		z-index: 40;
		animation: slideIn 0.3s ease-out;
	}
	
	@keyframes slideIn {
		from {
			opacity: 0;
			transform: translateX(20px);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}
	
	.progress-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 12px;
	}
	
	.step-number {
		color: #818cf8;
		font-size: 0.875rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}
	
	.percentage {
		color: #e2e8f0;
		font-size: 1.25rem;
		font-weight: 700;
		transition: all 0.3s ease;
	}
	
	.percentage.at-50 {
		color: #4ade80;
		text-shadow: 0 0 10px rgba(74, 222, 128, 0.5);
	}
	
	.progress-bar-container {
		position: relative;
		height: 24px;
		background: rgba(15, 23, 42, 0.6);
		border-radius: 12px;
		overflow: visible;
		margin-bottom: 12px;
		border: 1px solid rgba(99, 102, 241, 0.2);
	}
	
	.progress-bar {
		height: 100%;
		background: linear-gradient(90deg, 
			rgba(99, 102, 241, 0.6), 
			rgba(129, 140, 248, 0.8)
		);
		border-radius: 12px;
		transition: width 0.3s ease;
		position: relative;
		display: flex;
		align-items: center;
		justify-content: flex-end;
		padding-right: 8px;
	}
	
	.trigger-marker {
		animation: pulse 1s ease-in-out infinite;
	}
	
	.marker-icon {
		font-size: 1rem;
		filter: drop-shadow(0 0 4px rgba(74, 222, 128, 0.8));
	}
	
	@keyframes pulse {
		0%, 100% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.2);
		}
	}
	
	.marker-50 {
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		font-size: 0.625rem;
		color: rgba(255, 255, 255, 0.4);
		font-weight: 600;
		pointer-events: none;
	}
	
	.progress-details {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 0.75rem;
	}
	
	.chars-count {
		color: rgba(226, 232, 240, 0.6);
	}
	
	.canvas-status {
		padding: 4px 8px;
		border-radius: 6px;
		font-weight: 600;
		font-size: 0.7rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}
	
	.canvas-status.active {
		background: rgba(74, 222, 128, 0.2);
		color: #4ade80;
		border: 1px solid rgba(74, 222, 128, 0.3);
	}
	
	.canvas-status.pending {
		background: rgba(148, 163, 184, 0.1);
		color: rgba(148, 163, 184, 0.6);
		border: 1px solid rgba(148, 163, 184, 0.2);
	}
	
	/* Responsive */
	@media (max-width: 768px) {
		.progress-indicator {
			top: 60px;
			right: 10px;
			min-width: 240px;
			padding: 12px;
		}
		
		.percentage {
			font-size: 1rem;
		}
	}
</style>
