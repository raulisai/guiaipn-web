# 🔄 Flujos y Diagramas del Sistema

Documentación visual de los flujos principales del sistema.

---

## 📊 Arquitectura General

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (SvelteKit)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Routes     │  │   Stores     │  │  Components  │     │
│  │              │  │              │  │              │     │
│  │ - /         │  │ - authStore  │  │ - Math.svelte│     │
│  │ - /examen   │  │ - examStore  │  │ - Timer      │     │
│  │ - /cuenta   │  │              │  │ - Charts     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP / WebSocket
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Flask + Supabase)                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Flask API   │  │  Socket.IO   │  │   Supabase   │     │
│  │              │  │              │  │              │     │
│  │ - Auth       │  │ - Streaming  │  │ - Auth       │     │
│  │ - Questions  │  │ - IA Explain │  │ - Database   │     │
│  │ - Sessions   │  │ - Canvas     │  │ - Storage    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                              │
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    SERVICIOS EXTERNOS                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   OpenAI     │  │    Redis     │  │  PostgreSQL  │     │
│  │   GPT-4      │  │   Sessions   │  │   Supabase   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 Flujo de Autenticación

### Registro con Email/Password

```
Usuario                    Frontend                  Supabase
  │                           │                          │
  │  1. Completa formulario   │                          │
  │─────────────────────────>│                          │
  │                           │                          │
  │                           │  2. signUpWithEmail()    │
  │                           │────────────────────────>│
  │                           │                          │
  │                           │  3. Crea usuario         │
  │                           │  4. Envía email confirm  │
  │                           │<────────────────────────│
  │                           │                          │
  │  5. Mensaje: Verifica     │                          │
  │     tu email              │                          │
  │<─────────────────────────│                          │
  │                           │                          │
  │  6. Click en link email   │                          │
  │──────────────────────────────────────────────────────>│
  │                           │                          │
  │                           │  7. Confirma cuenta      │
  │                           │  8. Trigger: create      │
  │                           │     profile + progress   │
  │                           │<────────────────────────│
  │                           │                          │
  │  9. Redirige a /cuenta/login                         │
  │<─────────────────────────│                          │
```

### Login con Email/Password

```
Usuario                    Frontend                  Supabase              Backend
  │                           │                          │                    │
  │  1. Ingresa credenciales  │                          │                    │
  │─────────────────────────>│                          │                    │
  │                           │                          │                    │
  │                           │  2. signInWithPassword() │                    │
  │                           │────────────────────────>│                    │
  │                           │                          │                    │
  │                           │  3. Valida credenciales  │                    │
  │                           │  4. Retorna JWT token    │                    │
  │                           │<────────────────────────│                    │
  │                           │                          │                    │
  │                           │  5. Guarda user en store │                    │
  │                           │  6. authAPI.initialize() │                    │
  │                           │────────────────────────────────────────────>│
  │                           │                          │                    │
  │                           │  7. Verifica/crea profile                     │
  │                           │<────────────────────────────────────────────│
  │                           │                          │                    │
  │  8. Redirige a /         │                          │                    │
  │<─────────────────────────│                          │                    │
```

### Login con Google OAuth

```
Usuario                    Frontend                  Supabase
  │                           │                          │
  │  1. Click "Google"        │                          │
  │─────────────────────────>│                          │
  │                           │                          │
  │                           │  2. signInWithOAuth()    │
  │                           │────────────────────────>│
  │                           │                          │
  │  3. Redirige a Google     │                          │
  │<──────────────────────────────────────────────────────
  │                           │                          │
  │  4. Autoriza en Google    │                          │
  │───────────────────────────────────────────────────────>
  │                           │                          │
  │  5. Callback /auth/callback                          │
  │──────────────────────────────────────────────────────>│
  │                           │                          │
  │                           │  6. Procesa sesión       │
  │                           │  7. Trigger: create      │
  │                           │     profile + progress   │
  │                           │<────────────────────────│
  │                           │                          │
  │  8. Redirige a /         │                          │
  │<─────────────────────────│                          │
```

---

## 📝 Flujo del Examen

### Inicio del Examen

