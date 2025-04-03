<script>
	import Timer from './Timer.svelte';
</script>

<!-- Temporizador y Estadísticas -->
<div
	class="flex flex-col mt-16 md:flex-row items-center justify-between gap-6 bg-white/5 rounded-lg p-4 backdrop-blur-sm border border-white/20"
>
	<!-- Temporizador circular -->
	<div class="timer-circle flex-shrink-0">
		<Timer initialSeconds={0} />
	</div>

	<!-- Estadísticas de habilidades con trapecios -->
	<div class="w-full">
		<h3 class="text-white text-lg font-medium mb-3">Estadísticas de habilidades</h3>
		<div class="grid grid-cols-2 gap-3">
			<div class="skill-bar">
				<div class="flex justify-between mb-1">
					<span class="text-sm text-white/80">Matemáticas</span>
					<span class="text-sm text-white/80">75%</span>
				</div>
				<div class="h-6 relative">
					<div
						class="absolute inset-0 bg-white/10"
						style="clip-path: polygon(0% 0%, 100% 20%, 100% 80%, 0% 100%)"
					></div>
					<div
						class="absolute inset-0 bg-blue-500"
						style="clip-path: polygon(0% 0%, 75% 20%, 75% 80%, 0% 100%)"
					></div>
				</div>
			</div>
			<div class="skill-bar">
				<div class="flex justify-between mb-1">
					<span class="text-sm text-white/80">Física</span>
					<span class="text-sm text-white/80">60%</span>
				</div>
				<div class="h-6 relative">
					<div
						class="absolute inset-0 bg-white/10"
						style="clip-path: polygon(0% 0%, 100% 20%, 100% 80%, 0% 100%)"
					></div>
					<div
						class="absolute inset-0 bg-green-500"
						style="clip-path: polygon(0% 0%, 60% 20%, 60% 80%, 0% 100%)"
					></div>
				</div>
			</div>
			<div class="skill-bar">
				<div class="flex justify-between mb-1">
					<span class="text-sm text-white/80">Química</span>
					<span class="text-sm text-white/80">80%</span>
				</div>
				<div class="h-6 relative">
					<div
						class="absolute inset-0 bg-white/10"
						style="clip-path: polygon(0% 0%, 100% 20%, 100% 80%, 0% 100%)"
					></div>
					<div
						class="absolute inset-0 bg-purple-500"
						style="clip-path: polygon(0% 0%, 80% 20%, 80% 80%, 0% 100%)"
					></div>
				</div>
			</div>
			<div class="skill-bar">
				<div class="flex justify-between mb-1">
					<span class="text-sm text-white/80">Biología</span>
					<span class="text-sm text-white/80">45%</span>
				</div>
				<div class="h-6 relative">
					<div
						class="absolute inset-0 bg-white/10"
						style="clip-path: polygon(0% 0%, 100% 20%, 100% 80%, 0% 100%)"
					></div>
					<div
						class="absolute inset-0 bg-yellow-500"
						style="clip-path: polygon(0% 0%, 45% 20%, 45% 80%, 0% 100%)"
					></div>
				</div>
			</div>
		</div>
	</div>
</div>
