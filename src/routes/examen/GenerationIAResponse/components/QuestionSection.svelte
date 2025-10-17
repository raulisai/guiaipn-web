<script lang="ts">
	const { pregunta, respuestaUsuario, respuestaCorrecta, lengMath } = $props<{
		pregunta: string;
		respuestaUsuario: string;
		respuestaCorrecta: string;
		lengMath: boolean;
	}>();
	
	import MathForm from '../../componentes/Math.svelte';
	import { slide } from 'svelte/transition'; // Import slide transition
	import { onMount } from 'svelte'; // Import onMount lifecycle function
	

   let isMinimized: boolean = $state(false); // State for minimizing

	function toggleMinimize() {
		isMinimized = !isMinimized;
	}


	onMount(() => {
		setTimeout(() => {
			isMinimized = true;
		}, 5000);
	});
	

</script>

<!-- Single container with animation -->
<div
	class="bg-gray-800/10 p-3 rounded border-l-2 border-gray-600/50 space-y-3 animate-fade-in transition-all duration-300 ease-in-out {isMinimized ? 'pb-2' : 'pb-3'}"
>
	<!-- Question Section Header with Toggle -->
	<div class="flex justify-between items-center">
		<p class="text-gray-400 text-xs font-medium uppercase flex items-center">
			<!-- Yellow indicator -->
			<span class="inline-block w-1 h-1 bg-yellow-500 rounded-full mr-1.5"></span>
			Pregunta
		</p>
		<button
			onclick={toggleMinimize}
			class="flex items-center justify-center rounded-full p-1.5 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/20 shadow-sm hover:shadow-md hover:shadow-yellow-500/30 transition-all duration-300 transform hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-yellow-500/40"
			aria-label={isMinimized ? 'Expandir pregunta' : 'Minimizar pregunta'}
		>
			<!-- Enhanced Chevron with Animation -->
			<span 
				class="transition-all duration-300 inline-block {isMinimized ? 'rotate-180' : ''} 
					   animate-pulse-subtle text-lg font-bold"
			>
				▲
			</span>
		</button>
	</div>

	<!-- Question Content -->
	<div class="text-gray-100">
		{#if lengMath}
			<div class="question-text-content" class:long-question={lengMath}>
				<MathForm isBlock={false} content={pregunta} />
			</div>
		{:else}
			<p class="text-sm">{pregunta}</p>
		{/if}
	</div>

	<!-- Conditionally Rendered Answers Section with Transition -->
	{#if !isMinimized}
		<div class="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1" transition:slide|local={{ duration: 300 }}>
			<!-- User Answer -->
			<div>
				<p class="text-gray-400 text-xs font-medium mb-1 uppercase flex items-center">
					<!-- Wine/Rose indicator -->
					<span class="inline-block w-1 h-1 bg-rose-500 rounded-full mr-1.5"></span>
					Tu respuesta
				</p>
				<!-- Wine/Rose text color -->
				<div class="text-rose-300 text-sm">
					<MathForm isBlock={false} content={respuestaUsuario} />
				</div>
			</div>

			<!-- Correct Answer -->
			<div>
				<p class="text-gray-400 text-xs font-medium mb-1 uppercase flex items-center">
					<!-- Green indicator (no change) -->
					<span class="inline-block w-1 h-1 bg-green-500 rounded-full mr-1.5"></span>
					Respuesta correcta
				</p>
				<!-- Green text color (no change) -->
				<div class="text-green-300 text-sm font-medium">
					<MathForm isBlock={false} content={respuestaCorrecta} />
				</div>
			</div>
		</div>
	{/if}
</div>

<style>


/* Add this to your existing style block */
			.animate-pulse-subtle {
				animation: pulse-subtle 2s infinite;
			}
			
			@keyframes pulse-subtle {
				0%, 100% { opacity: 1; }
				50% { opacity: 0.7; }
			}
    /* Fade-in animation */
    .animate-fade-in {
        opacity: 0;
        animation: fadeIn 0.5s ease-out forwards;
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(5px); /* Optional: slight upward movement */
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

	/* Apply horizontal scroll for long questions regardless of screen size */
    .long-question {
        overflow-x: auto; /* Enable horizontal scroll */
        padding-bottom: 6px; /* Slightly reduced padding */
        scrollbar-width: thin;
        scrollbar-color: rgba(107, 114, 128, 0.4) transparent; /* Lighter scrollbar */
    }

    .long-question::-webkit-scrollbar {
        height: 2px; /* Thinner scrollbar */
    }

    .long-question::-webkit-scrollbar-track {
        background: transparent;
    }

    .long-question::-webkit-scrollbar-thumb {
        background-color: rgba(107, 114, 128, 0.4); /* Lighter scrollbar thumb */
        border-radius: 10px;
        border: 1px solid transparent;
    }
</style>
