<script>
    import { onMount } from 'svelte';
    import { user, logout } from '$lib/stores/authStore';
    import { goto } from '$app/navigation';
    import { fade, fly, scale } from 'svelte/transition';
    import { elasticOut } from 'svelte/easing';

    let visible = false;
    let contentVisible = false;

    onMount(() => {
        // Si no hay usuario, redirigir al login
        if (!$user) {
            goto('/cuenta/login');
            return;
        }

        setTimeout(() => {
            visible = true;
            setTimeout(() => contentVisible = true, 300);
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
                            <div class="w-20 h-20 rounded-full bg-gradient-to-r from-red-800 to-red-950 flex items-center justify-center text-white text-3xl font-bold">
                                {$user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h2 class="text-2xl font-bold text-white">{$user.name}</h2>
                                <p class="text-white/70">{$user.email}</p>
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
                            on:click={handleLogout}
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
</style>
