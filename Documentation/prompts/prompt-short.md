🎯 Plan de Implementación Frontend - Salón de Clase IA
Basándome en tu arquitectura actual y documentación, aquí está el plan optimizado:

📍 ESTADO ACTUAL DEL PROYECTO
✅ Ya Tienes Implementado:

Sistema de autenticación con Supabase (Google OAuth + Email)
Renderizado de preguntas con KaTeX
Sistema de examen con progreso
Stores (authStore, examStore)
Layout con navegación protegida
Integración con Supabase
Estructura de rutas básica

🎯 Lo Que Falta (MVP Salón de Clase):

Integración Socket.IO con backend
Ruta /examen/salon o /explicacion/:questionId
Componentes del salón (Pizarrón, Profesor, Chat)
Sistema de streaming con Canvas
Manejo de eventos en tiempo real


🗂️ FASE 1: SETUP E INTEGRACIÓN SOCKET.IO
Tareas Técnicas
1.1 Instalar Dependencias
bashnpm install socket.io-client
1.2 Crear Socket Service (src/lib/socket.js)
javascript// Estructura básica que necesitas:
- connectSocket(token)
- disconnectSocket()
- emitAskQuestion(question, context)
- emitPauseExplanation()
- emitResumeExplanation()
- onConnectionEstablished(callback)
- onExplanationStart(callback)
- onStepStart(callback)
- onContentChunk(callback)
- onCanvasCommand(callback)
- onStepComplete(callback)
- onExplanationComplete(callback)
- onError(callback)
1.3 Crear Store de Explicación (src/lib/stores/explanationStore.js)
javascript// Estado necesario:
{
  isConnected: false,
  sessionId: null,
  isStreaming: false,
  isPaused: false,
  currentStep: 0,
  totalSteps: 0,
  steps: [],
  currentQuestion: null,
  error: null,
  loading: false
}
```

#### 1.4 Testing Básico
- [ ] Conectar socket al montar componente
- [ ] Ver en consola: "✅ Conectado al backend"
- [ ] Recibir `session_id` en evento `connection_established`
- [ ] Verificar que desconecta correctamente

---

## 🎨 FASE 2: CREAR ESTRUCTURA DE COMPONENTES

### 2.1 Nueva Ruta: `/examen/salon/+page.svelte`

**Estructura del Layout:**
```
┌─────────────────────────────────────────────────┐
│  Header: Pregunta Actual + Salir               │
├──────────────────────┬──────────────────────────┤
│                      │                          │
│   📊 PIZARRÓN        │   💬 PANEL LATERAL       │
│   (Canvas 2D)        │                          │
│                      │   - Progreso (1/5)       │
│   [Character GIF]    │   - Input pregunta       │
│                      │   - Controles            │
│                      │     • Pausar/Resumir     │
│                      │                          │
│                      │                          │
└──────────────────────┴──────────────────────────┘
```

### 2.2 Componentes a Crear

#### A. `Blackboard.svelte`
```
Responsabilidades:
- Canvas HTML5 responsivo
- Ejecutar comandos de dibujo
- Limpiar entre pasos
- Sistema de coordenadas normalizado
```

#### B. `TeacherCharacter.svelte`
```
Responsabilidades:
- Mostrar GIF animado
- Estados: idle, writing, explaining, thinking
- Transiciones suaves entre estados
- Sincronizar con eventos del backend
```

#### C. `ExplanationPanel.svelte`
```
Responsabilidades:
- Mostrar pasos completados
- Input para preguntas
- Botones de control (Pausar/Resumir)
- Indicador de progreso
```

#### D. `TypewriterText.svelte` (Reutilizable)
```
Responsabilidades:
- Efecto typewriter en texto
- Velocidad configurable
- Pausable/reanudable
```

### 2.3 Árbol de Componentes
```
+page.svelte (Salón)
├── <Blackboard />
│   └── Canvas drawing logic
├── <TeacherCharacter 
│     state={animationState} />
├── <ExplanationPanel>
│   ├── <ProgressIndicator />
│   ├── <QuestionInput />
│   └── <ControlButtons />
└── <TypewriterText 
      chunks={currentChunks} />

