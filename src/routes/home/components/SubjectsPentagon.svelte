<script>
	import { onMount } from 'svelte';
	import { fade, scale } from 'svelte/transition';
	
	// Datos de las materias (pentágono)
	const subjects = [
		{ name: 'Matemáticas', score: 85, color: '#3b82f6' },
		{ name: 'Física', score: 78, color: '#8b5cf6' },
		{ name: 'Química', score: 62, color: '#ec4899' },
		{ name: 'Biología', score: 70, color: '#10b981' },
		{ name: 'Historia', score: 88, color: '#f59e0b' }
	];
	
	let mounted = $state(false);
	
	onMount(() => {
		mounted = true;
	});
	
	// Calcular puntos del pentágono
	function getPentagonPoints(scores) {
		const centerX = 100;
		const centerY = 100;
		const radius = 80;
		const points = [];
		
		scores.forEach((score, i) => {
			const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
			const distance = (score / 100) * radius;
			const x = centerX + distance * Math.cos(angle);
			const y = centerY + distance * Math.sin(angle);
			points.push(`${x},${y}`);
		});
		
		return points.join(' ');
	}
	
	// Puntos del pentágono de referencia (100%)
	function getReferencePentagon() {
		const centerX = 100;
		const centerY = 100;
		const radius = 80;
		const points = [];
		
		for (let i = 0; i < 5; i++) {
			const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
			const x = centerX + radius * Math.cos(angle);
			const y = centerY + radius * Math.sin(angle);
			points.push(`${x},${y}`);
		}
		
		return points.join(' ');
	}
</script>

<div 
	class="pentagon-container bg-white/5 backdrop-blur-sm rounded-3xl p-4 md:p-6 border border-white/10 shadow-lg hover:shadow-xl transition-all duration-300"
>
	<h3 class="text-white/90 font-semibold text-center mb-4 text-xs md:text-sm tracking-wide">
		Tu Desempeño
	</h3>
	
	<div class="flex justify-center">
		<svg viewBox="0 0 200 200" class="w-full max-w-[280px] h-auto">
			<!-- Círculos de referencia -->
			<circle cx="100" cy="100" r="80" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
			<circle cx="100" cy="100" r="60" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
			<circle cx="100" cy="100" r="40" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
			<circle cx="100" cy="100" r="20" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
			
			<!-- Pentágono de referencia -->
			<polygon 
				points={getReferencePentagon()} 
				fill="none" 
				stroke="rgba(255,255,255,0.1)" 
				stroke-width="1"
			/>
			
			<!-- Líneas desde el centro -->
			{#each subjects as subject, i}
				{@const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2}
				{@const x = 100 + 80 * Math.cos(angle)}
				{@const y = 100 + 80 * Math.sin(angle)}
				<line 
					x1="100" 
					y1="100" 
					x2={x} 
					y2={y} 
					stroke="rgba(255,255,255,0.1)" 
					stroke-width="1"
				/>
			{/each}
			
			<!-- Pentágono de datos del usuario -->
			{#if mounted}
				<polygon 
					in:scale={{ duration: 800, delay: 200 }}
					points={getPentagonPoints(subjects.map(s => s.score))} 
					fill="url(#pentagonGradient)" 
					stroke="#3b82f6" 
					stroke-width="2"
					opacity="0.8"
				/>
			{/if}
			
			<!-- Puntos en cada vértice -->
			{#each subjects as subject, i}
				{@const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2}
				{@const distance = (subject.score / 100) * 80}
				{@const x = 100 + distance * Math.cos(angle)}
				{@const y = 100 + distance * Math.sin(angle)}
				{#if mounted}
					<circle 
						in:scale={{ duration: 400, delay: 400 + i * 100 }}
						cx={x} 
						cy={y} 
						r="4" 
						fill={subject.color}
						class="drop-shadow-lg"
					/>
				{/if}
			{/each}
			
			<!-- Gradiente -->
			<defs>
				<radialGradient id="pentagonGradient">
					<stop offset="0%" style="stop-color:#3b82f6;stop-opacity:0.6" />
					<stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:0.2" />
				</radialGradient>
			</defs>
		</svg>
	</div>
	
	<!-- Leyenda compacta -->
	<div class="grid grid-cols-5 gap-1 mt-4 text-xs">
		{#each subjects as subject}
			<div class="text-center">
				<div 
					class="w-2 h-2 rounded-full mx-auto mb-1 shadow-sm" 
					style="background-color: {subject.color}"
				></div>
				<div class="text-white/60 truncate text-[9px]">{subject.name}</div>
				<div class="text-white/90 font-semibold text-[10px]">{subject.score}%</div>
			</div>
		{/each}
	</div>
</div>

<style>
	.pentagon-container {
		transition: transform 0.3s ease;
	}
	
	.pentagon-container:hover {
		transform: translateY(-4px);
	}
</style>