```
Usuario                    Frontend (examStore)           reactivos.js
  │                              │                              │
  │  1. Click "Iniciar Examen"   │                              │
  │────────────────────────────>│                              │
  │                              │                              │
  │                              │  2. reset()                  │
  │                              │  3. Selecciona 20 random     │
  │                              │────────────────────────────>│
  │                              │                              │
  │                              │  4. Array de preguntas       │
  │                              │<────────────────────────────│
  │                              │                              │
  │                              │  5. setReactivo(pregunta[0]) │
  │                              │  6. currentQuestion = 1      │
  │                              │                              │
  │  7. Muestra pregunta 1       │                              │
  │<────────────────────────────│                              │
```

### Responder Pregunta

```
Usuario                    Frontend                    examStore
  │                              │                          │
  │  1. Selecciona opción "b"    │                          │
  │────────────────────────────>│                          │
  │                              │                          │
  │                              │  2. saveAnswer(1, "b")   │
  │                              │────────────────────────>│
  │                              │                          │
  │                              │  3. Guarda en answers    │
  │                              │  4. Valida respuesta     │
  │                              │                          │
  │  5. Feedback visual          │                          │
  │<────────────────────────────│                          │
  │                              │                          │
  │  6. Click "Siguiente"        │                          │
  │────────────────────────────>│                          │
  │                              │                          │
  │                              │  7. nextQuestion()       │
  │                              │────────────────────────>│
  │                              │                          │
  │                              │  8. currentQuestion++    │
  │                              │  9. setReactivo(next)    │
  │                              │                          │
  │  10. Muestra pregunta 2      │                          │
  │<────────────────────────────│                          │
```

### Finalizar Examen

```
Usuario                    Frontend                    examStore
  │                              │                          │
  │  1. Responde pregunta 20     │                          │
  │────────────────────────────>│                          │
  │                              │                          │
  │                              │  2. saveAnswer(20, "c")  │
  │                              │────────────────────────>│
  │                              │                          │
  │                              │  3. finishExam()         │
  │                              │  4. finish = true        │
  │                              │  5. Calcula estadísticas │
  │                              │                          │
  │  6. Muestra ModalFinish      │                          │
  │     - Correctas: 15/20       │                          │
  │     - Porcentaje: 75%        │                          │
  │     - Gráfica radar          │                          │
  │<────────────────────────────│                          │
```

---

## 🤖 Flujo de Explicación con IA

### Solicitar Explicación

```
Usuario              Frontend              Socket.IO             Backend (Flask)
  │                      │                     │                        │
  │  1. Click "Explicar" │                     │                        │
  │────────────────────>│                     │                        │
  │                      │                     │                        │
  │                      │  2. connect()       │                        │
  │                      │───────────────────>│                        │
  │                      │                     │                        │
  │                      │  3. connection_established                   │
  │                      │<───────────────────│                        │
  │                      │                     │                        │
  │                      │  4. start_explanation                        │
  │                      │     { question_id, text, answer }            │
  │                      │───────────────────────────────────────────>│
  │                      │                     │                        │
  │                      │  5. waiting_phrase  │                        │
  │                      │<───────────────────────────────────────────│
  │                      │                     │                        │
  │  6. "Déjame pensar..." │                   │                        │
  │<────────────────────│                     │                        │
```

### Streaming de Explicación

```
Backend (OpenAI)       Backend (Flask)       Socket.IO           Frontend
  │                          │                     │                  │
  │  1. Genera explicación   │                     │                  │
  │  2. Stream chunks        │                     │                  │
  │────────────────────────>│                     │                  │
  │                          │                     │                  │
  │                          │  3. explanation_start                  │
  │                          │     { total_steps: 5 }                 │
  │                          │───────────────────────────────────────>│
  │                          │                     │                  │
  │                          │  4. step_start      │                  │
  │                          │     { step: 1, title }                 │
  │                          │───────────────────────────────────────>│
  │                          │                     │                  │
  │                          │  5. content_chunk   │                  │
  │                          │     { content: "Primero..." }          │
  │                          │───────────────────────────────────────>│
  │                          │                     │                  │
  │                          │  6. content_chunk   │                  │
  │                          │     { content: "debemos..." }          │
  │                          │───────────────────────────────────────>│
  │                          │                     │                  │
  │                          │  7. canvas_command  │                  │
  │                          │     { cmd: "draw", data }              │
  │                          │───────────────────────────────────────>│
  │                          │                     │                  │
  │                          │  8. step_complete   │                  │
  │                          │     { step: 1 }     │                  │
  │                          │───────────────────────────────────────>│
  │                          │                     │                  │
  │                          │  ... (pasos 2-5)    │                  │
  │                          │                     │                  │
  │                          │  9. explanation_complete                │
  │                          │     { duration: 120 }                  │
  │                          │───────────────────────────────────────>│
```

