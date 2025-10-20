# 🔗 Integración con Backend Flask

Este documento explica cómo el frontend SvelteKit se integra con el backend Flask.

## 📋 Tabla de Contenidos

1. [Arquitectura de Comunicación](#arquitectura-de-comunicación)
2. [Cliente HTTP (api.js)](#cliente-http-apijs)
3. [Flujo de Autenticación](#flujo-de-autenticación)
4. [Endpoints Disponibles](#endpoints-disponibles)
5. [Manejo de Errores](#manejo-de-errores)

---

## Arquitectura de Comunicación

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────┐
│  SvelteKit      │         │  Backend Flask   │         │  Supabase   │
│  Frontend       │         │  (Port 5000)     │         │  Auth + DB  │
└────────┬────────┘         └────────┬─────────┘         └──────┬──────┘
         │                           │                           │
         │  1. Google OAuth          │                           │
         ├───────────────────────────┼──────────────────────────>│
         │                           │                           │
         │  2. JWT Token             │                           │
         │<──────────────────────────┼───────────────────────────┤
         │                           │                           │
         │  3. POST /auth/initialize │                           │
         ├──────────────────────────>│                           │
         │     (con JWT token)       │                           │
         │                           │  4. Crear perfil          │
         │                           ├──────────────────────────>│
         │                           │                           │
         │  5. Perfil creado         │                           │
         │<──────────────────────────┤                           │
         │                           │                           │
```

---

## Cliente HTTP (api.js)

### Ubicación
`src/lib/api.js`

### Configuración

```javascript
const API_BASE_URL = `${PUBLIC_SOCKET_URL}/api/v1`;
// Por defecto: http://localhost:5000/api/v1
```

### Módulos Disponibles

#### 1. **authAPI**
Maneja la autenticación y perfiles de usuario.

```javascript
import { authAPI } from '$lib/api';

// Verificar token JWT
await authAPI.verify(token);

// Inicializar perfil (primera vez)
await authAPI.initialize(token);

// Obtener perfil completo
await authAPI.getProfile(token);
```

#### 2. **questionsAPI**
Maneja las preguntas del examen.

```javascript
import { questionsAPI } from '$lib/api';

// Obtener pregunta aleatoria
await questionsAPI.getRandom(token, 'matematicas', 'medium');

// Validar respuesta
await questionsAPI.answer(token, questionId, 'a');

// Obtener pregunta específica
await questionsAPI.getById(token, questionId);
```

#### 3. **sessionsAPI**
Maneja las sesiones de Socket.IO.

```javascript
import { sessionsAPI } from '$lib/api';

// Obtener sesión específica
await sessionsAPI.getById(token, sessionId);
```

#### 4. **healthAPI**
Verifica el estado del backend.

```javascript
import { healthAPI } from '$lib/api';

// Health check
await healthAPI.check();
```

---

## Flujo de Autenticación

### Diagrama Completo de Autenticación con Google

```
┌─────────────────────────────────────────────────────────────────────┐
│  FLUJO COMPLETO: Login con Google OAuth                            │
└─────────────────────────────────────────────────────────────────────┘

1. Usuario hace clic en "Iniciar con Google"
   ↓
2. signInWithGoogle() → Redirige a Google OAuth
   ↓
3. Usuario autoriza en Google
   ↓
4. Google redirige a /auth/callback con código
   ↓
5. Supabase intercambia código por JWT token
   ↓
6. Frontend llama a initializeUserProfile()
   ↓
7. POST /auth/initialize (Backend Flask)
   ├─ Header: Origin: http://localhost:5173
   └─ Body: { token: "JWT..." }
   ↓
8. Backend verifica token y consulta Supabase
   ↓
   ┌─────────────────┬─────────────────┐
   │  NUEVO USUARIO  │ USUARIO EXISTE  │
   └─────────────────┴─────────────────┘
         ↓                    ↓
   Crea perfil          Retorna perfil
   Crea 8 materias      existente
   en user_progress
         ↓                    ↓
   Response 201         Response 200
   isNewUser: true      isNewUser: false
         ↓                    ↓
         └────────┬───────────┘
                  ↓
9. Frontend muestra mensaje apropiado
   ↓
10. Redirige a dashboard (/)
```

### 1. Login con Google OAuth

**Archivo:** `src/lib/stores/authStore.js`

```javascript
import { signInWithGoogle } from '$lib/stores/authStore';

// Usuario hace click en "Iniciar con Google"
await signInWithGoogle();
// → Redirige a Google OAuth
// → Google redirige a /auth/callback
```

### 2. Callback de OAuth

**Archivo:** `src/routes/auth/callback/+page.svelte`

```javascript
// 1. Obtener sesión de Supabase
const { data } = await supabase.auth.getSession();

// 2. Inicializar perfil en backend Flask
const result = await initializeUserProfile();

// 3. Verificar si es usuario nuevo
if (result.isNewUser) {
    // Perfil creado + progreso inicializado para 8 materias
    console.log('Nuevo usuario registrado');
} else {
    // Usuario existente
    console.log('Bienvenido de nuevo');
}

// 4. Redirigir a dashboard
goto('/');
```

### 3. Registro con Email/Password

**Archivo:** `src/lib/stores/authStore.js`

```javascript
import { signUpWithEmail } from '$lib/stores/authStore';

// Usuario se registra
await signUpWithEmail(email, password, name);
// → Si la sesión está activa, inicializa el perfil automáticamente
// → Si requiere confirmación de email, el perfil se crea después
```

---

## Endpoints Disponibles

### Autenticación

#### POST /auth/verify
Verifica un token JWT de Supabase.

**Request:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response 200:**
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com"
  }
}
```

---

#### POST /auth/initialize
Inicializa el perfil de un nuevo usuario.

**Request:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response 201 (Nuevo usuario):**
```json
{
  "message": "Perfil inicializado exitosamente",
  "profile": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "full_name": "Juan Pérez",
    "plan_type": "free",
    "credits_remaining": 10
  },
  "progress_initialized": 8
}
```

**Response 200 (Usuario existente):**
```json
{
  "message": "El perfil ya existe",
  "profile": { ... }
}
```

**Materias inicializadas:**
- matematicas
- fisica
- quimica
- biologia
- historia
- geografia
- literatura
- ingles

---

#### GET /auth/profile
Obtiene el perfil completo del usuario.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response 200:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "full_name": "Juan Pérez",
  "plan_type": "free",
  "credits_remaining": 10,
  "progress": [
    {
      "subject": "matematicas",
      "total_questions": 50,
      "correct_answers": 35
    }
  ]
}
```

---

### Preguntas

#### GET /questions/random
Obtiene una pregunta aleatoria.

**Query Params:**
- `subject`: matematicas, fisica, quimica, biologia, historia, geografia, literatura, ingles
- `difficulty`: easy, medium, hard

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response 200:**
```json
{
  "id": "2024Algebra11",
  "subject": "matematicas",
  "difficulty": "medium",
  "question_text": "¿Cuál es la solución de x² - 5x + 6 = 0?",
  "options": {
    "a": "x = 2, x = 3",
    "b": "x = 1, x = 6",
    "c": "x = -2, x = -3",
    "d": "x = 0, x = 5"
  },
  "correct_answer": "a"
}
```

---

#### POST /questions/{id}/answer
Valida una respuesta.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request:**
```json
{
  "user_answer": "a"
}
```

**Response 200:**
```json
{
  "is_correct": true,
  "correct_answer": "a",
  "explanation": "La factorización de x² - 5x + 6 es (x-2)(x-3) = 0"
}
```

---

## Manejo de Errores

### Estructura de Error

```javascript
try {
    await authAPI.initialize(token);
} catch (error) {
    console.error('Error:', error);
    // error = {
    //   status: 401,
    //   message: 'Token inválido',
    //   data: { ... }
    // }
}
```

### Códigos de Estado

- **200**: OK
- **201**: Created
- **400**: Bad Request (datos inválidos)
- **401**: Unauthorized (token inválido o expirado)
- **403**: Forbidden (sin permisos)
- **404**: Not Found (recurso no encontrado)
- **500**: Internal Server Error

### Manejo en el Frontend

```javascript
try {
    const result = await initializeUserProfile();
} catch (error) {
    if (error.status === 401) {
        // Token expirado, redirigir a login
        goto('/cuenta/login');
    } else if (error.status === 500) {
        // Error del servidor
        console.error('Error del servidor:', error.message);
    } else {
        // Otro error
        console.error('Error:', error);
    }
}
```

---

## Variables de Entorno

### Archivo: `.env`

```env
PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
PUBLIC_SUPABASE_ANON_KEY=tu_clave_publica_anonima
PUBLIC_SOCKET_URL=http://localhost:5000
```

### Uso en el Código

```javascript
import { PUBLIC_SOCKET_URL } from '$env/static/public';

const API_BASE_URL = `${PUBLIC_SOCKET_URL}/api/v1`;
```

---

## Próximos Pasos

1. ✅ Cliente HTTP implementado
2. ✅ Autenticación con Google OAuth
3. ✅ Inicialización de perfil
4. ⏳ Cliente Socket.IO para explicaciones en tiempo real
5. ⏳ Componentes UI para el salón de clase

---

**Última actualización:** 2025-01-20
