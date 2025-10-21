/**
 * Servicio de síntesis de voz en español
 * Utiliza la Web Speech API del navegador
 */

class SpeechService {
	constructor() {
		// Verificar que estamos en el navegador
		if (typeof window === 'undefined') {
			this.synth = null;
			this.currentUtterance = null;
			this.isPaused = false;
			this.isEnabled = false;
			this.queue = [];
			this.spanishVoice = null;
			return;
		}

		this.synth = window.speechSynthesis;
		this.currentUtterance = null;
		this.isPaused = false;
		this.isEnabled = false;
		this.queue = [];
		this.spanishVoice = null;
		
		// Inicializar voces cuando estén disponibles
		this.initVoices();
	}

	/**
	 * Inicializa y selecciona la mejor voz en español
	 */
	initVoices() {
		if (!this.synth) return;

		const loadVoices = () => {
			const voices = this.synth.getVoices();
			
			console.log('Voces disponibles:', voices.length);
			
			// Si no hay voces aún, esperar
			if (voices.length === 0) {
				console.log('Esperando a que se carguen las voces...');
				return;
			}
			
			// Buscar voces en español, priorizando las de España o México
			const spanishVoices = voices.filter(voice => 
				voice.lang.startsWith('es-')
			);

			console.log('Voces en español encontradas:', spanishVoices.length);

			if (spanishVoices.length > 0) {
				// Prioridad: es-MX (México) > es-ES (España) > cualquier otra
				this.spanishVoice = 
					spanishVoices.find(v => v.lang === 'es-MX') ||
					spanishVoices.find(v => v.lang === 'es-ES') ||
					spanishVoices[0];
				
				console.log('✅ Voz seleccionada:', this.spanishVoice.name, this.spanishVoice.lang);
			} else {
				// Si no hay voces en español, usar la primera disponible
				console.warn('⚠️ No se encontraron voces en español, usando voz por defecto');
				if (voices.length > 0) {
					this.spanishVoice = voices[0];
					console.log('Usando:', this.spanishVoice.name, this.spanishVoice.lang);
				}
			}
		};

		// Cargar voces inmediatamente si están disponibles
		loadVoices();

		// También escuchar el evento por si las voces se cargan después
		if (this.synth.onvoiceschanged !== undefined) {
			this.synth.onvoiceschanged = loadVoices;
		}
		
		// En algunos navegadores, las voces tardan en cargar
		// Intentar de nuevo después de un momento
		setTimeout(() => {
			if (!this.spanishVoice) {
				console.log('Reintentando cargar voces...');
				loadVoices();
			}
		}, 100);
	}

	/**
	 * Habilita o deshabilita la síntesis de voz
	 */
	setEnabled(enabled) {
		this.isEnabled = enabled;
		console.log('speechService.setEnabled:', enabled);
		if (!enabled) {
			this.stop();
		} else {
			console.log('Voz disponible:', this.spanishVoice ? this.spanishVoice.name : 'No voice selected');
		}
	}

	/**
	 * Verifica si la síntesis de voz está habilitada
	 */
	getEnabled() {
		return this.isEnabled;
	}

	/**
	 * Habla un texto
	 * @param {string} text - Texto a hablar
	 * @param {Object} options - Opciones de configuración
	 */
	speak(text, options = {}) {
		if (!this.synth || !this.isEnabled || !text) {
			console.log('speak() cancelado:', { synth: !!this.synth, enabled: this.isEnabled, hasText: !!text });
			return;
		}

		// Limpiar el texto de LaTeX y caracteres especiales
		const cleanText = this.cleanText(text);
		
		if (!cleanText.trim()) {
			console.log('speak() cancelado: texto vacío después de limpiar');
			return;
		}

		console.log('speak():', cleanText.substring(0, 100));

		const utterance = new SpeechSynthesisUtterance(cleanText);
		
		// Configurar voz en español
		if (this.spanishVoice) {
			utterance.voice = this.spanishVoice;
			utterance.lang = this.spanishVoice.lang;
			console.log('Usando voz:', this.spanishVoice.name);
		} else {
			// Si no hay voz seleccionada, usar idioma español por defecto
			utterance.lang = 'es-MX';
			console.log('Usando voz por defecto del navegador (es-MX)');
		}
		
		// Configuración de velocidad, tono y volumen
		utterance.rate = options.rate || 1.0;  // Velocidad (0.1 a 10)
		utterance.pitch = options.pitch || 1.0; // Tono (0 a 2)
		utterance.volume = options.volume || 1.0; // Volumen (0 a 1)

		// Callbacks
		utterance.onstart = () => {
			this.currentUtterance = utterance;
			if (options.onStart) options.onStart();
		};

		utterance.onend = () => {
			this.currentUtterance = null;
			if (options.onEnd) options.onEnd();
			
			// Procesar siguiente en la cola
			if (this.queue.length > 0) {
				const next = this.queue.shift();
				this.speak(next.text, next.options);
			}
		};

		utterance.onerror = (event) => {
			console.error('Error en síntesis de voz:', event);
			if (options.onError) options.onError(event);
		};

		// Si ya hay algo hablando, agregar a la cola
		if (this.synth.speaking && !this.isPaused) {
			this.queue.push({ text, options });
		} else {
			this.synth.speak(utterance);
		}
	}

