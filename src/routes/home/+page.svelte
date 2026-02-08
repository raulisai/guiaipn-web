<script>
	import { onMount } from 'svelte';
	import { user } from '$lib/stores/authStore';
	import { goto } from '$app/navigation';
	import { fade, fly } from 'svelte/transition';

	import BackgroundStats3D from './components/BackgroundStats3D.svelte';

	// Configuración de años disponibles (simulado o real según filtro de texto)
	const examYears = [
		{ year: '2025', active: true, label: 'Nuevo' },
		{ year: '2024', active: true, label: '' },
		{ year: '2023', active: true, label: '' }
	];

	function startExam(year = '', questions = 10) {
		const params = new URLSearchParams();

		if (year) {
			params.set('subject', year); // El filtro busca "2024", "2025" en el ID/Texto
			// Exámenes por año suelen ser más completos, ponemos 20 por defecto o lo que se desee
			params.set('questions', '20');
		} else {
			// Recomendación rápida
			params.set('questions', questions.toString());
		}

		goto(`/examen?${params.toString()}`);
	}

	onMount(() => {
		if (!$user) {
			setTimeout(() => {
				goto('/cuenta/login');
			}, 100);
		}
	});
</script>

<section
	class="min-h-[100dvh] w-full flex flex-col items-center justify-center py-6 md:py-12 px-4 relative bg-[#030e27] overflow-hidden"
