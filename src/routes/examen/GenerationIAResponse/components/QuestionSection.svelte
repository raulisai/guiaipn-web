<script lang="ts">
	export let pregunta: string;
	export let respuestaUsuario: string;
	export let respuestaCorrecta: string;
	export let lengMath: boolean;
	
	import MathForm from '../../componentes/Math.svelte';
</script>

<div
	class="bg-gray-800/60 rounded-xl p-3 sm:p-4 md:p-5 border border-cyan-500/20 mb-4 sm:mb-6 transform hover:scale-[1.01] transition-all duration-300 shadow-lg shadow-cyan-500/10"
>
	<div class="question mb-3 sm:mb-4 break-words md:whitespace-normal relative group">
		<p class="text-cyan-300/90 text-xs sm:text-sm font-semibold mb-1 sm:mb-2 uppercase flex items-center">
			<span class="inline-block w-1.5 sm:w-2 h-1.5 sm:h-2 bg-cyan-400 rounded-full mr-1 sm:mr-2 animate-ping"></span>
			Pregunta
		</p>
		<div
			class="text-white text-secondary bg-gray-900/40 p-2 sm:p-3 rounded-lg border-l-2 border-cyan-400/70 group-hover:border-cyan-400 transition-all duration-300"
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

	<div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
		<div class="transform hover:translate-y-[-2px] transition-all duration-300 group">
			<div
				class="bg-gray-800/80 py-2 sm:py-3 px-3 sm:px-4 rounded-lg border-l-2 border-blue-400/50 group-hover:border-blue-400 transition-all"
			>
				<p class="text-blue-300 text-xs sm:text-sm font-semibold mb-1 sm:mb-2 uppercase flex items-center">
					<span class="inline-block w-1.5 sm:w-2 h-1.5 sm:h-2 bg-blue-400 rounded-full mr-1 sm:mr-2"></span>
					Tu respuesta
				</p>
				<div class="text-gray-100 text-secondary text-sm sm:text-base">
					<MathForm isBlock={false} content={respuestaUsuario} />
				</div>
			</div>
		</div>

		<div class="transform hover:translate-y-[-2px] transition-all duration-300 group">
			<div
				class="bg-gray-800/80 py-2 sm:py-3 px-3 sm:px-4 rounded-lg border-l-2 border-emerald-400/50 group-hover:border-emerald-400 transition-all"
			>
				<p class="text-emerald-300 text-xs sm:text-sm font-semibold mb-1 sm:mb-2 uppercase flex items-center">
					<span class="inline-block w-1.5 sm:w-2 h-1.5 sm:h-2 bg-emerald-400 rounded-full mr-1 sm:mr-2"></span>					Respuesta correcta
				</p>
				<div class="text-gray-100 text-secondary text-sm sm:text-base">
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
