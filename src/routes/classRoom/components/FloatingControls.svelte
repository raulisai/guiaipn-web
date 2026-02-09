<script>
	import { onDestroy } from 'svelte';
	import { get } from 'svelte/store';
	import { explanationStore } from '$lib/stores';
	import { socketService } from '$lib/api/socket';
	import { speechService } from '$lib/services/speechService';
	import { syncService } from '$lib/services/syncService';
	import { clarificationService } from '$lib/services';

	const props = $props();

	let onStop = $state(null);
	let onToggleVoice = $state(null);
	let onPauseToggle = $state(null);
	let onInterrupt = $state(null);
	let voiceEnabled = $state(false);
	let isExplaining = $state(false);

	$effect(() => {
		onStop = props.onStop ?? null;
		onToggleVoice = props.onToggleVoice ?? null;
		onPauseToggle = props.onPauseToggle ?? null;
		onInterrupt = props.onInterrupt ?? null;
		voiceEnabled = props.voiceEnabled ?? false;
		isExplaining = props.isExplaining ?? false;
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
				stepProgress?.charIndex ?? renderState?.currentCharIndex ?? pauseContext?.charIndex ?? 0,
			totalChars:
				stepProgress?.totalChars ?? displayStep?.content?.length ?? pauseContext?.totalChars ?? 0
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
		handlePause({ ensurePaused: true, preserveInputs: true });
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
		handlePause({ ensurePaused: true, preserveInputs: true });
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
		const SpeechRecognitionCtor =
			globalWindow.SpeechRecognition ?? globalWindow.webkitSpeechRecognition;
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

	function handlePause(options = {}) {
		const { preserveInputs = false, ensurePaused = false } = options;
		const wasPaused = $explanationStore.isPaused;

		if (ensurePaused && wasPaused) {
			return;
		}

		if (ensurePaused && !wasPaused) {
			if (typeof onPauseToggle === 'function') {
				onPauseToggle();
				return;
			}

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
			return;
		}

		if (wasPaused && !preserveInputs) {
			if (showChatInput) {
				showChatInput = false;
			}
			if (showVoiceInput) {
				showVoiceInput = false;
				voiceTranscript = '';
				clearAutoSendTimer();
				stopVoiceCapture();
			}
		}

		if (typeof onPauseToggle === 'function') {
			onPauseToggle();
			return;
		}

		if (wasPaused) {
			const pauseContext = $explanationStore.pauseContext ?? buildPauseSnapshot();
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
		const voiceText = showVoiceInput ? bubbleMessage.trim() : '';
		const message = showVoiceInput ? voiceText : chatText;
		if (!message) {
			return;
		}

		const storeSnapshot = get(explanationStore);
		const hasExplanation = storeSnapshot.buffer?.steps?.length > 0;
		const isInterruption = hasExplanation && storeSnapshot.isPaused;

		console.log('🎯 Decisión:', {
			hasExplanation,
			isPaused: storeSnapshot.isPaused,
			isInterruption
		});

		if (socketService.isSocketConnected()) {
			if (isInterruption) {
				const originalQuestionRaw =
					explanationStore.getOriginalQuestion?.() ??
					storeSnapshot.currentQuestion?.pregunta ??
					storeSnapshot.currentQuestion?.original_question ??
					(typeof storeSnapshot.currentQuestion === 'string'
						? storeSnapshot.currentQuestion
						: null);

				const originalQuestion =
					typeof originalQuestionRaw === 'string' && originalQuestionRaw.trim().length > 0
						? originalQuestionRaw.trim()
						: null;

				const currentStep =
					typeof storeSnapshot.currentStep === 'number' && storeSnapshot.currentStep > 0
						? storeSnapshot.currentStep
						: undefined;

				const topicRaw =
					storeSnapshot.currentQuestion?.materia ??
					storeSnapshot.currentQuestion?.topic ??
					storeSnapshot.currentQuestion?.subject ??
					null;

				const topic =
					typeof topicRaw === 'string' && topicRaw.trim().length > 0
						? topicRaw.trim()
						: 'Explicación actual';

				const currentContext = {};
				if (originalQuestion) {
					currentContext.original_question = originalQuestion;
				}
				if (typeof currentStep === 'number') {
					currentContext.current_step = currentStep;
				}
				if (topic) {
					currentContext.topic = topic;
				}

				const sessionId = storeSnapshot.explanationSessionId ?? socketService.getSessionId?.();

				console.log('✋ INTERRUPCIÓN DETECTADA', {
					question: message,
					context: currentContext,
					sessionId
				});

				clarificationService.prepareInterruption(message, currentContext);
				socketService.emitInterruptExplanation(message, currentContext, 'brief', sessionId);
			} else {
				// PREGUNTA NORMAL: Nueva explicación completa con buffer
				console.log('❓ PREGUNTA NORMAL - Enviando a ask_question');
				console.log('📝 Pregunta:', message);
				socketService.emitAskQuestion(message, {
					source: showVoiceInput ? 'voice' : 'chat',
					stepNumber: storeSnapshot.currentStep
				});
				clarificationService.reset?.();
			}
		}

		chatMessage = '';
		voiceTranscript = '';
		bubbleMessage = '';
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

	function handleInterrupt() {
		// Pausar la explicación
		handlePause({ ensurePaused: true, preserveInputs: false });

		// Abrir input de chat para hacer la pregunta de interrupción
		showChatInput = true;
		showVoiceInput = false;
		stopVoiceCapture();
		clearAutoSendTimer();
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
				<svg
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<polygon points="5 3 19 12 5 21 5 3"></polygon>
				</svg>
			{:else}
				<svg
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<rect x="6" y="4" width="4" height="16"></rect>
					<rect x="14" y="4" width="4" height="16"></rect>
				</svg>
			{/if}
		</button>

		<button class="control-icon" onclick={toggleChatInput} aria-label="Hacer pregunta">
			<svg
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
			</svg>
		</button>

		<button
			class="control-icon"
			class:recording={isRecording}
			onclick={toggleVoiceInput}
			aria-label={showVoiceInput ? 'Cerrar captura de voz' : 'Hacer pregunta por voz'}
		>
			<svg
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				class={isRecording ? 'mic-recording' : ''}
			>
				<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
				<path d="M19 10v2a7 7 0 0 1-14 0v-2" />
				<line x1="12" y1="19" x2="12" y2="22" />
			</svg>
		</button>

		<button
			class="control-icon interrupt-btn"
			onclick={handleInterrupt}
			disabled={!isExplaining}
			aria-label="No entiendo esto"
			title="Interrumpir para hacer una pregunta rápida"
		>
			<svg
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<circle cx="12" cy="12" r="10" />
				<path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
				<path d="M12 17h.01" />
			</svg>
		</button>

		<button
			class="control-icon"
			class:voice-active={voiceEnabled}
			onclick={onToggleVoice}
			aria-label={voiceEnabled ? 'Desactivar voz' : 'Activar voz'}
		>
			{#if voiceEnabled}
				<svg
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
					<path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
					<path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
				</svg>
			{:else}
				<svg
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
					<line x1="23" y1="9" x2="17" y2="15" />
					<line x1="17" y1="9" x2="23" y2="15" />
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
				<svg
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path d="m22 2-7 20-4-9-9-4Z" />
					<path d="M22 2 11 13" />
				</svg>
			</button>
		</div>
	{/if}
</div>

<style>
	.floating-controls-container {
		position: fixed;
		bottom: 16px;
		left: 50%;
		transform: translateX(-50%);
		z-index: 40;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12px;
		width: 100%;
		pointer-events: none;
	}

	.floating-bar {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 8px 12px;
		background: rgba(10, 14, 39, 0.9);
		border: 1px solid rgba(99, 102, 241, 0.4);
		border-radius: 50px;
		backdrop-filter: blur(16px);
		box-shadow:
			0 4px 20px rgba(0, 0, 0, 0.5),
			0 0 25px rgba(99, 102, 241, 0.25),
			inset 0 1px 0 rgba(99, 102, 241, 0.2);
		animation: slideUp 0.4s ease-out;
		pointer-events: auto;
	}

	.control-icon {
		width: 42px;
		height: 42px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(99, 102, 241, 0.1);
		border: 1px solid rgba(99, 102, 241, 0.3);
		color: #818cf8;
		cursor: pointer;
		transition: all 0.2s ease;
		position: relative;
		padding: 0;
	}

	.control-icon svg {
		width: 20px;
		height: 20px;
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
		color: #ffffff;
	}

	.control-icon:active:not(:disabled) {
		transform: scale(0.95);
	}

	.control-icon:disabled {
		opacity: 0.4;
		cursor: not-allowed;
		background: rgba(15, 23, 42, 0.4);
		border-color: rgba(99, 102, 241, 0.1);
	}

	.control-icon.voice-active {
		background: rgba(34, 197, 94, 0.15);
		border-color: rgba(34, 197, 94, 0.4);
		color: #4ade80;
		box-shadow: 0 0 15px rgba(34, 197, 94, 0.2);
	}

	.control-icon.recording {
		background: rgba(239, 68, 68, 0.15);
		border-color: rgba(239, 68, 68, 0.4);
		color: #f87171;
		box-shadow: 0 0 15px rgba(239, 68, 68, 0.25);
		animation: pulse 1.5s ease-in-out infinite;
	}

	.control-icon.interrupt-btn:not(:disabled) {
		background: rgba(251, 191, 36, 0.1);
		border-color: rgba(251, 191, 36, 0.3);
		color: #fbbf24;
	}

	.control-icon.interrupt-btn:hover:not(:disabled) {
		background: rgba(251, 191, 36, 0.2);
		border-color: rgba(251, 191, 36, 0.5);
		box-shadow: 0 0 20px rgba(251, 191, 36, 0.3);
		color: #fcd34d;
	}

	.question-bubble {
		position: absolute;
		bottom: 74px;
		left: 50%;
		transform: translateX(-50%);
		background: rgba(15, 23, 42, 0.95);
		border: 1px solid rgba(99, 102, 241, 0.35);
		border-radius: 20px;
		padding: 12px 18px;
		max-width: 90vw;
		width: max-content;
		color: #e2e8f0;
		display: flex;
		gap: 12px;
		align-items: center;
		box-shadow:
			0 10px 40px rgba(0, 0, 0, 0.6),
			0 0 30px rgba(99, 102, 241, 0.2);
		backdrop-filter: blur(20px);
		pointer-events: auto;
	}

	.bubble-text {
		font-size: 0.95rem;
		line-height: 1.4;
		white-space: pre-line;
	}

	.bubble-countdown {
		min-width: 26px;
		height: 26px;
		border-radius: 999px;
		background: rgba(99, 102, 241, 0.2);
		border: 1px solid rgba(129, 140, 248, 0.55);
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 700;
		color: #c7d2fe;
		font-size: 0.8rem;
	}

	.chat-input-container {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 6px 8px 6px 16px;
		background: rgba(10, 14, 39, 0.95);
		border: 1px solid rgba(99, 102, 241, 0.4);
		border-radius: 50px;
		backdrop-filter: blur(20px);
		box-shadow:
			0 10px 40px rgba(0, 0, 0, 0.6),
			0 0 30px rgba(99, 102, 241, 0.25);
		animation: slideUp 0.3s ease-out;
		min-width: 300px;
		max-width: 90vw;
		pointer-events: auto;
	}

	.chat-input {
		flex: 1;
		background: transparent;
		border: none;
		outline: none;
		color: #e2e8f0;
		font-size: 0.95rem;
		padding: 6px 0;
	}

	.chat-input::placeholder {
		color: rgba(148, 163, 184, 0.6);
	}

	.send-btn {
		width: 36px;
		height: 36px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(99, 102, 241, 0.2);
		border: 1px solid rgba(99, 102, 241, 0.4);
		color: #818cf8;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.send-btn:hover {
		background: rgba(99, 102, 241, 0.8);
		color: white;
		box-shadow: 0 0 16px rgba(99, 102, 241, 0.6);
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

	@keyframes pulse {
		0%,
		100% {
			box-shadow: 0 0 18px rgba(239, 68, 68, 0.35);
			border-color: rgba(239, 68, 68, 0.6);
		}
		50% {
			box-shadow: 0 0 28px rgba(239, 68, 68, 0.7);
			border-color: rgba(239, 68, 68, 0.9);
		}
	}

	@media (max-width: 640px) {
		.floating-controls-container {
			bottom: 12px;
			width: 100%;
			padding: 0 12px;
		}

		.floating-bar {
			padding: 6px 12px;
			gap: 8px;
			width: auto;
			max-width: 100%;
			justify-content: space-evenly;
			border-radius: 20px;
		}

		.control-icon {
			width: 44px;
			height: 44px;
			background: rgba(99, 102, 241, 0.08);
		}

		.control-icon svg {
			width: 22px;
			height: 22px;
		}

		.chat-input-container {
			width: 100%;
			min-width: auto;
		}
	}
</style>
