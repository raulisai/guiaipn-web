# 📝 Flujo de Registro y Autenticación

## 🔄 Flujos Completos

### 1. Registro con Email/Password (CON confirmación de email)

```
┌─────────────────────────────────────────────────────────────────┐
│  FLUJO: Registro con Email/Password                            │
└─────────────────────────────────────────────────────────────────┘

1. Usuario completa formulario de registro
   ├─ Email
   ├─ Password
   └─ Nombre completo
   ↓
2. signUpWithEmail(email, password, name)
   ↓
3. Supabase crea usuario
   ├─ data.session = null (requiere confirmación)
   └─ data.user = { id, email, ... }
   ↓
4. Console log: "📬 Se requiere confirmación de email"
   ↓
5. Usuario recibe email de confirmación
   ↓
6. Usuario hace clic en link de confirmación
   ↓
7. Supabase confirma email
   ↓
8. Usuario va a /cuenta/login
   ↓
9. signInWithEmail(email, password)
   ↓
10. Supabase retorna sesión activa
    ↓
11. initializeUserProfile() automático
    ├─ POST /auth/initialize
    ├─ Backend crea perfil
    └─ Backend crea 8 materias
    ↓
12. Console log: "✅ Perfil verificado/inicializado"
    ↓
13. Redirige a dashboard (/)
```

---

### 2. Registro con Email/Password (SIN confirmación de email)

```
┌─────────────────────────────────────────────────────────────────┐
│  FLUJO: Registro sin confirmación (si está deshabilitada)      │
└─────────────────────────────────────────────────────────────────┘

1. Usuario completa formulario de registro
   ↓
2. signUpWithEmail(email, password, name)
   ↓
3. Supabase crea usuario
   ├─ data.session = { ... } (sesión activa inmediata)
   └─ data.user = { id, email, ... }
   ↓
4. Console log: "✅ Sesión activa - Inicializando perfil"
   ↓
5. initializeUserProfile() automático
   ├─ POST /auth/initialize
   ├─ Backend crea perfil
   └─ Backend crea 8 materias
   ↓
6. Console log: "✅ Nuevo usuario registrado"
   ↓
7. Muestra mensaje de confirmación
   ↓
8. Usuario puede navegar inmediatamente
```

---

### 3. Login con Google OAuth (OPTIMIZADO)

```
┌─────────────────────────────────────────────────────────────────┐
│  FLUJO: Login con Google OAuth                                 │
└─────────────────────────────────────────────────────────────────┘

1. Usuario hace clic en "Iniciar con Google"
   ↓
2. signInWithGoogle()
   ↓
3. Redirige a Google OAuth
   ↓
4. Usuario autoriza en Google
   ↓
5. Google redirige a /auth/callback
   ↓
6. Supabase intercambia código por sesión
   ↓
7. getUserProfile() - Verificar si perfil existe
   ├─ GET /auth/profile
   │
   ├─ SI EXISTE (200):
   │  ├─ Console: "👋 Usuario existente - Perfil encontrado"
   │  └─ Retorna perfil
   │
   └─ SI NO EXISTE (404):
      ├─ Console: "⚠️ Perfil no encontrado - Inicializando"
      ├─ initializeUserProfile()
      ├─ POST /auth/initialize
      ├─ Backend crea perfil + 8 materias
      └─ Console: "✅ Nuevo usuario registrado"
   ↓
8. Redirige a dashboard (/)
```

**Ventaja:** Solo crea el perfil si realmente no existe, evitando llamadas innecesarias.

---

### 4. Login con Email/Password (OPTIMIZADO)

