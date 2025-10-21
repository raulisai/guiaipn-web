<script>
	let { error = null, onRetry = null, onGoBack = null } = $props();

	function getErrorMessage() {
		if (!error) return {
			title: '❌ Error',
			message: 'Ha ocurrido un error desconocido',
			type: 'generic'
		};

		switch (error.code) {
			case 'AUTH_REQUIRED':
			case 'AUTH_FAILED':
				return {
					title: '🔐 Error de Autenticación',
					message: 'Tu sesión ha expirado o no tienes permisos. Por favor, inicia sesión nuevamente.',
					type: 'auth'
				};
			case 'CONNECTION_ERROR':
				return {
					title: '🔌 Error de Conexión',
					message: 'No se pudo conectar con el servidor. Verifica tu conexión a internet.',
					type: 'connection'
				};
			case 'AI_GENERATION_ERROR':
				return {
					title: '🤖 Error al Generar Explicación',
					message: 'Hubo un problema al generar la explicación. Por favor, intenta nuevamente.',
					type: 'generation'
				};
			case 'VALIDATION_ERROR':
				return {
					title: '⚠️ Error de Validación',
					message: error.message || 'Los datos proporcionados no son válidos.',
					type: 'validation'
				};
			default:
				return {
					title: '❌ Error',
					message: error.message || 'Ha ocurrido un error inesperado.',
					type: 'generic'
				};
		}
	}

	const errorInfo = $derived(getErrorMessage());
</script>

<div class="error-state flex flex-col items-center justify-center min-h-[400px] p-8">
	<!-- Icono de error -->
	<div class="error-icon mb-6">
		<div class="error-circle">
			<span class="text-6xl">
				{#if errorInfo.type === 'auth'}
					🔐
				{:else if errorInfo.type === 'connection'}
					🔌
				{:else if errorInfo.type === 'generation'}
					🤖
				{:else}
					❌
				{/if}
			</span>
		</div>
	</div>

	<!-- Título del error -->
	<h2 class="text-2xl font-bold text-white mb-3 text-center">
		{errorInfo.title}
	</h2>

	<!-- Mensaje del error -->
	<p class="text-gray-300 text-center mb-8 max-w-md">
		{errorInfo.message}
	</p>

	<!-- Acciones -->
	<div class="error-actions flex gap-4">
		{#if errorInfo.type === 'auth'}
			<a
				href="/cuenta/login"
				class="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
			>
				🔑 Iniciar Sesión
			</a>
		{:else}
			{#if onRetry}
				<button
					onclick={onRetry}
					class="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors"
				>
					🔄 Reintentar
				</button>
			{/if}
		{/if}

		{#if onGoBack}
			<button
				onclick={onGoBack}
				class="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors"
			>
				← Volver
			</button>
		{/if}
	</div>

	<!-- Detalles técnicos (colapsable) -->
	{#if error && (error.code || error.stack)}
		<details class="mt-8 w-full max-w-2xl">
			<summary class="cursor-pointer text-sm text-gray-500 hover:text-gray-400 text-center">
				Ver detalles técnicos
			</summary>
			<div class="mt-4 p-4 bg-gray-900 rounded-lg border border-gray-700">
				<pre class="text-xs text-gray-400 overflow-auto">{JSON.stringify(error, null, 2)}</pre>
			</div>
		</details>
	{/if}
</div>

<style>
	.error-state {
		animation: fadeIn 0.3s ease-in;
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

	.error-icon {
		animation: shake 0.5s ease-in-out;
	}

	@keyframes shake {
		0%, 100% {
			transform: translateX(0);
		}
		25% {
			transform: translateX(-10px);
		}
		75% {
			transform: translateX(10px);
		}
	}

	.error-circle {
		width: 120px;
		height: 120px;
		border-radius: 50%;
		background: rgba(239, 68, 68, 0.1);
		border: 3px solid rgba(239, 68, 68, 0.3);
		display: flex;
		align-items: center;
		justify-content: center;
		animation: pulse 2s ease-in-out infinite;
	}

	@keyframes pulse {
		0%, 100% {
			transform: scale(1);
			opacity: 1;
		}
		50% {
			transform: scale(1.05);
			opacity: 0.8;
		}
	}

	.error-actions button,
	.error-actions a {
		touch-action: manipulation;
		user-select: none;
	}

	.error-actions button:active,
	.error-actions a:active {
		transform: scale(0.95);
	}
</style>
