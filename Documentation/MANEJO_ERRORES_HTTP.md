# 🚨 Manejo de Errores HTTP

## ✅ Implementación Completada

### Características

1. **Timeout Configurable** ⏱️
   - Default: 30 segundos
   - Configurable por petición
   - Usa `AbortController` para cancelar

2. **Clasificación de Errores** 🏷️
   - `HTTP_ERROR`: Errores 4xx, 5xx
   - `TIMEOUT_ERROR`: Petición excedió tiempo límite
   - `NETWORK_ERROR`: Sin conexión, CORS, etc.

3. **Logging Detallado** 📝
   - Emojis para identificación rápida
   - Tiempo de respuesta
   - Detalles del error
   - Solo en desarrollo para peticiones exitosas

4. **Errores Estructurados** 📦
   - Objetos de error consistentes
   - Información útil para debugging
   - Fácil de manejar en componentes

---

## 📊 Tipos de Errores

### 1. HTTP_ERROR (4xx, 5xx)

**Cuándo ocurre:**
- 400 Bad Request
- 401 Unauthorized
- 404 Not Found
- 500 Internal Server Error
- Etc.

**Estructura:**
```javascript
{
  type: 'HTTP_ERROR',
  status: 404,
  message: 'Perfil no encontrado',
  endpoint: '/auth/profile',
  responseTime: 245,
  data: { /* respuesta del servidor */ }
}
```

**Console Log:**
```
❌ HTTP Error [404] en /auth/profile: {
  message: 'Perfil no encontrado',
  time: '245ms',
  data: { error: 'Profile not found' }
}
```

---

### 2. TIMEOUT_ERROR

**Cuándo ocurre:**
- La petición tarda más de 30 segundos (default)
- Backend no responde a tiempo

**Estructura:**
```javascript
{
  type: 'TIMEOUT_ERROR',
  message: 'La petición excedió el tiempo límite de 30000ms',
  endpoint: '/auth/profile',
  timeout: 30000
}
```

**Console Log:**
```
⏱️ Timeout en /auth/profile: {
  message: 'La petición excedió el tiempo límite de 30000ms',
  endpoint: '/auth/profile',
  timeout: 30000
}
```

---

### 3. NETWORK_ERROR

**Cuándo ocurre:**
- Sin conexión a internet
- Backend no está corriendo
- Error de CORS
- DNS no resuelve

**Estructura:**
```javascript
{
  type: 'NETWORK_ERROR',
  message: 'Error de red. Verifica tu conexión a internet.',
  endpoint: '/auth/profile',
  originalError: 'Failed to fetch'
}
```

**Console Log:**
```
🚫 Error de red en /auth/profile: {
  message: 'Error de red. Verifica tu conexión a internet.',
  endpoint: '/auth/profile',
  originalError: 'Failed to fetch'
}
```

---

## 🎯 Uso en Componentes

### Manejo Básico

```javascript
import { authAPI } from '$lib/api';

try {
  const profile = await authAPI.getProfile(token);
  console.log('Perfil obtenido:', profile);
} catch (error) {
  // Manejar según el tipo de error
  switch (error.type) {
    case 'HTTP_ERROR':
      if (error.status === 404) {
        console.log('Perfil no encontrado');
      } else if (error.status === 401) {
        console.log('No autorizado');
      }
      break;
      
    case 'TIMEOUT_ERROR':
      console.log('La petición tardó demasiado');
      break;
      
    case 'NETWORK_ERROR':
      console.log('Verifica tu conexión a internet');
      break;
      
    default:
      console.log('Error desconocido');
  }
}
```

### Con Timeout Personalizado

```javascript
// Timeout de 10 segundos para esta petición específica
try {
  const profile = await authAPI.getProfile(token, { timeout: 10000 });
} catch (error) {
  console.error('Error:', error);
}
```

### Mostrar Mensajes al Usuario

```svelte
<script>
  import { authAPI } from '$lib/api';
  
  let errorMessage = $state('');
  let loading = $state(false);
  
  async function loadProfile() {
    loading = true;
    errorMessage = '';
    
    try {
      const profile = await authAPI.getProfile(token);
      // Usar el perfil
    } catch (error) {
      // Mostrar mensaje amigable al usuario
      switch (error.type) {
        case 'HTTP_ERROR':
          errorMessage = error.message;
          break;
        case 'TIMEOUT_ERROR':
          errorMessage = 'La petición está tardando demasiado. Intenta de nuevo.';
          break;
        case 'NETWORK_ERROR':
          errorMessage = 'No hay conexión a internet. Verifica tu red.';
          break;
        default:
          errorMessage = 'Ocurrió un error inesperado.';
      }
    } finally {
      loading = false;
    }
  }
</script>

{#if errorMessage}
  <div class="bg-red-500/20 border border-red-500 rounded-lg p-4 text-white">
    {errorMessage}
  </div>
{/if}
```

---

## ⚙️ Configuración

### Cambiar Timeout Global

```javascript
// En src/lib/api.js
const DEFAULT_TIMEOUT = 60000; // 60 segundos
```

### Timeout por Endpoint

```javascript
// Timeout corto para health check
export const healthAPI = {
  check: async () => {
    return request('/health', {
      method: 'GET',
      timeout: 5000  // 5 segundos
    });
  }
};
```

---

## 📈 Logs en Desarrollo

### Petición Exitosa
```
✅ /auth/profile - 245ms
```

### Error HTTP
```
❌ HTTP Error [404] en /auth/profile: {
  message: 'Perfil no encontrado',
  time: '245ms',
  data: { error: 'Profile not found' }
}
```

### Timeout
```
⏱️ Timeout en /auth/profile: {
  message: 'La petición excedió el tiempo límite de 30000ms',
  endpoint: '/auth/profile',
  timeout: 30000
}
```

### Error de Red
```
🚫 Error de red en /auth/profile: {
  message: 'Error de red. Verifica tu conexión a internet.',
  endpoint: '/auth/profile',
  originalError: 'Failed to fetch'
}
```

---

## 🔍 Debugging

### Verificar Tipo de Error

```javascript
try {
  await authAPI.getProfile(token);
} catch (error) {
  console.log('Tipo:', error.type);
  console.log('Mensaje:', error.message);
  console.log('Error completo:', error);
}
```

### Simular Timeout

```javascript
// Timeout muy corto para testing
try {
  await authAPI.getProfile(token, { timeout: 1 }); // 1ms
} catch (error) {
  console.log('Timeout simulado:', error.type === 'TIMEOUT_ERROR');
}
```

---

## 🚫 Retry Automático (No Implementado)

**Por qué no está implementado:**
- Mantiene el código simple (principio KISS)
- La mayoría de errores requieren acción del usuario
- Puede causar carga innecesaria en el servidor
- Los componentes pueden implementar retry si lo necesitan

**Si necesitas retry:**
```javascript
async function fetchWithRetry(fn, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      if (error.type === 'NETWORK_ERROR') {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      } else {
        throw error; // No reintentar errores HTTP
      }
    }
  }
}

// Uso
const profile = await fetchWithRetry(() => authAPI.getProfile(token));
```

---

## ✅ Checklist

- [x] Timeout configurable (30s default)
- [x] Clasificación de errores (HTTP, TIMEOUT, NETWORK)
- [x] Logging detallado con emojis
- [x] Errores estructurados
- [x] Tiempo de respuesta en logs
- [x] AbortController para cancelación
- [x] Logs solo en desarrollo para éxitos
- [ ] Retry automático (no necesario para MVP)

---

**Última actualización:** 2025-01-20
