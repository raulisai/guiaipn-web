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

// Definición del tipo para el estado del examen
type ExamState = {
  totalQuestions: number;
  currentQuestion: number;
  materiaQuestion: string;
  answers: { [key: number]: string };
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
  showSolution: false,
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
      newAnswers[questionNumber] = isCorrect ? 'true' : 'false';
      return {
        ...state,
        answers: newAnswers
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
