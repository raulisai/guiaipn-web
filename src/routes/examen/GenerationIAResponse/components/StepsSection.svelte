<script lang="ts">
	export let steps: string[];
</script>

<div>
	<p class="text-gray-300 text-sm font-semibold uppercase mb-3 flex items-center">
		<span class="inline-block w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></span>
		Pasos para resolver
	</p>
	<div class="text-gray-200 text-secondary bg-gray-800/10 p-4 rounded-lg border-l-2 border-gray-500/50">
		<ol class="list-none pl-0 space-y-3">
			{#each steps as paso, i}
				<li class="flex items-start">
					<span class="flex-shrink-0 inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-700/50 text-gray-300 mr-3 border border-gray-600/30">
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
</style>
