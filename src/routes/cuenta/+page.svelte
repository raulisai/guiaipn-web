<script>
    import { onMount } from 'svelte';
    import { user, logout, authenticatedFetch } from '$lib/stores/authStore';
    import { goto } from '$app/navigation';
    import { fade, fly, scale } from 'svelte/transition';

    let visible = $state(false);
    let currentPlan = $state('free'); // free, standard, premium
    let examsUsed = $state(3);
    let examsLimit = $state(5);
    let loadingCheckout = $state(false);

    // Mock stats - TODO: obtener del backend
    const stats = {
        totalExams: 12,
        passedExams: 8,
        averageScore: 75,
        streak: 5
    };

    onMount(() => {
        if (!$user) {
            goto('/cuenta/login');
            return;
        }
        
        setTimeout(() => {
            visible = true;
        }, 100);
    });

    function handleLogout() {
        logout();
        goto('/');
    }

    async function handleUpgrade(plan) {
        loadingCheckout = true;
        
        try {
            console.log('🚀 Iniciando upgrade a plan:', plan);
            console.log('📦 Datos del usuario:', {
                user_id: $user.id,
                user_email: $user.email
            });

            // Llamar al backend para crear sesión de Stripe usando authenticatedFetch
            const response = await authenticatedFetch('/payments/checkout-session', {
                method: 'POST',
                body: JSON.stringify({
                    plan: plan, // 'standard' o 'premium'
                    user_id: $user.id,
                    user_email: $user.email
                })
            });

            console.log('📡 Respuesta del servidor:', response.status, response.statusText);

            // Verificar si la respuesta es exitosa
            if (!response.ok) {
                let errorData;
                try {
                    errorData = await response.json();
                    console.error('❌ Error del servidor:', errorData);
                } catch (e) {
                    // Si no se puede parsear el JSON, obtener el texto
                    const errorText = await response.text();
                    console.error('❌ Error del servidor (texto):', errorText);
                    throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
                }
                
                throw new Error(errorData.error || errorData.detail || errorData.message || `Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('✅ Datos recibidos:', data);
            
            if (data.url) {
                console.log('🔗 Redirigiendo a Stripe:', data.url);
                // Redirigir a Stripe Checkout
                window.location.href = data.url;
            } else {
                throw new Error('No se recibió URL de checkout de Stripe');
            }
        } catch (error) {
            console.error('💥 Error al crear checkout:', error);
            
            // Mostrar mensaje de error más específico
            const errorMessage = error.message || 'Error al procesar el pago. Intenta de nuevo.';
            alert(`Error al procesar el pago:\n\n${errorMessage}\n\nRevisa la consola para más detalles.`);
        } finally {
            loadingCheckout = false;
        }
    }
</script>

<section class="min-h-screen w-full py-8 md:py-12 bg-gradient-to-b from-[#030e27]/90 to-black/90 relative overflow-x-hidden">
    <!-- Partículas animadas de fondo -->
    <div class="particles-container absolute inset-0 overflow-hidden opacity-40"></div>
    
    {#if visible && $user}
        <div class="container mx-auto px-4 md:px-6 relative z-10 max-w-6xl">
            <!-- Header minimalista -->
            <div in:fade={{ duration: 500 }} class="mb-8 text-center">
                <h1 class="text-2xl md:text-3xl font-semibold text-white/90 mb-2">Mi Cuenta</h1>
                <p class="text-white/50 text-sm">Gestiona tu suscripción y progreso</p>
            </div>
            <!-- Perfil de usuario minimalista -->
            <div in:fade={{ duration: 500, delay: 100 }} class="bg-white/5 backdrop-blur-sm rounded-3xl p-4 md:p-6 border border-white/10 shadow-lg mb-6">
                <div class="flex items-center gap-4">
                    <div class="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl md:text-3xl font-semibold">
                        {#if $user.user_metadata?.avatar_url}
                            <img src={$user.user_metadata.avatar_url} alt={$user.user_metadata?.full_name} class="w-full h-full object-cover" />
                        {:else}
                            {$user.user_metadata?.full_name?.charAt(0).toUpperCase() || $user.email?.charAt(0).toUpperCase() || 'U'}
                        {/if}
                    </div>
                    <div class="flex-1">
                        <h2 class="text-lg md:text-xl font-semibold text-white/90">{$user.user_metadata?.full_name || $user.email?.split('@')[0]}</h2>
                        <p class="text-white/50 text-sm">{$user.email}</p>
                        <div class="flex items-center gap-2 mt-1">
                            <span class="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                                Plan {currentPlan === 'free' ? 'Gratuito' : currentPlan === 'standard' ? 'Estándar' : 'Premium'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Stats gamificados -->
            <div in:fade={{ duration: 500, delay: 200 }} class="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
                <div class="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 hover:shadow-lg transition-all">
                    <div class="text-2xl mb-1">📚</div>
                    <div class="text-white/50 text-xs mb-1">Exámenes</div>
                    <div class="text-white/90 text-xl font-semibold">{stats.totalExams}</div>
                </div>
                <div class="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 hover:shadow-lg transition-all">
                    <div class="text-2xl mb-1">✅</div>
                    <div class="text-white/50 text-xs mb-1">Aprobados</div>
                    <div class="text-green-400/90 text-xl font-semibold">{stats.passedExams}</div>
                </div>
                <div class="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 hover:shadow-lg transition-all">
                    <div class="text-2xl mb-1">📊</div>
                    <div class="text-white/50 text-xs mb-1">Promedio</div>
                    <div class="text-blue-400/90 text-xl font-semibold">{stats.averageScore}%</div>
                </div>
                <div class="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 hover:shadow-lg transition-all">
                    <div class="text-2xl mb-1">🔥</div>
                    <div class="text-white/50 text-xs mb-1">Racha</div>
                    <div class="text-orange-400/90 text-xl font-semibold">{stats.streak} días</div>
                </div>
            </div>

            <!-- Límite de exámenes (solo plan gratuito) -->
            {#if currentPlan === 'free'}
                <div in:fade={{ duration: 500, delay: 250 }} class="bg-gradient-to-r from-orange-500/10 to-red-500/10 backdrop-blur-sm rounded-2xl p-4 border border-orange-500/30 mb-6">
                    <div class="flex items-center justify-between mb-2">
                        <div class="flex items-center gap-2">
                            <span class="text-xl">⚠️</span>
                            <span class="text-white/90 font-semibold text-sm">Exámenes este mes</span>
                        </div>
                        <span class="text-white/90 font-bold">{examsUsed}/{examsLimit}</span>
                    </div>
                    <div class="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                        <div class="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-500" style="width: {(examsUsed / examsLimit) * 100}%"></div>
                    </div>
                    <p class="text-white/60 text-xs mt-2">¡Actualiza tu plan para exámenes ilimitados! 🚀</p>
                </div>
            {/if}
                    
            <!-- Planes de suscripción -->
            <div in:fade={{ duration: 500, delay: 300 }} class="mb-6">
                <h3 class="text-white/90 font-semibold text-base md:text-lg mb-4 text-center">Elige tu plan</h3>
                        
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <!-- Plan Gratuito -->
                    <div class="bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10 hover:shadow-lg transition-all {currentPlan === 'free' ? 'ring-2 ring-blue-500/50' : ''}">
                        <div class="text-center mb-4">
                            <div class="text-3xl mb-2">🆓</div>
                            <h4 class="text-base font-semibold text-white/90 mb-1">Gratuito</h4>
                            <p class="text-2xl font-bold text-white/90">$0<span class="text-sm font-normal text-white/50">/mes</span></p>
                        </div>
                        
                        <ul class="space-y-2 mb-5 text-xs">
                            <li class="flex items-center gap-2 text-white/70">
                                <span class="text-green-400">✓</span>
                                <span>5 exámenes/mes</span>
                            </li>
                            <li class="flex items-center gap-2 text-white/70">
                                <span class="text-green-400">✓</span>
                                <span>Estadísticas básicas</span>
                            </li>
                            <li class="flex items-center gap-2 text-white/40">
                                <span class="text-red-400">✗</span>
                                <span>Material premium</span>
                            </li>
                        </ul>
                        
                        {#if currentPlan === 'free'}
                            <button disabled class="w-full py-2 bg-white/10 text-white/50 rounded-xl text-sm font-medium cursor-not-allowed">
                                Plan Actual
                            </button>
                        {:else}
                            <button class="w-full py-2 bg-white/5 hover:bg-white/10 text-white/70 border border-white/10 rounded-xl text-sm font-medium transition-all">
                                Cambiar
                            </button>
                        {/if}
                    </div>
                    
                    <!-- Plan Estándar -->
                    <div class="bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-blue-500/30 hover:shadow-xl transition-all relative {currentPlan === 'standard' ? 'ring-2 ring-blue-500/50' : ''}">
                        <div class="absolute top-2 right-2 bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-full font-semibold">POPULAR</div>
                        <div class="text-center mb-4">
                            <div class="text-3xl mb-2">⚡</div>
                            <h4 class="text-base font-semibold text-white/90 mb-1">Estándar</h4>
                            <p class="text-2xl font-bold text-white/90">$99<span class="text-sm font-normal text-white/50">/mes</span></p>
                        </div>
                        
                        <ul class="space-y-2 mb-5 text-xs">
                            <li class="flex items-center gap-2 text-white/70">
                                <span class="text-green-400">✓</span>
                                <span>Exámenes ilimitados</span>
                            </li>
                            <li class="flex items-center gap-2 text-white/70">
                                <span class="text-green-400">✓</span>
                                <span>Estadísticas avanzadas</span>
                            </li>
                            <li class="flex items-center gap-2 text-white/70">
                                <span class="text-green-400">✓</span>
                                <span>Material premium</span>
                            </li>
                        </ul>
                        
                        {#if currentPlan === 'standard'}
                            <button disabled class="w-full py-2 bg-white/10 text-white/50 rounded-xl text-sm font-medium cursor-not-allowed">
                                Plan Actual
                            </button>
                        {:else}
                            <button 
                                onclick={() => handleUpgrade('standard')}
                                disabled={loadingCheckout}
                                class="w-full py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl text-sm font-semibold transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loadingCheckout ? 'Procesando...' : 'Actualizar 🚀'}
                            </button>
                        {/if}
                    </div>
                    
                    <!-- Plan Premium -->
                    <div class="bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-purple-500/30 hover:shadow-xl transition-all {currentPlan === 'premium' ? 'ring-2 ring-purple-500/50' : ''}">
                        <div class="text-center mb-4">
                            <div class="text-3xl mb-2">👑</div>
                            <h4 class="text-base font-semibold text-white/90 mb-1">Premium</h4>
                            <p class="text-2xl font-bold text-white/90">$199<span class="text-sm font-normal text-white/50">/mes</span></p>
                        </div>
                        
                        <ul class="space-y-2 mb-5 text-xs">
                            <li class="flex items-center gap-2 text-white/70">
                                <span class="text-green-400">✓</span>
                                <span>Todo de Estándar</span>
                            </li>
                            <li class="flex items-center gap-2 text-white/70">
                                <span class="text-green-400">✓</span>
                                <span>Asesorías 1 a 1</span>
                            </li>
                            <li class="flex items-center gap-2 text-white/70">
                                <span class="text-green-400">✓</span>
                                <span>Contenido exclusivo</span>
                            </li>
                        </ul>
                        
                        {#if currentPlan === 'premium'}
                            <button disabled class="w-full py-2 bg-white/10 text-white/50 rounded-xl text-sm font-medium cursor-not-allowed">
                                Plan Actual
                            </button>
                        {:else}
                            <button 
                                onclick={() => handleUpgrade('premium')}
                                disabled={loadingCheckout}
                                class="w-full py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl text-sm font-semibold transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loadingCheckout ? 'Procesando...' : 'Actualizar 👑'}
                            </button>
                        {/if}
                    </div>
                </div>
            </div>
            
            <!-- Botón de cerrar sesión -->
            <div in:fade={{ duration: 500, delay: 400 }} class="flex justify-center">
                <button 
                    onclick={handleLogout}
                    class="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-red-500/30 rounded-xl text-white/70 hover:text-white text-sm font-medium transition-all"
                >
                    Cerrar sesión
                </button>
            </div>
        </div>
    {/if}
</section>

<style>
    /* Partículas de fondo - igual que home y landing */
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
