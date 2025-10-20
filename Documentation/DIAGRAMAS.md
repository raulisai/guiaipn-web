# Diagramas del Sistema - Guía IPN Web

## Arquitectura General del Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (SvelteKit)                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │   Routes     │  │    Stores    │  │  Components  │           │
│  │              │  │              │  │              │           │
│  │ - /          │  │ - authStore  │  │ - Math       │           │
│  │ - /examen    │  │ - examStore  │  │ - Question   │           │
│  │ - /cuenta    │  │              │  │ - Answer     │           │
│  │ - /progreso  │  │              │  │ - Modal      │           │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘           │
│         │                 │                 │                   │
│         └─────────────────┴─────────────────┘                   │
│                           │                                     │
└───────────────────────────┼─────────────────────────────────────┘
                            │
                            │ API Calls
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                      SUPABASE (Backend)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │     Auth     │  │   Database   │  │   Storage    │         │
│  │              │  │              │  │              │         │
│  │ - Email/Pass │  │ - profiles   │  │ - Images     │         │
│  │ - OAuth      │  │ - progress   │  │ - Assets     │         │
│  │ - Sessions   │  │ - results    │  │              │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Flujo de Datos del Examen

```
┌─────────────────────────────────────────────────────────────────┐
│                    INICIO DEL EXAMEN                             │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │  examStore.reset()   │
              │  currentQuestion = 0 │
              └──────────┬───────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │ getQuestionRandom()  │
              └──────────┬───────────┘
                         │
                         ▼
         ┌───────────────────────────────┐
         │ Seleccionar pregunta aleatoria│
         │ de reactivos[]                │
         └───────────┬───────────────────┘
                     │
                     ▼
         ┌───────────────────────────────┐
         │ Extraer información:          │
         │ - ID                          │
         │ - Pregunta                    │
         │ - Opciones                    │
         │ - Respuesta correcta          │
         │ - Materia                     │
         │ - Flags de matemáticas        │
         └───────────┬───────────────────┘
                     │
                     ▼
         ┌───────────────────────────────┐
         │ examStore.setReactivo()       │
         │ examStore.updateMateria()     │
         └───────────┬───────────────────┘
                     │
                     ▼
         ┌───────────────────────────────┐
         │ RENDERIZAR COMPONENTES        │
         ├───────────────────────────────┤
         │ - QuestionDisplay             │
         │   └─ Math.svelte (KaTeX)     │
         │ - AnswerOptions               │
         │ - ExamProgress                │
         │ - RadarChart                  │
         └───────────┬───────────────────┘
                     │
                     ▼
         ┌───────────────────────────────┐
         │ ESPERAR RESPUESTA USUARIO     │
         └───────────┬───────────────────┘
                     │
                     ▼
              ┌──────────────┐
              │selectOption()│
              └──────┬───────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
┌───────────────┐         ┌───────────────┐
│   CORRECTA    │         │  INCORRECTA   │
└───────┬───────┘         └───────┬───────┘
        │                         │
        ▼                         ▼
┌───────────────┐         ┌───────────────┐
│ saveAnswer()  │         │ saveAnswer()  │
│ (true)        │         │ (false)       │
└───────┬───────┘         └───────┬───────┘
        │                         │
        │                         ▼
        │                 ┌───────────────┐
        │                 │ showSolution? │
        │                 └───────┬───────┘
        │                         │
        │                    ┌────┴────┐
        │                    │         │
        │                   YES       NO
        │                    │         │
        │                    ▼         │
        │          ┌──────────────────┐│
        │          │navigateToExplanation()
        │          │                  ││
        │          │ 1. Save to localStorage
        │          │ 2. Create query params
        │          │ 3. Animate out    ││
        │          │ 4. goto(/examen/  ││
        │          │    GenerationIA)  ││
        │          └──────────┬────────┘│
        │                     │         │
        │                     ▼         │
        │          ┌──────────────────┐ │
        │          │ Explicación IA   │ │
        │          └──────────┬────────┘ │
        │                     │          │
        │                     ▼          │
        │          ┌──────────────────┐  │
        │          │ Volver al examen │  │
        │          └──────────┬────────┘  │
        │                     │           │
        └─────────────────────┴───────────┘
                              │
                              ▼
                   ┌──────────────────┐
                   │ currentQuestion++│
                   └──────────┬───────┘
                              │
                   ┌──────────┴──────────┐
                   │                     │
                   ▼                     ▼
        ┌──────────────────┐  ┌──────────────────┐
        │ currentQuestion  │  │ currentQuestion  │
        │ <= totalQuestions│  │ > totalQuestions │
        └──────────┬───────┘  └──────────┬───────┘
                   │                     │
                   ▼                     ▼
        ┌──────────────────┐  ┌──────────────────┐
        │getQuestionRandom()│  │  finishExam()    │
        └──────────────────┘  └──────────┬───────┘
                                         │
                                         ▼
                              ┌──────────────────┐
                              │  ModalFinish     │
                              │  - Estadísticas  │
                              │  - Resultados    │
                              └──────────────────┘
```

