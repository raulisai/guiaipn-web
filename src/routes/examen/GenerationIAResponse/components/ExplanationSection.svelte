<script lang="ts">
	import TipsSection from './TipsSection.svelte';
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import MathForm from '../../componentes/Math.svelte';

	export let explanation: string;
	export let lengMath: boolean; // Default value for math language
	export let tips: string = 'No hay tips disponibles para esta pregunta.'; // Default value if no tips are provided

	// Split explanation into paragraphs for better animation
	$: paragraphs = explanation.split('\n').filter((p) => p.trim().length > 0);
</script>

<div class="relative w-full">
	<div class="text-gray-100 text-sm sm:text-base leading-relaxed">
		{#each paragraphs as paragraph, i}
			<p
				in:fly={{ y: 15, delay: i * 150, duration: 400, easing: cubicOut }}
				class="mb-3 leading-relaxed"
			>
				{#if lengMath}
					<MathForm isBlock={false} content={paragraph} />
				{:else}
					{paragraph}
				{/if}
			</p>
		{/each}
	</div>

	<!-- Positioned at bottom right -->
	<div class="mt-6 flex justify-end">
		<TipsSection {tips} {lengMath} />
	</div>
</div>

<style>
	/* Clean styles for blackboard readability */
</style>
