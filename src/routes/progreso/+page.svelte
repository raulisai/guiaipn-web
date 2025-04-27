<script>
	import { onMount } from 'svelte';
	import { fade, fly, scale } from 'svelte/transition';
	import { elasticOut } from 'svelte/easing';
	
	// Variables para animaciones
	let titleVisible = false;
	let dashboardVisible = false;
	let statsVisible = false;
	let historyVisible = false;
	let recommendationVisible = false;
	
	// Función de utilidad para detectar cuando un elemento es visible en el viewport
	function inView(node, options = {}) {
		const { rootMargin = '0px', threshold = 0 } = options;
		
		const handleIntersection = (entries) => {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					const sectionId = node.dataset.section;
					if (sectionId === 'title') titleVisible = true;
					if (sectionId === 'dashboard') dashboardVisible = true;
					if (sectionId === 'stats') statsVisible = true;
					if (sectionId === 'history') historyVisible = true;
					if (sectionId === 'recommendation') recommendationVisible = true;
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
		// Iniciar la primera animación inmediatamente
		setTimeout(() => {
			titleVisible = true;
		}, 300);
	});
</script>

<section class="min-h-screen w-full py-20 bg-gradient-to-b from-[#030e27] via-[#030e28]/70 to-black/60 backdrop-blur-2xl relative">
	<!-- Elementos decorativos flotantes -->
	<div class="floating-element floating-1"></div>
	<div class="floating-element floating-2"></div>
	<div class="floating-element floating-3"></div>
	
	<div class="container mx-auto px-6 relative z-10">
		<!-- Título de la página -->
		<div class="section-title-container" use:inView={{ rootMargin: '-150px' }} data-section="title">
			{#if titleVisible}
				<h1 
					in:fly={{ y: 50, duration: 800, easing: elasticOut }}
					class="text-5xl font-bold text-white text-center mb-8 glow-text-subtle"
				>
					Mi Progreso
				</h1>
				<p 
					in:fade={{ delay: 200, duration: 800 }}
					class="text-white/80 text-center max-w-3xl mx-auto mb-16 text-lg"
				>
					Visualiza tu <span class="text-red-400">avance personalizado</span> y recibe retroalimentación 
					detallada sobre tus fortalezas y áreas de oportunidad.
				</p>
			{/if}
		</div>
		
		<!-- Panel principal -->
		<div 
			use:inView={{ rootMargin: '-100px' }} 
			data-section="dashboard"
			class="max-w-6xl mx-auto"
		>
			{#if dashboardVisible}
				<div
					in:fly={{ y: 50, duration: 800, delay: 200 }}
					class="bg-blue-card backdrop-blur-sm rounded-xl p-8 shadow-lg shadow-blue-900/20 
					border border-cyan hover:border-red-300/50 progress-card mb-10"
				>
					<!-- Estadísticas generales -->
					<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
						<!-- Tu Avance -->
						<div class="col-span-1 text-center">
							<div class="bg-gradient-to-r from-red-950/50 to-red-800/50 rounded-lg p-6 h-full">
								<h3 class="text-2xl font-bold text-white mb-4">Tu Avance</h3>
								<div class="progress-circle mx-auto">
									<svg width="150" height="150" viewBox="0 0 150 150">
										<circle cx="75" cy="75" r="60" fill="none" stroke="#1e293b" stroke-width="15" />
										<circle 
											cx="75" 
											cy="75" 
											r="60" 
											fill="none" 
											stroke="#7f1d1d" 
											stroke-width="15"
											stroke-dasharray="377"
											stroke-dashoffset="94"
											stroke-linecap="round"
											class="progress-circle-fill"
										/>
										<text x="75" y="75" text-anchor="middle" dominant-baseline="middle" font-size="24" fill="white" font-weight="bold">75%</text>
									</svg>
								</div>
								<p class="text-white/80 mt-4">Completados 6 de 8 exámenes</p>
							</div>
						</div>
						
						<!-- Áreas de fortaleza -->
						<div class="col-span-1 text-center">
							<div class="bg-gradient-to-r from-red-950/50 to-red-800/50 rounded-lg p-6 h-full">
								<h3 class="text-2xl font-bold text-white mb-4">Fortalezas</h3>
								<ul class="text-left text-white/80 space-y-2">
									<li class="flex items-center">
										<span class="text-green-400 mr-2">✓</span> 
										<span>Matemáticas: 85% de aciertos</span>
									</li>
									<li class="flex items-center">
										<span class="text-green-400 mr-2">✓</span> 
										<span>Física: 82% de aciertos</span>
									</li>
									<li class="flex items-center">
										<span class="text-green-400 mr-2">✓</span> 
										<span>Historia de México: 78% de aciertos</span>
									</li>
								</ul>
								<div class="mt-4">
									<a href="/materias" class="text-red-400 hover:text-red-300 font-medium button-arrow">
										Ver detalles <span class="arrow">→</span>
									</a>
								</div>
							</div>
						</div>
						
						<!-- Áreas de oportunidad -->
						<div class="col-span-1 text-center">
							<div class="bg-gradient-to-r from-red-950/50 to-red-800/50 rounded-lg p-6 h-full">
								<h3 class="text-2xl font-bold text-white mb-4">Áreas de mejora</h3>
								<ul class="text-left text-white/80 space-y-2">
									<li class="flex items-center">
										<span class="text-yellow-400 mr-2">!</span> 
										<span>Química: 62% de aciertos</span>
									</li>
									<li class="flex items-center">
										<span class="text-yellow-400 mr-2">!</span> 
										<span>Biología: 65% de aciertos</span>
									</li>
									<li class="flex items-center">
										<span class="text-yellow-400 mr-2">!</span> 
										<span>Literatura: 68% de aciertos</span>
									</li>
								</ul>
								<div class="mt-4">
									<a href="/examen" class="text-red-400 hover:text-red-300 font-medium button-arrow">
										Practicar ahora <span class="arrow">→</span>
									</a>
								</div>
							</div>
						</div>
					</div>
				</div>
			{/if}
		</div>
		
		<!-- Estadísticas Detalladas -->
		<div 
			use:inView={{ rootMargin: '-100px' }} 
			data-section="stats"
			class="max-w-6xl mx-auto"
		>
			{#if statsVisible}
				<div
					in:fly={{ y: 50, duration: 800, delay: 300 }}
					class="bg-blue-card backdrop-blur-sm rounded-xl p-8 shadow-lg shadow-blue-900/20 
					border border-cyan hover:border-red-300/50 progress-card mb-10"
				>
					<h2 class="text-3xl font-bold text-white mb-6">Estadísticas Detalladas</h2>
					
					<div class="grid grid-cols-1 md:grid-cols-2 gap-8">
						<!-- Gráfico de Rendimiento por Materia -->
						<div class="col-span-1">
							<div class="bg-gradient-to-r from-red-950/30 to-red-800/30 rounded-lg p-6">
								<h3 class="text-xl font-bold text-white mb-4">Rendimiento por Materia</h3>
								<div class="performance-chart h-64 bg-black/20 rounded-lg flex items-end justify-around p-4">
									<!-- Barras de gráfico simuladas -->
									<div class="chart-bar">
										<div class="h-[85%] w-10 bg-gradient-to-t from-green-600 to-green-400 rounded-t-lg"></div>
										<span class="text-white/80 text-sm mt-2 block">Mat</span>
									</div>
									<div class="chart-bar">
										<div class="h-[82%] w-10 bg-gradient-to-t from-green-600 to-green-400 rounded-t-lg"></div>
										<span class="text-white/80 text-sm mt-2 block">Fís</span>
									</div>
									<div class="chart-bar">
										<div class="h-[78%] w-10 bg-gradient-to-t from-green-600 to-green-400 rounded-t-lg"></div>
										<span class="text-white/80 text-sm mt-2 block">Hist</span>
									</div>
									<div class="chart-bar">
										<div class="h-[70%] w-10 bg-gradient-to-t from-yellow-600 to-yellow-400 rounded-t-lg"></div>
										<span class="text-white/80 text-sm mt-2 block">Geo</span>
									</div>
									<div class="chart-bar">
										<div class="h-[68%] w-10 bg-gradient-to-t from-yellow-600 to-yellow-400 rounded-t-lg"></div>
										<span class="text-white/80 text-sm mt-2 block">Lit</span>
									</div>
									<div class="chart-bar">
										<div class="h-[65%] w-10 bg-gradient-to-t from-yellow-600 to-yellow-400 rounded-t-lg"></div>
										<span class="text-white/80 text-sm mt-2 block">Bio</span>
									</div>
									<div class="chart-bar">
										<div class="h-[62%] w-10 bg-gradient-to-t from-yellow-600 to-yellow-400 rounded-t-lg"></div>
										<span class="text-white/80 text-sm mt-2 block">Quí</span>
									</div>
								</div>
							</div>
						</div>
						
						<!-- Tiempo de Estudio -->
						<div class="col-span-1">
							<div class="bg-gradient-to-r from-red-950/30 to-red-800/30 rounded-lg p-6">
								<h3 class="text-xl font-bold text-white mb-4">Tiempo de Estudio</h3>
								<div class="study-time-stats space-y-4">
									<div>
										<div class="flex justify-between text-white/80 mb-1">
											<span>Esta semana</span>
											<span>6h 30min</span>
										</div>
										<div class="h-2 bg-black/20 rounded-full overflow-hidden">
											<div class="h-full w-[85%] bg-gradient-to-r from-red-950 to-red-700 rounded-full"></div>
										</div>
									</div>
									<div>
										<div class="flex justify-between text-white/80 mb-1">
											<span>Este mes</span>
											<span>24h 45min</span>
										</div>
										<div class="h-2 bg-black/20 rounded-full overflow-hidden">
											<div class="h-full w-[70%] bg-gradient-to-r from-red-950 to-red-700 rounded-full"></div>
										</div>
									</div>
									<div>
										<div class="flex justify-between text-white/80 mb-1">
											<span>Total</span>
											<span>56h 20min</span>
										</div>
										<div class="h-2 bg-black/20 rounded-full overflow-hidden">
											<div class="h-full w-[60%] bg-gradient-to-r from-red-950 to-red-700 rounded-full"></div>
										</div>
									</div>
									<div class="mt-8">
										<h4 class="text-lg font-semibold text-white mb-2">Días más productivos</h4>
										<div class="day-stats flex justify-between">
											<div class="text-center">
												<div class="day-circle mx-auto mb-1 w-8 h-8 rounded-full flex items-center justify-center bg-red-800/50">L</div>
												<div class="text-xs text-white/80">85%</div>
											</div>
											<div class="text-center">
												<div class="day-circle mx-auto mb-1 w-8 h-8 rounded-full flex items-center justify-center bg-red-800/30">M</div>
												<div class="text-xs text-white/80">60%</div>
											</div>
											<div class="text-center">
												<div class="day-circle mx-auto mb-1 w-8 h-8 rounded-full flex items-center justify-center bg-red-800/70">M</div>
												<div class="text-xs text-white/80">75%</div>
											</div>
											<div class="text-center">
												<div class="day-circle mx-auto mb-1 w-8 h-8 rounded-full flex items-center justify-center bg-red-800/50">J</div>
												<div class="text-xs text-white/80">65%</div>
											</div>
											<div class="text-center">
												<div class="day-circle mx-auto mb-1 w-8 h-8 rounded-full flex items-center justify-center bg-red-800/30">V</div>
												<div class="text-xs text-white/80">45%</div>
											</div>
											<div class="text-center">
												<div class="day-circle mx-auto mb-1 w-8 h-8 rounded-full flex items-center justify-center bg-red-800/90">S</div>
												<div class="text-xs text-white/80">90%</div>
											</div>
											<div class="text-center">
												<div class="day-circle mx-auto mb-1 w-8 h-8 rounded-full flex items-center justify-center bg-red-800/80">D</div>
												<div class="text-xs text-white/80">80%</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			{/if}
		</div>
		
		<!-- Historial de exámenes -->
		<div 
			use:inView={{ rootMargin: '-100px' }} 
			data-section="history"
			class="max-w-6xl mx-auto"
		>
			{#if historyVisible}
				<div
					in:fly={{ y: 50, duration: 800, delay: 400 }}
					class="bg-blue-card backdrop-blur-sm rounded-xl p-8 shadow-lg shadow-blue-900/20 
					border border-cyan hover:border-red-300/50 progress-card mb-10"
				>
					<h2 class="text-3xl font-bold text-white mb-6">Historial de Exámenes</h2>
					
					<div class="overflow-x-auto">
						<table class="w-full text-white/90">
							<thead>
								<tr class="border-b border-white/20">
									<th class="py-3 px-4 text-left">Fecha</th>
									<th class="py-3 px-4 text-left">Tipo</th>
									<th class="py-3 px-4 text-left">Calificación</th>
									<th class="py-3 px-4 text-left">Tiempo</th>
									<th class="py-3 px-4 text-left">Acciones</th>
								</tr>
							</thead>
							<tbody>
								<tr class="border-b border-white/10 hover:bg-white/5 transition-colors">
									<td class="py-3 px-4">24/04/2025</td>
									<td class="py-3 px-4">Examen completo</td>
									<td class="py-3 px-4">85/100</td>
									<td class="py-3 px-4">1h 45min</td>
									<td class="py-3 px-4">
										<a href="/examen/resultados/123" class="text-red-400 hover:text-red-300">Ver detalles</a>
									</td>
								</tr>
								<tr class="border-b border-white/10 hover:bg-white/5 transition-colors">
									<td class="py-3 px-4">20/04/2025</td>
									<td class="py-3 px-4">Matemáticas</td>
									<td class="py-3 px-4">78/100</td>
									<td class="py-3 px-4">45min</td>
									<td class="py-3 px-4">
										<a href="/examen/resultados/122" class="text-red-400 hover:text-red-300">Ver detalles</a>
									</td>
								</tr>
								<tr class="border-b border-white/10 hover:bg-white/5 transition-colors">
									<td class="py-3 px-4">15/04/2025</td>
									<td class="py-3 px-4">Física</td>
									<td class="py-3 px-4">90/100</td>
									<td class="py-3 px-4">40min</td>
									<td class="py-3 px-4">
										<a href="/examen/resultados/121" class="text-red-400 hover:text-red-300">Ver detalles</a>
									</td>
								</tr>
								<tr class="border-b border-white/10 hover:bg-white/5 transition-colors">
									<td class="py-3 px-4">10/04/2025</td>
									<td class="py-3 px-4">Química</td>
									<td class="py-3 px-4">62/100</td>
									<td class="py-3 px-4">50min</td>
									<td class="py-3 px-4">
										<a href="/examen/resultados/120" class="text-red-400 hover:text-red-300">Ver detalles</a>
									</td>
								</tr>
								<tr class="border-b border-white/10 hover:bg-white/5 transition-colors">
									<td class="py-3 px-4">05/04/2025</td>
									<td class="py-3 px-4">Historia</td>
									<td class="py-3 px-4">78/100</td>
									<td class="py-3 px-4">55min</td>
									<td class="py-3 px-4">
										<a href="/examen/resultados/119" class="text-red-400 hover:text-red-300">Ver detalles</a>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					
					<div class="mt-6 flex justify-center">
						<button class="bg-gradient-to-r from-red-950 to-red-800 rounded-lg px-4 py-2 text-white font-medium hover:from-red-800 hover:to-red-700 transition-all duration-300">
							Ver historial completo
						</button>
					</div>
				</div>
			{/if}
		</div>
		
		<!-- Recomendación personalizada -->
		<div 
			use:inView={{ rootMargin: '-100px' }} 
			data-section="recommendation"
			class="max-w-6xl mx-auto"
		>
			{#if recommendationVisible}
				<div
					in:fly={{ y: 50, duration: 800, delay: 500 }}
					class="bg-blue-card backdrop-blur-sm rounded-xl p-8 shadow-lg shadow-blue-900/20 
					border border-cyan hover:border-red-300/50 progress-card mb-10"
				>
					<h2 class="text-3xl font-bold text-white mb-6">Plan Personalizado</h2>
					
					<div class="p-6 border border-red-900/30 rounded-lg bg-red-900/10">
						<h3 class="text-xl font-bold text-white mb-4 flex items-center">
							<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
								<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
							</svg>
							Recomendación de IA
						</h3>
						<p class="text-white/80 mb-4">
							Basado en tu desempeño, te recomendamos enfocarte en mejorar tus conocimientos en <strong>Química</strong>, 
							especialmente en los temas de estequiometría y química orgánica. También te sugerimos dedicar más tiempo a <strong>Biología</strong>, 
							particularmente en los temas de genética y evolución.
						</p>
						<p class="text-white/80 mb-4">
							Hemos preparado una serie de ejercicios personalizados y recursos de estudio para ayudarte a mejorar 
							en estas áreas específicas. Recomendamos que dediques al menos 2 horas adicionales por semana a estos temas.
						</p>
						
						<div class="mt-6">
							<h4 class="text-lg font-semibold text-white mb-3">Plan de estudio recomendado:</h4>
							<ul class="space-y-3 text-white/80">
								<li class="flex items-start">
									<span class="text-red-400 mr-2">1.</span> 
									<div>
										<strong>Lunes:</strong> Repaso de conceptos básicos de Química (1 hora) - 
										<a href="/materias/quimica/basicos" class="text-red-400 hover:text-red-300">Ver material</a>
									</div>
								</li>
								<li class="flex items-start">
									<span class="text-red-400 mr-2">2.</span> 
									<div>
										<strong>Miércoles:</strong> Práctica de ejercicios de estequiometría (1 hora) - 
										<a href="/materias/quimica/estequiometria" class="text-red-400 hover:text-red-300">Ver ejercicios</a>
									</div>
								</li>
								<li class="flex items-start">
									<span class="text-red-400 mr-2">3.</span> 
									<div>
										<strong>Viernes:</strong> Introducción a la genética en Biología (1 hora) - 
										<a href="/materias/biologia/genetica" class="text-red-400 hover:text-red-300">Ver lección</a>
									</div>
								</li>
								<li class="flex items-start">
									<span class="text-red-400 mr-2">4.</span> 
									<div>
										<strong>Sábado:</strong> Examen de práctica combinado de Química y Biología - 
										<a href="/examen/practica/quimica-biologia" class="text-red-400 hover:text-red-300">Iniciar examen</a>
									</div>
								</li>
							</ul>
						</div>
						
						<div class="mt-8 text-center">
							<a 
								href="/materias/quimica" 
								class="inline-block px-6 py-2 bg-gradient-to-r from-red-950 to-red-800 rounded-lg text-white 
								hover:from-red-800 hover:to-red-700 transition-all duration-300 mr-4"
							>
								Ver plan completo
							</a>
							<a 
								href="/examen/practica/personalizado" 
								class="inline-block px-6 py-2 bg-gradient-to-r from-red-950 to-red-800 rounded-lg text-white 
								hover:from-red-800 hover:to-red-700 transition-all duration-300"
							>
								Iniciar práctica personalizada
							</a>
						</div>
					</div>
				</div>
			{/if}
		</div>
		
		<!-- Botón para comenzar nuevo examen -->
		<div class="mt-16 text-center">
			<a 
				href="/examen" 
				class="inline-block px-8 py-3 bg-gradient-to-r from-red-950 to-red-800 rounded-lg text-white 
				font-bold hover:from-red-800 hover:to-red-700 transition-all duration-300 shadow-xl
				hover:shadow-red-900/30 hover:scale-105 cta-button"
			>
				Comenzar nuevo examen
			</a>
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
	.glow-text-subtle {
		text-shadow: 0 0 10px rgba(239, 68, 68, 0.3);
	}
	
	/* Animaciones para las tarjetas */
	.progress-card {
		transition: all 0.3s ease;
	}
	
	.progress-card:hover {
		box-shadow: 0 5px 30px rgba(153, 27, 27, 0.2);
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
	
	/* Animación del gráfico de progreso */
	.progress-circle-fill {
		animation: progressFill 2s ease-out forwards;
	}
	
	.chart-bar div {
		animation: barGrow 1.5s ease-out forwards;
		transform-origin: bottom;
		transform: scaleY(0);
	}
	
	@keyframes barGrow {
		0% { transform: scaleY(0); }
		100% { transform: scaleY(1); }
	}
	
	@keyframes progressFill {
		0% { stroke-dashoffset: 377; }
		100% { stroke-dashoffset: 94; }
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
	
	/* Media queries */
	@media (max-width: 430px) {
		.floating-element {
			opacity: 0.5;
			scale: 0.7;
		}
	}
</style>
