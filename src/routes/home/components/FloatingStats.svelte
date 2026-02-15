<script>
	import { fade, fly } from 'svelte/transition';
	
	let { 
		totalExams = 12,
		passedExams = 6,
		failedExams = 6
	} = $props();
</script>

<div 
	in:fly={{ y: 14, duration: 500, delay: 300 }}
	class="floating-stats flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-5 px-3 md:px-4 py-2 md:py-3 rounded-2xl backdrop-blur-sm transition-all duration-300"
>
	<div class="stats-group flex items-center justify-between md:justify-start gap-3 md:gap-5 w-full md:w-auto">
		<!-- Total (Do) -->
		<div class="stat-item">
			<div class="icon">📚</div>
			<div class="stat-content">
				<span class="stat-label">Realizados</span>
				<span class="stat-value">{totalExams}</span>
			</div>
		</div>

		<!-- Aprobados (Win) -->
		<div class="stat-item">
			<div class="icon">✅</div>
			<div class="stat-content">
				<span class="stat-label">Aprobados</span>
				<span class="stat-value accent">{passedExams}</span>
			</div>
		</div>

		<!-- Reprobados (Fail) -->
		<div class="stat-item">
			<div class="icon">❌</div>
			<div class="stat-content">
				<span class="stat-label">Reprobados</span>
				<span class="stat-value warn">{failedExams}</span>
			</div>
		</div>
	</div>

	<!-- Barra de progreso minimalista -->
	<div class="progress-wrapper w-full md:w-56">
		<div class="label-row flex items-center justify-between text-[10px] md:text-xs text-white/45">
			<span>Tasa de aprobación</span>
			<span class="text-white/70 font-semibold">{totalExams > 0 ? Math.round((passedExams / totalExams) * 100) : 0}%</span>
		</div>
		<div class="progress-bar mt-1">
			<div 
				class="fill"
				style="width: {totalExams > 0 ? (passedExams / totalExams) * 100 : 0}%"
			></div>
		</div>
	</div>
</div>

<style>
	.floating-stats:hover {
		border-color: rgba(6, 182, 212, 0.35);
		box-shadow: 0 0 35px rgba(6, 182, 212, 0.12);
	}

	.stats-group {
		font-size: 0.75rem;
	}

	.stat-item {
		display: flex;
		align-items: center;
		gap: 0.55rem;
		padding: 0.45rem 0.65rem;
		border-radius: 999px;
		background: rgba(11, 22, 48, 0.32);
		border: 1px solid rgba(6, 182, 212, 0.16);
		box-shadow: inset 0 0 8px rgba(6, 182, 212, 0.06);
	}

	.stat-item .icon {
		font-size: 1rem;
	}

	.stat-content {
		display: flex;
		flex-direction: column;
		line-height: 1.1;
	}

	.stat-label {
		font-size: 0.65rem;
		color: rgba(255, 255, 255, 0.5);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.stat-value {
		color: rgba(255, 255, 255, 0.8);
		font-weight: 600;
		font-size: 0.95rem;
	}

	.stat-value.accent {
		color: rgba(56, 189, 248, 0.75);
	}

	.stat-value.warn {
		color: rgba(248, 113, 113, 0.7);
	}

	.progress-wrapper {
		min-width: 12rem;
	}

	.progress-bar {
		height: 6px;
		border-radius: 999px;
		background: rgba(6, 182, 212, 0.08);
		overflow: hidden;
		position: relative;
	}

	.progress-bar::after {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, rgba(6, 182, 212, 0.12), rgba(168, 85, 247, 0.12));
	}

	.fill {
		height: 100%;
		border-radius: inherit;
		background: linear-gradient(90deg, rgba(6, 182, 212, 0.38), rgba(168, 85, 247, 0.35));
		box-shadow: 0 0 10px rgba(6, 182, 212, 0.18);
		transition: width 500ms ease;
		position: relative;
	}

	.fill::after {
		content: '';
		position: absolute;
		top: 0;
		right: 0;
		width: 12px;
		height: 100%;
		background: radial-gradient(circle at center, rgba(255, 255, 255, 0.55), transparent 70%);
	}

	.floating-stats {
		border: 1px solid rgba(6, 182, 212, 0.18);
		background: rgba(5, 12, 28, 0.55);
		box-shadow: 0 0 24px rgba(6, 182, 212, 0.08);
	}

	@media (max-width: 768px) {
		.progress-wrapper {
			min-width: 100%;
		}
	}
</style>
