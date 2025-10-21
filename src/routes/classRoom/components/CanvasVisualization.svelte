<script>
	import { onMount } from 'svelte';
	import katex from 'katex';

	let { commands = [], stepNumber = 0 } = $props();
	
	// Agrupar comandos por paso
	let canvasByStep = $derived.by(() => {
		const grouped = {};
		commands.forEach(command => {
			const step = command.step || 1;
			if (!grouped[step]) {
				grouped[step] = [];
			}
			grouped[step].push(command);
		});
		return grouped;
	});

	// Obtener pasos ordenados
	let sortedSteps = $derived(Object.keys(canvasByStep).sort((a, b) => Number(a) - Number(b)));

	// Referencias a los canvas (reactivo)
	let canvasRefs = $state({});

	// Redibujar canvas cuando cambien los comandos
	$effect(() => {
		if (commands.length > 0) {
			sortedSteps.forEach(step => {
				const canvasElement = canvasRefs[step];
				if (canvasElement) {
					drawCanvas(canvasElement, canvasByStep[step]);
				}
			});
		}
	});

	// Dibujar en un canvas individual
	function drawCanvas(canvasElement, stepCommands) {
		if (!canvasElement || !stepCommands) return;
		
		const ctx = canvasElement.getContext('2d');
		const dpr = window.devicePixelRatio || 1;
		const rect = canvasElement.getBoundingClientRect();
		
		canvasElement.width = rect.width * dpr;
		canvasElement.height = 300 * dpr;
		ctx.scale(dpr, dpr);
		
		// Fondo
		ctx.fillStyle = '#1f2937';
		ctx.fillRect(0, 0, rect.width, 300);
		
		// Ejecutar comandos del paso
		let currentYOffset = 40;
		stepCommands.forEach(command => {
			executeCommand(ctx, command.command, rect.width, currentYOffset);
			currentYOffset += 30;
		});
	}

	function executeCommand(ctx, cmd, canvasWidth, yOffset = 40) {
		if (!ctx || !cmd) return;

		ctx.save();

		// El backend puede enviar cmd.command o directamente cmd.type
		const commandType = cmd.command || cmd.type;
		const params = { ...cmd.parameters || cmd, yOffset, canvasWidth };

		switch (commandType) {
			case 'draw_axis':
				drawAxis(ctx, params);
				break;
			case 'draw_line':
				drawLine(ctx, params);
				break;
			case 'draw_circle':
				drawCircle(ctx, params);
				break;
			case 'draw_arrow':
				drawArrow(ctx, params);
				break;
			case 'draw_text':
				drawText(ctx, params);
				break;
			case 'draw_triangle':
				drawTriangle(ctx, params);
				break;
			case 'draw_vector':
				drawVector(ctx, params);
				break;
			case 'draw_diagram':
				drawDiagram(ctx, params);
				break;
			case 'draw_equation':
				drawEquation(ctx, params);
				break;
			case 'highlight':
				drawHighlight(ctx, params);
				break;
			default:
				console.warn('Comando de canvas desconocido:', commandType, cmd);
		}

		ctx.restore();
	}

	function drawAxis(ctx, cmd) {
		const width = cmd.canvasWidth || 800;
		const height = 300;
		ctx.strokeStyle = cmd.color || '#6b7280';
		ctx.lineWidth = 2;
		ctx.beginPath();
		// Eje X
		ctx.moveTo(0, cmd.y || height / 2);
		ctx.lineTo(width, cmd.y || height / 2);
		// Eje Y
		ctx.moveTo(cmd.x || width / 2, 0);
		ctx.lineTo(cmd.x || width / 2, height);
		ctx.stroke();
	}

	function drawLine(ctx, cmd) {
		ctx.strokeStyle = cmd.color || '#10b981';
		ctx.lineWidth = cmd.width || 2;
		ctx.beginPath();
		ctx.moveTo(cmd.x1, cmd.y1);
		ctx.lineTo(cmd.x2, cmd.y2);
		ctx.stroke();
	}

	function drawCircle(ctx, cmd) {
		ctx.strokeStyle = cmd.color || '#3b82f6';
		ctx.lineWidth = cmd.width || 2;
		ctx.beginPath();
		ctx.arc(cmd.x, cmd.y, cmd.radius, 0, 2 * Math.PI);
		if (cmd.fill) {
			ctx.fillStyle = cmd.fillColor || cmd.color || '#3b82f6';
			ctx.fill();
		}
		ctx.stroke();
	}

	function drawArrow(ctx, cmd) {
		const headLength = cmd.headLength || 10;
		const angle = Math.atan2(cmd.y2 - cmd.y1, cmd.x2 - cmd.x1);
		
		ctx.strokeStyle = cmd.color || '#f59e0b';
		ctx.fillStyle = cmd.color || '#f59e0b';
		ctx.lineWidth = cmd.width || 2;
		
		// Línea principal
		ctx.beginPath();
		ctx.moveTo(cmd.x1, cmd.y1);
		ctx.lineTo(cmd.x2, cmd.y2);
		ctx.stroke();
		
		// Punta de flecha
		ctx.beginPath();
		ctx.moveTo(cmd.x2, cmd.y2);
		ctx.lineTo(
			cmd.x2 - headLength * Math.cos(angle - Math.PI / 6),
			cmd.y2 - headLength * Math.sin(angle - Math.PI / 6)
		);
		ctx.lineTo(
			cmd.x2 - headLength * Math.cos(angle + Math.PI / 6),
			cmd.y2 - headLength * Math.sin(angle + Math.PI / 6)
		);
		ctx.closePath();
		ctx.fill();
	}

	function drawText(ctx, cmd) {
		ctx.fillStyle = cmd.color || '#f3f4f6';
		ctx.font = cmd.font || '16px sans-serif';
		ctx.textAlign = cmd.align || 'left';
		ctx.fillText(cmd.text, cmd.x, cmd.y);
	}

	function drawTriangle(ctx, cmd) {
		ctx.strokeStyle = cmd.color || '#8b5cf6';
		ctx.lineWidth = cmd.width || 2;
		ctx.beginPath();
		ctx.moveTo(cmd.x1, cmd.y1);
		ctx.lineTo(cmd.x2, cmd.y2);
		ctx.lineTo(cmd.x3, cmd.y3);
		ctx.closePath();
		if (cmd.fill) {
			ctx.fillStyle = cmd.fillColor || cmd.color || '#8b5cf6';
			ctx.fill();
		}
		ctx.stroke();
	}

	function drawVector(ctx, cmd) {
		drawArrow(ctx, {
			x1: cmd.x || 0,
			y1: cmd.y || 0,
			x2: (cmd.x || 0) + (cmd.dx || 0),
			y2: (cmd.y || 0) + (cmd.dy || 0),
			color: cmd.color,
			width: cmd.width,
			headLength: cmd.headLength
		});
	}


	function drawDiagram(ctx, params) {
		// Dibujar elementos de un diagrama (textos, flechas, etc.)
		if (params.elements && Array.isArray(params.elements)) {
			params.elements.forEach(element => {
				if (element.type === 'text') {
					drawText(ctx, {
						text: element.content,
						x: element.position?.x || 100,
						y: element.position?.y || 100,
						color: element.color || '#f3f4f6',
						font: element.font || '16px sans-serif'
					});
				} else if (element.type === 'arrow') {
					drawArrow(ctx, {
						x1: element.from?.x || 0,
						y1: element.from?.y || 0,
						x2: element.to?.x || 0,
						y2: element.to?.y || 0,
						color: element.color || '#f59e0b'
					});
				}
			});
		}
	}

	function drawHighlight(ctx, params) {
		// Resaltar respuesta correcta con razón
		const content = params.content || '';
		const reason = params.reason || '';
		const x = params.x || params.position?.x || 40;
		const y = params.y || params.position?.y || params.yOffset || 40;
		
		// Si tiene formato antiguo con elements, usar ese
		if (params.elements && Array.isArray(params.elements)) {
			params.elements.forEach(element => {
				if (element.type === 'text') {
					// Dibujar fondo resaltado
					ctx.fillStyle = element.backgroundColor || 'rgba(16, 185, 129, 0.2)';
					const textWidth = ctx.measureText(element.content).width;
					ctx.fillRect(
						(element.position?.x || 100) - 5,
						(element.position?.y || 100) - 20,
						textWidth + 10,
						30
					);
					
					// Dibujar texto
					drawText(ctx, {
						text: element.content,
						x: element.position?.x || 100,
						y: element.position?.y || 100,
						color: element.color || '#10b981',
						font: element.font || 'bold 18px sans-serif'
					});
				}
			});
			return;
		}
		
		// Formato nuevo: content + reason
		ctx.save();
		
		// Dibujar icono de check
		ctx.fillStyle = '#10b981';
		ctx.font = 'bold 24px sans-serif';
		ctx.fillText('✓', x, y);
		
		// Dibujar contenido (puede ser LaTeX)
		const contentX = x + 35;
		ctx.font = 'bold 20px sans-serif';
		ctx.fillStyle = '#10b981';
		
		// Si el contenido tiene $, renderizar con KaTeX
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
		
		// Dibujar razón debajo
		if (reason) {
			ctx.font = '16px sans-serif';
			ctx.fillStyle = '#9ca3af';
			ctx.fillText(`→ ${reason}`, contentX, y + 25);
		}
		
		// Dibujar recuadro resaltado
		const boxWidth = Math.min(700, (params.canvasWidth || 800) - 60);
		const boxHeight = reason ? 60 : 35;
		ctx.strokeStyle = '#10b981';
		ctx.lineWidth = 3;
		ctx.fillStyle = 'rgba(16, 185, 129, 0.1)';
		ctx.fillRect(x - 10, y - 25, boxWidth, boxHeight);
		ctx.strokeRect(x - 10, y - 25, boxWidth, boxHeight);
		
		ctx.restore();
	}

	function drawEquation(ctx, params) {
		// Renderizar ecuación matemática usando KaTeX
		const equation = params.equation || params.latex || '';
		const x = params.x || params.position?.x || 40;
		const y = params.y || params.position?.y || params.yOffset || 40;
		const color = params.color || '#f3f4f6';
		const displayMode = params.displayMode !== false;
		
		try {
			// Renderizar con KaTeX a HTML
			const html = katex.renderToString(equation, {
				throwOnError: false,
				displayMode: displayMode,
				output: 'html',
				trust: true,
				strict: 'ignore'  // Ignorar warnings de caracteres Unicode
			});
			
			// Crear elemento temporal para renderizar
			const tempDiv = document.createElement('div');
			tempDiv.innerHTML = html;
			tempDiv.style.position = 'absolute';
			tempDiv.style.left = '-9999px';
			tempDiv.style.color = color;
			tempDiv.style.fontSize = '18px';
			document.body.appendChild(tempDiv);
			
			// Convertir a imagen usando html2canvas o similar
			// Por ahora, dibujar como texto formateado
			const textContent = tempDiv.textContent || equation;
			ctx.fillStyle = color;
			ctx.font = '18px "Computer Modern", "Latin Modern Math", serif';
			ctx.textAlign = 'left';
			
			// Dibujar con word wrap si es necesario
			const maxWidth = 700;
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
			
			// Limpiar elemento temporal
			document.body.removeChild(tempDiv);
			
			// Opcional: dibujar un recuadro alrededor
			if (params.box || params.highlight) {
				ctx.strokeStyle = color;
				ctx.lineWidth = 2;
				ctx.strokeRect(x - 10, y - 20, maxWidth + 20, lineY - y + 25);
			}
		} catch (error) {
			console.error('Error renderizando ecuación:', error);
			// Fallback: dibujar como texto simple
			ctx.fillStyle = color;
			ctx.font = '16px monospace';
			ctx.fillText(equation, x, y);
		}
	}
