<script lang="ts">
	/**
	 * GenerationIAResponse - Question Explanation Page
	 *
	 * This component provides a full-page explanation for an exam question.
	 * It's structured with several modular components:
	 * - QuestionSection: Displays the original question and answers
	 * - ExplanationSection: Shows the explanation for the correct answer
	 * - TipsSection: Provides helpful tips for solving similar problems
	 * - StepsSection: Lists step-by-step solution process
	 * - AdditionalSection: Shows formulas and example problems
	 * - LoadingAnimation: Displays while fetching the explanation
	 *
	 * Data flows:
	 * 1. Receives data via URL parameters or localStorage backup
	 * 2. Fetches explanation from API
	 * 3. Manages transitions when navigating to/from the page
	 */
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import ExplanationSection from './components/ExplanationSection.svelte';
	import { fade, fly, scale, draw, crossfade, slide } from 'svelte/transition';
	import { elasticOut, cubicOut, bounceOut } from 'svelte/easing';
	import CharacterIa from '../componentes/CharacterIA.svelte';
	import QuestionSection from './components/QuestionSection.svelte';
	import LoadingAnimation from './components/LoadingAnimation.svelte';

	import StepsSection from './components/StepsSection.svelte';
	import AdditionalSection from './components/AdditionalSection.svelte';

	// Get data from URL params or localStorage
	let id = $state('');
	let pregunta = $state('');
	let respuestaUsuario = $state('');
	let respuestaCorrecta = $state('');
	let iscorrect = $state(false);
	let lengMath = $state(false);

	let isLoading = $state(true);
	let explication = $state(null);
	let videoUrl = $state('https://www.youtube.com/embed/dQw4w9WgXcQ'); // Example video URL, replace with actual URL

	// Animation states
	let showPage = $state(false);
	let showVideo = $state(false);

	// Functions for showing/hiding the video
	function toggleVideo() {
		showVideo = !showVideo;
	}
	onMount(() => {
		// Function to handle initialization
		async function initializeData() {
			// Get data from URL query params
			const urlParams = new URLSearchParams($page.url.search);
			id = urlParams.get('id') || '';
			pregunta = urlParams.get('pregunta') || '';
			respuestaUsuario = urlParams.get('respuestaUsuario') || '';
			respuestaCorrecta = urlParams.get('respuestaCorrecta') || '';
			iscorrect = urlParams.get('iscorrect') === 'true';
			lengMath = urlParams.get('lengMath') === 'true';

			// If we don't have necessary params, try to get from localStorage
			if (!id || !pregunta) {
				const lastQuestionId = localStorage.getItem('current_question_id');
				if (lastQuestionId) {
					id = lastQuestionId;
					pregunta = localStorage.getItem('current_question_text') || '';
					respuestaUsuario = localStorage.getItem('current_user_answer') || '';
					respuestaCorrecta = localStorage.getItem('current_correct_answer') || '';
					iscorrect = localStorage.getItem('current_is_correct') === 'true';
					lengMath = localStorage.getItem('current_is_math') === 'true';
				}
			}

			// If we still don't have the data, go back to exam
			if (!id || !pregunta) {
				goto('/examen');
				return;
			}
			
			// Add cyberpunk effect to background
			document.body.classList.add('cyber-background');
			
			// Set video URL based on topic - this would be replaced with real logic
			// to determine appropriate videos based on the question content
			if (pregunta.toLowerCase().includes('matemáticas') || pregunta.toLowerCase().includes('ecuación')) {
				videoUrl = 'https://www.youtube.com/embed/JW9MoYxSm1w'; // Math example
			} else if (pregunta.toLowerCase().includes('física')) {
				videoUrl = 'https://www.youtube.com/embed/fJ0laC2FksA'; // Physics example
			}

			// Show page with animation
			setTimeout(() => {
				showPage = true;
			}, 200);

			try {
				// Fetch explanation from API
				explication = await enviarRespuesta(pregunta, respuestaCorrecta);
			} catch (error) {
				console.error('Error al obtener la explicación:', error);
			} finally {
				isLoading = false;
			}
		}
		
		// Call the initialization function
		initializeData();
		
		// Clean up function returned directly (not as a Promise)
		return () => {
			document.body.classList.remove('cyber-background');
		};
	});

	async function enviarRespuesta(question, respuesta) {
		const urlAPI = 'https://pqedqxmb2h.execute-api.us-east-2.amazonaws.com/ChatGpt';

		try {
			const response = await fetch(urlAPI, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					idreactivo: id,
					respuesta: respuesta,
					isCorrect: iscorrect,
					pregunta: question
				})
			});

			if (!response.ok) {
				throw new Error('Network response was not ok ' + response.statusText);
			}

			const data = await response.json();
			console.log('resp:', data);
			return data;
		} catch (error) {
			console.error('There was a problem with the fetch operation:', error);
		}
	}
	function goBack() {
		// Set flag to indicate we're returning from explanation page
		localStorage.setItem('return_from_explanation', 'true');

		// Simple fade-out animation for the whole page
		const pageElement = document.querySelector('.animate-fadeIn') as HTMLElement;
		if (pageElement) {
			pageElement.style.opacity = '0';
			pageElement.style.transform = 'translateY(15px)'; // Optional: slight upward movement
			pageElement.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';

			setTimeout(() => {
				goto('/examen');
			}, 300); // Match transition duration
		} else {
			goto('/examen'); // Fallback if element not found
		}
	}
