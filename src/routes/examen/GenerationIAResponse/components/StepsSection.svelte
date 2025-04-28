<script lang="ts">
	export let steps: string[];
</script>

<div
	class="bg-gray-800/50 rounded-xl p-5 border border-purple-500/20 shadow-lg shadow-purple-900/10 hover:shadow-purple-500/30 transition-all duration-500 group animate-fadeIn animation-delay-200"
>
	<p class="text-purple-300 text-sm font-semibold uppercase mb-3 flex items-center">
		<span
			class="inline-block w-1.5 h-1.5 bg-purple-400 rounded-full mr-2 group-hover:animate-ping"
		></span>
		Pasos para resolver
	</p>
	<div
		class="text-gray-200 text-secondary bg-gray-900/40 p-4 rounded-lg border-l-2 border-purple-400/30 group-hover:border-purple-400 transition-all duration-300"
	>
		<ol class="list-none pl-0 space-y-3">
			{#each steps as paso, i}
				<li
					class="flex items-start group/item hover:translate-x-1 transition-all duration-300"
				>
					<span
						class="flex-shrink-0 inline-flex items-center justify-center h-6 w-6 rounded-full bg-purple-900/50 text-purple-300 mr-3 border border-purple-500/30 group-hover/item:bg-purple-800/80 transition-all duration-300"
					>
						{i + 1}
					</span>
					<span class="leading-relaxed">{paso}</span>
				</li>
			{/each}
		</ol>
	</div>
</div>

<style>
	.text-secondary {
		font-size: 16px;
	}
	
	@media screen and (max-width: 768px) {
		.text-secondary {
			font-size: 12px;
		}
	}
	
	/* Nueva animación de fadeIn para elementos */
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
	
	.animate-fadeIn {
		animation: fadeIn 0.5s ease forwards;
	}
	
	/* Animaciones con retraso */
	.animation-delay-200 {
		animation-delay: 0.2s;
	}
</style>