🔗 FASE 3: FLUJO DE NAVEGACIÓN
3.1 Desde Examen Existente
Modificar navigateToExplanation() en /examen/+page.svelte:
javascript// ANTES: Redirigía a GenerationIAResponse
// AHORA: Redirige al nuevo salón

function navigateToExplanation(resp, resCorrect) {
  const questionData = {
    id: $examStore.reactivo.id,
    pregunta: $examStore.reactivo.pregunta,
    opciones: $examStore.reactivo.opciones,
    respuestaCorrecta: $examStore.reactivo.resuesta,
    respuestaUsuario: resp,
    materia: $examStore.materiaQuestion
  };
  
  // Guardar en localStorage (fallback)
  localStorage.setItem('question_data', JSON.stringify(questionData));
  
  // Navegar al salón
  goto(`/examen/salon?question=${questionData.id}`);
}
```

### 3.2 Flujo Completo
```
Usuario responde mal
      ↓
navigateToExplanation()
      ↓
goto(/examen/salon?question=2024Algebra11)
      ↓
+page.svelte (Salón) monta
      ↓
onMount → connectSocket(token)
      ↓
Recibe connection_established
      ↓
emitAskQuestion(questionData)
      ↓
Backend procesa → Streaming inicia
      ↓
Frontend renderiza en tiempo real

🎬 FASE 4: IMPLEMENTAR STREAMING
4.1 Lógica de Streaming en +page.svelte
javascript// Pseudocódigo de la lógica principal

onMount(async () => {
  // 1. Obtener token
  const token = await getSupabaseToken();
  
  // 2. Conectar socket
  socket = connectSocket(token);
  
  // 3. Setup listeners
  socket.onConnectionEstablished((data) => {
    explanationStore.setSessionId(data.session_id);
  });
  
  socket.onExplanationStart((data) => {
    explanationStore.initExplanation(data.total_steps);
  });
  
  socket.onStepStart((data) => {
    explanationStore.startStep(data);
    teacherState = 'explaining';
  });
  
  socket.onContentChunk((data) => {
    explanationStore.addChunk(data);
    // Typewriter renderiza automáticamente
  });
  
  socket.onCanvasCommand((cmd) => {
    blackboardRef.executeCommand(cmd);
    teacherState = 'writing';
  });
  
  socket.onStepComplete(() => {
    explanationStore.completeStep();
    teacherState = 'idle';
  });
  
  socket.onExplanationComplete(() => {
    explanationStore.finish();
    // Mostrar modal de feedback
  });
  
  // 4. Enviar pregunta inicial
  const questionId = new URLSearchParams(window.location.search).get('question');
  const questionData = getQuestionData(questionId);
  
  socket.emitAskQuestion(questionData);
});
4.2 Store Reactions
javascript// explanationStore reacciona a cambios y actualiza UI
$: if ($explanationStore.isStreaming) {
  // Mostrar indicador de streaming
}

$: if ($explanationStore.isPaused) {
  // Mostrar botón de resumir
  // Pausar typewriter
}

$: currentStepContent = $explanationStore.steps[$explanationStore.currentStep];

🖌️ FASE 5: SISTEMA DE CANVAS
5.1 Parser de Comandos
En Blackboard.svelte:
javascriptfunction executeCommand(cmd) {
  const ctx = canvas.getContext('2d');
  
  switch(cmd.type) {
    case 'line':
      drawLine(ctx, cmd.x1, cmd.y1, cmd.x2, cmd.y2, cmd.color);
      break;
    case 'rectangle':
      drawRectangle(ctx, cmd.x, cmd.y, cmd.width, cmd.height, cmd.color);
      break;
    case 'circle':
      drawCircle(ctx, cmd.x, cmd.y, cmd.radius, cmd.color);
      break;
    case 'text':
      drawText(ctx, cmd.text, cmd.x, cmd.y, cmd.fontSize, cmd.color);
      break;
    case 'clear':
      clearCanvas(ctx);
      break;
  }
}
5.2 Animación Progresiva
javascript// Dibujar líneas con animación
function drawLineAnimated(ctx, x1, y1, x2, y2, color, duration = 500) {
  let progress = 0;
  const startTime = Date.now();
  
  function animate() {
    progress = (Date.now() - startTime) / duration;
    
    if (progress < 1) {
      const currentX = x1 + (x2 - x1) * progress;
      const currentY = y1 + (y2 - y1) * progress;
      
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(currentX, currentY);
      ctx.strokeStyle = color;
      ctx.stroke();
      
      requestAnimationFrame(animate);
    }
  }
  
  animate();
}

