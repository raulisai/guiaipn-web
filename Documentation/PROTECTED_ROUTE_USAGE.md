# 🔒 Uso del Componente ProtectedRoute

## Descripción

El componente `ProtectedRoute` es un wrapper reutilizable que protege rutas individuales, verificando la autenticación del usuario antes de mostrar el contenido.

---

## 📦 Ubicación

```
src/lib/components/ProtectedRoute.svelte
```

---

## 🚀 Uso Básico

### Opción 1: Proteger una página completa

```svelte
<!-- src/routes/materias/+page.svelte -->
<script>
    import ProtectedRoute from '$lib/components/ProtectedRoute.svelte';
</script>

<ProtectedRoute>
    <div class="container mx-auto p-8">
        <h1>Materias</h1>
        <p>Este contenido solo es visible para usuarios autenticados</p>
        <!-- Tu contenido aquí -->
    </div>
</ProtectedRoute>
```

### Opción 2: Proteger una sección específica

```svelte
<script>
    import ProtectedRoute from '$lib/components/ProtectedRoute.svelte';
</script>

<div class="container mx-auto p-8">
    <h1>Página Pública</h1>
    <p>Este contenido es visible para todos</p>
    
    <ProtectedRoute>
        <div class="premium-content">
            <h2>Contenido Premium</h2>
            <p>Solo para usuarios autenticados</p>
        </div>
    </ProtectedRoute>
</div>
```

### Opción 3: Redirigir a una ruta personalizada

```svelte
<script>
    import ProtectedRoute from '$lib/components/ProtectedRoute.svelte';
</script>

<ProtectedRoute redirectTo="/cuenta/registro">
    <div class="premium-feature">
        <h1>Función Premium</h1>
        <!-- Contenido protegido -->
    </div>
</ProtectedRoute>
```

---

## 🎨 Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `redirectTo` | `string` | `'/cuenta/login'` | Ruta a la que redirigir si no está autenticado |
| `children` | `Snippet` | - | Contenido a proteger (slot) |

---

## 🔄 Comportamiento

1. **Al cargar:** Muestra un spinner de carga con el mensaje "Verificando acceso..."
2. **Si está autenticado:** Muestra el contenido protegido
3. **Si NO está autenticado:** Redirige a la ruta especificada (default: `/cuenta/login`)

---

## 💡 Protección Global vs Individual

### Protección Global (Layout)
Ya implementada en `src/routes/+layout.svelte`:
- Protege rutas completas: `/progreso`, `/materias`
- Verifica en cada navegación
- Ideal para secciones completas de la app

```javascript
// En +layout.svelte
const protectedRoutes = ['/progreso', '/materias'];
```

### Protección Individual (Componente)
Usa `<ProtectedRoute>`:
- Protege páginas o secciones específicas
- Más flexible y reutilizable
- Ideal para contenido premium dentro de páginas públicas

---

## 📋 Ejemplo Completo

```svelte
<!-- src/routes/cuenta/perfil/+page.svelte -->
<script>
    import ProtectedRoute from '$lib/components/ProtectedRoute.svelte';
    import { user } from '$lib/stores/authStore';
</script>

<ProtectedRoute>
    <div class="min-h-screen bg-gradient-to-b from-[#030e27] to-black p-8">
        <div class="container mx-auto max-w-4xl">
            <h1 class="text-4xl font-bold text-white mb-8">Mi Perfil</h1>
            
            <div class="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                <div class="flex items-center gap-4 mb-6">
                    <div class="w-20 h-20 rounded-full bg-gradient-to-r from-red-800 to-red-950 flex items-center justify-center text-white text-3xl font-bold">
                        {$user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                        <h2 class="text-2xl font-bold text-white">{$user?.name || 'Usuario'}</h2>
                        <p class="text-white/60">{$user?.email || ''}</p>
                    </div>
                </div>
                
                <div class="space-y-4">
                    <div class="border-t border-white/10 pt-4">
                        <h3 class="text-lg font-semibold text-white mb-2">Información de la cuenta</h3>
                        <p class="text-white/80">Plan: <span class="text-cyan-400">Gratuito</span></p>
                        <p class="text-white/80">Créditos restantes: <span class="text-cyan-400">10</span></p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</ProtectedRoute>
```

---

## 🎯 Cuándo Usar Cada Método

### Usa Protección Global (Layout) cuando:
- ✅ Toda la ruta requiere autenticación
- ✅ Es una sección completa de la app (ej: `/progreso`, `/materias`)
- ✅ Quieres proteger múltiples páginas con una sola configuración

### Usa `<ProtectedRoute>` cuando:
- ✅ Solo una parte de la página requiere autenticación
- ✅ Quieres contenido público y privado en la misma página
- ✅ Necesitas redirigir a diferentes rutas según el contexto
- ✅ Quieres un control más granular

---

## 🔍 Debugging

### Console Logs
El componente no genera logs por defecto. Para debug, puedes modificarlo:

```svelte
<script>
    onMount(() => {
        const checkAuth = () => {
            console.log('🔒 Verificando autenticación...');
            console.log('Usuario:', $user);
            
            if (!$user) {
                console.log('❌ No autenticado - Redirigiendo a:', redirectTo);
                goto(redirectTo);
                isAuthorized = false;
            } else {
                console.log('✅ Autenticado - Acceso permitido');
                isAuthorized = true;
            }
            isChecking = false;
        };
        
        checkAuth();
    });
</script>
```

---

## 🚨 Notas Importantes

1. **No reemplaza la seguridad del backend:** Siempre valida la autenticación en el servidor
2. **Evita flash de contenido:** El componente muestra un loading mientras verifica
3. **Compatible con Svelte 5:** Usa runes (`$state`, `$props`)
4. **Reutilizable:** Importa y usa en cualquier página

---

**Última actualización:** 2025-01-20
