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

		switch (cmd.type) {
			case 'draw_axis':
				drawAxis(cmd);
				break;
			case 'draw_line':
				drawLine(cmd);
				break;
			case 'draw_circle':
				drawCircle(cmd);
				break;
			case 'draw_arrow':
				drawArrow(cmd);
				break;
			case 'draw_text':
				drawText(cmd);
				break;
			case 'draw_triangle':
				drawTriangle(cmd);
				break;
			case 'draw_vector':
				drawVector(cmd);
				break;
			case 'clear':
				clearCanvas();
				break;
			default:
				console.warn('Comando de canvas desconocido:', cmd.type);
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