	/**
	 * Limpia el texto de LaTeX y caracteres especiales
	 */
	cleanText(text) {
		let cleaned = text;
		
		// Remover comandos LaTeX comunes
		cleaned = cleaned.replace(/\\text\{([^}]+)\}/g, '$1');
		cleaned = cleaned.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1 entre $2');
		cleaned = cleaned.replace(/\\sqrt\{([^}]+)\}/g, 'raíz cuadrada de $1');
		cleaned = cleaned.replace(/\\[a-zA-Z]+/g, '');
		
		// Remover símbolos matemáticos y reemplazar por palabras
		cleaned = cleaned.replace(/\$/g, '');
		cleaned = cleaned.replace(/\^/g, ' elevado a ');
		cleaned = cleaned.replace(/_/g, ' sub ');
		cleaned = cleaned.replace(/\{/g, '');
		cleaned = cleaned.replace(/\}/g, '');
		cleaned = cleaned.replace(/\\/g, '');
		
		// Limpiar espacios múltiples
		cleaned = cleaned.replace(/\s+/g, ' ').trim();
		
		return cleaned;
	}

	/**
	 * Pausa la síntesis de voz
	 */
	pause() {
		if (!this.synth) return;
		if (this.synth.speaking && !this.isPaused) {
			this.synth.pause();
			this.isPaused = true;
		}
	}

	/**
	 * Reanuda la síntesis de voz
	 */
	resume() {
		if (!this.synth) return;
		if (this.isPaused) {
			this.synth.resume();
			this.isPaused = false;
		}
	}

	/**
	 * Detiene la síntesis de voz
	 */
	stop() {
		if (!this.synth) return;
		
		this.synth.cancel();
		this.currentUtterance = null;
		this.queue = [];
		this.isPaused = false;
	}

	/**
	 * Crea un utterance sin reproducirlo (para control manual)
	 */
	createUtterance(text, options = {}) {
		if (!this.synth) return null;

		const cleanText = this.cleanText(text);
		if (!cleanText.trim()) return null;

		const utterance = new SpeechSynthesisUtterance(cleanText);
		
		// Configurar voz
		if (this.spanishVoice) {
			utterance.voice = this.spanishVoice;
			utterance.lang = this.spanishVoice.lang;
		} else {
			utterance.lang = 'es-MX';
		}
		
		// Configuración
		utterance.rate = options.rate || 1.0;
		utterance.pitch = options.pitch || 1.0;
		utterance.volume = options.volume || 1.0;

		return utterance;
	}

	/**
	 * Reproduce un utterance creado manualmente
	 */
	speakUtterance(utterance) {
		if (!this.synth || !this.isEnabled || !utterance) return;
		
		this.currentUtterance = utterance;
		this.synth.speak(utterance);
	}

	/**
	 * Verifica si está hablando actualmente
	 */
	isSpeaking() {
		if (!this.synth) return false;
		return this.synth.speaking;
	}

	/**
	 * Obtiene las voces disponibles en español
	 */
	getSpanishVoices() {
		if (!this.synth) return [];
		const voices = this.synth.getVoices();
		return voices.filter(voice => voice.lang.startsWith('es-'));
	}
}

// Exportar instancia única
export const speechService = new SpeechService();