## Flujo de Autenticación

```
┌─────────────────────────────────────────────────────────────────┐
│                    USUARIO NO AUTENTICADO                        │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │  /cuenta/login       │
              └──────────┬───────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
┌───────────────┐ ┌──────────────┐ ┌──────────────┐
│ Email/Password│ │ Google OAuth │ │ Toggle Mode  │
└───────┬───────┘ └──────┬───────┘ └──────────────┘
        │                │
        │                ▼
        │      ┌──────────────────────┐
        │      │ Supabase OAuth Flow  │
        │      │ - Redirect to Google │
        │      │ - User authorizes    │
        │      │ - Callback to app    │
        │      └──────────┬───────────┘
        │                 │
        ▼                 ▼
┌─────────────────────────────────┐
│   Supabase Auth API             │
├─────────────────────────────────┤
│ signInWithPassword()            │
│ signInWithOAuth()               │
│ signUp()                        │
└────────────┬────────────────────┘
             │
    ┌────────┴────────┐
    │                 │
    ▼                 ▼
┌────────┐      ┌──────────────┐
│ Login  │      │  Registro    │
└───┬────┘      └──────┬───────┘
    │                  │
    │                  ▼
    │         ┌────────────────┐
    │         │ Email enviado  │
    │         │ Confirmar cuenta│
    │         └────────┬───────┘
    │                  │
    │                  ▼
    │         ┌────────────────┐
    │         │ Usuario confirma│
    │         └────────┬───────┘
    │                  │
    └──────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│ Session creada                  │
│ - JWT token                     │
│ - User metadata                 │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│ onAuthStateChange() trigger     │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│ authStore.user actualizado      │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│ invalidate('supabase:auth')     │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│ +layout.server.js recarga       │
│ - getSession()                  │
│ - Obtiene profile de BD         │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│ Redirigir a página solicitada   │
│ o a /                           │
└─────────────────────────────────┘
```

## Arquitectura de Componentes

```
App
│
├── +layout.svelte (Root Layout)
│   ├── Navigation
│   │   ├── Logo
│   │   ├── Menu Button
│   │   └── Dropdown
│   │       ├── User Info (if authenticated)
│   │       ├── Links
│   │       └── Login/Logout
│   │
│   └── Main Content (slot)
│       │
│       ├── / (Home Page)
│       │   ├── Hero Section
│       │   │   ├── Welcome Message
│       │   │   ├── CTA Button
│       │   │   └── Logo Image
│       │   │
│       │   ├── How It Works Section
│       │   │   ├── Step 1 Card
│       │   │   ├── Step 2 Card
│       │   │   └── Step 3 Card
│       │   │
│       │   └── Footer
│       │
│       ├── /examen (Exam Page)
│       │   ├── QuestionHeader
│       │   │   ├── Question Number
│       │   │   └── Subject Badge
│       │   │
│       │   ├── QuestionDisplay
│       │   │   ├── Question Text
│       │   │   │   └── Math (if lengMathPregunta)
│       │   │   │       └── KaTeX Renderer
│       │   │   │
│       │   │   └── Optional Image
│       │   │
│       │   ├── ExamProgress
│       │   │   ├── Progress Bar
│       │   │   └── Stats
│       │   │
│       │   ├── AnswerOptions
│       │   │   └── Option Buttons (A, B, C, D)
│       │   │       └── Math (if lengMathOpciones)
│       │   │
│       │   ├── RadarChart (Desktop)
│       │   │   └── Chart.js Canvas
│       │   │
│       │   └── ModalFinish (if finish)
│       │       ├── Statistics
│       │       ├── RadarChart
│       │       └── Action Buttons
│       │
│       ├── /examen/GenerationIAResponse
│       │   ├── CharacterIA
│       │   │   └── AI Avatar Animation
│       │   │
│       │   ├── Question Review
│       │   │   ├── Original Question
│       │   │   ├── User Answer
│       │   │   └── Correct Answer
│       │   │
│       │   ├── AI Explanation
│       │   │   └── Generated Content
│       │   │
│       │   └── Navigation Buttons
│       │
│       ├── /cuenta/login
│       │   ├── Login Form
│       │   │   ├── Email Input
│       │   │   ├── Password Input
│       │   │   └── Submit Button
│       │   │
│       │   ├── Register Form
│       │   │   ├── Name Input
│       │   │   ├── Email Input
│       │   │   ├── Password Input
│       │   │   └── Submit Button
│       │   │
│       │   ├── Google OAuth Button
│       │   │
│       │   └── Toggle Mode Button
│       │
│       ├── /materias (Protected)
│       │   └── Subject List
│       │
│       └── /progreso (Protected)
│           └── Progress Dashboard
│
└── Stores
    ├── authStore
    │   ├── user (writable)
    │   ├── signInWithEmail()
    │   ├── signUpWithEmail()
    │   ├── signInWithGoogle()
    │   └── logout()
    │
    └── examStore
        ├── State
        │   ├── totalQuestions
        │   ├── currentQuestion
        │   ├── materiaQuestion
        │   ├── answers
        │   ├── answersDetailed
        │   ├── reactivo
        │   └── finish
        │
        └── Actions
            ├── nextQuestion()
            ├── setReactivo()
            ├── finishExam()
            ├── saveAnswer()
            ├── updateMateria()
            └── reset()
```

