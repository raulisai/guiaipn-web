<script>
	import { scale } from 'svelte/transition';
	
	let { 
		selectedQuestions = $bindable(10),
		onStartExam
	} = $props();
	
	const questionOptions = [5, 10, 15, 20];
</script>

<div 
	in:scale={{ delay: 300, duration: 500 }}
	class="exam-card bg-white/5 backdrop-blur-sm rounded-3xl p-4 md:p-6 border border-white/10 shadow-lg hover:shadow-xl transition-all duration-300"
>
	<h3 class="text-white/90 font-semibold text-base md:text-lg mb-4 text-center">
		Comenzar Examen
	</h3>
	
	<!-- Selector de preguntas -->
	<div class="mb-4">
		<div class="block text-white/80 text-xs md:text-sm mb-2 text-center font-medium">
			Número de preguntas
		</div>
		<div class="grid grid-cols-4 gap-2">
			{#each questionOptions as option}
				<button
					onclick={() => selectedQuestions = option}
					class="question-btn {selectedQuestions === option ? 'selected' : ''}"
				>
					<div class="text-2xl md:text-3xl font-black">{option}</div>
				</button>
			{/each}
		</div>
	</div>
	
	<!-- Botón PLAY grande -->
	<button
		onclick={onStartExam}
		class="play-button w-full py-3 md:py-4 rounded-2xl font-semibold text-base md:text-lg text-white bg-white/10 hover:bg-white/15 border border-white/20 hover:border-white/30 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-95"
	>
		<span class="flex items-center justify-center gap-2">
			<span class="text-xl">▶</span>
			<span>Comenzar</span>
		</span>
	</button>
</div>

<style>
	.exam-card:hover {
		transform: translateY(-4px);
	}
	
	.question-btn {
		padding: 0.75rem;
		border-radius: 1rem;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		color: white;
		transition: all 0.2s;
		cursor: pointer;
	}
	
	.question-btn:hover {
		background: rgba(255, 255, 255, 0.1);
		border-color: rgba(255, 255, 255, 0.2);
		transform: scale(1.05);
	}
	
	.question-btn.selected {
		background: rgba(59, 130, 246, 0.3);
		border-color: rgba(59, 130, 246, 0.5);
		box-shadow: 0 0 15px rgba(59, 130, 246, 0.3);
	}
	
	@media (max-width: 768px) {
		.question-btn {
			padding: 0.5rem;
		}
	}
</style>
