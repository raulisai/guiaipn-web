/**
 * Servicio para manejar aclaraciones breves (solo voz o texto corto)
 * Mantiene un estado independiente de la explicación principal
 */

import { writable } from 'svelte/store';
import { socketService, SERVER_EVENTS } from '$lib/api/socket';
import { speechService } from './speechService';
import { explanationStore } from '$lib/stores/explanationStore.js';

const initialState = {
	isActive: false,
	mode: 'brief',
	message: '',
	isDeferred: false,
	reason: null,
	isStreaming: false,
	question: '',
	context: null
};

const clarificationState = writable({ ...initialState });

class ClarificationService {
	constructor() {
		this.isActive = false;
		this.mode = 'brief';
		this.question = '';
		this.context = null;
	}

	setState(partial) {
		clarificationState.update((state) => ({
			...state,
			...partial
		}));
	}

	reset() {
		this.isActive = false;
		this.mode = 'brief';
		this.question = '';
		this.context = null;
		clarificationState.set({ ...initialState });
	}

	prepareInterruption(question, context) {
		this.question = question;
		this.context = context;
		this.mode = 'brief';
		this.isActive = true;

		this.setState({
			isActive: true,
			question,
			context,
			mode: 'brief',
			isStreaming: true
		});
	}

	handleMessage(payload) {
		if (!payload) return;

		const { mode = 'brief', message = '', is_deferred = false, reason = null } = payload;

		this.mode = mode;
		this.setState({
			mode,
			message,
			isDeferred: Boolean(is_deferred),
			reason,
			isStreaming: false
		});

		if (message) {
			speechService.speak(message);
		}

		setTimeout(() => {
			this.reset();
		}, 4000);
	}

	/**
	 * Indica si actualmente estamos manejando una aclaración (evita tocar el buffer)
	 */
	isClarifying() {
		return this.isActive;
	}

	getStore() {
		return clarificationState;
	}
}

export const clarificationService = new ClarificationService();
export { clarificationState };
