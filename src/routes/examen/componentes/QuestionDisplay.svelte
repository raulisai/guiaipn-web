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
    <!-- Container for question text - enables horizontal scroll on mobile -->
    <div id="question" class="question-text-container relative w-full p-4" class:long-question={isLongQuestion}>
        <!-- Inner div to handle nowrap -->
        <div class="question-text-content" class:long-question-content={isLongQuestion}>
            <MathForm isBlock={false} content={$examStore.reactivo.pregunta} />
        </div>
    </div>

    <!-- Image Container - Conditional Display -->
    <div class="flex question-imgreference w-full justify-center items-center min-h-[50px]">
        {#if $examStore.reactivo.imgAct}
            <!-- Image shown by default if imgAct is true -->
            <img
                src={$examStore.reactivo.pathImg}
                alt={$examStore.reactivo.altIMg}
                class="w-auto h-auto max-w-full max-h-[60vh] object-contain rounded border border-gray-700/30"
            />
        {:else if $examStore.reactivo.pathImg}
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
                    class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/50 rounded-md text-blue-200 transition text-sm"
                    aria-label="Mostrar imagen de referencia"
                >
                    <Eye size={16} />
                    Mostrar Imagen reactivo
                </button>
            {/if}
        {/if}
       <CharacterIa />
    </div>
</div>

<style>
    .question-text-content {
        text-align: center; /* Center text on larger screens */
        word-wrap: break-word; /* Ensure long words wrap */
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
    
    .long-question-content {
        white-space: nowrap;
        display: inline-block;
        min-width: 100%;
        text-align: left;
    }

    .question-imgreference {
        position: relative;
        min-height: 100px; /* Altura mínima preventiva */
        margin: 1rem 0;
    }

    .question-imgreference img {
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.027);
    }

    /* Apply horizontal scroll only on small screens for regular-length questions */
    @media (max-width: 640px) {
        .question-text-container:not(.long-question) {
            overflow-x: auto; /* Enable horizontal scroll */
            /* Add some padding for scrollbar visibility if needed */
            padding-bottom: 12px;
            /* Optional: Style the scrollbar for webkit browsers */
            scrollbar-width: thin; /* Firefox */
            scrollbar-color: rgba(107, 114, 128, 0.5) transparent; /* Firefox */
        }
        .question-text-container:not(.long-question)::-webkit-scrollbar {
            height: 4px; /* Height of horizontal scrollbar */
        }
        .question-text-container:not(.long-question)::-webkit-scrollbar-track {
            background: transparent; /* Track background */
        }
        .question-text-container:not(.long-question)::-webkit-scrollbar-thumb {
            background-color: rgba(107, 114, 128, 0.5); /* Scrollbar color */
            border-radius: 20px; /* Roundness of the scrollbar */
            border: 3px solid transparent; /* Creates padding around scroll thumb */
        }

        .question-text-content:not(.long-question-content) {
            white-space: nowrap; /* Prevent text wrapping */
            display: inline-block; /* Necessary for nowrap */
            min-width: 100%; /* Ensure it takes at least the container width */
            text-align: left; /* Align text left when scrolling */
        }
    }

    @media (min-width: 1920px) {
        .question-imgreference {
            max-width: 80%;
            margin: 2rem auto;
        }
    }
</style>
