<script>
	import { onDestroy } from 'svelte';
	import { get } from 'svelte/store';
	import { explanationStore } from '$lib/stores';
	import { socketService } from '$lib/api/socket';
	import { speechService } from '$lib/services/speechService';
	import { syncService } from '$lib/services/syncService';

	const props = $props();

let onStop = $state(null);
let onToggleVoice = $state(null);
let onPauseToggle = $state(null);
let voiceEnabled = $state(false);

$effect(() => {
	onStop = props.onStop ?? null;
	onToggleVoice = props.onToggleVoice ?? null;
	onPauseToggle = props.onPauseToggle ?? null;
	voiceEnabled = props.voiceEnabled ?? false;
});
	let showChatInput = $state(false);
	let showVoiceInput = $state(false);
	let chatMessage = $state('');
	let voiceTranscript = $state('');
	let bubbleMessage = $state('');
	let autoSendCountdown = $state(null);
	let autoSendTimerId = null;
	let autoSendIntervalId = null;
	let isRecording = $state(false);
	/** @type {any} */
	let recognition = null;

	function buildPauseSnapshot() {
		const stepProgress = $explanationStore.stepProgress;
		const pauseContext = $explanationStore.pauseContext;
		const renderState = $explanationStore.render;
		const bufferSteps = $explanationStore.buffer?.steps ?? [];
		const renderedSteps = $explanationStore.steps ?? [];
		const stepIndex = renderState?.currentStepIndex ?? 0;
		const displayStep = bufferSteps[stepIndex] || renderedSteps[stepIndex] || null;
		const rawStep =
			stepProgress?.stepNumber ||
			displayStep?.step ||
			$explanationStore.currentStep ||
			pauseContext?.stepNumber ||
			0;
		const safeStep = typeof rawStep === 'number' && rawStep > 0 ? rawStep : null;
		if (!safeStep) {
			return null;
		}
		return {
			timestamp: Date.now(),
			stepNumber: safeStep,
			charIndex:
				stepProgress?.charIndex ??
				renderState?.currentCharIndex ??
				pauseContext?.charIndex ??
				0,
			totalChars:
				stepProgress?.totalChars ??
				displayStep?.content?.length ??
				pauseContext?.totalChars ??
				0
		};
	}

	function clearAutoSendTimer() {
		if (autoSendTimerId) {
			clearTimeout(autoSendTimerId);
			autoSendTimerId = null;
		}
		if (autoSendIntervalId) {
			clearInterval(autoSendIntervalId);
			autoSendIntervalId = null;
		}
		autoSendCountdown = null;
	}

	function scheduleAutoSend() {
		if (!showVoiceInput) {
			return;
		}

		const message = bubbleMessage;
		if (message.length === 0) {
			clearAutoSendTimer();
			return;
		}

		clearAutoSendTimer();
		autoSendCountdown = 3;
		autoSendIntervalId = setInterval(() => {
			autoSendCountdown = Math.max(0, (autoSendCountdown ?? 0) - 1);
		}, 1000);
		autoSendTimerId = setTimeout(() => {
			handleSendMessage(true);
		}, 3000);
	}

	function toggleChatInput() {
		handlePause();
		const next = !showChatInput;
		showChatInput = next;
		if (next) {
			showVoiceInput = false;
			stopVoiceCapture();
			clearAutoSendTimer();
		} else {
			clearAutoSendTimer();
		}
	}

	function toggleVoiceInput() {
		handlePause();
		const next = !showVoiceInput;
		showVoiceInput = next;
		if (next) {
			showChatInput = false;
			startVoiceCapture();
			voiceTranscript = '';
		} else {
			voiceTranscript = '';
			clearAutoSendTimer();
			stopVoiceCapture();
		}
	}

	function startVoiceCapture() {
		if (typeof window === 'undefined') {
			return;
		}

		stopVoiceCapture();

		const globalWindow = /** @type {any} */ (window);
		const SpeechRecognitionCtor = globalWindow.SpeechRecognition ?? globalWindow.webkitSpeechRecognition;
		if (!SpeechRecognitionCtor) {
			voiceTranscript = '';
			isRecording = false;
			return;
		}

		recognition = new SpeechRecognitionCtor();
		recognition.lang = 'es-MX';
		recognition.interimResults = true;
		recognition.continuous = true;

		recognition.onstart = () => {
			isRecording = true;
			voiceTranscript = '';
		};

		recognition.onresult = (event) => {
			let transcript = '';
			for (let i = event.resultIndex; i < event.results.length; i++) {
				transcript += event.results[i][0].transcript;
			}
			voiceTranscript = transcript.trim();
		};

		recognition.onerror = (event) => {
			stopVoiceCapture();
		};

		recognition.onend = () => {
			isRecording = false;
		};

		try {
			recognition.start();
		} catch (error) {
			console.error('❌ Error al iniciar reconocimiento:', error);
		}
	}

	function stopVoiceCapture() {
		if (recognition) {
			recognition.onstart = null;
			recognition.onresult = null;
			recognition.onerror = null;
			recognition.onend = null;
			try {
				recognition.stop();
			} catch (error) {
				console.warn('⚠️ Error al detener reconocimiento:', error);
			}
			recognition = null;
		}

		isRecording = false;
	}

	function handlePause() {
		if (typeof onPauseToggle === 'function') {
			onPauseToggle();
			return;
		}

		if ($explanationStore.isPaused) {
			const pauseContext = $explanationStore.pauseContext ?? buildPauseSnapshot();
			const resumeStep = Math.max(1, pauseContext?.stepNumber ?? $explanationStore.currentStep ?? 1);
			const resumeOffset = pauseContext?.charIndex ?? $explanationStore.stepProgress.charIndex ?? 0;
			explanationStore.resumeExplanation();
			explanationStore.clearPauseContext();
			if (voiceEnabled) {
				speechService.resume();
			}
		} else {
			const snapshot = buildPauseSnapshot();
			if (!snapshot) {
				explanationStore.pauseExplanation();
				return;
			}
			explanationStore.pauseExplanation();
			explanationStore.savePauseContext(snapshot);
			if (voiceEnabled) {
				speechService.pause();
			}
		}
	}

	function handleSendMessage(autoTriggered = false) {
		const chatText = chatMessage.trim();
		const message = showVoiceInput ? bubbleMessage : chatText;
		if (!message) {
			return;
		}

		if (showVoiceInput) {
			if (socketService.isSocketConnected()) {
				socketService.emitAskQuestion(message, {
					source: 'voice',
					stepNumber: $explanationStore.currentStep
				});
			}
		} else {
			if (socketService.isSocketConnected()) {
				socketService.emitAskQuestion(message, {
					source: 'chat',
					stepNumber: $explanationStore.currentStep
				});
			}
		}
		chatMessage = '';
		voiceTranscript = '';
		showChatInput = false;
		showVoiceInput = false;
		clearAutoSendTimer();
		stopVoiceCapture();
	}

	$effect(() => {
		const trimmedVoice = showVoiceInput ? voiceTranscript.trim() : '';
		bubbleMessage = trimmedVoice;
		if (trimmedVoice.length > 0) {
			scheduleAutoSend();
		} else {
			clearAutoSendTimer();
		}
	});

	onDestroy(() => {
		clearAutoSendTimer();
		stopVoiceCapture();
	});

	function handleBubbleFocus() {
		if (isRecording) {
			stopVoiceCapture();
		}
		clearAutoSendTimer();
	}

	function handleBubbleInput(event) {
		const target = event.target;
		voiceTranscript = (target.innerText || '').trim();
	}

