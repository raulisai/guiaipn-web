<script>
	import { scale } from 'svelte/transition';
	
	let { 
		selectedQuestions = $bindable(10),
		selectedSubject = '',
		onStartExam
	} = $props();
	
	const questionOptions = [5, 10, 15, 20];
	
	const subjectNames = {
		matematicas: 'Matemáticas',
		fisica: 'Física',
		quimica: 'Química',
		biologia: 'Biología',
		historia: 'Historia'
	};
</script>

<div 
	in:scale={{ delay: 300, duration: 500 }}
	class="exam-card bg-white/5 backdrop-blur-sm rounded-3xl p-4 md:p-6 border border-white/10 shadow-lg hover:shadow-xl transition-all duration-300"
>
	<h3 class="text-white/90 font-semibold text-base md:text-lg mb-2 text-center">
		Comenzar Examen
	</h3>
	
	<!-- Indicador de materia seleccionada con estilo gaming -->
	{#if selectedSubject}
		<div class="mb-4 text-center">
			<div class="gaming-badge inline-flex items-center gap-2 px-4 py-2 rounded-full">
				<div class="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
				<span class="text-sm font-bold uppercase tracking-wider">{subjectNames[selectedSubject] || selectedSubject}</span>
			</div>
		</div>
	{:else}
		<div class="mb-4 text-center">
			<div class="gaming-badge-all inline-flex items-center gap-2 px-4 py-2 rounded-full">
				<div class="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></div>
				<span class="text-sm font-bold uppercase tracking-wider">🎮 Todas las materias</span>
			</div>
		</div>
	{/if}
	
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
	
	<!-- Botón PLAY grande con estilo gaming -->
	<button
		onclick={onStartExam}
		class="gaming-play-button w-full py-4 md:py-5 rounded-2xl font-black text-base md:text-lg uppercase tracking-wider transition-all duration-300"
	>
		<span class="flex items-center justify-center gap-3">
			<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
				<path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
			</svg>
			<span>🎮 COMENZAR EXAMEN</span>
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
		background: linear-gradient(135deg, rgba(6, 182, 212, 0.28) 0%, rgba(168, 85, 247, 0.26) 100%);
		border: 1.5px solid rgba(6, 182, 212, 0.55);
		box-shadow: 0 0 16px rgba(6, 182, 212, 0.35);
		transform: scale(1.06);
		animation: question-glow 2.2s ease-in-out infinite;
	}
	
	@keyframes question-glow {
		0%, 100% {
			box-shadow: 0 0 16px rgba(6, 182, 212, 0.35);
		}
		50% {
			box-shadow: 0 0 22px rgba(168, 85, 247, 0.32);
		}
	}
	
	/* Badges gaming */
	.gaming-badge {
		background: linear-gradient(135deg, rgba(6, 182, 212, 0.22) 0%, rgba(168, 85, 247, 0.18) 100%);
		border: 1px solid rgba(6, 182, 212, 0.35);
		box-shadow: 0 0 12px rgba(6, 182, 212, 0.2);
		color: rgba(6, 182, 212, 0.85);
	}
	
	.gaming-badge-all {
		background: linear-gradient(135deg, rgba(168, 85, 247, 0.22) 0%, rgba(6, 182, 212, 0.18) 100%);
		border: 1px solid rgba(168, 85, 247, 0.35);
		box-shadow: 0 0 12px rgba(168, 85, 247, 0.22);
		color: rgba(168, 85, 247, 0.85);
	}
	
	/* Botón de play gaming */
	.gaming-play-button {
		position: relative;
		background: linear-gradient(135deg, rgba(6, 182, 212, 0.6) 0%, rgba(168, 85, 247, 0.58) 100%);
		border: 1.5px solid rgba(6, 182, 212, 0.65);
		color: rgba(255, 255, 255, 0.95);
		box-shadow: 0 0 24px rgba(6, 182, 212, 0.28);
		overflow: hidden;
	}
	
	.gaming-play-button::before {
		content: '';
		position: absolute;
		top: -45%;
		left: -45%;
		width: 180%;
		height: 180%;
		background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.2), transparent);
		transform: rotate(45deg);
		animation: shine 3.5s infinite;
	}
	
	.gaming-play-button:hover {
		transform: scale(1.04);
		box-shadow: 0 0 30px rgba(168, 85, 247, 0.32);
	}
	
	.gaming-play-button:active {
		transform: scale(0.99);
	}
	
	@keyframes shine {
		0% {
			left: -55%;
		}
		100% {
			left: 145%;
		}
	}
	
	@media (max-width: 768px) {
		.question-btn {
			padding: 0.5rem;
		}
	}
</style>
