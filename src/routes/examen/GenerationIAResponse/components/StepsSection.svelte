<script lang="ts">
	import { fade, fly, slide } from 'svelte/transition';
	import { cubicOut, elasticOut } from 'svelte/easing';
	import MathForm from '../../componentes/Math.svelte';

	const { steps, lengMath } = $props<{ steps: string[]; lengMath: boolean }>();

	let activeStep = $state(-1);

	function setActiveStep(index) {
		activeStep = activeStep === index ? -1 : index;
	}
</script>

<div class="w-full my-4">
	<div class="w-full">
		<ol class="list-none pl-0 space-y-4">
			{#each steps as paso, i}
				<li
					class="step-item"
					class:active={activeStep === i}
					style="--index: {i}"
					in:fly={{ y: 20, delay: 200 + i * 100, duration: 400, easing: cubicOut }}
				>
					<button
						class="flex items-start w-full text-left focus:outline-none rounded-lg p-3 transition-colors hover:bg-white/5 border border-white/10"
						onclick={() => setActiveStep(i)}
					>
						<div class="mr-4 flex-shrink-0 mt-0.5">
							<div
								class="flex items-center justify-center w-8 h-8 rounded-full border-2 border-amber-500/50 text-amber-200 font-bold text-sm bg-amber-900/20"
							>
								{i + 1}
							</div>
						</div>

						<div class="flex-1 min-w-0">
							<!-- Step label -->
							<div class="step-label mb-1">
								<span class="text-amber-400/80 text-xs font-medium tracking-widest uppercase">
									PASO {i + 1}
								</span>
							</div>

							<!-- Step content -->
							<div class="step-content text-gray-200 leading-relaxed text-sm sm:text-base">
								{#if lengMath}
									<MathForm isBlock={false} content={paso} />
								{:else}
									<p>{paso}</p>
								{/if}
							</div>
						</div>
					</button>
				</li>
			{/each}
		</ol>
	</div>
</div>

<style>
	.step-item {
		width: 100%;
	}

	.step-item button:focus {
		outline: 2px solid rgba(245, 158, 11, 0.5);
		outline-offset: 2px;
	}
</style>
