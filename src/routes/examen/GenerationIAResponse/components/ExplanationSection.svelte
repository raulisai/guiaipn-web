<script lang="ts">
	export let explanation: string;
	export let tips: string = 'No hay tips disponibles para esta pregunta.'; // Default value if no tips are provided

	import TipsSection from './TipsSection.svelte';
</script>

<div class="relative border-b-2 border-indigo-700 ">
	
	<div class="text-gray-200 text-sm sm:text-base p-4 rounded-lg pb-10 text-center">
		{explanation}
	</div>
	
	<!-- Positioned at bottom right -->
	<div class="absolute bottom-2 right-2">
		<TipsSection tips={tips} />
	</div>
</div>
