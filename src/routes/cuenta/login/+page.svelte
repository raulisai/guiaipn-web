<script>
    import { onMount } from 'svelte';
    import { login } from '$lib/stores/authStore';
    import { fade, fly } from 'svelte/transition';
    import { elasticOut } from 'svelte/easing';
    import { goto } from '$app/navigation';

    let isLoginMode = true;
    let email = '';
    let password = '';
    let name = '';
    let error = '';
    let loading = false;
    let visible = false;

    onMount(() => {
        setTimeout(() => {
            visible = true;
        }, 100);
    });

    // En un entorno real, esto se conectaría a un backend
    // Aquí simulamos un login básico para demostración
    function handleSubmit() {
        loading = true;
        error = '';

        // Simular una llamada a la API
        setTimeout(() => {
            if (isLoginMode) {
                // Demo: Simular login exitoso con cualquier credencial
                if (email && password) {
                    // Login exitoso
                    login({
                        id: Math.floor(Math.random() * 1000),
                        name: email.split('@')[0], // Usar la parte del email como nombre para demo
                        email: email,
                        isAdmin: email.includes('admin') // Demo: si el email contiene 'admin', darle rol de admin
                    });
                    goto('/');
                } else {
                    error = 'Por favor ingresa email y contraseña';
                }
            } else {
                // Demo: Simular registro exitoso
                if (name && email && password) {
                    // Registro exitoso
                    login({
                        id: Math.floor(Math.random() * 1000),
                        name: name,
                        email: email,
                        isAdmin: false
                    });
                    goto('/');
                } else {
                    error = 'Por favor completa todos los campos';
                }
            }
            loading = false;
        }, 1000);
    }

    function toggleMode() {
        isLoginMode = !isLoginMode;
        error = '';
    }
</script>

<section class="w-full min-h-screen bg-gradient-to-b from-black/80 via-[#030e28]/90 to-[#030e27] py-20">
    <div class="container mx-auto px-6">
        {#if visible}
            <div 
                in:fly={{ y: 50, duration: 800, easing: elasticOut }}
                class="max-w-md mx-auto bg-blue-card backdrop-blur-sm rounded-xl p-8 shadow-xl 
                border border-cyan hover:border-red-300/50 transition-all"
            >
                <h1 class="text-3xl font-bold text-white text-center mb-6">
                    {isLoginMode ? 'Iniciar Sesión' : 'Crear Cuenta'}
                </h1>
                
                <form on:submit|preventDefault={handleSubmit} class="space-y-6">
                    {#if !isLoginMode}
                        <div>
                            <label for="name" class="block text-white mb-2">Nombre</label>
                            <input 
                                type="text" 
                                id="name" 
                                bind:value={name} 
                                class="w-full px-4 py-2 bg-blue-950/50 border border-blue-800 
                                rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                                placeholder="Tu nombre"
                            />
                        </div>
                    {/if}
                    
                    <div>
                        <label for="email" class="block text-white mb-2">Email</label>
                        <input 
                            type="email" 
                            id="email" 
                            bind:value={email} 
                            class="w-full px-4 py-2 bg-blue-950/50 border border-blue-800 
                            rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                            placeholder="correo@ejemplo.com"
                        />
                    </div>
                    
                    <div>
                        <label for="password" class="block text-white mb-2">Contraseña</label>
                        <input 
                            type="password" 
                            id="password" 
                            bind:value={password} 
                            class="w-full px-4 py-2 bg-blue-950/50 border border-blue-800 
                            rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                            placeholder="********"
                        />
                    </div>
                    
                    {#if error}
                        <div 
                            in:fade={{ duration: 300 }}
                            class="p-3 bg-red-900/50 border border-red-800 rounded-lg text-white text-sm"
                        >
                            {error}
                        </div>
                    {/if}
                    
                    <button 
                        type="submit" 
                        class="w-full py-3 bg-gradient-to-r from-red-950 to-red-800 rounded-lg text-white 
                        font-bold hover:from-red-800 hover:to-red-700 transition-all duration-300 
                        flex justify-center items-center"
                        disabled={loading}
                    >
                        {#if loading}
                            <span class="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                        {/if}
                        {isLoginMode ? 'Iniciar Sesión' : 'Crear Cuenta'}
                    </button>
                    
                    <div class="text-center text-white/70">
                        <button 
                            type="button" 
                            on:click={toggleMode} 
                            class="text-red-400 hover:text-red-300 font-medium"
                        >
                            {isLoginMode ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
                        </button>
                    </div>
                </form>
            </div>
        {/if}
    </div>
</section>

<style>
    /* Estilos adicionales pueden ir aquí */
    .bg-blue-card {
        background: #0b1a32a3;
    }
</style>
