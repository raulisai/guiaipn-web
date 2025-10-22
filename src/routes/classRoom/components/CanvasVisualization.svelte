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
	
	// Referencia al contenedor scrolleable
	let surfaceRef = $state(null);
	
	// Contador de comandos previos para detectar nuevos elementos
	let previousCommandCount = $state(0);

	// Redibujar canvas cuando cambien los comandos
	$effect(() => {
		if (commands.length > 0) {
			const currentCommandCount = commands.length;
			const hasNewContent = currentCommandCount > previousCommandCount;
			
			sortedSteps.forEach(step => {
				const canvasElement = canvasRefs[step];
				if (canvasElement) {
					drawCanvas(canvasElement, canvasByStep[step]);
				}
			});
			
			// Auto-scroll al nuevo contenido si se agregaron comandos
			if (hasNewContent && surfaceRef && previousCommandCount > 0) {
				setTimeout(() => {
					scrollToLatestStep();
				}, 150); // Delay para que el DOM se actualice y el canvas se dibuje
			}
			
			previousCommandCount = currentCommandCount;
		}
	});
	
	// Función para hacer scroll al último paso agregado (centrado)
	function scrollToLatestStep() {
		if (!surfaceRef) return;
		
		const lastStep = sortedSteps[sortedSteps.length - 1];
		const lastCanvas = canvasRefs[lastStep];
		
		if (lastCanvas) {
			// Obtener la posición del último canvas (incluye la etiqueta del paso)
			const canvasTop = lastCanvas.offsetTop;
			const canvasHeight = lastCanvas.offsetHeight;
			const surfaceHeight = surfaceRef.clientHeight;
			const surfaceScrollHeight = surfaceRef.scrollHeight;
			
			// Incluir la etiqueta del paso (aproximadamente 50px arriba del canvas)
			const labelOffset = 50;
			const totalContentHeight = canvasHeight + labelOffset;
			
			// Calcular posición para centrar el nuevo contenido
			// Si el contenido es más pequeño que el viewport, centrarlo
			// Si es más grande, mostrar desde el inicio con padding
			let scrollPosition;
			
			if (totalContentHeight < surfaceHeight) {
				// Centrar el contenido si cabe en la vista
				scrollPosition = (canvasTop - labelOffset) - (surfaceHeight - totalContentHeight) / 2;
			} else {
				// Si es más grande, mostrar desde arriba con padding
				scrollPosition = canvasTop - labelOffset - 20;
			}
			
			// Asegurar que no exceda los límites
			const maxScroll = surfaceScrollHeight - surfaceHeight;
			scrollPosition = Math.max(0, Math.min(scrollPosition, maxScroll));
			
			surfaceRef.scrollTo({
				top: scrollPosition,
				behavior: 'smooth'
			});
		}
	}

	// Dibujar en un canvas individual
	function drawCanvas(canvasElement, stepCommands) {
		if (!canvasElement || !stepCommands) return;
		
		const ctx = canvasElement.getContext('2d');
		const dpr = window.devicePixelRatio || 1;
		const rect = canvasElement.getBoundingClientRect();
		
		// Calcular altura dinámica basada en número de comandos
		// Mínimo 120px, máximo 400px, ~60px por comando
		const calculatedHeight = Math.min(400, Math.max(120, stepCommands.length * 60 + 40));
		
		canvasElement.width = rect.width * dpr;
		canvasElement.height = calculatedHeight * dpr;
		canvasElement.style.height = `${calculatedHeight}px`;
		ctx.scale(dpr, dpr);
		
		// Fondo transparente homologado
		ctx.fillStyle = 'transparent';
		ctx.clearRect(0, 0, rect.width, calculatedHeight);
		
		// Ejecutar comandos del paso
		let currentYOffset = 30;
		stepCommands.forEach(command => {
			executeCommand(ctx, command.command, rect.width, currentYOffset);
			currentYOffset += 50;
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
		ctx.strokeStyle = cmd.color || 'rgba(255, 255, 255, 0.5)';
		ctx.lineWidth = 2;
		ctx.shadowColor = 'rgba(255, 255, 255, 0.2)';
		ctx.shadowBlur = 1;
		ctx.beginPath();
		// Eje X
		ctx.moveTo(0, cmd.y || height / 2);
		ctx.lineTo(width, cmd.y || height / 2);
		// Eje Y
		ctx.moveTo(cmd.x || width / 2, 0);
		ctx.lineTo(cmd.x || width / 2, height);
		ctx.stroke();
		ctx.shadowBlur = 0;
	}

	function drawLine(ctx, cmd) {
		ctx.strokeStyle = cmd.color || '#ffffff';
		ctx.lineWidth = cmd.width || 3;
		ctx.shadowColor = 'rgba(255, 255, 255, 0.3)';
		ctx.shadowBlur = 2;
		ctx.beginPath();
		ctx.moveTo(cmd.x1, cmd.y1);
		ctx.lineTo(cmd.x2, cmd.y2);
		ctx.stroke();
		ctx.shadowBlur = 0;
	}

	function drawCircle(ctx, cmd) {
		ctx.strokeStyle = cmd.color || '#ffd700';
		ctx.lineWidth = cmd.width || 3;
		ctx.shadowColor = 'rgba(255, 215, 0, 0.3)';
		ctx.shadowBlur = 2;
		ctx.beginPath();
		ctx.arc(cmd.x, cmd.y, cmd.radius, 0, 2 * Math.PI);
		if (cmd.fill) {
			ctx.fillStyle = cmd.fillColor || cmd.color || 'rgba(255, 215, 0, 0.3)';
			ctx.fill();
		}
		ctx.stroke();
		ctx.shadowBlur = 0;
	}

	function drawArrow(ctx, cmd) {
		const headLength = cmd.headLength || 12;
		const angle = Math.atan2(cmd.y2 - cmd.y1, cmd.x2 - cmd.x1);
		
		ctx.strokeStyle = cmd.color || '#ff6b6b';
		ctx.fillStyle = cmd.color || '#ff6b6b';
		ctx.lineWidth = cmd.width || 3;
		ctx.shadowColor = 'rgba(255, 107, 107, 0.3)';
		ctx.shadowBlur = 2;
		
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
		ctx.shadowBlur = 0;
	}

	function drawText(ctx, cmd) {
		ctx.fillStyle = cmd.color || '#ffffff';
		ctx.font = cmd.font || 'bold 18px sans-serif';
		ctx.textAlign = cmd.align || 'left';
		ctx.shadowColor = 'rgba(255, 255, 255, 0.3)';
		ctx.shadowBlur = 2;
		ctx.fillText(cmd.text, cmd.x, cmd.y);
		ctx.shadowBlur = 0;
	}

	function drawTriangle(ctx, cmd) {
		ctx.strokeStyle = cmd.color || '#4ecdc4';
		ctx.lineWidth = cmd.width || 3;
		ctx.shadowColor = 'rgba(78, 205, 196, 0.3)';
		ctx.shadowBlur = 2;
		ctx.beginPath();
		ctx.moveTo(cmd.x1, cmd.y1);
		ctx.lineTo(cmd.x2, cmd.y2);
		ctx.lineTo(cmd.x3, cmd.y3);
		ctx.closePath();
		if (cmd.fill) {
			ctx.fillStyle = cmd.fillColor || cmd.color || 'rgba(78, 205, 196, 0.3)';
			ctx.fill();
		}
		ctx.stroke();
		ctx.shadowBlur = 0;
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
						color: element.color || '#ffffff',
						font: element.font || 'bold 18px sans-serif'
					});
				} else if (element.type === 'arrow') {
					drawArrow(ctx, {
						x1: element.from?.x || 0,
						y1: element.from?.y || 0,
						x2: element.to?.x || 0,
						y2: element.to?.y || 0,
						color: element.color || '#ff6b6b'
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
						color: element.color || '#4ade80',
						font: element.font || 'bold 20px sans-serif'
					});
				}
			});
			return;
		}
		
		// Formato nuevo: content + reason
		ctx.save();
		
		// Dibujar icono de check
		ctx.fillStyle = '#4ade80';
		ctx.font = 'bold 28px sans-serif';
		ctx.shadowColor = 'rgba(74, 222, 128, 0.5)';
		ctx.shadowBlur = 4;
		ctx.fillText('✓', x, y);
		
		// Dibujar contenido (puede ser LaTeX)
		const contentX = x + 40;
		ctx.font = 'bold 22px sans-serif';
		ctx.fillStyle = '#4ade80';
		
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
			ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
			ctx.fillText(`→ ${reason}`, contentX, y + 28);
		}
		
		// Dibujar recuadro resaltado - usar todo el ancho disponible
		const boxWidth = (params.canvasWidth || 800) - 60;
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
	}

	function drawEquation(ctx, params) {
		// Renderizar ecuación matemática usando KaTeX
		const equation = params.equation || params.latex || '';
		const x = params.x || params.position?.x || 40;
		const y = params.y || params.position?.y || params.yOffset || 40;
		const color = params.color || '#ffd700';
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
			ctx.font = 'bold 20px "Computer Modern", "Latin Modern Math", serif';
			ctx.textAlign = 'left';
			ctx.shadowColor = 'rgba(255, 215, 0, 0.3)';
			ctx.shadowBlur = 2;
			
			// Dibujar con word wrap si es necesario - usar todo el ancho disponible
			const maxWidth = (params.canvasWidth || 800) - 80; // Restar padding
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
				ctx.lineWidth = 3;
				ctx.shadowColor = 'rgba(255, 215, 0, 0.3)';
				ctx.shadowBlur = 2;
				ctx.strokeRect(x - 10, y - 20, maxWidth + 20, lineY - y + 25);
			}
			ctx.shadowBlur = 0;
		} catch (error) {
			console.error('Error renderizando ecuación:', error);
			// Fallback: dibujar como texto simple
			ctx.fillStyle = color;
			ctx.font = '16px monospace';
			ctx.fillText(equation, x, y);
		}
	}
