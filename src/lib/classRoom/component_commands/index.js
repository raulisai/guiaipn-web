export const componentCommandRegistry = {
	image_component: () => import('./ImageComponent.svelte')
};

export function resolveComponentCommand(commandType) {
	const normalizedType = commandType?.toLowerCase().trim();
	return normalizedType ? componentCommandRegistry[normalizedType] || null : null;
}

export function isComponentCommandRegistered(commandType) {
	const normalizedType = commandType?.toLowerCase().trim();
	return normalizedType in componentCommandRegistry;
}

export function getRegisteredComponentCommands() {
	return Object.keys(componentCommandRegistry);
}

export function normalizeComponentCommand(command) {
	if (!command) {
		console.error('❌ component command es null/undefined');
		return null;
	}

	let commandData = command;
	let step = command.step || command.step_number || 1;

	if (command.command && typeof command.command === 'object') {
		commandData = command.command;
		step = command.step || command.step_number || step;
	}

	const rawType = commandData.command || commandData.type;
	const params = commandData.parameters || commandData.params || {};

	if (!rawType || typeof rawType !== 'string') {
		console.error('❌ component command error: invalid commandType', rawType);
		return null;
	}

	const type = rawType.toLowerCase();
	const placement = commandData.placement || command.placement || params.placement || 'panel';
	const layout = commandData.layout || command.layout || params.layout || {};

	return {
		type,
		params,
		step,
		placement,
		layout
	};
}
