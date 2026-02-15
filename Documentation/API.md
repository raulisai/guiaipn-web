# 🌐 API - Backend y Comunicación

Documentación completa de la API REST, Socket.IO y manejo de errores HTTP.

---

## 📡 Backend Flask

**Base URL:** `http://localhost:5000/api/v1`

### Stack Tecnológico
- **Framework:** Flask + Flask-SocketIO
- **Base de datos:** Supabase (PostgreSQL)
- **Cache:** Redis (sesiones Socket.IO)
- **IA:** OpenAI GPT-4
- **Auth:** JWT tokens de Supabase

---

## 🔐 Autenticación

Todos los endpoints (excepto `/health`) requieren autenticación mediante JWT token en el header:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📋 Endpoints REST

### Auth

#### `POST /auth/verify`
Verifica un token JWT de Supabase.

**Request:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "valid": true,
  "user_id": "uuid",
  "email": "user@example.com"
}
```

---

#### `POST /auth/initialize`
Inicializa perfil de nuevo usuario (crea profile + user_progress para 8 materias).

**Request:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "profile": { "id": "uuid", "full_name": "...", ... },
  "progress": [ /* 8 materias */ ]
}
```

---

#### `GET /auth/profile`
Obtiene perfil completo del usuario.

**Headers:**
```http
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "uuid",
  "full_name": "Juan Pérez",
  "email": "juan@example.com",
  "avatar_url": "https://...",
  "is_admin": false,
  "created_at": "2024-01-20T10:00:00Z"
}
```

---

### Questions

#### `GET /questions/random`
Obtiene una pregunta aleatoria.

**Query Params:**
- `subject`: matematicas | fisica | quimica | biologia | historia | geografia | literatura | ingles
- `difficulty`: easy | medium | hard

**Headers:**
```http
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "uuid",
  "subject": "matematicas",
  "difficulty": "medium",
  "question_text": "¿Cuál es el resultado de 2+2?",
  "options": {
    "a": "3",
    "b": "4",
    "c": "5",
    "d": "6"
  },
  "correct_answer": "b"
}
```

---

#### `POST /questions/{id}/answer`
Valida una respuesta.

**Request:**
```json
{
  "user_answer": "b"
}
```

**Response:**
```json
{
  "correct": true,
  "correct_answer": "b",
  "explanation": "2+2 = 4"
}
```

---

#### `GET /questions/{id}`
Obtiene una pregunta específica.

**Response:**
```json
{
  "id": "uuid",
  "subject": "matematicas",
  "question_text": "...",
  "options": { ... }
}
```

---

### Sessions

#### `GET /sessions/{id}`
Obtiene una sesión de Socket.IO específica.

**Response:**
```json
{
  "session_id": "uuid",
  "user_id": "uuid",
  "created_at": "2024-01-20T10:00:00Z",
  "expires_at": "2024-01-20T10:30:00Z"
}
```

---

### Health

#### `GET /health`
Verifica el estado del servicio (no requiere auth).

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-20T10:00:00Z"
}
```

---

## 🔌 Socket.IO

### Conexión

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000', {
  auth: { token: 'jwt_token_here' },
  transports: ['websocket']
});
```

---

### Eventos Cliente → Servidor

#### `start_explanation`
Inicia explicación de una pregunta de examen.

**Payload:**
```javascript
{
  question_id: 'uuid',
  question_text: '¿Cuál es...?',
  correct_answer: 'b',
  user_answer: 'a'
}
```

---

#### `ask_question`
Hace una pregunta libre al profesor IA.

**Payload:**
```javascript
{
  question: '¿Cómo se resuelve esta ecuación?'
}
```

---

#### `ask_follow_up_question`
Pregunta adicional durante una explicación.

**Payload:**
```javascript
{
  question: '¿Puedes explicar el paso 2?'
}
```

---

#### `pause_explanation`
Pausa el streaming de la explicación.

**Payload:**
```javascript
{}
```

---

#### `resume_explanation`
Reanuda el streaming.

**Payload:**
```javascript
{}
```

---

#### `interrupt_explanation`
Interrumpe para hacer una aclaración.

**Payload:**
```javascript
{
  question: 'No entendí el paso anterior'
}
```

---

### Eventos Servidor → Cliente

#### `connection_established`
Confirmación de conexión exitosa.

**Payload:**
```javascript
{
  session_id: 'uuid',
  message: 'Conexión establecida'
}
```

---

#### `waiting_phrase`
Mensaje de espera mientras se genera la respuesta.

**Payload:**
```javascript
{
  phrase: 'Déjame pensar...'
}
```

---

#### `explanation_start`
Inicio de explicación con metadata.

**Payload:**
```javascript
{
  total_steps: 5,
  estimated_duration: 120
}
```

