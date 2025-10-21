<script>
	import { onMount } from 'svelte';

	let { commands = [], stepNumber = 0 } = $props();
	
	let canvasRef = $state(null);
	let ctx = $state(null);

	onMount(() => {
		if (canvasRef) {
			ctx = canvasRef.getContext('2d');
			// Configurar canvas
			ctx.fillStyle = '#1f2937';
			ctx.fillRect(0, 0, canvasRef.width, canvasRef.height);
		}
	});

	// Ejecutar comandos cuando cambien
	$effect(() => {
		if (ctx && commands.length > 0) {
			executeCommands();
		}
	});

	function executeCommands() {
		if (!ctx) return;

		commands.forEach(command => {
			if (command.step === stepNumber) {
				executeCommand(command.command);
			}
		});
	}

	function executeCommand(cmd) {
		if (!ctx || !cmd) return;

		ctx.save();

		// El backend puede enviar cmd.command o directamente cmd.type
		const commandType = cmd.command || cmd.type;
		const params = cmd.parameters || cmd;

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
		ctx.fillStyle = '#1f2937';
		ctx.fillRect(0, 0, canvasRef.width, canvasRef.height);
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
		// Resaltar elementos (similar a drawDiagram pero con énfasis visual)
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
		}
	}

	function drawEquation(params) {
		// Renderizar ecuación matemática en el canvas
		// El backend envía la ecuación en formato LaTeX
		const equation = params.equation || params.latex || '';
		const x = params.x || params.position?.x || 100;
		const y = params.y || params.position?.y || 100;
		const color = params.color || '#3b82f6';
		const fontSize = params.fontSize || params.font_size || 18;
		
		// Renderizar la ecuación como texto (simplificado)
		// En una implementación completa, usarías KaTeX para renderizar LaTeX
		ctx.fillStyle = color;
		ctx.font = `${fontSize}px "Computer Modern", serif`;
		ctx.textAlign = 'left';
		ctx.fillText(equation, x, y);
		
		// Opcional: dibujar un recuadro alrededor
		if (params.box || params.highlight) {
			const textWidth = ctx.measureText(equation).width;
			ctx.strokeStyle = color;
			ctx.lineWidth = 2;
			ctx.strokeRect(x - 5, y - fontSize - 5, textWidth + 10, fontSize + 10);
		}
	}
</script>

<div class="canvas-container bg-gray-900 rounded-lg p-4 border border-gray-700">
	<canvas
		bind:this={canvasRef}
		width="800"
		height="400"
		class="w-full h-auto rounded"
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
