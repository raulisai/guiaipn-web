<script>
	import katex from 'katex';
	import 'katex/dist/katex.min.css';

	let { params = {}, canvasWidth = 800, opacity = 1 } = $props();

	// Extraer equation y description de params
	const equation = $derived(params?.equation || params?.latex || '');
	const description = $derived(params?.description || '');
	const color = $derived(params?.color || '#ffd700');
	const isHighlighted = $derived(params?.box || params?.highlight);

	function renderMath(tex) {
		try {
			return katex.renderToString(tex, {
				throwOnError: false,
				displayMode: true,
				trust: true,
				strict: false
			});
		} catch (e) {
			console.error('KaTeX error:', e);
			return tex;
		}
	}
</script>

<div
	class="equation-container"
	style:opacity
	style:width="{Math.min(canvasWidth, 800)}px"
	style:border-color={isHighlighted ? color : 'transparent'}
	class:highlighted={isHighlighted}
>
	<div class="math-content" style:color>
		{@html renderMath(equation)}
	</div>

	{#if description}
		<div class="equation-description">
			→ {description}
		</div>
	{/if}
</div>

<style>
	.equation-container {
		position: relative;
		margin: 1rem 0;
		padding: 1rem;
		border-radius: 8px;
		border: 2px solid transparent;
		transition:
			opacity 0.5s ease,
			border-color 0.3s ease;
		background: rgba(15, 23, 42, 0.4);
		backdrop-filter: blur(2px);
		max-width: 100%;
		overflow-x: auto;
	}

	.highlighted {
		background: rgba(15, 23, 42, 0.6);
		box-shadow: 0 0 15px rgba(255, 215, 0, 0.1);
	}

	.math-content {
		font-size: 1.25rem;
		overflow-x: auto;
		overflow-y: hidden;
		text-align: center;
		padding-bottom: 0.5rem;
	}

	.equation-description {
		margin-top: 0.5rem;
		font-size: 0.9rem;
		color: rgba(226, 232, 240, 0.7);
		text-align: center;
		font-family:
			system-ui,
			-apple-system,
			sans-serif;
	}

	/* Scrollbar styling for math overflow */
	.equation-container::-webkit-scrollbar,
	.math-content::-webkit-scrollbar {
		height: 4px;
	}

	.equation-container::-webkit-scrollbar-thumb,
	.math-content::-webkit-scrollbar-thumb {
		background: rgba(255, 255, 255, 0.2);
		border-radius: 2px;
	}
</style>
