ARQUITECTURA BACKEND - SISTEMA DE APRENDIZAJE INMERSIVO
========================================================

1. STACK TECNOLÓGICO backend
---------------------------
Backend: Flask + Flask-SocketIO
Base de Datos: Supabase (PostgreSQL)
Documentacion: Swagger
Cache: Redis
Auth: Supabase Auth (Google OAuth)
IA: OpenAI API
Transcripción: Web Speech API (MVP)

2. FLUJO UNIFICADO DEL SISTEMA
-------------------------------

⭐ FLUJO COMPLETO: EXAMEN (HTTP) + EXPLICACIÓN (Socket.IO) + INTERRUPCIONES + FOLLOW-UP

[FASE 1: PRESENTACIÓN DE PREGUNTA - HTTP REST]
   |
   v
[Frontend] --HTTP GET--> /api/v1/questions/random?subject=matematicas
   |                       Headers: {Authorization: Bearer <token>}
   v
[Backend: QuestionRepo.get_random_by_subject()]
   |
   v
[Response 200 OK]
{
  "question_id": "uuid",
  "question": "¿Cuál es la derivada de x²?",
  "options": {"a": "2x", "b": "x", "c": "2", "d": "x²"},
  "subject": "calculo",
  "difficulty": "medium",
  "use_latex": true
}
   |
   v
[Usuario responde en Frontend]
   |
   v
[Frontend] --HTTP POST--> /api/v1/questions/{question_id}/answer
   |                        Body: {"user_answer": "b"}
   |                        Headers: {Authorization: Bearer <token>}
   v
[Frontend: Validar respuesta]
   |
   +--------+--------+
   |                 |
   v                 v
[CORRECTA]      [INCORRECTA]
   |                 |
   v                 v
[Response 200]    [Response 200]
{                 {
  "correct": true,  "correct": false,
  "message": "¡Correcto!"  "correct_answer": "a",
}                   "message": "Incorrecto"
   |               }
   v                 |
[Frontend solicita]  v
[siguiente pregunta] [Frontend muestra botón "Explicar"]
   |                 |
   v                 v
[Volver a FASE 1]  [Usuario hace clic en "Explicar"]
                       |
                       v
              [FASE 2: EXPLICACIÓN PRINCIPAL - Socket.IO]

[FASE 2: EXPLICACIÓN PRINCIPAL - Socket.IO STREAMING]
   |
   v
[Frontend establece conexión Socket.IO]
   |  (solo cuando usuario solicita explicación)
   v
[Frontend] --Socket.IO--> connect
   |                       {auth: {token: "jwt"}}
   v
[Backend: Validar token y crear sesión Redis]
   |
   v
[Emit: connection_established]
{session_id: "uuid", user_info: {...}}
   |
   v
[Frontend] --Socket.IO--> start_explanation
   |                       {question_id: "uuid"}
   v
[Backend: ExamService.get_or_create_explanation()]
   |
   +---> [1. Buscar pregunta en questions por ID]
   |          |
   |          v
   |     [Pregunta encontrada]
   |     {question, options, correct_answer, subject}
   |          |
   |          v
   +---> [2. Buscar en exam_question_explanations]
   |          |
   |     +----+----+
   |     |         |
   |     v         v
   | [EXISTE]  [NO EXISTE]
   |     |         |
   |     |         v
   |     |    [3. Generar con IA]
   |     |         |
   |     |         v
   |     |    [AIService.generate_answer()]
   |     |    - Prompt: get_exam_question_prompt()
   |     |    - Incluye: subject, opciones, respuesta correcta
   |     |    - OpenAI API - JSON estructurado
   |     |         |
   |     |         v
   |     |    [4. Guardar en exam_question_explanations]
   |     |    - quality_score: 0.00
   |     |    - generated_by: 'ai'
   |     |    - prompt_version: 'v1.0'
   |     |         |
   |     v         v
   |     +----+----+
   |          |
   |          v
   +---> [5. Incrementar usage_count]
              |
              v
       [StreamingService.start_streaming()]
              |
              v
       [Emit: explanation_start]
       {total_steps, duration, question_id}
              |
              v
       [FASE 3: STREAMING CON INTERRUPCIONES]


