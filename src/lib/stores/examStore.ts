import { writable } from 'svelte/store';

// Definición del tipo para el reactivo
type Reactivo = {
  id: string;
  currentQuestion: string;
  pregunta: string;
  iscorrectQuestion: boolean;
  opciones: { key: string; value: string }[];
  respuestaCorrecta: string;
  pathImg: string;
  altIMg: string;
  imgAct: boolean;
};

// Definición del tipo para respuestas
type AnswerData = {
  isCorrect: boolean;
  reactivoId: string;
};

// Definición del tipo para el estado del examen
type ExamState = {
  totalQuestions: number;
  currentQuestion: number;
  materiaQuestion: string;
  answers: { [key: number]: string }; // mantener compatibilidad hacia atrás
  answersDetailed: { [key: number]: AnswerData }; // nueva estructura con más datos
  reactivo: Reactivo;
  finish: boolean;
  showOptionalImage: boolean;
  showSolution: boolean;
  apiImg: string;
};

// Estado inicial
const initialState: ExamState = {
  totalQuestions: 20,
  currentQuestion: 0,
  materiaQuestion: 'Matematicas',
  answers: {},
  answersDetailed: {},
  reactivo: {
    id: 'exm2024V1Math04',
    currentQuestion: '0',
    pregunta: 'cargando pregunta...si continua asi recarga la pagina',
    iscorrectQuestion: false,
    opciones: [],
    respuestaCorrecta: 'A',
    pathImg: 'https://img-reactivos.s3.us-east-2.amazonaws.com/2024Algebra03.png',
    altIMg: 'guia ipn Imagen de reactivo',
    imgAct: false
  },
  finish: false,
  showOptionalImage: false,
  showSolution: true,
  apiImg: 'https://img-reactivos.s3.us-east-2.amazonaws.com/'
};

// Crear el store
const createExamStore = () => {
  const { subscribe, set, update } = writable<ExamState>(initialState);

  return {
    subscribe,
    
    // Incrementar pregunta actual
    nextQuestion: () => update(state => ({
      ...state,
      currentQuestion: state.currentQuestion + 1
    })),
    
    // Actualizar reactivo completo
    setReactivo: (reactivo: Reactivo) => update(state => ({
      ...state,
      reactivo
    })),
    
    // Marcar examen como finalizado
    finishExam: () => update(state => ({
      ...state,
      finish: true
    })),
      // Guardar respuesta
    saveAnswer: (questionNumber: number, isCorrect: boolean) => update(state => {
      const newAnswers = { ...state.answers };
      const newAnswersDetailed = { ...state.answersDetailed };
      
      // Mantener compatibilidad con el formato anterior
      newAnswers[questionNumber] = isCorrect ? 'true' : 'false';
      
      // Nuevo formato con datos detallados
      newAnswersDetailed[questionNumber] = {
        isCorrect: isCorrect,
        reactivoId: state.reactivo.id
      };
      
      // Guardar el ID del reactivo en localStorage para poder acceder desde el modal
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(`q${questionNumber}_id`, state.reactivo.id);
        } catch (e) {
          console.warn('Unable to access localStorage:', e);
        }
      }
      
      return {
        ...state,
        answers: newAnswers,
        answersDetailed: newAnswersDetailed
      };
    }),
    
    // Actualizar materia
    updateMateria: (materia: string) => update(state => ({
      ...state,
      materiaQuestion: materia
    })),
    
    // Toggle mostrar imagen opcional
    toggleOptionalImage: () => update(state => ({
      ...state,
      showOptionalImage: !state.showOptionalImage
    })),
    
    // Toggle mostrar solución
    toggleSolution: () => update(state => ({
      ...state,
      showSolution: !state.showSolution
    })),
    
    // Resetear el estado
    reset: () => set(initialState)
  };
};

// Exportar la instancia del store
export const examStore = createExamStore();
