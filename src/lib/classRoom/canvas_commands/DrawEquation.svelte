<script>
	import { onMount } from 'svelte';
	import katex from 'katex';
	
	let { params = {}, canvasWidth = 800, opacity = 1 } = $props();
	
	let canvasRef = $state(null);

	console.log('Params recibidos los buenos:', params);
	
	// Extraer equation y description de params
	const equation = $derived(params?.equation || params?.latex || '');
	const description = $derived(params?.description || '');
	
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
		if (!canvasRef || !equation) return;
		
		const ctx = canvasRef.getContext('2d');
		const dpr = window.devicePixelRatio || 1;
		const width = canvasWidth;
		// Altura dinámica: más alta si hay descripción
		const height = description ? 180 : 120;
		
		canvasRef.width = width * dpr;
		canvasRef.height = height * dpr;
		canvasRef.style.width = `${width}px`;
		canvasRef.style.height = `${height}px`;
		ctx.scale(dpr, dpr);
		
		ctx.clearRect(0, 0, width, height);
		ctx.globalAlpha = opacity;
		
		const x = params.x || params.position?.x || 40;
		const y = params.y || params.position?.y || 40;
		const color = params.color || '#ffd700';
		const displayMode = params.displayMode !== false;
		
		try {
			// Renderizar con KaTeX a HTML
			const html = katex.renderToString(equation, {
				throwOnError: false,
				displayMode: displayMode,
				output: 'html',
				trust: true,
				strict: 'ignore'
			});
			
			// Crear elemento temporal
			const tempDiv = document.createElement('div');
			tempDiv.innerHTML = html;
			tempDiv.style.position = 'absolute';
			tempDiv.style.left = '-9999px';
			tempDiv.style.color = color;
			tempDiv.style.fontSize = '18px';
			document.body.appendChild(tempDiv);
			
			const textContent = tempDiv.textContent || equation;
			ctx.fillStyle = color;
			ctx.font = 'bold 20px "Computer Modern", "Latin Modern Math", serif';
			ctx.textAlign = 'left';
			ctx.shadowColor = 'rgba(255, 215, 0, 0.3)';
			ctx.shadowBlur = 2;
			
			// Word wrap
			const maxWidth = width - 80;
			const words = textContent.split(' ');
			let line = '';
			let lineY = y;
			
			for (let i = 0; i < words.length; i++) {
				const testLine = line + words[i] + ' ';
				const metrics = ctx.measureText(testLine);
				
				if (metrics.width > maxWidth && i > 0) {
					ctx.fillText(line, x, lineY);
					line = words[i] + ' ';
					lineY += 25;
				} else {
					line = testLine;
				}
			}
			ctx.fillText(line, x, lineY);
			
			document.body.removeChild(tempDiv);
			
			// Dibujar descripción si existe
			if (description) {
				ctx.font = '14px sans-serif';
				ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
				ctx.shadowBlur = 0;
				ctx.fillText(`→ ${description}`, x, lineY + 30);
			}
			
			// Recuadro opcional
			if (params.box || params.highlight) {
				ctx.strokeStyle = color;
				ctx.lineWidth = 3;
				ctx.shadowColor = 'rgba(255, 215, 0, 0.3)';
				ctx.shadowBlur = 2;
				const boxHeight = description ? lineY - y + 55 : lineY - y + 25;
				ctx.strokeRect(x - 10, y - 20, maxWidth + 20, boxHeight);
			}
			ctx.shadowBlur = 0;
		} catch (error) {
			console.error('Error renderizando ecuación:', error);
			ctx.fillStyle = color;
			ctx.font = '16px monospace';
			ctx.fillText(equation, x, y);
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
