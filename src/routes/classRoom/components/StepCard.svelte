<script>
	import ContentRenderer from './ContentRenderer.svelte';

	let { step, isActive = false, isFirst = false, isLast = false } = $props();
	
	// Determinar el estado del paso
	let status = $derived(step.isComplete ? 'completed' : (isActive ? 'active' : 'pending'));
	
	// Referencia al elemento
	let cardElement;
	
	// Debug: Log cuando cambia el estado de completado
	$effect(() => {
		if (step.isComplete) {
			console.log(`✅ Paso ${step.step} marcado como completado:`, step.title);
		}
	});
	
	// Scroll automático cuando el paso se vuelve activo
	$effect(() => {
		if (isActive && cardElement) {
			setTimeout(() => {
				cardElement.scrollIntoView({ 
					behavior: 'smooth', 
					block: 'nearest',
					inline: 'nearest'
				});
			}, 100);
		}
	});
</script>

<div 
	bind:this={cardElement}
	class="step-card"
	class:active={isActive}
	class:complete={step.isComplete}
	class:pending={!isActive && !step.isComplete}
>
	<!-- Header con timeline -->
	<div class="step-header">
		<div class="timeline-wrapper">
			<!-- Línea vertical superior -->
			{#if !isFirst}
				<div class="timeline-line timeline-line-top" class:filled={step.isComplete}></div>
			{/if}
			
			<!-- Indicador del paso con estados -->
			<div class="step-indicator" class:completed={status === 'completed'} class:active={status === 'active'} class:pending={status === 'pending'}>
				{#if status === 'completed'}
					<svg class="check-icon" viewBox="0 0 16 16" fill="none">
						<path d="M13.5 4L6 11.5L2.5 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
				{:else if status === 'active'}
					<div class="pulse-ring"></div>
					<div class="pulse-core"></div>
				{:else}
					<span class="step-num">{step.step}</span>
				{/if}
			</div>
			
			<!-- Línea vertical inferior -->
			{#if !isLast}
				<div class="timeline-line timeline-line-bottom" class:filled={step.isComplete}></div>
			{/if}
		</div>
		
		<div class="title-wrapper">
			{#if step.isComplete}
				<span class="completion-dot"></span>
			{/if}
			<h3 class="step-title">{step.title}</h3>
		</div>
	</div>

	<!-- Contenido del Paso -->
	<div class="step-content">
		<ContentRenderer content={step.content} type={step.type} isComplete={step.isComplete} />
	</div>
</div>

<style>
	.step-card {
		background: rgba(15, 23, 42, 0.15);
		border: 1px solid rgba(99, 102, 241, 0.1);
		border-radius: 8px;
		padding: 10px 12px;
		transition: all 0.2s ease;
		animation: slideIn 0.3s ease-out;
		backdrop-filter: blur(4px);
	}

	.step-card:hover {
		border-color: rgba(99, 102, 241, 0.25);
		background: rgba(15, 23, 42, 0.25);
	}

	.step-card.active {
		border-color: rgba(99, 102, 241, 0.4);
		background: rgba(15, 23, 42, 0.3);
		box-shadow: 0 0 0 1px rgba(99, 102, 241, 0.2);
	}

	.step-card.complete {
		border-color: rgba(74, 222, 128, 0.2);
		opacity: 0.7;
	}

	.step-header {
		display: flex;
		align-items: flex-start;
		gap: 12px;
		margin-bottom: 8px;
	}

	/* Timeline wrapper */
	.timeline-wrapper {
		flex-shrink: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		position: relative;
	}

	/* Líneas verticales */
	.timeline-line {
		width: 2px;
		background: rgba(99, 102, 241, 0.2);
		transition: background 0.3s ease;
	}

	.timeline-line-top {
		height: 12px;
		margin-bottom: 2px;
	}

	.timeline-line-bottom {
		height: 12px;
		margin-top: 2px;
	}

	.timeline-line.filled {
		background: rgba(34, 197, 94, 0.6);
	}

	/* Indicador del paso */
	.step-indicator {
		flex-shrink: 0;
		width: 28px;
		height: 28px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		transition: all 0.3s ease;
	}

	/* Estado completado (verde) */
	.step-indicator.completed {
		background: rgba(34, 197, 94, 0.2);
		border: 2px solid rgba(34, 197, 94, 0.6);
	}

	/* Estado activo (azul con pulso) */
	.step-indicator.active {
		background: rgba(99, 102, 241, 0.2);
		border: 2px solid rgba(99, 102, 241, 0.8);
		box-shadow: 0 0 12px rgba(99, 102, 241, 0.4);
	}

	/* Estado pendiente (gris) */
	.step-indicator.pending {
		background: rgba(148, 163, 184, 0.15);
		border: 2px solid rgba(148, 163, 184, 0.3);
	}

	/* Número del paso (pendiente) */
	.step-num {
		color: rgba(148, 163, 184, 0.7);
		font-size: 0.75rem;
		font-weight: 600;
	}

	/* Check icon (completado) */
	.check-icon {
		width: 14px;
		height: 14px;
		color: rgb(34, 197, 94);
	}

	/* Animación de pulso (activo) */
	.pulse-ring {
		position: absolute;
		width: 100%;
		height: 100%;
		border: 2px solid rgba(99, 102, 241, 0.6);
		border-radius: 50%;
		animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
	}

	.pulse-core {
		width: 10px;
		height: 10px;
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

	.title-wrapper {
		display: flex;
		align-items: center;
		gap: 8px;
		flex: 1;
		padding-top: 4px;
	}

	.completion-dot {
		width: 8px;
		height: 8px;
		background: rgb(34, 197, 94);
		border-radius: 50%;
		flex-shrink: 0;
		box-shadow: 0 0 8px rgba(34, 197, 94, 0.6);
		animation: dotPulse 2s ease-in-out infinite;
	}

	@keyframes dotPulse {
		0%, 100% {
			opacity: 1;
			transform: scale(1);
		}
		50% {
			opacity: 0.7;
			transform: scale(1.1);
		}
	}

	.step-title {
		color: #cbd5e1;
		font-size: 0.8rem;
		font-weight: 500;
		flex: 1;
		line-height: 1.3;
	}

	.active .step-title {
		color: #e2e8f0;
		font-weight: 600;
	}

	.complete .step-title {
		color: rgba(203, 213, 225, 0.7);
	}

	.pending .step-title {
		color: rgba(203, 213, 225, 0.5);
	}

	.step-content {
		color: #94a3b8;
		font-size: 0.8rem;
		line-height: 1.5;
	}

	@keyframes slideIn {
		from {
			opacity: 0;
			transform: translateY(8px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
