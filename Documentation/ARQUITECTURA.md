# Documentación de Arquitectura - Guía IPN Web

## 📋 Índice
1. [Visión General](#visión-general)
2. [Stack Tecnológico](#stack-tecnológico)
3. [Estructura del Proyecto](#estructura-del-proyecto)
4. [Arquitectura de Componentes](#arquitectura-de-componentes)
5. [Flujos de Datos](#flujos-de-datos)
6. [Sistema de Autenticación](#sistema-de-autenticación)
7. [Sistema de Exámenes](#sistema-de-exámenes)
8. [Base de Datos](#base-de-datos)
9. [Diagramas de Flujo](#diagramas-de-flujo)

---

## 🎯 Visión General

**Guía IPN Web** es una plataforma educativa diseñada para ayudar a estudiantes a prepararse para el examen de admisión del IPN (Instituto Politécnico Nacional). La aplicación ofrece:

- **Exámenes de práctica** con preguntas de matemáticas y estadística
- **Explicaciones con IA** para respuestas incorrectas
- **Seguimiento de progreso** personalizado
- **Renderizado de fórmulas matemáticas** con KaTeX
- **Sistema de autenticación** con Supabase

---

## 🛠️ Stack Tecnológico

### Frontend
- **Framework**: SvelteKit 2.x (Svelte 5)
- **Lenguaje**: JavaScript/TypeScript
- **Estilos**: TailwindCSS 4.0
- **Animaciones**: Svelte transitions (fade, fly, scale)
- **Matemáticas**: KaTeX 0.16.22
- **Gráficas**: Chart.js 4.4.9
- **Iconos**: Lucide Svelte

### Backend/Servicios
- **BaaS**: Supabase (Auth + Database)
- **Deployment**: Vercel (adapter-vercel)
- **Build Tool**: Vite 6.0

### Herramientas de Desarrollo
- **Linting**: ESLint 9.x
- **Formatting**: Prettier 3.x
- **Type Checking**: TypeScript 5.x

---

## 📁 Estructura del Proyecto

```
guiaipn-web/
├── src/
│   ├── lib/
│   │   ├── api/                      # Comunicación con backend
│   │   │   ├── client.js            # Cliente HTTP base
│   │   │   ├── endpoints/           # Endpoints por dominio
│   │   │   │   ├── auth.js
│   │   │   │   ├── questions.js
│   │   │   │   ├── sessions.js
│   │   │   │   └── index.js
│   │   │   └── index.js
│   │   │
│   │   ├── components/              # Componentes reutilizables
│   │   │   ├── auth/
│   │   │   │   └── ProtectedRoute.svelte
│   │   │   └── index.js
│   │   │
│   │   ├── stores/                  # Estado global
│   │   │   ├── authStore.js        # Store de autenticación
│   │   │   ├── examStore.ts        # Store del examen
│   │   │   └── index.js
│   │   │
│   │   ├── utils/                   # Utilidades
│   │   │   ├── constants.js        # Constantes globales
│   │   │   ├── validators.js       # Validaciones
│   │   │   ├── formatters.js       # Formateo
│   │   │   └── index.js
│   │   │
│   │   ├── services/                # Servicios externos
│   │   │   ├── supabase.js         # Cliente Supabase
│   │   │   └── index.js
│   │   │
│   │   ├── data/                    # Datos estáticos
│   │   │   └── index.js            # reactivos + config
│   │   │
│   │   ├── reactivos.js             # Base de datos de preguntas (863+)
│   │   └── index.js                 # Punto de entrada principal
│   │
│   ├── routes/
│   │   ├── +layout.server.js         # Layout server-side
│   │   ├── +layout.svelte            # Layout principal con nav
│   │   ├── +page.svelte              # Página de inicio
│   │   │
│   │   ├── auth/
│   │   │   └── callback/             # Callback OAuth
│   │   │
│   │   ├── cuenta/
│   │   │   ├── +page.svelte          # Perfil de usuario
│   │   │   ├── login/
│   │   │   │   └── +page.svelte      # Login/Registro
│   │   │   └── logout/
│   │   │       └── +page.svelte      # Logout
│   │   │
│   │   ├── examen/
│   │   │   ├── +page.svelte          # Página principal del examen
│   │   │   ├── componentes/          # Componentes del examen
│   │   │   │   ├── AnswerOptions.svelte
│   │   │   │   ├── CharacterIA.svelte
│   │   │   │   ├── Estadisticas.svelte
│   │   │   │   ├── Examprogres.svelte
│   │   │   │   ├── Math.svelte       # Renderizador KaTeX
│   │   │   │   ├── ModalFinish.svelte
│   │   │   │   ├── QuestionDisplay.svelte
│   │   │   │   ├── QuestionHeader.svelte
│   │   │   │   ├── RadarChart.svelte
│   │   │   │   └── Timer.svelte
│   │   │   └── GenerationIAResponse/ # Explicaciones con IA
│   │   │
│   │   ├── materias/                 # Sección de materias
│   │   ├── progreso/                 # Seguimiento de progreso
│   │   └── components/
│   │       └── footer.svelte
│   │
│   ├── app.css                       # Estilos globales
│   ├── app.d.ts                      # Tipos TypeScript
│   └── app.html                      # HTML base
│
├── static/                           # Archivos estáticos
│   ├── logoipnburrito.png
│   ├── logoipnGuia.png
│   └── .well-known/
│
├── package.json
├── svelte.config.js
├── vite.config.js
├── tailwind.config.js
├── supabase-setup.sql               # Schema de BD
└── README.md
```

---

## 🏗️ Arquitectura de Componentes

### Jerarquía de Componentes

```
App Root
│
├── +layout.svelte (Navigation + Auth Guard)
│   │
│   ├── Header/Nav (siempre visible)
│   │   ├── Logo
│   │   ├── Menu Button
│   │   └── Dropdown Menu
│   │       ├── User Info (si está autenticado)
│   │       ├── Links de navegación
│   │       └── Login/Logout
│   │
│   └── Main Content (slot)
│       │
│       ├── / (Home)
│       │   ├── Hero Section
│       │   ├── How It Works Section
│       │   └── Footer
│       │
│       ├── /examen (Exam Page)
│       │   ├── QuestionHeader
│       │   ├── QuestionDisplay
│       │   │   └── Math (KaTeX renderer)
│       │   ├── ExamProgress
│       │   ├── AnswerOptions
│       │   ├── RadarChart
│       │   └── ModalFinish
│       │
│       ├── /examen/GenerationIAResponse
│       │   ├── CharacterIA
│       │   └── AI Explanation Components
│       │
│       ├── /cuenta/login
│       │   ├── Login Form
│       │   ├── Register Form
│       │   └── Google OAuth Button
│       │
│       ├── /materias (Protected)
│       └── /progreso (Protected)
```

---

## 🔄 Flujos de Datos

### 1. Sistema de Stores (State Management)

#### **authStore.js**
```javascript
// Estado global de autenticación
user: writable(null)

// Funciones disponibles:
- signInWithEmail(email, password)
- signUpWithEmail(email, password, name)
- signInWithGoogle()
- logout()
- resendConfirmationEmail(email)
- isAuthenticated()
```

#### **examStore.ts**
```typescript
// Estado del examen
{
  totalQuestions: number,
  currentQuestion: number,
  materiaQuestion: string,
  answers: { [key: number]: string },
  answersDetailed: { [key: number]: AnswerData },
  reactivo: Reactivo,
  finish: boolean,
  showOptionalImage: boolean,
  showSolution: boolean,
  apiImg: string
}

// Acciones disponibles:
- nextQuestion()
- setReactivo(reactivo)
- finishExam()
- saveAnswer(questionNumber, isCorrect)
- updateMateria(materia)
- toggleOptionalImage()
- toggleSolution()
- reset()
```

### 2. Flujo de Datos en el Examen

```
┌─────────────────────────────────────────────────────────┐
│                    Inicio del Examen                     │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  getQuestionRandom()                                     │
│  - Incrementa currentQuestion                            │
│  - Selecciona pregunta aleatoria de reactivos[]         │
│  - Extrae materia del ID                                 │
│  - Formatea opciones                                     │
│  - Actualiza examStore.setReactivo()                     │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  Renderizado de Componentes                              │
│  - QuestionDisplay (muestra pregunta)                    │
│  - Math.svelte (si lengMathPregunta = true)             │
│  - AnswerOptions (muestra opciones)                      │
│  - ExamProgress (barra de progreso)                      │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  Usuario selecciona respuesta                            │
│  selectOption(resp)                                      │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
              ┌──────┴──────┐
              │             │
         ¿Correcta?    ¿Incorrecta?
              │             │
              ▼             ▼
    ┌─────────────┐  ┌──────────────────────┐
    │ Guardar     │  │ Guardar respuesta    │
    │ respuesta   │  │ incorrecta           │
    │ correcta    │  │                      │
    │             │  │ Si showSolution:     │
    │ Siguiente   │  │ → navigateToExplanation()
    │ pregunta    │  │   (Redirige a IA)    │
    └─────────────┘  └──────────────────────┘
                     │
                     ▼
    ┌────────────────────────────────────────┐
    │ currentQuestion > totalQuestions?      │
    └────────────────┬───────────────────────┘
                     │
              ┌──────┴──────┐
              │             │
             Sí            No
              │             │
              ▼             ▼
    ┌─────────────┐  ┌──────────────┐
    │ finishExam()│  │ getQuestion  │
    │             │  │ Random()     │
    │ Mostrar     │  └──────────────┘
    │ ModalFinish │
    └─────────────┘
```

---

## 🔐 Sistema de Autenticación

### Flujo de Autenticación

```
┌──────────────────────────────────────────────────────────┐
│                    Usuario Visita App                     │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────┐
│  +layout.server.js (Server-Side)                          │
│  - depends('supabase:auth')                               │
│  - getSession() desde Supabase                            │
│  - Si hay sesión: obtiene profile de BD                   │
│  - Retorna { session, user, profile }                     │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────┐
│  +layout.svelte (Client-Side)                             │
│  - Escucha cambios con onAuthStateChange()                │
│  - Actualiza authStore.user                               │
│  - Verifica rutas protegidas                              │
│  - Redirige a /cuenta/login si no autenticado            │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
         ┌───────────┴───────────┐
         │                       │
    ¿Autenticado?          ¿No autenticado?
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌──────────────────────┐
│ Acceso completo │    │ Acceso limitado      │
│ - /materias     │    │ - Solo /examen       │
│ - /progreso     │    │ - /cuenta/login      │
│ - /cuenta       │    │                      │
└─────────────────┘    └──────────────────────┘
```

### Métodos de Autenticación

1. **Email/Password**
   - Registro: `signUpWithEmail(email, password, name)`
   - Login: `signInWithEmail(email, password)`
   - Confirmación por email requerida

2. **Google OAuth**
   - `signInWithGoogle()`
   - Redirección a `/auth/callback`
   - Creación automática de perfil

### Rutas Protegidas

```javascript
// En +layout.svelte
const protectedRoutes = ['/progreso', '/materias'];

$effect(() => {
    if (isProtectedRoute && !$user) {
        goto('/cuenta/login');
    }
});
```

---

## 📝 Sistema de Exámenes

### Estructura de Reactivos

```javascript
{
  id: "2024Algebra11",              // ID único
  pregunta: "\\text{...}",          // Pregunta (puede ser LaTeX)
  opciones: {                       // Opciones de respuesta
    a: "opción A",
    b: "opción B",
    c: "opción C",
    d: "opción D"
  },
  resuesta: "b",                    // Respuesta correcta
  explicacion: "void",              // Explicación (futuro)
  imgActive: false,                 // ¿Tiene imagen?
  lengMathPregunta: true,           // ¿Pregunta es matemática?
  lengMathOpciones: true            // ¿Opciones son matemáticas?
}
```

### Renderizado de Matemáticas

El componente `Math.svelte` utiliza KaTeX para renderizar fórmulas:

```javascript
// Configuración de KaTeX
{
  throwOnError: false,
  displayMode: false,
  output: 'html',
  trust: true,
  strict: false,
  macros: {
    "\\RR": "\\mathbb{R}",
    "\\NN": "\\mathbb{N}",
    // ... más macros
  }
}
```

**Algoritmo de Tipografía Inteligente:**
- `< 50 caracteres`: fontSize = "xl"
- `< 100 caracteres`: fontSize = "lg"
- `< 200 caracteres`: fontSize = "base"
- `≥ 200 caracteres`: fontSize = "sm"

### Sistema de Navegación del Examen

```javascript
// Navegación a explicación con IA
navigateToExplanation(resp, resCorrect) {
  // 1. Guarda datos en localStorage
  localStorage.setItem('current_question_id', ...);
  localStorage.setItem('current_question_text', ...);
  
  // 2. Crea URL con query params
  const queryParams = new URLSearchParams({...});
  
  // 3. Activa animaciones de salida
  animateQuestionLeft = true;
  animateAnswersRight = true;
  
  // 4. Navega después de animación
  setTimeout(() => {
    goto(`/examen/GenerationIAResponse?${queryParams}`);
  }, 900);
}
```

---

## 🗄️ Base de Datos

### Schema de Supabase

```sql
-- Tabla de perfiles
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can create their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- Trigger para crear perfil automáticamente
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## 📊 Diagramas de Flujo

### Flujo Completo de Usuario

```
┌─────────────────────────────────────────────────────────┐
│                  Usuario llega a la app                  │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
              ┌──────────────┐
              │ Página Inicio│
              │   (/)        │
              └──────┬───────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
        ▼            ▼            ▼
   ┌────────┐  ┌─────────┐  ┌─────────┐
   │ Inicio │  │ Examen  │  │ Login   │
   │ Sesión │  │         │  │         │
   └────┬───┘  └────┬────┘  └────┬────┘
        │           │            │
        │           │            └──────┐
        │           │                   │
        ▼           ▼                   ▼
   ┌─────────────────────┐      ┌──────────────┐
   │ Rutas Protegidas    │      │ Registro/    │
   │ - /materias         │      │ Login        │
   │ - /progreso         │      │              │
   │ - /cuenta           │      └──────┬───────┘
   └─────────────────────┘             │
                                       │
                                       ▼
                              ┌─────────────────┐
                              │ Confirmación    │
                              │ Email           │
                              └────────┬────────┘
                                       │
                                       ▼
                              ┌─────────────────┐
                              │ Sesión Activa   │
                              └─────────────────┘
```

### Flujo de Examen Detallado

```
START
  │
  ▼
[Montar Componente]
  │
  ▼
[getQuestionRandom()]
  │
  ├─► Incrementar currentQuestion
  │
  ├─► ¿currentQuestion > totalQuestions? ──YES──► [finishExam()]
  │                                                      │
  NO                                                     ▼
  │                                              [ModalFinish]
  ▼                                                      │
[Seleccionar pregunta aleatoria]                        ▼
  │                                                   [END]
  ├─► Extraer materia del ID
  │
  ├─► Formatear opciones
  │
  ▼
[Actualizar examStore]
  │
  ▼
[Renderizar UI]
  │
  ├─► QuestionDisplay
  │   └─► Math.svelte (si es matemática)
  │
  ├─► AnswerOptions
  │
  └─► ExamProgress
  │
  ▼
[Usuario selecciona respuesta]
  │
  ▼
[selectOption(resp)]
  │
  ├─► ¿resp === respuestaCorrecta?
  │
  ├─YES─► [Guardar respuesta correcta]
  │        │
  │        └─► [getQuestionRandom()] ──┐
  │                                     │
  └─NO──► [Guardar respuesta incorrecta]
           │                            │
           ├─► ¿showSolution?           │
           │                            │
           ├─YES─► [navigateToExplanation()]
           │        │                   │
           │        ├─► Guardar en localStorage
           │        │                   │
           │        ├─► Crear query params
           │        │                   │
           │        ├─► Activar animaciones
           │        │                   │
           │        └─► goto(/examen/GenerationIAResponse)
           │             │              │
           │             ▼              │
           │        [Explicación IA]   │
           │             │              │
           │             ▼              │
           │        [Volver al examen] │
           │             │              │
           └─NO──────────┴──────────────┘
                         │
                         ▼
                  [getQuestionRandom()]
                         │
                         └─► (loop)
```

### Flujo de Autenticación Detallado

```
┌──────────────────────────────────────────────────────────┐
│                    /cuenta/login                          │
└────────────────────┬─────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
        ▼            ▼            ▼
   ┌─────────┐  ┌────────┐  ┌──────────┐
   │ Email/  │  │ Google │  │ Toggle   │
   │ Password│  │ OAuth  │  │ Mode     │
   └────┬────┘  └────┬───┘  └────┬─────┘
        │            │            │
        │            │            └─► [Cambiar Login/Registro]
        │            │
        ▼            ▼
   ┌─────────────────────────────┐
   │ Supabase Auth               │
   └────────┬────────────────────┘
            │
     ┌──────┴──────┐
     │             │
   Login       Registro
     │             │
     ▼             ▼
┌─────────┐  ┌──────────────────┐
│ Session │  │ Enviar email     │
│ Activa  │  │ confirmación     │
└────┬────┘  └────┬─────────────┘
     │            │
     │            ▼
     │       ┌─────────────────┐
     │       │ Usuario confirma│
     │       │ email           │
     │       └────┬────────────┘
     │            │
     └────────────┴────────────┐
                               │
                               ▼
                    ┌────────────────────┐
                    │ onAuthStateChange()│
                    │ actualiza authStore│
                    └────────┬───────────┘
                             │
                             ▼
                    ┌────────────────────┐
                    │ invalidate(        │
                    │ 'supabase:auth')   │
                    └────────┬───────────┘
                             │
                             ▼
                    ┌────────────────────┐
                    │ +layout.server.js  │
                    │ recarga datos      │
                    └────────┬───────────┘
                             │
                             ▼
                    ┌────────────────────┐
                    │ Redirigir a /      │
                    └────────────────────┘
```

---

## 🎨 Características de UI/UX

### Animaciones

1. **Transiciones de página**
   - `fade`: Entrada/salida suave
   - `fly`: Movimiento con dirección
   - `scale`: Zoom in/out

2. **Animaciones del examen**
   - Slide left/right al cambiar pregunta
   - Fade out del progreso
   - Pulse en botones importantes

3. **Efectos hover**
   - Scale en tarjetas
   - Glow en botones
   - Border transitions

### Responsive Design

- **Mobile First**: Diseñado primero para móviles
- **Breakpoints**:
  - `sm`: 640px
  - `md`: 768px
  - `lg`: 1024px
  - `xl`: 1280px

### Temas de Color

```css
/* Gradientes principales */
from-[#030e27]/90 to-black/90  /* Fondo principal */
from-red-950 to-red-800        /* Botones CTA */
from-blue-500/20 to-purple-500/10  /* Efectos hover */

/* Colores de estado */
text-red-400    /* Errores */
text-green-400  /* Éxito */
text-cyan-400   /* Información */
```

---

## 🚀 Deployment

### Configuración de Vercel

```javascript
// svelte.config.js
import adapter from '@sveltejs/adapter-vercel';

export default {
  kit: {
    adapter: adapter()
  }
};
```

### Variables de Entorno

```env
PUBLIC_SUPABASE_URL=your_supabase_url
PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## 📦 Scripts Disponibles

```json
{
  "dev": "vite dev",              // Desarrollo
  "build": "vite build",          // Producción
  "preview": "vite preview",      // Preview build
  "check": "svelte-check",        // Type checking
  "format": "prettier --write .", // Formatear código
  "lint": "prettier --check . && eslint ."  // Linting
}
```

---

## 🔮 Futuras Mejoras

1. **Sistema de Progreso**
   - Guardar respuestas en Supabase
   - Estadísticas por materia
   - Historial de exámenes

2. **Explicaciones IA**
   - Integración con OpenAI/Anthropic
   - Explicaciones personalizadas
   - Sugerencias de estudio

3. **Materias**
   - Más categorías de preguntas
   - Filtros por dificultad
   - Modo de estudio por temas

4. **Social**
   - Compartir resultados
   - Rankings
   - Grupos de estudio

---

## 📚 Referencias

- [SvelteKit Docs](https://kit.svelte.dev/)
- [Supabase Docs](https://supabase.com/docs)
- [TailwindCSS Docs](https://tailwindcss.com/docs)
- [KaTeX Docs](https://katex.org/docs/api.html)

---

**Última actualización**: Octubre 2024
**Versión**: 0.0.1
