<script>
	import { onMount } from 'svelte';
	import katex from 'katex';
	
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
		const height = 120;
		
		canvasRef.width = width * dpr;
		canvasRef.height = height * dpr;
		canvasRef.style.width = `${width}px`;
		canvasRef.style.height = `${height}px`;
		ctx.scale(dpr, dpr);
		
		ctx.clearRect(0, 0, width, height);
		ctx.globalAlpha = opacity;
		
		const content = params.content || '';
		const reason = params.reason || '';
		const x = params.x || params.position?.x || 40;
		const y = params.y || params.position?.y || 60;
		
		// Formato antiguo con elements
		if (params.elements && Array.isArray(params.elements)) {
			params.elements.forEach(element => {
				if (element.type === 'text') {
					ctx.fillStyle = element.backgroundColor || 'rgba(16, 185, 129, 0.2)';
					const textWidth = ctx.measureText(element.content).width;
					ctx.fillRect(
						(element.position?.x || 100) - 5,
						(element.position?.y || 100) - 20,
						textWidth + 10,
						30
					);
					
					ctx.fillStyle = element.color || '#4ade80';
					ctx.font = element.font || 'bold 20px sans-serif';
					ctx.shadowColor = 'rgba(74, 222, 128, 0.3)';
					ctx.shadowBlur = 2;
					ctx.fillText(
						element.content,
						element.position?.x || 100,
						element.position?.y || 100
					);
					ctx.shadowBlur = 0;
				}
			});
			ctx.globalAlpha = 1;
			return;
		}
		
		// Formato nuevo: content + reason
		ctx.save();
		
		// Icono de check
		ctx.fillStyle = '#4ade80';
		ctx.font = 'bold 28px sans-serif';
		ctx.shadowColor = 'rgba(74, 222, 128, 0.5)';
		ctx.shadowBlur = 4;
		ctx.fillText('✓', x, y);
		
		// Contenido
		const contentX = x + 40;
		ctx.font = 'bold 22px sans-serif';
		ctx.fillStyle = '#4ade80';
		
		// Renderizar LaTeX si tiene $
		if (content.includes('$')) {
			try {
				const latex = content.replace(/\$/g, '');
				const html = katex.renderToString(latex, {
					throwOnError: false,
					displayMode: false,
					output: 'html',
					trust: true,
					strict: 'ignore'
				});
				
				const tempDiv = document.createElement('div');
				tempDiv.innerHTML = html;
				tempDiv.style.position = 'absolute';
				tempDiv.style.left = '-9999px';
				tempDiv.style.fontSize = '20px';
				document.body.appendChild(tempDiv);
				
				const textContent = tempDiv.textContent || content;
				ctx.fillText(textContent, contentX, y);
				document.body.removeChild(tempDiv);
			} catch (error) {
				ctx.fillText(content, contentX, y);
			}
		} else {
			ctx.fillText(content, contentX, y);
		}
		
		// Razón debajo
		if (reason) {
			ctx.font = '16px sans-serif';
			ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
			ctx.fillText(`→ ${reason}`, contentX, y + 28);
		}
		
		// Recuadro resaltado
		const boxWidth = width - 60;
		const boxHeight = reason ? 65 : 40;
		ctx.strokeStyle = '#4ade80';
		ctx.lineWidth = 3;
		ctx.shadowColor = 'rgba(74, 222, 128, 0.3)';
		ctx.shadowBlur = 4;
		ctx.fillStyle = 'rgba(74, 222, 128, 0.1)';
		ctx.fillRect(x - 10, y - 28, boxWidth, boxHeight);
		ctx.strokeRect(x - 10, y - 28, boxWidth, boxHeight);
		ctx.shadowBlur = 0;
		
		ctx.restore();
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