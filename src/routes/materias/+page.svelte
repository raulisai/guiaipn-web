<script>
    import { ProtectedRoute } from '$lib/components';
</script>

<ProtectedRoute>
<!-- Hero Section -->
         
        <section class="hero gradient-bg min-h-[50vh] flex flex-col items-center justify-center p-8">
            <h1 class="hero-text text-6xl font-bold text-white text-center drop-shadow-lg mb-4">
                Explora tus <span class="text-amber-300">Materias</span>
            </h1>
            <p class="text-xl text-white/80 text-center max-w-3xl mb-8">
                Prepárate para el examenes de matemáticas, español, física y química con nuestro sistema de aprendizaje potenciado con IA.x
            </p>
            <div class="w-24 h-1 bg-gradient-to-r from-red-600 to-amber-300 rounded-full"></div>
        </section>

        <!-- Materias Cards -->
        <section class="py-16 min-h-screen">
            <div class="container mx-auto px-4">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    
                    <!-- Matemáticas -->
                    <div class="bg-gradient-to-br from-blue-900/70 to-indigo-700/40 backdrop-blur-sm rounded-2xl overflow-hidden shadow-2xl border border-white/10 group hover:scale-105 transition-all duration-300">
                        <div class="h-48 overflow-hidden relative">
                            <div class="absolute inset-0 bg-gradient-to-t from-blue-900/90 to-transparent z-10"></div>
                            <img src="https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80" 
                                alt="Matemáticas" class="w-full h-full object-cover">
                            <div class="absolute bottom-0 left-0 w-full p-4 z-20">
                                <h3 class="text-3xl font-bold text-white">Matemáticas</h3>
                            </div>
                        </div>
                        <div class="p-6">
                            <p class="text-white/80 mb-4">Domina álgebra, geometría, trigonometría y cálculo con nuestra IA adaptativa que ajusta el nivel según tus habilidades.</p>
                            <div class="flex gap-2 mb-4">
                                <span class="bg-blue-600/30 text-blue-100 text-xs py-1 px-3 rounded-full">Álgebra</span>
                                <span class="bg-blue-600/30 text-blue-100 text-xs py-1 px-3 rounded-full">Geometría</span>
                                <span class="bg-blue-600/30 text-blue-100 text-xs py-1 px-3 rounded-full">Cálculo</span>
                            </div>
                            <a href="/" class="block w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-center rounded-xl font-bold transition-all transform group-hover:scale-105 shadow-lg">
                                Iniciar examen
                            </a>
                        </div>
                    </div>
                    
                    <!-- Español -->
                    <div class="bg-gradient-to-br from-purple-900/70 to-pink-700/40 backdrop-blur-sm rounded-2xl overflow-hidden shadow-2xl border border-white/10 group hover:scale-105 transition-all duration-300">
                        <div class="h-48 overflow-hidden relative">
                            <div class="absolute inset-0 bg-gradient-to-t from-purple-900/90 to-transparent z-10"></div>
                            <img src="https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80" 
                                alt="Español" class="w-full h-full object-cover">
                            <div class="absolute bottom-0 left-0 w-full p-4 z-20">
                                <h3 class="text-3xl font-bold text-white">Español</h3>
                            </div>
                        </div>
                        <div class="p-6">
                            <p class="text-white/80 mb-4">Mejora tu comprensión lectora, gramática y redacción con ejercicios interactivos y análisis personalizados de tus textos.</p>
                            <div class="flex gap-2 mb-4">
                                <span class="bg-purple-600/30 text-purple-100 text-xs py-1 px-3 rounded-full">Gramática</span>
                                <span class="bg-purple-600/30 text-purple-100 text-xs py-1 px-3 rounded-full">Lectura</span>
                                <span class="bg-purple-600/30 text-purple-100 text-xs py-1 px-3 rounded-full">Redacción</span>
                            </div>
                            <a href="/" class="block w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-center rounded-xl font-bold transition-all transform group-hover:scale-105 shadow-lg">
                                Iniciar examen
                            </a>
                        </div>
                    </div>
                    
                    <!-- Física -->
                    <div class="bg-gradient-to-br from-green-900/70 to-teal-700/40 backdrop-blur-sm rounded-2xl overflow-hidden shadow-2xl border border-white/10 group hover:scale-105 transition-all duration-300">
                        <div class="h-48 overflow-hidden relative">
                            <div class="absolute inset-0 bg-gradient-to-t from-green-900/90 to-transparent z-10"></div>
                            <img src="https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80" 
                                alt="Física" class="w-full h-full object-cover">
                            <div class="absolute bottom-0 left-0 w-full p-4 z-20">
                                <h3 class="text-3xl font-bold text-white">Física</h3>
                            </div>
                        </div>
                        <div class="p-6">
                            <p class="text-white/80 mb-4">Explora simulaciones 3D interactivas para entender mecánica, termodinámica, electricidad y magnetismo de forma visual.</p>
                            <div class="flex gap-2 mb-4">
                                <span class="bg-green-600/30 text-green-100 text-xs py-1 px-3 rounded-full">Mecánica</span>
                                <span class="bg-green-600/30 text-green-100 text-xs py-1 px-3 rounded-full">Electricidad</span>
                                <span class="bg-green-600/30 text-green-100 text-xs py-1 px-3 rounded-full">Óptica</span>
                            </div>
                            <a href="/" class="block w-full py-3 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white text-center rounded-xl font-bold transition-all transform group-hover:scale-105 shadow-lg">
                                Iniciar examen
                            </a>
                        </div>
                    </div>
                    
                    <!-- Química -->
                    <div class="bg-gradient-to-br from-red-900/70 to-amber-700/40 backdrop-blur-sm rounded-2xl overflow-hidden shadow-2xl border border-white/10 group hover:scale-105 transition-all duration-300">
                        <div class="h-48 overflow-hidden relative">
                            <div class="absolute inset-0 bg-gradient-to-t from-red-900/90 to-transparent z-10"></div>
                            <img src="https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80" 
                                alt="Química" class="w-full h-full object-cover">
                            <div class="absolute bottom-0 left-0 w-full p-4 z-20">
                                <h3 class="text-3xl font-bold text-white">Química</h3>
                            </div>
                        </div>
                        <div class="p-6">
                            <p class="text-white/80 mb-4">Experimenta con laboratorios virtuales que te permitirán realizar reacciones químicas y comprender los conceptos fundamentales.</p>
                            <div class="flex gap-2 mb-4">
                                <span class="bg-red-600/30 text-red-100 text-xs py-1 px-3 rounded-full">Orgánica</span>
                                <span class="bg-red-600/30 text-red-100 text-xs py-1 px-3 rounded-full">Inorgánica</span>
                                <span class="bg-red-600/30 text-red-100 text-xs py-1 px-3 rounded-full">Analítica</span>
                            </div>
                            <a href="/" class="block w-full py-3 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white text-center rounded-xl font-bold transition-all transform group-hover:scale-105 shadow-lg">
                                Iniciar examen
                            </a>
                        </div>
                    </div>
                    
                    <!-- Historia -->
                    <div class="bg-gradient-to-br from-yellow-900/70 to-orange-700/40 backdrop-blur-sm rounded-2xl overflow-hidden shadow-2xl border border-white/10 group hover:scale-105 transition-all duration-300">
                        <div class="h-48 overflow-hidden relative">
                            <div class="absolute inset-0 bg-gradient-to-t from-yellow-900/90 to-transparent z-10"></div>
                            <img src="https://images.unsplash.com/photo-1461360370896-8bfd4dc0c7c5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80" 
                                alt="Historia" class="w-full h-full object-cover">
                            <div class="absolute bottom-0 left-0 w-full p-4 z-20">
                                <h3 class="text-3xl font-bold text-white">Historia</h3>
                            </div>
                        </div>
                        <div class="p-6">
                            <p class="text-white/80 mb-4">Viaja en el tiempo con nuestra línea cronológica interactiva que te permite explorar eventos históricos de México y el mundo.</p>
                            <div class="flex gap-2 mb-4">
                                <span class="bg-yellow-600/30 text-yellow-100 text-xs py-1 px-3 rounded-full">México</span>
                                <span class="bg-yellow-600/30 text-yellow-100 text-xs py-1 px-3 rounded-full">Universal</span>
                                <span class="bg-yellow-600/30 text-yellow-100 text-xs py-1 px-3 rounded-full">Contemporánea</span>
                            </div>
                            <a href="/" class="block w-full py-3 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white text-center rounded-xl font-bold transition-all transform group-hover:scale-105 shadow-lg">
                                Iniciar examen
                            </a>
                        </div>

                    </div>
                </div>
            </div>
        </section>

   
        <style>

          @media (max-width: 768px) {
            .hero-text {
              margin-top: 60px;
            }
          }
          </style>
</ProtectedRoute>
