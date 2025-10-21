<script>
	import { explanationStore } from '$lib/stores';
	import { socketService } from '$lib/api/socket';

	let showFeedbackModal = $state(false);
	let showQuestionInput = $state(false);
	let feedbackType = $state(null); // 'helpful' | 'not-helpful'
	let feedbackReason = $state('');
	let followUpQuestion = $state('');
	let isSubmitting = $state(false);

	function handleThumbsUp() {
		feedbackType = 'helpful';
		showFeedbackModal = true;
	}

	function handleThumbsDown() {
		feedbackType = 'not-helpful';
		showFeedbackModal = true;
	}

	function handleAskQuestion() {
		showQuestionInput = !showQuestionInput;
	}

	async function submitFeedback() {
		if (!feedbackType) return;

		isSubmitting = true;
		
		// Aquí se enviaría el feedback al backend
		console.log('Feedback enviado:', {
			type: feedbackType,
			reason: feedbackReason,
			questionHash: $explanationStore.questionHash
		});

		// Simular delay
		await new Promise(resolve => setTimeout(resolve, 500));
		
		isSubmitting = false;
		showFeedbackModal = false;
		feedbackReason = '';
		feedbackType = null;
	}

	async function submitFollowUpQuestion() {
		if (!followUpQuestion.trim()) return;

		isSubmitting = true;

		// Emitir pregunta de seguimiento
		socketService.emitAskFollowUp(followUpQuestion, {
			previous_question: $explanationStore.currentQuestion
		});

		followUpQuestion = '';
		showQuestionInput = false;
		isSubmitting = false;
	}

	function closeFeedbackModal() {
		showFeedbackModal = false;
		feedbackReason = '';
		feedbackType = null;
	}
</script>

<div class="feedback-panel bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
	<h3 class="text-lg font-semibold text-white mb-4">¿Te fue útil esta explicación?</h3>

	<!-- Botones de Feedback -->
	<div class="feedback-buttons flex gap-4 mb-6">
		<button
			onclick={handleThumbsUp}
			disabled={$explanationStore.isExplaining}
			class="feedback-btn flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
		>
			👍 Sí, me ayudó
		</button>
		<button
			onclick={handleThumbsDown}
			disabled={$explanationStore.isExplaining}
			class="feedback-btn flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
		>
			👎 No entendí
		</button>
	</div>

	<!-- Botón de Pregunta Adicional -->
	<button
		onclick={handleAskQuestion}
		disabled={$explanationStore.isExplaining}
		class="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
	>
		💬 Hacer pregunta adicional
	</button>

	<!-- Input de Pregunta Adicional -->
	{#if showQuestionInput}
		<div class="question-input mt-4 p-4 bg-gray-900 bg-opacity-50 rounded-lg border border-blue-500 border-opacity-50">
			<label for="follow-up-question" class="block text-sm text-gray-300 mb-2">
				¿Qué más te gustaría saber?
			</label>
			<textarea
				id="follow-up-question"
				bind:value={followUpQuestion}
				placeholder="Escribe tu pregunta aquí..."
				rows="3"
				class="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none resize-none"
			></textarea>
			<div class="flex gap-2 mt-3">
				<button
					onclick={submitFollowUpQuestion}
					disabled={!followUpQuestion.trim() || isSubmitting}
					class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{isSubmitting ? '⏳ Enviando...' : '📤 Enviar'}
				</button>
				<button
					onclick={() => { showQuestionInput = false; followUpQuestion = ''; }}
					class="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors"
				>
					Cancelar
				</button>
			</div>
		</div>
	{/if}
</div>

<!-- Modal de Feedback Detallado -->
{#if showFeedbackModal}
	<div class="modal-overlay fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
		<div class="modal-content bg-gray-800 rounded-lg p-6 max-w-md w-full border border-gray-700">
			<h3 class="text-xl font-bold text-white mb-4">
				{feedbackType === 'helpful' ? '¡Gracias por tu feedback! 🎉' : '¿Qué podemos mejorar? 🤔'}
			</h3>
			
			{#if feedbackType === 'not-helpful'}
				<p class="text-gray-300 mb-4">
					Ayúdanos a mejorar. ¿Qué no quedó claro?
				</p>
				<textarea
					bind:value={feedbackReason}
					placeholder="Cuéntanos qué parte no entendiste..."
					rows="4"
					class="w-full px-4 py-2 bg-gray-900 text-white rounded-lg border border-gray-600 focus:border-red-500 focus:outline-none resize-none mb-4"
				></textarea>
			{:else}
				<p class="text-gray-300 mb-4">
					¿Hay algo que podamos mejorar en la explicación?
				</p>
				<textarea
					bind:value={feedbackReason}
					placeholder="Comentarios opcionales..."
					rows="4"
					class="w-full px-4 py-2 bg-gray-900 text-white rounded-lg border border-gray-600 focus:border-green-500 focus:outline-none resize-none mb-4"
				></textarea>
			{/if}

			<div class="flex gap-3">
				<button
					onclick={submitFeedback}
					disabled={isSubmitting}
					class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{isSubmitting ? '⏳ Enviando...' : '📤 Enviar'}
				</button>
				<button
					onclick={closeFeedbackModal}
					disabled={isSubmitting}
					class="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
				>
					Cancelar
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.feedback-btn {
		touch-action: manipulation;
		user-select: none;
	}

	.feedback-btn:active:not(:disabled) {
		transform: scale(0.95);
	}

	.modal-overlay {
		animation: fadeIn 0.2s ease-out;
	}

	.modal-content {
		animation: slideUp 0.3s ease-out;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
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
</style>
