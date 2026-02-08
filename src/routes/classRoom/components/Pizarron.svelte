<script>
	import { onMount, tick } from 'svelte';
	import CanvasCommandRenderer from '$lib/classRoom/canvas_commands/CanvasCommandRenderer.svelte';

	let { commands = [], currentStep = 1, isRendering = false } = $props();

	// Agrupar comandos por paso
	let canvasByStep = $derived.by(() => {
		const grouped = {};
		commands.forEach((command) => {
			const step = command.step || 1;
			if (!grouped[step]) {
				grouped[step] = [];
			}
			grouped[step].push(command);
		});
		return grouped;
	});

	// Obtener pasos ordenados
	let sortedSteps = $derived(Object.keys(canvasByStep).sort((a, b) => Number(a) - Number(b)));

	// Referencia al contenedor scrolleable
	let surfaceRef = $state(null);

	// Sistema de renderizado progresivo
	let previousCommandCount = $state(0);
	let renderQueue = $state([]);
	let isAnimating = $state(false);
	let renderedCommands = $state(new Map()); // Map<step, Set<commandIndex>>
	let commandTimestamps = $state(new Map()); // Map<commandIndex, timestamp>

	// Calcular opacidad de cada comando basado en su timestamp
	function getCommandOpacity(commandIndex) {
		const timestamp = commandTimestamps.get(commandIndex);
		if (!timestamp) return 0;

		const elapsed = Date.now() - timestamp;
		const fadeDuration = 1000; // 1 segundo de fade-in
		return Math.min(1.0, elapsed / fadeDuration);
	}

	function extractCommandMeta(command) {
		let raw = command;
		if (command?.command && typeof command.command === 'object') {
			raw = command.command;
		}
		const type = raw?.command || raw?.type || '';
		const params = raw?.parameters || raw?.params || {};
		return { type: type?.toLowerCase?.() || '', params };
	}

	function getPreferredWidth(command, availableWidth) {
		const { type, params } = extractCommandMeta(command);
		const maxWidth = Math.max(240, availableWidth);
		const clampWidth = (value) => Math.min(Math.max(240, value), maxWidth);

		switch (type) {
			case 'draw_text': {
				const text = params.text || '';
				const charWidth = params.font?.includes('bold') ? 11 : 9;
				const padding = 80;
				return clampWidth(text.length * charWidth + padding);
			}
			case 'draw_line': {
				const x1 = Number.isFinite(params.x1) ? params.x1 : 0;
				const x2 = Number.isFinite(params.x2) ? params.x2 : availableWidth;
				const length = Math.abs(x2 - x1) + 80;
				return clampWidth(length);
			}
			case 'draw_arrow': {
				const x1 = Number.isFinite(params.x1) ? params.x1 : 40;
				const x2 = Number.isFinite(params.x2) ? params.x2 : availableWidth - 40;
				const length = Math.abs(x2 - x1) + 100;
				return clampWidth(length);
			}
			case 'draw_circle': {
				const radius = Number.isFinite(params.radius) ? params.radius : 60;
				return clampWidth(radius * 2 + 120);
			}
			case 'draw_triangle':
			case 'draw_vector':
			case 'highlight': {
				return clampWidth(params?.width || 320);
			}
			case 'draw_equation': {
				// Equations should take full available width (minus some padding)
				// to allow the internal component to handle layout/centering/wrapping
				return Math.max(availableWidth - 32, 300);
			}
			case 'draw_diagram':
			case 'draw_axis': {
				return maxWidth;
			}
			default:
				return clampWidth(params.width || 320);
		}
	}

	// Scroll al último paso
	function scrollToLatestStep() {
		if (!surfaceRef) return;

		const lastStep = sortedSteps[sortedSteps.length - 1];
		const lastStepElement = surfaceRef.querySelector(`[data-step="${lastStep}"]`);

		if (lastStepElement) {
			lastStepElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
		}
	}

	// Renderizado inmediato de todos los comandos
	$effect(() => {
		if (commands.length > 0 && sortedSteps.length > 0) {
			const currentCommandCount = commands.length;
			const hasNewContent = currentCommandCount > previousCommandCount;

			const newRenderedCommands = new Map();
			const newTimestamps = new Map();

			sortedSteps.forEach((step) => {
				const stepCommands = canvasByStep[step] || [];

				if (stepCommands.length > 0) {
					newRenderedCommands.set(Number(step), new Set());

					stepCommands.forEach((cmd) => {
						const commandIndex = commands.findIndex((c) => c === cmd);

						if (commandIndex !== -1) {
							newRenderedCommands.get(Number(step)).add(commandIndex);
							newTimestamps.set(commandIndex, Date.now() - 2000);
						}
					});
				}
			});

			renderedCommands = newRenderedCommands;
			commandTimestamps = newTimestamps;
			previousCommandCount = currentCommandCount;

			if (hasNewContent) {
				Promise.resolve().then(async () => {
					await tick();
					scrollToLatestStep();
				});
			}
		}
	});

	// Obtener ancho del contenedor
	let containerWidth = $state(800);

	onMount(() => {
		if (surfaceRef) {
			const updateWidth = () => {
				containerWidth = surfaceRef.clientWidth - 32; // Restar padding
			};
			updateWidth();

			const resizeObserver = new ResizeObserver(updateWidth);
			resizeObserver.observe(surfaceRef);

			return () => resizeObserver.disconnect();
		}
	});
