<script lang="ts">
	export let pregunta: string;
	export let respuestaUsuario: string;
	export let respuestaCorrecta: string;
	export let lengMath: boolean;
	
	import MathForm from '../../componentes/Math.svelte';
</script>

<div>
	<div class="question mb-4 break-words md:whitespace-normal relative">
		<p class="text-gray-300 text-xs sm:text-sm font-semibold mb-2 uppercase flex items-center">
			<span class="inline-block w-1.5 sm:w-2 h-1.5 sm:h-2 bg-gray-400 rounded-full mr-2"></span>
			Pregunta
		</p>
		<div
			class="text-white text-secondary bg-gray-800/20 p-3 rounded-lg border-l-2 border-gray-500/50"
		>
			{#if lengMath}
				<div class="question-text-content" class:long-question={lengMath}>
					<MathForm isBlock={false} content={pregunta} />
				</div>
			{:else}
				<p class="text-sm sm:text-base">{pregunta}</p>
			{/if}
		</div>
	</div>

	<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
		<div>
			<div
				class="bg-gray-800/20 p-3 rounded-lg border-l-2 border-gray-500/50"
			>
				<p class="text-gray-300 text-xs sm:text-sm font-semibold mb-2 uppercase flex items-center">
					<span class="inline-block w-1.5 sm:w-2 h-1.5 sm:h-2 bg-gray-400 rounded-full mr-2"></span>
					Tu respuesta
				</p>
				<div class="text-gray-200 text-secondary text-sm sm:text-base">
					<MathForm isBlock={false} content={respuestaUsuario} />
				</div>
			</div>
		</div>

		<div>
			<div
				class="bg-gray-800/20 p-3 rounded-lg border-l-2 border-gray-500/50"
			>
				<p class="text-gray-300 text-xs sm:text-sm font-semibold mb-2 uppercase flex items-center">
					<span class="inline-block w-1.5 sm:w-2 h-1.5 sm:h-2 bg-gray-400 rounded-full mr-2"></span>
					Respuesta correcta
				</p>
				<div class="text-gray-200 text-secondary text-sm sm:text-base">
					<MathForm isBlock={false} content={respuestaCorrecta} />
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	/* Apply horizontal scroll for long questions regardless of screen size */
    .long-question {
        overflow-x: auto; /* Enable horizontal scroll */
        padding-bottom: 8px;
        scrollbar-width: thin;
        scrollbar-color: rgba(107, 114, 128, 0.5) transparent;
    }
    
    .long-question::-webkit-scrollbar {
        height: 3px;
    }
    
    .long-question::-webkit-scrollbar-track {
        background: transparent;
    }
    
    .long-question::-webkit-scrollbar-thumb {
        background-color: rgba(107, 114, 128, 0.5);
        border-radius: 20px;
        border: 2px solid transparent;
    }
</style>