</script>

<div class="floating-controls-container">
	{#if showVoiceInput}
		<div class="question-bubble">
			<div
				class="bubble-text"
				contenteditable={!isRecording}
				onfocus={handleBubbleFocus}
				oninput={handleBubbleInput}
				role="textbox"
				aria-label="Pregunta por voz"
			>
				{bubbleMessage || (isRecording ? 'Escuchando…' : '')}
			</div>
			{#if autoSendCountdown !== null && bubbleMessage.length > 0}
				<div class="bubble-countdown">{autoSendCountdown || 0}</div>
			{/if}
		</div>
	{/if}

	<div class="floating-bar">
		<button
			class="control-icon"
			onclick={handlePause}
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

		<button
			class="control-icon"
			onclick={toggleChatInput}
			aria-label="Hacer pregunta"
		>
			<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
			</svg>
		</button>

		<button
			class="control-icon"
			class:recording={isRecording}
			onclick={toggleVoiceInput}
			aria-label={showVoiceInput ? 'Cerrar captura de voz' : 'Hacer pregunta por voz'}
		>
			{#if isRecording}
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<rect x="9" y="3" width="6" height="12" rx="3"></rect>
					<path d="M12 19v2m0-4a4 4 0 0 0 4-4"></path>
				</svg>
			{:else}
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M12 1a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
					<path d="M19 10a7 7 0 0 1-14 0"></path>
					<path d="M12 19v4"></path>
					<path d="M8 23h8"></path>
				</svg>
			{/if}
		</button>

		<button class="control-icon" aria-label="Ajustes">
			<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<circle cx="12" cy="12" r="3"></circle>
				<path d="M12 1v6m0 6v6m-9-9h6m6 0h6"></path>
			</svg>
		</button>

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

	{#if showChatInput}
		<div class="chat-input-container">
			<input
				type="text"
				bind:value={chatMessage}
				placeholder="Escribe tu pregunta..."
				class="chat-input"
				onkeydown={(e) => e.key === 'Enter' && handleSendMessage()}
			/>
			<button class="send-btn" onclick={() => handleSendMessage()} aria-label="Enviar mensaje">
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

	.control-icon.recording {
		background: rgba(239, 68, 68, 0.2);
		border-color: rgba(239, 68, 68, 0.4);
		color: #f87171;
		box-shadow: 0 0 18px rgba(239, 68, 68, 0.35);
	}

	.question-bubble {
		position: absolute;
		bottom: 88px;
		left: 50%;
		transform: translateX(-50%);
		background: rgba(15, 23, 42, 0.92);
		border: 1px solid rgba(99, 102, 241, 0.35);
		border-radius: 16px;
		padding: 12px 16px;
		max-width: 420px;
		width: max-content;
		color: #e2e8f0;
		display: flex;
		gap: 12px;
		align-items: center;
		box-shadow:
			0 8px 30px rgba(15, 23, 42, 0.4),
			0 0 24px rgba(99, 102, 241, 0.25);
		backdrop-filter: blur(18px);
	}

	.bubble-text {
		font-size: 0.9rem;
		line-height: 1.3;
		white-space: pre-line;
	}

	.bubble-countdown {
		min-width: 28px;
		height: 28px;
		border-radius: 999px;
		background: rgba(99, 102, 241, 0.2);
		border: 1px solid rgba(129, 140, 248, 0.55);
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 600;
		color: #c7d2fe;
		font-size: 0.85rem;
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
