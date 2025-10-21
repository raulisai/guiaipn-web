<script>
	import { onMount } from 'svelte';
	import katex from 'katex';

	let { commands = [], stepNumber = 0 } = $props();
	
	let canvasRef = $state(null);
	let ctx = $state(null);
	// currentYOffset no debe ser reactivo para evitar loops infinitos
	let currentYOffset = 50;

	onMount(() => {
		if (canvasRef) {
			ctx = canvasRef.getContext('2d');
			// Configurar canvas con mayor resolución para mejor calidad
			const dpr = window.devicePixelRatio || 1;
			const rect = canvasRef.getBoundingClientRect();
			canvasRef.width = rect.width * dpr;
			canvasRef.height = rect.height * dpr;
			ctx.scale(dpr, dpr);
			
			// Fondo inicial
			clearCanvas();
		}
	});

	// Ejecutar comandos cuando cambien - redibujar todo el canvas
	$effect(() => {
		if (ctx && commands.length > 0) {
			clearCanvas();
			currentYOffset = 50;
			executeAllCommands();
		}
	});

	function executeAllCommands() {
		if (!ctx) return;

		// Si solo hay comandos de un paso (el actual), no mostrar etiquetas
		// porque ya están en el StepCard
		const uniqueSteps = [...new Set(commands.map(cmd => cmd.step))];
		const showStepLabels = uniqueSteps.length > 1;

		// Agrupar comandos por paso
		const commandsByStep = {};
		commands.forEach(command => {
			const step = command.step || 1;
			if (!commandsByStep[step]) {
				commandsByStep[step] = [];
			}
			commandsByStep[step].push(command);
		});

		// Ejecutar comandos por paso en orden
		Object.keys(commandsByStep).sort((a, b) => Number(a) - Number(b)).forEach(step => {
			// Solo dibujar etiqueta si hay múltiples pasos
			if (showStepLabels) {
				drawStepLabel(step, currentYOffset);
				currentYOffset += 35;
			}

			// Ejecutar comandos del paso
			commandsByStep[step].forEach(command => {
				executeCommand(command.command, step);
			});

			// Espacio entre pasos (solo si hay múltiples)
			if (showStepLabels) {
				currentYOffset += 30;
			}
		});
	}

	function drawStepLabel(step, y) {
		if (!ctx) return;
		
		ctx.save();
		ctx.fillStyle = '#3b82f6';
		ctx.strokeStyle = '#3b82f6';
		ctx.lineWidth = 2;
		
		// Dibujar línea decorativa
		ctx.beginPath();
		ctx.moveTo(20, y);
		ctx.lineTo(60, y);
		ctx.stroke();
		
		// Dibujar texto del paso
		ctx.font = 'bold 16px sans-serif';
		ctx.fillText(`Paso ${step}`, 70, y + 5);
		
		// Línea decorativa derecha
		ctx.beginPath();
		ctx.moveTo(140, y);
		ctx.lineTo(760, y);
		ctx.stroke();
		
		ctx.restore();
	}

	function executeCommand(cmd, step) {
		if (!ctx || !cmd) return;

		ctx.save();

		// El backend puede enviar cmd.command o directamente cmd.type
		const commandType = cmd.command || cmd.type;
		const params = { ...cmd.parameters || cmd, step };

		switch (commandType) {
			case 'draw_axis':
				drawAxis(params);
				break;
			case 'draw_line':
				drawLine(params);
				break;
			case 'draw_circle':
				drawCircle(params);
				break;
			case 'draw_arrow':
				drawArrow(params);
				break;
			case 'draw_text':
				drawText(params);
				break;
			case 'draw_triangle':
				drawTriangle(params);
				break;
			case 'draw_vector':
				drawVector(params);
				break;
			case 'draw_diagram':
				drawDiagram(params);
				break;
			case 'draw_equation':
				drawEquation(params);
				break;
			case 'highlight':
				drawHighlight(params);
				break;
			case 'clear':
				clearCanvas();
				break;
			default:
				console.warn('Comando de canvas desconocido:', commandType, cmd);
		}

		ctx.restore();
	}

	function drawAxis(cmd) {
		ctx.strokeStyle = cmd.color || '#6b7280';
		ctx.lineWidth = 2;
		ctx.beginPath();
		// Eje X
		ctx.moveTo(0, cmd.y || canvasRef.height / 2);
		ctx.lineTo(canvasRef.width, cmd.y || canvasRef.height / 2);
		// Eje Y
		ctx.moveTo(cmd.x || canvasRef.width / 2, 0);
		ctx.lineTo(cmd.x || canvasRef.width / 2, canvasRef.height);
		ctx.stroke();
	}

	function drawLine(cmd) {
		ctx.strokeStyle = cmd.color || '#10b981';
		ctx.lineWidth = cmd.width || 2;
		ctx.beginPath();
		ctx.moveTo(cmd.x1, cmd.y1);
		ctx.lineTo(cmd.x2, cmd.y2);
		ctx.stroke();
	}

	function drawCircle(cmd) {
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

	function drawArrow(cmd) {
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

	function drawText(cmd) {
		ctx.fillStyle = cmd.color || '#f3f4f6';
		ctx.font = cmd.font || '16px sans-serif';
		ctx.textAlign = cmd.align || 'left';
		ctx.fillText(cmd.text, cmd.x, cmd.y);
	}

	function drawTriangle(cmd) {
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

	function drawVector(cmd) {
		drawArrow({
			x1: cmd.x || 0,
			y1: cmd.y || 0,
			x2: (cmd.x || 0) + (cmd.dx || 0),
			y2: (cmd.y || 0) + (cmd.dy || 0),
			color: cmd.color,
			width: cmd.width,
			headLength: cmd.headLength
		});
	}

	function clearCanvas() {
		if (!ctx || !canvasRef) return;
		const rect = canvasRef.getBoundingClientRect();
		ctx.fillStyle = '#1f2937';
		ctx.fillRect(0, 0, rect.width, rect.height);
	}

	function drawDiagram(params) {
		// Dibujar elementos de un diagrama (textos, flechas, etc.)
		if (params.elements && Array.isArray(params.elements)) {
			params.elements.forEach(element => {
				if (element.type === 'text') {
					drawText({
						text: element.content,
						x: element.position?.x || 100,
						y: element.position?.y || 100,
						color: element.color || '#f3f4f6',
						font: element.font || '16px sans-serif'
					});
				} else if (element.type === 'arrow') {
					drawArrow({
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

	function drawHighlight(params) {
		// Resaltar respuesta correcta con razón
		const content = params.content || '';
		const reason = params.reason || '';
		const x = params.x || params.position?.x || 40;
		const y = params.y || params.position?.y || currentYOffset;
		
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
					drawText({
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
		const boxWidth = 700;
		const boxHeight = reason ? 60 : 35;
		ctx.strokeStyle = '#10b981';
		ctx.lineWidth = 3;
		ctx.fillStyle = 'rgba(16, 185, 129, 0.1)';
		ctx.fillRect(x - 10, y - 25, boxWidth, boxHeight);
		ctx.strokeRect(x - 10, y - 25, boxWidth, boxHeight);
		
		// Actualizar offset vertical
		currentYOffset = y + boxHeight + 20;
		
		ctx.restore();
	}

	function drawEquation(params) {
		// Renderizar ecuación matemática usando KaTeX
		const equation = params.equation || params.latex || '';
		const x = params.x || params.position?.x || 40;
		const y = params.y || params.position?.y || currentYOffset;
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
			
			// Actualizar offset vertical
			currentYOffset = lineY + 30;
			
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
			currentYOffset = y + 30;
		}
	}
</script>

<div class="canvas-container bg-gray-900 rounded-lg p-4 border border-gray-700">
	<canvas
		bind:this={canvasRef}
		class="w-full rounded"
		style="height: auto; min-height: 500px;"
	></canvas>
</div>

<style>
	.canvas-container {
		animation: fadeIn 0.5s ease-in;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	canvas {
		max-width: 100%;
		height: auto;
		display: block;
	}
</style>
