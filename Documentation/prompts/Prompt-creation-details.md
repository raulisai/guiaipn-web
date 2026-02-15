📋 Plan de Implementación Detallado - Salón de Clase IA
Sin Código - Solo Instrucciones Precisas

🎯 SPRINT 1: CONFIGURACIÓN E INTEGRACIÓN SOCKET.IO
Tarea 1.1: Instalación de Dependencias
Objetivo: Agregar Socket.IO client al proyecto frontend
Pasos:

Abrir terminal en la raíz del proyecto frontend (donde está package.json)
Ejecutar comando de instalación de socket.io-client
Esperar que la instalación complete sin errores
Verificar en package.json que socket.io-client aparezca en dependencies
Si usas npm, verificar que node_modules/socket.io-client existe

Criterio de Éxito:

Socket.io-client versión más reciente instalada
Sin errores en la instalación
Dependencia visible en package.json


Tarea 1.2: Crear Servicio de Socket
Objetivo: Crear un módulo centralizado para manejar toda la comunicación Socket.IO
Archivo a crear: src/lib/socket.js
Estructura del archivo:

Importaciones necesarias:

Importar io desde socket.io-client
Importar writable store de Svelte (si planeas usar stores internos)


Constantes de configuración:

Definir URL del backend (http://localhost:5000 para desarrollo)
Definir opciones de transporte (websocket primero, luego polling como fallback)
Definir opciones de reconexión (intentos, delay, timeout)


Variable para almacenar instancia del socket:

Crear variable privada que guardará la conexión Socket.IO
Inicialmente debe ser null


Función connectSocket(token):

Recibe el token JWT de Supabase como parámetro
Si ya existe una conexión activa, no crear otra (return early)
Crear instancia de io() con:

URL del backend
Objeto auth conteniendo el token
Transports configurados como array ['websocket', 'polling']
autoConnect en false inicialmente


Configurar event listeners básicos:

Listener para evento 'connect' que console.log confirme conexión
Listener para evento 'disconnect' que console.log avise desconexión
Listener para evento 'error' que console.error el error


Llamar método connect() manualmente
Retornar la instancia del socket


Función disconnectSocket():

Verificar si existe instancia de socket
Si existe, llamar disconnect()
Limpiar todos los listeners con removeAllListeners()
Setear variable de socket a null


Función getSocket():

Retornar la instancia actual del socket
Si no existe, retornar null


Funciones de emisión de eventos (una por cada evento que el frontend enviará):
emitAskQuestion(questionData, context):

Verificar que socket existe y está conectado
Emitir evento 'ask_question' con payload:

question: el texto de la pregunta
context: objeto de contexto (puede incluir materia, dificultad, etc)



emitPauseExplanation(currentPosition):

Verificar conexión
Emitir evento 'pause_explanation' con:

current_step: número del paso actual
position_in_step: posición en caracteres donde pausó



emitResumeExplanation():

Verificar conexión
Emitir evento 'resume_explanation' sin payload adicional

emitAskFollowUp(question, previousContext):

Verificar conexión
Emitir evento 'ask_follow_up_question' con:

question: nueva pregunta
context: contexto de la explicación anterior




Funciones wrapper para escuchar eventos (una por cada evento del backend):
onConnectionEstablished(callback):

Verificar que socket existe
Registrar listener para evento 'connection_established'
Cuando se reciba, ejecutar callback pasándole los datos (session_id, user_info)

onExplanationStart(callback):

Registrar listener para 'explanation_start'
Callback recibe: total_steps, estimated_duration, question_hash

onStepStart(callback):

Registrar listener para 'step_start'
Callback recibe: step_number, title, content_type, has_visual

onContentChunk(callback):

Registrar listener para 'content_chunk'
Callback recibe: step_number, chunk (texto), position, is_final

onCanvasCommand(callback):

Registrar listener para 'canvas_command'
Callback recibe: step_number, command (objeto con type, coordenadas, etc)

onStepComplete(callback):

Registrar listener para 'step_complete'
Callback recibe: step_number, duration_actual

onExplanationComplete(callback):

Registrar listener para 'explanation_complete'
Callback recibe: total_duration, steps_completed

onWaitingPhrase(callback):

Registrar listener para 'waiting_phrase'
Callback recibe: phrase, category, estimated_time

onError(callback):

Registrar listener para 'error'
Callback recibe: code, message, retry_after (opcional)


Exportar funciones públicas:

connectSocket
disconnectSocket
getSocket
Todas las funciones emit
Todas las funciones on



Criterio de Éxito:

Archivo existe en src/lib/socket.js
Todas las funciones están definidas y exportadas
No hay errores de sintaxis
Puede importarse desde otros componentes


Tarea 1.3: Crear Store de Explicación
Objetivo: Crear un store reactivo que maneje todo el estado de la explicación en curso
Archivo a crear: src/lib/stores/explanationStore.js
Estructura del store:

Importaciones:

Importar writable desde svelte/store


Estado inicial del store:

Crear objeto con estructura:

isConnected: booleano, false por defecto
sessionId: string o null
isStreaming: booleano, false por defecto
isPaused: booleano, false por defecto
isLoading: booleano, false por defecto
currentStep: número, 0 por defecto
totalSteps: número, 0 por defecto
currentQuestion: objeto o null (contendrá datos de la pregunta)
steps: array vacío (cada elemento será un objeto de paso)
metadata: objeto vacío (información adicional de la explicación)
error: string o null
estimatedDuration: número, 0 por defecto
actualDuration: número, 0 por defecto
startTime: timestamp o null
endTime: timestamp o null




Crear writable store:

Usar writable() pasando el estado inicial


Funciones de mutación del store (métodos custom):
setConnected(connected):

Recibe booleano
Actualiza isConnected en el store

setSessionId(sessionId):

Recibe string
Actualiza sessionId en el store

setLoading(loading):

Recibe booleano
Actualiza isLoading en el store

setError(errorMessage):

Recibe string o null
Actualiza error en el store
Si errorMessage no es null, también setear isLoading a false

initExplanation(totalSteps, estimatedDuration, questionData):

Recibe número de pasos totales, duración estimada, y datos de pregunta
Actualizar:

totalSteps
estimatedDuration
currentQuestion con questionData
startTime con timestamp actual
isStreaming a true
currentStep a 0
steps a array vacío
error a null



startStep(stepData):

Recibe objeto con step_number, title, content_type, has_visual
Crear nuevo objeto de paso con:

number: stepData.step_number
title: stepData.title
contentType: stepData.content_type
hasVisual: stepData.has_visual
content: string vacío (se llenará con chunks)
chunks: array vacío
canvasCommands: array vacío
isComplete: false
startTime: timestamp actual
endTime: null


Agregar este objeto al array steps
Actualizar currentStep al step_number recibido

addChunk(chunkData):

Recibe objeto con step_number, chunk (texto), position, is_final
Encontrar el paso correspondiente en array steps
Agregar chunk al array de chunks del paso
Concatenar chunk al content del paso
Si is_final es true, marcar que no llegarán más chunks para ese paso

addCanvasCommand(commandData):

Recibe objeto con step_number, command
Encontrar paso correspondiente
Agregar command al array canvasCommands del paso

completeStep(stepNumber, actualDuration):

Recibe número de paso y duración real
Encontrar paso correspondiente
Actualizar:

isComplete a true
endTime a timestamp actual
actualDuration si se proporciona



setPaused(paused, pausePosition):

Recibe booleano y posición opcional
Actualizar:

isPaused al valor recibido
Si paused es true y se proporciona posición, guardarla en metadata



finishExplanation():

Actualizar:

isStreaming a false
endTime a timestamp actual
Calcular actualDuration (endTime - startTime)



reset():

Resetear todo el store al estado inicial
Mantener sessionId si existe


Exportar:

El store con todas sus funciones custom
Debe ser un objeto con:

subscribe (del writable)
Todas las funciones de mutación definidas





Criterio de Éxito:

Store creado correctamente
Todas las funciones de mutación definidas
Puede importarse y suscribirse desde componentes
Las mutaciones actualizan el estado correctamente


Tarea 1.4: Probar Conexión Básica
Objetivo: Verificar que Socket.IO conecta correctamente con el backend
Pasos:

Preparar backend:

Asegurar que Redis está corriendo (docker ps debe mostrar contenedor redis)
Asegurar que backend Flask está corriendo (python run.py)
Verificar en terminal del backend que muestra "Running on http://0.0.0.0:5000"
Verificar que no hay errores en los logs


Crear componente de prueba temporal:

Archivo: src/routes/test-socket/+page.svelte
Este componente será temporal solo para testing


Estructura del componente de prueba:
Imports:

Importar onMount y onDestroy de svelte
Importar connectSocket, disconnectSocket, onConnectionEstablished desde lib/socket
Importar explanationStore desde lib/stores/explanationStore
Importar authStore para obtener el token

Variables reactivas:

connected: booleano, false inicial
sessionId: string vacío inicial
error: string vacío inicial
socket: null inicial

Lógica onMount:

Obtener usuario del authStore
Si no hay usuario, mostrar error "Debes estar autenticado"
Obtener token JWT:

Acceder a supabase.auth.getSession()
Extraer access_token de la sesión


Si no hay token, mostrar error "No se pudo obtener token"
Llamar connectSocket pasando el token
Guardar referencia del socket
Registrar listener con onConnectionEstablished que:

Console.log los datos recibidos
Actualizar variable connected a true
Actualizar sessionId con el valor recibido
Llamar explanationStore.setSessionId con el session_id
Llamar explanationStore.setConnected(true)



Lógica onDestroy:

Llamar disconnectSocket()
Llamar explanationStore.reset()

HTML del componente:

Mostrar título "Prueba de Conexión Socket.IO"
Mostrar estado de conexión (conectado/desconectado)
Si connected es true:

Mostrar mensaje "✅ Conectado exitosamente"
Mostrar session_id recibido


Si connected es false:

Mostrar mensaje "⏳ Conectando..."


Si error no está vacío:

Mostrar mensaje de error en rojo




Navegar al componente de prueba:

Abrir navegador en http://localhost:5173/test-socket
IMPORTANTE: Debes estar autenticado (logged in) primero


Verificaciones en consola del navegador:

Debe aparecer: "✅ Conectado al backend"
Debe aparecer objeto con datos de connection_established
No debe haber errores en rojo


Verificaciones en consola del backend:

Debe aparecer log de nueva conexión
Debe mostrar el user_id que se conectó
Debe mostrar session_id generado


Verificaciones en Redis (opcional pero recomendado):

Abrir terminal y ejecutar: docker exec -it guiaipn-redis redis-cli
Ejecutar: KEYS "session:*"
Debe mostrar una key con formato session:[uuid]
Ejecutar: GET "session:[uuid]" (usar el uuid que apareció)
Debe mostrar JSON con datos de la sesión


Prueba de desconexión:

Salir de la página test-socket
Verificar en consola del navegador que aparece mensaje de desconexión
Verificar en backend que se detectó la desconexión
Esperar 30 segundos y verificar en Redis que la key de sesión ya no existe (TTL expiró o fue eliminada)



Criterio de Éxito:

Conexión establecida sin errores
Session_id recibido correctamente
Logs en ambos lados (frontend y backend) confirman conexión
Store se actualiza correctamente
Desconexión limpia al salir


🎨 SPRINT 2: CREAR RUTA Y ESTRUCTURA DE COMPONENTES
Tarea 2.1: Crear Ruta del Salón de Clase
Objetivo: Crear la página principal donde ocurrirá toda la explicación
Archivo a crear: src/routes/examen/salon/+page.svelte
Estructura de directorios:

Si no existe, crear carpeta salon dentro de src/routes/examen/
Dentro de salon, crear archivo +page.svelte

Estructura del componente principal:

Script section:
Imports necesarios:

Importar onMount, onDestroy de svelte
Importar goto de $app/navigation
Importar page de $app/stores (para acceder a query params)
Importar authStore de lib/stores/authStore
Importar explanationStore de lib/stores/explanationStore
Importar todas las funciones necesarias de lib/socket
Importar supabase client de lib/supabase
Importar componentes que crearemos después:

Blackboard
TeacherCharacter
ExplanationPanel
TypewriterText (si decides usarlo como componente separado)



Variables de estado:

socket: null inicial
teacherState: string, 'idle' inicial (posibles valores: idle, explaining, writing, thinking)
currentQuestionData: null inicial
showFeedbackModal: boolean, false inicial
isInitialized: boolean, false inicial
errorMessage: string vacío

Variables reactivas ($:):

connected: derivado de $explanationStore.isConnected
streaming: derivado de $explanationStore.isStreaming
paused: derivado de $explanationStore.isPaused
currentStep: derivado de $explanationStore.currentStep
totalSteps: derivado de $explanationStore.totalSteps
steps: derivado de $explanationStore.steps

Función async initializeClassroom():

Verificar que usuario está autenticado ($authStore.user)
Si no está autenticado:

Guardar URL actual en localStorage (para redirect después de login)
Redirigir a /cuenta/login
Return early


Obtener question_id de los query parameters ($page.url.searchParams)
Si no hay question_id:

Intentar obtenerlo de localStorage (fallback)
Si tampoco está ahí, mostrar error y redirigir a /examen
Return early


Buscar datos de la pregunta:

Primero en localStorage (más rápido)
Si no está, hacer query a Supabase questions table
Si no se encuentra, mostrar error


Guardar datos de pregunta en currentQuestionData
Obtener token JWT de Supabase:

Llamar supabase.auth.getSession()
Extraer access_token


Conectar socket:

Llamar connectSocket(token)
Guardar referencia


Registrar todos los listeners de eventos (llamar funciones setup que crearemos)
Setear isInitialized a true

Función setupEventListeners():

Registrar onConnectionEstablished:

Actualizar explanationStore con session_id
Console.log confirmación
Emitir pregunta inicial llamando emitAskQuestion


Registrar onExplanationStart:

Actualizar explanationStore.initExplanation
Console.log inicio de explicación


Registrar onStepStart:

Actualizar explanationStore.startStep
Cambiar teacherState a 'explaining'


Registrar onContentChunk:

Actualizar explanationStore.addChunk


Registrar onCanvasCommand:

Actualizar explanationStore.addCanvasCommand
Cambiar teacherState a 'writing'
Después de 2 segundos, volver teacherState a 'explaining'


Registrar onStepComplete:

Actualizar explanationStore.completeStep
Cambiar teacherState a 'idle'


Registrar onExplanationComplete:

Actualizar explanationStore.finishExplanation
Esperar 1 segundo y mostrar modal de feedback


Registrar onWaitingPhrase:

Cambiar teacherState a 'thinking'
Podrías mostrar el mensaje en algún lugar de la UI


Registrar onError:

Actualizar explanationStore.setError
Mostrar notificación de error al usuario
Si es error crítico, considerar redirigir



Lógica onMount:

Llamar initializeClassroom()
Agregar listener de beforeunload (cuando usuario cierra pestaña):

Desconectar socket limpiamente



Lógica onDestroy:

Desconectar socket
Resetear explanationStore
Limpiar cualquier timer o interval activo


HTML structure:
Layout principal con Tailwind classes:

Container principal: ancho completo, altura viewport completa
Fondo: usar el mismo gradiente que tienes en tu diseño actual

Header superior:

Altura fija (ej. 60px)
Fondo semi-transparente oscuro
Contenido:

Ícono de "volver atrás" (flecha izquierda) que al click:

Confirma si quiere salir (si hay streaming activo)
Desconecta socket
Redirige a /examen


Título de la pregunta actual (truncado si es muy largo)
Indicador de paso actual (ej. "Paso 2/5")
Botón de salir (X)



Main content area:

Usar grid o flex para dividir en 2 columnas
En desktop: 65% izquierda (pizarrón), 35% derecha (panel)
En tablet/móvil: layout vertical, pizarrón arriba, panel abajo

Columna izquierda - Área del pizarrón:

Renderizar componente Blackboard
Pasar props necesarios (steps, currentStep, etc)
Posicionar TeacherCharacter sobre el pizarrón:

Posición absoluta
Esquina inferior derecha o donde prefieras
Pasar teacherState como prop



Columna derecha - Panel lateral:

Renderizar componente ExplanationPanel
Pasar props necesarios (paused, streaming, etc)

Modales/Overlays:

Modal de feedback (condicionalmente renderizado)
Loading overlay cuando isInitialized es false
Error overlay si hay errorMessage


Estilos específicos (dentro de style tag):

Transiciones suaves entre estados
Animaciones de entrada (fade in)
Media queries para responsive
Z-indexes apropiados para modales y character



Criterio de Éxito:

Página se renderiza sin errores
Layout responsive funciona en diferentes tamaños
Navegación a la página funciona correctamente
Query params se leen correctamente
Redirecciones funcionan (si no auth, si no question_id)


Tarea 2.2: Crear Componente Blackboard (Pizarrón)
Objetivo: Crear el canvas donde se dibujará todo el contenido visual
Archivo a crear: src/routes/examen/salon/componentes/Blackboard.svelte
Estructura del componente:

Script section:
Imports:

Importar onMount de svelte
Importar tick de svelte (para esperar actualizaciones del DOM)

Props recibidos:

steps: array de pasos (readonly)
currentStep: número del paso actual (readonly)
isStreaming: boolean (readonly)

Variables internas:

canvas: referencia al elemento canvas (bind:this)
ctx: contexto 2D del canvas (null inicial)
canvasWidth: número, 800 inicial
canvasHeight: número, 600 inicial


Reintentar# ✅ Checklist de Implementación Frontend

## 📦 Fase 1: Configuración Inicial

### Instalación de Dependencias
- [ ] Instalar `socket.io-client`
- [ ] Instalar `@supabase/supabase-js`
- [ ] Instalar `axios` (o fetch wrapper)
- [ ] Instalar librería de estado global (zustand/redux/jotai)
- [pastedIok ahora dame un checklist como este que anexo✅ CHECKLIST COMPLETO - IMPLEMENTACIÓN SALÓN DE CLASE IA

📦 SPRINT 1: CONFIGURACIÓN E INTEGRACIÓN SOCKET.IO
1.1 Instalación de Dependencias

 Abrir terminal en la raíz del proyecto frontend
 Ejecutar: npm install socket.io-client
 Verificar que aparece en package.json bajo dependencies
 Verificar que node_modules/socket.io-client existe
 Sin errores en la instalación

1.2 Crear Servicio de Socket (src/lib/socket.js)

 Crear archivo src/lib/socket.js
 Importar io desde socket.io-client
 Definir constante SOCKET_URL (http://localhost:5000)
 Definir opciones de transporte: ['websocket', 'polling']
 Crear variable privada socket inicializada en null
 Implementar función connectSocket(token) que:

 Verifica si ya existe conexión activa
 Crea instancia de io() con URL, auth y opciones
 Configura listener para evento connect
 Configura listener para evento disconnect
 Configura listener para evento error
 Retorna la instancia del socket


 Implementar función disconnectSocket() que:

 Verifica si socket existe
 Llama socket.disconnect()
 Llama socket.removeAllListeners()
 Setea socket a null


 Implementar función getSocket() que retorna socket actual
 Implementar emitAskQuestion(questionData, context)
 Implementar emitPauseExplanation(currentPosition)
 Implementar emitResumeExplanation()
 Implementar emitAskFollowUp(question, previousContext)
 Implementar onConnectionEstablished(callback)
 Implementar onExplanationStart(callback)
 Implementar onStepStart(callback)
 Implementar onContentChunk(callback)
 Implementar onCanvasCommand(callback)
 Implementar onStepComplete(callback)
 Implementar onExplanationComplete(callback)
 Implementar onWaitingPhrase(callback)
 Implementar onError(callback)
 Exportar todas las funciones públicas
 Verificar que no hay errores de sintaxis

1.3 Crear Store de Explicación (src/lib/stores/explanationStore.js)

 Crear archivo src/lib/stores/explanationStore.js
 Importar writable desde svelte/store
 Definir estado inicial con estructura:

 isConnected: false
 sessionId: null
 isStreaming: false
 isPaused: false
 isLoading: false
 currentStep: 0
 totalSteps: 0
 currentQuestion: null
 steps: []
 metadata: {}
 error: null
 estimatedDuration: 0
 actualDuration: 0
 startTime: null
 endTime: null


 Crear writable store con estado inicial
 Implementar función setConnected(connected)
 Implementar función setSessionId(sessionId)
 Implementar función setLoading(loading)
 Implementar función setError(errorMessage)
 Implementar función initExplanation(totalSteps, estimatedDuration, questionData)
 Implementar función startStep(stepData) que:

 Crea objeto de paso con campos requeridos
 Agrega paso al array steps
 Actualiza currentStep


 Implementar función addChunk(chunkData) que:

 Encuentra paso correspondiente
 Agrega chunk al array de chunks
 Concatena chunk al content


 Implementar función addCanvasCommand(commandData)
 Implementar función completeStep(stepNumber, actualDuration)
 Implementar función setPaused(paused, pausePosition)
 Implementar función finishExplanation()
 Implementar función reset()
 Exportar store con todas las funciones custom
 Verificar que puede importarse sin errores

1.4 Prueba de Conexión Básica

 Verificar que Redis está corriendo: docker ps
 Verificar que backend Flask está corriendo: python run.py
 Backend muestra "Running on http://0.0.0.0:5000"
 No hay errores en logs del backend
 Crear archivo src/routes/test-socket/+page.svelte
 Importar onMount, onDestroy de svelte
 Importar funciones de socket desde lib/socket
 Importar explanationStore
 Importar authStore
 Crear variables: connected, sessionId, error, socket
 En onMount:

 Obtener usuario de authStore
 Si no hay usuario, mostrar error
 Obtener token JWT de Supabase session
 Si no hay token, mostrar error
 Llamar connectSocket(token)
 Registrar listener onConnectionEstablished
 Actualizar variables cuando se recibe conexión


 En onDestroy:

 Llamar disconnectSocket()
 Llamar explanationStore.reset()


 HTML muestra estado de conexión
 HTML muestra session_id cuando conectado
 Navegar a http://localhost:5173/test-socket (estando autenticado)
 Verificar en consola navegador: "✅ Conectado al backend"
 Verificar objeto con datos de connection_established
 No hay errores rojos en consola navegador
 Verificar en consola backend: log de nueva conexión
 Verificar en backend: muestra user_id conectado
 Verificar en backend: muestra session_id generado
 (Opcional) Verificar en Redis: docker exec -it guiaipn-redis redis-cli
 (Opcional) Ejecutar: KEYS "session:*" debe mostrar session key
 Salir de la página test-socket
 Verificar desconexión en consola navegador
 Verificar desconexión detectada en backend


🎨 SPRINT 2: CREAR RUTA Y ESTRUCTURA DE COMPONENTES
2.1 Crear Ruta del Salón de Clase

 Crear carpeta src/routes/examen/salon/
 Crear archivo src/routes/examen/salon/+page.svelte
 Importar onMount, onDestroy de svelte
 Importar goto de $app/navigation
 Importar page de $app/stores
 Importar authStore
 Importar explanationStore
 Importar todas las funciones de socket necesarias
 Importar supabase client
 Definir variables de estado:

 socket: null
 teacherState: 'idle'
 currentQuestionData: null
 showFeedbackModal: false
 isInitialized: false
 errorMessage: ''


 Definir variables reactivas derivadas del store
 Implementar función initializeClassroom() que:

 Verifica autenticación
 Si no auth, guarda URL y redirige a login
 Obtiene question_id de query params
 Si no hay question_id, busca en localStorage
 Si no encuentra, muestra error y redirige
 Busca datos de pregunta (localStorage o Supabase)
 Guarda datos en currentQuestionData
 Obtiene token JWT de Supabase
 Conecta socket con connectSocket(token)
 Llama setupEventListeners()
 Setea isInitialized: true


 Implementar función setupEventListeners() que registra:

 onConnectionEstablished - actualiza store y emite pregunta
 onExplanationStart - inicializa explicación
 onStepStart - actualiza paso y cambia teacherState
 onContentChunk - agrega chunk al store
 onCanvasCommand - agrega comando y cambia teacherState
 onStepComplete - completa paso y resetea teacherState
 onExplanationComplete - finaliza y muestra modal feedback
 onWaitingPhrase - cambia teacherState a 'thinking'
 onError - maneja errores y notifica usuario


 En onMount:

 Llamar initializeClassroom()
 Agregar listener beforeunload para desconectar


 En onDestroy:

 Desconectar socket
 Resetear explanationStore
 Limpiar timers activos


 Crear estructura HTML con:

 Header superior con navegación
 Grid/flex de 2 columnas (pizarrón + panel)
 Área para Blackboard component
 Área para TeacherCharacter component
 Área para ExplanationPanel component
 Modal de feedback (condicional)
 Loading overlay (condicional)
 Error overlay (condicional)


 Agregar clases Tailwind para:

 Layout responsivo
 Gradientes de fondo
 Transiciones suaves


 Agregar estilos específicos en <style>:

 Animaciones de entrada
 Media queries responsive
 Z-indexes apropiados


 Verificar que la página se renderiza sin errores
 Verificar que query params se leen correctamente
 Verificar redirecciones funcionan

2.2 Crear Carpeta de Componentes

 Crear carpeta src/routes/examen/salon/componentes/
 Verificar que la carpeta existe

2.3 Crear Componente Blackboard

 Crear archivo src/routes/examen/salon/componentes/Blackboard.svelte
 Importar onMount de svelte
 Importar tick de svelte
 Definir props:

 steps (readonly)
 currentStep (readonly)
 isStreaming (readonly)


 Definir variables internas:

 canvas (bind:this)
 ctx: null (contexto 2D)
 canvasWidth: 800
 canvasHeight: 600
 scale: 1 (para responsive)


 Implementar función initCanvas() que:

 Obtiene contexto 2D del canvas
 Configura dimensiones responsive
 Calcula scale basado en container
 Setea estilos del contexto (color, grosor, fuente)
 Limpia el canvas inicial


 Implementar función clearCanvas() que:

 Limpia todo el canvas
 Dibuja fondo de pizarra (color oscuro/textura)


 Implementar función executeCommand(cmd) que:

 Lee cmd.type
 Switch-case para cada tipo:

 'line' → llama drawLine()
 'rectangle' → llama drawRectangle()
 'circle' → llama drawCircle()
 'text' → llama drawText()
 'clear' → llama clearCanvas()




 Implementar drawLine(ctx, x1, y1, x2, y2, color, lineWidth)
 Implementar drawRectangle(ctx, x, y, width, height, color, fill)
 Implementar drawCircle(ctx, x, y, radius, color, fill)
 Implementar drawText(ctx, text, x, y, fontSize, color, align)
 Implementar animación progresiva en drawLineAnimated()
 Crear watcher reactivo $: que detecta nuevos comandos:

 Observa steps y currentStep
 Cuando hay nuevo paso, ejecuta sus comandos


 En onMount:

 Llamar initCanvas()
 Agregar listener de resize para ajustar canvas


 Crear HTML con:

 Container div responsive
 Canvas element con bind:this
 Width y height del canvas


 Agregar estilos Tailwind:

 Fondo de pizarra
 Border/shadow
 Responsive


 Verificar que canvas se renderiza correctamente
 Verificar que tiene aspecto de pizarra

2.4 Crear Componente TeacherCharacter

 Crear archivo src/routes/examen/salon/componentes/TeacherCharacter.svelte
 Definir props:

 state (string: idle, explaining, writing, thinking)
 position (objeto con x, y - opcional)


 Definir constantes con rutas de GIFs:

 IDLE_GIF
 EXPLAINING_GIF
 WRITING_GIF
 THINKING_GIF


 Crear variable reactiva $: gifSrc que:

 Switch basado en prop state
 Retorna la ruta del GIF correspondiente


 Implementar transiciones suaves entre estados
 Crear HTML con:

 Container div posicionado absolute
 Imagen del profesor con src reactivo
 Alt text apropiado


 Agregar estilos:

 Posicionamiento absoluto
 Tamaño del personaje (width/height)
 Transiciones fade entre GIFs
 Z-index apropiado


 Verificar que el personaje se renderiza
 Verificar transiciones entre estados

2.5 Crear Componente ExplanationPanel

 Crear archivo src/routes/examen/salon/componentes/ExplanationPanel.svelte
 Definir props:

 isPaused (boolean)
 isStreaming (boolean)
 currentStep (number)
 totalSteps (number)
 steps (array)


 Definir eventos dispatch:

 pause
 resume
 askQuestion


 Definir variables:

 questionInput: ''
 showStepsList: false


 Implementar función handlePause() que:

 Obtiene posición actual
 Dispatch evento 'pause' con posición


 Implementar función handleResume() que:

 Dispatch evento 'resume'


 Implementar función handleAskQuestion() que:

 Valida que questionInput no esté vacío
 Dispatch evento 'askQuestion' con texto
 Limpia input


 Crear HTML con secciones:

 Header con título "Panel de Control"
 Sección de progreso:

 Barra de progreso visual
 Texto "Paso X de Y"


 Lista de pasos completados:

 Cada paso con ícono checkmark si completo
 Paso actual destacado


 Input para preguntas:

 Textarea para escribir
 Botón enviar
 Contador de caracteres


 Controles de reproducción:

 Botón Pausar (visible si isStreaming y !isPaused)
 Botón Resumir (visible si isPaused)
 Estados disabled apropiados




 Agregar estilos Tailwind:

 Layout vertical con spacing
 Fondo semi-transparente
 Bordes y sombras
 Botones con hover states


 Verificar que el panel se renderiza
 Verificar que botones funcionan

2.6 Crear Componente TypewriterText (Opcional pero Recomendado)

 Crear archivo src/routes/examen/salon/componentes/TypewriterText.svelte
 Definir props:

 text (string completo a mostrar)
 speed (ms por carácter, default 50)
 isPaused (boolean)


 Definir variables:

 displayedText: ''
 currentIndex: 0
 intervalId: null


 Implementar función startTyping() que:

 Crea interval que agrega caracteres
 Incrementa currentIndex
 Actualiza displayedText
 Se detiene al terminar el texto


 Implementar función pauseTyping() que:

 Limpia el interval
 Guarda posición actual


 Implementar función resumeTyping() que:

 Reinicia interval desde posición guardada


 Crear watchers reactivos:

 Cuando text cambia, resetear y empezar
 Cuando isPaused cambia, pausar o resumir


 En onMount:

 Iniciar typing si hay texto


 En onDestroy:

 Limpiar interval


 Crear HTML simple:

 Span o div mostrando displayedText
 Cursor parpadeante (opcional)


 Agregar estilos:

 Fuente apropiada
 Animación de cursor


 Verificar efecto typewriter funciona
 Verificar pausar/resumir funciona

2.7 Integrar Componentes en Página Principal

 En salon/+page.svelte, importar:

 Blackboard
 TeacherCharacter
 ExplanationPanel
 TypewriterText (si lo creaste)


 Agregar <Blackboard> con props:

 steps={$explanationStore.steps}
 currentStep={$explanationStore.currentStep}
 isStreaming={$explanationStore.isStreaming}


 Agregar <TeacherCharacter> con props:

 state={teacherState}


 Agregar <ExplanationPanel> con props:

 isPaused={$explanationStore.isPaused}
 isStreaming={$explanationStore.isStreaming}
 currentStep={$explanationStore.currentStep}
 totalSteps={$explanationStore.totalSteps}
 steps={$explanationStore.steps}


 Agregar event handlers para ExplanationPanel:

 on:pause={handlePause}
 on:resume={handleResume}
 on:askQuestion={handleAskQuestion}


 Implementar handlePause() en página:

 Llamar emitPauseExplanation()


 Implementar handleResume() en página:

 Llamar emitResumeExplanation()


 Implementar handleAskQuestion(event) en página:

 Pausar explicación actual
 Llamar emitAskFollowUp(event.detail.question)


 Verificar que todos los componentes se renderizan juntos
 Verificar layout responsive funciona


🔗 SPRINT 3: NAVEGACIÓN DESDE EXAMEN EXISTENTE
3.1 Modificar Examen Actual

 Abrir archivo src/routes/examen/+page.svelte
 Localizar función navigateToExplanation(resp, resCorrect)
 Comentar código antiguo que redirige a GenerationIAResponse
 Crear objeto questionData con:

 id del reactivo
 pregunta del reactivo
 opciones del reactivo
 respuestaCorrecta del reactivo
 respuestaUsuario (resp recibida)
 materia de la pregunta
 lengMathPregunta (boolean)
 lengMathOpciones (boolean)


 Guardar questionData en localStorage:

 Key: 'current_question_data'
 Value: JSON.stringify(questionData)


 Cambiar navegación a:

 goto('/examen/salon?question=' + questionData.id)


 Verificar que animaciones de salida siguen funcionando
 Guardar cambios

3.2 Probar Flujo Completo de Navegación

 Iniciar en /examen
 Responder una pregunta incorrectamente
 Verificar que redirige a /examen/salon
 Verificar que question_id está en URL
 Verificar que datos se guardaron en localStorage
 Verificar que página salon carga correctamente


🎬 SPRINT 4: IMPLEMENTAR STREAMING COMPLETO
4.1 Integrar Listeners en Página Salon

 En salon/+page.svelte, dentro de setupEventListeners():
 Configurar onConnectionEstablished:

 Console.log datos recibidos
 Llamar explanationStore.setSessionId()
 Llamar explanationStore.setConnected(true)
 Preparar datos de pregunta desde currentQuestionData
 Llamar emitAskQuestion(questionData, context)


 Configurar onWaitingPhrase:

 Actualizar teacherState a 'thinking'
 Mostrar mensaje en UI (opcional)
 Console.log frase recibida


 Configurar onExplanationStart:

 Console.log "Iniciando explicación"
 Extraer total_steps, estimated_duration
 Llamar explanationStore.initExplanation()
 Actualizar teacherState a 'explaining'


 Configurar onStepStart:

 Console.log "Nuevo paso: " + step_number
 Extraer datos del paso
 Llamar explanationStore.startStep(stepData)
 Actualizar teacherState a 'explaining'
 Limpiar canvas si es paso nuevo


 Configurar onContentChunk:

 Extraer chunk, position, is_final
 Llamar explanationStore.addChunk()
 No console.log (sería spam)


 Configurar onCanvasCommand:

 Console.log "Comando canvas: " + command.type
 Llamar explanationStore.addCanvasCommand()
 Actualizar teacherState a 'writing'
 Después de 2 segundos, volver teacherState a 'explaining'


 Configurar onStepComplete:

 Console.log "Paso completado: " + step_number
 Llamar explanationStore.completeStep()
 Actualizar teacherState a 'idle'
 Pequeña pausa antes de siguiente paso (opcional)


 Configurar onExplanationComplete:

 Console.log "Explicación completa"
 Llamar explanationStore.finishExplanation()
 Esperar 1 segundo
 Setear showFeedbackModal = true


 Configurar onError:

 Console.error el error
 Extraer code y message
 Llamar explanationStore.setError(message)
 Mostrar notificación al usuario
 Si es error crítico, considerar desconectar



4.2 Conectar Store con UI

 Crear watchers reactivos $: en salon/+page.svelte:
 Watcher para $explanationStore.isStreaming:

 Si true, mostrar indicador de streaming
 Si false, ocultar indicador


 Watcher para $explanationStore.isPaused:

 Si true, pausar typewriter
 Si false, reanudar typewriter


 Watcher para $explanationStore.error:

 Si no es null, mostrar toast/notificación
 Opción de cerrar error


 Watcher para $explanationStore.steps:

 Actualizar UI cuando cambia
 Scroll automático al paso actual



4.3 Implementar Renderizado de Pasos

 En HTML de salon/+page.svelte:
 Crear sección de contenido textual
 Usar #each para iterar sobre steps
 Para cada paso:

 Mostrar número de paso
 Mostrar título del paso
 Si el paso está completo:

 Mostrar todo el content de una vez


 Si es el paso actual:

 Usar TypewriterText con chunks acumulados
 Renderizar con efecto typing


 Si es paso futuro:

 Mostrar placeholder o nada




 Agregar clases CSS para:

 Destacar paso actual
 Opacidad para pasos completados
 Animaciones de transición



4.4 Probar Streaming End-to-End

 Asegurar backend está corriendo
 Asegurar Redis está corriendo
 Navegar a /examen/salon con una pregunta
 Verificar que socket conecta
 Verificar en consola: "Conectado al backend"
 Verificar que emite ask_question automáticamente
 Verificar en backend: logs de pregunta recibida
 Observar que aparece "waiting_phrase"
 Observar inicio de explanation_start
 Observar steps comenzando uno por uno
 Observar chunks llegando y renderizándose
 Verificar efecto typewriter funciona
 Observar comandos de canvas ejecutándose
 Verificar que profesor cambia de estado (explaining/writing)
 Observar completion de cada paso
 Observar explanation_complete al final
 Verificar que aparece modal de feedback


🖌️ SPRINT 5: SISTEMA DE CANVAS COMPLETO
5.1 Implementar Parser de Comandos Detallado

 En Blackboard.svelte, función executeCommand():
 Verificar que ctx existe antes de dibujar
 Para comando line:

 Extraer x1, y1, x2, y2, color, lineWidth
 Normalizar coordenadas (multiplicar por scale)
 Llamar drawLine() o drawLineAnimated()


 Para comando rectangle:

 Extraer x, y, width, height, color, fill
 Normalizar coordenadas
 Llamar drawRectangle()


 Para comando circle:

 Extraer x, y, radius, color, fill
 Normalizar coordenadas
 Llamar drawCircle()


 Para comando text:

 Extraer text, x, y, fontSize, color, align
 Normalizar coordenadas
 Llamar drawText()


 Para comando arrow:

 Extraer start, end, color
 Llamar drawArrow()


 Para comando clear:

 Llamar clearCanvas()



5.2 Implementar Funciones de Dibujo

 Implementar drawLine(ctx, x1, y1, x2, y2, color, lineWidth):

 ctx.beginPath()
 ctx.moveTo(x1, y1)
 ctx.lineTo(x2, y2)
 ctx.strokeStyle = color
 ctx.lineWidth = lineWidth
 ctx.stroke()


 Implementar drawRectangle(ctx, x, y, width, height, color, fill):

 Si fill es true:

 ctx.fillStyle = color
 ctx.fillRect(x, y, width, height)


 Si no:

 ctx.strokeStyle = color
 ctx.strokeRect(x, y, width, height)




 Implementar drawCircle(ctx, x, y, radius, color, fill):
ReintentarIContinuar  - [ ] `ctx.beginPath()`
  - [ ] `ctx.arc(x, y, radius, 0, Math.PI * 2)`
  - [ ] Si fill es true:
    - [ ] `ctx.fillStyle = color`
    - [ ] `ctx.fill()`
  - [ ] Si no:
    - [ ] `ctx.strokeStyle = color`
    - [ ] `ctx.stroke()`
- [ ] Implementar `drawText(ctx, text, x, y, fontSize, color, align)`:
  - [ ] `ctx.font = fontSize + 'px Arial'`
  - [ ] `ctx.fillStyle = color`
  - [ ] `ctx.textAlign = align`
  - [ ] `ctx.fillText(text, x, y)`
- [ ] Implementar `drawArrow(ctx, x1, y1, x2, y2, color)`:
  - [ ] Dibujar línea principal
  - [ ] Calcular ángulo de la flecha
  - [ ] Dibujar cabeza de flecha (triángulo)

### 5.3 Implementar Animaciones Progresivas
- [ ] Implementar `drawLineAnimated(ctx, x1, y1, x2, y2, color, duration)`:
  - [ ] Crear variable `progress = 0`
  - [ ] Guardar `startTime = Date.now()`
  - [ ] Crear función `animate()` que:
    - [ ] Calcula progress basado en tiempo transcurrido
    - [ ] Si progress < 1:
      - [ ] Calcula currentX y currentY interpolados
      - [ ] Dibuja línea desde inicio hasta posición actual
      - [ ] Llama `requestAnimationFrame(animate)`
    - [ ] Si progress >= 1:
      - [ ] Dibuja línea completa
  - [ ] Llamar `animate()` inicial
- [ ] Configurar que comandos importantes usen versión animada
- [ ] Verificar que animaciones son fluidas (60fps)

### 5.4 Sistema de Coordenadas Normalizado
- [ ] Crear función `normalizeCoords(x, y)`:
  - [ ] Multiplica por scale factor
  - [ ] Ajusta por offset si hay scroll
  - [ ] Retorna { x: newX, y: newY }
- [ ] Aplicar normalización en todas las funciones de dibujo
- [ ] Probar que dibujos se ven igual en diferentes tamaños

### 5.5 Watcher de Comandos en Tiempo Real
- [ ] En `Blackboard.svelte`, crear watcher reactivo:
```
  $: if (steps[currentStep]?.canvasCommands) {
    // Ejecutar comandos del paso actual
  }
```
- [ ] Implementar lógica que:
  - [ ] Detecta cuando currentStep cambia
  - [ ] Limpia canvas si es paso nuevo
  - [ ] Ejecuta comandos uno por uno con delay
  - [ ] Espera animaciones antes de siguiente comando
- [ ] Agregar variable `commandIndex` para tracking
- [ ] Implementar `executeNextCommand()` recursiva

### 5.6 Probar Comandos de Canvas
- [ ] Crear datos de prueba con comandos variados
- [ ] Probar comando `line`:
  - [ ] Líneas horizontales, verticales, diagonales
  - [ ] Diferentes colores y grosores
- [ ] Probar comando `rectangle`:
  - [ ] Con y sin fill
  - [ ] Diferentes tamaños y posiciones
- [ ] Probar comando `circle`:
  - [ ] Con y sin fill
  - [ ] Diferentes radios
- [ ] Probar comando `text`:
  - [ ] Diferentes tamaños de fuente
  - [ ] Diferentes alineaciones
  - [ ] Caracteres especiales y números
- [ ] Probar secuencia de comandos compleja
- [ ] Verificar que animaciones son suaves
- [ ] Verificar que no hay lag en el rendering

---

## ⏯️ SPRINT 6: CONTROLES DE REPRODUCCIÓN

### 6.1 Implementar Lógica de Pausa
- [ ] En `salon/+page.svelte`, función `handlePause()`:
  - [ ] Obtener paso actual de store
  - [ ] Obtener posición actual en caracteres del typewriter
  - [ ] Crear objeto position con:
    - [ ] `current_step: currentStep`
    - [ ] `position_in_step: charPosition`
  - [ ] Llamar `emitPauseExplanation(position)`
  - [ ] Actualizar `explanationStore.setPaused(true, position)`
- [ ] Agregar lógica para pausar:
  - [ ] Typewriter (detener interval)
  - [ ] Animaciones de canvas en progreso
  - [ ] Cualquier timer activo
- [ ] Actualizar UI para mostrar estado pausado:
  - [ ] Cambiar botón a "Resumir"
  - [ ] Mostrar indicador "⏸️ Pausado"
  - [ ] Permitir interacción con controles

### 6.2 Implementar Lógica de Reanudación
- [ ] En `salon/+page.svelte`, función `handleResume()`:
  - [ ] Llamar `emitResumeExplanation()`
  - [ ] Obtener posición guardada del store
  - [ ] Actualizar `explanationStore.setPaused(false)`
- [ ] Agregar lógica para resumir:
  - [ ] Reanudar typewriter desde posición guardada
  - [ ] Reanudar animaciones de canvas
  - [ ] Restaurar cualquier estado interrumpido
- [ ] Actualizar UI:
  - [ ] Cambiar botón a "Pausar"
  - [ ] Ocultar indicador de pausado
  - [ ] Continuar animaciones suavemente

### 6.3 Integrar Controles en ExplanationPanel
- [ ] En `ExplanationPanel.svelte`:
- [ ] Sección de controles con:
  - [ ] Botón "⏸️ Pausar" visible cuando:
    - [ ] `isStreaming === true`
    - [ ] `isPaused === false`
  - [ ] Botón "▶️ Resumir" visible cuando:
    - [ ] `isPaused === true`
  - [ ] Botón "⏹️ Detener" (opcional):
    - [ ] Permite cancelar explicación completa
    - [ ] Muestra confirmación antes
- [ ] Event handlers:
  - [ ] Click en Pausar → dispatch('pause')
  - [ ] Click en Resumir → dispatch('resume')
  - [ ] Click en Detener → dispatch('stop')
- [ ] Estados disabled:
  - [ ] Deshabilitar controles si no hay conexión
  - [ ] Deshabilitar si hay error

### 6.4 Sincronizar Pausa con Typewriter
- [ ] En `TypewriterText.svelte`:
- [ ] Agregar watcher para prop `isPaused`:
```
  $: if (isPaused) {
    pauseTyping();
  } else {
    resumeTyping();
  }
```
- [ ] En función `pauseTyping()`:
  - [ ] Limpiar interval actual
  - [ ] Guardar `currentIndex` en variable
  - [ ] No resetear displayedText
- [ ] En función `resumeTyping()`:
  - [ ] Crear nuevo interval
  - [ ] Continuar desde `currentIndex` guardado
  - [ ] Mantener mismo speed
- [ ] Verificar transiciones suaves al pausar/resumir

### 6.5 Probar Controles de Reproducción
- [ ] Iniciar una explicación normal
- [ ] Pausar a mitad del paso 2
- [ ] Verificar que:
  - [ ] Typewriter se detiene inmediatamente
  - [ ] Animaciones de canvas se pausan
  - [ ] Botón cambia a "Resumir"
  - [ ] Backend recibe evento pause_explanation
- [ ] Resumir explicación
- [ ] Verificar que:
  - [ ] Continúa exactamente desde donde pausó
  - [ ] Typewriter reanuda sin saltos
  - [ ] Animaciones continúan
  - [ ] Backend recibe evento resume_explanation
- [ ] Pausar nuevamente en paso diferente
- [ ] Repetir ciclo varias veces
- [ ] Verificar que no hay memory leaks (timers sin limpiar)

---

## 💬 SPRINT 7: PREGUNTAS DURANTE EXPLICACIÓN

### 7.1 Implementar Input de Preguntas
- [ ] En `ExplanationPanel.svelte`:
- [ ] Crear sección "Hacer Pregunta":
  - [ ] Textarea para escribir pregunta
  - [ ] Placeholder: "¿Algo no quedó claro? Pregunta aquí..."
  - [ ] Bind a variable `questionInput`
  - [ ] Contador de caracteres (min 5, max 500)
- [ ] Botón "💬 Preguntar":
  - [ ] Disabled si questionInput < 5 caracteres
  - [ ] Disabled si no hay streaming activo
  - [ ] Click → dispatch('askQuestion', { question })
- [ ] Estilos:
  - [ ] Textarea con borde y padding
  - [ ] Auto-resize basado en contenido
  - [ ] Focus state claro
- [ ] Validaciones:
  - [ ] Mínimo 5 caracteres
  - [ ] Máximo 500 caracteres
  - [ ] Trim whitespace

### 7.2 Lógica de Interrupción
- [ ] En `salon/+page.svelte`, función `handleAskQuestion(event)`:
  - [ ] Extraer question de event.detail
  - [ ] Guardar estado actual de explicación:
    - [ ] Paso actual
    - [ ] Posición en paso
    - [ ] Contexto de la explicación
  - [ ] Pausar explicación automáticamente:
    - [ ] Llamar `emitPauseExplanation()`
    - [ ] Actualizar store
  - [ ] Enviar pregunta al backend:
    - [ ] Preparar contexto con:
      - [ ] Pregunta original
      - [ ] Paso actual donde preguntó
      - [ ] Fragmento de explicación relevante
    - [ ] Llamar `emitAskFollowUp(question, context)`
  - [ ] Actualizar UI:
    - [ ] Mostrar indicador "Procesando pregunta..."
    - [ ] Cambiar teacherState a 'thinking'
- [ ] Limpiar input después de enviar

### 7.3 Recibir Aclaración del Backend
- [ ] Agregar listener `onFollowUpResponse` en setupEventListeners:
  - [ ] Recibe mini-explicación
  - [ ] Muestra en modal o sección especial
  - [ ] No interrumpe flujo principal
- [ ] Crear componente `FollowUpModal.svelte`:
  - [ ] Muestra pregunta del usuario
  - [ ] Muestra respuesta de IA
  - [ ] Botones de acción:
    - [ ] "Entendido, continuar" → resume explicación
    - [ ] "Hacer otra pregunta" → permite nueva pregunta
    - [ ] "No quedó claro" → repite aclaración diferente
- [ ] Integrar modal en salon/+page.svelte

### 7.4 Continuar Después de Aclaración
- [ ] Implementar lógica para continuar:
  - [ ] Si usuario dice "continuar":
    - [ ] Cerrar modal de follow-up
    - [ ] Llamar `emitResumeExplanation()`
    - [ ] Restaurar estado guardado
    - [ ] Continuar desde donde se pausó
  - [ ] Si usuario hace otra pregunta:
    - [ ] Mantener pausa
    - [ ] Procesar nueva pregunta
    - [ ] Esperar respuesta
- [ ] Guardar historial de follow-ups en store:
  - [ ] Array de { pregunta, respuesta, timestamp }
  - [ ] Mostrar en panel si usuario quiere revisar

### 7.5 Probar Flujo de Preguntas
- [ ] Iniciar explicación
- [ ] A mitad del paso 2, escribir pregunta:
  - [ ] "¿Por qué se usa esta fórmula?"
- [ ] Enviar pregunta
- [ ] Verificar que:
  - [ ] Explicación se pausa automáticamente
  - [ ] Pregunta se envía al backend
  - [ ] Backend responde con aclaración
  - [ ] Modal aparece con respuesta
- [ ] Click en "Continuar"
- [ ] Verificar que:
  - [ ] Explicación se reanuda correctamente
  - [ ] No hay saltos ni repeticiones
- [ ] Hacer segunda pregunta
- [ ] Verificar que historial se guarda

---

## 🎭 SPRINT 8: ANIMACIONES DEL PROFESOR

### 8.1 Preparar Assets de Animación
- [ ] Conseguir o crear GIFs para cada estado:
  - [ ] `teacher-idle.gif` - Profesor quieto, respirando
  - [ ] `teacher-explaining.gif` - Profesor hablando, gestos
  - [ ] `teacher-writing.gif` - Profesor escribiendo en pizarra
  - [ ] `teacher-thinking.gif` - Profesor pensativo, mano en mentón
- [ ] Guardar GIFs en carpeta `static/animations/`
- [ ] Optimizar tamaño de GIFs (máx 500KB cada uno)
- [ ] Verificar que GIFs son loops suaves

### 8.2 Configurar Estados del Profesor
- [ ] En `TeacherCharacter.svelte`:
- [ ] Definir constante `STATES`:
```javascript
  const STATES = {
    IDLE: 'idle',
    EXPLAINING: 'explaining',
    WRITING: 'writing',
    THINKING: 'thinking'
  }
```
- [ ] Definir mapeo de estados a GIFs:
```javascript
  const GIF_PATHS = {
    idle: '/animations/teacher-idle.gif',
    explaining: '/animations/teacher-explaining.gif',
    writing: '/animations/teacher-writing.gif',
    thinking: '/animations/teacher-thinking.gif'
  }
```
- [ ] Crear función `getGifForState(state)`:
  - [ ] Switch basado en state
  - [ ] Retorna path del GIF correspondiente
  - [ ] Default a 'idle' si state inválido

### 8.3 Implementar Transiciones Entre Estados
- [ ] Agregar prop `transitionDuration` (default 300ms)
- [ ] Crear variable reactiva para GIF actual:
```javascript
  $: currentGif = getGifForState(state)
```
- [ ] Implementar fade entre cambios de GIF:
  - [ ] Usar transition:fade de Svelte
  - [ ] Configurar duration según prop
- [ ] Agregar key reactiva para forzar re-render:
```svelte
  {#key state}
    <img src={currentGif} alt="Profesor" />
  {/key}
```
- [ ] Precargar todos los GIFs en onMount:
  - [ ] Crear Image objects para cada GIF
  - [ ] Setear src para forzar descarga
  - [ ] Evita lag en primera transición

### 8.4 Sincronizar con Eventos del Backend
- [ ] En `salon/+page.svelte`, actualizar teacherState:
- [ ] Cuando recibe `waiting_phrase`:
  - [ ] `teacherState = 'thinking'`
- [ ] Cuando recibe `explanation_start`:
  - [ ] `teacherState = 'explaining'`
- [ ] Cuando recibe `step_start`:
  - [ ] `teacherState = 'explaining'`
- [ ] Cuando recibe `content_chunk`:
  - [ ] Mantener `teacherState = 'explaining'`
- [ ] Cuando recibe `canvas_command`:
  - [ ] `teacherState = 'writing'`
  - [ ] Crear timeout para volver a 'explaining' después de 2s:
```javascript
    setTimeout(() => {
      if (teacherState === 'writing') {
        teacherState = 'explaining'
      }
    }, 2000)
```
- [ ] Cuando recibe `step_complete`:
  - [ ] `teacherState = 'idle'`
- [ ] Cuando recibe `explanation_complete`:
  - [ ] `teacherState = 'idle'`
- [ ] Cuando usuario pregunta:
  - [ ] `teacherState = 'thinking'`

### 8.5 Posicionamiento Dinámico del Profesor
- [ ] En `TeacherCharacter.svelte`:
- [ ] Agregar prop `position` (opcional):
  - [ ] Default: esquina inferior derecha
  - [ ] Puede ser objeto { x, y, anchor }
- [ ] Implementar lógica de posicionamiento:
  - [ ] Si no hay position prop, usar default
  - [ ] Si hay position, aplicar coordenadas custom
- [ ] Agregar animaciones de movimiento (opcional):
  - [ ] Profesor puede "caminar" a diferentes posiciones
  - [ ] Smooth transition al cambiar posición
- [ ] Ajustar z-index para que siempre esté visible
- [ ] Responsive: ajustar tamaño en móvil

### 8.6 Efectos Adicionales (Opcional)
- [ ] Agregar sombra al profesor para profundidad
- [ ] Efecto de "apuntar" al pizarrón cuando escribe:
  - [ ] Rotar ligeramente hacia canvas
  - [ ] Agregar brazo extendido (si el GIF lo permite)
- [ ] Speech bubble cuando habla (opcional):
  - [ ] Globo de diálogo con snippet del texto
  - [ ] Solo mostrar en momentos clave
- [ ] Partículas o brillos cuando completa paso (opcional)

### 8.7 Probar Animaciones del Profesor
- [ ] Iniciar explicación
- [ ] Observar que profesor inicia en 'idle'
- [ ] Observar cambio a 'thinking' durante waiting_phrase
- [ ] Observar cambio a 'explaining' al iniciar explicación
- [ ] Observar cambio a 'writing' cuando hay canvas command
- [ ] Verificar que vuelve a 'explaining' después de escribir
- [ ] Observar cambio a 'idle' al completar paso
- [ ] Hacer una pregunta y observar cambio a 'thinking'
- [ ] Verificar transiciones suaves sin parpadeos
- [ ] Verificar en diferentes tamaños de pantalla

---

## 🎨 SPRINT 9: FEEDBACK Y CIERRE

### 9.1 Crear Modal de Feedback
- [ ] Crear archivo `src/routes/examen/salon/componentes/ModalFeedback.svelte`
- [ ] Definir props:
  - [ ] `show` (boolean)
  - [ ] `totalSteps` (number)
  - [ ] `totalDuration` (number)
  - [ ] `questionId` (string)
- [ ] Definir eventos dispatch:
  - [ ] `close`
  - [ ] `rate`
  - [ ] `backToExam`
  - [ ] `anotherQuestion`
- [ ] Variables internas:
  - [ ] `rating: 0` (1-5 estrellas)
  - [ ] `understood: null` (true/false)
  - [ ] `comment: ''`
  - [ ] `isSubmitting: false`

### 9.2 Estructura del Modal
- [ ] HTML con estructura:
  - [ ] Overlay oscuro de fondo (click para cerrar)
  - [ ] Container del modal centrado
  - [ ] Header:
    - [ ] Título: "¿Te ayudó la explicación?"
    - [ ] Botón X para cerrar
  - [ ] Body:
    - [ ] Sección de rating (estrellas 1-5):
      - [ ] Botones de estrellas interactivos
      - [ ] Highlight en hover
      - [ ] Selección persistente
    - [ ] Pregunta: "¿Quedó claro el tema?"
      - [ ] Botón "👍 Sí"
      - [ ] Botón "👎 No"
    - [ ] Textarea opcional para comentarios:
      - [ ] Placeholder: "Comparte tu experiencia..."
      - [ ] Max 500 caracteres
    - [ ] Resumen de la sesión:
      - [ ] "Completaste X pasos en Y minutos"
      - [ ] Tiempo promedio por paso
  - [ ] Footer con acciones:
    - [ ] Botón "Volver al examen"
    - [ ] Botón "Resolver otra pregunta"
    - [ ] Botón secundario "Saltar" (si no quiere rating)
- [ ] Estilos Tailwind:
  - [ ] Modal con backdrop blur
  - [ ] Animación de entrada (scale + fade)
  - [ ] Botones con estados hover/active
  - [ ] Responsive en móvil

### 9.3 Lógica de Rating
- [ ] Función `handleStarClick(star)`:
  - [ ] Actualiza variable `rating` con número de estrellas
  - [ ] Marca visualmente estrellas seleccionadas
  - [ ] Todas las estrellas <= rating en amarillo
- [ ] Función `handleUnderstoodClick(value)`:
  - [ ] Actualiza variable `understood` con boolean
  - [ ] Marca visualmente botón seleccionado
- [ ] Validación:
  - [ ] Rating debe ser >= 1 para enviar
  - [ ] Understood puede ser null
  - [ ] Comment es opcional

### 9.4 Enviar Feedback a Backend/Database
- [ ] Función `handleSubmitFeedback()`:
  - [ ] Validar que rating existe
  - [ ] Setear `isSubmitting = true`
  - [ ] Crear objeto feedback:
```javascript
    {
      user_id: $authStore.user.id,
      question_id: questionId,
      rating: rating,
      understood: understood,
      comment: comment,
      total_steps: totalSteps,
      total_duration: totalDuration,
      timestamp: new Date().toISOString()
    }
```
  - [ ] Guardar en Supabase tabla `interactions`:
    - [ ] INSERT con datos del feedback
    - [ ] Manejo de errores
  - [ ] Si success:
    - [ ] Dispatch evento 'rate' con datos
    - [ ] Mostrar toast "¡Gracias por tu feedback!"
    - [ ] Cerrar modal después de 1s
  - [ ] Si error:
    - [ ] Mostrar error
    - [ ] Permitir reintentar
  - [ ] Setear `isSubmitting = false`

### 9.5 Acciones Posteriores al Feedback
- [ ] Función `handleBackToExam()`:
  - [ ] Cerrar modal
  - [ ] Limpiar estado del store
  - [ ] Desconectar socket
  - [ ] Navegar a `/examen` con goto()
- [ ] Función `handleAnotherQuestion()`:
  - [ ] Cerrar modal
  - [ ] Resetear store pero mantener sesión
  - [ ] Mostrar selector de preguntas o:
  - [ ] Navegar a `/examen` y auto-iniciar siguiente pregunta
- [ ] Función `handleSkipFeedback()`:
  - [ ] Cerrar modal sin guardar
  - [ ] Ir directo a backToExam()

### 9.6 Integrar Modal en Página Salon
- [ ] En `salon/+page.svelte`:
- [ ] Importar `ModalFeedback`
- [ ] Renderizar condicionalmente:
```svelte
  {#if showFeedbackModal}
    <ModalFeedback
      show={showFeedbackModal}
      totalSteps={$explanationStore.totalSteps}
      totalDuration={$explanationStore.actualDuration}
      questionId={currentQuestionData?.id}
      on:close={() => showFeedbackModal = false}
      on:rate={handleRatingSubmitted}
      on:backToExam={handleBackToExam}
      on:anotherQuestion={handleAnotherQuestion}
    />
  {/if}
```
- [ ] Implementar handlers correspondientes
- [ ] Mostrar modal cuando `onExplanationComplete` se dispara

### 9.7 Probar Flujo de Feedback
- [ ] Completar una explicación hasta el final
- [ ] Verificar que modal aparece automáticamente
- [ ] Interactuar con rating de estrellas:
  - [ ] Click en cada estrella
  - [ ] Verificar highlight correcto
- [ ] Seleccionar "Sí quedó claro"
- [ ] Escribir comentario opcional
- [ ] Click en "Volver al examen"
- [ ] Verificar que:
  - [ ] Datos se guardan en Supabase
  - [ ] Modal se cierra
  - [ ] Redirige a /examen
  - [ ] Socket se desconecta
  - [ ] Store se limpia
- [ ] Repetir con "Otra pregunta"
- [ ] Repetir con "Saltar feedback"

---

## 🐛 SPRINT 10: MANEJO DE ERRORES Y EDGE CASES

### 10.1 Errores de Conexión Socket
- [ ] En `salon/+page.svelte`, agregar listener:
```javascript
  socket.on('disconnect', () => {
    // Handle disconnection
  })
```
- [ ] Función `handleDisconnect()`:
  - [ ] Actualizar `explanationStore.setConnected(false)`
  - [ ] Pausar streaming actual
  - [ ] Mostrar toast: "Conexión perdida, reconectando..."
  - [ ] Iniciar intentos de reconexión
  - [ ] Contador de intentos (máx 3)
- [ ] Función `attemptReconnect(retries = 3)`:
  - [ ] Si retries === 0:
    - [ ] Mostrar modal de error
    - [ ] Opciones: "Recargar página" o "Volver al examen"
    - [ ] Return
  - [ ] Esperar 2 segundos
  - [ ] Intentar conectar nuevamente:
    - [ ] Obtener token fresco
    - [ ] Llamar `connectSocket(token)`
  - [ ] Si falla, llamar recursivamente con retries - 1
  - [ ] Si success, reanudar desde estado guardado

### 10.2 Errores del Backend
- [ ] En `setupEventListeners()`, handler de `onError`:
- [ ] Extraer código de error
- [ ] Switch según error.code:
  - [ ] `RATE_LIMIT_EXCEEDED`:
    - [ ] Mostrar: "Demasiadas preguntas, espera X segundos"
    - [ ] Mostrar contador regresivo
    - [ ] Deshabilitar inputs temporalmente
  - [ ] `INSUFFICIENT_CREDITS`:
    - [ ] Mostrar: "Créditos insuficientes"
    - [ ] Botón "Ver planes" → goto('/cuenta')
    - [ ] Opción de cerrar y volver a examen
  - [ ] `AI_GENERATION_ERROR`:
    - [ ] Mostrar: "Error generando respuesta"
    - [ ] Botón "Reintentar"
    - [ ] Botón "Reportar problema"
  - [ ] `SESSION_NOT_FOUND`:
    - [ ] Mostrar: "Sesión expiró"
    - [ ] Reconectar automáticamente
    - [ ] Si falla, volver al examen
  - [ ] `AUTH_FAILED`:
    - [ ] Mostrar: "Error de autenticación"
    - [ ] Limpiar token
    - [ ] Redirigir a login
  - [ ] Default:
    - [ ] Mostrar: "Error inesperado"
    - [ ] Log error completo
    - [ ] Opción de reintentar o salir

### 10.3 Validaciones de Input
- [ ] En `ExplanationPanel.svelte`:
- [ ] Validar pregunta antes de enviar:
  - [ ] Longitud mínima 5 caracteres
  - [ ] Longitud máxima 500 caracteres
  - [ ] No solo espacios en blanco
  - [ ] No caracteres especiales peligrosos
- [ ] Mostrar mensajes de validación:
  - [ ] Texto rojo debajo del input
  - [ ] Contador de caracteres con color:
    - [ ] Rojo si < 5
    - [ ] Verde si 5-500
    - [ ] Rojo si > 500
- [ ] Deshabilitar botón enviar si no válido

### 10.4 Timeout de Respuestas
- [ ] Crear timeout para respuestas de IA:
  - [ ] Después de emitir pregunta, iniciar timer de 30s
  - [ ] Si no hay respuesta en 30s:
    - [ ] Mostrar: "La IA está tardando más de lo normal"
    - [ ] Opciones: "Seguir esperando" o "Cancelar"
  - [ ] Si timeout de 60s total:
    - [ ] Cancelar automáticamente
    - [ ] Mostrar error
    - [ ] Permitir reintentar
- [ ] Limpiar timeout cuando llega respuesta
- [ ] Limpiar timeout en onDestroy

### 10.5 Estado Inconsistente del Store
- [ ] Agregar validaciones en mutations del store:
  - [ ] Verificar que currentStep no exceda totalSteps
  - [ ] Verificar que steps array no tenga gaps
  - [ ] Verificar que índices son números válidos
- [ ] Función `validateStoreState()`:
  - [ ] Revisa consistencia del estado
  - [ ] Si encuentra inconsistencia:
    - [ ] Log warning
    - [ ] Intenta corregir automáticamente
    - [ ] Si no puede, resetea store
- [ ] Llamar en puntos críticos:
  - [ ] Después de cada mutación importante
  - [ ] Antes de renderizar UI
  - [ ] Al reanudar después de pausa

### 10.6 Manejo de Sesión Expirada
- [ ] Detectar cuando sesión de Redis expiró:
  - [ ] Backend envía error `SESSION_NOT_FOUND`
  - [ ] Frontend detecta en listener onError
- [ ] Opciones de recuperación:
  - [ ] Intentar crear nueva sesión automáticamente
  - [ ] Reenviar pregunta original
  - [ ] Continuar desde paso guardado en localStorage
- [ ] Si no se puede recuperar:
  - [ ] Mostrar modal explicativo
  - [ ] Opción de empezar de nuevo
  - [ ] Opción de volver al examen
- [ ] Prevención:
  - [ ] Implementar "keep-alive" cada 2 minutos
  - [ ] Renovar TTL con ping al backend
  - [ ] Solo si hay actividad del usuario

### 10.7 Probar Escenarios de Error
- [ ] Simular pérdida de conexión:
  - [ ] Detener backend a mitad de explicación
  - [ ] Verificar mensaje de reconexión
  - [ ] Reiniciar backend
  - [ ] Verificar que reconecta
- [ ] Simular timeout:
  - [ ] Agregar delay artificial en backend
  - [ ] Verificar que aparece mensaje de "tardando"ReintentarIContinuar[ ] Verificar opciones de cancelar/esperar

 Simular error de créditos:

 Modificar datos de usuario para 0 créditos
 Intentar hacer pregunta
 Verificar mensaje apropiado
 Verificar botón a planes funciona


 Simular rate limit:

 Hacer muchas preguntas rápidamente
 Verificar mensaje y contador
 Esperar y verificar que se desbloquea


 Simular sesión expirada:

 Limpiar Redis manualmente: redis-cli FLUSHALL
 Intentar interactuar
 Verificar manejo apropiado


 Simular error de autenticación:

 Invalidar token manualmente
 Intentar conectar
 Verificar redireccionamiento a login


 Probar input inválido:

 Pregunta de 2 caracteres
 Pregunta de 1000 caracteres
 Solo espacios en blanco
 Caracteres especiales raros


 Verificar que todos los errores:

 Tienen mensajes claros
 Ofrecen acción de recuperación
 No rompen la aplicación
 Se loguean apropiadamente




📱 SPRINT 11: RESPONSIVE Y MOBILE
11.1 Adaptar Layout para Móvil

 En salon/+page.svelte:
 Cambiar layout de grid a vertical en móvil:

 Breakpoint: md (768px)
 Desktop: grid-cols-2 (65/35)
 Móvil: grid-cols-1 (stack vertical)


 Orden de elementos en móvil:

 Header (sticky top)
 Pizarrón (scroll)
 Profesor (fixed bottom-right, más pequeño)
 Panel de control (sticky bottom o tabs)


 Agregar classes responsive:

svelte  <div class="
    grid grid-cols-1 md:grid-cols-[65%_35%]
    gap-4 md:gap-6
    p-2 md:p-6
  ">
11.2 Adaptar Blackboard para Móvil

 En Blackboard.svelte:
 Ajustar dimensiones del canvas:

 Desktop: 800x600
 Tablet: 600x450
 Móvil: 100% width, height auto


 Implementar touch events:

 Detectar si es dispositivo táctil
 Agregar soporte para gestos:

 Pinch to zoom (opcional)
 Pan para scroll




 Ajustar tamaños de fuente:

 Texto más grande en móvil
 Fórmulas con mejor legibilidad


 Crear función updateCanvasSize():

 Calcula dimensiones según viewport
 Ajusta scale factor
 Re-dibuja contenido actual


 Agregar listener de resize:

 Detecta cambio de orientación
 Detecta cambio de tamaño de ventana
 Llama updateCanvasSize() con debounce



11.3 Adaptar ExplanationPanel para Móvil

 En ExplanationPanel.svelte:
 Cambiar a tabs en móvil:

 Tab 1: "Progreso"
 Tab 2: "Controles"
 Tab 3: "Preguntar"


 Implementar tabs con estado:

 Variable activeTab
 Botones de navegación
 Mostrar solo contenido de tab activo


 Hacer panel sticky en bottom:

 Fixed position en móvil
 Z-index alto para estar sobre pizarrón
 Altura reducida (30-40% viewport)


 Agregar botón collapse/expand:

 Minimizar panel a solo barra de tabs
 Expandir para ver contenido completo
 Animación suave


 Ajustar tamaños de botones:

 Más grandes para touch (min 44x44px)
 Más padding
 Texto legible



11.4 Adaptar TeacherCharacter para Móvil

 En TeacherCharacter.svelte:
 Reducir tamaño en móvil:

 Desktop: 200px
 Tablet: 150px
 Móvil: 100px


 Reposicionar en móvil:

 Desktop: bottom-right de pizarrón
 Móvil: bottom-right de viewport (fixed)
 No obstruir contenido importante


 Hacer opcional en móvil:

 Botón para ocultar/mostrar profesor
 Guardar preferencia en localStorage
 Por default visible


 Optimizar GIFs:

 Cargar versiones de menor resolución en móvil
 Lazy load cuando sea posible



11.5 Adaptar Modal de Feedback para Móvil

 En ModalFeedback.svelte:
 Fullscreen en móvil:

 Ocupar 100% height en móvil
 Scroll interno si es necesario


 Ajustar tamaño de estrellas:

 Más grandes para touch
 Más espacio entre ellas


 Botones en layout vertical:

 Stack en móvil
 Horizontal en desktop
 Full-width en móvil


 Textarea más grande:

 Más altura visible
 Auto-resize al escribir



11.6 Touch Gestures y Accesibilidad Móvil

 Implementar gestures útiles:

 Swipe down para cerrar modal
 Swipe left/right entre pasos (opcional)
 Long press para opciones adicionales


 Feedback táctil:

 Vibración sutil en acciones importantes
 Usando Vibration API
 Solo si usuario lo permite


 Prevenir zoom accidental:

 user-scalable=no en viewport meta tag
 Solo en página del salón
 Permitir zoom en textos largos


 Optimizar para teclado virtual:

 Ajustar viewport cuando aparece teclado
 Scroll a input activo
 Prevenir que tape contenido importante



11.7 Orientación Landscape vs Portrait

 Detectar orientación actual
 Ajustar layout según orientación:

 Portrait: layout vertical clásico
 Landscape: layout horizontal aprovechando espacio


 Mensaje opcional:

 "Gira tu dispositivo para mejor experiencia"
 Solo en portrait si es muy estrecho
 Dismissible



11.8 Probar en Dispositivos Móviles

 Testing en Chrome DevTools:

 iPhone SE (375x667)
 iPhone 12 Pro (390x844)
 iPad (768x1024)
 Pixel 5 (393x851)
 Galaxy S20 (360x800)


 Probar en dispositivo real:

 iOS (iPhone)
 Android (Pixel/Samsung)
 Ambas orientaciones


 Verificar en cada dispositivo:

 Canvas se ve completo
 Texto es legible
 Botones son tocables fácilmente
 Animaciones son fluidas (60fps)
 No hay scroll horizontal
 Modal cubre correctamente
 Panel se colapsa/expande bien
 Profesor no obstruye
 Teclado no tapa inputs


 Testing de performance móvil:

 Lighthouse mobile score
 First Contentful Paint < 2s
 Time to Interactive < 4s
 No memory leaks
 Battery drain razonable




⚡ SPRINT 12: OPTIMIZACIONES Y PERFORMANCE
12.1 Optimizar Renders de Componentes

 En componentes grandes, usar memoización:

 Wrappear funciones costosas con $:
 Evitar cálculos en cada render
 Cachear resultados cuando sea posible


 En Blackboard.svelte:

 Memoizar cálculos de coordenadas
 Usar requestAnimationFrame para animaciones
 Batch multiple comandos de dibujo


 En TypewriterText.svelte:

 Optimizar interval (usar RAF si es posible)
 Evitar re-renders innecesarios del componente padre


 Lazy load de componentes pesados:

 Dynamic import de ModalFeedback
 Dynamic import de componentes no críticos
 Usar {#await} para mostrar loading



12.2 Optimizar Canvas Drawing

 Implementar double buffering:

 Canvas offscreen para preparar dibujos
 Copiar a canvas visible cuando está listo
 Evita flickering


 Batch operations:

 Agrupar múltiples comandos
 Ejecutar en una sola pasada
 Reducir llamadas a ctx


 Clear solo áreas necesarias:

 En vez de limpiar todo el canvas
 Limpiar solo región que cambió
 Usar clearRect() selectivamente


 Optimizar animaciones:

 Usar requestAnimationFrame
 Cancel RAF cuando componente se desmonta
 Throttle updates a 60fps máximo



12.3 Optimizar Socket.IO

 Configurar compresión:

 Habilitar compression en socket options
 Reduce tamaño de mensajes


 Throttle eventos frecuentes:

 No enviar cada keystroke del input
 Debounce a 500ms
 Solo enviar cuando usuario termina de escribir


 Cleanup listeners:

 Remover listeners en onDestroy
 Evita memory leaks
 Usar socket.off() apropiadamente


 Heartbeat optimizado:

 Reducir frecuencia si es posible
 Solo cuando hay actividad
 Usar mensaje mínimo



12.4 Optimizar Stores

 Evitar updates innecesarios:

 Comparar valor antes de setear
 No actualizar si es igual


 Derived stores para cálculos:

 Usar derived() para valores calculados
 Se cachean automáticamente
 Solo se recalculan cuando dependencias cambian


 Ejemplo en explanationStore:

javascript  export const progress = derived(
    explanationStore,
    $store => ($store.currentStep / $store.totalSteps) * 100
  );

 Batch updates cuando sea posible:

 Update múltiples propiedades en una sola mutación
 Reduce re-renders



12.5 Optimizar Assets

 Comprimir GIFs del profesor:

 Usar herramientas como gifsicle
 Target: < 200KB por GIF
 Mantener calidad aceptable


 Lazy load GIFs:

 No cargar todos al inicio
 Cargar solo el estado 'idle' inicial
 Precargar otros en background


 Implementar image sprites (opcional):

 Si usas imágenes estáticas
 Reduce HTTP requests


 Considerar formato WebP:

 Mejor compresión que GIF
 Soporte moderno de browsers
 Fallback a GIF si no soporta



12.6 Code Splitting

 Separar bundle por rutas:

 SvelteKit hace esto automático
 Verificar que chunks se generan bien


 Dynamic imports para features opcionales:

javascript  const AdvancedFeature = await import('./AdvancedFeature.svelte')

 Mover código grande a workers (opcional):

 Procesamiento pesado en Web Worker
 No bloquea UI thread



12.7 Caching Estratégico

 Service Worker para assets (opcional):

 Cachear GIFs y assets estáticos
 Offline functionality básica


 localStorage para datos temporales:

 Cachear datos de preguntas ya vistas
 Reducir queries a Supabase
 Invalidar después de 24hrs


 Memoizar respuestas de IA (backend):

 Ya implementado en backend
 Verificar que funciona



12.8 Monitoring de Performance

 Agregar performance marks:

javascript  performance.mark('explanation-start');
  // ... código ...
  performance.mark('explanation-end');
  performance.measure('explanation', 'explanation-start', 'explanation-end');

 Loggear métricas importantes:

 Tiempo de conexión socket
 Tiempo hasta primer chunk
 Tiempo total de explicación
 FPS de animaciones


 Enviar métricas a analytics (opcional):

 Google Analytics
 Custom endpoint
 Para análisis posterior



12.9 Probar Performance

 Lighthouse audit:

 Performance score > 90
 First Contentful Paint < 1.8s
 Time to Interactive < 3.8s
 Total Blocking Time < 300ms


 Chrome DevTools Performance:

 Grabar sesión completa
 Identificar long tasks
 Identificar layout thrashing
 Verificar no hay memory leaks


 Probar en throttled connection:

 Fast 3G
 Slow 3G
 Verificar experiencia aceptable


 Probar en CPU throttled:

 4x slowdown
 Verificar UI sigue responsive
 Animaciones no se rompen




🧪 SPRINT 13: TESTING Y QA
13.1 Tests Unitarios de Funciones

 Instalar vitest si no está:

bash  npm install -D vitest @testing-library/svelte

 Crear carpeta tests/unit/
 Test de socket.js:

 Mock de socket.io-client
 Test connectSocket() con token válido
 Test disconnectSocket() limpia correctamente
 Test emit functions envían datos correctos
 Test on functions registran listeners


 Test de explanationStore.js:

 Test estado inicial correcto
 Test setConnected() actualiza
 Test initExplanation() resetea y setea datos
 Test addChunk() agrega correctamente
 Test completeStep() marca como completo
 Test reset() vuelve a estado inicial


 Test de funciones de dibujo en Blackboard:

 Mock de Canvas context
 Test drawLine() llama métodos correctos
 Test drawRectangle() con y sin fill
 Test normalizeCoords() retorna valores esperados


 Ejecutar tests:

bash  npm run test:unit
13.2 Tests de Integración de Componentes

 Crear carpeta tests/integration/
 Test de Blackboard.svelte:

 Renderiza sin errores
 Ejecuta comandos cuando cambian props
 Limpia canvas apropiadamente


 Test de TeacherCharacter.svelte:

 Renderiza GIF correcto según state
 Cambia GIF cuando state cambia
 Transiciones funcionan


 Test de ExplanationPanel.svelte:

 Renderiza botones correctos según estado
 Emite eventos cuando se hace click
 Valida input de preguntas


 Test de TypewriterText.svelte:

 Muestra texto progresivamente
 Pausa cuando prop isPaused = true
 Reanuda correctamente


 Test de ModalFeedback.svelte:

 Se muestra cuando show = true
 Rating funciona correctamente
 Emite evento rate con datos correctos



13.3 Tests End-to-End

 Instalar Playwright:

bash  npm install -D @playwright/test

 Crear carpeta tests/e2e/
 Test: Flujo completo de explicación:

 Login de usuario
 Navegar a examen
 Responder pregunta incorrectamente
 Verifica redirección a salón
 Espera conexión socket
 Espera inicio de explicación
 Verifica pasos aparecen
 Verifica profesor cambia de estado
 Verifica canvas dibuja
 Espera completion
 Verifica modal de feedback aparece
 Submit rating
 Verifica redirección final


 Test: Pausar y reanudar:

 Inicia explicación
 Click en pausar
 Verifica que se pausa
 Espera 2 segundos
 Click en resumir
 Verifica que continúa


 Test: Hacer pregunta durante explicación:

 Inicia explicación
 Espera al paso 2
 Escribe pregunta en input
 Click en enviar
 Verifica que pausa automáticamente
 Espera respuesta de follow-up
 Verifica modal aparece
 Click en continuar
 Verifica que reanuda


 Test: Manejo de error de conexión:

 Inicia explicación
 Simula pérdida de conexión (detener backend)
 Verifica mensaje de error
 Reinicia backend
 Verifica reconexión


 Ejecutar tests E2E:

bash  npm run test:e2e
13.4 Testing Manual - Checklist

 Flujo completo feliz:

 Login exitoso
 Navegar al examen
 Responder incorrectamente
 Ver explicación completa
 Dar feedback
 Volver al examen


 Diferentes tipos de preguntas:

 Pregunta con LaTeX
 Pregunta con imagen
 Pregunta de algebra
 Pregunta de geometría
 Pregunta de cálculo


 Interacciones:

 Pausar en diferentes momentos
 Resumir correctamente
 Hacer pregunta en paso 1
 Hacer pregunta en paso final
 Hacer múltiples preguntas


 Responsiveness:

 Desktop 1920x1080
 Laptop 1366x768
 Tablet 768x1024
 Mobile 375x667
 Orientación portrait
 Orientación landscape


 Browsers:

 Chrome/Chromium
 Firefox
 Safari (si es posible)
 Edge
 Mobile Safari (iOS)
 Mobile Chrome (Android)


 Escenarios de error:

 Sin conexión al inicio
 Pérdida de conexión durante
 Token expirado
 Créditos insuficientes
 Rate limit excedido
 Error de IA
 Sesión expirada


 Performance:

 No hay lag en animaciones
 Canvas dibuja fluido
 Typewriter smooth
 No memory leaks en sesiones largas
 Rápido cambio entre pasos


 Accesibilidad:

 Navegación por teclado funciona
 Contraste de colores adecuado
 Textos legibles
 Botones bien identificados
 Formularios con labels



13.5 Bug Tracking y Fixes

 Crear lista de bugs encontrados
 Priorizar bugs:

 Críticos (rompen funcionalidad)
 Altos (afectan experiencia)
 Medios (cosméticos)
 Bajos (edge cases)


 Fix bugs críticos inmediatamente
 Fix bugs altos antes de release
 Documentar bugs medios/bajos para futuro
 Re-testear después de cada fix


🚀 SPRINT 14: PREPARACIÓN PARA DEMO
14.1 Preparar Datos de Demostración

 Seleccionar 5 preguntas para demo:

 1 pregunta fácil (2-3 pasos)
 2 preguntas medianas (3-4 pasos)
 1 pregunta compleja (5+ pasos)
 1 pregunta con visualización


 Asegurar que tienen respuestas IA generadas:

 Precalcular y guardar en BD
 Respuestas de calidad revisadas
 Pasos bien estructurados


 Crear usuario de demostración:

 Email: demo@guiaipn.com
 Con créditos ilimitados
 Con datos de prueba


 Seed de datos en Supabase:

 Ejecutar script de seed
 Verificar datos en dashboard



14.2 Optimizar para Primera Impresión

 Reducir tiempo de carga inicial:

 Optimize bundle size
 Lazy load no-critical
 Preload critical assets


 Mejorar splash screen:

 Logo animado
 Loading elegante
 Mensaje motivacional


 Onboarding rápido (opcional):

 Tour guiado de 3 pasos
 Dismissible
 Solo primera vez


 Animación de entrada impactante:

 Profesor aparece con efecto
 Pizarrón se "dibuja"
 Transición smooth desde examen



14.3 Pulir Detalles Visuales

 Revisar spacing y alignment:

 Consistent padding/margin
 Elementos alineados perfectamente
 No elementos descuadrados


 Refinar colores:

 Paleta consistente
 Buen contraste
 Estados hover/active claros


 Mejorar tipografía:

 Tamaños jerárquicos claros
 Line-height comfortable
 Letter-spacing apropiado


 Pulir animaciones:

 Timing natural
 Easing curves suaves
 No jarring transitions


 Agregar micro-interacciones:

 Botones con ripple effect
 Hover states con scale
 Success confirmations animadas



14.4 Crear Script de Demostración

 Escribir guion paso a paso:

Intro (30 seg):

"Presentamos GuiaIPN, tu tutor IA para el examen de admisión"
Mostrar landing page brevemente


Login (15 seg):

"Inicio de sesión con Google en segundos"
Quick login


Examen (45 seg):

"Practica con preguntas reales del examen"
Responder una pregunta incorrectamente
"Cuando te equivocas, nuestro profesor IA te explica"


Salón de Clase (3 min):

"Bienvenido al salón virtual"
Mostrar profesor animado
"Explicación paso a paso con visualizaciones"
Dejar que stream 2 pasos completos
"Puedes pausar en cualquier momento"
Pausar, mostrar controles
Resumir
"¿Algo no quedó claro? Pregunta en tiempo real"
Hacer pregunta de ejemplo
Mostrar respuesta
Continuar hasta completar


Feedback (30 seg):

Mostrar modal de feedback
"Ayúdanos a mejorar con tu opinión"
Submit rating


Cierre (30 seg):

"Empieza a practicar hoy"
Mostrar planes/precios
Call to action




 Cronometrar demo: 5-6 minutos total
 Practicar el script varias veces
 Tener plan B si algo falla

14.5 Preparar Materiales de Soporte

 Crear video de demo:

 Screen recording de calidad
 Editar con transiciones
 Agregar música de fondo (opcional)
 Subtítulos si es posible
 Duración: 2-3 minutos
 Upload a YouTube/Vimeo


 Screenshots para presentación:

 Landing page
 Examen en progreso
 Salón de clase con explicación
 Pizarrón con visualización
 Modal de feedback
 Dashboard de usuario


 GIF animados de features clave:

 Profesor cambiando estados
 Canvas dibujando
 Typewriter effect
 Pausa/resume


 Presentación de slides:

 Problema que resuelve
 Solución que ofrece
 Demo (link a video)
 Tecnología utilizada
 Métricas (si hay)
 Roadmap futuro



14.6 Testing Pre-Demo

 Día antes de demo:

 Full testing de flujo completo
 Verificar todos los servicios corriendo:

 Backend Flask
 Redis
 Supabase accesible
 Frontend compilado


 Limpiar datos de prueba viejos
 Seed datos frescos
 Verificar créditos de usuario demo
 Test en red diferente (no localhost)
 Test en dispositivo real


 30 minutos antes de demo:

 Reiniciar servicios
 Verificar logs sin errores
 Quick smoke test
 Cerrar tabs innecesarias
 Silenciar notificaciones
 Tener browser limpio y rápido
 Backup plan listo (video si falla)



14.7 Checklist Día del Demo

 Hardware:

 Laptop cargada al 100%
 Cable de poder conectado
 Adaptador HDMI/display listo
 Mouse (si presentas)
 Internet estable (wifi + hotspot backup)


 Software:

 Todos los servicios corriendo
 Browser abierto en tabs correctas
 Presentación abierta
 Video de backup listo
 Timer/clock visible


 Ambiente:

 Proyector/pantalla funcionando
 Audio si hay video
 Iluminación adecuada
 Posición cómoda para presentar


 Contingencia:

 Plan B si internet falla
 Plan C si laptop falla
 Números de contacto de equipo
 Actitud positiva 😊




📋 CHECKLIST FINAL - ANTES DE LANZAR MVP
Funcionalidad Core

 Socket.IO conecta establemente
 Usuario puede autenticarse con Google
 Navega desde examen a salón correctamente
 Recibe y renderiza streaming de pasos
 Canvas dibuja comandos correctamente
 Profesor cambia de estado apropiadamente
 Typewriter muestra texto progresivamente
 Puede pausar y resumir sin errores
 Puede hacer preguntas durante explicación
 Modal de feedback aparece al terminar
 Feedback se guarda en base de datos
 Redirige correctamente después de finalizar

UI/UX

 Design consistente en toda la app
 Responsive funciona en todos los breakpoints
 Animaciones son fluidas (60fps)
 No hay elementos descuadrados
 Textos legibles en todos los tamaños
 Botones tienen feedback visual
 Loading states claros
 Error states informativos
 Transiciones suaves entre vistas

Performance

 Lighthouse score > 85
 First Contentful Paint < 2s
 No memory leaks
 Canvas
ReintentarIContinuarrendering fluido

 Bundle size optimizado (< 500KB gzipped)
 Assets comprimidos
 Lazy loading implementado
 No blocking scripts

Compatibilidad

 Funciona en Chrome/Chromium
 Funciona en Firefox
 Funciona en Safari
 Funciona en Edge
 Funciona en iOS Safari
 Funciona en Android Chrome
 Responsive en móviles
 Responsive en tablets
 Responsive en desktop

Seguridad

 Tokens no expuestos en código
 Validación de inputs implementada
 HTTPS en producción (si aplica)
 CORS configurado correctamente
 Rate limiting funcionando
 Sesiones expiran apropiadamente

Manejo de Errores

 Pérdida de conexión manejada
 Errores de autenticación manejados
 Errores de backend manejados
 Timeouts manejados
 Créditos insuficientes manejados
 Rate limit manejado
 Sesión expirada manejada
 Mensajes de error claros y accionables

Testing

 Tests unitarios pasando
 Tests de integración pasando
 Tests E2E principales pasando
 Testing manual completo
 Testing en dispositivos reales
 No hay console.errors en producción
 No hay console.logs olvidados

Documentación

 README actualizado
 Variables de entorno documentadas
 Instrucciones de setup claras
 Arquitectura documentada
 Flujos principales documentados

Backend Integration

 Backend corriendo sin errores
 Redis funcionando correctamente
 Supabase conectado
 OpenAI API funcionando
 Todos los eventos Socket.IO implementados
 Logs útiles en backend
 Health check endpoint funciona

Datos

 Schema de BD creado en Supabase
 Datos seed cargados
 Preguntas de ejemplo con respuestas IA
 Usuario demo configurado
 Políticas RLS configuradas
 Triggers funcionando

DevOps (Opcional para MVP)

 Variables de entorno en producción
 Deploy pipeline configurado
 Monitoring básico
 Logs accesibles
 Rollback plan


🎯 MÉTRICAS DE ÉXITO DEL MVP
Funcionales

 100% de usuarios pueden conectar socket
 100% de explicaciones completan sin crashes
 < 5% de errores de conexión
 < 3s tiempo de respuesta inicial de IA
 0 errores críticos en 100 pruebas

UX

 Usuarios completan flujo sin ayuda
 < 5% de usuarios cierran antes de terminar
 Rating promedio > 4/5
 > 80% entiende la explicación

Performance

 Lighthouse score > 85
 Streaming sin lag perceptible
 Animaciones a 60fps constante
 < 2s carga inicial


🚧 POST-MVP - MEJORAS FUTURAS
Funcionalidades Adicionales

 Entrada por voz (Web Speech API)
 Historial de explicaciones
 Replay de explicaciones pasadas
 Modo oscuro
 Subtítulos/closed captions
 Exportar explicación como PDF
 Compartir explicación con link
 Favoritos/bookmarks
 Notas personales
 Resumen automático de sesión

Mejoras del Profesor

 Múltiples personajes para elegir
 Voz sintetizada (TTS)
 Gestos más elaborados
 Expresiones faciales
 Animaciones custom por materia

Mejoras del Canvas

 Gráficas 3D (Three.js)
 Animaciones matemáticas avanzadas
 Herramientas de dibujo interactivas
 Zoom y pan
 Slow motion de pasos complejos

Gamificación

 Sistema de puntos
 Badges y logros
 Racha de días estudiando
 Tabla de clasificación
 Desafíos diarios/semanales

Social

 Grupos de estudio
 Chat entre estudiantes
 Compartir progreso
 Preguntar a la comunidad
 Mentores verificados

Analytics

 Dashboard de progreso detallado
 Predicción de calificación
 Áreas débiles identificadas
 Recomendaciones personalizadas
 Tiempo de estudio tracking

Contenido

 Más materias (física, química, biología)
 Exámenes completos simulados
 Modo examen cronometrado
 Explicaciones en video pre-grabadas
 Ejercicios de práctica adicionales

Integrations

 Calendario de estudio
 Recordatorios por email/push
 Integración con Google Classroom
 Export a Notion/Obsidian
 API pública para extensiones

Monetización

 Planes de suscripción mejorados
 Compra de créditos individuales
 Descuentos para grupos
 Programa de referidos
 Contenido premium


📊 TRACKING DE PROGRESO
Sprints Completados

 Sprint 1: Configuración e Integración Socket.IO
 Sprint 2: Crear Ruta y Estructura de Componentes
 Sprint 3: Navegación desde Examen Existente
 Sprint 4: Implementar Streaming Completo
 Sprint 5: Sistema de Canvas Completo
 Sprint 6: Controles de Reproducción
 Sprint 7: Preguntas Durante Explicación
 Sprint 8: Animaciones del Profesor
 Sprint 9: Feedback y Cierre
 Sprint 10: Manejo de Errores y Edge Cases
 Sprint 11: Responsive y Mobile
 Sprint 12: Optimizaciones y Performance
 Sprint 13: Testing y QA
 Sprint 14: Preparación para Demo

Estimación de Tiempo por Sprint

Sprint 1: 2-3 días
Sprint 2: 3-4 días
Sprint 3: 1 día
Sprint 4: 3-4 días
Sprint 5: 2-3 días
Sprint 6: 2 días
Sprint 7: 2-3 días
Sprint 8: 2 días
Sprint 9: 2 días
Sprint 10: 3 días
Sprint 11: 3-4 días
Sprint 12: 2-3 días
Sprint 13: 3-4 días
Sprint 14: 2 días

TOTAL ESTIMADO: 32-40 días de trabajo (6-8 semanas a tiempo completo)

🎓 RECURSOS Y REFERENCIAS
Documentación Técnica

 Revisar FRONTEND_CHECKLIST.md constantemente
 Consultar architecture-guiaIpn.md para backend
 Revisar REDIS_SESSIONS.md para sesiones
 Consultar SOCKET_IO_COMPLETE.md para eventos
 Revisar schema_complete.sql para BD

Tutoriales y Guías

 Socket.IO Client docs
 Svelte 5 runes documentation
 SvelteKit routing guide
 HTML5 Canvas tutorial
 Supabase Auth guide
 TailwindCSS utility classes

Herramientas Útiles

 Chrome DevTools
 Redux DevTools (si usas)
 Postman/Insomnia para API testing
 Redis Commander para ver datos
 Supabase Dashboard
 VS Code Svelte extension

Comunidad y Soporte

 Svelte Discord
 Stack Overflow
 GitHub Issues del proyecto
 Team chat interno


✅ CRITERIOS DE ACEPTACIÓN FINAL
El MVP está listo cuando:

Funcionalidad Core (100% obligatorio):

Usuario autenticado puede navegar al salón
Socket conecta sin errores
Recibe explicación paso a paso
Canvas dibuja correctamente
Profesor anima según contexto
Puede pausar/resumir
Puede hacer preguntas
Modal de feedback funciona
Datos se guardan en BD


Experiencia de Usuario (100% obligatorio):

Flujo intuitivo sin confusión
Responsive en móvil y desktop
Sin bugs críticos
Mensajes de error claros
Performance aceptable (> 60fps)


Calidad de Código (100% obligatorio):

Código limpio y mantenible
Sin console.logs en producción
Sin errores en consola
Funciones documentadas
Arquitectura clara


Testing (80% mínimo):

Tests unitarios críticos pasando
Manual testing completo
Bugs críticos resueltos
Testing en múltiples browsers


Demo Ready (100% obligatorio):

Script de demo preparado
Datos de demo cargados
Video de respaldo creado
Presentación lista
Todo funciona en vivo




🎉 ¡FELICITACIONES!
Si completaste todos los checkboxes arriba, tienes un MVP funcional del Salón de Clase IA listo para demostrar y iterar.
Próximos Pasos Post-MVP:

Recopilar feedback de usuarios reales
Analizar métricas de uso
Priorizar mejoras según feedback
Iterar rápidamente en features más solicitadas
Escalar cuando tengas product-market fit

Recuerda:

MVP = Minimum VIABLE Product, no perfecto
Mejor lanzar y aprender que nunca lanzar
El feedback real es oro
Itera basado en datos, no suposiciones
¡Disfruta el proceso! 🚀


Última actualización de checklist: [Fecha actual]
Versión: 1.0.0
Estado: Ready for Implementation