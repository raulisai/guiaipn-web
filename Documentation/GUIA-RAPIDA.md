# Guía Rápida - Guía IPN Web

## 🚀 Inicio Rápido

### Instalación
```bash
npm install
```

### Desarrollo
```bash
npm run dev
```

### Build
```bash
npm run build
npm run preview
```

---

## 📂 Estructura de Archivos Clave

```
src/
├── lib/
│   ├── stores/
│   │   ├── authStore.js      # Gestión de autenticación
│   │   └── examStore.ts      # Estado del examen
│   ├── reactivos.js          # Base de datos de preguntas (863+ preguntas)
│   └── supabase.js           # Cliente Supabase
│
├── routes/
│   ├── +layout.svelte        # Layout principal con navegación
│   ├── +layout.server.js     # Server-side auth check
│   ├── +page.svelte          # Página de inicio
│   ├── examen/               # Sistema de exámenes
│   └── cuenta/               # Autenticación
```

---

## 🔑 Conceptos Clave

### 1. Stores (Estado Global)

**authStore** - Autenticación
```javascript
import { user } from '$lib/stores/authStore';

// Leer estado
$user // Usuario actual o null

// Acciones
signInWithEmail(email, password)
signUpWithEmail(email, password, name)
signInWithGoogle()
logout()
```

**examStore** - Examen
```javascript
import { examStore } from '$lib/stores/examStore';

// Leer estado
$examStore.currentQuestion
$examStore.reactivo
$examStore.answers

// Acciones
examStore.nextQuestion()
examStore.saveAnswer(questionNumber, isCorrect)
examStore.finishExam()
```

### 2. Reactivos (Preguntas)

Estructura de una pregunta:
```javascript
{
  id: "2024Algebra11",
  pregunta: "\\text{Pregunta en LaTeX}",
  opciones: { a: "...", b: "...", c: "...", d: "..." },
  resuesta: "b",
  explicacion: "void",
  imgActive: false,
  lengMathPregunta: true,  // ¿Es matemática?
  lengMathOpciones: true   // ¿Opciones son matemáticas?
}
```

### 3. Renderizado de Matemáticas

Usa el componente `Math.svelte`:
```svelte
<Math 
  content={$examStore.reactivo.pregunta} 
  fontSize="lg" 
/>
```

### 4. Rutas Protegidas

```javascript
// En +layout.svelte
const protectedRoutes = ['/progreso', '/materias'];

// Redirige a login si no está autenticado
$effect(() => {
    if (isProtectedRoute && !$user) {
        goto('/cuenta/login');
    }
});
```

---

## 🎯 Flujos Principales

### Flujo de Examen

1. **Inicio**: Usuario va a `/examen`
2. **Carga**: `getQuestionRandom()` selecciona pregunta
3. **Renderiza**: Componentes muestran pregunta y opciones
4. **Respuesta**: Usuario selecciona opción
5. **Validación**: `selectOption()` verifica respuesta
6. **Resultado**:
   - ✅ Correcta → Siguiente pregunta
   - ❌ Incorrecta → Explicación IA (si `showSolution = true`)
7. **Finalización**: Después de 20 preguntas → `ModalFinish`

### Flujo de Autenticación

1. **Login**: Usuario va a `/cuenta/login`
2. **Método**:
   - Email/Password
   - Google OAuth
3. **Validación**: Supabase verifica credenciales
4. **Sesión**: `onAuthStateChange()` actualiza `authStore`
5. **Redirección**: Usuario va a página solicitada

---

## 🛠️ Tareas Comunes

### Agregar Nueva Pregunta

```javascript
// En src/lib/reactivos.js
export const reactivos = [
  // ... preguntas existentes
  {
    pregunta: "Tu pregunta aquí",
    opciones: { a: "A", b: "B", c: "C", d: "D" },
    id: "2024Materia##",
    resuesta: "a",
    explicacion: "void",
    imgActive: false,
    lengMathPregunta: false,
    lengMathOpciones: false
  }
];
```

### Crear Nuevo Componente

```svelte
<!-- src/routes/examen/componentes/MiComponente.svelte -->
<script>
  import { examStore } from '$lib/stores/examStore';
  
  let { prop1, prop2 } = $props();
</script>

<div>
  {prop1}
</div>
```

### Agregar Ruta Protegida

```javascript
// En src/routes/+layout.svelte
const protectedRoutes = [
  '/progreso', 
  '/materias',
  '/mi-nueva-ruta'  // Agregar aquí
];
```

### Modificar Estilos Globales

