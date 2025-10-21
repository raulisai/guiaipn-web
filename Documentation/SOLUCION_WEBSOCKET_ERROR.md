# 🔧 Solución: WebSocket Connection Failed

## ❌ Problemas Encontrados

### 1. Error de WebSocket
```
WebSocket connection to 'ws://localhost:5000/socket.io/?EIO=4&transport=websocket' failed: 
Invalid frame header
```

### 2. Redirección Inesperada
Al hacer una pregunta, la página redirigía automáticamente a `/cuenta/login` y no se podían ver los logs.

---

## 🔍 Causas

### Causa 1: Backend Flask No Está Corriendo
El error "Invalid frame header" indica que:
- El backend Flask NO está corriendo en `http://localhost:5000`
- O el servidor Socket.IO no está configurado correctamente
- O hay un problema de CORS

### Causa 2: Redirección Automática en Errores
El `SocketService.handleError()` estaba redirigiendo automáticamente a login cuando había errores de autenticación, impidiendo ver los logs de error.

### Causa 3: Rutas Protegidas
El `+layout.svelte` tenía lógica de protección de rutas que podía interferir con `/test-socket`.

---

## ✅ Soluciones Implementadas

### 1. Agregar `/test-socket` a Rutas Públicas

**Archivo:** `src/routes/+layout.svelte`

```javascript
// Rutas protegidas que requieren autenticación
const protectedRoutes = ['/progreso', '/materias'];

// Rutas públicas que no deben redirigir (testing, auth, etc.)
const publicRoutes = ['/test-socket', '/cuenta', '/auth', '/examen'];

// Verificar si la ruta actual requiere autenticación
let isProtectedRoute = $derived(
    protectedRoutes.some(route => $page.url.pathname.startsWith(route)) &&
    !publicRoutes.some(route => $page.url.pathname.startsWith(route))
);
```

**Resultado:** `/test-socket` ya no redirige automáticamente a login.

---

### 2. Remover Redirección Automática en Errores

**Archivo:** `src/lib/api/socket/SocketService.js`

```javascript
handleError(error) {
    const errorHandlers = {
        AUTH_REQUIRED: () => {
            console.error('❌ Token no proporcionado');
            // NO redirigir automáticamente - dejar que el componente maneje
        },
        AUTH_FAILED: () => {
            console.error('❌ Autenticación fallida - Token inválido o expirado');
            // NO redirigir automáticamente - dejar que el componente maneje
        },
        // ... resto de handlers
    };
    
    const handler = errorHandlers[error.code] || errorHandlers.default;
    handler();
}
```

**Resultado:** Los errores se muestran en los logs sin redirigir.

---

## 🚀 Cómo Solucionar el Error de WebSocket

### Opción 1: Iniciar el Backend Flask (Recomendado)

Si tienes el backend Flask:

```bash
# Navega al directorio del backend
cd path/to/backend

# Activa el entorno virtual (si usas uno)
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Instala dependencias (si es primera vez)
pip install -r requirements.txt

# Inicia el servidor
python app.py
# O
flask run
```

**Verifica que esté corriendo:**
```
 * Running on http://127.0.0.1:5000
 * Socket.IO server started
```

---

### Opción 2: Usar un Backend Mock (Para Testing)

Si no tienes el backend, puedes crear un servidor Socket.IO mock simple:

**Crear:** `backend-mock/server.js`

