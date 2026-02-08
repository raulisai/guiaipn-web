<script>
	import { onMount } from 'svelte';

	let {
		subjects = [
			{ name: 'CALCULO', score: 85, color: '#3b82f6' },
			{ name: 'FISICA', score: 78, color: '#8b5cf6' },
			{ name: 'ALGEBRA', score: 62, color: '#ec4899' },
			{ name: 'QUIMICA', score: 70, color: '#10b981' },
			{ name: 'HISTORIA', score: 88, color: '#f59e0b' }
		]
	} = $props();

	let mounted = $state(false);

	onMount(() => {
		mounted = true;
	});

	// Calcular puntos del pentágono
	function getPentagonPoints(scores, radius = 100) {
		const centerX = 120;
		const centerY = 120;
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

	function getReferencePentagon(radius = 100) {
		const centerX = 120;
		const centerY = 120;
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
	class="scene-3d pointer-events-none select-none absolute inset-0 overflow-hidden flex items-center justify-center opacity-40 md:opacity-60 mix-blend-screen z-0"
>
	<div class="chart-container-3d">
		<!-- Base platform/ring -->
		<div class="rings">
			<div class="ring-3d ring-1"></div>
			<div class="ring-3d ring-2"></div>
			<div class="ring-3d ring-3"></div>
		</div>

		<!-- The Chart -->
		<div class="chart-svg-wrapper">
			<svg viewBox="0 0 240 240" class="w-full h-full overflow-visible">
				<defs>
					<linearGradient id="gridGradient" x1="0%" y1="0%" x2="100%" y2="100%">
						<stop offset="0%" style="stop-color:rgba(59, 130, 246, 0.2)" />
						<stop offset="100%" style="stop-color:rgba(139, 92, 246, 0.1)" />
					</linearGradient>

					<linearGradient id="scoreGradient" x1="0%" y1="0%" x2="0%" y2="100%">
						<stop offset="0%" style="stop-color:#06b6d4;stop-opacity:0.6" />
						<stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:0.6" />
					</linearGradient>

					<filter id="glow">
						<feGaussianBlur stdDeviation="4" result="coloredBlur" />
						<feMerge>
							<feMergeNode in="coloredBlur" />
							<feMergeNode in="SourceGraphic" />
						</feMerge>
					</filter>
				</defs>

				<!-- Reference grid -->
				<polygon
					points={getReferencePentagon(100)}
					fill="none"
					stroke="rgba(255,255,255,0.15)"
					stroke-width="1"
					class="grid-line"
				/>
				<polygon
					points={getReferencePentagon(70)}
					fill="none"
					stroke="rgba(255,255,255,0.1)"
					stroke-width="1"
					class="grid-line"
				/>
				<polygon
					points={getReferencePentagon(40)}
					fill="none"
					stroke="rgba(255,255,255,0.05)"
					stroke-width="1"
					class="grid-line"
				/>

				<!-- Spokes -->
				{#each subjects as _, i}
					{@const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2}
					{@const x = 120 + 100 * Math.cos(angle)}
					{@const y = 120 + 100 * Math.sin(angle)}
					<line x1="120" y1="120" x2={x} y2={y} stroke="rgba(255,255,255,0.1)" stroke-width="1" />

					<!-- Labels (floating in 3D space via CSS ideally, but here in SVG) -->
					{#if mounted}
						<text
							x={120 + 130 * Math.cos(angle)}
							y={120 + 130 * Math.sin(angle)}
							text-anchor="middle"
							alignment-baseline="middle"
							fill="rgba(255,255,255,0.8)"
							font-size="10"
							font-weight="bold"
							class="stats-label"
							style="text-shadow: 0 0 10px rgba(139, 92, 246, 0.8);"
						>
							{subjects[i].name}
						</text>
						<text
							x={120 + 130 * Math.cos(angle)}
							y={120 + 130 * Math.sin(angle) + 12}
							text-anchor="middle"
							alignment-baseline="middle"
							fill={subjects[i].color}
							font-size="9"
							font-weight="bold"
							class="stats-label"
						>
							{subjects[i].score}%
						</text>
					{/if}
				{/each}

				<!-- Data Polygon -->
				{#if mounted}
					<polygon
						points={getPentagonPoints(
							subjects.map((s) => s.score),
							100
						)}
						fill="url(#scoreGradient)"
						stroke="#22d3ee"
						stroke-width="2"
						filter="url(#glow)"
						style="opacity: 0.9;"
					>
						<animate attributeName="opacity" values="0.7;1;0.7" dur="4s" repeatCount="indefinite" />
					</polygon>

					<!-- Vertices -->
					{#each subjects as subject, i}
						{@const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2}
						{@const distance = (subject.score / 100) * 100}
						{@const x = 120 + distance * Math.cos(angle)}
						{@const y = 120 + distance * Math.sin(angle)}

						<circle cx={x} cy={y} r="3" fill="#ffffff" filter="url(#glow)" />
					{/each}
				{/if}
			</svg>
		</div>
	</div>
</div>

<style>
	.scene-3d {
		perspective: 1200px;
		/* Move it slightly down/right depending on preference */
		transform-style: preserve-3d;
	}

	.chart-container-3d {
		width: 400px;
		height: 400px;
		position: relative;
		transform-style: preserve-3d;
		animation: floating-rotate 20s linear infinite;
	}

	@media (max-width: 768px) {
		.chart-container-3d {
			width: 280px;
			height: 280px;
			/* Scale down and push back on mobile */
			transform: translateZ(-200px) translateY(-50px);
		}
	}

	@keyframes floating-rotate {
		0% {
			transform: rotateX(60deg) rotateZ(0deg) translateY(0px);
		}
		50% {
			transform: rotateX(55deg) rotateZ(180deg) translateY(-20px);
		}
		100% {
			transform: rotateX(60deg) rotateZ(360deg) translateY(0px);
		}
	}

	.chart-svg-wrapper {
		width: 100%;
		height: 100%;
		position: absolute;
		top: 0;
		left: 0;
		/* Ensure SVG faces 'up' relative to the plane */
		transform: translateZ(20px);
	}

	/* Decorative Rings underneath */
	.rings {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 100%;
		height: 100%;
	}

	.ring-3d {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		border-radius: 50%;
		border: 1px dashed rgba(6, 182, 212, 0.2);
		box-shadow: 0 0 15px rgba(6, 182, 212, 0.1);
	}

	.ring-1 {
		width: 140%;
		height: 140%;
		border-color: rgba(139, 92, 246, 0.15);
		animation: spin-reverse 30s linear infinite;
	}

	.ring-2 {
		width: 110%;
		height: 110%;
		border-style: solid;
		border-width: 1px;
		border-color: rgba(6, 182, 212, 0.1);
	}

	.ring-3 {
		width: 80%;
		height: 80%;
		border: 2px solid rgba(255, 255, 255, 0.05);
		animation: pulse-ring 4s ease-in-out infinite;
	}

	@keyframes spin-reverse {
		from {
			transform: translate(-50%, -50%) rotate(360deg);
		}
		to {
			transform: translate(-50%, -50%) rotate(0deg);
		}
	}

	@keyframes pulse-ring {
		0%,
		100% {
			transform: translate(-50%, -50%) scale(1);
			opacity: 0.5;
		}
		50% {
			transform: translate(-50%, -50%) scale(1.05);
			opacity: 0.8;
		}
	}

	/* Labels that counter-rotate to stay readable? 
       Actually, in a flat SVG plane inside a 3D rotated container, 
       they will rotate with the plane. 
       To make them upright relative to screen, we'd need more complex HTML/CSS. 
       For now, let's accept they rotate with the chart as if painted on the floor. 
    */
</style>
