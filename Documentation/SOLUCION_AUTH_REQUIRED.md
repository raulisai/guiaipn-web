# 🔧 Solución: AUTH_REQUIRED Error

## ❌ Error

```
🚫 Error de Socket.IO: {code: 'AUTH_REQUIRED', message: 'Token de autenticación requerido'}
❌ Token no proporcionado
❌ Desconectado del servidor: io server disconnect
⚠️ Servidor forzó la desconexión (posible token inválido)
```

---

## 🔍 Diagnóstico

El error `AUTH_REQUIRED` significa que el **backend Flask está rechazando el token** por una de estas razones:

1. ✅ **El token SÍ se está enviando** (verificado en el código)
2. ❌ **El backend NO está validando correctamente el token de Supabase**
3. ❌ **El backend espera el token en un formato diferente**
4. ❌ **El token de Supabase no es válido para el backend**

---

## 🔐 Verificación del Token

### En el Frontend

El token se está enviando correctamente:

```javascript
// SocketService.js línea 64-68
this.socket = io(SOCKET_URL, {
    auth: { token },  // ✅ Token se envía aquí
    transports: ['websocket'],
    ...RECONNECTION_CONFIG
});
```

### Logs Esperados en Frontend

Después de las correcciones, deberías ver:

```
[20:40:15] 🔑 Token obtenido (eyJhbGciOiJIUzI1NiIsInR...)
[20:40:20] 🔑 Token a enviar: eyJhbGciOiJIUzI1NiIsInR...
[20:40:20] 📊 Longitud del token: 450 caracteres
[20:40:20] 🔄 Intentando conectar...
[20:40:20] 📡 Enviando conexión con token...

// En consola del navegador:
🔐 Conectando con token: {
  tokenLength: 450,
  tokenPreview: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJhdXR...",
  socketUrl: "http://localhost:5000"
}
```

---

## 🐛 Problema en el Backend

El backend Flask necesita **validar el token de Supabase correctamente**.

### Verificar Backend Flask

**Archivo:** `app.py` o similar en el backend

```python
from flask_socketio import SocketIO, emit, disconnect
import jwt
from functools import wraps

# Configuración de Supabase
SUPABASE_JWT_SECRET = "tu-supabase-jwt-secret"  # Obtener de Supabase Dashboard

def authenticate_socket(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        # Obtener token del handshake
        token = request.environ.get('HTTP_AUTHORIZATION')
        
        # O desde socket.handshake.auth
        if not token:
            auth_data = request.environ.get('socketio.auth', {})
            token = auth_data.get('token')
        
        if not token:
            emit('error', {
                'code': 'AUTH_REQUIRED',
                'message': 'Token de autenticación requerido'
            })
            disconnect()
            return
        
        try:
            # Verificar token de Supabase
            payload = jwt.decode(
                token,
                SUPABASE_JWT_SECRET,
                algorithms=['HS256'],
                audience='authenticated'
            )
            
            # Guardar user_id en la sesión
            request.environ['user_id'] = payload.get('sub')
            
            return f(*args, **kwargs)
            
        except jwt.ExpiredSignatureError:
            emit('error', {
                'code': 'AUTH_FAILED',
                'message': 'Token expirado'
            })
            disconnect()
        except jwt.InvalidTokenError:
            emit('error', {
                'code': 'AUTH_FAILED',
                'message': 'Token inválido'
            })
            disconnect()
    
    return decorated

# Middleware de Socket.IO
@socketio.on('connect')
@authenticate_socket
def handle_connect():
    user_id = request.environ.get('user_id')
    
    # Crear sesión
    session_id = create_session(user_id)
    
    emit('connection_established', {
        'session_id': session_id,
        'user_info': {
            'user_id': user_id
        }
    })
```

---

## 🔑 Obtener Supabase JWT Secret

1. **Ir a Supabase Dashboard:**
   ```
   https://supabase.com/dashboard/project/YOUR_PROJECT_ID/settings/api
   ```

2. **Copiar el JWT Secret:**
   - En la sección "JWT Settings"
   - Copiar el valor de "JWT Secret"

3. **Configurar en el Backend:**
   ```python
   # .env
   SUPABASE_JWT_SECRET=your-jwt-secret-here
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   ```

---

## 🔧 Solución Temporal: Desactivar Validación

**SOLO PARA TESTING - NO USAR EN PRODUCCIÓN**

Si quieres probar sin validación de token:

