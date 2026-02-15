<script>
	import { onMount } from 'svelte';
	
	let { params = {}, canvasWidth = 800, opacity = 1 } = $props();
	
	let canvasRef = $state(null);
	
	onMount(() => {
		if (canvasRef) {
			draw();
		}
	});
	
	$effect(() => {
		if (canvasRef && opacity !== undefined) {
			draw();
		}
	});
	
	function draw() {
		if (!canvasRef) return;
		
		const ctx = canvasRef.getContext('2d');
		const dpr = window.devicePixelRatio || 1;
		const width = canvasWidth;
		const height = 150;
		
		canvasRef.width = width * dpr;
		canvasRef.height = height * dpr;
		canvasRef.style.width = `${width}px`;
		canvasRef.style.height = `${height}px`;
		ctx.scale(dpr, dpr);
		
		ctx.clearRect(0, 0, width, height);
		ctx.globalAlpha = opacity;
		
		const x1 = params.x || width / 2;
		const y1 = params.y || height / 2;
		const x2 = x1 + (params.dx || 100);
		const y2 = y1 + (params.dy || 0);
		
		const headLength = params.headLength || 12;
		const angle = Math.atan2(y2 - y1, x2 - x1);
		
		ctx.strokeStyle = params.color || '#ff6b6b';
		ctx.fillStyle = params.color || '#ff6b6b';
		ctx.lineWidth = params.width || 3;
		ctx.shadowColor = 'rgba(255, 107, 107, 0.3)';
		ctx.shadowBlur = 2;
		
		// Línea principal
		ctx.beginPath();
		ctx.moveTo(x1, y1);
		ctx.lineTo(x2, y2);
		ctx.stroke();
		
		// Punta de flecha
		ctx.beginPath();
		ctx.moveTo(x2, y2);
		ctx.lineTo(
			x2 - headLength * Math.cos(angle - Math.PI / 6),
			y2 - headLength * Math.sin(angle - Math.PI / 6)
		);
		ctx.lineTo(
			x2 - headLength * Math.cos(angle + Math.PI / 6),
			y2 - headLength * Math.sin(angle + Math.PI / 6)
		);
		ctx.closePath();
		ctx.fill();
		ctx.shadowBlur = 0;
		ctx.globalAlpha = 1;
	}
</script>

<canvas bind:this={canvasRef} class="canvas-command"></canvas>

<style>
	.canvas-command {
		display: block;
		width: 100%;
	}
</style>
