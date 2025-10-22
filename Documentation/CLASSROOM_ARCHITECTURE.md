# Arquitectura ClassRoom - Separación de Lógica y UI

## 📋 Resumen

La lógica del salón de clase ha sido migrada desde `routes/classRoom/+page.svelte` a `lib/classRoom/` siguiendo el principio de separación de responsabilidades. La ruta ahora solo maneja la UI mientras que toda la lógica de negocio está en composables reutilizables.

## 🏗️ Estructura de Archivos

```
src/lib/classRoom/
├── composables/           # Composables reutilizables
│   ├── index.js          # Barrel export
│   ├── useSocketConnection.js
│   ├── useExplanationControl.js
│   ├── useSyncCallbacks.js
│   ├── useFeedbackModal.js
│   ├── useQuestionData.js
│   └── useProgressTracking.js
├── controllers/          # Controladores que orquestan composables
│   └── ClassRoomController.js
└── index.js             # Punto de entrada principal
```

## 🧩 Composables

### 1. **useSocketConnection.js**
Maneja la conexión Socket.IO y autenticación.

**Responsabilidades:**
- Autenticación con Supabase
- Conexión al socket
- Setup de listeners de eventos
- Desconexión limpia

**API:**
```javascript
const { connect, setupListeners, disconnect, isConnected } = useSocketConnection();

// Conectar con callbacks
await connect(onSuccess, onError);

// Configurar listeners
setupListeners(voiceEnabled);

// Desconectar
disconnect();
```

### 2. **useExplanationControl.js**
Control del flujo de explicación.

**Responsabilidades:**
- Iniciar/detener explicación
- Control de renderizado
- Navegación
- Limpieza de recursos

**API:**
```javascript
const {
  startExplanation,
  startRendering,
  stop,
  retry,
  goBack,
  toggleVoice,
  getProgress,
  cleanup
} = useExplanationControl();

// Iniciar explicación
startExplanation(questionData);

// Iniciar renderizado
startRendering();

// Alternar voz
toggleVoice(enabled);
```

### 3. **useSyncCallbacks.js**
Callbacks del syncService para tracking de progreso.

**Responsabilidades:**
- Configurar callbacks de syncService
- Tracking de inicio/fin de pasos
- Cálculo de comandos canvas visibles
- Logging de triggers dinámicos

**API:**
```javascript
const {
  setupCallbacks,
  getVisibleCanvasCommands,
  logCanvasTriggers
} = useSyncCallbacks({
  onStepStarted: (checkpoint, stepIndex) => {},
  onStepCompleted: (checkpoint, stepIndex) => {},
  onProgressUpdate: (checkpoint, progress, charIndex, totalChars) => {}
});

// Configurar callbacks
setupCallbacks(completedSteps);

// Obtener comandos visibles
const commands = getVisibleCanvasCommands(currentStep, stepProgress);
```

### 4. **useFeedbackModal.js**
Manejo del modal de feedback.

**Responsabilidades:**
- Enviar feedback
- Omitir feedback
- Limpieza antes de salir

**API:**
```javascript
const { submitFeedback, skipFeedback } = useFeedbackModal();

// Enviar feedback
submitFeedback(rating, comment);

// Omitir
skipFeedback();
```

### 5. **useQuestionData.js**
Extracción y validación de datos de pregunta.

**Responsabilidades:**
- Extraer datos de URL
- Validar datos
- Guardar en store

**API:**
```javascript
const { extractQuestionData, validateQuestionData, saveToStore } = useQuestionData(searchParams);

// Extraer datos
const data = extractQuestionData();

// Validar
const error = validateQuestionData(data);

// Guardar
saveToStore(data);
```

### 6. **useProgressTracking.js**
Tracking de progreso de renderizado.

**Responsabilidades:**
- Iniciar/detener tracking
- Actualización periódica
- Limpieza de intervalos

**API:**
```javascript
const { startTracking, stopTracking, cleanup } = useProgressTracking();

// Iniciar tracking
startTracking((progress) => {
  console.log(`Progreso: ${progress}%`);
});

// Detener
stopTracking();
```

## 🎮 Controlador Principal

### **ClassRoomController.js**
Orquesta todos los composables y expone una API unificada.

**Responsabilidades:**
- Inicializar sistema completo
- Coordinar composables
- Exponer API simplificada para la UI

**Uso:**
```javascript
import { createClassRoomController } from '$lib/classRoom';

// Crear controlador
const controller = createClassRoomController(searchParams);

// Inicializar
await controller.initialize({
  onConnecting: () => {},
  onConnected: () => {},
  onError: (error) => {},
  onProgressUpdate: (progress) => {}
});

// Iniciar renderizado
controller.startRendering((progress) => {
  renderProgress = progress;
});

// Alternar voz
controller.toggleVoice(enabled);

// Obtener comandos canvas
const commands = controller.getVisibleCanvasCommands(currentStep, stepProgress);

// Limpiar al desmontar
controller.cleanup();
```

