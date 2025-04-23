<script lang="ts">
	export let currentQuestion: number;
	export let totalQuestions: number;
	export let answers: { [key: number]: string };

	$: progress = (currentQuestion / totalQuestions) * 100;
	$: answeredQuestions = Object.keys(answers).length;

</script>

<div
	class="progress-container bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-lg shadow-lg card_color w-full max-w-full transition-colors duration-300"
>
	<div class="progress-header flex justify-between text-sm text-gray-300 mb-3">
		<span>Pregunta {currentQuestion} de {totalQuestions}</span>
		<span>{answeredQuestions} respondidas</span>
	</div>

	<div class="progress-bar-container mb-6 h-2 bg-gray-800 rounded-full overflow-hidden shadow-inner">
		<div
			class="progress-bar h-full bg-gradient-to-r from-blue-500 to-yellow-400 rounded-full transition-all duration-400 shadow-md"
			style="width: {progress}%"
		></div>
	</div>

	<div class="question-indicators flex gap-1 mt-4 overflow-x-auto pb-2 scrollbar-thin flex-wrap">
		{#each Array(totalQuestions) as _, i}
			<div
				class="indicator w-2 h-2 rounded-full flex-shrink-0 transition-all duration-300"
				class:current={i + 1 === currentQuestion}
				class:answeredCorrect={answers[i + 1] === 'true'}
				class:answeredIncorrect={answers[i + 1] === 'false'}
				class:unanswered={!answers[i + 1] && i + 1 !== currentQuestion}
			></div>
		{/each}
	</div>

	
</div>

<style>
	.progress-container {
		margin-bottom: 1.5rem;
		padding: 1rem;
		border-radius: 0.75rem;
		backdrop-filter: blur(8px);
		border: 1px solid rgba(55, 65, 81, 0.5); /* gris-700/50 */
		background: rgba(31, 41, 55, 0.3); /* bg-gray-800/30 */
		box-shadow:
			0 4px 24px 0 rgba(0, 0, 0, 0.1),
			0 1.5px 4px 0 rgba(59, 130, 246, 0.05);
		color: #e5e7eb;
		width: 100%;
		max-width: 100%;
		transition: background 0.3s;
	}

	.progress-header {
		display: flex;
		justify-content: space-between;
		font-size: 0.875rem;
		color: rgb(209, 213, 219);
		margin-bottom: 0.75rem;
	}

	.progress-bar-container {
		height: 0.5rem;
		background-color: #1f2937;
		border-radius: 999px;
		overflow: hidden;
		box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.2);
	}

	.progress-bar {
		height: 100%;
		background: linear-gradient(to right, #3b82f6, #fbbf24);
		border-radius: 999px;
		transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
		box-shadow: 0 0 8px rgba(59, 130, 246, 0.5);
	}

	.question-indicators {
		display: flex;
		gap: 0.25rem;
		margin-top: 1rem;
		overflow-x: auto;
		padding-bottom: 0.5rem;
		-ms-overflow-style: none;
		scrollbar-width: thin;
		flex-wrap: wrap;
	}

	.indicator {
		width: 0.5rem;
		height: 0.5rem;
		border-radius: 50%;
		flex-shrink: 0;
		transition: all 0.3s ease;
	}

	.indicator.current {
		background-color: #fbbf24;
		transform: scale(1.2);
		box-shadow: 0 0 8px rgba(251, 191, 36, 0.6);
	}
	.indicator.answeredCorrect {
		background-color: #aaee6a;
		box-shadow: 0 0 4px rgba(59, 130, 246, 0.4);
	}
	.indicator.answeredIncorrect {
		background-color: #ef4444;
		box-shadow: 0 0 4px rgba(239, 68, 68, 0.4);
	}
	.indicator.unanswered {
		background-color: #1f2937;
	}

	.question-indicators::-webkit-scrollbar {
		height: 4px;
	}

	.question-indicators::-webkit-scrollbar-thumb {
		background-color: #4b5563;
		border-radius: 10px;
	}

	.question-indicators::-webkit-scrollbar-track {
		background-color: #1f2937;
	}

	@media (max-width: 640px) {
		.progress-container {
			padding: 0.75rem;
		}

		.indicator {
			width: 0.4rem;
			height: 0.4rem;
		}
	}
</style>
