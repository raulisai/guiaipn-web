<script>
	import StepCard from './StepCard.svelte';
	
	let { steps = [], currentStep = null } = $props();
</script>

<div class="steps-container">
	<!-- Header -->
	<div class="steps-header">
		<div class="header-info">
			<h3 class="card-title">◆ Explicación</h3>
			<span class="step-counter">{steps.length} pasos</span>
		</div>
	</div>
	
	<!-- Contenido -->
	<div class="card-content">
		{#each steps as step, index (step.step)}
			<StepCard 
				{step} 
				isActive={step.step === currentStep} 
				isFirst={index === 0}
				isLast={index === steps.length - 1}
			/>
		{/each}
	</div>
</div>

<style>
	.steps-container {
		display: flex;
		flex-direction: column;
		height: 100%;
		background: rgba(15, 23, 42, 0.15);
		border-radius: 8px;
		border: 1px solid rgba(99, 102, 241, 0.1);
		backdrop-filter: blur(4px);
		overflow: hidden;
	}

	.steps-header {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 10px 16px;
		border-bottom: 1px solid rgba(99, 102, 241, 0.1);
		background: rgba(15, 23, 42, 0.3);
	}

	.header-info {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.card-title {
		color: #818cf8;
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.12em;
		opacity: 0.8;
	}

	.step-counter {
		color: rgba(129, 140, 248, 0.5);
		font-size: 0.7rem;
		font-weight: 500;
		letter-spacing: 0.05em;
	}

	.card-content {
		flex: 1;
		overflow-y: auto;
		padding: 12px;
		display: flex;
		flex-direction: column;
		gap: 10px;
		min-height: 0;
		animation: slideDown 0.3s ease-out;
	}

	@keyframes slideDown {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* Scrollbar ultra delgado */
	.card-content::-webkit-scrollbar {
		width: 4px;
	}

	.card-content::-webkit-scrollbar-track {
		background: transparent;
	}

	.card-content::-webkit-scrollbar-thumb {
		background: rgba(99, 102, 241, 0.25);
		border-radius: 2px;
	}

	.card-content::-webkit-scrollbar-thumb:hover {
		background: rgba(99, 102, 241, 0.4);
	}
</style>
