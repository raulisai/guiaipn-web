# 🧪 Testing Socket.IO - Guía Completa

## 📍 Ubicación

**Ruta de testing:** `http://localhost:5173/test-socket`

**Archivo:** `src/routes/test-socket/+page.svelte`

---

## 🎯 Objetivo

Verificar que la implementación de Socket.IO funciona correctamente antes de crear los componentes UI del salón de clase.

---

## ✅ Checklist de Testing

### 1.4 Testing Básico
- [x] **Conectar socket al montar componente**
  - Click en botón "🔌 Conectar"
  - Verifica que el estado cambie a "Conectado"

- [x] **Ver en consola: "✅ Conectado al backend"**
  - Revisa la sección "📋 Logs de Consola"
  - Debe aparecer: `[HH:MM:SS] ✅ Socket conectado exitosamente`

- [x] **Recibir `session_id` en evento `connection_established`**
  - Verifica que aparezca el Session ID en la tarjeta de estado
  - Debe ser un UUID válido (ej: `550e8400-e29b-41d4-a716-446655440000`)

- [x] **Verificar que desconecta correctamente**
  - Click en botón "🔌 Desconectar"
  - Verifica que aparezca: `[HH:MM:SS] ✅ Desconectado correctamente`
  - El estado debe cambiar a "Desconectado"

---

## 🚀 Cómo Usar

### Prerequisitos

1. **Backend Flask corriendo:**
   ```bash
   # En el directorio del backend
   python app.py
   # O el comando que uses para iniciar Flask
   ```
   Debe estar corriendo en `http://localhost:5000`

2. **Usuario autenticado:**
   - Inicia sesión en `/cuenta/login`
   - Necesitas un token JWT válido

3. **Frontend corriendo:**
   ```bash
   npm run dev
   ```

### Pasos de Testing

1. **Navega a la página de testing:**
   ```
   http://localhost:5173/test-socket
   ```

2. **Verifica el estado inicial:**
   - Estado: "❌ Desconectado"
   - Session ID: "N/A"
   - Logs: vacíos

3. **Conectar:**
   - Click en "🔌 Conectar"
   - Espera 1-2 segundos
   - Verifica que cambie a "✅ Conectado"

4. **Verificar Session ID:**
   - Debe aparecer un UUID en la tarjeta de estado
   - También debe aparecer en el store state

5. **Probar envío de pregunta:**
   - Click en "📤 Probar Pregunta"
   - Verifica en los logs: `📤 Enviando pregunta de prueba...`
   - Verifica: `✅ Pregunta enviada`

6. **Desconectar:**
   - Click en "🔌 Desconectar"
   - Verifica: `✅ Desconectado correctamente`
   - Estado debe volver a "❌ Desconectado"

---

## 📊 Qué Verifica el Testing

### Conexión
- ✅ Socket.IO se conecta al servidor Flask
- ✅ Autenticación JWT funciona
- ✅ Se recibe evento `connection_established`
- ✅ Se guarda el `session_id` correctamente

### Estado
- ✅ `explanationStore.isConnected` se actualiza
- ✅ `explanationStore.sessionId` se guarda
- ✅ Estado reactivo funciona en Svelte

### Emisión de Eventos
- ✅ `emitAskQuestion()` funciona
- ✅ Payload se envía correctamente al servidor

### Desconexión
- ✅ Socket se desconecta limpiamente
- ✅ Listeners se limpian
- ✅ Estado se resetea

---

## 🎨 Interfaz de Testing

### Tarjeta de Estado
```
┌─────────────────────────────────────────┐
│ Estado de Conexión                      │
│ ✅ Conectado al servidor                │
│                                          │
│ Session ID: 550e8400-e29b-41d4-a716... │
│                                          │
│ [🔌 Conectar] [🔌 Desconectar]          │
│ [📤 Probar Pregunta]                    │
└─────────────────────────────────────────┘
```

### Estado del Store
```
┌─────────────────────────────────────────┐
│ 📦 Estado del Store                     │
│                                          │
│ isConnected:    ✅ true                 │
│ sessionId:      550e8400-e29b...        │
│ isExplaining:   ❌ false                │
│ isLoading:      ❌ false                │
│ currentStep:    0                        │
│ totalSteps:     0                        │
└─────────────────────────────────────────┘
```