```css
/* src/app.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Tus estilos personalizados */
```

---

## 🔧 Configuración

### Variables de Entorno

Crea `.env` en la raíz:
```env
PUBLIC_SUPABASE_URL=tu_url_de_supabase
PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima
```

### Supabase Setup

Ejecuta el SQL en Supabase Dashboard:
```sql
-- Ver supabase-setup.sql
```

---

## 📊 Componentes Principales

### QuestionDisplay
Muestra la pregunta actual
```svelte
<QuestionDisplay 
  {toggleOptionalImage} 
  {toggleSolution} 
/>
```

### AnswerOptions
Muestra las opciones de respuesta
```svelte
<AnswerOptions {selectOption} />
```

### Math
Renderiza fórmulas matemáticas con KaTeX
```svelte
<Math content="\\frac{x}{2}" fontSize="lg" />
```

### ExamProgress
Barra de progreso del examen
```svelte
<ExamProgress 
  {currentQuestion} 
  {totalQuestions} 
  {answers} 
/>
```

### ModalFinish
Modal de resultados finales
```svelte
<ModalFinish {answers} />
```

---

## 🎨 Estilos y Animaciones

### Clases Tailwind Comunes

```css
/* Gradientes */
bg-gradient-to-b from-[#030e27]/90 to-black/90

/* Botones */
bg-gradient-to-r from-red-950 to-red-800

/* Cards */
bg-blue-card backdrop-blur-sm rounded-xl

/* Bordes */
border border-cyan hover:border-red-300/50
```

### Animaciones Svelte

```svelte
<script>
  import { fade, fly, scale } from 'svelte/transition';
</script>

<div in:fade={{ duration: 300 }}>
  Fade in
</div>

<div in:fly={{ y: 50, duration: 500 }}>
  Fly from bottom
</div>

<div in:scale={{ duration: 400 }}>
  Scale in
</div>
```

---

## 🐛 Debugging

### Ver Estado del Store

```svelte
<script>
  import { examStore } from '$lib/stores/examStore';
</script>

<pre>{JSON.stringify($examStore, null, 2)}</pre>
```

### Console Logs

```javascript
console.log('Current question:', $examStore.currentQuestion);
console.log('User:', $user);
```

### Supabase Logs

```javascript
// En authStore.js
const { data, error } = await supabase.auth.signIn(...);
console.log('Auth response:', { data, error });
```

---

## 📝 Convenciones de Código

### Nombres de Archivos
- Componentes: `PascalCase.svelte`
- Stores: `camelCase.js` o `.ts`
- Rutas: `+page.svelte`, `+layout.svelte`

### Nombres de Variables
```javascript
// camelCase para variables y funciones
let currentQuestion = 0;
function getQuestionRandom() {}

// PascalCase para componentes
import QuestionDisplay from './QuestionDisplay.svelte';

// UPPER_CASE para constantes
const MAX_QUESTIONS = 20;
```

### Estructura de Componentes
```svelte
<script>
  // 1. Imports
  import { onMount } from 'svelte';
  
  // 2. Props
  let { prop1, prop2 } = $props();
  
  // 3. State
  let localState = $state(false);
  
  // 4. Derived
  let computed = $derived(prop1 + prop2);
  
  // 5. Functions
  function handleClick() {}
  
  // 6. Lifecycle
  onMount(() => {});
</script>

<!-- 7. Template -->
<div>
  {prop1}
</div>

<!-- 8. Styles -->
<style>
  div { color: red; }
</style>
```

---

## 🚨 Errores Comunes

### 1. "Cannot access store before initialization"
**Solución**: Importa stores solo en componentes client-side

### 2. "Invalid KaTeX syntax"
**Solución**: Escapa caracteres especiales en LaTeX: `\\text{...}`

### 3. "Session not found"
**Solución**: Verifica que Supabase esté configurado correctamente

### 4. "Route not found"
**Solución**: Asegúrate de que el archivo esté en la carpeta `routes/`

---

## 📚 Recursos

- [SvelteKit Docs](https://kit.svelte.dev/)
- [Supabase Docs](https://supabase.com/docs)
- [TailwindCSS Docs](https://tailwindcss.com/docs)
- [KaTeX Docs](https://katex.org/docs/api.html)

---

## 🔄 Comandos Útiles

```bash
# Desarrollo
npm run dev

# Build
npm run build

# Preview build
npm run preview

# Type checking
npm run check

# Linting
npm run lint

# Formatear código
npm run format
```

---

**Última actualización**: Octubre 2024
