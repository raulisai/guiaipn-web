<script lang="ts">
	export let explanation: string;
</script>

<div
	class="bg-gray-800/50 rounded-xl p-3 sm:p-4 border border-cyan-500/20 shadow-lg shadow-cyan-900/10 hover:shadow-cyan-500/30 transition-all duration-500 group h-full"
>
	<p class="text-cyan-300 text-xs sm:text-sm font-semibold uppercase mb-2 sm:mb-3 flex items-center">
		<span
			class="inline-block w-1.5 h-1.5 bg-cyan-400 rounded-full mr-1 sm:mr-2 group-hover:animate-ping"
		></span>
		Explicación Problema
	</p>
	<div
		class="text-gray-200 text-sm sm:text-base bg-gray-900/40 p-2 sm:p-4 rounded-lg border-l-2 border-cyan-400/30 group-hover:border-cyan-400 transition-all duration-300"
	>
		{explanation}
	</div>
</div>
