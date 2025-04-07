<section class="min-w-full min-h-screen flex flex-col md:flex-row items-center justify-center py-4 px-8 sm:pb-6 overflow-x-hidden">    <!-- Left section with text and button -->
    <div class="md:w-1/2 flex flex-col items-center justify-center text-center px-6 md:text-left mb-8 md:mb-0">
        <h1 class="
        text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white drop-shadow-lg">
            Ingresa al <span class="text-red-950 block md:inline-block text-6xl md:text-8xl lg:text-9xl mt-2">IPN</span>
        </h1>
        <h3 class="mt-4 text-center text-white p-3">
            ¿Quieres ingresar al IPN pero no sabes cómo? ¡Nosotros te ayudamos!
            Preparate para el examen de admisión desde la comodidad de tu casa.
        </h3>

        <button class="mt-6 w-auto text-center text-white">
            <a href="/examen"
                class="px-8 py-4 bg-red-950 hover:bg-black
                rounded-lg border-2 border-white/30 backdrop-blur-sm
                transform hover:scale-105 transition-all duration-300 flex items-center justify-center shadow-lg">
                <p class="font-bold text-base">
                    Comenzar a estudiar con AI
                </p>
                <!-- Mini robot icon -->
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round"
                        d="M9 3v2m6-2v2M9 19h6m-6 4h6m-6-8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm6 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
                    <rect x="5" y="9" width="14" height="10" rx="2" stroke-linecap="round"
                        stroke-linejoin="round" />
                    <line x1="8" y1="15" x2="10" y2="15" />
                    <line x1="14" y1="15" x2="16" y2="15" />
                </svg>

            </a>
        </button>
    </div>
    <!--  Right section with image -->
    <div class="content_guiaIPN mt-6 md:mt-4 text-center w-full md:w-1/2 flex justify-center items-center px-4">
        <img src="/logoipnGuia.png" alt="Logo de la guia del IPN" class="max-w-l h-auto">
    </div>
</section>


        <!-- Sección de "Cómo funciona" -->
        <section class="w-screen py-16 bg-gradient-to-b from-[#030e27] via-[#030e28]/70 to-black/60 backdrop-blur-2xl">
            <div class="container mx-auto px-4 ">
                <h2 class="text-5xl font-bold text-white text-center mb-12">¿Cómo funciona?</h2>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto py-4 h-1/3">
                    <!-- Paso 1 -->
                    <div class="bg-blue-card backdrop-blur-2xl rounded-xl p-6 transform hover:scale-105 transition-all duration-300 border border-cyan">
                        <div class="bg-red-950 rounded-full w-13 h-13 flex items-center justify-center mx-auto mb-4">
                            <span class="text-white text-2xl font-bold">1</span>
                        </div>
                        <h3 class="text-2xl font-bold text-white text-center mb-3">Regístrate</h3>
                        <p class="text-white/80 text-center">Crea una cuenta gratuita para acceder a todos los recursos de preparación para el examen del IPN.</p>
                    </div>
                    
                    <!-- Paso 2 -->
                    <div class="bg-blue-card backdrop-blur-sm rounded-xl p-6 transform hover:scale-105 transition-all duration-300 border border-cyan">
                        <div class="bg-red-950 rounded-full w-13 h-13 flex items-center justify-center mx-auto mb-4">
                            <span class="text-white text-2xl font-bold">2</span>
                        </div>
                        <h3 class="text-2xl font-bold text-white text-center mb-3">Estudia</h3>
                        <p class="text-white/80 text-center">Utiliza nuestro sistema de aprendizaje con IA para dominar todas las materias del examen de admisión.</p>
                    </div>
                    
                    <!-- Paso 3 -->
                    <div class="bg-blue-card backdrop-blur-sm rounded-xl p-6 transform hover:scale-105 transition-all duration-300 border border-cyan">
                        <div class="bg-red-950 rounded-full w-13 h-13 flex items-center justify-center mx-auto mb-4">
                            <span class="text-white text-2xl font-bold">3</span>
                        </div>
                        <h3 class="text-2xl font-bold text-white text-center mb-3">¡Aprueba!</h3>
                        <p class="text-white/80 text-center">Presentate al examen con confianza y obtén el puntaje que necesitas para ingresar al IPN.</p>
                    </div>
                </div>
            </div>
        </section>
<style>


    .border-cyan {
        border: #3a4c50 .5px solid;
    }

    .bg-blue-card {
        background: #0b1a32a3;
    }

    @media (max-width: 430px) {
        section {
              margin-top: 100px;
                gap: 1px;
            }
          }
          .content_guiaIPN{
            margin-top: -100;
            margin-bottom: 50px;
          }
</style>