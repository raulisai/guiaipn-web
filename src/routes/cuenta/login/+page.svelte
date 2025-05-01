<script>
    import { onMount } from 'svelte';
    import { signInWithEmail, signUpWithEmail, signInWithGoogle } from '$lib/stores/authStore';
    import { fade, fly, scale } from 'svelte/transition';
    import { elasticOut, backOut, quartOut } from 'svelte/easing';
    import { goto } from '$app/navigation';
    import { supabase } from '$lib/supabase';

    let isLoginMode = true;
    let email = '';
    let password = '';
    let name = '';
    let error = '';
    let loading = false;
    let visible = false;
    let showConfirmationMessage = false;

    onMount(() => {
        setTimeout(() => {
            visible = true;
        }, 100);

        // Verificar si ya hay una sesión activa
        supabase.auth.getSession().then(({ data }) => {
            if (data.session) {
                goto('/');
            }
        });
    });

    async function handleSubmit(event) {
        event.preventDefault();
        loading = true;
        error = '';

        try {
            if (isLoginMode) {
                // Inicio de sesión con email/contraseña
                await signInWithEmail(email, password);
                goto('/');
            } else {
                // Registro con email/contraseña
                if (!name) {
                    throw new Error('Por favor ingresa tu nombre');
                }
                await signUpWithEmail(email, password, name);
                showConfirmationMessage = true;
                // No redirigimos inmediatamente para mostrar el mensaje de confirmación
            }
        } catch (e) {
            console.error(e);
            error = e.message || 'Error al procesar la solicitud';
        } finally {
            loading = false;
        }
    }

    async function handleGoogleLogin() {
        loading = true;
        error = '';

        try {
            await signInWithGoogle();
            // La redirección se maneja automáticamente por Supabase OAuth
        } catch (e) {
            console.error(e);
            error = e.message || 'Error al iniciar sesión con Google';
            loading = false;
        }
    }

    function toggleMode() {
        isLoginMode = !isLoginMode;
        error = '';
        showConfirmationMessage = false;
    }
</script>