</script>

<div class="blackboard-container">
	<!-- Marco del pizarrón -->
	<div class="blackboard-frame">
		<div class="blackboard-header">
			<h3 class="blackboard-title">◆ Pizarrón</h3>
		</div>
		
		<!-- Superficie del pizarrón -->
		<div class="blackboard-surface" bind:this={surfaceRef}>
			{#each sortedSteps as step (step)}
			<!-- Etiqueta de paso minimalista -->
			<div class="step-label">
				<span class="step-text">Paso {step}</span>
			</div>
			
			<!-- Canvas del paso -->
			<canvas
				bind:this={canvasRefs[step]}
				class="blackboard-canvas"
			></canvas>
		{/each}
		
			{#if sortedSteps.length === 0}
				<div class="empty-state">
					<p class="chalk-text">El pizarrón está limpio</p>
					<p class="chalk-text-small">Las visualizaciones aparecerán aquí</p>
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	.blackboard-container {
		animation: fadeIn 0.5s ease-in;
		height: 90%;
		display: flex;
		flex-direction: column;
	}

	/* Marco con estilo homologado - altura fija para tomar todo el espacio disponible */
	.blackboard-frame {
		background: rgba(15, 23, 42, 0.15);
		border-radius: 8px;
		padding: 0;
		backdrop-filter: blur(4px);
		border: 1px solid rgba(99, 102, 241, 0.1);
		overflow: hidden;
		/* Tomar todo el alto disponible del contenedor padre */
		height: 100%;
		min-height: 400px;
		display: flex;
		flex-direction: column;
	}

	.blackboard-header {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 10px 16px;
		border-bottom: 1px solid rgba(99, 102, 241, 0.1);
		background: rgba(15, 23, 42, 0.3);
	}

	.blackboard-title {
		color: #818cf8;
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.12em;
		opacity: 0.8;
		position: static;
		transform: none;
	}

	/* Superficie homologada con scroll interno - contenedor scrolleable */
	.blackboard-surface {
		background: transparent;
		border-radius: 0;
		padding: 16px;
		flex: 1;
		overflow-y: auto;
		overflow-x: hidden;
		min-height: 0; /* Importante para que funcione el scroll en flex */
		max-height: 100%; /* Asegurar que no crezca más allá del contenedor */
		/* Smooth scrolling */
		scroll-behavior: smooth;
	}

	/* Etiqueta de paso minimalista */
	.step-label {
		margin: 20px 0 16px 0;
	}

	.step-text {
		color: #818cf8;
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.15em;
		text-shadow: 0 0 8px rgba(129, 140, 248, 0.4);
		font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
		opacity: 0.8;
	}

	/* Canvas sin bordes - ocupa todo el ancho */
	.blackboard-canvas {
		width: 100%;
		max-width: 100%;
		display: block;
		margin-bottom: 8px;
		/* Sin bordes ni fondos, se integra con el pizarrón */
	}

	/* Estado vacío */
	.empty-state {
		text-align: center;
		padding: 60px 20px;
	}

	.chalk-text {
		color: rgba(129, 140, 248, 0.6);
		font-size: 1.125rem;
		font-weight: 500;
		margin-bottom: 8px;
		text-shadow: 0 0 10px rgba(129, 140, 248, 0.3);
	}

	.chalk-text-small {
		color: rgba(129, 140, 248, 0.4);
		font-size: 0.875rem;
		text-shadow: 0 0 8px rgba(129, 140, 248, 0.2);
	}

	/* Scrollbar más visible y elegante */
	.blackboard-surface::-webkit-scrollbar {
		width: 10px;
	}

	.blackboard-surface::-webkit-scrollbar-track {
		background: rgba(15, 23, 42, 0.4);
		border-radius: 5px;
		margin: 4px 0;
	}

	.blackboard-surface::-webkit-scrollbar-thumb {
		background: rgba(99, 102, 241, 0.5);
		border-radius: 5px;
		border: 2px solid rgba(15, 23, 42, 0.4);
		transition: background 0.2s ease;
	}

	.blackboard-surface::-webkit-scrollbar-thumb:hover {
		background: rgba(99, 102, 241, 0.7);
	}

	/* Scrollbar para Firefox */
	.blackboard-surface {
		scrollbar-width: thin;
		scrollbar-color: rgba(99, 102, 241, 0.5) rgba(15, 23, 42, 0.4);
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
</style>
