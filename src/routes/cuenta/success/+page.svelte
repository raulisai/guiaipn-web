<script>
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';

    let countdown = $state(5);

    onMount(() => {
        const interval = setInterval(() => {
            countdown -= 1;
            if (countdown <= 0) {
                clearInterval(interval);
                goto('/cuenta');
            }
        }, 1000);

        return () => clearInterval(interval);
    });
</script>

<section class="min-h-screen bg-gradient-to-b from-black/80 via-[#030e28]/90 to-[#030e27] text-white flex items-center justify-center px-4">
    <div class="max-w-lg w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 text-center shadow-2xl">
        <div class="text-5xl mb-4">🎉</div>
        <h1 class="text-3xl font-semibold mb-3">¡Suscripción completada!</h1>
        <p class="text-white/70 mb-6">
            Gracias por confiar en nosotros. Tu plan ha sido activado correctamente.
            Serás redirigido a tu panel de cuenta en {countdown} segundos.
        </p>
        <button
            class="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-xl font-semibold transition-all"
            onclick={() => goto('/cuenta')}
        >
            Ir a mi cuenta ahora →
        </button>
    </div>
</section>
