<script lang="ts">
    import { examStore } from "$lib/stores/examStore";
    import MathForm from "./Math.svelte";
    
    export let selectOption: (key: string) => void;
</script>

<div class="answer-options-container grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-6 sm:mt-8 w-full">
    {#each $examStore.reactivo.opciones as respuesta}
        <button
            class="answer-option group w-full p-3 sm:p-4 text-left rounded-lg transition-all duration-200
                   bg-gray-800/20 hover:bg-gray-700/30 active:bg-gray-600/40 focus:outline-none focus:ring-2
                   focus:ring-blue-500/40 border border-gray-700/50 hover:border-gray-600/70
                   touch-manipulation min-h-[60px] sm:min-h-[50px]"
            on:click={() => selectOption(respuesta.key)}
            id="btn-{respuesta.key}"
            aria-label="Respuesta {respuesta.key}"
        >
            <div class="flex items-start gap-3 sm:gap-4">
                <span
                    class="answer-key flex-shrink-0 w-7 h-7 sm:w-6 sm:h-6 flex items-center justify-center
                         bg-gray-700/50 group-hover:bg-blue-600/30 group-active:bg-blue-600/50 rounded-full 
                         text-sm font-medium text-gray-200 transition-all duration-200 group-hover:scale-110"
                >
                    {respuesta.key}
                </span>
                <div class="answer-text flex-1 text-gray-200 text-sm sm:text-base leading-relaxed">
                    {#if $examStore.reactivo.lengMathOpciones === true}
                        <MathForm isBlock={false} content={respuesta.value} />
                    {:else}
                        <span>{respuesta.value}</span>
                    {/if}
                </div>
            </div>
        </button>
    {/each}
</div>

<style>
    .answer-options-container {
        /* Better touch targets for mobile */
        --min-touch-target: 44px;
    }
    
    .answer-option {
        /* Enhanced mobile interaction */
        -webkit-tap-highlight-color: rgba(59, 130, 246, 0.1);
        user-select: none;
        -webkit-user-select: none;
        position: relative;
        overflow: hidden;
    }
    
    .answer-option::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.1), transparent);
        transition: left 0.5s;
    }
    
    .answer-option:hover::before {
        left: 100%;
    }
    
    .answer-key {
        /* Smoother animations */
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .answer-text {
        word-wrap: break-word;
        hyphens: auto;
        overflow-wrap: break-word;
    }
    
    /* Mobile-specific optimizations */
    @media (max-width: 640px) {
        .answer-options-container {
            gap: 0.75rem;
            margin-top: 1.25rem;
        }
        
        .answer-option {
            padding: 1rem 0.875rem;
            border-radius: 0.5rem;
            min-height: 64px; /* Better touch target */
            font-size: 0.9rem;
        }
        
        .answer-key {
            width: 1.875rem;
            height: 1.875rem;
            font-weight: 600;
        }
        
        .answer-text {
            font-size: 0.875rem;
            line-height: 1.5;
        }
    }
    
    /* Very small screens */
    @media (max-width: 360px) {
        .answer-options-container {
            gap: 0.625rem;
        }
        
        .answer-option {
            padding: 0.875rem 0.75rem;
            min-height: 60px;
        }
        
        .answer-key {
            width: 1.75rem;
            height: 1.75rem;
            font-size: 0.8125rem;
        }
        
        .answer-text {
            font-size: 0.8125rem;
            line-height: 1.4;
        }
    }
    
    /* Landscape mode on mobile */
    @media (max-width: 896px) and (orientation: landscape) {
        .answer-options-container {
            margin-top: 1rem;
            gap: 0.5rem;
        }
        
        .answer-option {
            padding: 0.75rem;
            min-height: 52px;
        }
    }
    
    /* Dark mode enhancements */
    @media (prefers-color-scheme: dark) {
        .answer-option {
            border-color: rgba(75, 85, 99, 0.6);
        }
        
        .answer-option:hover {
            border-color: rgba(75, 85, 99, 0.8);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }
    }
</style>
