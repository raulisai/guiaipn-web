<script>
	import { explanationStore } from '$lib/stores';

	let { steps = [], currentStep = 0 } = $props();

	// Determinar el estado de cada paso
	function getStepStatus(stepNumber) {
		if (stepNumber < currentStep) return 'completed';
		if (stepNumber === currentStep) return 'active';
		return 'pending';
	}
</script>

<div class="timeline-container">
	<div class="timeline-header">
		<span class="timeline-title">Progreso</span>
		<span class="timeline-count">{currentStep}/{steps.length}</span>
	</div>
	
	<div class="timeline-track">
		{#each steps as step, index (step.step)}
			{@const status = getStepStatus(step.step)}
			<div class="timeline-item" class:completed={status === 'completed'} class:active={status === 'active'}>
				<!-- Línea vertical -->
				{#if index > 0}
					<div class="timeline-line" class:filled={status === 'completed'}></div>
				{/if}
				
				<!-- Punto indicador -->
				<div class="timeline-dot">
					{#if status === 'completed'}
						<svg class="check-icon" viewBox="0 0 16 16" fill="none">
							<path d="M13.5 4L6 11.5L2.5 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
					{:else if status === 'active'}
						<div class="pulse-ring"></div>
						<div class="pulse-core"></div>
					{:else}
						<div class="pending-dot"></div>
					{/if}
				</div>
				
				<!-- Etiqueta del paso -->
				<div class="timeline-label">
					<span class="step-number">Paso {step.step}</span>
					{#if step.title}
						<span class="step-title">{step.title}</span>
					{/if}
				</div>
			</div>
		{/each}
	</div>
</div>

<style>
	.timeline-container {
		display: flex;
		flex-direction: column;
		height: 100%;
		background: rgba(15, 23, 42, 0.15);
		border-radius: 8px;
		border: 1px solid rgba(99, 102, 241, 0.1);
		backdrop-filter: blur(4px);
		overflow: hidden;
		width: 200px;
	}

	.timeline-header {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 10px 16px;
		border-bottom: 1px solid rgba(99, 102, 241, 0.1);
		background: rgba(15, 23, 42, 0.3);
	}

	.timeline-title {
		color: #818cf8;
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.12em;
		opacity: 0.8;
	}

	.timeline-count {
		color: rgba(129, 140, 248, 0.5);
		font-size: 0.7rem;
		font-weight: 500;
	}

	.timeline-track {
		flex: 1;
		overflow-y: auto;
		padding: 20px 16px;
		display: flex;
		flex-direction: column;
		gap: 0;
	}

	/* Scrollbar ultra delgado */
	.timeline-track::-webkit-scrollbar {
		width: 4px;
	}

	.timeline-track::-webkit-scrollbar-track {
		background: transparent;
	}

	.timeline-track::-webkit-scrollbar-thumb {
		background: rgba(99, 102, 241, 0.25);
		border-radius: 2px;
	}

	.timeline-track::-webkit-scrollbar-thumb:hover {
		background: rgba(99, 102, 241, 0.4);
	}

	.timeline-item {
		position: relative;
		display: flex;
		align-items: flex-start;
		gap: 12px;
		padding-bottom: 32px;
	}

	.timeline-item:last-child {
		padding-bottom: 0;
	}

	/* Línea vertical */
	.timeline-line {
		position: absolute;
		left: 11px;
		top: -32px;
		width: 2px;
		height: 32px;
		background: rgba(99, 102, 241, 0.2);
		transition: background 0.3s ease;
	}

	.timeline-line.filled {
		background: rgba(99, 102, 241, 0.6);
	}

	/* Punto indicador */
	.timeline-dot {
		position: relative;
		flex-shrink: 0;
		width: 24px;
		height: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1;
	}

	/* Estado completado */
	.timeline-item.completed .timeline-dot {
		background: rgba(34, 197, 94, 0.2);
		border: 2px solid rgba(34, 197, 94, 0.6);
		border-radius: 50%;
	}

	.check-icon {
		width: 12px;
		height: 12px;
		color: rgb(34, 197, 94);
	}

	/* Estado activo */
	.timeline-item.active .timeline-dot {
		background: rgba(99, 102, 241, 0.2);
		border: 2px solid rgba(99, 102, 241, 0.8);
		border-radius: 50%;
	}

	.pulse-ring {
		position: absolute;
		width: 100%;
		height: 100%;
		border: 2px solid rgba(99, 102, 241, 0.6);
		border-radius: 50%;
		animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
	}

	.pulse-core {
		width: 8px;
		height: 8px;
		background: rgb(99, 102, 241);
		border-radius: 50%;
		box-shadow: 0 0 8px rgba(99, 102, 241, 0.8);
	}

	@keyframes pulse {
		0%, 100% {
			transform: scale(1);
			opacity: 1;
		}
		50% {
			transform: scale(1.5);
			opacity: 0;
		}
	}

	/* Estado pendiente */
	.pending-dot {
		width: 8px;
		height: 8px;
		background: rgba(148, 163, 184, 0.3);
		border: 2px solid rgba(148, 163, 184, 0.5);
		border-radius: 50%;
	}

	/* Etiquetas */
	.timeline-label {
		display: flex;
		flex-direction: column;
		gap: 2px;
		padding-top: 2px;
	}

	.step-number {
		color: #818cf8;
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.05em;
	}

	.timeline-item.completed .step-number {
		color: rgba(34, 197, 94, 0.8);
	}

	.timeline-item.active .step-number {
		color: rgb(99, 102, 241);
	}

	.step-title {
		color: rgba(226, 232, 240, 0.6);
		font-size: 0.65rem;
		line-height: 1.2;
		max-width: 120px;
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
	}

	.timeline-item.active .step-title {
		color: rgba(226, 232, 240, 0.9);
	}
</style>
