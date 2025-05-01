<script lang="ts">
    import { examStore } from "$lib/stores/examStore";
    import { user } from "$lib/stores/authStore";
    
    export let toggleSolution: () => void;
</script>

<div class="flex justify-between items-center pb-2 border-b border-gray-700/50">
    <div class="flex flex-col">
        <span class="font-semibold text-gray-200">Pregunta {$examStore.reactivo.currentQuestion}</span>
        {#if $user}
            <span class="text-sm text-yellow-400/80">Examen de {$user.name}</span>
        {:else}
            <span class="text-sm text-gray-400/80">Examen de práctica</span>
        {/if}
    </div>
    <!-- Botón switch minimalista para ver cómo resolverlo -->
    <div class="flex justify-end mb-6">
        <div class="relative group">
            <button
                class="w-10 h-6 rounded-full flex items-center transition-colors duration-300 focus:outline-none shadow-md border-2 border-gray-600 hover:border-yellow-400"
                style="background-color: {$examStore.showSolution ? '#fbbf24' : '#374151'};"
                aria-label="Ver cómo resolverlo"
                on:click={toggleSolution}
            >
                <span
                    class="absolute left-1 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-yellow-400 flex items-center justify-center text-gray-900 text-xs transition-transform duration-300"
                    style="transform: translateY(-50%) translateX({$examStore.showSolution
                        ? '1.25rem'
                        : '0'}) scale({$examStore.showSolution
                        ? 1.1
                        : 1}); box-shadow: 0 0 8px rgba(251,191,36,0.5);"
                >
                    <!-- Bombillo minimalista SVG -->
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 20 20"
                        stroke-width="1.5"
                        stroke="currentColor"
                        class="w-3 h-3"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M10 3a5 5 0 00-2 9.584V15a2 2 0 104 0v-2.416A5 5 0 0010 3z"
                        />
                    </svg>
                </span>
            </button>
            <!-- Tooltip creativo -->
            <div
                class="absolute right-0 top-0 mt-8 w-44 p-2 bg-gray-900 text-yellow-300 text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 group-hover:translate-y-0 -translate-y-2 pointer-events-none transition-all duration-300 z-10 select-none"
            >
                ¿ayuda? ¡Haz clic para ver la respuesta al final explicado por IA! 💡
            </div>
        </div>
    </div>
    <!-- Updated badge style: transparent background, light border, adjusted text color -->
    <span
        class="question-badge text-xs font-medium border border-blue-400/30 text-blue-300 px-3 py-1 rounded-full bg-transparent shadow-sm"
    >
        {$examStore.materiaQuestion}
    </span>
</div>
