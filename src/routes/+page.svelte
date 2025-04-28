<script>
	import { onMount } from 'svelte';
	import { fade, fly, scale } from 'svelte/transition';
	import { elasticOut, backOut } from 'svelte/easing';
	import { user } from '$lib/stores/authStore';
	import { goto } from '$app/navigation';
	
	// Variables para la primera sección
	let visible = false;
	let heroVisible = false;
	let buttonVisible = false;
	let imageVisible = false;
	let currentUser = null;
	
	// Variables para la sección "Cómo funciona"
	let titleVisible = false;
	let step1Visible = false;
	let step2Visible = false;
	let step3Visible = false;
	let ctaVisible = false;
	
	// Variables para la sección "Mi Progreso"
	let progressTitleVisible = false;
	let progressDashboardVisible = false;
	let progressCtaVisible = false;
	
	// Función de utilidad para detectar cuando un elemento es visible en el viewport
	function inView(node, options = {}) {
		const { rootMargin = '0px', threshold = 0 } = options;
		
		const handleIntersection = (entries) => {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					// Aquí identificamos qué elemento es basado en un atributo de datos personalizado
					const sectionId = node.dataset.section;
					if (sectionId === 'title') titleVisible = true;
					if (sectionId === 'step1') step1Visible = true;
					if (sectionId === 'step2') step2Visible = true;
					if (sectionId === 'step3') step3Visible = true;
					if (sectionId === 'cta') ctaVisible = true;
					if (sectionId === 'progress-title') progressTitleVisible = true;
					if (sectionId === 'progress-dashboard') progressDashboardVisible = true;
					if (sectionId === 'progress-cta') progressCtaVisible = true;
				}
			});
		};
		
		const observer = new IntersectionObserver(handleIntersection, { rootMargin, threshold });
		
		observer.observe(node);
		
		return {
			destroy() {
				observer.disconnect();
			},
		};
	}
	
	onMount(() => {
		// Secuencia de animaciones para la primera sección
		setTimeout(() => {
			visible = true;
			setTimeout(() => heroVisible = true, 200);
			setTimeout(() => buttonVisible = true, 800);
			setTimeout(() => imageVisible = true, 400);
		}, 300);

		// Obtener el usuario actual
		const unsubscribe = user.subscribe((value) => {
			currentUser = value;
		});

		return () => unsubscribe();
	});

	function handleCTAClick() {
		if (currentUser) {
			goto('/materias');
		} else {
			goto('/cuenta/login');
		}
	}
</script>

<section
	class="min-w-full min-h-screen flex flex-col md:flex-row items-center justify-center py-4 px-8 sm:pb-6 overflow-x-hidden relative bg-gradient-to-b from-[#030e27]/90 to-black/90"