## 🔄 Flujo de Datos

```
+page.svelte (UI)
    ↓
ClassRoomController (Orquestador)
    ↓
┌─────────────────┬──────────────────┬─────────────────┐
│                 │                  │                 │
useSocket     useExplanation   useSyncCallbacks   useFeedback
Connection       Control                            Modal
    ↓                ↓                  ↓                ↓
socketService  syncService      explanationStore   goto()
```

## 📊 Comparación Antes/Después

### **Antes (Todo en +page.svelte)**
```javascript
// +page.svelte - 858 líneas
<script>
  // 364 líneas de lógica mezclada con UI
  let isConnecting = $state(true);
  
  async function connectToSocket() { /* ... */ }
  function setupSocketListeners() { /* ... */ }
  function startExplanation() { /* ... */ }
  // ... más funciones
</script>

<!-- 494 líneas de UI -->
```

### **Después (Lógica separada)**
```javascript
// +page.svelte - ~150 líneas (solo UI)
<script>
  import { createClassRoomController } from '$lib/classRoom';
  
  const controller = createClassRoomController($page.url.searchParams);
  
  onMount(async () => {
    await controller.initialize({
      onConnected: () => isConnecting = false,
      onError: (err) => connectionError = err
    });
  });
</script>

<!-- UI limpia y enfocada -->
```

## ✅ Ventajas de la Nueva Arquitectura

1. **Separación de Responsabilidades**
   - UI solo maneja presentación
   - Lógica aislada en composables

2. **Reutilización**
   - Composables pueden usarse en otras rutas
   - Lógica testeable independientemente

3. **Mantenibilidad**
   - Código más organizado
   - Fácil de encontrar y modificar

4. **Testabilidad**
   - Composables testeables sin UI
   - Mocking simplificado

5. **Escalabilidad**
   - Fácil agregar nuevas funcionalidades
   - Composables pueden componerse

## 🎯 Próximos Pasos

Para migrar `+page.svelte` a usar el nuevo controlador:

1. Importar el controlador
2. Crear instancia con searchParams
3. Llamar a `initialize()` en `onMount()`
4. Usar API del controlador en lugar de funciones locales
5. Mantener solo estados de UI ($state para UI)
6. Llamar a `cleanup()` en `onDestroy()`

## 📝 Ejemplo de Migración

```javascript
<script>
  import { onMount, onDestroy } from 'svelte';
  import { page } from '$app/stores';
  import { createClassRoomController } from '$lib/classRoom';
  import { explanationStore } from '$lib/stores';
  
  // Estados de UI
  let isConnecting = $state(true);
  let connectionError = $state(null);
  let showFeedbackModal = $state(false);
  let feedbackRating = $state(null);
  let feedbackComment = $state('');
  let renderProgress = $state(0);
  let hasStarted = $state(false);
  let voiceMuted = $state(false);
  let isExplanationCollapsed = $state(false);
  
  // Crear controlador
  const controller = createClassRoomController($page.url.searchParams);
  
  // Comandos canvas derivados
  const currentCanvasCommands = $derived(
    controller.getVisibleCanvasCommands(
      $explanationStore.currentStep,
      $explanationStore.stepProgress.percentage
    )
  );
  
  onMount(async () => {
    await controller.initialize({
      onConnecting: () => isConnecting = true,
      onConnected: () => isConnecting = false,
      onError: (error) => {
        connectionError = error;
        isConnecting = false;
      }
    });
  });
  
  function handlePlay() {
    hasStarted = true;
    controller.startRendering((progress) => {
      renderProgress = progress;
    });
  }
  
  function handleStop() {
    controller.stop();
  }
  
  function toggleVoice() {
    voiceMuted = !voiceMuted;
    controller.toggleVoice(!voiceMuted);
  }
  
  function handleGoBack() {
    showFeedbackModal = true;
  }
  
  function submitFeedback() {
    controller.submitFeedback(feedbackRating, feedbackComment);
  }
  
  function skipFeedback() {
    controller.skipFeedback();
  }
  
  onDestroy(() => {
    controller.cleanup();
  });
</script>

<!-- UI Components -->
```

## 🔍 Notas Importantes

- **No cambiar funcionalidad**: La migración mantiene exactamente la misma funcionalidad
- **Svelte 5 Runes**: Usar $state, $derived, $effect en UI
- **Store reactivo**: explanationStore sigue siendo reactivo con $
- **Cleanup**: Siempre llamar a cleanup() en onDestroy()
