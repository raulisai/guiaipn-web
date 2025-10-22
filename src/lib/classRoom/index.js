/**
 * Barrel export para lib/classRoom
 * Punto de entrada principal para toda la lógica del salón de clase
 */

// Controlador principal
export { createClassRoomController } from './controllers/ClassRoomController.js';

// Composables individuales (por si se necesitan usar directamente)
export {
	useSocketConnection,
	useExplanationControl,
	useSyncCallbacks,
	useFeedbackModal,
	useQuestionData,
	useProgressTracking
} from './composables/index.js';