>
	<!-- Partículas animadas de fondo -->
	<div class="particles-container absolute inset-0 overflow-hidden opacity-40"></div>
	
	<!-- Left section with text and button -->
	<div
		class="md:w-1/2 flex flex-col items-center justify-center text-center px-6 md:text-left mb-8 md:mb-0 z-10"
	>
		{#if visible}
			{#if currentUser}
				<div 
					in:fade={{ duration: 500 }}
					class="mb-4 p-4 bg-blue-950/30 backdrop-blur-sm rounded-lg border border-blue-800/50"
				>
					<h2 class="text-xl text-white font-medium">¡Bienvenido de nuevo!</h2>
					<p class="text-cyan-400">
						{currentUser.user_metadata?.full_name || currentUser.email.split('@')[0]}
					</p>
				</div>
			{/if}

			<h1 
				in:fly={{ y: -50, duration: 1000, easing: elasticOut }}
				class="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white drop-shadow-lg"
			>
				Ingresa al 
				{#if heroVisible}
					<span
						in:scale={{ duration: 800, easing: backOut, start: 0.3 }}
						class="text-red-950 block md:inline-block text-6xl md:text-8xl lg:text-9xl mt-2 glow-text">IPN</span
					>
				{/if}
			</h1>
			
			<h3 
				in:fade={{ delay: 600, duration: 800 }}
				class="mt-4 text-center text-white p-3 backdrop-blur-sm rounded-lg bg-black/10 border border-white/5"
			>
				¿Quieres ingresar al IPN pero no sabes cómo? <span class="text-red-400">¡Nosotros te ayudamos!</span> Preparate para el examen
				de admisión desde la comodidad de tu casa.
			</h3>
		{/if}

		{#if buttonVisible}
			<button
				in:scale={{ duration: 500, delay: 100 }}
				class="mt-6 w-auto text-center text-white bg-gradient-to-r from-red-950 to-red-900 rounded-lg border-2 border-white/30 backdrop-blur-sm pulse-animation shadow-glow"
			>
				<a
					href="/examen"
					class="px-6 py-3 hover:from-red-800 hover:to-red-700 transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3"
				>
					<p class="font-bold text-base">Comenzar a estudiar con AI</p>
					<!-- Mini robot icon animado -->
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-6 w-6 robot-icon"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						stroke-width="2"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M9 3v2m6-2v2M9 19h6m-6 4h6m-6-8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm6 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"
						/>
						<rect
							x="5"
							y="9"
							width="14"
							height="10"
							rx="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
						<line x1="8" y1="15" x2="10" y2="15" />
						<line x1="14" y1="15" x2="16" y2="15" />
					</svg>
				</a>
			</button>
		{/if}
	</div>
	
	<!--  Right section with image -->
	{#if imageVisible}
		<div
			in:fly={{ x: 100, duration: 800, easing: elasticOut }}
			class="content_guiaIPN mt-6 md:mt-4 text-center w-full md:w-1/2 flex justify-center items-center px-4 z-10"
		>
			<img 
				src="/logoipnGuia.png" 
				alt="Logo de la guia del IPN" 
				class="max-w-l h-auto hover-float"
			/>
		</div>
	{/if}
</section>

<!-- Sección de "Cómo funciona" con animaciones de scroll -->
<section
	class="w-full py-24 bg-gradient-to-b from-[#030e27] via-[#030e28]/70 to-black/60 backdrop-blur-2xl relative section-how"
>
	<!-- Elementos decorativos flotantes -->
	<div class="floating-element floating-1"></div>
	<div class="floating-element floating-2"></div>
	<div class="floating-element floating-3"></div>
		<div class="container mx-auto px-6 relative z-10">
		<div class="section-title-container" use:inView={{ rootMargin: '-150px' }} data-section="title">
			{#if titleVisible}
				<h2 
					in:fly={{ y: 50, duration: 800, easing: elasticOut }}
					class="text-5xl font-bold text-white text-center mb-8 glow-text-subtle"
				>
					¿Cómo funciona?
				</h2>
				<p 
					in:fade={{ delay: 200, duration: 800 }}
					class="text-white/80 text-center max-w-3xl mx-auto mb-16 text-lg"
				>
					Nuestra plataforma está diseñada para ayudarte a prepararte de manera efectiva para el examen 
					de admisión del IPN con la ayuda de <span class="text-red-400">inteligencia artificial personalizada</span>.
				</p>
			{/if}
		</div>
		
		<div class="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">			<!-- Paso 1 -->
			<div
				use:inView={{ rootMargin: '-100px' }} 
				data-section="step1"
				class="card-container"
			>
				{#if step1Visible}
					<div
						in:fly={{ y: 50, x: -20, duration: 800, delay: 100 }}
						class="bg-blue-card backdrop-blur-2xl rounded-xl p-8 shadow-lg shadow-blue-900/20 
						transform hover:scale-105 transition-all duration-500 border border-cyan hover:border-red-300/50
						card-hover"
					>
						<div
							class="bg-gradient-to-r from-red-950 to-red-800 rounded-full w-16 h-16 flex items-center 
							justify-center mx-auto mb-6 shadow-md number-icon"
						>
							<span class="text-white text-2xl font-bold">1</span>
						</div>
						<h3 class="text-2xl font-bold text-white text-center mb-4">Regístrate</h3>
						<p class="text-white/80 text-center mb-4">
							Crea una cuenta gratuita para acceder a todos los recursos de preparación para el examen
							del IPN. El proceso toma menos de un minuto.
						</p>
						<div class="flex justify-center mt-4">
							<a href="/registro" class="text-red-400 hover:text-red-300 font-medium button-arrow">
								Crear cuenta <span class="arrow">→</span>
							</a>
						</div>
					</div>
				{/if}
			</div>			<!-- Paso 2 -->
			<div
				use:inView={{ rootMargin: '-100px' }} 
				data-section="step2"
				class="card-container"
			>
				{#if step2Visible}
					<div
						in:fly={{ y: 50, duration: 800, delay: 300 }}
						class="bg-blue-card backdrop-blur-sm rounded-xl p-8 shadow-lg shadow-blue-900/20 
						transform hover:scale-105 transition-all duration-500 border border-cyan hover:border-red-300/50
						card-hover" 
					>
						<div
							class="bg-gradient-to-r from-red-950 to-red-800 rounded-full w-16 h-16 flex items-center 
							justify-center mx-auto mb-6 shadow-md number-icon"
						>
							<span class="text-white text-2xl font-bold">2</span>
						</div>
						<h3 class="text-2xl font-bold text-white text-center mb-4">Estudia con IA</h3>
						<p class="text-white/80 text-center mb-4">
							Nuestro sistema de IA analiza tu progreso y te ofrece material personalizado para 
							fortalecer tus áreas de oportunidad en todas las materias.
						</p>
						<div class="flex justify-center mt-4">
							<a href="/examen" class="text-red-400 hover:text-red-300 font-medium button-arrow">
								Comenzar ahora <span class="arrow">→</span>
							</a>
						</div>
					</div>
				{/if}
			</div>			<!-- Paso 3 -->
			<div
				use:inView={{ rootMargin: '-100px' }} 
				data-section="step3"
				class="card-container"
			>
				{#if step3Visible}
					<div
						in:fly={{ y: 50, x: 20, duration: 800, delay: 500 }}
						class="bg-blue-card backdrop-blur-sm rounded-xl p-8 shadow-lg shadow-blue-900/20 
						transform hover:scale-105 transition-all duration-500 border border-cyan hover:border-red-300/50
						card-hover"
					>
						<div
							class="bg-gradient-to-r from-red-950 to-red-800 rounded-full w-16 h-16 flex items-center 
							justify-center mx-auto mb-6 shadow-md number-icon"
						>
							<span class="text-white text-2xl font-bold">3</span>
						</div>
						<h3 class="text-2xl font-bold text-white text-center mb-4">¡Aprueba!</h3>
						<p class="text-white/80 text-center mb-4">
							Presentate al examen con confianza después de practicar con nuestros exámenes simulados 
							y contenido adaptado a tus necesidades.
						</p>
						<div class="flex justify-center mt-4">
							<a href="/testimonios" class="text-red-400 hover:text-red-300 font-medium button-arrow">
								Ver resultados <span class="arrow">→</span>
							</a>
						</div>
					</div>
				{/if}
			</div>
		</div>
				<div 
			use:inView={{ rootMargin: '-100px' }}
			data-section="cta"
			class="mt-16 text-center"
		>
			{#if ctaVisible}
				<a 
					in:scale={{ duration: 600, delay: 200 }}
					href="/como-funciona" 
					class="inline-block px-8 py-3 bg-gradient-to-r from-red-950 to-red-800 rounded-lg text-white 
					font-bold hover:from-red-800 hover:to-red-700 transition-all duration-300 shadow-xl
					hover:shadow-red-900/30 hover:scale-105 cta-button"
				>
					Conoce más detalles
				</a>
			{/if}
		</div>
	</div>
</section>



<style>
	/* Estilos básicos */
	.border-cyan {
		border: #3a4c50 0.5px solid;
	}

	.bg-blue-card {
		background: #0b1a32a3;
	}
	
	/* Efectos de texto */
	.glow-text {
		text-shadow: 0 0 10px rgba(239, 68, 68, 0.5), 0 0 15px rgba(239, 68, 68, 0.3);
		animation: colorPulse 4s infinite alternate;
	}
	
	.glow-text-subtle {
		text-shadow: 0 0 10px rgba(239, 68, 68, 0.3);
	}
	
	/* Animaciones para las tarjetas */
	.card-hover {
		position: relative;
		overflow: hidden;
	}
	
	.card-hover::before {
		content: '';
		position: absolute;
		top: -50%;
		left: -50%;
		width: 200%;
		height: 200%;
		background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%);
		opacity: 0;
		transform: scale(0.5);
		transform-origin: center;
		transition: transform 0.6s ease-out, opacity 0.6s ease-out;
		pointer-events: none;
		z-index: 0;
	}
	
	.card-hover:hover::before {
		opacity: 1;
		transform: scale(1);
	}
	
	.number-icon {
		transition: all 0.3s ease;
	}
	
	.card-hover:hover .number-icon {
		transform: scale(1.1) rotate(5deg);
		box-shadow: 0 0 15px rgba(239, 68, 68, 0.5);
	}
	
	/* Animación del botón y flecha */
	.button-arrow {
		position: relative;
		transition: all 0.3s ease;
	}
	
	.button-arrow .arrow {
		display: inline-block;
		transition: transform 0.3s ease;
	}
	
	.button-arrow:hover .arrow {
		transform: translateX(6px);
	}
	
	/* Animación para el icono del robot */
	.robot-icon {
		transition: all 0.3s ease;
	}
	
	button:hover .robot-icon {
		transform: scale(1.2);
		animation: robotWiggle 1s infinite;
	}
	
	/* Animación para el botón principal */
	.shadow-glow {
		box-shadow: 0 0 15px rgba(153, 27, 27, 0.4);
	}
	
	.pulse-animation {
		animation: pulse 2s infinite;
	}
	
	/* Animación para la imagen flotante */
	.hover-float {
		animation: floating 6s ease-in-out infinite;
	}
	
	/* Elementos decorativos flotantes */
	.floating-element {
		position: absolute;
		background: radial-gradient(circle, rgba(153, 27, 27, 0.2) 0%, rgba(153, 27, 27, 0) 70%);
		border-radius: 50%;
		pointer-events: none;
	}
	
	.floating-1 {
		width: 300px;
		height: 300px;
		top: 10%;
		left: 5%;
		animation: floating 15s ease-in-out infinite, glow 6s infinite alternate;
	}
	
	.floating-2 {
		width: 200px;
		height: 200px;
		bottom: 20%;
		right: 10%;
		animation: floating 12s ease-in-out 1s infinite, glow 8s infinite 1s alternate;
	}
	
	.floating-3 {
		width: 150px;
		height: 150px;
		top: 50%;
		right: 25%;
		animation: floating 10s ease-in-out 2s infinite, glow 5s infinite 2s alternate;
	}
	
	/* Partículas de fondo */
	.particles-container {
		background-image: 
			radial-gradient(circle, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
			radial-gradient(circle, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
		background-size: 30px 30px, 15px 15px;
		animation: particleMove 60s linear infinite;
	}
	
	/* CTA Button */
	.cta-button {
		position: relative;
		overflow: hidden;
	}
	
	.cta-button::after {
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
	
	.cta-button:hover::after {
		transform: rotate(45deg) translateY(100%);
	}
	
	/* Animación para la sección Cómo funciona */
	.section-how {
		position: relative;
		overflow: hidden;
	}
	
	@keyframes progressFill {
		0% { stroke-dashoffset: 377; }
		100% { stroke-dashoffset: 94; }
	}
	
	/* Definiciones de animaciones */
	@keyframes colorPulse {
		0% { 
			color: #450a0a; 
			text-shadow: 0 0 10px rgba(239, 68, 68, 0.3);
		}
		50% { 
			color: #7f1d1d; 
			text-shadow: 0 0 15px rgba(239, 68, 68, 0.5), 0 0 25px rgba(239, 68, 68, 0.3);
		}
		100% { 
			color: #450a0a; 
			text-shadow: 0 0 10px rgba(239, 68, 68, 0.3);
		}
	}
	
	@keyframes robotWiggle {
		0%, 100% { transform: rotate(0deg); }
		25% { transform: rotate(-5deg); }
		75% { transform: rotate(5deg); }
	}
	
	@keyframes pulse {
		0% { box-shadow: 0 0 0 0 rgba(153, 27, 27, 0.7); }
		70% { box-shadow: 0 0 0 10px rgba(153, 27, 27, 0); }
		100% { box-shadow: 0 0 0 0 rgba(153, 27, 27, 0); }
	}
	
	@keyframes floating {
		0% { transform: translateY(0) rotate(0deg); }
		50% { transform: translateY(-15px) rotate(2deg); }
		100% { transform: translateY(0) rotate(0deg); }
	}
	
	@keyframes glow {
		0% { opacity: 0.4; }
		100% { opacity: 0.8; }
	}
	
	@keyframes particleMove {
		0% { background-position: 0 0, 0 0; }
		100% { background-position: 1000px 1000px, 500px 500px; }
	}
	
	/* Media queries */	@media (max-width: 430px) {
		section {
			margin-top: 100px;
			gap: 1px;
		}
		
		.floating-element {
			opacity: 0.5;
			scale: 0.7;
		}
	}
	
	.content_guiaIPN {
		margin-top: -100;
		margin-bottom: 50px;
	}
	@keyframes progressFill {
		0% { stroke-dashoffset: 377; }
		100% { stroke-dashoffset: 94; }
	}
</style>
