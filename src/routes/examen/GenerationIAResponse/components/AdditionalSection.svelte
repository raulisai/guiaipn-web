<script lang="ts">
	export let title: string;
	export let content: string;
</script>

<div>
	<p class="text-gray-300 text-sm font-semibold uppercase mb-3 flex items-center">
		<span class="inline-block w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></span>
		{title}
	</p>
	<div class="text-gray-200 text-secondary bg-gray-800/20 p-4 rounded-lg border-l-2 border-gray-500/50">
		{content}
	</div>
</div>

<style>
	.text-secondary {
		font-size: 16px;
	}
	
	@media screen and (max-width: 768px) {
		.text-secondary {
			font-size: 12px;
		}
	}
</style>
