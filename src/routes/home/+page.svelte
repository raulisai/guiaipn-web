<script>
	import { onMount } from 'svelte';
	import { user } from '$lib/stores/authStore';
	import { goto } from '$app/navigation';
	import { fade, fly } from 'svelte/transition';
	import { Calendar, Zap, Play, ArrowRight, BookOpen, Clock, Award } from 'lucide-svelte';

	import BackgroundStats3D from './components/BackgroundStats3D.svelte';
	import { questionsAPI } from '$lib/api';
	import { supabase } from '$lib/services/supabase';

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

	let userStats = null;

	// Configuración de colores por materia
	const SUBJECT_COLORS = {
		matematicas: '#3b82f6', // blue
		fisica: '#8b5cf6', // purple
		quimica: '#ec4899', // pink
		biologia: '#10b981', // emerald
		historia: '#f59e0b', // amber
		geografia: '#ef4444', // red
		literatura: '#6366f1', // indigo
		ingles: '#14b8a6' // teal
	};

	onMount(async () => {
		if (!$user) {
			setTimeout(() => {
				goto('/cuenta/login');
			}, 100);
			return;
		}

		try {
			// Obtener sesión para el token
			const {
				data: { session }
			} = await supabase.auth.getSession();
			if (session) {
				const stats = await questionsAPI.getUserStats(session.access_token, $user.id);
				console.log('User Stats:', stats);

				if (stats && stats.mastery_levels) {
					// Transformar datos para el gráfico 3D
					// Tomamos las 5 materias principales o las que vengan
					const mappedSubjects = Object.entries(stats.mastery_levels).map(([subject, score]) => ({
						name: subject.toUpperCase(),
						score: Math.round(Number(score)),
						color: SUBJECT_COLORS[subject] || '#94a3b8'
					}));

					if (mappedSubjects.length > 0) {
						userStats = mappedSubjects.slice(0, 5); // Limitar a 5 para el pentágono
					}
				}
			}
		} catch (error) {
			console.error('Error fetching stats:', error);
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
		{#if userStats}
			<BackgroundStats3D subjects={userStats} />
		{:else}
			<BackgroundStats3D />
		{/if}

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
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 items-stretch perspective-1000">
			<!-- Year Selection Column -->
			<div class="space-y-4 md:space-y-6" in:fly={{ y: 50, duration: 1000, delay: 400 }}>
				<div class="flex items-center gap-3 text-blue-200/80 mb-2 px-1">
					<div class="p-2 bg-blue-500/10 rounded-lg backdrop-blur-md border border-blue-500/10">
						<Calendar class="w-5 h-5 md:w-6 md:h-6 text-blue-400" />
					</div>
					<h2 class="text-lg md:text-xl font-semibold tracking-wide">EDICIONES ANTERIORES</h2>
				</div>

				<div class="grid grid-cols-3 gap-3 md:gap-4">
					{#each examYears as { year, active, label }, i}
						<button
							onclick={() => startExam(year)}
							class="group relative overflow-hidden bg-white/5 hover:bg-white/10 border border-white/5 hover:border-blue-400/30 p-4 md:p-6 rounded-2xl transition-all duration-300 active:scale-95 text-left hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/10 backdrop-blur-sm flex flex-col justify-between min-h-[100px] md:min-h-[120px]"
							in:fly={{ y: 20, duration: 600, delay: 600 + i * 150 }}
						>
							{#if label}
								<span
									class="absolute top-2 right-2 text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 shadow-[0_0_10px_rgba(59,130,246,0.5)] animate-pulse"
								>
									{label}
								</span>
							{/if}

							<div class="mb-2 opacity-50 group-hover:opacity-100 transition-opacity">
								<BookOpen class="w-5 h-5 text-blue-300" />
							</div>

							<div class="relative z-10">
								<span
									class="block text-blue-200/40 text-[9px] font-bold uppercase tracking-wider mb-0.5"
									>VERSIÓN</span
								>
								<span
									class="block text-2xl md:text-3xl font-bold text-white group-hover:text-blue-200 transition-colors"
									>{year}</span
								>
							</div>

							<!-- Hover Glow -->
							<div
								class="absolute -bottom-4 -right-4 w-16 h-16 bg-blue-500/20 blur-2xl rounded-full group-hover:bg-blue-400/30 transition-colors duration-500"
							></div>
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
					class="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/30 via-purple-500/30 to-pink-500/30 rounded-2xl md:rounded-3xl blur-md opacity-50 group-hover:opacity-80 transition duration-500 group-hover:duration-200"
				></div>

				<button
					onclick={() => startExam('', 10)}
					class="relative h-full w-full bg-slate-900/60 backdrop-blur-md border border-white/10 p-5 md:p-8 rounded-2xl flex md:flex-row flex-col items-center gap-6 overflow-hidden transition-all duration-300 active:scale-[0.98] group hover:bg-slate-800/60"
				>
					<!-- Decoración de fondo -->
					<div
						class="absolute top-0 right-0 p-32 bg-purple-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none group-hover:bg-purple-500/20 transition-colors duration-500"
					></div>

					<!-- Icon Wrapper -->
					<div
						class="shrink-0 p-4 md:p-6 bg-gradient-to-br from-white/10 to-white/5 rounded-2xl group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 border border-white/10 shadow-lg backdrop-blur-xl relative"
					>
						<div class="absolute inset-0 bg-purple-500/20 blur-xl rounded-full"></div>
						<Zap class="w-8 h-8 md:w-12 md:h-12 text-purple-300 relative z-10" />
					</div>

					<!-- Text Content -->
					<div class="flex-1 text-center md:text-left space-y-2 relative z-10 w-full">
						<div>
							<h2
								class="text-2xl md:text-3xl font-black text-white group-hover:text-purple-200 transition-colors tracking-tight flex items-center justify-center md:justify-start gap-2"
							>
								TEST RÁPIDO
								<span
									class="inline-block md:hidden bg-purple-500/20 text-purple-200 text-xs px-2 py-0.5 rounded-full border border-purple-500/30"
									>10 min</span
								>
							</h2>
							<p class="text-slate-300/80 text-sm leading-relaxed font-medium mt-1">
								Generamos un examen <span class="text-purple-300">inteligente</span> personalizado para
								ti.
							</p>
						</div>

						<div
							class="flex items-center justify-center md:justify-start gap-4 text-xs text-slate-400 font-mono mt-2"
						>
							<div class="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded">
								<Clock class="w-3 h-3" /> <span>~15 min</span>
							</div>
							<div class="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded">
								<Award class="w-3 h-3" /> <span>+20 pts</span>
							</div>
						</div>
					</div>

					<!-- Action Button -->
					<div
						class="w-full md:w-auto mt-2 md:mt-0 shrink-0 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl text-white font-bold text-sm transition-all shadow-lg hover:shadow-purple-500/40 flex items-center justify-center gap-2 tracking-wide group-hover:translate-x-1"
					>
						<span>INICIAR</span>
						<ArrowRight class="w-4 h-4 transition-transform group-hover:translate-x-1" />
					</div>
				</button>
			</div>
		</div>

		<!-- Footer / Additional Info -->
		<div class="text-center pt-8 border-t border-white/5" in:fade={{ duration: 1000, delay: 1000 }}>
			<div
				class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors cursor-pointer"
			>
				<span class="relative flex h-2 w-2">
					<span
						class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"
					></span>
					<span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
				</span>
				<p class="text-slate-400 text-xs font-medium tracking-wider uppercase">
					Sistema Politécnico &bull; v2.1.0
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
