<script>
    // Esto se ejecuta en el lado del cliente (browser)
    import '../app.css';
    import { supabase } from '$lib/supabase';
    import { onMount } from 'svelte';
    import { user, logout } from '$lib/stores/authStore';
    import { page } from '$app/stores';;
    import { goto, invalidate } from '$app/navigation';

   

    let menuBtn;
    let activo = $state(false);
    let scrolled = $state(false);
    let isHovered = $state(false);
    let { children } = $props();
    
    // Rutas protegidas que requieren autenticación
    const protectedRoutes = ['/progreso', '/materias'];
    
    // Verificar si la ruta actual requiere autenticación
    let isProtectedRoute = $derived(protectedRoutes.some(route => $page.url.pathname.startsWith(route)));
    
    $effect(() => {
        if (isProtectedRoute && !$user) {
            // Redirigir al login si intenta acceder a una ruta protegida sin estar autenticado
            goto('/cuenta/login');
        }
    });

    function toogleMenu() {
        activo = !activo;
    }

    function handleMouseEnter() {
        isHovered = true;
    }

    function handleMouseLeave() {
        isHovered = false;
    }
    
    function handleLogout() {
        logout();
        goto('/');
        activo = false;
    }

    onMount(() => {
        // Handle click outside menu
        function handleClickOutside(event) {
            if (menuBtn && !menuBtn.contains(event.target)) {
                activo = false;
            }
        }

        // Handle scroll to shrink nav
        function handleScroll() {
            scrolled = window.scrollY > 30;
        }

        document.addEventListener('click', handleClickOutside);
        window.addEventListener('scroll', handleScroll);

        // Escuchar cambios en la autenticación de Supabase
        const {
            data: { subscription }
        } = supabase.auth.onAuthStateChange(() => {
            // Cuando el estado de autenticación cambia, invalidamos los datos de layout
            // para que SvelteKit actualice las rutas según sea necesario
            invalidate('supabase:auth');
        });

        return () => {
            document.removeEventListener('click', handleClickOutside);
            window.removeEventListener('scroll', handleScroll);
            subscription.unsubscribe();
        };
    });
</script>

<!-- Menú flotante mejorado con efecto de scroll y hover -->
<!-- svelte-ignore a11y_no_redundant_roles -->
<nav
    role="banner"
    class={`fixed top-0 left-0 right-0 z-30 transition-all duration-300 ease-in-out
                ${scrolled ? 'py-2 bg-black/80 shadow-lg' : 'py-4 bg-transparent'}`}
    onmouseenter={handleMouseEnter}
    onmouseleave={handleMouseLeave}
>
    <div class="container mx-auto flex justify-between items-center px-4">
        <a href="/" class="flex items-center">
            <img
                src="logoipnburrito.png"
                alt="Logo de la guia del IPN"
                class={`transition-all duration-300 ease-in-out
                            ${scrolled && !isHovered ? 'w-[90px]' : 'w-[110px]'}
                            ${isHovered ? 'scale-115' : 'scale-90'}`}
                loading="lazy"
                width="150"
                height="40"
            />
        </a>

        <div class="relative">
            <button
                id="menuBtn"
                bind:this={menuBtn}
                onclick={toogleMenu}
                aria-labelledby="menuBtn"
                aria-haspopup="true"
                class={`rounded-full backdrop-blur-md transition-all duration-300 text-white border border-white/10 
                           flex items-center justify-center group relative overflow-hidden 
                           ${scrolled && !isHovered ? 'w-8 h-8 p-2' : 'w-10 h-10 p-2.5'} 
                           ${isHovered ? 'bg-white/20 shadow-lg shadow-white/20' : 'bg-white/10 shadow-md'}`}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    class={`transform transition-all duration-300 ${isHovered ? 'scale-110' : 'scale-100'}`}
                >
                    <line x1="4" y1="8" x2="20" y2="8" stroke-width="2" stroke-linecap="round"></line>
                    <line x1="4" y1="16" x2="20" y2="16" stroke-width="2" stroke-linecap="round"></line>
                    <line x1="9" y1="12" x2="20" y2="12" stroke-width="2" stroke-linecap="round"></line>
                </svg>
                <div
                    class="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500/20 to-purple-500/10
                                opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                ></div>
            </button>			
            <div
                class={`absolute right-0 mt-2 w-64 backdrop-blur-md border border-white/10
                            rounded-lg shadow-lg py-2 transition-all duration-300
                            ${scrolled ? 'bg-black/50' : 'bg-white/20'}
                            ${activo ? 'menu-visible' : 'menu-hidden'}`}
            >
                {#if $user}
                    <div class="px-4 py-3 border-b border-white/10">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-full bg-gradient-to-r from-red-800 to-red-950 flex items-center justify-center text-white font-bold">
                                {$user.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div>
                                <p class="text-white font-medium">{$user.name}</p>
                                <p class="text-white/60 text-sm">{$user.email}</p>
                            </div>
                        </div>
                    </div>
                {/if}
                
                <a href="/" class="block px-4 py-2 text-white hover:bg-white/10 transition-colors">Inicio</a>
                
                <!-- Mostrar enlaces protegidos solo si está autenticado -->
                {#if $user}
                    <a href="/materias" class="block px-4 py-2 text-white hover:bg-white/10 transition-colors">
                        Materias
                    </a>
                    <a href="/progreso" class="block px-4 py-2 text-white hover:bg-white/10 transition-colors">
                        Mi Progreso
                    </a>
                {/if}
                
                <a href="/examen" class="block px-4 py-2 text-white hover:bg-white/10 transition-colors">
                    Exámenes
                </a>
                
                {#if $user}
                    <a href="/cuenta" class="block px-4 py-2 text-white hover:bg-white/10 transition-colors">
                        Configuración
                    </a>
                    <button 
                        onclick={handleLogout}
                        class="w-full text-left px-4 py-2 text-red-400 hover:bg-white/10 transition-colors"
                    >
                        Cerrar Sesión
                    </button>
                {:else}
                    <a href="/cuenta/login" class="block px-4 py-2 text-white hover:bg-white/10 transition-colors">
                        Iniciar Sesión
                    </a>
                {/if}
            </div>
        </div>
    </div>
</nav>

<!-- Mejorar legibilidad en móviles -->
<main class="prose prose-invert max-w-none md:prose-lg bg-gradient-to-b from-[#030e27]/90 to-black/90">
    {@render children()}
</main>



<style>
    .menu-hidden {
        display: none;
        opacity: 0;
        transform: translateY(-10px);
    }
    .menu-visible {
        display: block;
        opacity: 1;
        transform: translateY(0);
    }
    @media (max-width: 768px) {
        .menu-hidden {
            display: none;
            opacity: 0;
            transform: translateY(-10px);
        }
        .menu-visible {
            display: block;
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    /* Estilos para contenido de usuario en nav */
    .user-avatar {
        background: linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%);
        transition: all 0.3s ease;
    }
    
    .user-avatar:hover {
        transform: scale(1.05);
        box-shadow: 0 0 15px rgba(255, 100, 100, 0.2);
    }
</style>
