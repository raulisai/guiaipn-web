<script>
	import { scale } from 'svelte/transition';
	import { elasticOut } from 'svelte/easing';

	let { 
		lastScore = 75, 
		bestScore = 85, 
		totalExams = 12,
		selectedQuestions = $bindable(10),
		onStartExam
	} = $props();

	const questionOptions = [5, 10, 15, 20];
</script>

<div 
	in:scale={{ delay: 200, duration: 500, easing: elasticOut }}
	class="game-card bg-gradient-to-br from-blue-900/40 via-purple-900/30 to-red-900/40 backdrop-blur-md rounded-2xl p-4 md:p-6 shadow-2xl border border-cyan/30 hover:border-red-400/50 transition-all duration-300"
>
	<!-- Scores compactos -->
	<div class="grid grid-cols-3 gap-2 mb-4">
		<div class="score-box text-center p-2 bg-black/20 rounded-lg">
			<div class="text-white/60 text-xs mb-1">Último</div>
			<div class="text-xl md:text-2xl font-bold text-yellow-400">{lastScore}%</div>
		</div>
		<div class="score-box text-center p-2 bg-black/20 rounded-lg border-2 border-red-500/50">
			<div class="text-white/60 text-xs mb-1">🏆 Récord</div>
			<div class="text-xl md:text-2xl font-bold text-red-400">{bestScore}%</div>
		</div>
		<div class="score-box text-center p-2 bg-black/20 rounded-lg">
			<div class="text-white/60 text-xs mb-1">Total</div>
			<div class="text-xl md:text-2xl font-bold text-cyan-400">{totalExams}</div>
		</div>
	</div>
	
	<!-- Selector de preguntas compacto -->
	<div class="mb-4">
		<div class="block text-white font-semibold text-sm md:text-base mb-2 text-center">
			¿Cuántas preguntas?
		</div>
		<div class="grid grid-cols-4 gap-2">
			{#each questionOptions as option}
				<button
					onclick={() => selectedQuestions = option}
					class="question-option {selectedQuestions === option ? 'selected' : ''} py-2 md:py-3 rounded-lg bg-black/30 hover:bg-red-900/50 transition-all duration-200 border-2 {selectedQuestions === option ? 'border-red-500 bg-red-900/50' : 'border-white/20'}"
				>
					<div class="text-xl md:text-2xl font-black text-white">{option}</div>
				</button>
			{/each}
		</div>
	</div>
	
	<!-- Botón de inicio -->
	<button
		onclick={onStartExam}
		class="start-button w-full py-3 md:py-4 rounded-xl font-black text-base md:text-lg text-white bg-gradient-to-r from-red-600 via-red-500 to-orange-500 hover:from-red-500 hover:via-red-400 hover:to-orange-400 shadow-lg hover:shadow-red-500/50 transition-all duration-300 hover:scale-105 active:scale-95"
	>
		<span class="flex items-center justify-center gap-2">
			<span>🚀</span>
			<span>¡COMENZAR!</span>
			<span>🚀</span>
		</span>
	</button>
	
	<!-- Motivación compacta -->
	<div class="mt-3 text-center">
		{#if lastScore < bestScore}
			<p class="text-white/80 text-xs md:text-sm">
				💪 ¡A solo <span class="text-red-400 font-bold">{bestScore - lastScore}%</span> de tu récord!
			</p>
		{:else}
			<p class="text-white/80 text-xs md:text-sm">
				🔥 ¡Estás en racha! Sigue así
			</p>
		{/if}
	</div>
</div>

<style>
	.game-card {
		animation: float 3s ease-in-out infinite;
	}
	
	@keyframes float {
		0%, 100% { transform: translateY(0px); }
		50% { transform: translateY(-5px); }
	}
	
	.question-option {
		cursor: pointer;
		user-select: none;
	}
	
	.start-button {
		position: relative;
		overflow: hidden;
	}
	
	.start-button::after {
		content: '';
		position: absolute;
		top: -50%;
		left: -50%;
		width: 200%;
		height: 200%;
		background: linear-gradient(45deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0) 100%);
		transition: all 0.6s ease-in-out;
		transform: rotate(45deg) translateY(-100%);
	}
	
	.start-button:hover::after {
		transform: rotate(45deg) translateY(100%);
	}
</style>
