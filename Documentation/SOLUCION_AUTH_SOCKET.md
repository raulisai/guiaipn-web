# Solución: Autenticación en Socket.IO

## Problema
El backend Flask requiere que **todos los eventos Socket.IO** protegidos con el decorador `@require_auth_socket` incluyan el token JWT en el payload de cada evento.

### Error Original
```
AUTH_REQUIRED: Token de autenticación requerido
```

## Causa Raíz
El `SocketService.js` enviaba el token solo en la autenticación inicial (`auth: { token }`), pero **no lo incluía en cada evento** emitido al servidor.

## Solución Implementada

### 1. Guardar el Token en la Instancia
```javascript
class SocketService {
  constructor() {
    this.socket = null;
    this.sessionId = null;
    this.isConnected = false;
    this.listeners = new Map();
    this.token = null; // ✅ Nuevo: Guardar token
  }
}
```

### 2. Almacenar Token al Conectar
```javascript
connect(token) {
  // Guardar token para usarlo en eventos
  this.token = token;
  
  // Crear conexión
  this.socket = io(SOCKET_URL, {
    auth: { token }, // Autenticación inicial
    transports: ['websocket'],
    ...RECONNECTION_CONFIG
  });
}
```

### 3. Incluir Token en Cada Evento
Todos los métodos `emit*` ahora incluyen el token en el payload:

```javascript
emitAskQuestion(question, context = {}) {
  if (!this.token) {
    console.error('❌ Token no disponible');
    return;
  }
  
  this.socket.emit('ask_question', {
    token: this.token, // ✅ Token incluido
    question,
    context
  });
}
```

### 4. Eventos Actualizados
Los siguientes métodos ahora incluyen el token:

- ✅ `emitAskQuestion()`
- ✅ `emitStartExplanation()`
- ✅ `emitPauseExplanation()`
- ✅ `emitResumeExplanation()`
- ✅ `emitAskFollowUp()`
- ✅ `emitInterruptExplanation()`

### 5. Limpiar Token al Desconectar
```javascript
disconnect() {
  this.socket = null;
  this.sessionId = null;
  this.isConnected = false;
  this.token = null; // ✅ Limpiar token
  this.listeners.clear();
}
```

## Estructura del Decorador Backend

```python
def require_auth_socket(f):
    """
    Decorador para proteger handlers de Socket.IO
    
    Espera que el cliente envíe:
    socket.emit('event_name', { 
      token: 'jwt_token',  # ← REQUERIDO
      ...other_data 
    })
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        data = args[0] if args else {}
        token = data.get("token")
        
        if not token:
            emit("error", {
                "code": "AUTH_REQUIRED",
                "message": "Token de autenticación requerido"
            })
            disconnect()
            return
        
        # Verificar y agregar usuario al payload
        user = verify_token(token)
        data["user"] = user
        return f(*args, **kwargs)
    
    return decorated_function
```

## Formato de Payload Esperado

### Antes (❌ Incorrecto)
```javascript
socket.emit('ask_question', {
  question: "¿Qué es la energía cinética?",
  context: { subject: "física" }
});
```

### Después (✅ Correcto)
```javascript
socket.emit('ask_question', {
  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", // ← Token incluido
  question: "¿Qué es la energía cinética?",
  context: { subject: "física" }
});
```

## Validación
Para verificar que funciona correctamente:

1. **Conexión exitosa**: Debe mostrar `✅ Conectado al servidor Socket.IO`
2. **Session establecida**: Debe recibir evento `connection_established`
3. **Sin errores AUTH_REQUIRED**: No debe aparecer el error de autenticación
4. **Eventos procesados**: El backend debe procesar los eventos correctamente

## Notas Importantes

- ⚠️ El token debe ser válido y no estar expirado
- ⚠️ Todos los eventos protegidos requieren el token
- ⚠️ El token se limpia al desconectar para seguridad
- ⚠️ Si el token expira, el usuario debe reconectarse

## Archivos Modificados
- `src/lib/api/socket/SocketService.js` - Servicio Socket.IO actualizado
