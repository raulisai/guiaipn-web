<script>
	import '../app.css';

	let menuBtn;
	let activo = $state(false);

	let { children } = $props();

	function toogleMenu() {
		console.log('click');

		activo = !activo;

		console.log(activo);
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

	<!-- Footer -->
	<footer class="text-white py-12">
		<div class="container mx-auto px-4">
			<div class="grid grid-cols-1 md:grid-cols-4 gap-8">
				<!-- Logo y descripción -->
				<div class="md:col-span-1">
					<img src="logoipnburrito.png" alt="Logo de la guía del IPN" class="w-32 mb-4" />
					<p class="text-sm text-white/70">
						Preparación exclusiva para el examen de admisión al Instituto Politécnico Nacional.
					</p>
				</div>

				<!-- Enlaces rápidos -->
				<div>
					<h3 class="text-xl font-bold mb-4 border-b border-white/20 pb-2">Enlaces rápidos</h3>
					<ul>
						<li class="mb-2">
							<a href="" class="text-white/70 hover:text-white transition-colors">Inicio</a>
						</li>
						<li class="mb-2">
							<a href="" class="text-white/70 hover:text-white transition-colors">Materias</a>
						</li>
						<li class="mb-2">
							<a href="" class="text-white/70 hover:text-white transition-colors"
								>Exámenes de práctica</a
							>
						</li>
						<li class="mb-2">
							<a href="" class="text-white/70 hover:text-white transition-colors"
								>Recursos gratuitos</a
							>
						</li>
					</ul>
				</div>

				<!-- Contacto -->
				<div>
					<h3 class="text-xl font-bold mb-4 border-b border-white/20 pb-2">Contacto</h3>
					<ul>
						<li class="mb-2 flex items-center gap-2">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-5 w-5"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
								/>
							</svg>
							<span>info@guiaipn.mx</span>
						</li>
						<li class="mb-2 flex items-center gap-2">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-5 w-5"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
								/>
							</svg>
							<span>55 29137659</span>
						</li>
					</ul>
				</div>

				<!-- Redes sociales -->
				<div>
					<h3 class="text-xl font-bold mb-4 border-b border-white/20 pb-2">Síguenos</h3>
					<div class="flex gap-4">
						<a href="/" class="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors" aria-label="Visit our Facebook page">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-6 w-6"
								fill="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"
								/>
							</svg>
						</a>
						<a href="/" class="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors" aria-label="Visit our Facebook page">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-6 w-6"
								fill="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
								/>
							</svg>
						</a>
						
						<a href="/" class="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors" aria-label="Visit our Facebook page">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-6 w-6"
								fill="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"
								/>
							</svg>
						</a>
						
						<a href="/" class="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors" aria-label="Visit our Facebook page">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-6 w-6"
								fill="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"
								/>
							</svg>
						</a>
					</div>
				</div>
			</div>

			<div class="border-t border-white/20 mt-8 pt-8 text-center text-sm text-white/60">
				<p>© Guía IPN djoker. Todos los derechos reservados.</p>
				<p class="mt-2">
					Este sitio no está afiliado oficialmente con el Instituto Politécnico Nacional.
				</p>
			</div>
		</div>
	</footer>
</div>

<style>
	.gradient-bg {
		background:
			linear-gradient(to bottom, #0f172a, #0b1320);  /* Ajusta, url('/malla.jpg'); /* Ajusta la ruta y nombre de archivo */
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
