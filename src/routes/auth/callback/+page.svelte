<script>
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
    import { supabase } from '$lib/services';
    import { initializeUserProfile, getUserProfile } from '$lib/stores/authStore';

    let status = 'Procesando inicio de sesión...';
    let isError = false;

    // Este componente solo se carga tras la redirección desde el proveedor OAuth
    onMount(async () => {
        try {
            // Procesar el hash de autorización
            const { data, error } = await supabase.auth.getSession();
            
            if (error) {
                console.error('Error al procesar el callback de autenticación:', error);
                status = 'Error al procesar la autenticación';
                isError = true;
                setTimeout(() => goto('/cuenta/login'), 3000);
                return;
            }

            // Si hay sesión, verificar/inicializar el perfil en el backend
            if (data?.session) {
                status = 'Verificando tu perfil...';
                
                try {
                    // Primero intentar obtener el perfil existente
                    let profile = null;
                    try {
                        profile = await getUserProfile();
                        console.log('👋 Usuario existente - Perfil encontrado');
                        console.log('📊 Perfil:', profile);
                        status = '¡Bienvenido de nuevo!';
                    } catch (profileError) {
                        // Si el perfil no existe (404), crearlo
                        if (profileError.status === 404) {
                            console.log('⚠️ Perfil no encontrado - Inicializando perfil nuevo');
                            status = 'Creando tu perfil...';
                            
                            const result = await initializeUserProfile();
                            
                            if (result.isNewUser) {
                                status = '¡Bienvenido! Perfil creado exitosamente';
                                console.log('✅ Nuevo usuario registrado');
                                console.log(`📚 Progreso inicializado para ${result.progressInitialized} materias`);
                                console.log('📊 Perfil:', result.profile);
                            }
                        } else {
                            // Otro tipo de error
                            throw profileError;
                        }
                    }
                } catch (profileError) {
                    console.error('❌ Error al verificar/inicializar perfil:', profileError);
                    // Continuar aunque falle la inicialización del perfil
                    // El perfil se puede crear después
                    status = 'Perfil pendiente de configuración';
                }
            }
            
            // Redirigir a la página principal después de 1.5 segundos
            setTimeout(() => goto('/'), 1500);
        } catch (error) {
            console.error('Error inesperado:', error);
            status = 'Error inesperado';
            isError = true;
            setTimeout(() => goto('/cuenta/login'), 3000);
        }
    });
</script>

<div class="flex justify-center items-center min-h-screen bg-gradient-to-b from-black/80 via-[#030e28]/90 to-[#030e27]">
    <div class="text-center text-white">
        <h1 class="text-2xl font-bold mb-4">{status}</h1>
        {#if !isError}
            <div class="inline-block w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        {:else}
            <p class="text-red-400 mt-4">Redirigiendo al login...</p>
        {/if}
    </div>
</div>