<section class="w-full min-h-screen bg-gradient-to-b from-black/80 via-[#030e28]/90 to-[#030e27] py-10 md:py-20 flex items-center justify-center px-4">
    <div class="container mx-auto">
        {#if visible}
            <div 
                in:fly={{ y: 50, duration: 800, easing: elasticOut }}
                class="max-w-md mx-auto bg-blue-card backdrop-blur-sm rounded-xl p-6 md:p-8 shadow-2xl 
                border border-cyan hover:border-red-300/50 transition-all duration-500
                transform hover:scale-[1.01] hover:shadow-red-500/10"
            >
                <h1 
                    in:scale={{ duration: 400, delay: 300, easing: quartOut }}
                    class="text-3xl font-bold text-white text-center mb-8 bg-gradient-to-r from-white to-cyan-200 
                    bg-clip-text text-transparent drop-shadow-lg"
                >
                    {isLoginMode ? 'Iniciar Sesión' : 'Crear Cuenta'}
                </h1>
                
                {#if showConfirmationMessage}
                    <div 
                        in:fly={{ y: -20, duration: 400, easing: backOut }}
                        class="p-4 mb-6 bg-green-900/40 border border-green-700 rounded-lg text-white text-sm
                        backdrop-blur-sm shadow-inner flex items-start space-x-3"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                        </svg>
                        <div>
                            <p class="font-medium text-green-300 mb-1">¡Registro completado!</p>
                            <p>Hemos enviado un correo de confirmación a <span class="font-medium text-cyan-300">{email}</span>. Por favor, verifica tu bandeja de entrada y confirma tu cuenta para continuar.</p>
                        </div>
                    </div>
                {:else}
                    <form on:submit={handleSubmit} class="space-y-5">
                        {#if !isLoginMode}
                            <div 
                                in:fly={{ y: 10, duration: 300, delay: 100 }}
                                out:fade={{ duration: 200 }}
                            >
                                <label for="name" class="block text-white mb-2 font-medium">Nombre</label>
                                <input 
                                    type="text" 
                                    id="name" 
                                    bind:value={name} 
                                    class="w-full px-4 py-3 bg-blue-950/50 border border-blue-800 
                                    rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500
                                    transition-all duration-300 placeholder:text-blue-400/60"
                                    placeholder="Tu nombre completo"
                                />
                            </div>
                        {/if}
                        
                        <div 
                            in:fly={{ y: 10, duration: 300, delay: 150 }}
                        
                        >
                            <label for="email" class="block text-white mb-2 font-medium">Email</label>
                            <input 
                                type="email" 
                                id="email" 
                                bind:value={email} 
                                class="w-full px-4 py-3 bg-blue-950/50 border border-blue-800 
                                rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500
                                transition-all duration-300 placeholder:text-blue-400/60"
                                placeholder="correo@ejemplo.com"
                            />
                        </div>
                        
                        <div 
                            in:fly={{ y: 10, duration: 300, delay: 200 }}
                            
                        >
                            <label for="password" class="block text-white mb-2 font-medium">Contraseña</label>
                            <input 
                                type="password" 
                                id="password" 
                                bind:value={password} 
                                class="w-full px-4 py-3 bg-blue-950/50 border border-blue-800 
                                rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500
                                transition-all duration-300 placeholder:text-blue-400/60"
                                placeholder="********"
                            />
                        </div>
                        
                        {#if error}
                            <div 
                                in:fade={{ duration: 300 }}
                                class="p-4 bg-red-900/50 border border-red-800 rounded-lg text-white text-sm
                                backdrop-blur-sm shadow-inner"
                            >
                                <p class="font-medium text-red-300 mb-1">Error:</p>
                                <p>{error}</p>
                            </div>
                        {/if}
                        
                        <button 
                            type="submit" 
                            class="w-full py-3 bg-gradient-to-r from-red-950 to-red-800 rounded-lg text-white 
                            font-bold hover:from-red-800 hover:to-red-700 transition-all duration-300 
                            flex justify-center items-center shadow-lg hover:shadow-red-700/20
                            transform hover:translate-y-[-1px] active:translate-y-[1px]"
                            disabled={loading}
                        >
                            {#if loading}
                                <span class="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                            {/if}
                            {isLoginMode ? 'Iniciar Sesión' : 'Crear Cuenta'}
                        </button>

                        <div class="relative flex items-center justify-center my-6">
                            <div class="flex-grow h-px bg-white/20"></div>
                            <span class="mx-4 text-white/60 text-sm">O</span>
                            <div class="flex-grow h-px bg-white/20"></div>
                        </div>

                        <button 
                            type="button"
                            on:click={handleGoogleLogin}
                            class="w-full py-3 bg-white rounded-lg text-gray-800 font-medium
                            hover:bg-gray-100 transition-all duration-300 flex justify-center items-center
                            shadow-lg hover:shadow-white/20 transform hover:translate-y-[-1px]"
                            disabled={loading}
                        >
                            <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Continuar con Google
                        </button>
                    </form>
                {/if}
                
                <div class="text-center text-white/70 mt-6">
                    <button 
                        type="button" 
                        on:click={toggleMode} 
                        class="text-red-400 hover:text-red-300 font-medium transition-colors duration-300
                        hover:underline underline-offset-2"
                    >
                        {isLoginMode ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
                    </button>
                </div>
            </div>
        {/if}
    </div>
</section>

<style>
    .bg-blue-card {
        background: rgba(11, 26, 50, 0.8);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    }
    
    /* Agregar una animación sutil de resplandor */
    @keyframes subtle-glow {
        0% { box-shadow: 0 0 10px rgba(0, 102, 255, 0.1); }
        50% { box-shadow: 0 0 15px rgba(0, 102, 255, 0.2); }
        100% { box-shadow: 0 0 10px rgba(0, 102, 255, 0.1); }
    }
    
    .bg-blue-card {
        animation: subtle-glow 4s infinite;
    }
</style>