</script>

<div class="blackboard-container bg-gray-900 rounded-lg p-6 border-2 border-gray-700">
	<div class="blackboard-header mb-4 pb-3 border-b border-gray-600">
		<h3 class="text-xl font-bold text-blue-400 flex items-center gap-2">
			<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
			</svg>
			Pizarrón de Visualización
		</h3>
		<p class="text-sm text-gray-400 mt-1">{sortedSteps.length} {sortedSteps.length === 1 ? 'paso' : 'pasos'} con diagramas</p>
	</div>
	
	<div class="mini-canvas-stack space-y-4 max-h-[600px] overflow-y-auto pr-2">
		{#each sortedSteps as step (step)}
			<div class="mini-canvas-wrapper bg-gray-800 rounded-lg p-4 border border-gray-600 shadow-lg">
				<div class="step-label flex items-center gap-2 mb-3">
					<div class="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm">
						{step}
					</div>
					<span class="text-blue-300 font-semibold">Paso {step}</span>
					<div class="flex-1 h-px bg-gradient-to-r from-blue-500 to-transparent"></div>
					<span class="text-xs text-gray-400">{canvasByStep[step].length} {canvasByStep[step].length === 1 ? 'comando' : 'comandos'}</span>
				</div>
				<canvas
					bind:this={canvasRefs[step]}
					class="w-full rounded border border-gray-700"
					style="height: 300px;"
				></canvas>
			</div>
		{/each}
		
		{#if sortedSteps.length === 0}
			<div class="empty-state text-center py-12 text-gray-500">
				<svg class="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"></path>
				</svg>
				<p class="text-lg font-medium">No hay visualizaciones disponibles</p>
				<p class="text-sm mt-2">Los diagramas aparecerán aquí cuando el profesor los dibuje</p>
			</div>
		{/if}
	</div>
</div>

<style>
	.blackboard-container {
		animation: fadeIn 0.5s ease-in;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.mini-canvas-wrapper {
		animation: slideIn 0.3s ease-out;
		transition: all 0.2s ease;
	}

	.mini-canvas-wrapper:hover {
		border-color: #3b82f6;
		box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
	}

	@keyframes slideIn {
		from {
			opacity: 0;
			transform: translateX(-20px);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}

	canvas {
		max-width: 100%;
		display: block;
		background: #1f2937;
	}

	.mini-canvas-stack::-webkit-scrollbar {
		width: 8px;
	}

	.mini-canvas-stack::-webkit-scrollbar-track {
		background: #1f2937;
		border-radius: 4px;
	}

	.mini-canvas-stack::-webkit-scrollbar-thumb {
		background: #4b5563;
		border-radius: 4px;
	}

	.mini-canvas-stack::-webkit-scrollbar-thumb:hover {
		background: #6b7280;
	}
</style>
