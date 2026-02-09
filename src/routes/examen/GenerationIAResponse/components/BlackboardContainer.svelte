<script>
    import { onMount } from 'svelte';
    import { fade } from 'svelte/transition';

    export let title = "Explicación";
</script>

<div class="blackboard-container relative w-full h-full flex flex-col items-center justify-start p-4 sm:p-6 overflow-hidden">
    <!-- Marco del pizarrón -->
    <div class="blackboard-frame relative w-full max-w-6xl flex flex-col bg-gray-900 rounded-lg shadow-2xl border-8 border-amber-900/80 overflow-hidden">
        
        <!-- Header del pizarrón -->
        <div class="blackboard-header bg-gray-800/90 w-full px-6 py-3 flex items-center justify-between border-b border-gray-700/50">
            <h2 class="text-xl sm:text-2xl font-serif text-gray-200 tracking-wider" style="font-family: 'Indie Flower', cursive, serif;">
                {title}
            </h2>
            <div class="flex space-x-2">
                <div class="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div class="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                <div class="w-3 h-3 rounded-full bg-green-500/80"></div>
            </div>
        </div>

        <!-- Superficie del pizarrón -->
        <div class="blackboard-surface relative flex-1 w-full bg-[#1a1c22] p-6 overflow-y-auto custom-scrollbar">
            <!-- Textura de tiza (opcional, sutil) -->
            <div class="absolute inset-0 opacity-5 pointer-events-none" 
                 style="background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiAvPgo8L3N2Zz4='); background-size: 2px 2px;">
            </div>

            <!-- Contenido principal (Slot) -->
            <div class="relative z-10 w-full h-full flex flex-col gap-6" in:fade={{ duration: 400 }}>
                <slot />
            </div>
        </div>

        <!-- Bandeja de tizas (decorativo inferior) -->
        <div class="chalk-tray h-4 bg-amber-900/90 w-full border-t border-amber-950/50 shadow-inner flex items-center justify-center gap-4 px-10">
            <div class="w-16 h-2 bg-white/80 rounded-sm transform -rotate-1 shadow-sm"></div>
            <div class="w-12 h-2 bg-yellow-200/80 rounded-sm transform rotate-2 shadow-sm"></div>
            <div class="w-20 h-3 bg-gray-700/60 rounded-md ml-auto shadow-sm"></div> <!-- Borrador -->
        </div>
    </div>
</div>

<style>
    /* Fuente estilo mano/tiza si está disponible, fallback a serif */
    @import url('https://fonts.googleapis.com/css2?family=Indie+Flower&display=swap');

    .blackboard-frame {
        box-shadow: 
            0 20px 50px -12px rgba(0, 0, 0, 0.9),
            0 0 0 1px rgba(69, 39, 16, 0.4); /* Borde sutil madera oscura */
        min-height: 80vh; /* Altura mínima considerable */
    }

    .blackboard-surface {
        background-color: #2b3a42; /* Color pizarra verde/azulado muy oscuro */
        background-image: 
            radial-gradient(circle at 50% 50%, rgba(255,255,255,0.02) 0%, transparent 60%),
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
        background-size: 100% 100%, 40px 40px, 40px 40px;
        box-shadow: inset 0 0 50px rgba(0,0,0,0.5);
    }

    /* Scrollbar personalizado estilo tiza/pizarra */
    .custom-scrollbar::-webkit-scrollbar {
        width: 10px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
        background: rgba(0,0,0,0.2);
        border-radius: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
        background: rgba(255,255,255,0.15);
        border-radius: 4px;
        border: 2px solid rgba(0,0,0,0.1);
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: rgba(255,255,255,0.25);
    }
</style>
