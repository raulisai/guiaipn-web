<script>
	import { onMount } from 'svelte';
	import { fade, fly, scale } from 'svelte/transition';
	import { elasticOut, backOut, quintOut } from 'svelte/easing';
	import { user } from '$lib/stores/authStore';
	import { goto } from '$app/navigation';
	import Footer from '$lib/components/footer.svelte';

	// Variables de estado
	let visible = $state(false);
	let heroVisible = $state(false);
	let buttonVisible = $state(false);
	let currentUser = $state(null);

	// Variables para secciones con scroll
	let section1Visible = $state(false);
	let section2Visible = $state(false);
	let section3Visible = $state(false);
	let section4Visible = $state(false);
	let section5Visible = $state(false);
	let ctaVisible = $state(false);

	// Carrusel de imágenes para sección 4
	let currentImageIndex = $state(0);
	const carouselImages = [
		{ src: '/history-IA.png', alt: 'Historial con IA' },
		{ src: '/lufy-animate.png', alt: 'Asistente Lufy' }
	];

	// Función de utilidad para detectar cuando un elemento es visible en el viewport
	function inView(node, options = {}) {
		const { rootMargin = '0px', threshold = 0.2 } = options;

		const handleIntersection = (entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					const sectionId = node.dataset.section;
					if (sectionId === 'section1') section1Visible = true;
					if (sectionId === 'section2') section2Visible = true;
					if (sectionId === 'section3') section3Visible = true;
					if (sectionId === 'section4') section4Visible = true;
					if (sectionId === 'section5') section5Visible = true;
					if (sectionId === 'cta') ctaVisible = true;
				}
			});
		};

		const observer = new IntersectionObserver(handleIntersection, { rootMargin, threshold });
		observer.observe(node);

		return {
			destroy() {
				observer.disconnect();
			}
		};
	}

	// Redirigir a /home si el usuario está autenticado
	$effect(() => {
		if ($user) {
			goto('/home');
		}
	});

	onMount(() => {
		setTimeout(() => {
			visible = true;
			setTimeout(() => (heroVisible = true), 200);
			setTimeout(() => (buttonVisible = true), 600);
		}, 300);

		const unsubscribe = user.subscribe((value) => {
			currentUser = value;
		});

		// Carrusel automático cada 4 segundos
		const carouselInterval = setInterval(() => {
			currentImageIndex = (currentImageIndex + 1) % carouselImages.length;
		}, 4000);

		return () => {
			unsubscribe();
			clearInterval(carouselInterval);
		};
	});
</script>

<!-- Hero Section -->
<section
	class="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#171717] via-[#1f1f1f] to-[#171717]"
