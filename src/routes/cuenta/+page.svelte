<script>
    import { onMount } from 'svelte';
    import { user, logout } from '$lib/stores/authStore';
    import { goto } from '$app/navigation';
    import { fade, fly, scale } from 'svelte/transition';
    import { elasticOut } from 'svelte/easing';

    let visible = false;
    let contentVisible = false;
    let debugInfo = { hasUser: false, userData: null };

    onMount(() => {
        //console.log("Estado inicial del usuario:", $user);
        debugInfo.hasUser = !!$user;
        debugInfo.userData = $user;
        
        // Si no hay usuario, redirigir al login
        if (!$user) {
            goto('/cuenta/login');
            return;
        }

        setTimeout(() => {
            visible = true;
            contentVisible = true;

           
        }, 100);
    });

    function handleLogout() {
        logout();
        goto('/');
    }
</script>

<section class="min-h-screen w-full py-20 bg-gradient-to-b from-[#030e27] via-[#030e28]/70 to-black/60 backdrop-blur-2xl relative">
    <!-- Elementos decorativos flotantes -->
    <div class="floating-element floating-1"></div>
    <div class="floating-element floating-2"></div>
    
    {#if visible}
        <div class="container mx-auto px-6 relative z-10">
            <div in:fly={{ y: 50, duration: 800, easing: elasticOut }} class="mb-12">
                <h1 class="text-4xl font-bold text-white text-center mb-3">Mi Cuenta</h1>
                <p class="text-white/80 text-center max-w-3xl mx-auto">
                    Gestiona tus datos personales y ajusta tus preferencias
                </p>
            </div>
            
            {#if contentVisible && $user}
                <div class="max-w-4xl mx-auto">
                    <div 
                        in:fade={{ duration: 500 }}
                        class="bg-blue-card backdrop-blur-sm rounded-xl p-8 shadow-lg shadow-blue-900/20 
                        border border-cyan hover:border-red-300/50 transition-all mb-8"
                    >
                        <div class="flex items-center gap-6 mb-6 pb-6 border-b border-white/10">
                            <div class="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-r from-red-800 to-red-950 flex items-center justify-center text-white text-3xl font-bold">
                                {#if $user.user_metadata?.avatar_url}
                                    <img src={$user.user_metadata.avatar_url} alt={$user.name} class="w-full h-full object-cover" />
                                {:else}
                                    {$user.name?.charAt(0).toUpperCase() || 'U'}
                                {/if}
                            </div>
                            <div>
                                <h2 class="text-2xl font-bold text-white">{$user.user_metadata?.full_name || $user.name}</h2>
                                <p class="text-white/70">{$user.email}</p>
                                <p class="text-white/50 text-sm mt-1">Miembro desde: {new Date($user.created_at).toLocaleDateString()}</p>
                                {#if $user.isAdmin}
                                    <span class="inline-block mt-2 px-3 py-1 text-xs font-medium bg-red-900/50 text-red-200 rounded-full">
                                        Administrador
                                    </span>
                                {/if}
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <!-- Estadísticas del usuario -->
                            <div class="bg-white/5 rounded-lg p-6">
                                <h3 class="text-xl font-semibold text-white mb-4">Mis Estadísticas</h3>
                                
                                <div class="space-y-4">
                                    <div>
                                        <div class="flex justify-between mb-1">
                                            <span class="text-white/80">Exámenes completados</span>
                                            <span class="text-white font-medium">8</span>
                                        </div>
                                        <div class="w-full bg-gray-800 rounded-full h-2">
                                            <div class="bg-gradient-to-r from-red-950 to-red-800 h-2 rounded-full" style="width: 80%"></div>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <div class="flex justify-between mb-1">
                                            <span class="text-white/80">Promedio de aciertos</span>
                                            <span class="text-white font-medium">75%</span>
                                        </div>
                                        <div class="w-full bg-gray-800 rounded-full h-2">
                                            <div class="bg-gradient-to-r from-red-950 to-red-800 h-2 rounded-full" style="width: 75%"></div>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <div class="flex justify-between mb-1">
                                            <span class="text-white/80">Tiempo promedio</span>
                                            <span class="text-white font-medium">45 min</span>
                                        </div>
                                        <div class="w-full bg-gray-800 rounded-full h-2">
                                            <div class="bg-gradient-to-r from-red-950 to-red-800 h-2 rounded-full" style="width: 55%"></div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="mt-6">
                                    <a href="/progreso" class="text-red-400 hover:text-red-300 font-medium flex items-center">
                                        Ver estadísticas detalladas 
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                                            <path fill-rule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
                                        </svg>
                                    </a>
                                </div>
                            </div>
                            
                            <!-- Preferencias -->
                            <div class="bg-white/5 rounded-lg p-6">
                                <h3 class="text-xl font-semibold text-white mb-4">Preferencias</h3>
                                
                                <div class="space-y-4">
                                    <div class="flex items-center justify-between">
                                        <span class="text-white/80">Notificaciones por email</span>
                                        <div class="relative inline-block w-10 h-6">
                                            <input type="checkbox" id="toggle1" class="sr-only" checked>
                                            <label for="toggle1" class="block w-10 h-6 rounded-full bg-red-950 cursor-pointer"></label>
                                            <span class="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 transform translate-x-4"></span>
                                        </div>
                                    </div>
                                    
                                    <div class="flex items-center justify-between">
                                        <span class="text-white/80">Modo oscuro</span>
                                        <div class="relative inline-block w-10 h-6">
                                            <input type="checkbox" id="toggle2" class="sr-only" checked>
                                            <label for="toggle2" class="block w-10 h-6 rounded-full bg-red-950 cursor-pointer"></label>
                                            <span class="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 transform translate-x-4"></span>
                                        </div>
                                    </div>
                                    
                                    <div class="flex items-center justify-between">
                                        <span class="text-white/80">Recordatorios de estudio</span>
                                        <div class="relative inline-block w-10 h-6">
                                            <input type="checkbox" id="toggle3" class="sr-only">
                                            <label for="toggle3" class="block w-10 h-6 rounded-full bg-gray-700 cursor-pointer"></label>
                                            <span class="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 transform"></span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="mt-6">
                                    <button class="text-red-400 hover:text-red-300 font-medium">
                                        Guardar cambios
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Nueva sección de planes de pago -->
                    <div 
                        in:fade={{ duration: 500, delay: 150 }}
                        class="bg-blue-card backdrop-blur-sm rounded-xl p-8 shadow-lg shadow-blue-900/20 
                        border border-cyan hover:border-red-300/50 transition-all mb-8"
                    >
                        <h3 class="text-xl font-semibold text-white mb-6">Planes de Suscripción</h3>
                        
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <!-- Plan Gratuito -->
                            <div class="bg-white/5 rounded-lg p-6 border border-white/10 hover:border-red-500/30 transition-all relative overflow-hidden">
                                <div class="absolute -top-6 -right-6 w-12 h-12 bg-gradient-to-br from-blue-900 to-blue-700 rotate-12"></div>
                                <h4 class="text-lg font-bold text-white mb-2">Gratuito</h4>
                                <p class="text-3xl font-bold text-white mb-4">$0 <span class="text-sm font-normal text-white/70">/mes</span></p>
                                
                                <ul class="space-y-2 mb-6">
                                    <li class="flex items-start gap-2 text-white/80 text-sm">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                                        </svg>
                                        <span>5 exámenes mensuales</span>
                                    </li>
                                    <li class="flex items-start gap-2 text-white/80 text-sm">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                                        </svg>
                                        <span>Estadísticas básicas</span>
                                    </li>
                                    <li class="flex items-start gap-2 text-white/40 text-sm line-through">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-700 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                                        </svg>
                                        <span>Acceso a material premium</span>
                                    </li>
                                </ul>
                                
                                <button class="w-full py-2 bg-white/10 text-white border border-white/20 rounded-lg hover:bg-white/20 transition-colors">
                                    Plan actual
                                </button>
                            </div>
                            
                            <!-- Plan Estándar -->
                            <div class="bg-white/5 rounded-lg p-6 border border-red-500/30 hover:border-red-500/70 transition-all relative overflow-hidden transform hover:scale-105 duration-300">
                                <div class="absolute -top-6 -right-6 w-20 h-20 bg-gradient-to-br from-red-900 to-red-700 rotate-12"></div>
                                <div class="absolute top-0 right-0 bg-red-600 text-white text-xs px-3 py-1 font-bold">POPULAR</div>
                                <h4 class="text-lg font-bold text-white mb-2">Estándar</h4>
                                <p class="text-3xl font-bold text-white mb-4">$99 <span class="text-sm font-normal text-white/70">/mes</span></p>
                                
                                <ul class="space-y-2 mb-6">
                                    <li class="flex items-start gap-2 text-white/80 text-sm">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                                        </svg>
                                        <span>Exámenes ilimitados</span>
                                    </li>
                                    <li class="flex items-start gap-2 text-white/80 text-sm">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                                        </svg>
                                        <span>Estadísticas avanzadas</span>
                                    </li>
                                    <li class="flex items-start gap-2 text-white/80 text-sm">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                                        </svg>
                                        <span>Acceso a material premium</span>
                                    </li>
                                </ul>
                                
                                <button class="w-full py-2 bg-gradient-to-r from-red-950 to-red-800 text-white rounded-lg hover:from-red-800 hover:to-red-700 transition-colors">
                                    Actualizar Plan
                                </button>
                            </div>
                            
                            <!-- Plan Premium -->
                            <div class="bg-white/5 rounded-lg p-6 border border-white/10 hover:border-red-500/30 transition-all relative overflow-hidden">
                                <div class="absolute -top-6 -right-6 w-12 h-12 bg-gradient-to-br from-purple-900 to-purple-700 rotate-12"></div>
                                <h4 class="text-lg font-bold text-white mb-2">Premium</h4>
                                <p class="text-3xl font-bold text-white mb-4">$199 <span class="text-sm font-normal text-white/70">/mes</span></p>
                                
                                <ul class="space-y-2 mb-6">
                                    <li class="flex items-start gap-2 text-white/80 text-sm">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                                        </svg>
                                        <span>Todo lo del plan Estándar</span>
                                    </li>
                                    <li class="flex items-start gap-2 text-white/80 text-sm">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                                        </svg>
                                        <span>Asesorías personalizadas</span>
                                    </li>
                                    <li class="flex items-start gap-2 text-white/80 text-sm">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                                        </svg>
                                        <span>Contenido exclusivo</span>
                                    </li>
                                </ul>
                                
                                <button class="w-full py-2 bg-white/10 text-white border border-white/20 rounded-lg hover:bg-white/20 transition-colors">
                                    Actualizar Plan
                                </button>
                            </div>
                        </div>
                        
                        <div class="mt-6 text-center">
                            <p class="text-white/70 text-sm">
                                Los cambios en los planes de suscripción se aplicarán inmediatamente.
                                <a href="/cuenta/facturacion" class="text-red-400 hover:text-red-300">Ver historial de facturación</a>
                            </p>
                        </div>
                    </div>
                    
                    <!-- Sección de seguridad -->
                    <div 
                        in:fade={{ duration: 500, delay: 200 }}
                        class="bg-blue-card backdrop-blur-sm rounded-xl p-8 shadow-lg shadow-blue-900/20 
                        border border-cyan hover:border-red-300/50 transition-all mb-8"
                    >
                        <h3 class="text-xl font-semibold text-white mb-6">Seguridad de la cuenta</h3>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label for="current-password" class="block text-white mb-2">Contraseña actual</label>
                                <input 
                                    type="password"
                                    id="current-password"
                                    class="w-full px-4 py-2 bg-blue-950/50 border border-blue-800 
                                    rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                                    placeholder="••••••••"
                                />
                            </div>
                            
                            <div>
                                <label for="new-password" class="block text-white mb-2">Nueva contraseña</label>
                                <input 
                                    type="password"
                                    id="new-password"
                                    class="w-full px-4 py-2 bg-blue-950/50 border border-blue-800 
                                    rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                        
                        <div class="mt-6 flex justify-end">
                            <button class="px-4 py-2 bg-gradient-to-r from-red-950 to-red-800 rounded-lg text-white 
                            hover:from-red-800 hover:to-red-700 transition-all duration-300">
                                Actualizar contraseña
                            </button>
                        </div>
                    </div>
                    
                    <!-- Botones de acción -->
                    <div class="flex justify-between">
                        <button 
                            onclick={handleLogout}
                            in:scale={{ duration: 500, delay: 300 }}
                            class="px-6 py-2 bg-red-900/50 border border-red-800/50 rounded-lg text-white 
                            hover:bg-red-900/70 transition-all duration-300"
                        >
                            Cerrar sesión
                        </button>
                        
                        <button 
                            in:scale={{ duration: 500, delay: 300 }}
                            class="px-6 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white/70 
                            hover:bg-gray-700/50 hover:text-white transition-all duration-300"
                        >
                            Eliminar cuenta
                        </button>
                    </div>
                </div>
            {/if}
        </div>
    {/if}
</section>

<style>
    /* Estilos para elementos flotantes y efectos visuales */
    .floating-element {
        position: absolute;
        background: radial-gradient(circle, rgba(153, 27, 27, 0.2) 0%, rgba(127, 29, 29, 0.1) 70%, transparent 100%);
        border-radius: 50%;
        z-index: 1;
    }
    
    .floating-1 {
        width: 400px;
        height: 400px;
        top: 10%;
        right: 5%;
        animation: floating 20s ease-in-out infinite, glow 10s infinite alternate;
    }
    
    .floating-2 {
        width: 300px;
        height: 300px;
        bottom: 15%;
        left: 5%;
        animation: floating 25s ease-in-out 2s infinite, glow 12s infinite 2s alternate;
    }
    
    @keyframes floating {
        0% { transform: translate(0, 0) rotate(0deg); }
        25% { transform: translate(5%, 5%) rotate(5deg); }
        50% { transform: translate(0%, 10%) rotate(0deg); }
        75% { transform: translate(-5%, 5%) rotate(-5deg); }
        100% { transform: translate(0, 0) rotate(0deg); }
    }
    
    @keyframes glow {
        0% { opacity: 0.5; }
        100% { opacity: 0.8; }
    }
    
    .bg-blue-card {
        background: #0b1a32a3;
    }
    
    /* Estilos para los toggles */
    input:checked + label {
        background-color: #991b1b;
    }
    
    input:checked + label + span {
        transform: translate(1.35rem, 0);
    }
    
    /* New styles for the button hover effect */
    button:hover {
        background-color: #ff4757; /* Change to a brighter red on hover */
    }
</style>