>
	<!-- Background Effects -->
	<div class="absolute inset-0 z-0 overflow-hidden pointer-events-none">
		<div
			class="absolute top-0 -left-20 w-64 h-64 md:w-96 md:h-96 bg-blue-600/20 rounded-full blur-[80px] md:blur-[128px]"
		></div>
		<div
			class="absolute bottom-0 -right-20 w-64 h-64 md:w-96 md:h-96 bg-purple-600/20 rounded-full blur-[80px] md:blur-[128px]"
		></div>

		<!-- 3D Stats Component -->
		<BackgroundStats3D />

		<div class="particles-container absolute inset-0 opacity-30"></div>
	</div>

	<div class="relative z-10 w-full max-w-5xl mx-auto space-y-8 md:space-y-16">
		<!-- Header Section -->
		<div class="text-center space-y-2 md:space-y-4" in:fade={{ duration: 1000, delay: 200 }}>
			<h1
				class="text-4xl sm:text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-white to-purple-300 tracking-tighter pb-2 drop-shadow-sm"
			>
				SIMULADOR
			</h1>
			<p
				class="text-blue-200/60 text-sm md:text-lg max-w-2xl mx-auto font-light px-2 tracking-widest uppercase"
			>
				Prepárate &bull; Practica &bull; Aprueba
			</p>
		</div>

		<!-- Main Actions Grid -->
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8 items-stretch perspective-1000">
			<!-- Year Selection Column -->
			<div class="space-y-4 md:space-y-6" in:fly={{ y: 50, duration: 1000, delay: 400 }}>
				<div class="flex items-center gap-3 text-blue-200/80 mb-1 md:mb-2 px-1">
					<div
						class="p-1.5 md:p-2 bg-blue-500/10 rounded-lg backdrop-blur-md border border-blue-500/10"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="w-5 h-5 md:w-6 md:h-6 text-blue-400"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
							/>
						</svg>
					</div>
					<h2 class="text-lg md:text-xl font-semibold tracking-wide">EDICIONES ANTERIORES</h2>
				</div>

				<div class="grid grid-cols-3 lg:grid-cols-3 gap-2 md:gap-4">
					{#each examYears as { year, active, label }, i}
						<button
							onclick={() => startExam(year)}
							class="group relative overflow-hidden bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-400/50 p-3 md:p-6 rounded-xl transition-all duration-300 text-left hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] active:scale-95 backdrop-blur-[2px]"
							in:fly={{ y: 20, duration: 600, delay: 600 + i * 150 }}
						>
							<!-- Folder/Exam Tab Effect -->
							<div
								class="absolute top-0 right-0 w-8 h-8 bg-white/5 -mr-4 -mt-4 rotate-45 transform group-hover:bg-blue-500/20 transition-colors"
							></div>

							<div
								class="absolute inset-0 bg-gradient-to-b from-blue-500/0 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
							></div>

							{#if label}
								<span
									class="absolute top-0 right-0 m-2 text-[8px] md:text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 shadow-[0_0_10px_rgba(59,130,246,0.5)] animate-pulse"
								>
									{label}
								</span>
							{/if}

							<div
								class="relative z-10 flex flex-col items-center md:items-start text-center md:text-left pt-2"
							>
								<span
									class="block text-blue-300/50 text-[9px] md:text-[10px] font-bold uppercase tracking-widest mb-1"
									>VERSIÓN</span
								>
								<span
									class="block text-xl md:text-3xl font-black text-white group-hover:text-blue-300 transition-colors drop-shadow-md"
									>{year}</span
								>
							</div>
						</button>
					{/each}
				</div>
			</div>

			<!-- Quick Recommendation Column -->
			<div
				class="relative group mt-2 md:mt-0 perspective-1000"
				in:fly={{ y: 50, duration: 1000, delay: 800 }}
			>
				<div
					class="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl md:rounded-3xl blur-xl opacity-30 group-hover:opacity-60 transition duration-500 group-hover:duration-200"
				></div>

				<button
					onclick={() => startExam('', 10)}
					class="relative h-full w-full bg-slate-900/40 backdrop-blur-md border border-white/10 p-5 md:p-8 rounded-2xl flex flex-row lg:flex-col justify-between lg:justify-center items-center text-left lg:text-center gap-4 md:gap-6 overflow-hidden hover:bg-slate-800/50 transition-all duration-300 active:scale-[0.98] group hover:border-white/20 hover:shadow-[0_0_40px_rgba(168,85,247,0.15)]"
				>
					<!-- Exam Paper Lines Effect -->
					<div
						class="absolute inset-0 opacity-[0.03] pointer-events-none"
						style="background-image: linear-gradient(#fff 1px, transparent 1px); background-size: 100% 2rem;"
					></div>

					<!-- Decoración de fondo -->
					<div
						class="absolute top-0 right-0 p-24 bg-purple-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none hidden md:block group-hover:bg-purple-500/20 transition-colors duration-500"
					></div>

					<div
						class="shrink-0 p-3 md:p-5 bg-gradient-to-br from-white/10 to-white/5 rounded-2xl group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 border border-white/10 shadow-lg backdrop-blur-xl"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="w-8 h-8 md:w-16 md:h-16 text-purple-300"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="1.5"
								d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
							/>
						</svg>
					</div>

					<div class="space-y-1 md:space-y-3 flex-1 relative z-10">
						<h2
							class="text-lg md:text-3xl font-black text-white group-hover:text-purple-300 transition-colors tracking-tight"
						>
							TEST RÁPIDO
						</h2>
						<p
							class="text-slate-300/80 text-xs md:text-sm leading-relaxed hidden sm:block font-medium"
						>
							Generamos un examen <span class="text-purple-300">inteligente</span> de 10 preguntas.
						</p>
						<p class="text-slate-300/80 text-xs leading-relaxed sm:hidden font-medium">
							Prueba de <span class="text-purple-300">10 preguntas</span> personalizadas.
						</p>
					</div>

					<div
						class="shrink-0 px-5 py-2 md:px-10 md:py-4 bg-gradient-to-r from-purple-600/80 to-pink-600/80 hover:from-purple-500 hover:to-pink-500 rounded-xl text-white font-bold text-xs md:text-sm transition-all shadow-lg hover:shadow-purple-500/30 flex items-center justify-center gap-2 tracking-wide backdrop-blur-sm"
					>
						<span class="hidden sm:inline">INICIAR AHORA</span>
						<span class="sm:hidden">START</span>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="w-3 h-3 md:w-4 md:h-4"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2.5"
								d="M13 7l5 5m0 0l-5 5m5-5H6"
							/>
						</svg>
					</div>
				</button>
			</div>
		</div>

		<!-- Footer / Additional Info -->
		<div
			class="text-center pt-4 md:pt-8 border-t border-white/5"
			in:fade={{ duration: 1000, delay: 1000 }}
		>
			<div
				class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/5 backdrop-blur-sm"
			>
				<span class="relative flex h-2 w-2">
					<span
						class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"
					></span>
					<span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
				</span>
				<p class="text-slate-400 text-[10px] md:text-xs font-medium tracking-wider uppercase">
					Sistema Online &bull; v2.0.5
				</p>
			</div>
		</div>
	</div>
</section>

<style>
	/* Background Particles Animation */
	.particles-container {
		background-image:
			radial-gradient(circle at 10% 20%, rgba(59, 130, 246, 0.05) 0%, transparent 40%),
			radial-gradient(circle at 90% 80%, rgba(236, 72, 153, 0.05) 0%, transparent 40%);
		animation: pulse 10s ease-in-out infinite alternate;
	}

	@keyframes pulse {
		0% {
			opacity: 0.3;
			transform: scale(1);
		}
		100% {
			opacity: 0.5;
			transform: scale(1.05);
		}
	}
</style>