</script>

<div class="blackboard-container">
	<div class="blackboard-frame">
		<div class="blackboard-header">
			<h3 class="blackboard-title">◆ Pizarrón</h3>
		</div>

		<div class="blackboard-surface" bind:this={surfaceRef}>
			{#each sortedSteps as step (step)}
				<div class="step-section" data-step={step}>
					<div class="step-label">
						<span class="step-text">Paso {step}</span>
					</div>

					<div class="commands-container">
						{#each canvasByStep[step] || [] as cmd, idx (idx)}
							{@const commandIndex = commands.findIndex((c) => c === cmd)}
							{@const stepRendered = renderedCommands.get(Number(step))}
							{@const isRendered = stepRendered?.has(commandIndex)}
							{@const preferredWidth = getPreferredWidth(cmd, containerWidth)}
							{@const opacity = isRendered ? getCommandOpacity(commandIndex) : 0}
							{console.log('Comando:', cmd)}

							{#if isRendered}
								<div class="command-wrapper" style={`width: ${preferredWidth}px; max-width: 100%;`}>
									<CanvasCommandRenderer command={cmd} canvasWidth={preferredWidth} {opacity} />
								</div>
							{/if}
						{/each}
					</div>
				</div>
			{/each}

			{#if sortedSteps.length === 0}
				<div class="empty-state">
					<p class="chalk-text">El pizarrón está limpio</p>
					<p class="chalk-text-small">Las visualizaciones aparecerán aquí</p>
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	.blackboard-container {
		animation: fadeIn 0.5s ease-in;
		height: 90%;
		display: flex;
		flex-direction: column;
	}

	.blackboard-frame {
		background: rgba(15, 23, 42, 0.15);
		border-radius: 8px;
		padding: 0;
		backdrop-filter: blur(4px);
		border: 1px solid rgba(99, 102, 241, 0.1);
		overflow: hidden;
		height: 100%;
		min-height: 400px;
		display: flex;
		flex-direction: column;
	}

	.blackboard-header {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 10px 16px;
		border-bottom: 1px solid rgba(99, 102, 241, 0.1);
		background: rgba(15, 23, 42, 0.3);
	}

	.blackboard-title {
		color: #818cf8;
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.12em;
		opacity: 0.8;
	}

	.blackboard-surface {
		background: transparent;
		border-radius: 0;
		padding: 16px;
		flex: 1;
		overflow-y: auto;
		overflow-x: hidden;
		min-height: 0;
		max-height: 100%;
		scroll-behavior: smooth;
	}

	.step-section {
		margin-bottom: 24px;
	}

	.step-label {
		margin: 20px 0 16px 0;
	}

	.step-text {
		color: #818cf8;
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.15em;
		text-shadow: 0 0 8px rgba(129, 140, 248, 0.4);
		font-family:
			'Inter',
			-apple-system,
			BlinkMacSystemFont,
			sans-serif;
		opacity: 0.8;
	}

	.commands-container {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		gap: 16px;
		align-items: start;
		justify-items: center;
	}

	.command-wrapper {
		display: inline-flex;
		justify-content: center;
		align-items: center;
	}

	@media (max-width: 640px) {
		.commands-container {
			grid-template-columns: 1fr;
			gap: 12px;
		}
	}

	.empty-state {
		text-align: center;
		padding: 60px 20px;
	}

	.chalk-text {
		color: rgba(129, 140, 248, 0.6);
		font-size: 1.125rem;
		font-weight: 500;
		margin-bottom: 8px;
		text-shadow: 0 0 10px rgba(129, 140, 248, 0.3);
	}

	.chalk-text-small {
		color: rgba(129, 140, 248, 0.4);
		font-size: 0.875rem;
		text-shadow: 0 0 8px rgba(129, 140, 248, 0.2);
	}

	/* Scrollbar */
	.blackboard-surface::-webkit-scrollbar {
		width: 10px;
	}

	.blackboard-surface::-webkit-scrollbar-track {
		background: rgba(15, 23, 42, 0.4);
		border-radius: 5px;
		margin: 4px 0;
	}

	.blackboard-surface::-webkit-scrollbar-thumb {
		background: rgba(99, 102, 241, 0.5);
		border-radius: 5px;
		border: 2px solid rgba(15, 23, 42, 0.4);
		transition: background 0.2s ease;
	}

	.blackboard-surface::-webkit-scrollbar-thumb:hover {
		background: rgba(99, 102, 241, 0.7);
	}

	.blackboard-surface {
		scrollbar-width: thin;
		scrollbar-color: rgba(99, 102, 241, 0.5) rgba(15, 23, 42, 0.4);
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
