<script lang="ts">
    import { examStore } from "$lib/stores/examStore";
    import MathForm from "./Math.svelte";
    
    export let selectOption: (key: string) => void;
</script>

<div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8 w-full">
    {#each $examStore.reactivo.opciones as respuesta}
        <button
            class="group w-full p-3 sm:p-4 text-left rounded-md transition-all duration-200
                   bg-gray-800/20 hover:bg-gray-700/30 focus:outline-none focus:ring-2
                   focus:ring-blue-500/40 border border-gray-700/50 hover:border-gray-600/70"
            on:click={() => selectOption(respuesta.key)}
            id="btn-{respuesta.key}"
            aria-label="Respuesta {respuesta.key}"
        >
            <div class="flex items-start gap-3">
                <span
                    class="flex-shrink-0 w-6 h-6 flex items-center justify-center
                         bg-gray-700/50 group-hover:bg-blue-600/30 rounded-full text-sm font-medium
                         text-gray-200 transition-colors"
                >
                    {respuesta.key}
                </span>
                <div class="text-gray-200 text-sm sm:text-base">
                    <MathForm isBlock={false} content={respuesta.value} />
                </div>
            </div>
        </button>
    {/each}
</div>
