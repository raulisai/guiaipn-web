<script>
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
    import { supabase } from '$lib/supabase';

    // Este componente solo se carga tras la redirección desde el proveedor OAuth
    onMount(async () => {
        // Procesar el hash de autorización
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
            console.error('Error al procesar el callback de autenticación:', error);
        }
        
        // Redirigir a la página principal después de procesar la autenticación
        goto('/');
    });
</script>

<div class="flex justify-center items-center min-h-screen bg-gradient-to-b from-black/80 via-[#030e28]/90 to-[#030e27]">
    <div class="text-center text-white">
        <h1 class="text-2xl font-bold mb-4">Procesando inicio de sesión</h1>
        <div class="inline-block w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
    </div>
</div>
