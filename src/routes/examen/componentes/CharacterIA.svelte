<script lang="ts">
	import { examStore } from '$lib/stores/examStore';
	
	// Matriz de frases motivadoras para respuestas correctas
	const mensajesCorrectos = [
		"¡Excelente trabajo! 🎉",
		"¡Muy bien hecho! 👏",
		"¡Correcto! Sigue así 👍",
		"¡Perfecto! Vas por buen camino 🌟",
		"¡Increíble! Dominas este tema 🚀",
		"¡Bien hecho! Eres un genio 🧠",
		"¡Correctísimo! Sigue avanzando 💪",
		"¡Impresionante respuesta! 🔥",
		"¡Excelente! Vas muy bien 👌",
		"¡Acertaste! Continúa aprendiendo 📚"
	];
	
	// Matriz de frases motivadoras para respuestas incorrectas
	const mensajesIncorrectos = [
		"¡Sigue intentando! La práctica hace al maestro 🔄",
		"¡No te rindas! La próxima lo harás mejor 💯",
		"¡Casi! Analiza bien la siguiente pregunta 🧐",
		"¡Aprende del error! Vamos con la siguiente 📝",
		"¡Inténtalo de nuevo! Estás mejorando 📈",
		"¡No pasa nada! Todos aprendemos de los errores ✨",
		"¡Sigue adelante! Cada intento te acerca al éxito 🎯",
		"¡Ánimo! Lo importante es seguir aprendiendo 🌱",
		"¡Tranquilo! Estás en proceso de aprendizaje 🔍",
		"¡No te preocupes! Las equivocaciones son parte del proceso 🛠️"
	];
	
	// Mensaje inicial para cuando no hay respuestas previas
	const mensajeInicial = "¡Selecciona la respuesta correcta!";
	
	// Función para obtener un mensaje aleatorio de la matriz correspondiente
	function getMensajeAleatorio(esCorrecta: boolean): string {
		if (esCorrecta) {
			const indice = Math.floor(Math.random() * mensajesCorrectos.length);
			return mensajesCorrectos[indice];
		} else {
			const indice = Math.floor(Math.random() * mensajesIncorrectos.length);
			return mensajesIncorrectos[indice];
		}
	}
	
	// Calcular el mensaje a mostrar basado en las respuestas anteriores
	$: ultimaPregunta = $examStore.currentQuestion - 1;
	$: mensajeMostrado = ultimaPregunta > 0 && $examStore.answers[ultimaPregunta] !== undefined
		? getMensajeAleatorio($examStore.answers[ultimaPregunta] === 'true')
		: mensajeInicial;
</script>

<!-- Character with speech bubble -->
<div class="relative mt-20 flex justify-center character-container">
	<!-- Speech bubble -->
	<div
		class="speech-bubble absolute -top-14 px-4 py-2 bg-gray-700/80 text-gray-100 rounded-lg border border-gray-600 text-sm max-w-xs text-center transition-all duration-300 z-10"
		class:text-green-200={ultimaPregunta > 0 && $examStore.answers[ultimaPregunta] === 'true'}
		class:text-red-300={ultimaPregunta > 0 && $examStore.answers[ultimaPregunta] === 'false'}
	>
		{mensajeMostrado}
		
		<!-- Triangle pointer -->
		<div
			class="absolute bottom-0 left-1/2 w-4 h-4 bg-gray-700/80 border-r border-b border-gray-600 transform translate-y-2 -translate-x-2 rotate-45"
			class:border-emerald-400={ultimaPregunta > 0 && $examStore.answers[ultimaPregunta] === 'true'}
			class:border-red-400={ultimaPregunta > 0 && $examStore.answers[ultimaPregunta] === 'false'}
		></div>
	</div>
	<!-- Character image with faint glow effect based on answer correctness -->
	<div class="character-image-container">
		<img src="/lufy1.png" class="w-24 transition-transform duration-300" 
			 class:animate-bounce={ultimaPregunta > 0 && $examStore.answers[ultimaPregunta] === 'true'} 
			 class:character-correct={ultimaPregunta > 0 && $examStore.answers[ultimaPregunta] === 'true'}
			 class:character-incorrect={ultimaPregunta > 0 && $examStore.answers[ultimaPregunta] === 'false'}
			 alt="Character mascot" />
	</div>
</div>

<style>
	.character-container {
		position: relative;
		z-index: 1;
	}
	
	.character-image-container {
		position: relative;
		z-index: 2;
	}
	
	/* Add glow effects based on answer correctness */
	.character-correct {
		filter: drop-shadow(0 0 8px rgba(52, 211, 153, 0.5));
	}
	
	.character-incorrect {
		filter: drop-shadow(0 0 8px rgba(248, 113, 113, 0.5));
	}
	
	.speech-bubble {
		min-width: 180px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}
	
	/* Animation for bounce effect */
	@keyframes bounce {
		0%, 100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-10px);
		}
	}
	
	.animate-bounce {
		animation: bounce 0.8s ease infinite;
	}
</style>
