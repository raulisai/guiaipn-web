<script>
	import {
		normalizeComponentCommand,
		resolveComponentCommand
	} from './index.js';

	let {
		command = {},
		containerSize = { width: '100%', maxWidth: '100%' },
		context = 'panel',
		onRender = null
	} = $props();

	const normalizedCommand = $derived.by(() => {
		const result = normalizeComponentCommand(command);
		if (!result) {
			console.error('❌ ComponentCommandRenderer: normalizeComponentCommand retornó null para:', command);
		}
		return result;
	});

	const componentLoader = $derived(
		normalizedCommand && normalizedCommand.type && typeof normalizedCommand.type === 'string'
			? resolveComponentCommand(normalizedCommand.type)
			: null
	);

	let componentPromise = $derived(componentLoader ? componentLoader() : Promise.resolve(null));

	const computedLayout = $derived.by(() => {
		return {
			...containerSize,
			...(normalizedCommand?.layout || {}),
			context
		};
	});

	$effect(() => {
		if (componentLoader && onRender && normalizedCommand) {
			onRender(normalizedCommand);
		}
	});
</script>

{#if normalizedCommand && componentLoader}
	{#await componentPromise}
		<div class="component-command-loading">
			<p class="loading-text">Cargando {normalizedCommand.type}...</p>
		</div>
	{:then module}
		{@const Component = module?.default}
		{#if Component && normalizedCommand}
			<div class="component-command-wrapper" style={`opacity: ${normalizedCommand?.params?.opacity ?? 1};`}>
				<Component
					params={normalizedCommand.params}
					layout={computedLayout}
					context={context}
				/>
			</div>
		{:else}
			<div class="component-command-error">
				<p class="error-text">⚠️ Error: módulo sin default export - {normalizedCommand?.type}</p>
			</div>
		{/if}
	{:catch error}
		<div class="component-command-error">
			<p class="error-text">⚠️ Error cargando: {error.message}</p>
		</div>
	{/await}
{:else if normalizedCommand}
	<div class="component-command-error">
		<p class="error-text">⚠️ Componente desconocido: {normalizedCommand.type}</p>
	</div>
{/if}

<style>
	.component-command-wrapper {
		width: 100%;
		max-width: 100%;
		transition: opacity 0.4s ease, transform 0.4s ease;
		animation: componentFadeIn 0.4s ease;
	}

	.component-command-error {
		padding: 12px;
		background: rgba(239, 68, 68, 0.1);
		border: 1px solid rgba(239, 68, 68, 0.3);
		border-radius: 8px;
		margin-bottom: 8px;
	}

	.error-text {
		color: #fca5a5;
		font-size: 0.875rem;
		font-family: 'Inter', sans-serif;
	}

	.component-command-loading {
		padding: 12px;
		background: rgba(99, 102, 241, 0.05);
		border: 1px solid rgba(99, 102, 241, 0.2);
		border-radius: 8px;
		margin-bottom: 8px;
		text-align: center;
	}

	.loading-text {
		color: #818cf8;
		font-size: 0.875rem;
		opacity: 0.7;
		animation: pulse 1.5s ease-in-out infinite;
	}

	@keyframes componentFadeIn {
		from {
			opacity: 0;
			transform: translateY(8px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes pulse {
		0%, 100% {
			opacity: 0.4;
		}
		50% {
			opacity: 0.8;
		}
	}
</style>
