<script lang="ts">
	export let title: string;
	export let content: string;
</script>

<div class="flex flex-col items-center text-center">
	<h3 class="text-yellow-300 text-sm font-semibold  mb-3 flex items-center">
		<span class="inline-block w-1.5 h-1.5 bg-yellow-400 rounded-full mr-2"></span>
		{title}
	</h3>
	<div class="bg-gray-800/50 text-yellow-100 p-5 rounded-lg border-2 border-yellow-500/50 shadow-lg shadow-yellow-900/20 w-full max-w-lg backdrop-blur-sm">
		<div class="text-sm md:text-base">
			{content}
		</div>
	</div>
</div>

<style>
	
</style>
