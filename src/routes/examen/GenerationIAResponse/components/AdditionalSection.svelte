<script lang="ts">
	import { fly } from 'svelte/transition'; // Added import for fly
	import MathForm from '../../componentes/Math.svelte';
	export let content: string;
	export let lengMath: boolean;

	// Parse content to format code/formulas distinctly
	$: formattedContent = formatContent(content);

	function formatContent(text) {
		// Simple content formatting - this could be enhanced with regex for specific formula patterns
		return text.split('\n').filter((line) => line.trim().length > 0);
	}
</script>

{#if content}
	<div class="prose prose-sm sm:prose-base max-w-none text-gray-300">
		{#if lengMath}
			<MathForm isBlock={false} {content} />
		{:else}
			<div class="flex flex-col items-center w-full">
				<div
					class="w-full bg-yellow-900/10 border border-yellow-700/30 rounded-lg p-4 sm:p-6 shadow-sm"
				>
					<h4
						class="text-amber-400/90 font-serif text-sm uppercase tracking-wider mb-4 border-b border-amber-800/30 pb-2"
					>
						Conceptos Clave
					</h4>

					<!-- Formula content -->
					<div class="font-mono text-amber-100/90 text-sm sm:text-base space-y-2">
						{#each formattedContent as line, i}
							<div
								class="p-2 hover:bg-yellow-500/5 rounded transition-colors duration-200"
								in:fly={{ x: 20, delay: i * 100, duration: 400, opacity: 0 }}
							>
								{line}
							</div>
						{/each}
					</div>
				</div>
			</div>
		{/if}
	</div>
{:else}
	<p class="text-gray-500 italic text-sm text-center py-4">
		No hay información adicional disponible.
	</p>
{/if}

<style>
	/* Clean styles for blackboard readability */
</style>
