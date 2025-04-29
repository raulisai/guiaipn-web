<script lang="ts">
	export let tips: string;
</script>

<div>
	<p class="text-gray-300 text-xs sm:text-sm font-semibold uppercase mb-2 flex items-center">
		<span class="inline-block w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></span>
		Tips
	</p>
	<div class="text-gray-200 text-sm sm:text-base bg-gray-800/20 p-4 rounded-lg border-l-2 border-gray-500/50">
		{tips}
	</div>
</div>
