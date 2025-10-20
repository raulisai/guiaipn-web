<script>
    import { goto } from '$app/navigation';
    import { user } from '$lib/stores/authStore';
    import { onMount } from 'svelte';
    
    let { children, redirectTo = '/cuenta/login' } = $props();
    
    let isChecking = $state(true);
    let isAuthorized = $state(false);
    
    onMount(() => {
        // Verificar autenticación
        const checkAuth = () => {
            if (!$user) {
                // No autenticado - redirigir
                goto(redirectTo);
                isAuthorized = false;
            } else {
                // Autenticado - permitir acceso
                isAuthorized = true;
            }
            isChecking = false;
        };
        
        // Verificar inmediatamente
        checkAuth();
    });
</script>

{#if isChecking}
    <!-- Loading state mientras verifica autenticación -->
    <div class="flex justify-center items-center min-h-screen bg-gradient-to-b from-black/80 via-[#030e28]/90 to-[#030e27]">
        <div class="text-center text-white">
            <div class="inline-block w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
            <p class="text-lg">Verificando acceso...</p>
        </div>
    </div>
{:else if isAuthorized}
    <!-- Usuario autenticado - mostrar contenido -->
    {@render children()}
{/if}