⏯️ FASE 6: CONTROLES DE REPRODUCCIÓN
6.1 Botones de Control
svelte<!-- En ExplanationPanel.svelte -->

<div class="controls">
  {#if $explanationStore.isStreaming}
    {#if $explanationStore.isPaused}
      <button on:click={resume}>
        ▶️ Resumir
      </button>
    {:else}
      <button on:click={pause}>
        ⏸️ Pausar
      </button>
    {/if}
  {/if}
  
  <button on:click={askQuestion} disabled={questionInput.length === 0}>
    💬 Preguntar
  </button>
</div>
6.2 Lógica de Pausa/Reanudación
javascriptfunction pause() {
  const position = getCurrentPosition();
  socket.emitPauseExplanation(position);
  explanationStore.setPaused(true);
  // Pausar typewriter y animaciones
}

function resume() {
  socket.emitResumeExplanation();
  explanationStore.setPaused(false);
  // Reanudar desde posición guardada
}

🎭 FASE 7: ANIMACIONES DEL PROFESOR
7.1 Estados del Profesor
javascript// teacherStates
const STATES = {
  IDLE: 'idle',           // Esperando
  EXPLAINING: 'explaining', // Hablando al estudiante
  WRITING: 'writing',     // Escribiendo en pizarrón
  THINKING: 'thinking'    // Procesando pregunta
};

// En TeacherCharacter.svelte
$: gifSrc = getGifForState(state);

function getGifForState(state) {
  switch(state) {
    case 'idle': return '/teacher-idle.gif';
    case 'explaining': return '/teacher-talking.gif';
    case 'writing': return '/teacher-writing.gif';
    case 'thinking': return '/teacher-thinking.gif';
  }
}
7.2 Sincronización con Eventos
javascript// En +page.svelte

socket.onStepStart(() => {
  teacherState = 'explaining';
});

socket.onCanvasCommand(() => {
  teacherState = 'writing';
  setTimeout(() => {
    teacherState = 'explaining';
  }, 2000); // Vuelve a explicar después de escribir
});

socket.onWaitingPhrase(() => {
  teacherState = 'thinking';
});

🐛 FASE 8: MANEJO DE ERRORES
8.1 Errores de Conexión
javascriptsocket.onDisconnect(() => {
  // Mostrar modal: "Conexión perdida, reconectando..."
  explanationStore.setError('CONNECTION_LOST');
  
  // Intentar reconexión
  attemptReconnect();
});

function attemptReconnect(retries = 3) {
  if (retries === 0) {
    // Mostrar: "No se pudo reconectar, recarga la página"
    return;
  }
  
  setTimeout(() => {
    socket.connect();
    attemptReconnect(retries - 1);
  }, 2000);
}
8.2 Errores del Backend
javascriptsocket.onError((error) => {
  switch(error.code) {
    case 'RATE_LIMIT_EXCEEDED':
      showNotification('Demasiadas preguntas, espera un momento');
      break;
    case 'INSUFFICIENT_CREDITS':
      showNotification('Créditos insuficientes');
      goto('/cuenta'); // Redirigir a comprar créditos
      break;
    case 'AI_GENERATION_ERROR':
      showNotification('Error generando explicación, intenta de nuevo');
      break;
    default:
      showNotification('Error inesperado');
  }
});

📊 FASE 9: FEEDBACK Y CIERRE
9.1 Modal de Feedback
svelte<!-- ModalFeedback.svelte -->

<dialog bind:this={modal} class="modal">
  <h2>¿Te ayudó la explicación?</h2>
  
  <div class="rating">
    <button on:click={() => rate(1)}>⭐</button>
    <button on:click={() => rate(2)}>⭐⭐</button>
    <button on:click={() => rate(3)}>⭐⭐⭐</button>
    <button on:click={() => rate(4)}>⭐⭐⭐⭐</button>
    <button on:click={() => rate(5)}>⭐⭐⭐⭐⭐</button>
  </div>
  
  <div class="actions">
    <button on:click={backToExam}>Volver al examen</button>
    <button on:click={askAnotherQuestion}>Otra pregunta</button>
  </div>
</dialog>
9.2 Guardar Métricas
javascriptasync function rate(stars) {
  // Guardar en Supabase
  await supabase.from('interactions').insert({
    user_id: $user.id,
    question_id: questionId,
    rating: stars,
    completed: true,
    response_time_ms: totalTime
  });
  
  modal.close();
}

🚀 PLAN DE EJECUCIÓN PRIORIZADO
Sprint 1 (Funcionalidad Core) - 3-4 días

✅ Instalar Socket.IO client
✅ Crear socket.js service
✅ Crear explanationStore.js
✅ Crear ruta /examen/salon/+page.svelte básica
✅ Implementar conexión y prueba de eventos básicos
✅ Modificar navigateToExplanation() para usar nueva ruta

Sprint 2 (UI Básica) - 2-3 días

✅ Crear Blackboard.svelte con canvas básico
✅ Crear TeacherCharacter.svelte con GIF estático
✅ Crear ExplanationPanel.svelte con progreso
✅ Layout responsive de 2 columnas

Sprint 3 (Streaming) - 3-4 días

✅ Implementar listeners de eventos de streaming
✅ Integrar TypewriterText.svelte
✅ Parser de comandos de canvas
✅ Sincronización visual con pasos

Sprint 4 (Controles) - 2 días

✅ Pausar/Resumir funcional
✅ Input de preguntas durante explicación
✅ Manejo de estado pausado en typewriter

Sprint 5 (Polish) - 2-3 días

✅ Animaciones del profesor sincronizadas
✅ Transiciones suaves entre pasos
✅ Modal de feedback
✅ Manejo de errores robusto

Sprint 6 (Testing) - 1-2 días

✅ Testing con preguntas reales
✅ Ajustar velocidades de animación
✅ Responsive en móvil
✅ Performance optimization


📋 CHECKLIST DE IMPLEMENTACIÓN
Fase 1: Setup

 npm install socket.io-client
 Crear src/lib/socket.js
 Crear src/lib/stores/explanationStore.js
 Probar conexión básica en consola

Fase 2: Ruta Principal

 Crear /examen/salon/+page.svelte
 Implementar layout de 2 columnas
 Conectar socket al montar
 Desconectar al desmontar

Fase 3: Componentes Core

 Blackboard.svelte - Canvas funcional
 TeacherCharacter.svelte - GIF básico
 ExplanationPanel.svelte - Panel lateral
 TypewriterText.svelte - Efecto typing

Fase 4: Integración Streaming

 Escuchar explanation_start
 Escuchar step_start
 Escuchar content_chunk
 Escuchar canvas_command
 Escuchar step_complete
 Escuchar explanation_complete

Fase 5: Canvas Drawing

 Parser de comandos line, rectangle, circle, text
 Animaciones progresivas
 Clear entre pasos
 Colores configurables

Fase 6: Controles

 Botón Pausar funcional
 Botón Resumir funcional
 Input de preguntas
 Indicador de progreso (X/Y)

Fase 7: Profesor Animado

 Estados: idle, explaining, writing, thinking
 Transiciones automáticas
 Sincronización con eventos

Fase 8: Errores

 Manejo de desconexión
 Reintentos automáticos
 Mensajes de error amigables
 Validaciones de input

Fase 9: Feedback

 Modal de rating
 Botones de acción (Volver/Otra pregunta)
 Guardar en Supabase

Fase 10: Testing

 Prueba con pregunta corta (2 pasos)
 Prueba con pregunta compleja (5+ pasos)
 Prueba pausar/resumir
 Prueba en móvil
 Performance (60fps en animaciones)


🎯 ENTREGABLE MÍNIMO VIABLE (MVP)
Must Have ✅

Conexión Socket.IO estable
Streaming de texto paso a paso
Canvas con dibujos básicos (líneas, texto)
Profesor GIF sincronizado (al menos 2 estados)
Pausar/Resumir
Indicador de progreso
Navegación desde examen existente

Nice to Have ⏳ (Post-MVP)

Animaciones avanzadas de canvas
Entrada por voz
Múltiples estilos de profesor
Replay de explicaciones
Export de explicaciones


Tiempo estimado MVP: 12-15 días (asumiendo trabajo full-time)