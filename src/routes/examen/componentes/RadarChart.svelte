<script>
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	
	// Component state
	let chartCanvas;
	let radarChart;
	let canvasWidth = 400;
	let canvasHeight = 400;
	let Chart;
	
	// Props
	export let answers = {}; // Object with answers {questionNumber: 'true'/'false'}
	export let size = '100%'; // Size of the chart (can be % or px)
	export let height = '300px'; // Height of the chart
	export let showTitle = true; // Whether to show the title
	export let customClass = ''; // Additional CSS classes
	
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
	
	// Extract subjects from question ids and count correct answers by subject
	function analyzeBySubject() {
		const subjectStats = {};
		const subjectTotals = {};
		
		// Only run in browser environment
		if (!browser) return {};
		
		// Get reactivo IDs from localStorage
		for (const [questionNumber, isCorrect] of Object.entries(answers)) {
			// Find the reactivo ID for this question number
			const reactivoId = localStorage.getItem(`q${questionNumber}_id`) || '';
			
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
	
	async function initChart() {
		if (!browser || !chartCanvas) return;
		
		try {
			// Dynamically import Chart.js to avoid SSR issues
			if (!Chart) {
				const module = await import('chart.js');
				Chart = module.Chart;
				Chart.register(...module.registerables);
			}
			
			const subjectResults = analyzeBySubject();
			const labels = Object.keys(subjectResults);
			const data = Object.values(subjectResults);
			
			// If no subject data available, create dummy data for visualization
			if (labels.length === 0) {
				labels.push('Álgebra', 'Física', 'Química', 'Biología');
				data.push(0, 0, 0, 0); // All zeros for empty chart
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
				},				options: {
					responsive: true,
					maintainAspectRatio: false,
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
									size: customClass.includes('compact-chart') ? 8 : 12
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
		} catch (error) {
			console.error('Error initializing chart:', error);
		}
	}
		// Update chart when answers change
	$: if (browser && answers && Object.keys(answers).length > 0) {
		if (chartCanvas) {
			// Use setTimeout to ensure the DOM is ready
			setTimeout(initChart, 50);
		}
	}
	
	// Initialize chart when component mounts
	onMount(() => {
		if (!browser) return;
		
		// Need to delay chart initialization to ensure the canvas is in the DOM
		setTimeout(initChart, 100);
		
		// Handle resizing
		const resizeObserver = new ResizeObserver(() => {
			if (chartCanvas && chartCanvas.parentElement) {
				canvasWidth = chartCanvas.parentElement.clientWidth;
				canvasHeight = chartCanvas.parentElement.clientHeight;
				if (radarChart) {
					radarChart.resize();
				}
			}
		});
		
		if (chartCanvas && chartCanvas.parentElement) {
			resizeObserver.observe(chartCanvas.parentElement);
		}
		
		return () => {
			if (chartCanvas && chartCanvas.parentElement) {
				resizeObserver.unobserve(chartCanvas.parentElement);
			}
		};
	});
	
	// Cleanup on destroy
	onDestroy(() => {
		if (browser && radarChart) {
			radarChart.destroy();
		}
	});
</script>

<div class="radar-chart-container {customClass}" style="width: {size}; height: {height};">
	{#if showTitle}
		<h3 class="text-lg font-medium text-gray-200 mb-4 text-center">Desempeño por Materia</h3>
	{/if}
	<div class="w-full h-full relative">
		<canvas bind:this={chartCanvas} width={canvasWidth} height={canvasHeight}></canvas>
	</div>
</div>

<style>
	.radar-chart-container {
		background-color: rgba(31, 41, 55, 0.5);
		border-radius: 0.75rem;
		padding: 1rem;
		border: 1px solid rgba(75, 85, 99, 0.5);
		transition: all 0.3s ease;
	}
	
	.radar-chart-container:hover {
		box-shadow: 0 0 15px 0 rgba(0, 183, 255, 0.2);
	}
</style>
