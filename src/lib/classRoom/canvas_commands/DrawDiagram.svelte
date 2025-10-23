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
		
		// Dibujar elementos del diagrama
		if (params.elements && Array.isArray(params.elements)) {
			params.elements.forEach(element => {
				if (element.type === 'text') {
					ctx.fillStyle = element.color || '#ffffff';
					ctx.font = element.font || 'bold 18px sans-serif';
					ctx.shadowColor = 'rgba(255, 255, 255, 0.3)';
					ctx.shadowBlur = 2;
					ctx.fillText(
						element.content || '',
						element.position?.x || 100,
						element.position?.y || 100
					);
					ctx.shadowBlur = 0;
				} else if (element.type === 'arrow') {
					const x1 = element.from?.x || 0;
					const y1 = element.from?.y || 0;
					const x2 = element.to?.x || 100;
					const y2 = element.to?.y || 100;
					const headLength = 12;
					const angle = Math.atan2(y2 - y1, x2 - x1);
					
					ctx.strokeStyle = element.color || '#ff6b6b';
					ctx.fillStyle = element.color || '#ff6b6b';
					ctx.lineWidth = 3;
					ctx.shadowColor = 'rgba(255, 107, 107, 0.3)';
					ctx.shadowBlur = 2;
					
					// Línea
					ctx.beginPath();
					ctx.moveTo(x1, y1);
					ctx.lineTo(x2, y2);
					ctx.stroke();
					
					// Punta
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
				}
			});
		}
		
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
