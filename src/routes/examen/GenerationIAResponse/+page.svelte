<script lang="ts">
	/**
	 * GenerationIAResponse - Question Explanation Page (Blackboard Edition)
	 *
	 * This component provides a full-page explanation for an exam question.
	 * It uses a "Blackboard" metaphor to present information clearly.
	 */
	import { onMount, onDestroy } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { fade, fly, scale, slide } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';

	// Components
	import ExplanationSection from './components/ExplanationSection.svelte';
	import QuestionSection from './components/QuestionSection.svelte';
	import LoadingAnimation from './components/LoadingAnimation.svelte';
	import StepsSection from './components/StepsSection.svelte';
	import AdditionalSection from './components/AdditionalSection.svelte';
	import BlackboardContainer from './components/BlackboardContainer.svelte';

	// Services
	import { speechService } from '$lib/services/speechService';

	// Get data from URL params or localStorage
	let id = $state('');
	let pregunta = $state('');
	let respuestaUsuario = $state('');
	let respuestaCorrecta = $state('');
	let iscorrect = $state(false);
	let lengMathPregunta = $state(false);
	let lengMathOpciones = $state(false);
	let tipo = $state('');

	let isLoading = $state(true);
	let explication = $state(null);
	let videoUrl = $state('https://www.youtube.com/embed/dQw4w9WgXcQ');

	// Animation states
	let showPage = $state(false);
	let showVideo = $state(false);

	// TTS State
	let isSpeaking = $state(false);
	let voicesLoaded = $state(false);

	// Functions for showing/hiding the video
	function toggleVideo() {
		showVideo = !showVideo;
	}

	function speakText(text) {
		if (!text) return;
		speechService.stop(); // Stop any previous speech
		speechService.speak(text, {
			rate: 1.0,
			pitch: 1.0,
			onStart: () => (isSpeaking = true),
			onEnd: () => (isSpeaking = false),
			onError: () => (isSpeaking = false)
		});
		isSpeaking = true;
	}

	function toggleSpeech() {
		if (isSpeaking) {
			speechService.stop();
			isSpeaking = false;
		} else {
			// Construct the text to read
			let textToRead = 'Pregunta: ' + pregunta + '. ';

			if (explication) {
				textToRead += 'Explicación: ' + explication.explicacionRespuesta + '. ';
				// Optionally add steps or tips
			}
			speakText(textToRead);
		}
	}

	onMount(async () => {
		// Initialize Voice
		speechService.setEnabled(true);

		// Function to handle initialization
		async function initializeData() {
			// Get data from URL query params
			const urlParams = new URLSearchParams($page.url.search);
			id = urlParams.get('id') || '';
			pregunta = urlParams.get('pregunta') || '';
			respuestaUsuario = urlParams.get('respuestaUsuario') || '';
			respuestaCorrecta = urlParams.get('respuestaCorrecta') || '';
			iscorrect = urlParams.get('iscorrect') === 'true';
			lengMathPregunta = urlParams.get('lengMathPregunta') === 'true';
			lengMathOpciones = urlParams.get('lengMathOpciones') === 'true';
			tipo = id.slice(4, -2);

			// If we don't have necessary params, try to get from localStorage
			if (!id || !pregunta) {
				const lastQuestionId = localStorage.getItem('current_question_id');
				if (lastQuestionId) {
					id = lastQuestionId;
					pregunta = localStorage.getItem('current_question_text') || '';
					respuestaUsuario = localStorage.getItem('current_user_answer') || '';
					respuestaCorrecta = localStorage.getItem('current_correct_answer') || '';
					iscorrect = localStorage.getItem('current_is_correct') === 'true';
					lengMathPregunta = localStorage.getItem('current_is_math_pregunta') === 'true';
					lengMathOpciones = localStorage.getItem('current_is_math_opciones') === 'true';
				}
			}

			// If we still don't have the data, go back to exam
			if (!id || !pregunta) {
				goto('/examen');
				return;
			}

			// Video URL Logic
			if (
				pregunta.toLowerCase().includes('matemáticas') ||
				pregunta.toLowerCase().includes('ecuación')
			) {
				videoUrl = 'https://www.youtube.com/embed/JW9MoYxSm1w';
			} else if (pregunta.toLowerCase().includes('física')) {
				videoUrl = 'https://www.youtube.com/embed/fJ0laC2FksA';
			}

			// Show page with animation
			setTimeout(() => {
				showPage = true;
			}, 200);

			try {
				// Fetch explanation from API
				explication = await enviarRespuesta(pregunta, respuestaCorrecta);

				// Auto-start speech when explanation loads (optional, maybe better to let user trigger it)
				// speakText("Aquí tienes la explicación para la pregunta.");
			} catch (error) {
				console.error('Error al obtener la explicación:', error);
			} finally {
				isLoading = false;
			}
		}

		initializeData();
	});

	onDestroy(() => {
		// CRITICAL: Stop speech when leaving the page
		speechService.stop();
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
					pregunta: question,
					type: tipo
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
		speechService.stop(); // Ensure stop on back click

		// Set flag to indicate we're returning from explanation page
		localStorage.setItem('return_from_explanation', 'true');

		// Simple fade-out animation for the whole page
		const pageElement = document.querySelector('.blackboard-container') as HTMLElement;
		if (pageElement) {
			pageElement.style.opacity = '0';
			pageElement.style.transform = 'translateY(15px)';
			pageElement.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';

			setTimeout(() => {
				goto('/examen');
			}, 300);
		} else {
			goto('/examen');
		}
	}
</script>

{#if showPage}
	<!-- Background Wrapper -->
	<div
		class="fixed inset-0 bg-gray-900 flex items-center justify-center p-2 sm:p-4 overflow-hidden"
	>
		<!-- Main Blackboard Container -->
		<BlackboardContainer title="Análisis del Problema">
			<!-- Toolbar (Back, Voice, Video) -->
			<div class="flex flex-wrap items-center justify-between gap-2 mb-4 w-full">
				<button
					onclick={goBack}
					class="flex items-center gap-2 px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 text-gray-200 rounded-lg transition-all border border-gray-600 hover:border-gray-400 group"
				>
					<span class="transform group-hover:-translate-x-1 transition-transform">←</span>
					<span>Volver</span>
				</button>

				<div class="flex gap-2">
					<button
						onclick={toggleSpeech}
						class="flex items-center gap-2 px-4 py-2 rounded-lg transition-all border {isSpeaking
							? 'bg-amber-600/50 border-amber-500 text-amber-100'
							: 'bg-gray-700/50 border-gray-600 text-gray-200 hover:bg-gray-600/50'}"
					>
						<span>{isSpeaking ? '🔊 Detener' : '🔈 Escuchar'}</span>
					</button>

					<button
						onclick={toggleVideo}
						class="flex items-center gap-2 px-4 py-2 bg-blue-900/30 hover:bg-blue-800/40 text-blue-200 rounded-lg transition-all border border-blue-800/50 hover:border-blue-500"
					>
						<span>{showVideo ? 'Ocultar Video' : 'Ver Video'}</span>
					</button>
				</div>
			</div>

			<!-- Video Overlay (if shown) -->
			{#if showVideo}
				<div
					class="w-full aspect-video bg-black/50 rounded-lg overflow-hidden border border-gray-600 shadow-xl mb-6 relative"
					transition:slide={{ duration: 300 }}
				>
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
			{/if}

			<!-- Content Grid -->
			<div class="space-y-8 w-full pb-12">
				<!-- Question Section -->
				<div class="question-wrapper" in:fly={{ y: 20, duration: 400, delay: 100 }}>
					<QuestionSection
						{pregunta}
						{respuestaUsuario}
						{respuestaCorrecta}
						lengMath={lengMathPregunta}
						{lengMathOpciones}
					/>
				</div>

				{#if isLoading}
					<div class="py-12 flex justify-center">
						<LoadingAnimation />
					</div>
				{:else if explication}
					<!-- Explanation Section -->
					<div in:fly={{ y: 20, duration: 400, delay: 300 }}>
						<h3
							class="text-amber-400/80 font-serif text-lg mb-2 border-b border-amber-700/30 pb-1 w-fit"
						>
							Explicación Paso a Paso
						</h3>
						<ExplanationSection
							explanation={explication.explicacionRespuesta}
							tips={explication.Tip}
							lengMath={lengMathPregunta}
						/>
					</div>

					<!-- Steps Section -->
					<div in:fly={{ y: 20, duration: 400, delay: 500 }}>
						<StepsSection
							steps={explication.pasosParaResolverElProblema}
							lengMath={lengMathPregunta}
						/>
					</div>

					<!-- Additional Info -->
					<div in:fly={{ y: 20, duration: 400, delay: 700 }}>
						<AdditionalSection
							content={explication.conceptosORecordatorios}
							lengMath={lengMathPregunta}
						/>
					</div>
				{:else}
					<div
						class="p-8 text-center text-red-400 border border-red-900/30 rounded-lg bg-red-900/10"
					>
						<p>No se pudo cargar la explicación.</p>
						<button
							onclick={() => window.location.reload()}
							class="mt-4 text-sm underline hover:text-red-300">Intentar de nuevo</button
						>
					</div>
				{/if}
			</div>
		</BlackboardContainer>
	</div>
{/if}

<style>
	/* Scroll bar styling for the page if needed, though BlackboardContainer handles most */
	:global(body) {
		background-color: #111827;
	}
</style>