```python
@socketio.on('connect')
def handle_connect():
    # Aceptar cualquier conexión (SOLO TESTING)
    session_id = f"test-session-{uuid.uuid4()}"
    
    emit('connection_established', {
        'session_id': session_id,
        'user_info': {
            'user_id': 'test-user'
        }
    })
    
    print(f"✅ Cliente conectado: {request.sid}")
```

**Recuerda:** Esto es INSEGURO y solo para testing local.

---

## ✅ Solución Completa

### Opción 1: Configurar Backend Correctamente (Recomendado)

1. **Obtener JWT Secret de Supabase**
2. **Configurar validación en el backend:**
   ```python
   import jwt
   from supabase import create_client
   
   SUPABASE_URL = os.getenv('SUPABASE_URL')
   SUPABASE_KEY = os.getenv('SUPABASE_ANON_KEY')
   SUPABASE_JWT_SECRET = os.getenv('SUPABASE_JWT_SECRET')
   
   supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
   
   @socketio.on('connect')
   def handle_connect():
       auth_data = request.environ.get('socketio.auth', {})
       token = auth_data.get('token')
       
       if not token:
           emit('error', {'code': 'AUTH_REQUIRED', 'message': 'Token requerido'})
           disconnect()
           return
       
       try:
           # Verificar con Supabase
           payload = jwt.decode(
               token,
               SUPABASE_JWT_SECRET,
               algorithms=['HS256'],
               audience='authenticated'
           )
           
           user_id = payload['sub']
           
           # Crear sesión
           session_id = create_session(user_id)
           
           emit('connection_established', {
               'session_id': session_id,
               'user_info': {'user_id': user_id}
           })
           
       except Exception as e:
           print(f"❌ Error de autenticación: {e}")
           emit('error', {'code': 'AUTH_FAILED', 'message': str(e)})
           disconnect()
   ```

### Opción 2: Usar Servidor Mock (Para Testing)

Si no tienes acceso al backend Flask, usa el servidor mock de la documentación anterior (`SOLUCION_WEBSOCKET_ERROR.md`).

---

## 🧪 Testing

### 1. Verificar Token en Frontend

Recarga `/test-socket` y verifica los logs:

```
✅ Deberías ver:
[20:40:15] 🔑 Token obtenido (eyJhbGciOiJIUzI1NiIsInR...)
[20:40:20] 🔑 Token a enviar: eyJhbGciOiJIUzI1NiIsInR...
[20:40:20] 📊 Longitud del token: 450 caracteres
```

### 2. Verificar en Consola del Navegador (F12)

```javascript
🔐 Conectando con token: {
  tokenLength: 450,
  tokenPreview: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  socketUrl: "http://localhost:5000"
}
```

### 3. Verificar en Backend

En la terminal del backend Flask deberías ver:

```
✅ Token recibido: eyJhbGciOiJIUzI1NiIsInR...
✅ Usuario autenticado: user-id-123
✅ Sesión creada: session-abc-123
✅ Cliente conectado: socket-id-xyz
```

---

## 📊 Checklist de Solución

- [ ] Token se obtiene correctamente en frontend
- [ ] Token se envía en `auth: { token }`
- [ ] Backend recibe el token en `socketio.auth`
- [ ] Backend valida el token con Supabase JWT Secret
- [ ] Backend emite `connection_established`
- [ ] Frontend recibe `session_id`
- [ ] No hay error `AUTH_REQUIRED`

---

## 🚨 Si Sigue Fallando

### Verificar en Backend

Agrega logging en el backend:

```python
@socketio.on('connect')
def handle_connect():
    print("=" * 50)
    print("🔍 DEBUG - Nueva conexión")
    print(f"Socket ID: {request.sid}")
    
    # Verificar auth
    auth_data = request.environ.get('socketio.auth', {})
    print(f"Auth data: {auth_data}")
    
    token = auth_data.get('token')
    print(f"Token recibido: {token[:50] if token else 'None'}...")
    print(f"Token length: {len(token) if token else 0}")
    print("=" * 50)
```

### Verificar CORS

```python
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:5173"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})

socketio = SocketIO(
    app,
    cors_allowed_origins=["http://localhost:5173"],
    async_mode='threading'
)
```

---

## 📝 Resumen

**Problema:** Backend rechaza el token con `AUTH_REQUIRED`

**Causa:** Backend no está validando correctamente el token de Supabase

**Solución:**
1. Configurar `SUPABASE_JWT_SECRET` en el backend
2. Validar token con `jwt.decode()`
3. O usar servidor mock para testing

**Estado:** ⏳ Pendiente de configuración del backend

---

**Siguiente paso:** Configurar el backend Flask con el JWT Secret de Supabase o usar el servidor mock para continuar con el testing.
