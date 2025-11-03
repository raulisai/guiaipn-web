<script>
	import { onMount } from 'svelte';
	import { fade, scale } from 'svelte/transition';
	
	let { 
		selectedSubject = $bindable('')
	} = $props();
	
	// Datos de las materias (pentágono)
	const subjects = [
		{ name: 'Matemáticas', key: 'matematicas', score: 85, color: '#3b82f6' },
		{ name: 'Física', key: 'fisica', score: 78, color: '#8b5cf6' },
		{ name: 'Química', key: 'quimica', score: 62, color: '#ec4899' },
		{ name: 'Biología', key: 'biologia', score: 70, color: '#10b981' },
		{ name: 'Historia', key: 'historia', score: 88, color: '#f59e0b' }
	];
	
	let mounted = $state(false);
	
	function selectSubject(subjectKey) {
		// Si ya está seleccionada, deseleccionar (examen general)
		selectedSubject = selectedSubject === subjectKey ? '' : subjectKey;
	}
	
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
	
	<!-- Leyenda compacta con selección -->
	<div class="grid grid-cols-5 gap-1 mt-4 text-xs">
		{#each subjects as subject}
			<button
				onclick={() => selectSubject(subject.key)}
				class="text-center p-1 rounded-lg transition-all duration-200 hover:bg-white/10 {selectedSubject === subject.key ? 'bg-white/15 ring-2 ring-white/30' : ''}"
			>
				<div 
					class="w-2 h-2 rounded-full mx-auto mb-1 shadow-sm transition-all {selectedSubject === subject.key ? 'w-3 h-3 shadow-lg' : ''}" 
					style="background-color: {subject.color}"
				></div>
				<div class="text-white/60 truncate text-[9px] {selectedSubject === subject.key ? 'text-white/90 font-semibold' : ''}">{subject.name}</div>
				<div class="text-white/90 font-semibold text-[10px]">{subject.score}%</div>
			</button>
		{/each}
	</div>
	
	<!-- Botón de Todas las Materias con estilo gaming -->
	<div class="mt-4">
		<button
			onclick={() => selectedSubject = ''}
			class="gaming-button w-full py-3 px-4 rounded-xl font-bold text-sm transition-all duration-300 {selectedSubject === '' ? 'active' : ''}"
		>
			<span class="flex items-center justify-center gap-2">
				{#if selectedSubject === ''}
					<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
						<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
					</svg>
				{/if}
				<span>🎮 TODAS LAS MATERIAS</span>
			</span>
		</button>
	</div>
</div>

<style>
	.pentagon-container {
		transition: transform 0.3s ease;
	}
	
	.pentagon-container:hover {
		transform: translateY(-4px);
	}
	
	/* Botón gaming con gradiente cian/violeta */
	.gaming-button {
		position: relative;
		background: rgba(6, 182, 212, 0.08);
		border: 1px solid rgba(6, 182, 212, 0.18);
		color: rgba(255, 255, 255, 0.85);
		text-transform: uppercase;
		letter-spacing: 0.4px;
		overflow: hidden;
		transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
	}

	.gaming-button::before {
		content: '';
		position: absolute;
		top: 0;
		left: -120%;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, transparent, rgba(6, 182, 212, 0.22), transparent);
		transition: left 0.45s ease;
	}

	.gaming-button:hover::before {
		left: 120%;
	}

	.gaming-button:hover {
		border-color: rgba(6, 182, 212, 0.3);
		box-shadow: 0 0 16px rgba(6, 182, 212, 0.18);
		transform: translateY(-1px);
	}

	.gaming-button.active {
		background: linear-gradient(135deg, rgba(6, 182, 212, 0.28) 0%, rgba(168, 85, 247, 0.28) 100%);
		border: 1px solid rgba(6, 182, 212, 0.32);
		box-shadow: 0 0 22px rgba(6, 182, 212, 0.22);
		animation: gaming-pulse 3s ease-in-out infinite;
		transform: scale(1.01);
	}

	@keyframes gaming-pulse {
		0%, 100% {
			box-shadow: 0 0 22px rgba(6, 182, 212, 0.22);
		}
		50% {
			box-shadow: 0 0 28px rgba(168, 85, 247, 0.24);
		}
	}
</style>
