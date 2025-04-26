<script>
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import RadarChart from './RadarChart.svelte';
	
	export let answers;
	
	// Calculate overall score
	const totalQuestions = Object.keys(answers).length;
	const correctAnswers = Object.values(answers).filter(answer => answer === 'true').length;
	const percentage = Math.round((correctAnswers / totalQuestions) * 100);
	
	// Save exam score to localStorage when component mounts
	onMount(() => {
		if (browser) {
			// Store exam data in localStorage for future analysis
			localStorage.setItem('lastExamScore', percentage.toString());
		}
	});
	
	function goToHome() {
		goto('/');
	}
	
	// Close animation
	function closeModal() {
		if (browser) {
			const modal = document.getElementById('exam-modal');
			if (modal) {
				modal.classList.add('animate-fadeOut');
				setTimeout(() => goto('/'), 300);
			} else {
				goto('/');
			}
		} else {
			goto('/');
		}
	}
</script>

<div
	id="exam-modal"
	class="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-auto animate-fadeIn"
>
	<div
		class="basemodal bg-gray-900/90 rounded-2xl max-w-4xl w-full p-6 lg:p-8 shadow-2xl shadow-cyan-500/20 border border-cyan-500/30 transition-all duration-300 ease-in-out"
	>
		<!-- Decorative elements -->
		<div class="absolute -top-3 left-10 w-40 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-pulse"></div>
		<div class="absolute -bottom-3 right-10 w-40 h-1 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full animate-pulse"></div>
		
		<button 
			onclick={closeModal}
			aria-label="Close Modal"
			class="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
		>
			<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
			</svg>
		</button>
		
		<div class="text-center mb-8">
			<h2 class="text-2xl md:text-3xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">
				¡Examen Finalizado!
			</h2>
			<div class="w-24 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 mx-auto rounded-full"></div>
		</div>
		
		<div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
			<!-- Score Display -->
			<div class="flex flex-col items-center">
				<div class="relative w-48 h-48 mb-4">
					<div class="absolute inset-0 rounded-full border-4 border-gray-700/50"></div>
					<svg class="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
						<circle 
							cx="50" cy="50" r="45" fill="none" 
							stroke-width="10" stroke="rgba(0, 183, 255, 0.2)" 
							class="opacity-25"
						/>
						<circle 
							cx="50" cy="50" r="45" fill="none" 
							stroke-width="10" stroke="rgba(0, 183, 255, 0.8)" 
							stroke-dasharray="283" 
							stroke-dashoffset={283 - (percentage * 283 / 100)}
							class="transform -rotate-90 origin-center transition-all duration-1000 ease-out"
						/>
					</svg>
					<div class="absolute inset-0 flex flex-col items-center justify-center">
						<span class="text-5xl font-bold text-white">{percentage}%</span>
						<span class="text-cyan-400 text-sm mt-1">Puntuación</span>
					</div>
				</div>
				
				<div class="text-center mt-4 space-y-2">
					<p class="text-lg text-gray-300">
						Respuestas correctas: <span class="text-cyan-400 font-bold">{correctAnswers}</span> de <span class="text-white">{totalQuestions}</span>
					</p>
					
					<div class="flex justify-center mt-8">
						<button 
							onclick={goToHome}
							class="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all duration-200 font-medium"
						>
							Volver al Inicio
						</button>
					</div>
				</div>
			</div>
			
			<!-- Radar Chart Component -->
			<RadarChart {answers} height="300px" />
		</div>
	</div>
</div>

<style>
	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}
	
	@keyframes fadeOut {
		from { opacity: 1; }
		to { opacity: 0; }
	}
	
	.animate-fadeIn {
		animation: fadeIn 0.3s ease-out forwards;
	}
	
	.animate-fadeOut {
		animation: fadeOut 0.3s ease-out forwards;
	}
	
	/* Hide scrollbar for Chrome, Safari and Opera */
	.basemodal::-webkit-scrollbar {
		width: 0.4rem;
	}
	
	.basemodal::-webkit-scrollbar-track {
		background: rgba(0, 0, 0, 0.1);
		border-radius: 10px;
	}
	
	.basemodal::-webkit-scrollbar-thumb {
		background: rgba(0, 183, 255, 0.3);
		border-radius: 10px;
	}
	
	.basemodal::-webkit-scrollbar-thumb:hover {
		background: rgba(0, 183, 255, 0.5);
	}

		@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}
	
	@keyframes fadeOut {
		from { opacity: 1; }
		to { opacity: 0; }
	}
	
	.animate-fadeIn {
		animation: fadeIn 0.3s ease-out forwards;
	}
	
	.animate-fadeOut {
		animation: fadeOut 0.3s ease-out forwards;
	}
	
	/* Hide scrollbar for Chrome, Safari and Opera */
	.basemodal::-webkit-scrollbar {
		width: 0.4rem;
	}
	
	.basemodal::-webkit-scrollbar-track {
		background: rgba(0, 0, 0, 0.1);
		border-radius: 10px;
	}
	
	.basemodal::-webkit-scrollbar-thumb {
		background: rgba(0, 183, 255, 0.3);
		border-radius: 10px;
	}
	
	.basemodal::-webkit-scrollbar-thumb:hover {
		background: rgba(0, 183, 255, 0.5);
	}
</style>
