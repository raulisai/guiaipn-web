/**
 * Constantes globales del proyecto
 */

// Materias disponibles
export const MATERIAS = [
	{ id: 'matematicas', name: 'Matemáticas', color: 'blue' },
	{ id: 'fisica', name: 'Física', color: 'green' },
	{ id: 'quimica', name: 'Química', color: 'red' },
	{ id: 'biologia', name: 'Biología', color: 'purple' },
	{ id: 'historia', name: 'Historia', color: 'yellow' },
	{ id: 'geografia', name: 'Geografía', color: 'teal' },
	{ id: 'literatura', name: 'Literatura', color: 'pink' },
	{ id: 'ingles', name: 'Inglés', color: 'indigo' }
];

// Dificultades
export const DIFFICULTIES = {
	EASY: 'easy',
	MEDIUM: 'medium',
	HARD: 'hard'
};

// Configuración del examen
export const EXAM_CONFIG = {
	TOTAL_QUESTIONS: 20,
	TIME_LIMIT: 3600, // segundos (1 hora)
	PASSING_SCORE: 70 // porcentaje
};

// Opciones de respuesta
export const ANSWER_OPTIONS = ['a', 'b', 'c', 'd'];

// Rutas protegidas
export const PROTECTED_ROUTES = ['/progreso', '/materias'];

// Timeouts
export const TIMEOUTS = {
	API_REQUEST: 30000, // 30 segundos
	SOCKET_CONNECT: 10000, // 10 segundos
	DEBOUNCE: 300 // 300ms
};