### Logs de Consola
```
┌─────────────────────────────────────────┐
│ 📋 Logs de Consola          [🗑️ Limpiar]│
│                                          │
│ [14:30:15] 🔄 Intentando conectar...    │
│ [14:30:16] ✅ Socket conectado          │
│ [14:30:16] ✅ Conexión establecida      │
│ [14:30:16] 📋 Session ID: 550e8400...   │
│ [14:30:20] 📤 Enviando pregunta...      │
│ [14:30:20] ✅ Pregunta enviada          │
│ [14:30:25] 🔌 Desconectando...          │
│ [14:30:25] ✅ Desconectado correctamente│
└─────────────────────────────────────────┘
```

---

## 🐛 Troubleshooting

### Error: "No hay token de usuario"
**Solución:** Inicia sesión en `/cuenta/login` primero

### Error: "Timeout: No se pudo conectar"
**Solución:** 
- Verifica que el backend Flask esté corriendo
- Verifica que esté en `http://localhost:5000`
- Revisa la consola del backend para errores

### Error: "AUTH_FAILED"
**Solución:**
- Token JWT expirado, cierra sesión y vuelve a iniciar
- Verifica que el token sea válido en el backend

### No aparece Session ID
**Solución:**
- Espera 1-2 segundos después de conectar
- Revisa la consola del navegador (F12)
- Verifica que el backend emita `connection_established`

### Desconexión automática
**Solución:**
- El backend puede desconectar si el token es inválido
- Revisa los logs del backend Flask
- Verifica que Redis esté corriendo (si aplica)

---

## 📝 Logs Esperados

### Conexión Exitosa
```
[14:30:15] 🔄 Intentando conectar...
[14:30:16] ✅ Socket conectado exitosamente
[14:30:16] ✅ Conexión establecida
[14:30:16] 📋 Session ID: 550e8400-e29b-41d4-a716-446655440000
```

### Envío de Pregunta
```
[14:30:20] 📤 Enviando pregunta de prueba...
[14:30:20] ✅ Pregunta enviada
```

### Desconexión
```
[14:30:25] 🔌 Desconectando...
[14:30:25] ✅ Desconectado correctamente
```

### Error de Conexión
```
[14:30:15] 🔄 Intentando conectar...
[14:30:25] ❌ Error al conectar: Timeout: No se pudo conectar al servidor
```

---

## 🔍 Verificación en Consola del Navegador

Abre la consola del navegador (F12) y verifica:

```javascript
// Conexión
✅ Conectado al servidor Socket.IO
📡 Socket ID: abc123xyz

// Session establecida
🎉 Sesión establecida: { session_id: "550e8400...", user_info: {...} }

// Pregunta enviada
📤 Enviando pregunta: ¿Qué es la energía cinética?

// Desconexión
❌ Desconectado del servidor: io client disconnect
```

---

## ✅ Criterios de Éxito

El testing es exitoso si:

1. ✅ Se conecta sin errores
2. ✅ Aparece el Session ID
3. ✅ El store se actualiza correctamente
4. ✅ Se puede enviar una pregunta
5. ✅ Se desconecta limpiamente
6. ✅ No hay errores en la consola

---

## 🚀 Próximos Pasos

Una vez que el testing básico funcione:

1. ✅ **Fase 4 completada** - Socket.IO funcional
2. ✅ **Fase 5 completada** - Estado funcional
3. ➡️ **Fase 6** - Crear componentes UI:
   - `/examen/salon/+page.svelte`
   - `Blackboard.svelte`
   - `TeacherCharacter.svelte`
   - `ExplanationPanel.svelte`

---

## 📊 Comandos Útiles

### Iniciar Backend
```bash
cd backend
python app.py
```

### Iniciar Frontend
```bash
npm run dev
```

### Ver Logs del Backend
```bash
# En la terminal del backend verás:
✅ Cliente conectado: abc123xyz
📋 Sesión creada: 550e8400-e29b-41d4-a716-446655440000
📤 Pregunta recibida: ¿Qué es la energía cinética?
```

---

**Última actualización:** 2025-01-20  
**Estado:** ✅ Componente de testing creado  
**Ruta:** `/test-socket`