[FASE 3: STREAMING CON INTERRUPCIONES]
              |
              v
         +----->[LOOP: Por cada paso de la explicación]
         |           |
         |           v
         |      [Emit: step_start]
         |      {step_number, title, content_type}
         |           |
         |           v
         |      [Emit: content_chunk] (múltiples)
         |      - Intervalo 50-100ms
         |      - Efecto typewriter en Frontend
         |           |
         |           v
         |      [Emit: canvas_command] (si aplica)
         |      - Dibujar figuras geométricas
         |      - Gráficas, ecuaciones
         |      - Animaciones paso a paso
         |           |
         |           v
         |      ¿Usuario interrumpe? (interrupt_explanation)
         |       SI / NO
         |       |     |
         |       v     |
         |   [PAUSAR STREAMING]  |
         |      |      |
         |      v      |
         |   [Frontend] --Socket.IO--> interrupt_explanation |
         |   {clarification_question: "qué es X?", |
         |    current_context: "paso 2 de derivadas"} |
         |      |      |
         |      v      |
         |   [Backend: AIService.generate_answer()] |
         |   - Prompt: get_clarification_prompt() |
         |   - Contexto: pregunta original + paso actual |
         |   - Respuesta CORTA (1-2 pasos) |
         |   - NO SE GUARDA EN DB |
         |      |      |
         |      v      |
         |   [Emit: clarification_start] |
         |   {is_brief: true, estimated_duration: 15} |
         |      |      |
         |      v      |
         |   [Streaming de aclaración] |
         |   - Más rápido (30ms chunks) |
         |   - Sin canvas (solo texto) |
         |      |      |
         |      v      |
         |   [Emit: clarification_complete] |
         |      |      |
         |      v      v
         |   [REANUDAR STREAMING PRINCIPAL]
         |   - Continuar desde donde se quedó
         |           |
         |           v
         +---[Emit: step_complete]
                     |
                     v
              ¿Más pasos?
               SI / NO
               |     |
               +<----+
               |
               v
         [Emit: explanation_complete]
         {total_duration, steps_completed}
               |
               v
         [FASE 4: PREGUNTAS ADICIONALES]


[FASE 4: PREGUNTAS ADICIONALES (OPCIONALES)]
   |
   v
[¿Usuario tiene más dudas?]
   SI / NO
   |     |
   |     v
   |   [Solicitar feedback]
   |   - ¿Fue útil? (helpful_votes)
   |   - ¿Hubo errores? (flag)
   |        |
   |        v
   |     [FIN - Siguiente pregunta de examen]
   |
   v
[Frontend] --Socket.IO--> ask_follow_up_question
   |                       {question: "explica más sobre X",
   |                        related_to: question_id}
   v
[Backend: AIService.generate_answer()]
   |
   +---> [Normalizar y generar hash]
   |          |
   |          v
   |     [Buscar en ai_answers]
   |          |
   |     +----+----+
   |     |         |
   |     v         v
   | [EXISTE]  [NO EXISTE]
   |     |         |
   |     |         v
   |     |    [Generar con IA]
   |     |    - Prompt: get_follow_up_prompt()
   |     |    - Contexto: pregunta de examen + explicación previa
   |     |    - Respuesta LARGA (3-5 pasos)
   |     |         |
   |     |         v
   |     |    [Guardar en ai_answers]
   |     |         |
   |     v         v
   |     +----+----+
   |          |
   |          v
   +---> [StreamingService.start_streaming()]
              |
              v
       [Emit: follow_up_start]
       {total_steps, duration, is_follow_up: true}
              |
              v
       [Streaming completo (igual que FASE 3)]
       - Puede tener interrupciones también
       - Puede tener canvas
              |
              v
       [Emit: follow_up_complete]
              |
              v
       [¿Más preguntas adicionales?]
        SI: Volver a FASE 4
        NO: Solicitar feedback y FIN