---

#### `step_start`
Inicio de un paso de la explicación.

**Payload:**
```javascript
{
  step_number: 1,
  step_title: 'Identificar la ecuación'
}
```

---

#### `content_chunk`
Chunk de contenido (streaming typewriter).

**Payload:**
```javascript
{
  content: 'Primero, debemos...',
  chunk_index: 0
}
```

---

#### `canvas_command`
Comando para dibujar en el pizarrón.

**Payload:**
```javascript
{
  command: 'draw_equation',
  data: { equation: 'x^2 + 2x + 1 = 0' }
}
```

---

#### `step_complete`
Fin de un paso.

**Payload:**
```javascript
{
  step_number: 1
}
```

---

#### `explanation_complete`
Fin de la explicación completa.

**Payload:**
```javascript
{
  total_duration: 118,
  steps_completed: 5
}
```

---

#### `error`
Error durante la explicación.

**Payload:**
```javascript
{
  error: 'Error al generar explicación',
  code: 'OPENAI_ERROR'
}
```

---

## 🚨 Manejo de Errores HTTP

### Tipos de Errores

#### 1. HTTP_ERROR (4xx, 5xx)
Errores del servidor.

**Estructura:**
```javascript
{
  type: 'HTTP_ERROR',
  status: 404,
  message: 'Perfil no encontrado',
  endpoint: '/auth/profile',
  responseTime: 245,
  data: { /* respuesta del servidor */ }
}
```

**Console:**
```
❌ HTTP Error [404] en /auth/profile: {
  message: 'Perfil no encontrado',
  time: '245ms'
}
```

---

#### 2. TIMEOUT_ERROR
Petición excedió tiempo límite (30s default).

**Estructura:**
```javascript
{
  type: 'TIMEOUT_ERROR',
  message: 'La petición excedió el tiempo límite de 30000ms',
  endpoint: '/auth/profile',
  timeout: 30000
}
```

**Console:**
```
⏱️ Timeout en /auth/profile
```

---

#### 3. NETWORK_ERROR
Sin conexión, CORS, etc.

**Estructura:**
```javascript
{
  type: 'NETWORK_ERROR',
  message: 'Error de red. Verifica tu conexión a internet.',
  endpoint: '/auth/profile',
  originalError: 'Failed to fetch'
}
```

**Console:**
```
🚫 Error de red en /auth/profile
```

---

### Manejo en Componentes

```javascript
import { authAPI } from '$lib/api';

try {
  const profile = await authAPI.getProfile(token);
} catch (error) {
  switch (error.type) {
    case 'HTTP_ERROR':
      if (error.status === 404) {
        console.log('Perfil no encontrado');
      } else if (error.status === 401) {
        console.log('No autorizado');
      }
      break;
      
    case 'TIMEOUT_ERROR':
      console.log('La petición tardó demasiado');
      break;
      
    case 'NETWORK_ERROR':
      console.log('Sin conexión a internet');
      break;
  }
}
```

---

### Timeout Configurable

```javascript
// Timeout personalizado por petición
const profile = await authAPI.getProfile(token, { timeout: 10000 }); // 10s
```

---

## 📊 Códigos de Estado

- **200** OK - Petición exitosa
- **201** Created - Recurso creado
- **400** Bad Request - Datos inválidos
- **401** Unauthorized - Token inválido o expirado
- **403** Forbidden - Sin permisos
- **404** Not Found - Recurso no encontrado
- **500** Internal Server Error - Error del servidor

---

## 🛠️ Cliente HTTP

### Estructura en Frontend

```
src/lib/api/
├── client.js              # Cliente HTTP base
├── endpoints/
│   ├── auth.js           # authAPI
│   ├── questions.js      # questionsAPI
│   ├── sessions.js       # sessionsAPI + healthAPI
│   └── index.js
└── index.js
```

### Uso

```javascript
import { authAPI, questionsAPI, healthAPI } from '$lib/api';

// Auth
const profile = await authAPI.getProfile(token);
await authAPI.initialize(token);

// Questions
const question = await questionsAPI.getRandom(token, 'matematicas', 'medium');
const result = await questionsAPI.answer(token, questionId, 'b');

// Health
const status = await healthAPI.check();
```

---

## 🔧 Configuración

### Variables de Entorno

```env
# Backend URL
PUBLIC_SOCKET_URL=http://localhost:5000

# Supabase
PUBLIC_SUPABASE_URL=your_supabase_url
PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## 📝 Notas

- **Timeout default:** 30 segundos
- **Sesiones Redis:** TTL 30 minutos
- **Streaming:** Chunks de ~50 caracteres
- **Reconnection:** Automática con backoff exponencial

---

**Última actualización:** 2025-01-20
