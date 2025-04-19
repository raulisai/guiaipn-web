<script>
	import { goto } from '$app/navigation';
	export let answers;

	// Calculate score
	const totalQuestions = Object.keys(answers).length;
	const correctAnswers = Object.values(answers).filter(answer => answer === 'true').length;
	const percentage = Math.round((correctAnswers / totalQuestions) * 100);
	
	function goToHome() {
		goto('/');
	}
</script>

<div
	id="modal"
	class="fixed inset-0 bg-custom-modal backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-auto"
>
	<div
		class="basemodal bg-white/20 backdrop-blur-sm rounded-xl max-w-[95%] md:max-w-3xl w-full p-4 md:p-6 lg:p-8 border border-white/30"
	>
		<div class="text-center">
			<h2 class="text-2xl md:text-3xl font-bold mb-6">¡Examen Finalizado!</h2>
			
			<div class="mb-8">
				<div class="relative w-32 h-32 mx-auto mb-4">
					<div class="absolute inset-0 rounded-full border-4 border-gray-200"></div>
					<div class="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent" 
							 style="transform: rotate({percentage * 3.6}deg); transition: transform 1s ease-out;"></div>
					<div class="absolute inset-0 flex items-center justify-center">
						<span class="text-4xl font-bold">{percentage}%</span>
					</div>
				</div>
				
				<p class="text-lg">Respuestas correctas: {correctAnswers} de {totalQuestions}</p>
			</div>
			
			<button 
				on:click={goToHome}
				class="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
			>
				Volver al Inicio
			</button>
		</div>
	</div>
</div>
