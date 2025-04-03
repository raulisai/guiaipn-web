
<script>

// Función para cerrar el modal
function closeModal() {
        const modal = document.getElementById('modal');
        modal.classList.add('modal-out');
        
        setTimeout(() => {
            modal.classList.add('hidden');
        }, 200); // Duración de la animación
    }

</script>

<!-- Modal -->
<div id="modal" class=" fixed inset-0 bg-custom-modal backdrop-blur-md z-50 flex items-center justify-center p-4">
	<div class="bg-white/20 backdrop-blur-sm rounded-xl max-w-md w-full p-6 border border-white/30">
		<div class="flex justify-between items-center mb-4">
			<h3 class="text-xl font-bold text-white">Respuesta seleccionada : <span id="modalContent"></span></h3>
			<button onclick={closeModal}  class="text-white/70 hover:text-white transition-colors">
				✕
			</button>
		</div>
		<div class="space-y-4">
			<!-- Indicator for correct/incorrect -->
			<div id="resultIndicator" class="flex items-center mb-4">
				<div class="w-8 h-8 rounded-full flex items-center justify-center mr-3">
					<span id="resultIcon" class="text-xl"></span>
				</div>
				<h4 id="resultText" class="text-xl font-bold">Respuesta correcta :</h4>
			</div>
			
			<!-- Problem description -->
			<div class="bg-white/10 rounded-lg p-4 border border-white/30">
				<h4 class="text-white/80 text-sm uppercase mb-2">Problema</h4>
				<p id="problemDescription" class="text-white"></p>
			</div>
			
			<!-- Explanation -->
			<div class="bg-white/10 rounded-lg p-4 border border-white/30">
				<h4 class="text-white/80 text-sm uppercase mb-2">Explicación</h4>
				<p id="explanation" class="text-white"></p>
			</div>
			
			<!-- Solution steps -->
			<div class="bg-white/10 rounded-lg p-4 border border-white/30">
				<h4 class="text-white/80 text-sm uppercase mb-2">Pasos para resolver</h4>
				<div id="solutionSteps">
					<ol  class="list-decimal pl-5 text-white space-y-2"></ol>
				</div>
			   
			</div>
			
			<!-- Formula reminder -->
			<div class="bg-white/10 rounded-lg p-4 border border-white/30 flex items-center">
				<div class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mr-3">
					<span class="text-white">∑</span>
				</div>
				<div>
					<h4 class="text-white/80 text-sm uppercase mb-1">Fórmulas</h4>
					<p id="formulas" class="text-white font-mono"></p>
				</div>
			</div>
			
			<!-- Similar example -->
			<div class="bg-white/10 rounded-lg p-4 border border-white/30">
				<h4 class="text-white/80 text-sm uppercase mb-2">Ejemplo similar</h4>
				<p id="example" class="text-white italic"></p>
			</div>
			
			<button  class="w-full py-3 px-4 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all mt-2">
				Siguiente pregunta
			</button>
		</div>
	</div>
</div>