>
	<!-- Animated background -->
	<div class="absolute inset-0 overflow-hidden">
		<div class="stars"></div>
		<div class="gradient-orb orb-1"></div>
		<div class="gradient-orb orb-2"></div>
	</div>

	<div class="container mx-auto px-6 py-20 relative z-10">
		<div class="flex flex-col md:flex-row items-center justify-between gap-12">
			<!-- Text Content -->
			<div class="flex-1 text-center md:text-left">
				{#if visible}
					<h1
						in:fly={{ y: 30, duration: 800, easing: quintOut }}
						class="text-5xl md:text-7xl font-bold text-white mb-6"
					>
						Ingresa al
						{#if heroVisible}
							<span
								in:scale={{ duration: 600, delay: 200 }}
								class="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 mt-2"
							>
								IPN
							</span>
						{/if}
					</h1>

					<p
						in:fade={{ delay: 400, duration: 600 }}
						class="text-lg md:text-xl text-white/70 mb-8 max-w-2xl"
					>
						Prepárate para el examen de admisión con
						<span class="text-cyan-400 font-semibold">inteligencia artificial</span>
						que se adapta a tu ritmo de aprendizaje
					</p>

					{#if buttonVisible}
						<a
							href="/examen"
							in:scale={{ duration: 400, delay: 600 }}
							class="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600
							rounded-full text-white font-semibold hover:shadow-lg hover:shadow-purple-500/50
							transition-all duration-300 hover:scale-105 group"
						>
							<span>Comenzar ahora</span>
							<svg
								class="w-5 h-5 group-hover:translate-x-1 transition-transform"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M13 7l5 5m0 0l-5 5m5-5H6"
								/>
							</svg>
						</a>
					{/if}
				{/if}
			</div>

			<!-- Image -->
			<div class="flex-1 flex justify-center">
				{#if heroVisible}
					<img
						in:fly={{ x: 50, duration: 800, delay: 300 }}
						src="/logoipnGuia.png"
						alt="IPN"
						class="w-full max-w-md floating"
					/>
				{/if}
			</div>
		</div>
	</div>
</section>

<!-- Section 1: Exámenes con IA (Left Image, Right Text) -->
<section
	use:inView
	data-section="section1"
	class="relative py-24 bg-gradient-to-b from-[#171717] to-[#171717] overflow-hidden"
>
	<div class="container mx-auto px-6">
		<div class="flex flex-col md:flex-row items-center gap-16">
			<!-- Image Left -->
			<div class="flex-1">
				{#if section1Visible}
					<div in:fly={{ x: -50, duration: 800, easing: quintOut }}>
						<img
							src="/examen.png"
							alt="Examen con IA"
							class="rounded-2xl shadow-2xl shadow-cyan-500/20 border border-cyan-500/20"
						/>
					</div>
				{/if}
			</div>

			<!-- Text Right -->
			<div class="flex-1">
				{#if section1Visible}
					<div in:fly={{ x: 50, duration: 800, delay: 200, easing: quintOut }}>
						<div
							class="inline-block px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full mb-6"
						>
							<span class="text-cyan-400 text-sm font-semibold">🤖 Powered by AI</span>
						</div>

						<h2 class="text-4xl md:text-5xl font-bold text-white mb-6">
							Exámenes inteligentes que se adaptan a ti
						</h2>

						<p class="text-white/70 text-lg mb-6">
							Nuestra IA analiza tus respuestas en tiempo real y ajusta la dificultad de las
							preguntas para maximizar tu aprendizaje. Cada examen es único y personalizado.
						</p>

						<ul class="space-y-4">
							<li class="flex items-start gap-3">
								<div
									class="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-1"
								>
									<svg class="w-4 h-4 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
										<path
											fill-rule="evenodd"
											d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
											clip-rule="evenodd"
										/>
									</svg>
								</div>
								<span class="text-white/80">Preguntas adaptativas según tu nivel</span>
							</li>
							<li class="flex items-start gap-3">
								<div
									class="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-1"
								>
									<svg class="w-4 h-4 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
										<path
											fill-rule="evenodd"
											d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
											clip-rule="evenodd"
										/>
									</svg>
								</div>
								<span class="text-white/80">Retroalimentación instantánea</span>
							</li>
							<li class="flex items-start gap-3">
								<div
									class="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-1"
								>
									<svg class="w-4 h-4 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
										<path
											fill-rule="evenodd"
											d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
											clip-rule="evenodd"
										/>
									</svg>
								</div>
								<span class="text-white/80">Simulación del examen real del IPN</span>
							</li>
						</ul>
					</div>
				{/if}
			</div>
		</div>
	</div>
</section>

<!-- Section 2: Explicaciones con IA (Right Image, Left Text) -->
<section
	use:inView
	data-section="section2"
	class="relative py-24 bg-gradient-to-b from-[#171717] to-[#171717] overflow-hidden"
>
	<div class="gradient-orb orb-3"></div>

	<div class="container mx-auto px-6">
		<div class="flex flex-col md:flex-row-reverse items-center gap-16">
			<!-- Image Right -->
			<div class="flex-1">
				{#if section2Visible}
					<div in:fly={{ x: 50, duration: 800, easing: quintOut }}>
						<img
							src="/pizarron.png"
							alt="Explicaciones con IA"
							class="rounded-2xl shadow-2xl shadow-purple-500/20 border border-purple-500/20"
						/>
					</div>
				{/if}
			</div>

			<!-- Text Left -->
			<div class="flex-1">
				{#if section2Visible}
					<div in:fly={{ x: -50, duration: 800, delay: 200, easing: quintOut }}>
						<div
							class="inline-block px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full mb-6"
						>
							<span class="text-purple-400 text-sm font-semibold">✨ IA Explicativa</span>
						</div>

						<h2 class="text-4xl md:text-5xl font-bold text-white mb-6">
							Explicaciones paso a paso con visualizaciones
						</h2>

						<p class="text-white/70 text-lg mb-6">
							Cuando fallas una pregunta, nuestra IA te explica el concepto de forma clara y visual.
							Como tener un profesor personal disponible 24/7.
						</p>

						<ul class="space-y-4">
							<li class="flex items-start gap-3">
								<div
									class="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-1"
								>
									<svg class="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
										<path
											fill-rule="evenodd"
											d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
											clip-rule="evenodd"
										/>
									</svg>
								</div>
								<span class="text-white/80">Pizarrón interactivo con gráficas y ecuaciones</span>
							</li>
							<li class="flex items-start gap-3">
								<div
									class="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-1"
								>
									<svg class="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
										<path
											fill-rule="evenodd"
											d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
											clip-rule="evenodd"
										/>
									</svg>
								</div>
								<span class="text-white/80">Explicaciones con voz y texto sincronizado</span>
							</li>
							<li class="flex items-start gap-3">
								<div
									class="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-1"
								>
									<svg class="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
										<path
											fill-rule="evenodd"
											d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
											clip-rule="evenodd"
										/>
									</svg>
								</div>
								<span class="text-white/80">Haz preguntas de seguimiento en tiempo real</span>
							</li>
						</ul>
					</div>
				{/if}
			</div>
		</div>
	</div>
</section>

<!-- Section 3: Progreso personalizado (Left Image, Right Text) -->
<section
	use:inView
	data-section="section3"
	class="relative py-24 bg-gradient-to-b from-[#171717] to-[#171717] overflow-hidden"
>
	<div class="container mx-auto px-6">
		<div class="flex flex-col md:flex-row items-center gap-16">
			<!-- Image Left -->
			<div class="flex-1">
				{#if section3Visible}
					<div in:fly={{ x: -50, duration: 800, easing: quintOut }}>
						<img
							src="/home.png"
							alt="Dashboard de progreso"
							class="rounded-2xl shadow-2xl shadow-cyan-500/20 border border-cyan-500/20"
						/>
					</div>
				{/if}
			</div>

			<!-- Text Right -->
			<div class="flex-1">
				{#if section3Visible}
					<div in:fly={{ x: 50, duration: 800, delay: 200, easing: quintOut }}>
						<div
							class="inline-block px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full mb-6"
						>
							<span class="text-cyan-400 text-sm font-semibold">📊 Analytics</span>
						</div>

						<h2 class="text-4xl md:text-5xl font-bold text-white mb-6">
							Visualiza tu progreso en tiempo real
						</h2>

						<p class="text-white/70 text-lg mb-6">
							Dashboard personalizado que muestra tu desempeño por materia, identifica áreas de
							mejora y te recomienda qué estudiar a continuación.
						</p>

						<ul class="space-y-4">
							<li class="flex items-start gap-3">
								<div
									class="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-1"
								>
									<svg class="w-4 h-4 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
										<path
											fill-rule="evenodd"
											d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
											clip-rule="evenodd"
										/>
									</svg>
								</div>
								<span class="text-white/80">Gráficas de desempeño por materia</span>
							</li>
							<li class="flex items-start gap-3">
								<div
									class="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-1"
								>
									<svg class="w-4 h-4 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
										<path
											fill-rule="evenodd"
											d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
											clip-rule="evenodd"
										/>
									</svg>
								</div>
								<span class="text-white/80">Recomendaciones personalizadas de estudio</span>
							</li>
							<li class="flex items-start gap-3">
								<div
									class="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-1"
								>
									<svg class="w-4 h-4 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
										<path
											fill-rule="evenodd"
											d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
											clip-rule="evenodd"
										/>
									</svg>
								</div>
								<span class="text-white/80">Historial completo de exámenes</span>
							</li>
						</ul>
					</div>
				{/if}
			</div>
		</div>
	</div>
</section>

<!-- Section 4: Asistente IA (Right Image, Left Text) -->
<section
	use:inView
	data-section="section4"
	class="relative py-24 bg-gradient-to-b from-[#171717] to-[#171717] overflow-hidden"
>
	<div class="gradient-orb orb-4"></div>

	<div class="container mx-auto px-6">
		<div class="flex flex-col md:flex-row-reverse items-center gap-16">
			<!-- Image Right - Carrusel -->
			<div class="flex-1 relative">
				{#if section4Visible}
					<div in:fly={{ x: 50, duration: 800, easing: quintOut }} class="relative">
						<!-- Carrusel de imágenes -->
						<div class="relative overflow-hidden rounded-2xl">
							{#each carouselImages as image, index}
								<img
									src={image.src}
									alt={image.alt}
									class="rounded-2xl shadow-2xl shadow-purple-500/20 border border-purple-500/20 transition-all duration-700 ease-in-out"
									class:opacity-100={currentImageIndex === index}
									class:opacity-0={currentImageIndex !== index}
									class:absolute={currentImageIndex !== index}
									class:inset-0={currentImageIndex !== index}
								/>
							{/each}
						</div>

						<!-- Indicadores del carrusel -->
						<div class="flex justify-center gap-2 mt-6">
							{#each carouselImages as _, index}
								<button
									onclick={() => (currentImageIndex = index)}
									class="w-2 h-2 rounded-full transition-all duration-300 {currentImageIndex ===
									index
										? 'bg-purple-400 w-8'
										: 'bg-purple-400/30'}"
									aria-label={`Ir a imagen ${index + 1}`}
								></button>
							{/each}
						</div>
					</div>
				{/if}
			</div>

			<!-- Text Left -->
			<div class="flex-1">
				{#if section4Visible}
					<div in:fly={{ x: -50, duration: 800, delay: 200, easing: quintOut }}>
						<div
							class="inline-block px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full mb-6"
						>
							<span class="text-purple-400 text-sm font-semibold">🎓 Asistente Virtual</span>
						</div>

						<h2 class="text-4xl md:text-5xl font-bold text-white mb-6">
							Tu profesor personal de IA
						</h2>

						<p class="text-white/70 text-lg mb-6">
							Un asistente inteligente que te guía en cada paso del camino, responde tus dudas y te
							motiva a seguir aprendiendo.
						</p>

						<ul class="space-y-4">
							<li class="flex items-start gap-3">
								<div
									class="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-1"
								>
									<svg class="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
										<path
											fill-rule="evenodd"
											d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
											clip-rule="evenodd"
										/>
									</svg>
								</div>
								<span class="text-white/80">Disponible 24/7 para resolver tus dudas</span>
							</li>
							<li class="flex items-start gap-3">
								<div
									class="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-1"
								>
									<svg class="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
										<path
											fill-rule="evenodd"
											d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
											clip-rule="evenodd"
										/>
									</svg>
								</div>
								<span class="text-white/80">Explicaciones adaptadas a tu estilo de aprendizaje</span
								>
							</li>
							<li class="flex items-start gap-3">
								<div
									class="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-1"
								>
									<svg class="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
										<path
											fill-rule="evenodd"
											d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
											clip-rule="evenodd"
										/>
									</svg>
								</div>
								<span class="text-white/80">Motivación y consejos personalizados</span>
							</li>
						</ul>
					</div>
				{/if}
			</div>
		</div>
	</div>
</section>

<!-- CTA Final -->
<section
	use:inView
	data-section="cta"
	class="relative py-24 bg-gradient-to-b from-[#171717] to-[#171717] overflow-hidden"
>
	<div class="container mx-auto px-6 text-center">
		{#if ctaVisible}
			<div in:fly={{ y: 30, duration: 800, easing: quintOut }}>
				<h2 class="text-4xl md:text-5xl font-bold text-white mb-6">¿Listo para ingresar al IPN?</h2>
				<p class="text-white/70 text-lg mb-8 max-w-2xl mx-auto">
					Únete a miles de estudiantes que ya están preparándose con nuestra plataforma impulsada
					por IA
				</p>
				<a
					href="/cuenta/login"
					class="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600
					rounded-full text-white font-semibold hover:shadow-lg hover:shadow-purple-500/50
					transition-all duration-300 hover:scale-105"
				>
					<span>Comenzar gratis</span>
					<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M13 7l5 5m0 0l-5 5m5-5H6"
						/>
					</svg>
				</a>
			</div>
		{/if}
	</div>
</section>

<Footer />

<style>
	/* Animación de estrellas de fondo */
	.stars {
		position: absolute;
		width: 100%;
		height: 100%;
		background-image:
			radial-gradient(2px 2px at 20px 30px, rgba(255, 255, 255, 0.3), transparent),
			radial-gradient(2px 2px at 60px 70px, rgba(255, 255, 255, 0.2), transparent),
			radial-gradient(1px 1px at 50px 50px, rgba(255, 255, 255, 0.4), transparent),
			radial-gradient(1px 1px at 130px 80px, rgba(255, 255, 255, 0.3), transparent),
			radial-gradient(2px 2px at 90px 10px, rgba(255, 255, 255, 0.2), transparent);
		background-size: 200px 200px;
		background-position:
			0 0,
			40px 60px,
			130px 270px,
			70px 100px,
			150px 50px;
		animation: twinkle 3s ease-in-out infinite;
	}

	/* Orbes de gradiente flotantes */
	.gradient-orb {
		position: absolute;
		border-radius: 50%;
		filter: blur(80px);
		opacity: 0.3;
		animation: float 20s ease-in-out infinite;
		pointer-events: none;
	}

	.orb-1 {
		width: 500px;
		height: 500px;
		background: radial-gradient(circle, rgba(6, 182, 212, 0.4) 0%, transparent 70%);
		top: -10%;
		left: -10%;
		animation-delay: 0s;
	}

	.orb-2 {
		width: 400px;
		height: 400px;
		background: radial-gradient(circle, rgba(168, 85, 247, 0.4) 0%, transparent 70%);
		bottom: -10%;
		right: -10%;
		animation-delay: 5s;
	}

	.orb-3 {
		width: 350px;
		height: 350px;
		background: radial-gradient(circle, rgba(147, 51, 234, 0.3) 0%, transparent 70%);
		top: 20%;
		right: 10%;
		animation-delay: 3s;
	}

	.orb-4 {
		width: 450px;
		height: 450px;
		background: radial-gradient(circle, rgba(6, 182, 212, 0.3) 0%, transparent 70%);
		bottom: 30%;
		left: 5%;
		animation-delay: 7s;
	}

	/* Animación flotante suave */
	.floating {
		animation: floating 6s ease-in-out infinite;
	}

	/* Animaciones */
	@keyframes twinkle {
		0%,
		100% {
			opacity: 0.3;
		}
		50% {
			opacity: 0.6;
		}
	}

	@keyframes float {
		0%,
		100% {
			transform: translate(0, 0) scale(1);
		}
		33% {
			transform: translate(30px, -30px) scale(1.1);
		}
		66% {
			transform: translate(-20px, 20px) scale(0.9);
		}
	}

	@keyframes floating {
		0%,
		100% {
			transform: translateY(0px);
		}
		50% {
			transform: translateY(-20px);
		}
	}

	/* Responsive */
	@media (max-width: 768px) {
		.gradient-orb {
			filter: blur(60px);
		}

		.orb-1,
		.orb-2,
		.orb-3,
		.orb-4 {
			width: 300px;
			height: 300px;
		}
	}
</style>
