<script>
	import { slide } from 'svelte/transition';

	let { showStats = $bindable(false) } = $props();
	
	const strengths = [
		{ subject: 'Matemáticas', score: 85 },
		{ subject: 'Física', score: 82 }
	];
	
	const weaknesses = [
		{ subject: 'Química', score: 62 },
		{ subject: 'Biología', score: 65 }
	];
</script>

<div class="stats-container">
	<button
		onclick={() => showStats = !showStats}
		class="w-full flex items-center justify-between px-4 py-3 bg-blue-card/50 backdrop-blur-sm rounded-xl border border-cyan/20 hover:border-cyan/40 transition-all duration-300"
	>
		<span class="text-white/80 font-medium text-sm md:text-base">📊 Estadísticas</span>
		<span class="text-white/60 text-xl transform transition-transform duration-300 {showStats ? 'rotate-180' : ''}">
			▼
		</span>
	</button>
	
	{#if showStats}
		<div 
			transition:slide={{ duration: 300 }}
			class="mt-2 bg-blue-card/50 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-cyan/20"
		>
			<div class="grid grid-cols-2 gap-3">
				<!-- Fortalezas -->
				<div>
					<h3 class="text-sm font-bold text-green-400 mb-2 flex items-center gap-1">
						<span>💪</span> Fortalezas
					</h3>
					<ul class="space-y-1 text-xs">
						{#each strengths as item}
							<li class="flex items-center justify-between text-white/80">
								<span>{item.subject}</span>
								<span class="text-green-400 font-bold">{item.score}%</span>
							</li>
						{/each}
					</ul>
				</div>
				
				<!-- Áreas de mejora -->
				<div>
					<h3 class="text-sm font-bold text-yellow-400 mb-2 flex items-center gap-1">
						<span>📈</span> Mejorar
					</h3>
					<ul class="space-y-1 text-xs">
						{#each weaknesses as item}
							<li class="flex items-center justify-between text-white/80">
								<span>{item.subject}</span>
								<span class="text-yellow-400 font-bold">{item.score}%</span>
							</li>
						{/each}
					</ul>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	:global(.bg-blue-card) {
		background: #0b1a32a3;
	}
</style>
