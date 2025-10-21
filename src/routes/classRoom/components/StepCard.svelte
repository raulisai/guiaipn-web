<script>
	import ContentRenderer from './ContentRenderer.svelte';

	let { step, isActive = false } = $props();
</script>

<div 
	class="step-card bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-lg p-6 border-2 transition-all duration-300"
	class:border-green-500={isActive && step.isComplete}
	class:border-blue-500={isActive && !step.isComplete}
	class:border-gray-700={!isActive}
	class:opacity-60={!isActive && !step.isComplete}
>
	<!-- Header del Paso -->
	<div class="step-header flex items-center justify-between mb-4">
		<div class="flex items-center gap-3">
			<div 
				class="step-number w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
				class:bg-green-500={step.isComplete}
				class:bg-blue-500={isActive && !step.isComplete}
				class:bg-gray-700={!isActive && !step.isComplete}
			>
				{#if step.isComplete}
					✓
				{:else}
					{step.step + 1}
				{/if}
			</div>
			<h3 class="text-lg font-semibold text-white">
				{step.title}
			</h3>
		</div>
		
		<!-- Badge de tipo -->
		{#if step.type === 'text'}
			<span class="px-3 py-1 rounded-full text-xs font-medium bg-purple-500 bg-opacity-20 text-purple-400">
				📝 Texto
			</span>
		{:else if step.type === 'math'}
			<span class="px-3 py-1 rounded-full text-xs font-medium bg-blue-500 bg-opacity-20 text-blue-400">
				🔢 Matemáticas
			</span>
		{:else}
			<span class="px-3 py-1 rounded-full text-xs font-medium bg-green-500 bg-opacity-20 text-green-400">
				🖼️ Diagrama
			</span>
		{/if}
	</div>

	<!-- Contenido del Paso -->
	<div class="step-content">
		<ContentRenderer content={step.content} type={step.type} />
	</div>
</div>

<style>
	.step-card {
		animation: slideIn 0.4s ease-out;
	}

	@keyframes slideIn {
		from {
			opacity: 0;
			transform: translateX(-20px);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}
</style>
