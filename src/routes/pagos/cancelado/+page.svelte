<script>
    import { fade, scale } from 'svelte/transition';
</script>

<section class="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-[#030e27]/90 to-black/90 relative overflow-hidden">
    <!-- Partículas animadas de fondo -->
    <div class="particles-container absolute inset-0 overflow-hidden opacity-40"></div>

    <div class="container mx-auto px-4 relative z-10 max-w-2xl">
        <div in:scale={{ duration: 500 }} class="bg-white/5 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-white/10 shadow-2xl text-center">
            <!-- Icono de cancelación -->
            <div class="mb-6">
                <div class="text-6xl mb-2">😔</div>
            </div>
            
            <h1 class="text-3xl md:text-4xl font-bold text-white/90 mb-4">Pago Cancelado</h1>
            <p class="text-white/70 text-lg mb-2">
                No te preocupes, no se realizó ningún cargo.
            </p>
            <p class="text-white/60 mb-8">
                Puedes intentar nuevamente cuando estés listo.
            </p>
            
            <!-- Razones comunes -->
            <div class="bg-white/5 rounded-2xl p-6 mb-8 text-left">
                <h3 class="text-white/90 font-semibold mb-4 text-center">¿Por qué cancelar?</h3>
                <ul class="space-y-3 text-sm">
                    <li class="flex items-start gap-3 text-white/60">
                        <span class="text-white/40">•</span>
                        <span>Si tuviste problemas con el pago, puedes intentar con otra tarjeta</span>
                    </li>
                    <li class="flex items-start gap-3 text-white/60">
                        <span class="text-white/40">•</span>
                        <span>Aún puedes usar el plan gratuito con 5 exámenes al mes</span>
                    </li>
                    <li class="flex items-start gap-3 text-white/60">
                        <span class="text-white/40">•</span>
                        <span>Actualiza cuando estés listo, sin presión</span>
                    </li>
                </ul>
            </div>
            
            <!-- Recordatorio de beneficios -->
            <div class="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl p-6 mb-8 border border-blue-500/20">
                <h3 class="text-white/90 font-semibold mb-3 text-sm">Con un plan premium obtendrías:</h3>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div class="text-center">
                        <div class="text-2xl mb-1">♾️</div>
                        <div class="text-white/70">Exámenes ilimitados</div>
                    </div>
                    <div class="text-center">
                        <div class="text-2xl mb-1">📊</div>
                        <div class="text-white/70">Stats avanzadas</div>
                    </div>
                    <div class="text-center">
                        <div class="text-2xl mb-1">🎓</div>
                        <div class="text-white/70">Material premium</div>
                    </div>
                </div>
            </div>
            
            <div class="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                    href="/cuenta"
                    class="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl font-semibold transition-all hover:scale-105"
                >
                    Intentar nuevamente
                </a>
                <a 
                    href="/home"
                    class="px-6 py-3 bg-white/10 hover:bg-white/15 border border-white/20 text-white rounded-xl font-semibold transition-all"
                >
                    Volver al inicio
                </a>
            </div>

            <p class="text-white/50 text-xs mt-8">
                ¿Necesitas ayuda? <a href="/soporte" class="text-blue-400 hover:text-blue-300 underline">Contáctanos</a>
            </p>
        </div>
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
