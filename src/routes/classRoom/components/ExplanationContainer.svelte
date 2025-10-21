<script>
	import { explanationStore, explanationProgress } from '$lib/stores';

	let { children } = $props();
</script>

<div class="explanation-container w-full max-w-7xl mx-auto">
	<!-- Barra de Progreso -->
	{#if $explanationStore.isExplaining || $explanationStore.isPaused}
		<div class="progress-bar mb-6">
			<div class="flex justify-between items-center mb-2">
				<span class="text-sm text-gray-400">
					Paso {$explanationStore.currentStep + 1} de {$explanationStore.totalSteps}
				</span>
				<span class="text-sm text-gray-400">
					{$explanationProgress}%
				</span>
			</div>
			<div class="w-full bg-gray-800 rounded-full h-2.5 overflow-hidden">
				<div 
					class="h-full rounded-full transition-all duration-500 ease-out"
					class:bg-green-500={!$explanationStore.isPaused}
					class:bg-yellow-500={$explanationStore.isPaused}
					style="width: {$explanationProgress}%"
				></div>
			</div>
		</div>
	{/if}

	<!-- Contenedor de Pasos -->
	<div class="steps-container space-y-4">
		{@render children()}
	</div>
</div>

<style>
	.explanation-container {
		animation: fadeIn 0.3s ease-in;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
