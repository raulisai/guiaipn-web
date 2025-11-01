<script>
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
    import { fade, scale } from 'svelte/transition';

    let sessionId = '';
    let loading = $state(true);

    onMount(() => {
        sessionId = $page.url.searchParams.get('session_id');
        
        if (!sessionId) {
            goto('/cuenta');
            return;
        }

        // TODO: Verificar el pago con Stripe
        // Aquí deberías llamar a tu backend para verificar el session_id
        // y actualizar el plan del usuario en la base de datos

        setTimeout(() => {
            loading = false;
        }, 2000);
    });
</script>

<section class="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-[#030e27]/90 to-black/90 relative overflow-hidden">
    <!-- Partículas animadas de fondo -->
    <div class="particles-container absolute inset-0 overflow-hidden opacity-40"></div>

    <div class="container mx-auto px-4 relative z-10 max-w-2xl">
        {#if loading}
            <div in:fade={{ duration: 500 }} class="text-center">
                <div class="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                <p class="text-white/70 text-lg">Verificando tu pago...</p>
            </div>
        {:else}
            <div in:scale={{ duration: 500 }} class="bg-white/5 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-white/10 shadow-2xl text-center">
                <div class="text-6xl mb-6">🎉</div>
                <h1 class="text-3xl md:text-4xl font-bold text-white/90 mb-4">¡Pago Exitoso!</h1>
                <p class="text-white/70 mb-8">
                    Tu suscripción ha sido activada correctamente. Ya puedes disfrutar de todos los beneficios de tu nuevo plan.
                </p>
                
                <div class="flex flex-col sm:flex-row gap-4 justify-center">
                    <a 
                        href="/cuenta"
                        class="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl font-semibold transition-all hover:scale-105"
                    >
                        Ver mi cuenta
                    </a>
                    <a 
                        href="/home"
                        class="px-6 py-3 bg-white/10 hover:bg-white/15 border border-white/20 text-white rounded-xl font-semibold transition-all"
                    >
                        Ir al inicio
                    </a>
                </div>

                <p class="text-white/50 text-sm mt-8">
                    ID de sesión: {sessionId}
                </p>
            </div>
        {/if}
    </div>
</section>

<style>
    .particles-container {
        background-image: 
            radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(236, 72, 153, 0.05) 0%, transparent 50%);
        animation: particles 20s ease-in-out infinite;
    }
    
    @keyframes particles {
        0%, 100% { opacity: 0.4; }
        50% { opacity: 0.6; }
    }
</style>