</script>

{#if showPage}
	<div class="text-gray-200 overflow-hidden">
		<!-- Cyberpunk grid lines overlay -->
		<div class="fixed inset-0 z-0 cyberpunk-grid pointer-events-none"></div>
		
		<!-- Glowing orbs for decoration (pointer-events-none to not interfere with user interaction) -->
		<div class="fixed top-20 right-20 glow-orb blue-orb pointer-events-none"></div>
		<div class="fixed bottom-40 left-20 glow-orb purple-orb pointer-events-none"></div>
		
		<!-- Main content container -->
		<div
			class="relative z-10 flex flex-col items-center justify-start min-h-screen p-4 sm:p-6 md:p-8 md:mt-16 mt-12"
			in:fade={{ duration: 600, delay: 200 }}
		>
			<div class="w-full max-w-5xl space-y-6">
				<!-- Cyberpunk container -->
				<div class="relative">
					<!-- Header with back button -->
					<div class="flex justify-between items-center mb-6">
						<button
							onclick={goBack}
							class="cyber-btn bg-transparent text-cyan-400 hover:text-cyan-300 transition-all duration-300 text-xl h-12 w-12 flex items-center justify-center rounded-md border border-cyan-700/50 shadow-lg shadow-cyan-900/30 transform hover:scale-105 hover:shadow-cyan-500/30 hover:-translate-y-1 cyber-glow"
							aria-label="Volver al examen"
							in:fly={{ y: 20, duration: 400 }}
						>
							<span class="transform transition-transform">←</span>
						</button>
						
						<button 
							onclick={toggleVideo}
							class="cyber-btn bg-transparent text-cyan-400 hover:text-cyan-300 transition-all duration-300 text-sm px-4 h-10 flex items-center justify-center rounded-md border border-cyan-700/50 shadow-lg shadow-cyan-900/30 transform hover:scale-105 hover:shadow-cyan-500/30"
							in:fly={{ y: 20, duration: 400, delay: 100 }}
						>
							{showVideo ? 'Ocultar Video' : 'Ver Video Explicativo'}
						</button>
					</div>

					<!-- Question and answers container -->
					<div class="mb-8" in:fly={{ y: 30, duration: 500, delay: 300 }}>
						<QuestionSection {pregunta} {respuestaUsuario} {respuestaCorrecta} {lengMath} />
					</div>
				</div>

				<!-- Video section (conditionally shown) -->
				{#if showVideo}
					<div 
						class="cyber-panel w-full aspect-video mb-6"
						transition:slide={{ duration: 400, easing: cubicOut }}
					>
						<div class="cyber-panel-header flex justify-between items-center">
							<span class="text-cyan-300 font-bold text-sm">Video explicativo</span>
							<div class="flex space-x-2">
								<div class="w-3 h-3 rounded-full bg-red-500"></div>
								<div class="w-3 h-3 rounded-full bg-yellow-500"></div>
								<div class="w-3 h-3 rounded-full bg-green-500"></div>
							</div>
						</div>
						<div class="p-1 bg-black/30 backdrop-blur-sm">
							<iframe 
								width="100%" 
								height="100%" 
								src={videoUrl}
								title="Video explicativo" 
								frameborder="0" 
								allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
								allowfullscreen
								class="aspect-video"
							></iframe>
						</div>
					</div>
				{/if}

				<div class="space-y-8">
					{#if isLoading}
						<LoadingAnimation />
					{:else if explication}
						<!-- Responsive content with Svelte animations -->
						<div class="grid grid-cols-1 gap-8">
							<!-- Explanation Section -->
							<div 
								class="cyber-panel explanation-panel"
								in:fly={{ y: 40, duration: 600, delay: 400 }}
							>
								<div class="cyber-panel-header">
									<span class="text-cyan-300 font-bold">Explicación</span>
									<div class="cyber-dots">
										<div class="cyber-dot"></div>
										<div class="cyber-dot"></div>
										<div class="cyber-dot"></div>
									</div>
								</div>
								<div class="cyber-panel-content">
									<ExplanationSection
										explanation={explication.explicacionRespuesta}
										tips={explication.Tip}
									/>
								</div>
							</div>

							<!-- Steps Section with animated reveal -->
							<div 
								class="cyber-panel steps-panel"
								in:fly={{ y: 40, duration: 600, delay: 600 }}
							>
								<div class="cyber-panel-header">
									<span class="text-cyan-300 font-bold">Procedimiento</span>
									<div class="cyber-data-label">4LGORITMO</div>
								</div>
								<div class="cyber-panel-content">
									<StepsSection steps={explication.pasosParaResolverElProblema} />
								</div>
							</div>

							<!-- Formulas Section with glowing effect -->
							<div 
								class="cyber-panel formulas-panel" 
								in:fly={{ y: 40, duration: 600, delay: 800 }}
							>
								<div class="cyber-panel-header">
									<span class="text-yellow-300 font-bold">Fórmulas / Conceptos</span>
									<div class="cyber-data-label">DATA.SCI</div>
								</div>
								<div class="cyber-panel-content">
									<AdditionalSection
										content={explication.conceptosORecordatorios}
									/>
								</div>
							</div>
						</div>
					{:else}
						<div
							class="cyber-panel error-panel"
							in:scale={{duration: 400, delay: 300, start: 0.8, opacity: 0}}
						>
							<div class="cyber-panel-header bg-red-900/60">
								<span class="text-red-300 font-bold">ERROR</span>
								<div class="cyber-data-label text-red-400">CONNECTION.FAILED</div>
							</div>
							<div class="cyber-panel-content text-center py-8">
								<div class="text-red-400 mb-2 text-lg">⚠ Sistema no disponible</div>
								<div class="text-gray-300">
									No se pudo cargar la explicación. Intenta de nuevo más tarde.
								</div>
							</div>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	/* ========= CYBERPUNK THEMED STYLES ========= */
	
	/* Grid overlay for cyberpunk aesthetic */
	.cyberpunk-grid {
		background-image: 
			linear-gradient(to right, rgba(5, 220, 250, 0.07) 1px, transparent 1px),
			linear-gradient(to bottom, rgba(5, 220, 250, 0.07) 1px, transparent 1px);
		background-size: 40px 40px;
		background-position: center center;
	}
	
	/* Glowing orbs decoration */
	.glow-orb {
		width: 150px;
		height: 150px;
		border-radius: 50%;
		filter: blur(50px);
		opacity: 0.5;
		animation: pulse 8s infinite alternate;
	}
	
	.blue-orb {
		background-color: rgba(32, 156, 238, 0.096);
	}
	
	.purple-orb {
		background-color: rgba(130, 40, 245, 0.3);
	}
	
	@keyframes pulse {
		0% {
			transform: scale(0.8);
			opacity: 0.3;
		}
		100% {
			transform: scale(1.2);
			opacity: 0.6;
		}
	}
	
	/* Cyberpunk panel styles */
	.cyber-panel {
		background: rgba(24, 27, 45, 0.164);
		backdrop-filter: blur(3px);
		border-radius: 8px;
		border-left: 2px solid rgba(0, 220, 255, 0.5);
		border-top: 1px solid rgba(0, 220, 255, 0.3);
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
		overflow: hidden;
		position: relative;
	}
	
	.cyber-panel::after {
		content: '';
		position: absolute;
		top: 0;
		right: 0;
		height: 100%;
		width: 10px;
		background: linear-gradient(to bottom, rgba(0, 220, 255, 0.5), rgba(130, 40, 245, 0.5));
		opacity: 0.5;
	}
	
	.cyber-panel-header {
		background: rgba(13, 17, 31, 0.7);
		padding: 0.75rem 1.25rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
		border-bottom: 1px solid rgba(0, 220, 255, 0.3);
	}
	
	.cyber-panel-content {
		padding: 1rem;
		position: relative;
	}
	
	.cyber-data-label {
		font-family: monospace;
		font-size: 0.75rem;
		color: rgba(0, 220, 255, 0.7);
		letter-spacing: 1px;
	}
	
	.cyber-dots {
		display: flex;
		gap: 5px;
	}
	
	.cyber-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: rgba(0, 220, 255, 0.7);
	}
	
	/* Cyberpunk button */
	.cyber-btn {
		position: relative;
		overflow: hidden;
		transition: all 0.3s ease;
	}
	
	.cyber-btn::before {
		content: '';
		position: absolute;
		top: -2px;
		left: -2px;
		right: -2px;
		bottom: -2px;
		background: linear-gradient(45deg, #00ffff, #0077ff, #ff00ff, #ff7700);
		z-index: -2;
		animation: glowing 3s linear infinite;
		background-size: 400%;
		opacity: 0;
		transition: opacity 0.3s ease;
		border-radius: inherit;
	}
	
	.cyber-btn:hover::before {
		opacity: 1;
	}
	
	.cyber-btn::after {
		content: '';
		position: absolute;
		inset: 0;
		background: inherit;
		z-index: -1;
		border-radius: inherit;
	}
	
	@keyframes glowing {
		0% { background-position: 0% 0%; }
		50% { background-position: 400% 0%; }
		100% { background-position: 0% 0%; }
	}
	
	/* Panel specific styles */
	.explanation-panel {
		border-left-color: rgba(0, 220, 255, 0.5);
	}
	
	.steps-panel {
		border-left-color: rgba(95, 58, 255, 0.5);
	}
	
	.formulas-panel {
		border-left-color: rgba(255, 216, 0, 0.5);
	}
	
	.error-panel {
		border-left-color: rgba(255, 73, 73, 0.8);
	}
	

	
	/* Animation for scanner line effect */
	@keyframes scannerLine {
		0% { transform: translateY(-100%); }
		100% { transform: translateY(100%); }
	}
	
	/* Responsive adjustments */
	@media (max-width: 640px) {
		.glow-orb {
			width: 100px;
			height: 100px;
		}
		
		.cyber-panel-header {
			padding: 0.5rem 0.75rem;
		}
		
		.cyber-panel-content {
			padding: 0.75rem;
		}
	}
</style>
