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
		const height = Math.max(120, (params.radius || 50) * 2 + 40);
		
		canvasRef.width = width * dpr;
		canvasRef.height = height * dpr;
		canvasRef.style.width = `${width}px`;
		canvasRef.style.height = `${height}px`;
		ctx.scale(dpr, dpr);
		
		ctx.clearRect(0, 0, width, height);
		ctx.globalAlpha = opacity;
		
		ctx.strokeStyle = params.color || '#ffd700';
		ctx.lineWidth = params.width || 3;
		ctx.shadowColor = 'rgba(255, 215, 0, 0.3)';
		ctx.shadowBlur = 2;
		ctx.beginPath();
		ctx.arc(params.x || width / 2, params.y || height / 2, params.radius || 50, 0, 2 * Math.PI);
		
		if (params.fill) {
			ctx.fillStyle = params.fillColor || params.color || 'rgba(255, 215, 0, 0.3)';
			ctx.fill();
		}
		
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
