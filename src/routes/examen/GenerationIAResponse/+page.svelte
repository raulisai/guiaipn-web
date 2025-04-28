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
	import QuestionSection from './components/QuestionSection.svelte';
	import LoadingAnimation from './components/LoadingAnimation.svelte';
	import TipsSection from './components/TipsSection.svelte';
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
	
	// Animation states
	let showPage = $state(false);
	
	onMount(async () => {
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
		
		// Show page with animation
		showPage = true;
		
		try {
			// Fetch explanation from API
			explication = await enviarRespuesta(pregunta, respuestaCorrecta);
		} catch (error) {
			console.error('Error al obtener la explicación:', error);
		} finally {
			isLoading = false;
		}
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
	}	function goBack() {
		// Set flag to indicate we're returning from explanation page
		localStorage.setItem('return_from_explanation', 'true');
		
		// Add exit animations with sequenced timing
		const contentElement = document.querySelector('.animate-fadeIn') as HTMLElement;
		if (contentElement) {
			// First fade out the main container
			contentElement.style.opacity = '0';
			contentElement.style.transform = 'translateY(10px)';
			contentElement.style.transition = 'opacity 0.4s ease-out, transform 0.4s ease-out';
			
			// Get all animated elements in reverse order and apply exit animations
			const animatedElements = [
				...document.querySelectorAll('.slide-in-right, .slide-in-left, .fade-in-up')
			].reverse();
			
			animatedElements.forEach((element, index) => {
				const el = element as HTMLElement;
				// Stagger the exit animations
				setTimeout(() => {
					el.style.opacity = '0';
					el.style.transform = 'translateY(-15px)';
					el.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
				}, index * 50);
			});
			
			setTimeout(() => {
				goto('/examen');
			}, 400);
		} else {
			goto('/examen');
		}
	}
</script>

{#if showPage}
<div class="text-gray-100 overflow-hidden animate-fadeIn">
	<!-- Main content container -->
	<div class="relative z-10 flex flex-col items-center justify-center min-h-screen p-4 sm:p-6">
		<div class="w-full max-w-4xl space-y-6">
			<div 
				class="bg-gray-800/30 backdrop-blur-sm border border-cyan-500/30 rounded-lg shadow-lg shadow-cyan-500/20 relative"
			>
				<!-- Decorative elements -->
				<div
					class="absolute -top-1 left-10 w-40 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-pulse"
				></div>
				<div
					class="absolute -bottom-1 right-10 w-40 h-1 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full animate-pulse"
				></div>

				<div class="p-4 md:p-6 lg:p-8 relative">					<div class="mb-6 relative">
						<!-- Header with back button -->
						<div class="flex justify-between items-center mb-6 fade-in-up" style="animation-delay: 0.05s;">
							<button
								onclick={goBack}
								class="text-cyan-300 hover:text-white transition-all duration-300 text-xl h-10 w-10 flex items-center justify-center rounded-full bg-gray-800/80 hover:bg-cyan-900/50 hover:scale-110 border border-cyan-500/30"
							>
								✕
							</button>
						</div>

						<!-- Question and answers container -->
						<div class="fade-in-up" style="animation-delay: 0.1s;">
							<QuestionSection {pregunta} {respuestaUsuario} {respuestaCorrecta} {lengMath} />
						</div>
					</div><div class="space-y-6">
						{#if isLoading}
							<LoadingAnimation />
						{:else if explication}
							<!-- Contenido responsivo con animaciones -->
							<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
								<!-- Explicación Problema -->
								<div class="slide-in-left" style="animation-delay: 0.1s;">
									<ExplanationSection explanation={explication.explicacionRespuesta} />
								</div>
								
								<!-- Tips Section -->
								<div class="slide-in-right" style="animation-delay: 0.2s;">
									<TipsSection tips={explication.Tip} />
								</div>
							</div>

							<!-- Pasos para resolver -->
							<div class="fade-in-up" style="animation-delay: 0.3s;">
								<StepsSection steps={explication.pasosParaResolverElProblema} />
							</div>

							<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
								<!-- Formulas y Ejemplo sections -->
								<div class="slide-in-left" style="animation-delay: 0.4s;">
									<AdditionalSection 
										title="Fórmulas" 
										content={explication.conceptosORecordatorios} 
										type="formula" 
									/>
								</div>
								
								<div class="slide-in-right" style="animation-delay: 0.5s;">
									<AdditionalSection 
										title="Ejemplo" 
										content={explication.ejemploSimilar} 
										type="example" 
									/>
								</div>
							</div>
						{/if}
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
{/if}

<style>
	.animate-fadeIn {
		animation: fadeIn 0.5s ease-out forwards;
	}
	
	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	
	.slide-in-right {
		animation: slideInRight 0.6s ease-out forwards;
	}
	
	@keyframes slideInRight {
		from {
			opacity: 0;
			transform: translateX(30px);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}
	
	.slide-in-left {
		animation: slideInLeft 0.6s ease-out forwards;
	}
	
	@keyframes slideInLeft {
		from {
			opacity: 0;
			transform: translateX(-30px);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}
	
	.fade-in-up {
		animation: fadeInUp 0.7s ease-out forwards;
	}
	
	@keyframes fadeInUp {
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
