<script>
	import { explanationStore } from '$lib/stores';
	import { socketService } from '$lib/api/socket';
	import { speechService } from '$lib/services/speechService';

	let { onStop = null, onToggleVoice = null, voiceEnabled = false } = $props();
	let showChatInput = $state(false);
	let chatMessage = $state('');

	function handlePause() {
		if ($explanationStore.isPaused) {
			socketService.emitResumeExplanation();
			explanationStore.resumeExplanation();
			if (voiceEnabled) {
				speechService.resume();
			}
		} else {
			socketService.emitPauseExplanation($explanationStore.currentStep, 0);
			explanationStore.pauseExplanation();
			if (voiceEnabled) {
				speechService.pause();
			}
		}
	}

	function handleSendMessage() {
		if (chatMessage.trim()) {
			// Aquí enviarías el mensaje al backend
			console.log('Mensaje:', chatMessage);
			chatMessage = '';
			showChatInput = false;
		}
	}
</script>

<div class="floating-controls-container">
	<!-- Barra de controles flotante -->
	<div class="floating-bar">
		<!-- Botón Pausar/Reanudar -->
		<button
			class="control-icon"
			onclick={handlePause}
			disabled={!$explanationStore.isExplaining && !$explanationStore.isPaused}
			aria-label={$explanationStore.isPaused ? 'Reanudar' : 'Pausar'}
		>
			{#if $explanationStore.isPaused}
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<polygon points="5 3 19 12 5 21 5 3"></polygon>
				</svg>
			{:else}
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<rect x="6" y="4" width="4" height="16"></rect>
					<rect x="14" y="4" width="4" height="16"></rect>
				</svg>
			{/if}
		</button>

		<!-- Botón Pregunta/Chat -->
		<button
			class="control-icon"
			onclick={() => showChatInput = !showChatInput}
			aria-label="Hacer pregunta"
		>
			<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
			</svg>
		</button>

		<!-- Botón Ajustes -->
		<button
			class="control-icon"
			aria-label="Ajustes"
		>
			<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<circle cx="12" cy="12" r="3"></circle>
				<path d="M12 1v6m0 6v6m-9-9h6m6 0h6"></path>
			</svg>
		</button>

		<!-- Botón Voz -->
		<button
			class="control-icon"
			class:voice-active={voiceEnabled}
			onclick={onToggleVoice}
			aria-label={voiceEnabled ? 'Desactivar voz' : 'Activar voz'}
		>
			{#if voiceEnabled}
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
					<path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
					<path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
				</svg>
			{:else}
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
					<line x1="23" y1="9" x2="17" y2="15"></line>
					<line x1="17" y1="9" x2="23" y2="15"></line>
				</svg>
			{/if}
		</button>
	</div>

	<!-- Input de chat flotante -->
	{#if showChatInput}
		<div class="chat-input-container">
			<input
				type="text"
				bind:value={chatMessage}
				placeholder="Escribe tu pregunta..."
				class="chat-input"
				onkeydown={(e) => e.key === 'Enter' && handleSendMessage()}
			/>
			<button class="send-btn" onclick={handleSendMessage} aria-label="Enviar mensaje">
				<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<line x1="22" y1="2" x2="11" y2="13"></line>
					<polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
				</svg>
			</button>
		</div>
	{/if}
</div>

<style>
	.floating-controls-container {
		position: fixed;
		bottom: 24px;
		left: 50%;
		transform: translateX(-50%);
		z-index: 40;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12px;
	}

	.floating-bar {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 12px 20px;
		background: rgba(10, 14, 39, 0.85);
		border: 1px solid rgba(99, 102, 241, 0.4);
		border-radius: 50px;
		backdrop-filter: blur(16px);
		box-shadow: 
			0 8px 32px rgba(0, 0, 0, 0.6),
			0 0 40px rgba(99, 102, 241, 0.3),
			inset 0 1px 0 rgba(99, 102, 241, 0.2);
		animation: slideUp 0.4s ease-out;
	}

	.control-icon {
		width: 44px;
		height: 44px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(99, 102, 241, 0.15);
		border: 1px solid rgba(99, 102, 241, 0.3);
		color: #818cf8;
		cursor: pointer;
		transition: all 0.3s ease;
		position: relative;
	}

	.control-icon::before {
		content: '';
		position: absolute;
		inset: -2px;
		border-radius: 50%;
		background: linear-gradient(45deg, rgba(99, 102, 241, 0.4), rgba(129, 140, 248, 0.4));
		opacity: 0;
		transition: opacity 0.3s ease;
		z-index: -1;
		filter: blur(8px);
	}

	.control-icon:hover:not(:disabled) {
		background: rgba(99, 102, 241, 0.25);
		border-color: rgba(99, 102, 241, 0.5);
		transform: scale(1.05);
		box-shadow: 0 0 20px rgba(99, 102, 241, 0.4);
	}

	.control-icon:hover:not(:disabled)::before {
		opacity: 1;
	}

	.control-icon:active:not(:disabled) {
		transform: scale(0.95);
	}

	.control-icon:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.control-icon.voice-active {
		background: rgba(34, 197, 94, 0.2);
		border-color: rgba(34, 197, 94, 0.5);
		color: rgb(34, 197, 94);
		box-shadow: 0 0 20px rgba(34, 197, 94, 0.3);
	}

	.control-icon.voice-active::before {
		background: linear-gradient(45deg, rgba(34, 197, 94, 0.4), rgba(74, 222, 128, 0.4));
		opacity: 1;
	}

	.chat-input-container {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 8px 12px;
		background: rgba(10, 14, 39, 0.9);
		border: 1px solid rgba(99, 102, 241, 0.4);
		border-radius: 50px;
		backdrop-filter: blur(16px);
		box-shadow: 
			0 8px 32px rgba(0, 0, 0, 0.6),
			0 0 30px rgba(99, 102, 241, 0.25);
		animation: slideUp 0.3s ease-out;
		min-width: 320px;
	}

	.chat-input {
		flex: 1;
		background: transparent;
		border: none;
		outline: none;
		color: #e2e8f0;
		font-size: 0.875rem;
		padding: 8px 12px;
	}

	.chat-input::placeholder {
		color: rgba(203, 213, 225, 0.4);
	}

	.send-btn {
		width: 36px;
		height: 36px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(99, 102, 241, 0.3);
		border: 1px solid rgba(99, 102, 241, 0.5);
		color: #818cf8;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.send-btn:hover {
		background: rgba(99, 102, 241, 0.5);
		box-shadow: 0 0 16px rgba(99, 102, 241, 0.5);
		transform: scale(1.05);
	}

	.send-btn:active {
		transform: scale(0.95);
	}

	@keyframes slideUp {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* Responsive */
	@media (max-width: 640px) {
		.floating-controls-container {
			bottom: 16px;
		}

		.floating-bar {
			padding: 10px 16px;
			gap: 6px;
		}

		.control-icon {
			width: 40px;
			height: 40px;
		}

		.chat-input-container {
			min-width: 280px;
		}
	}
</style>
