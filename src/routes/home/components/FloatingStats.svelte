<script>
	import { fade, fly } from 'svelte/transition';
	
	let { 
		totalExams = 12,
		passedExams = 6,
		failedExams = 6
	} = $props();
</script>

<div 
	in:fly={{ y: 20, duration: 600, delay: 500 }}
	class="floating-stats bg-white/5 backdrop-blur-sm rounded-3xl p-3 md:p-4 border border-white/10 shadow-lg hover:shadow-xl transition-all duration-300"
>
	<div class="grid grid-cols-3 gap-2 md:gap-3">
		<!-- Total (Do) -->
		<div class="stat-item text-center">
			<div class="text-lg md:text-xl mb-1">📚</div>
			<div class="stat-label text-white/50 text-[10px] md:text-xs mb-1">Realizados</div>
			<div class="stat-value text-white/90 font-semibold text-base md:text-lg">
				{totalExams}
			</div>
		</div>
		
		<!-- Aprobados (Win) -->
		<div class="stat-item text-center">
			<div class="text-lg md:text-xl mb-1">✅</div>
			<div class="stat-label text-white/50 text-[10px] md:text-xs mb-1">Aprobados</div>
			<div class="stat-value text-green-400/90 font-semibold text-base md:text-lg">
				{passedExams}
			</div>
		</div>
		
		<!-- Reprobados (Fail) -->
		<div class="stat-item text-center">
			<div class="text-lg md:text-xl mb-1">❌</div>
			<div class="stat-label text-white/50 text-[10px] md:text-xs mb-1">Reprobados</div>
			<div class="stat-value text-red-400/90 font-semibold text-base md:text-lg">
				{failedExams}
			</div>
		</div>
	</div>
	
	<!-- Barra de progreso -->
	<div class="mt-3 bg-white/5 rounded-full h-1.5 overflow-hidden">
		<div 
			class="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-1000 rounded-full"
			style="width: {totalExams > 0 ? (passedExams / totalExams) * 100 : 0}%"
		></div>
	</div>
	
	<div class="text-center mt-2 text-white/50 text-[10px] md:text-xs">
		Tasa de aprobación: <span class="text-white/80 font-semibold">{totalExams > 0 ? Math.round((passedExams / totalExams) * 100) : 0}%</span>
	</div>
</div>

<style>
	.floating-stats:hover {
		transform: translateY(-4px);
	}
	
	.stat-item {
		padding: 0.5rem;
		border-radius: 1rem;
		background: rgba(255, 255, 255, 0.02);
		transition: all 0.2s;
	}
	
	.stat-item:hover {
		background: rgba(255, 255, 255, 0.05);
	}
</style>
