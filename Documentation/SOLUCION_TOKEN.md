# 🔧 Solución: Error de Token JWT

## ❌ Problema

```
[8:09:23 p.m.] ❌ Error: No hay token de usuario. Por favor inicia sesión.
```

El usuario estaba autenticado pero el componente no podía acceder al token JWT.

---

## 🔍 Causa Raíz

El store `user` de Supabase solo guarda el objeto `user`, **NO** incluye el token JWT:

```javascript
// ❌ INCORRECTO - user no tiene access_token
export const user = writable(null);

// Al hacer login, solo se guarda:
user.set(session.user); // { id, email, ... } - SIN TOKEN
```

El token JWT está en `session.access_token`, no en `user`:

```javascript
// ✅ CORRECTO - El token está en session
const { data: { session } } = await supabase.auth.getSession();
const token = session.access_token; // Aquí está el JWT
```

---

## ✅ Solución Implementada

### 1. Importar Supabase Client

```javascript
import { supabase } from '$lib/services';
```

### 2. Obtener Token al Montar

```javascript
let userToken = $state(null);

onMount(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        userToken = session.access_token;
        addLog(`🔑 Token obtenido (${session.access_token.substring(0, 20)}...)`, 'success');
    } else {
        addLog('⚠️ No hay sesión activa. Por favor inicia sesión.', 'error');
    }
});
```

### 3. Actualizar Token al Conectar

```javascript
async function connect() {
    // Obtener token actualizado
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
        addLog('❌ Error: No hay token de usuario. Por favor inicia sesión.', 'error');
        addLog('💡 Redirigiendo a login...', 'info');
        setTimeout(() => {
            window.location.href = '/cuenta/login';
        }, 2000);
        return;
    }
    
    userToken = session.access_token;
    
    // Conectar con el token
    await socketService.connect(userToken);
}
```

---

## 📊 Comparación

### ❌ Antes (Incorrecto)

```javascript
// Intentaba acceder a access_token en user
if (!$user?.access_token) {
    // Esto SIEMPRE era undefined
}

await socketService.connect($user.access_token); // undefined
```

### ✅ Después (Correcto)

```javascript
// Obtiene la sesión completa
const { data: { session } } = await supabase.auth.getSession();

if (!session?.access_token) {
    // Ahora sí detecta correctamente
}

await socketService.connect(session.access_token); // JWT válido
```

---

## 🎯 Mejoras Adicionales

### 1. Mostrar Info del Usuario

Agregamos una sección que muestra:
- Email del usuario
- Token JWT (primeros 30 caracteres)
- Alerta si no hay sesión con link a login

```svelte
<div class="bg-gray-800 rounded-lg p-6 mb-6">
    <h2 class="text-2xl font-bold mb-4">👤 Información del Usuario</h2>
    <div class="grid grid-cols-2 gap-4">
        <div>
            <div class="text-sm text-gray-400">Usuario</div>
            <div class="font-mono text-sm">{$user?.email || 'No autenticado'}</div>
        </div>
        <div>
            <div class="text-sm text-gray-400">Token JWT</div>
            <div class="font-mono text-xs">
                {#if userToken}
                    ✅ {userToken.substring(0, 30)}...
                {:else}
                    ❌ No disponible
                {/if}
            </div>
        </div>
    </div>
    {#if !$user}
        <div class="mt-4 p-4 bg-red-900/30 border border-red-500 rounded-lg">
            <p class="text-red-300">⚠️ No hay sesión activa. 
                <a href="/cuenta/login" class="underline hover:text-red-200">
                    Inicia sesión aquí
                </a>
            </p>
        </div>
    {/if}
</div>
```

### 2. Redirección Automática

Si no hay token, redirige automáticamente a login después de 2 segundos:

```javascript
if (!session?.access_token) {
    addLog('❌ Error: No hay token de usuario. Por favor inicia sesión.', 'error');
    addLog('💡 Redirigiendo a login...', 'info');
    setTimeout(() => {
        window.location.href = '/cuenta/login';
    }, 2000);
    return;
}
```

### 3. Log del Token

Al montar, muestra en los logs que el token fue obtenido:

```javascript
addLog(`🔑 Token obtenido (${session.access_token.substring(0, 20)}...)`, 'success');
```

---

## 📝 Patrón Correcto para Otros Componentes

Cuando necesites el token JWT en cualquier componente:

```javascript
import { supabase } from '$lib/services';

// Obtener token
async function getToken() {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token;
}

// Usar en funciones
async function someFunction() {
    const token = await getToken();
    
    if (!token) {
        console.error('No hay token disponible');
        return;
    }
    
    // Usar el token
    await socketService.connect(token);
    await authAPI.initialize(token);
    // etc.
}
```

---

## 🔄 Actualización del useSocket Composable

También debemos actualizar el composable para que funcione correctamente:

```javascript
// src/lib/api/socket/useSocket.js

import { supabase } from '$lib/services';

export function useSocket() {
    async function initialize() {
        // Obtener token de la sesión
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.access_token) {
            throw new Error('No hay sesión activa');
        }
        
        await socketService.connect(session.access_token);
        // ... resto del código
    }
    
    return { initialize, ... };
}
```

---

## ✅ Verificación

Después de la corrección, deberías ver en los logs:

```
[20:15:30] 🔑 Token obtenido (eyJhbGciOiJIUzI1NiIsInR...)
[20:15:35] 🔄 Intentando conectar...
[20:15:36] ✅ Socket conectado exitosamente
[20:15:36] ✅ Conexión establecida
[20:15:36] 📋 Session ID: 550e8400-e29b-41d4-a716-446655440000
```

---

## 🎯 Resumen

**Problema:** `$user` no contiene `access_token`  
**Solución:** Usar `supabase.auth.getSession()` para obtener `session.access_token`  
**Archivos modificados:** `src/routes/test-socket/+page.svelte`  
**Estado:** ✅ Corregido

---

**Fecha:** 2025-01-20  
**Versión:** 1.0.0