## Ciclo de Vida de una Pregunta

```
┌─────────────────────────────────────────────────────────────────┐
│                    CICLO DE VIDA DE PREGUNTA                     │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │ 1. SELECCIÓN         │
              │ - Random de array    │
              │ - Validación datos   │
              └──────────┬───────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │ 2. PREPARACIÓN       │
              │ - Extraer materia    │
              │ - Formatear opciones │
              │ - Configurar flags   │
              └──────────┬───────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │ 3. ALMACENAMIENTO    │
              │ - Update examStore   │
              │ - Set reactivo       │
              └──────────┬───────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │ 4. RENDERIZADO       │
              │ - QuestionDisplay    │
              │ - Math rendering     │
              │ - AnswerOptions      │
              └──────────┬───────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │ 5. INTERACCIÓN       │
              │ - Usuario selecciona │
              │ - Validación         │
              └──────────┬───────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │ 6. EVALUACIÓN        │
              │ - Comparar respuesta │
              │ - Actualizar estado  │
              └──────────┬───────────┘
                         │
        ┌────────────────┴────────────────┐
        │                                 │
        ▼                                 ▼
┌───────────────┐              ┌──────────────────┐
│ 7a. CORRECTA  │              │ 7b. INCORRECTA   │
│ - Guardar     │              │ - Guardar        │
│ - Siguiente   │              │ - Explicación IA │
└───────┬───────┘              └──────────┬───────┘
        │                                 │
        └────────────────┬────────────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │ 8. TRANSICIÓN        │
              │ - Animación salida   │
              │ - Limpiar estado     │
              └──────────┬───────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │ 9. SIGUIENTE         │
              │ - Incrementar counter│
              │ - Nueva pregunta     │
              └──────────────────────┘
```

## Gestión de Estado (State Management)

```
┌─────────────────────────────────────────────────────────────────┐
│                        STATE MANAGEMENT                          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                         authStore                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  State:                                                          │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ user: writable(null)                                       │ │
│  │ {                                                          │ │
│  │   id: string,                                              │ │
│  │   email: string,                                           │ │
│  │   user_metadata: {                                         │ │
│  │     full_name: string,                                     │ │
│  │     avatar_url: string                                     │ │
│  │   }                                                        │ │
│  │ }                                                          │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  Actions:                                                        │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ - signInWithEmail(email, password)                         │ │
│  │ - signUpWithEmail(email, password, name)                   │ │
│  │ - signInWithGoogle()                                       │ │
│  │ - logout()                                                 │ │
│  │ - resendConfirmationEmail(email)                           │ │
│  │ - isAuthenticated()                                        │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                         examStore                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  State:                                                          │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ totalQuestions: 20                                         │ │
│  │ currentQuestion: 0                                         │ │
│  │ materiaQuestion: string                                    │ │
│  │ answers: { [key: number]: string }                         │ │
│  │ answersDetailed: {                                         │ │
│  │   [key: number]: {                                         │ │
│  │     isCorrect: boolean,                                    │ │
│  │     reactivoId: string                                     │ │
│  │   }                                                        │ │
│  │ }                                                          │ │
│  │ reactivo: {                                                │ │
│  │   id: string,                                              │ │
│  │   pregunta: string,                                        │ │
│  │   opciones: Array<{key: string, value: string}>,          │ │
│  │   respuestaCorrecta: string,                               │ │
│  │   iscorrectQuestion: boolean,                              │ │
│  │   lengMathPregunta: boolean,                               │ │
│  │   lengMathOpciones: boolean,                               │ │
│  │   imgAct: boolean,                                         │ │
│  │   pathImg: string                                          │ │
│  │ }                                                          │ │
│  │ finish: false                                              │ │
│  │ showOptionalImage: false                                   │ │
│  │ showSolution: true                                         │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  Actions:                                                        │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ - nextQuestion()                                           │ │
│  │ - setReactivo(reactivo)                                    │ │
│  │ - finishExam()                                             │ │
│  │ - saveAnswer(questionNumber, isCorrect)                    │ │
│  │ - updateMateria(materia)                                   │ │
│  │ - toggleOptionalImage()                                    │ │
│  │ - toggleSolution()                                         │ │
│  │ - reset()                                                  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

**Nota**: Estos diagramas representan el estado actual del sistema. Para visualizaciones más detalladas, considera usar herramientas como Mermaid, Draw.io o Excalidraw.
