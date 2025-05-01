<script>
    import { onMount } from 'svelte';
    import { logout } from '$lib/stores/authStore';
    import { goto } from '$app/navigation';

    onMount(async () => {
        try {
            await logout();
            goto('/cuenta/login');
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        }
    });
</script>

<div class="flex justify-center items-center min-h-screen bg-gradient-to-b from-black/80 via-[#030e28]/90 to-[#030e27]">
    <div class="text-center text-white">
        <h1 class="text-2xl font-bold mb-4">Cerrando sesión</h1>
        <div class="inline-block w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
    </div>
</div>
