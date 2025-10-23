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
		const height = 300;
		
		canvasRef.width = width * dpr;
		canvasRef.height = height * dpr;
		canvasRef.style.width = `${width}px`;
		canvasRef.style.height = `${height}px`;
		ctx.scale(dpr, dpr);
		
		ctx.clearRect(0, 0, width, height);
		ctx.globalAlpha = opacity;
		
		ctx.strokeStyle = params.color || 'rgba(255, 255, 255, 0.5)';
		ctx.lineWidth = 2;
		ctx.shadowColor = 'rgba(255, 255, 255, 0.2)';
		ctx.shadowBlur = 1;
		ctx.beginPath();
		
		// Eje X
		ctx.moveTo(0, params.y || height / 2);
		ctx.lineTo(width, params.y || height / 2);
		
		// Eje Y
		ctx.moveTo(params.x || width / 2, 0);
		ctx.lineTo(params.x || width / 2, height);
		
		ctx.stroke();
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
