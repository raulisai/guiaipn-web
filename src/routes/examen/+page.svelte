<script>



    function toggleCard(card) {
        

        console.log(card);
    }


</script>

<div>


    
    <div class="max-w-3xl text-center space-y-8">
        <h1 class="text-5xl font-bold text-white mb-6">
            Examen del IPN Asistido por IA 
        </h1>

        <!-- Separador -->
        <div class="border-t border-white/20 w-24 mx-auto"></div>

        <!-- Pregunta -->
        <div class="w-full px-6 py-4 rounded-md  backdrop-blur-sm 
            border border-white/30 text-white">
            <p id="question"></p>
        </div>

        <!-- Respuesta -->
        <div class="relative mt-12 max-w-md mx-auto">
            <!-- Contenedor de tarjetas -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mt-12">
                <!-- Tarjeta 1 -->
                <div class="card bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 
                         hover:shadow-lg cursor-pointer transition-all duration-300
                         min-h-[100px] flex items-center justify-center" on:click={(e) => toggleCard(e.currentTarget)}>
                    <p class="text-white font-medium" id="response-a">4</p>
                </div>

                <!-- Tarjeta 2 -->
                <div class="card bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 
                         hover:shadow-lg cursor-pointer transition-all duration-300
                         min-h-[100px] flex items-center justify-center" on:click={(e) => toggleCard(e.currentTarget)}>
                    <p class="text-white font-medium" id="response-b">2</p>
                </div>

                <!-- Tarjeta 3 -->
                <div class="card bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 
                         hover:shadow-lg cursor-pointer transition-all duration-300
                         min-h-[100px] flex items-center justify-center" on:click={(e) => toggleCard(e.currentTarget)}>
                    <p class="text-white font-medium" id="response-c">5</p>
                </div>

                <!-- Tarjeta 4 -->
                <div class="card bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 
                         hover:shadow-lg cursor-pointer transition-all duration-300
                         min-h-[100px] flex items-center justify-center" on:click={(e) => toggleCard(e.currentTarget)}>
                    <p class="text-white font-medium" id="response-d">8</p>
                </div>
            </div>
            <div class="flex justify-center items-center overflow-hidden w-full mt-8">
                <div
                    class="timer-container rounded relative  w-[170px] h-[60px] flex justify-center items-center backdrop-blur-sm ">
                    <div id="timer" class="text-3xl font-bold text-custom-teal"></div>
                </div>
            </div>
            <div class="fixed top-4 left-4 z-50">
                <a href="./index.html" class="flex items-center justify-center">
                    <img src="./images/logoipnburrito.png" alt="Logo de la guia del IPN" class="w-[150px]">
                </a>
            </div>
        </div>
    </div>

    <!-- Símbolo decorativo -->
    <div class="absolute bottom-8 right-8 text-white/50 text-2xl">
        ※
    </div>
</div>