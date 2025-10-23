<script>
	import { resolveCanvasCommand, normalizeCommand } from './index.js';
	
	let { 
		command = {}, 
		canvasWidth = 800, 
		opacity = 1,
		onRender = null 
	} = $props();

	
	// Normalizar el comando
	const normalizedCommand = $derived.by(() => {
		const result = normalizeCommand(command);
		if (!result) {
			console.error('❌ CanvasCommandRenderer: normalizeCommand retornó null para:', command);
		}
		return result;
	});

	console.log('Comando recibidosssss:', normalizedCommand.params);
	
	// Obtener el loader del componente (función de importación dinámica)
	const componentLoader = $derived(
		normalizedCommand && normalizedCommand.type && typeof normalizedCommand.type === 'string'
			? resolveCanvasCommand(normalizedCommand.type) 
			: null
	);
	
	// Cargar el componente de forma asíncrona
	let componentPromise = $derived(
		componentLoader ? componentLoader() : Promise.resolve(null)
	);
	
	// Callback cuando el componente se renderiza
	$effect(() => {
		if (componentLoader && onRender) {
			onRender(normalizedCommand);
		}
	});
</script>

{#if normalizedCommand && componentLoader}
	{#await componentPromise}
		<div class="canvas-command-loading">
			<p class="loading-text">Cargando {normalizedCommand.type}...</p>
		</div>
	{:then module}
		{@const Component = module?.default}
		{#if Component && normalizedCommand}
			<div class="canvas-command-wrapper" style="opacity: {opacity}; transition: opacity 1s ease;">
				<Component 
					params={normalizedCommand.params} 
					{canvasWidth} 
					{opacity}
				/>
			</div>
		{:else}
			<div class="canvas-command-error">
				<p class="error-text">⚠️ Error: módulo sin default export - {normalizedCommand?.type}</p>
			</div>
		{/if}
	{:catch error}
		<div class="canvas-command-error">
			<p class="error-text">⚠️ Error cargando: {error.message}</p>
		</div>
	{/await}
{:else if normalizedCommand}
	<div class="canvas-command-error">
		<p class="error-text">⚠️ Comando desconocido: {normalizedCommand.type}</p>
	</div>
{/if}

<style>
	.canvas-command-wrapper {
		width: 100%;
		margin-bottom: 8px;
	}
	
	.canvas-command-error {
		padding: 12px;
		background: rgba(239, 68, 68, 0.1);
		border: 1px solid rgba(239, 68, 68, 0.3);
		border-radius: 6px;
		margin-bottom: 8px;
	}
	
	.error-text {
		color: #fca5a5;
		font-size: 0.875rem;
		font-family: monospace;
	}
	
	.canvas-command-loading {
		padding: 12px;
		background: rgba(99, 102, 241, 0.05);
		border: 1px solid rgba(99, 102, 241, 0.2);
		border-radius: 6px;
		margin-bottom: 8px;
		text-align: center;
	}
	
	.loading-text {
		color: #818cf8;
		font-size: 0.875rem;
		opacity: 0.7;
		animation: pulse 1.5s ease-in-out infinite;
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
