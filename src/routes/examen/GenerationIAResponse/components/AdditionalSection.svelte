<script lang="ts">
	export let title: string;
	export let content: string;
	export let type: 'formula' | 'example';
	
	// Color and animation classes based on type
	$: colorClass = type === 'formula' 
		? 'border-emerald-500/20 shadow-emerald-900/10 hover:shadow-emerald-500/30' 
		: 'border-amber-500/20 shadow-amber-900/10 hover:shadow-amber-500/30';
	
	$: titleColorClass = type === 'formula' 
		? 'text-emerald-300' 
		: 'text-amber-300';
	
	$: iconColorClass = type === 'formula' 
		? 'bg-emerald-400' 
		: 'bg-amber-400';
	
	$: borderColorClass = type === 'formula' 
		? 'border-emerald-400/30 group-hover:border-emerald-400' 
		: 'border-amber-400/30 group-hover:border-amber-400';
	
	$: animationDelay = type === 'formula' 
		? 'animation-delay-300' 
		: 'animation-delay-400';
</script>

<div
	class="bg-gray-800/50 rounded-xl p-5 border shadow-lg transition-all duration-500 group animate-fadeIn {colorClass} {animationDelay}"
>
	<p class="{titleColorClass} text-sm font-semibold uppercase mb-3 flex items-center">
		<span
			class="inline-block w-1.5 h-1.5 {iconColorClass} rounded-full mr-2 group-hover:animate-ping"
		></span>
		{title}
	</p>
	<div
		class="text-gray-200 text-secondary bg-gray-900/40 p-4 rounded-lg border-l-2 {borderColorClass} transition-all duration-300"
	>
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
	
	/* Nueva animación de fadeIn para elementos */
	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	
	.animate-fadeIn {
		animation: fadeIn 0.5s ease forwards;
	}
	
	/* Animaciones con retraso */
	.animation-delay-300 {
		animation-delay: 0.3s;
	}
	
	.animation-delay-400 {
		animation-delay: 0.4s;
	}
</style>
