<script>
	import ContentRenderer from './ContentRenderer.svelte';

	let { step, isActive = false } = $props();
</script>

<div 
	class="step-card"
	class:active={isActive}
	class:complete={step.isComplete}
>
	<!-- Header minimalista -->
	<div class="step-header">
		<div class="step-indicator">
			{#if step.isComplete}
				<span class="check-icon">✓</span>
			{:else}
				<span class="step-num">{step.step}</span>
			{/if}
		</div>
		<h3 class="step-title">{step.title}</h3>
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
		align-items: center;
		gap: 8px;
		margin-bottom: 8px;
	}

	.step-indicator {
		flex-shrink: 0;
		width: 22px;
		height: 22px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(99, 102, 241, 0.15);
		border: 1px solid rgba(99, 102, 241, 0.25);
		transition: all 0.2s ease;
	}

	.active .step-indicator {
		background: rgba(99, 102, 241, 0.25);
		border-color: rgba(99, 102, 241, 0.4);
		box-shadow: 0 0 8px rgba(99, 102, 241, 0.3);
	}

	.complete .step-indicator {
		background: rgba(74, 222, 128, 0.15);
		border-color: rgba(74, 222, 128, 0.3);
	}

	.step-num {
		color: #818cf8;
		font-size: 0.75rem;
		font-weight: 600;
	}

	.check-icon {
		color: #4ade80;
		font-size: 0.875rem;
		font-weight: bold;
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
