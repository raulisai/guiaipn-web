<script>
	import { onMount, onDestroy } from 'svelte';
	import { socketService } from '$lib/api/socket';
	import { explanationStore } from '$lib/stores';
	import { user } from '$lib/stores';

	// Estado local para el testing
	let connectionStatus = $state('Desconectado');
	let sessionId = $state(null);
	let logs = $state([]);
	let isConnecting = $state(false);

	// Función para agregar logs
	function addLog(message, type = 'info') {
		const timestamp = new Date().toLocaleTimeString();
		logs = [...logs, { timestamp, message, type }];
		console.log(`[${timestamp}] ${message}`);
	}

	// Conectar al socket
	async function connect() {
		if (!$user?.access_token) {
			addLog('❌ Error: No hay token de usuario. Por favor inicia sesión.', 'error');
			return;
		}

		isConnecting = true;
		addLog('🔄 Intentando conectar...', 'info');

		try {
			// Configurar listeners antes de conectar
			socketService.onConnectionEstablished((data) => {
				addLog(`✅ Conexión establecida`, 'success');
				addLog(`📋 Session ID: ${data.session_id}`, 'success');
				sessionId = data.session_id;
				connectionStatus = 'Conectado';
				explanationStore.setConnected(data.session_id);
			});

			socketService.onError((error) => {
				addLog(`🚫 Error: ${error.message || error.code}`, 'error');
			});

			// Conectar
			await socketService.connect($user.access_token);
			addLog('✅ Socket conectado exitosamente', 'success');
			connectionStatus = 'Conectado';
		} catch (error) {
			addLog(`❌ Error al conectar: ${error.message}`, 'error');
			connectionStatus = 'Error';
		} finally {
			isConnecting = false;
		}
	}

	// Desconectar del socket
	function disconnect() {
		addLog('🔌 Desconectando...', 'info');
		socketService.disconnect();
		connectionStatus = 'Desconectado';
		sessionId = null;
		explanationStore.setDisconnected();
		addLog('✅ Desconectado correctamente', 'success');
	}

	// Probar envío de pregunta
	function testAskQuestion() {
		if (!socketService.isSocketConnected()) {
			addLog('❌ No conectado. Conecta primero.', 'error');
			return;
		}

		addLog('📤 Enviando pregunta de prueba...', 'info');
		socketService.emitAskQuestion('¿Qué es la energía cinética?', {
			subject: 'fisica',
			difficulty: 'medium'
		});
		addLog('✅ Pregunta enviada', 'success');
	}

	// Limpiar logs
	function clearLogs() {
		logs = [];
	}

	// Limpiar al desmontar
	onDestroy(() => {
		if (socketService.isSocketConnected()) {
			socketService.disconnect();
		}
	});
</script>

