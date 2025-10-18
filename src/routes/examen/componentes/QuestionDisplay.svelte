<script lang="ts">
    import { examStore } from "$lib/stores/examStore";
    import CharacterIa from "./CharacterIA.svelte";
    import MathForm from "./Math.svelte";
    import { Eye } from 'lucide-svelte';
    
    export let toggleOptionalImage: () => void;
    
    // Reactive declaration to check if question text is long
    $: isLongQuestion = $examStore.reactivo.pregunta?.length > 80;
</script>

<div class="question-content flex flex-col items-center gap-4 rounded-md">
    <!-- Container for question text - optimized for mobile -->
    <div id="question" class="question-text-container relative w-full px-3 py-4 sm:p-4" >
        <!-- Question text with improved mobile handling -->
        {#if $examStore.reactivo.lengMath !== false}
            <div class="question-text-content" class:long-question={isLongQuestion}>
                <MathForm isBlock={false} content={$examStore.reactivo.pregunta} />
            </div>
        {:else}
            <p class="text-sm sm:text-base leading-relaxed">{$examStore.reactivo.pregunta}</p>
        {/if}
        
        <!-- Image Container - Mobile Optimized -->
        <div class="flex flex-wrap question-imgreference w-full justify-center items-center gap-2 sm:gap-4 min-h-[50px] mt-4">
        {#if $examStore.reactivo.imgAct}
            <!-- Image shown by default if imgAct is true -->
            <img
                src={$examStore.reactivo.pathImg}
                alt={$examStore.reactivo.altIMg}
                class="w-auto h-auto max-w-full max-h-[60vh] object-contain rounded border border-gray-700/30"
            />        {:else if $examStore.reactivo.pathImg}
                <!-- Image is optional (imgAct is false but path exists) -->
                {#if $examStore.showOptionalImage}
                    <!-- Show image if button was clicked -->
                    <img
                        src={$examStore.reactivo.pathImg}
                        alt={$examStore.reactivo.altIMg}
                        class="w-auto h-auto max-w-full max-h-[60vh] object-contain rounded border border-gray-700/30"
                    />
                {:else}
                    <!-- Show button to reveal image -->
                    <button
                        on:click={toggleOptionalImage}
                        class="inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/50 rounded-md text-blue-200 transition text-xs sm:text-sm touch-manipulation"
                        aria-label="Mostrar imagen de referencia"
                    >
                        <Eye size={14} class="sm:size-4" />
                        <span class="hidden sm:inline">Mostrar Imagen reactivo</span>
                        <span class="sm:hidden">Ver Imagen</span>
                    </button>
                {/if}
            {/if}
            <!-- Character and Stats Container - Mobile Optimized -->
            <div class="character-stats-container">
                <!-- Character Mascot -->
                <CharacterIa />
            </div>
        </div>
        
      
    </div>
</div>


<style>
    .question-text-content {
        text-align: center;
        word-wrap: break-word;
        hyphens: auto; /* Better word breaking on mobile */
        line-height: 1.6; /* Improved readability */
    }
    
    /* Apply horizontal scroll for long questions regardless of screen size */
    .long-question {
        overflow-x: auto; /* Enable horizontal scroll */
        padding-bottom: 12px;
        scrollbar-width: thin;
        scrollbar-color: rgba(107, 114, 128, 0.5) transparent;
    }
    
    .long-question::-webkit-scrollbar {
        height: 4px;
    }
    
    .long-question::-webkit-scrollbar-track {
        background: transparent;
    }
    
    .long-question::-webkit-scrollbar-thumb {
        background-color: rgba(107, 114, 128, 0.5);
        border-radius: 20px;
        border: 3px solid transparent;
    }

    .question-imgreference {
        position: relative;
        min-height: 80px;
        margin: 0.75rem 0;
    }

    .question-imgreference img {
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.027);
        /* Better mobile image sizing */
        width: 100%;
        height: auto;
        max-width: 100%;
    }

    /* Enhanced mobile responsiveness */
    @media (max-width: 640px) {
        .question-text-container {
            padding: 0.75rem !important;
        }
        
        .question-text-content {
            font-size: 0.875rem;
            line-height: 1.7;
        }
        
        .long-question {
            overflow-x: auto;
            padding-bottom: 12px;
            scrollbar-width: thin;
            scrollbar-color: rgba(107, 114, 128, 0.5) transparent;
            /* Improve touch scrolling */
            -webkit-overflow-scrolling: touch;
        }
        
        .long-question::-webkit-scrollbar {
            height: 4px;
        }
        
        .character-stats-container {
            margin-left: 0;
            margin-top: 0.75rem;
            transform: scale(0.9); /* Slightly smaller on mobile */
        }
        
        .question-imgreference {
            margin: 0.5rem 0;
            min-height: 60px;
        }
        
        .question-imgreference img {
            max-height: 50vh; /* Limit image height on mobile */
            border-radius: 6px;
        }
    }
    
    /* Ultra small screens (older phones) */
    @media (max-width: 360px) {
        .question-text-container {
            padding: 0.5rem !important;
        }
        
        .question-text-content {
            font-size: 0.8125rem;
        }
        
        .character-stats-container {
            transform: scale(0.8);
        }
    }
    
    @media (min-width: 1920px) {
        .question-imgreference {
            max-width: 80%;
            margin: 2rem auto;
        }
    }
    
    /* Animation for stats chart */
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    
    .character-stats-container {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-left: 1rem;
    }

</style>
