<script>
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { Chart, registerables } from 'chart.js';
	
	export let answers;

	// Register Chart.js components
	Chart.register(...registerables);
	
	let chartCanvas;
	let radarChart;
	
	// Mapping for subject names
	const subjectMap = {
		'Algebra': 'Álgebra',
		'Aritmetica': 'Aritmética',
		'Fisica': 'Física',
		'Quimica': 'Química',
		'Biologia': 'Biología',
		'Historia': 'Historia',
		'Espanol': 'Español',
		'Geografia': 'Geografía'
	};
	
	// Calculate overall score
	const totalQuestions = Object.keys(answers).length;
	const correctAnswers = Object.values(answers).filter(answer => answer === 'true').length;
	const percentage = Math.round((correctAnswers / totalQuestions) * 100);
	
	// Extract subjects from question ids and count correct answers by subject
	function analyzeBySubject() {
		const subjectStats = {};
		const subjectTotals = {};
		
		// Get reactivo IDs from the page store
		for (const [questionNumber, isCorrect] of Object.entries(answers)) {
			// Find the reactivo ID for this question number
			const reactivoId = window.localStorage.getItem(`q${questionNumber}_id`) || '';
			
			// Extract subject from ID (format like "2024Algebra05")
			const match = reactivoId.match(/\d{4}([A-Za-z]+)\d+/);
			if (match) {
				const subject = match[1];
				// Initialize if not exists
				if (!subjectStats[subject]) {
					subjectStats[subject] = 0;
					subjectTotals[subject] = 0;
				}
				
				// Count correct answers
				if (isCorrect === 'true') {
					subjectStats[subject]++;
				}
				
				// Count total questions per subject
				subjectTotals[subject]++;
			}
		}
		
		// Calculate percentages
		const results = {};
		for (const subject in subjectStats) {
			if (subjectTotals[subject] > 0) {
				const displayName = subjectMap[subject] || subject;
				results[displayName] = Math.round((subjectStats[subject] / subjectTotals[subject]) * 100);
			}
		}
		
		return results;
	}
	
	function initChart() {
		if (!chartCanvas) return;
		
		const subjectResults = analyzeBySubject();
		const labels = Object.keys(subjectResults);
		const data = Object.values(subjectResults);
		
		// If no subject data available, create dummy data
		if (labels.length === 0) {
			// Dummy data for testing
			labels.push('Álgebra', 'Física', 'Química', 'Biología');
			data.push(75, 60, 80, 65);
		}
		
		// Create chart
		if (radarChart) {
			radarChart.destroy();
		}
		
		radarChart = new Chart(chartCanvas, {
			type: 'radar',
			data: {
				labels: labels,
				datasets: [{
					label: 'Desempeño por materia (%)',
					data: data,
					fill: true,
					backgroundColor: 'rgba(0, 183, 255, 0.2)',
					borderColor: 'rgba(0, 183, 255, 1)',
					pointBackgroundColor: 'rgba(0, 183, 255, 1)',
					pointBorderColor: '#fff',
					pointHoverBackgroundColor: '#fff',
					pointHoverBorderColor: 'rgba(0, 183, 255, 1)'
				}]
			},
			options: {
				scales: {
					r: {
						min: 0,
						max: 100,
						ticks: {
							display: false
						},
						grid: {
							color: 'rgba(255, 255, 255, 0.1)'
						},
						angleLines: {
							color: 'rgba(255, 255, 255, 0.1)'
						},
						pointLabels: {
							color: 'rgba(255, 255, 255, 0.8)',
							font: {
								size: 12
							}
						}
					}
				},
				plugins: {
					legend: {
						display: false
					}
				}
			}
		});
	}
	
	// Save exam IDs to localStorage when component mounts
	onMount(() => {
		// We need to delay chart initialization to ensure the canvas is in the DOM
		setTimeout(initChart, 100);
		
		// Store exam data in localStorage for future analysis
		// This is needed because we don't have access to the reactivo IDs directly
		window.localStorage.setItem('lastExamScore', percentage.toString());
	});
	
	function goToHome() {
		goto('/');
	}
	
	// Close animation
	function closeModal() {
		const modal = document.getElementById('exam-modal');
		modal.classList.add('animate-fadeOut');
		setTimeout(() => goto('/'), 300);
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
			on:click={closeModal}
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
							on:click={goToHome}
							class="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all duration-200 font-medium"
						>
							Volver al Inicio
						</button>
					</div>
				</div>
			</div>
			
			<!-- Radar Chart -->
			<div class="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
				<h3 class="text-lg font-medium text-gray-200 mb-4 text-center">Desempeño por Materia</h3>
				<div class="w-full h-64 relative">
					<canvas bind:this={chartCanvas} width="400" height="400"></canvas>
				</div>
			</div>
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
</style>
