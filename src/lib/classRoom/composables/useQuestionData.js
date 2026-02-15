/**
 * Composable para manejo de datos de pregunta
 * Extrae y valida datos de la URL
 */

import { explanationStore } from '$lib/stores';

/**
 * Hook para manejo de datos de pregunta
 * @param {URLSearchParams} searchParams - Parámetros de la URL
 * @returns {Object} Datos de la pregunta y función de validación
 */
export function useQuestionData(searchParams) {
	/**
	 * Extraer datos de la pregunta desde URL
	 * @returns {Object|null} Datos de la pregunta o null si no son válidos
	 */
	function extractQuestionData() {
		const questionData = {
			id: searchParams.get('id'),
			pregunta: searchParams.get('pregunta'),
			respuestaUsuario: searchParams.get('respuestaUsuario'),
			respuestaCorrecta: searchParams.get('respuestaCorrecta'),
			iscorrect: searchParams.get('iscorrect') === 'true',
			lengMathPregunta: searchParams.get('lengMathPregunta') === 'true',
			lengMathOpciones: searchParams.get('lengMathOpciones') === 'true'
		};

		return questionData;
	}

	/**
	 * Validar que los datos de la pregunta son válidos
	 * @param {Object} questionData - Datos a validar
	 * @returns {Object|null} Error si no es válido, null si es válido
	 */
	function validateQuestionData(questionData) {
		if (!questionData.id || !questionData.pregunta) {
			return {
				code: 'VALIDATION_ERROR',
				message: 'No se encontraron datos de la pregunta. Por favor, regresa al examen.'
			};
		}
		return null;
	}

	/**
	 * Guardar pregunta en el store
	 * @param {Object} questionData - Datos de la pregunta
	 */
	function saveToStore(questionData) {
		explanationStore.setCurrentQuestion(questionData);
	}

	return {
		extractQuestionData,
		validateQuestionData,
		saveToStore
	};
}