<div class="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white p-8">
	<div class="max-w-4xl mx-auto">
		<!-- Header -->
		<div class="mb-8">
			<h1 class="text-4xl font-bold mb-2">🧪 Socket.IO Testing</h1>
			<p class="text-gray-400">Prueba la conexión Socket.IO con el backend Flask</p>
		</div>

		<!-- Estado de Conexión -->
		<div class="bg-gray-800 rounded-lg p-6 mb-6 border-2" class:border-green-500={connectionStatus === 'Conectado'} class:border-red-500={connectionStatus === 'Desconectado'} class:border-yellow-500={connectionStatus === 'Error'}>
			<div class="flex items-center justify-between mb-4">
				<div>
					<h2 class="text-2xl font-bold mb-1">Estado de Conexión</h2>
					<p class="text-gray-400">
						{#if connectionStatus === 'Conectado'}
							✅ Conectado al servidor
						{:else if connectionStatus === 'Error'}
							⚠️ Error de conexión
						{:else}
							❌ Desconectado
						{/if}
					</p>
				</div>
				<div class="text-right">
					<div class="text-sm text-gray-400">Session ID:</div>
					<div class="font-mono text-sm">
						{sessionId || 'N/A'}
					</div>
				</div>
			</div>

			<!-- Controles -->
			<div class="flex gap-4">
				<button
					onclick={connect}
					disabled={isConnecting || connectionStatus === 'Conectado'}
					class="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors"
				>
					{#if isConnecting}
						🔄 Conectando...
					{:else}
						🔌 Conectar
					{/if}
				</button>

				<button
					onclick={disconnect}
					disabled={connectionStatus !== 'Conectado'}
					class="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors"
				>
					🔌 Desconectar
				</button>

				<button
					onclick={testAskQuestion}
					disabled={connectionStatus !== 'Conectado'}
					class="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors"
				>
					📤 Probar Pregunta
				</button>
			</div>
		</div>

		<!-- Store State -->
		<div class="bg-gray-800 rounded-lg p-6 mb-6">
			<h2 class="text-2xl font-bold mb-4">📦 Estado del Store</h2>
			<div class="grid grid-cols-2 gap-4">
				<div>
					<div class="text-sm text-gray-400">isConnected</div>
					<div class="font-mono">{$explanationStore.isConnected ? '✅ true' : '❌ false'}</div>
				</div>
				<div>
					<div class="text-sm text-gray-400">sessionId</div>
					<div class="font-mono text-sm">{$explanationStore.sessionId || 'null'}</div>
				</div>
				<div>
					<div class="text-sm text-gray-400">isExplaining</div>
					<div class="font-mono">{$explanationStore.isExplaining ? '✅ true' : '❌ false'}</div>
				</div>
				<div>
					<div class="text-sm text-gray-400">isLoading</div>
					<div class="font-mono">{$explanationStore.isLoading ? '✅ true' : '❌ false'}</div>
				</div>
				<div>
					<div class="text-sm text-gray-400">currentStep</div>
					<div class="font-mono">{$explanationStore.currentStep}</div>
				</div>
				<div>
					<div class="text-sm text-gray-400">totalSteps</div>
					<div class="font-mono">{$explanationStore.totalSteps}</div>
				</div>
			</div>
		</div>

		<!-- Logs -->
		<div class="bg-gray-800 rounded-lg p-6">
			<div class="flex items-center justify-between mb-4">
				<h2 class="text-2xl font-bold">📋 Logs de Consola</h2>
				<button
					onclick={clearLogs}
					class="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
				>
					🗑️ Limpiar
				</button>
			</div>

			<div class="bg-gray-900 rounded-lg p-4 h-96 overflow-y-auto font-mono text-sm">
				{#if logs.length === 0}
					<div class="text-gray-500 text-center py-8">
						No hay logs aún. Conecta para ver los eventos.
					</div>
				{:else}
					{#each logs as log}
						<div class="mb-2" class:text-green-400={log.type === 'success'} class:text-red-400={log.type === 'error'} class:text-gray-300={log.type === 'info'}>
							<span class="text-gray-500">[{log.timestamp}]</span>
							{log.message}
						</div>
					{/each}
				{/if}
			</div>
		</div>

		<!-- Instrucciones -->
		<div class="mt-6 bg-blue-900/30 border border-blue-500 rounded-lg p-6">
			<h3 class="text-xl font-bold mb-3">📝 Instrucciones de Testing</h3>
			<ol class="list-decimal list-inside space-y-2 text-gray-300">
				<li>Asegúrate de estar autenticado (tener un token válido)</li>
				<li>Asegúrate de que el backend Flask esté corriendo en <code class="bg-gray-800 px-2 py-1 rounded">http://localhost:5000</code></li>
				<li>Click en "Conectar" para establecer la conexión</li>
				<li>Verifica que aparezca "✅ Conectado al backend" en los logs</li>
				<li>Verifica que se muestre el Session ID</li>
				<li>Prueba enviar una pregunta con "Probar Pregunta"</li>
				<li>Click en "Desconectar" para cerrar la conexión</li>
				<li>Verifica que se desconecte correctamente</li>
			</ol>
		</div>

		<!-- Checklist -->
		<div class="mt-6 bg-gray-800 rounded-lg p-6">
			<h3 class="text-xl font-bold mb-3">✅ Checklist de Testing</h3>
			<div class="space-y-2">
				<label class="flex items-center gap-3 cursor-pointer">
					<input type="checkbox" class="w-5 h-5" disabled checked={connectionStatus === 'Conectado'} />
					<span>Conectar socket al montar componente</span>
				</label>
				<label class="flex items-center gap-3 cursor-pointer">
					<input type="checkbox" class="w-5 h-5" disabled checked={logs.some(l => l.message.includes('✅ Conectado'))} />
					<span>Ver en consola: "✅ Conectado al backend"</span>
				</label>
				<label class="flex items-center gap-3 cursor-pointer">
					<input type="checkbox" class="w-5 h-5" disabled checked={sessionId !== null} />
					<span>Recibir session_id en evento connection_established</span>
				</label>
				<label class="flex items-center gap-3 cursor-pointer">
					<input type="checkbox" class="w-5 h-5" disabled checked={logs.some(l => l.message.includes('Desconectado correctamente'))} />
					<span>Verificar que desconecta correctamente</span>
				</label>
			</div>
		</div>

		<!-- Volver -->
		<div class="mt-8 text-center">
			<a href="/" class="text-blue-400 hover:text-blue-300 underline">
				← Volver al inicio
			</a>
		</div>
	</div>
</div>

<style>
	/* Scrollbar personalizado */
	::-webkit-scrollbar {
		width: 8px;
	}

	::-webkit-scrollbar-track {
		background: #1f2937;
		border-radius: 4px;
	}

	::-webkit-scrollbar-thumb {
		background: #4b5563;
		border-radius: 4px;
	}

	::-webkit-scrollbar-thumb:hover {
		background: #6b7280;
	}
</style>
