<script>
	import '../app.css';


	let menuBtn
	let activo =$state(false); 
	

	let { children } = $props();

   function toogleMenu(){

	console.log("click")

	activo = !activo;

	console.log(activo)
   



}


</script>

<div class="gradient-bg min-h-screen flex flex-col items-center justify-center p-4">
	<!-- Menú flotante -->
	<div class="fixed top-4 left-4 z-50">
		<a href="/" class="flex items-center justify-center">
			<img src="logoipnburrito.png" alt="Logo de la guia del IPN" class="w-[150px]" />
		</a>
	</div>
	<div class="fixed top-4 right-4 z-50">
		<div class="relative">
			<button
				id="menuBtn"
				bind:this={menuBtn}
				onclick={toogleMenu}
				class="p-2 rounded-xl bg-white/30 hover:bg-white/50 backdrop-blur-sm
                          transition-all text-white border border-white/30 shadow-md flex items-center justify-center"
			>
				<span class="material-symbols-outlined">menu</span>
			</button>

			<div
			    class={`menu-hidden absolute right-0 mt-2 w-48 bg-white/20 backdrop-blur-sm
                            rounded-lg shadow-lg py-2 transition-all duration-200 ${activo ? 'menu-visible' : 'menu-hidden'}`}

			>
				<a href="/" class="block px-4 py-2 text-white hover:bg-white/10">Inicio</a>
				<a href="/materias" class="block px-4 py-2 text-white hover:bg-white/10">Materias</a>
				<a href="/examen" class="block px-4 py-2 text-white hover:bg-white/10">Exámenes</a>
				<a href="/cuenta" class="block px-4 py-2 text-white hover:bg-white/10">Configuración</a>
			</div>
		</div>
	</div>

	{@render children()}
</div>

<style>
	.gradient-bg {
		background:
			linear-gradient(to bottom, #0f172a, #0b1320), url('/malla.jpg'); /* Ajusta la ruta y nombre de archivo */
		background-size: cover;
		background-position: center;
		background-blend-mode: multiply;
	}
	.menu-hidden {
		display: none;
		opacity: 0;
		transform: translateY(-10px);
	}
	.menu-visible {
		display: block;
		opacity: 1;
		transform: translateY(0);
	}
</style>
