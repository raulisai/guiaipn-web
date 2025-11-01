<script>
	import { onMount } from 'svelte';
	import { user } from '$lib/stores/authStore';
	import { examStore } from '$lib/stores/examStore';
	import { goto } from '$app/navigation';
	import SubjectsPentagon from './components/SubjectsPentagon.svelte';
	import ExamCard from './components/ExamCard.svelte';
	import FloatingStats from './components/FloatingStats.svelte';
	import RecommendationCarousel from './components/RecommendationCarousel.svelte';
	
	let selectedQuestions = $state(10);
	let carouselIndex = $state(0);
	
	// Mock data - TODO: obtener del backend
	const totalExams = 12;
	const passedExams = 6;
	const failedExams = 6;
	
	function startExam() {
		examStore.reset();
		goto('/examen');
	}
	
	onMount(() => {
		// Verificar autenticación
		if (!$user) {
			setTimeout(() => {
				goto('/cuenta/login');
			}, 100);
		}
	});
</script>

<section class="min-h-screen w-full flex items-center justify-center py-8 px-4 md:px-8 overflow-x-hidden relative bg-gradient-to-b from-[#030e27]/90 to-black/90">
	<!-- Partículas animadas de fondo -->
	<div class="particles-container absolute inset-0 overflow-hidden opacity-40"></div>
	
	<div class="container mx-auto relative z-10 max-w-7xl w-full">
		<!-- Sección superior: Pentágono + Card de Examen -->
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
			<!-- Pentágono de materias -->
			<div>
				<SubjectsPentagon />
			</div>
			
			<!-- Card de examen -->
			<div>
				<ExamCard 
					bind:selectedQuestions
					onStartExam={startExam}
				/>
			</div>
		</div>
		
		<!-- Estadísticas flotantes -->
		<div class="mb-6">
			<FloatingStats 
				{totalExams}
				{passedExams}
				{failedExams}
			/>
		</div>
		
		<!-- Carrusel de recomendaciones -->
		<div>
			<RecommendationCarousel bind:currentIndex={carouselIndex} />
		</div>
	</div>
</section>

<style>
	/* Partículas de fondo - igual que landing page */
	.particles-container {
		background-image: 
			radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
			radial-gradient(circle at 80% 70%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
			radial-gradient(circle at 50% 50%, rgba(236, 72, 153, 0.05) 0%, transparent 50%);
		animation: particles 20s ease-in-out infinite;
	}
	
	@keyframes particles {
		0%, 100% { opacity: 0.4; }
		50% { opacity: 0.6; }
	}
</style>
