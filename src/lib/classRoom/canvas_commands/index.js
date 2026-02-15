// Sistema de registro de comandos de canvas
// Cada comando se mapea a su componente Svelte correspondiente


/**
 * Registro de comandos de canvas
 * Mapea el tipo de comando al componente Svelte que lo renderiza
 */
export const canvasCommandRegistry = {
	draw_axis: () => import('./DrawAxis.svelte'),
	draw_line: () => import('./DrawLine.svelte'),
	draw_circle: () => import('./DrawCircle.svelte'),
	draw_arrow: () => import('./DrawArrow.svelte'),
	draw_text: () => import('./DrawText.svelte'),
	draw_triangle: () => import('./DrawTriangle.svelte'),
	draw_vector: () => import('./DrawVector.svelte'),
	draw_diagram: () => import('./DrawDiagram.svelte'),
	draw_equation: () => import('./DrawEquation.svelte'),
	highlight: () => import('./Highlight.svelte')
};

/**
 * Resuelve un comando a su componente correspondiente
 * @param {string} commandType - Tipo de comando (ej: 'draw_line', 'draw_circle')
 * @returns {Function|null} - Función que retorna el componente Svelte o null si no existe
 */
export function resolveCanvasCommand(commandType) {
	const normalizedType = commandType?.toLowerCase().trim();
	return normalizedType ? canvasCommandRegistry[normalizedType] || null : null;
}

/**
 * Verifica si un comando está registrado
 * @param {string} commandType - Tipo de comando
 * @returns {boolean}
 */
export function isCommandRegistered(commandType) {
	const normalizedType = commandType?.toLowerCase().trim();
	return normalizedType in canvasCommandRegistry;
}

/**
 * Obtiene todos los tipos de comandos registrados
 * @returns {string[]}
 */
export function getRegisteredCommands() {
	return Object.keys(canvasCommandRegistry);
}

/**
 * Normaliza un comando del backend al formato esperado
 * @param {Object} command - Comando del backend
 * @returns {Object} - Comando normalizado
 */
export function normalizeCommand(command) {
	console.log('🔧 normalizeCommand entrada:', command);
	
	if (!command) {
		console.error('❌ comando es null/undefined');
		return null;
	}
	
	// El backend puede enviar dos estructuras:
	// 1. {command: "draw_equation", parameters: {...}, step: 1}
	// 2. {step: 1, command: {command: "draw_equation", parameters: {...}}, renderedAt: null}
	
	let commandData = command;
	let step = command.step || 1;
	
	console.log('📦 Estructura inicial - commandData:', commandData, 'step:', step);
	
	// Si command.command es un objeto, extraerlo (estructura anidada)
	if (command.command && typeof command.command === 'object') {
		console.log('🔀 Detectada estructura anidada, extrayendo command.command');
		commandData = command.command;
		step = command.step || 1;
		console.log('📦 Después de extraer - commandData:', commandData, 'step:', step);
	}
	
	// Extraer el tipo de comando
	const commandType = commandData.command || commandData.type;
	const params = commandData.parameters || commandData.params || {};
	
	console.log('🎯 Extracción final:');
	console.log('  - commandType:', commandType, typeof commandType);
	console.log('  - params:', params);
	console.log('  - step:', step);
	
	if (!commandType || typeof commandType !== 'string') {
		console.error('❌ Canvas command error: invalid commandType', commandType);
		return null;
	}
	
	const result = {
		type: commandType,
		params: params,
		step: step
	};
	
	console.log('✅ Comando normalizado:', result);
	
	return result;
}