---

## 🔄 Gestión de Estado

### authStore

```
┌─────────────────────────────────────────┐
│           authStore (Svelte)            │
├─────────────────────────────────────────┤
│  Estado:                                │
│  - user: User | null                    │
│                                         │
│  Acciones:                              │
│  - signInWithEmail(email, password)     │
│  - signUpWithEmail(email, password)     │
│  - signInWithGoogle()                   │
│  - logout()                             │
│  - resendConfirmationEmail(email)       │
│  - isAuthenticated()                    │
│                                         │
│  Listeners:                             │
│  - onAuthStateChange()                  │
│    └─> Actualiza user automáticamente  │
└─────────────────────────────────────────┘
```

### examStore

```
┌─────────────────────────────────────────┐
│           examStore (Svelte)            │
├─────────────────────────────────────────┤
│  Estado:                                │
│  - totalQuestions: 20                   │
│  - currentQuestion: number              │
│  - materiaQuestion: string              │
│  - answers: { [key]: string }           │
│  - answersDetailed: { [key]: object }   │
│  - reactivo: Question                   │
│  - finish: boolean                      │
│  - showOptionalImage: boolean           │
│  - showSolution: boolean                │
│                                         │
│  Acciones:                              │
│  - nextQuestion()                       │
│  - setReactivo(reactivo)                │
│  - finishExam()                         │
│  - saveAnswer(num, isCorrect)           │
│  - updateMateria(materia)               │
│  - toggleOptionalImage()                │
│  - toggleSolution()                     │
│  - reset()                              │
└─────────────────────────────────────────┘
```

---

## 🛣️ Rutas Protegidas

```
Usuario                    +layout.svelte              authStore
  │                              │                          │
  │  1. Navega a /progreso       │                          │
  │────────────────────────────>│                          │
  │                              │                          │
  │                              │  2. Verifica ruta        │
  │                              │     protectedRoutes      │
  │                              │                          │
  │                              │  3. Verifica $user       │
  │                              │────────────────────────>│
  │                              │                          │
  │                              │  4. user = null          │
  │                              │<────────────────────────│
  │                              │                          │
  │  5. Redirige a /cuenta/login │                          │
  │<────────────────────────────│                          │
```

---

## 📊 Ciclo de Vida de una Pregunta

```
┌──────────────────────────────────────────────────────────────┐
│                    1. CARGA INICIAL                          │
│  reactivos.js → examStore.reset() → Selección aleatoria     │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                    2. RENDERIZADO                            │
│  QuestionDisplay.svelte → Math.svelte (KaTeX)                │
│  AnswerOptions.svelte → 4 opciones (a, b, c, d)             │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                    3. INTERACCIÓN                            │
│  Usuario selecciona → saveAnswer() → Validación              │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                    4. FEEDBACK                               │
│  Correcta: ✅ Verde                                          │
│  Incorrecta: ❌ Rojo + Botón "Explicar"                     │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                    5. NAVEGACIÓN                             │
│  nextQuestion() → currentQuestion++ → Nueva pregunta         │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                    6. FINALIZACIÓN                           │
│  Pregunta 20 → finishExam() → ModalFinish + Estadísticas    │
└──────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Base de Datos (Supabase)

### Esquema

```sql
-- Tabla de perfiles (auto-creada por trigger)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name TEXT,
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger automático
CREATE FUNCTION handle_new_user()
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
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### Row Level Security (RLS)

```sql
-- Habilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo pueden ver su propio perfil
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Política: Los usuarios pueden actualizar su propio perfil
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
```

---

## 🎨 Renderizado de Matemáticas

### Algoritmo de Tipografía Inteligente

```
Pregunta/Opción
      │
      ▼
┌─────────────────────┐
│  ¿Contiene LaTeX?   │
│  (busca \, {, })    │
└─────────────────────┘
      │
      ├─── NO ──> Renderizado normal (texto plano)
      │
      └─── SÍ ──> KaTeX rendering
                       │
                       ▼
                  ┌──────────────────┐
                  │  Longitud < 50?  │
                  └──────────────────┘
                       │
                       ├─── SÍ ──> fontSize: xl
                       │
                       ├─── < 100 ──> fontSize: lg
                       │
                       ├─── < 200 ──> fontSize: base
                       │
                       └─── > 200 ──> fontSize: sm
```

---

**Última actualización:** 2025-01-20