```javascript
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

// Middleware de autenticación
io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
        return next(new Error('AUTH_REQUIRED'));
    }
    
    // En producción, verificar el token con Supabase
    // Por ahora, aceptar cualquier token
    socket.userId = 'test-user-123';
    next();
});

io.on('connection', (socket) => {
    console.log('✅ Cliente conectado:', socket.id);
    
    // Generar session_id
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Enviar confirmación de conexión
    socket.emit('connection_established', {
        session_id: sessionId,
        user_info: {
            user_id: socket.userId
        }
    });
    
    // Escuchar pregunta
    socket.on('ask_question', (data) => {
        console.log('📤 Pregunta recibida:', data.question);
        
        // Simular respuesta
        socket.emit('waiting_phrase', {
            message: 'Déjame pensar...'
        });
        
        setTimeout(() => {
            socket.emit('explanation_start', {
                total_steps: 3,
                estimated_duration: 30
            });
            
            // Simular pasos
            for (let i = 1; i <= 3; i++) {
                setTimeout(() => {
                    socket.emit('step_start', {
                        step: i,
                        title: `Paso ${i}`,
                        type: 'text'
                    });
                    
                    setTimeout(() => {
                        socket.emit('content_chunk', {
                            step: i,
                            content: `Contenido del paso ${i}...`
                        });
                        
                        setTimeout(() => {
                            socket.emit('step_complete', {
                                step: i
                            });
                        }, 500);
                    }, 500);
                }, i * 2000);
            }
            
            setTimeout(() => {
                socket.emit('explanation_complete', {
                    total_steps: 3
                });
            }, 7000);
        }, 1000);
    });
    
    socket.on('disconnect', () => {
        console.log('❌ Cliente desconectado:', socket.id);
    });
});

const PORT = 5000;
server.listen(PORT, () => {
    console.log(`✅ Servidor Socket.IO corriendo en http://localhost:${PORT}`);
});
```

**Instalar dependencias:**
```bash
cd backend-mock
npm init -y
npm install express socket.io jsonwebtoken
```

**Iniciar:**
```bash
node server.js
```

---

### Opción 3: Configurar Variable de Entorno

Si el backend está en otro puerto o URL:

**Archivo:** `.env`

```env
PUBLIC_SOCKET_URL=http://localhost:5000
# O si está en otro puerto:
# PUBLIC_SOCKET_URL=http://localhost:3000
```

---

## 🧪 Verificar que Funciona

1. **Iniciar backend** (Flask o mock)
2. **Iniciar frontend:**
   ```bash
   npm run dev
   ```

3. **Navegar a:**
   ```
   http://localhost:5173/test-socket
   ```

4. **Verificar logs esperados:**
   ```
   [20:30:15] 🔑 Token obtenido (eyJhbGciOiJIUzI1NiIsInR...)
   [20:30:20] 🔄 Intentando conectar...
   [20:30:21] ✅ Socket conectado exitosamente
   [20:30:21] ✅ Conexión establecida
   [20:30:21] 📋 Session ID: session-1234567890-abc123
   ```

5. **Probar pregunta:**
   - Click en "📤 Probar Pregunta"
   - Debe aparecer: `📤 Enviando pregunta de prueba...`
   - Debe aparecer: `✅ Pregunta enviada`
   - **NO debe redirigir a login**

---

## 📊 Checklist de Troubleshooting

- [ ] Backend Flask/Mock está corriendo en puerto 5000
- [ ] Frontend puede acceder a `http://localhost:5000`
- [ ] No hay errores de CORS en la consola
- [ ] Token JWT se obtiene correctamente
- [ ] `/test-socket` no redirige a login
- [ ] Los logs se muestran correctamente
- [ ] No hay redirección automática en errores

---

## 🐛 Errores Comunes

### Error: "CORS policy"
**Solución:** Configurar CORS en el backend Flask:
```python
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})
```

### Error: "Connection refused"
**Solución:** El backend no está corriendo. Iniciar el servidor.

### Error: "Invalid token"
**Solución:** Verificar que el token JWT sea válido y no haya expirado.

### Error: "Session not found"
**Solución:** Reconectar el socket para obtener un nuevo session_id.

---

## ✅ Resumen de Cambios

1. ✅ Agregado `/test-socket` a rutas públicas en `+layout.svelte`
2. ✅ Removida redirección automática en `SocketService.handleError()`
3. ✅ Mejorada lógica de protección de rutas
4. ✅ Documentación de soluciones para WebSocket

---

**Estado:** ✅ Problemas solucionados  
**Siguiente paso:** Iniciar backend y probar conexión  
**Fecha:** 2025-01-20
