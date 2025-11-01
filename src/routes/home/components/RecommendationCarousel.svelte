<script>
	import { fade } from 'svelte/transition';
	
	let { currentIndex = $bindable(0) } = $props();
	
	const recommendations = [
		{
			subject: 'Química',
			topic: 'Estequiometría',
			icon: '🧪',
			duration: '12 min',
			url: '#'
		},
		{
			subject: 'Química',
			topic: 'Química Orgánica',
			icon: '📝',
			duration: '20 ejercicios',
			url: '#'
		},
		{
			subject: 'Biología',
			topic: 'Genética',
			icon: '🧬',
			duration: '15 min',
			url: '#'
		},
		{
			subject: 'Biología',
			topic: 'Evolución',
			icon: '📖',
			duration: '10 min',
			url: '#'
		},
		{
			subject: 'Matemáticas',
			topic: 'Álgebra',
			icon: '🔢',
			duration: '18 min',
			url: '#'
		},
		{
			subject: 'Física',
			topic: 'Mecánica',
			icon: '⚛️',
			duration: '25 min',
			url: '#'
		}
	];
	
	function next() {
		currentIndex = (currentIndex + 1) % recommendations.length;
	}
	
	function prev() {
		currentIndex = (currentIndex - 1 + recommendations.length) % recommendations.length;
	}
	
	$effect(() => {
		const interval = setInterval(next, 5000);
		return () => clearInterval(interval);
	});
</script>

<div class="carousel-container">
	<h3 class="text-white/90 font-semibold text-sm md:text-base mb-4 text-center tracking-wide">
		Recursos Recomendados
	</h3>
	
	<!-- Grid de 3 cards en desktop, 1 en mobile -->
	<div class="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
		{#each recommendations.slice(currentIndex, currentIndex + 3) as rec, i (currentIndex + i)}
			<a 
				href={rec.url}
				in:fade={{ duration: 300, delay: i * 100 }}
				class="recommendation-card bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] no-underline block"
			>
				<!-- Icono -->
				<div class="text-center mb-3">
					<div class="text-4xl mb-2">{rec.icon}</div>
					<div class="text-white/50 text-[10px] uppercase tracking-wider">{rec.subject}</div>
				</div>
				
				<!-- Contenido -->
				<h4 class="text-white/90 font-semibold text-sm mb-2 text-center line-clamp-2">
					{rec.topic}
				</h4>
				
				<div class="flex items-center justify-center gap-1 text-white/50 text-xs">
					<span>⏱️</span>
					<span>{rec.duration}</span>
				</div>
			</a>
		{/each}
	</div>
	
	<!-- Navegación -->
	<div class="flex items-center justify-center gap-3 mt-4">
		<button
			onclick={prev}
			class="nav-btn"
			aria-label="Anterior"
			disabled={currentIndex === 0}
		>
			←
		</button>
		
		<div class="flex gap-1.5">
			{#each Array(Math.ceil(recommendations.length / 3)) as _, i}
				<button
					onclick={() => currentIndex = i * 3}
					class="indicator {Math.floor(currentIndex / 3) === i ? 'active' : ''}"
					aria-label="Página {i + 1}"
				></button>
			{/each}
		</div>
		
		<button
			onclick={next}
			class="nav-btn"
			aria-label="Siguiente"
			disabled={currentIndex >= recommendations.length - 3}
		>
			→
		</button>
	</div>
</div>

<style>
	.nav-btn {
		width: 2rem;
		height: 2rem;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s;
		cursor: pointer;
		font-size: 0.875rem;
	}
	
	.nav-btn:hover:not(:disabled) {
		background: rgba(255, 255, 255, 0.1);
		border-color: rgba(255, 255, 255, 0.2);
	}
	
	.nav-btn:disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}
	
	.indicator {
		width: 0.375rem;
		height: 0.375rem;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.3);
		border: none;
		cursor: pointer;
		transition: all 0.2s;
		padding: 0;
	}
	
	.indicator.active {
		width: 1rem;
		background: rgba(59, 130, 246, 0.8);
	}
	
	.recommendation-card:hover {
		transform: translateY(-4px) scale(1.02);
	}
	
	@media (max-width: 768px) {
		.nav-btn {
			width: 1.75rem;
			height: 1.75rem;
			font-size: 0.75rem;
		}
	}
</style>
