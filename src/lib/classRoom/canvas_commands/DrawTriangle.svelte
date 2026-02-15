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
		const height = 200;
		
		canvasRef.width = width * dpr;
		canvasRef.height = height * dpr;
		canvasRef.style.width = `${width}px`;
		canvasRef.style.height = `${height}px`;
		ctx.scale(dpr, dpr);
		
		ctx.clearRect(0, 0, width, height);
		ctx.globalAlpha = opacity;
		
		ctx.strokeStyle = params.color || '#4ecdc4';
		ctx.lineWidth = params.width || 3;
		ctx.shadowColor = 'rgba(78, 205, 196, 0.3)';
		ctx.shadowBlur = 2;
		ctx.beginPath();
		ctx.moveTo(params.x1 || width / 2, params.y1 || 40);
		ctx.lineTo(params.x2 || width / 4, params.y2 || 160);
		ctx.lineTo(params.x3 || (width * 3) / 4, params.y3 || 160);
		ctx.closePath();
		
		if (params.fill) {
			ctx.fillStyle = params.fillColor || params.color || 'rgba(78, 205, 196, 0.3)';
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
