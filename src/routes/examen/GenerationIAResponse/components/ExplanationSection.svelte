<script lang="ts">
	export let explanation: string;
	export let tips: string = 'No hay tips disponibles para esta pregunta.'; // Default value if no tips are provided

	import TipsSection from './TipsSection.svelte';
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';

	// Split explanation into paragraphs for better animation
	$: paragraphs = explanation.split('\n').filter(p => p.trim().length > 0);
</script>

<div class="relative cyber-explanation">
	<!-- Cyberpunk decoration elements -->
	<div class="cyber-scanner-line"></div>
	<div class="cyber-corner top-left"></div>
	<div class="cyber-corner top-right"></div>
	<div class="cyber-corner bottom-left"></div>
	<div class="cyber-corner bottom-right"></div>
	
	<div class="text-cyan-100 text-sm sm:text-base p-4 rounded-lg pb-12 leading-relaxed">
		{#each paragraphs as paragraph, i}
			<p 
				in:fly={{ y: 15, delay: i * 150, duration: 400, easing: cubicOut }}
				class="mb-3 leading-relaxed"
			>
				{paragraph}
			</p>
		{/each}
	</div>
	
	<!-- Positioned at bottom right -->
	<div class="absolute bottom-3 right-3">
		<TipsSection tips={tips} />
	</div>
</div>

<style>
	.cyber-explanation {
		position: relative;
		overflow: hidden;
	}
	
	/* Animated scanner line effect */
	.cyber-scanner-line {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 3px;
		background: linear-gradient(90deg, transparent, rgba(0, 255, 234, 0.7), transparent);
		animation: scannerLine 2.5s cubic-bezier(0.42, 0, 0.58, 1) infinite;
		opacity: 0.7;
		z-index: 1;
	}
	
	/* Cyberpunk corner decorations */
	.cyber-corner {
		position: absolute;
		width: 15px;
		height: 15px;
		z-index: 1;
	}
	
	.top-left {
		top: 0;
		left: 0;
		border-top: 2px solid rgba(0, 255, 234, 0.7);
		border-left: 2px solid rgba(0, 255, 234, 0.7);
	}
	
	.top-right {
		top: 0;
		right: 0;
		border-top: 2px solid rgba(0, 255, 234, 0.7);
		border-right: 2px solid rgba(0, 255, 234, 0.7);
	}
	
	.bottom-left {
		bottom: 0;
		left: 0;
		border-bottom: 2px solid rgba(0, 255, 234, 0.7);
		border-left: 2px solid rgba(0, 255, 234, 0.7);
	}
	
	.bottom-right {
		bottom: 0;
		right: 0;
		border-bottom: 2px solid rgba(0, 255, 234, 0.7);
		border-right: 2px solid rgba(0, 255, 234, 0.7);
	}
	
	@keyframes scannerLine {
		0% { transform: translateY(-100%); }
		100% { transform: translateY(1000%); }
	}
</style>