2. CONFIGURACIÓN REDIS
----------------------

# Estructura de keys en Redis

# Sesiones activas
session:{session_id} = {
    "user_id": "uuid",
    "connection_id": "socket_id",
    "current_question": "hash",
    "current_step": 0,
    "pause_position": 0,
    "is_paused": false,
    "is_streaming": false,
    "conversation_context": {},
    "created_at": "timestamp",
    "last_activity": "timestamp"
}
TTL: 1800 segundos (30 minutos)

# Cache de respuestas
answer_cache:{question_hash} = {
    "steps": [...],
    "total_duration": 120,
    "cached_at": "timestamp"
}
TTL: 86400 segundos (24 horas)

# Estado de audio/voz
voice_state:{session_id} = {
    "is_recording": false,
    "start_time": "timestamp",
    "chunks_received": 0
}
TTL: 300 segundos (5 minutos)

# Rate limiting
rate_limit:{user_id}:questions = count
TTL: 60 segundos
MAX: 10 preguntas por minuto

6. EVENTOS SOCKET.IO DETALLADOS
--------------------------------

=== CLIENTE -> SERVIDOR ===

1. connect
   payload: {
       auth: {
           token: "supabase_jwt_token"
       }
   }
   proceso:
   - Validar token con Supabase
   - Crear/recuperar session_id
   - Guardar en Redis
   - Emit: connection_established

2. ask_question
   payload: {
       question: "texto de la pregunta",
       context: {} // opcional
   }
   proceso:
   - Validar pregunta no vacía
   - Check rate limit
   - Normalizar y generar hash
   - Buscar en DB
   - Iniciar streaming

3. voice_start
   payload: {
       session_id: "uuid"
   }
   proceso:
   - Pausar streaming actual
   - Actualizar estado en Redis
   - Preparar para recibir audio
   - Emit: voice_recording_started

4. voice_complete
   payload: {
       audio_data: "base64_audio",
       duration: 5000 // ms
   }
   proceso:
   - Transcribir con Web Speech
   - Mostrar transcripción
   - Esperar confirmación

5. pause_explanation
   payload: {
       current_step: 3,
       position_in_step: 150
   }
   proceso:
   - Detener streaming
   - Guardar posición
   - Actualizar Redis
   - Emit: explanation_paused

6. resume_explanation
   payload: {}
   proceso:
   - Recuperar posición
   - Continuar streaming
   - Emit: explanation_resumed

=== SERVIDOR -> CLIENTE ===

1. connection_established
   payload: {
       session_id: "uuid",
       user_info: {
           email: "user@gmail.com"
       }
   }

2. waiting_phrase
   payload: {
       phrase: "Déjame buscar eso...",
       category: "searching",
       estimated_time: 2000
   }

3. explanation_start
   payload: {
       total_steps: 5,
       estimated_duration: 180,
       question_hash: "abc123"
   }

4. step_start
   payload: {
       step_number: 1,
       title: "Introducción al tema",
       content_type: "text",
       has_visual: false
   }

5. content_chunk
   payload: {
       step_number: 1,
       chunk: "Este es el siguiente fragmento...",
       position: 150,
       is_final: false
   }

6. canvas_command
   payload: {
       step_number: 2,
       command: {
           type: "rectangle",
           x: 100,
           y: 100,
           width: 200,
           height: 150,
           color: "#3498db"
       }
   }

7. step_complete
   payload: {
       step_number: 1,
       duration_actual: 15000
   }

8. explanation_complete
   payload: {
       total_duration: 180000,
       steps_completed: 5
   }

9. voice_transcription_result
   payload: {
       transcription: "¿Qué significa esto?",
       confidence: 0.95,
       requires_confirmation: true
   }

10. error
    payload: {
        code: "RATE_LIMIT_EXCEEDED",
        message: "Demasiadas preguntas",
        retry_after: 30
    }