```
┌─────────────────────────────────────────────────────────────────┐
│  FLUJO: Login con Email/Password                               │
└─────────────────────────────────────────────────────────────────┘

1. Usuario ingresa email y password
   ↓
2. signInWithEmail(email, password)
   ↓
3. Supabase valida credenciales
   ↓
4. Supabase retorna sesión activa
   ↓
5. getUserProfile() - Verificar si perfil existe
   ├─ GET /auth/profile
   │
   ├─ SI EXISTE (200):
   │  ├─ Console: "✅ Perfil encontrado - Usuario existente"
   │  └─ Retorna perfil
   │
   └─ SI NO EXISTE (404 - primera vez después de confirmar):
      ├─ Console: "⚠️ Perfil no encontrado - Creando perfil nuevo"
      ├─ initializeUserProfile()
      ├─ POST /auth/initialize
      ├─ Backend crea perfil + 8 materias
      └─ Console: "✅ Perfil creado exitosamente"
   ↓
6. Redirige a dashboard (/)
```

**Ventaja:** Solo crea el perfil si realmente no existe, evitando llamadas innecesarias.

---

## 🔍 Debugging

### Console Logs Esperados

#### Registro con confirmación de email:
```javascript
// Al registrarse:
📧 Usuario registrado: { email: "user@example.com", hasSession: false, needsConfirmation: true }
📬 Se requiere confirmación de email - El perfil se creará al confirmar

// Al confirmar y hacer login:
✅ Perfil verificado/inicializado después del login
✅ Nuevo usuario registrado
📚 Progreso inicializado para 8 materias
```

#### Registro sin confirmación:
```javascript
📧 Usuario registrado: { email: "user@example.com", hasSession: true, needsConfirmation: false }
✅ Sesión activa - Inicializando perfil inmediatamente
✅ Nuevo usuario registrado
📚 Progreso inicializado para 8 materias
```

#### Login con Google (nuevo usuario):
```javascript
⚠️ Perfil no encontrado - Inicializando perfil nuevo
✅ Nuevo usuario registrado
📚 Progreso inicializado para 8 materias
📊 Perfil: { id: "...", email: "...", ... }
```

#### Login con Google (usuario existente):
```javascript
👋 Usuario existente - Perfil encontrado
📊 Perfil: { id: "...", email: "...", ... }
```

#### Login con Email (nuevo usuario - primera vez después de confirmar):
```javascript
⚠️ Perfil no encontrado - Creando perfil nuevo
✅ Perfil creado exitosamente
```

#### Login con Email (usuario existente):
```javascript
✅ Perfil encontrado - Usuario existente
```

---

## ⚠️ Casos de Error

### Error: Perfil no se crea

**Síntoma:** Usuario se registra pero no ve su perfil

**Posibles causas:**
1. Backend Flask no está corriendo (puerto 5000)
2. Error de CORS (verificar header Origin)
3. Token JWT inválido
4. Error en la base de datos

**Solución:**
1. Verificar que Flask esté corriendo: `http://localhost:5000/api/v1/health`
2. Revisar console del navegador para ver errores
3. Verificar logs del backend Flask
4. Intentar hacer login nuevamente (se creará el perfil)

### Error: Email not confirmed

**Síntoma:** Usuario intenta hacer login antes de confirmar email

**Solución:**
1. Mostrar mensaje: "Por favor, verifica tu correo electrónico"
2. Ofrecer opción de reenviar email de confirmación
3. Usuario debe confirmar email antes de poder hacer login

---

## 🔧 Configuración de Supabase

### Confirmación de Email

Para **deshabilitar** la confirmación de email (desarrollo):
1. Ir a Supabase Dashboard
2. Authentication → Settings
3. Email Auth → Disable "Enable email confirmations"

Para **habilitar** la confirmación de email (producción):
1. Ir a Supabase Dashboard
2. Authentication → Settings
3. Email Auth → Enable "Enable email confirmations"
4. Configurar SMTP o usar servicio de Supabase

---

## 📊 Resumen de Puntos de Inicialización

| Método de Auth | Momento de Inicialización | Requiere Confirmación |
|----------------|---------------------------|----------------------|
| Google OAuth | Callback `/auth/callback` | ❌ No |
| Email/Password (sin conf.) | Inmediato en `signUpWithEmail` | ❌ No |
| Email/Password (con conf.) | Primer login en `signInWithEmail` | ✅ Sí |

---

**Última actualización:** 2025-01-20
