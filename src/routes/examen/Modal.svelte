<script>
    let { pregunta, id, iscorrect } = $props();

    let respuesta = $state('');
    let showModal = $state(false);
    let explication = $state();
    let isLoading = $state(false); // Nueva variable para controlar el estado de carga

    export function toogleModal() {
        showModal = !showModal;
        console.log('Modal abierto:', showModal);
    };

    export async function updateData(resp) {
        respuesta = resp;
        isLoading = true; // Activar el estado de carga

        try {
            explication = await enviarRespuesta(pregunta, respuesta);
            console.log('Explicación:', explication);
        } catch (error) {
            console.error('Error al obtener la explicación:', error);
        } finally {
            isLoading = false; // Desactivar el estado de carga
        }
    }

    async function enviarRespuesta(question, Respuesta) {
        const urlAPI = "https://pqedqxmb2h.execute-api.us-east-2.amazonaws.com/ChatGpt";

        try {
            const response = await fetch(urlAPI, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    "idreactivo": id,
                    "respuesta": Respuesta,
                    "isCorrect": iscorrect,
                    "pregunta": question,
                })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }

            const data = await response.json();
            console.log('resp:', data);
            return data;
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
        }
    }

    function closeModal() {
        const modal = document.getElementById('modal');
        modal.classList.add('modal-out');
        toogleModal();

        setTimeout(() => {
            modal.classList.add('hidden');
        }, 200); // Duración de la animación
    }
</script>

{#if showModal}
<!-- Modal -->
<div id="modal" class="fixed inset-0 bg-custom-modal backdrop-blur-md z-50 flex items-center justify-center p-4">
    <div class="bg-white/20 backdrop-blur-sm rounded-xl max-w-md w-full p-6 border border-white/30">
        <div class="flex justify-between items-center mb-4">
            <h3 class="text-xl font-bold text-white">Respuesta seleccionada: <span id="modalContent">{respuesta}</span></h3>
            <button onclick={closeModal} class="text-white/70 hover:text-white transition-colors">
                ✕
            </button>
        </div>
        <div class="space-y-4">
            {#if isLoading}
                <!-- Indicador de carga -->
                <div class="flex justify-center items-center">
                    <div class="loader"></div>
                    <p class="text-white ml-2">Cargando...</p>
                </div>
            {:else}
                <!-- Problem description -->
                <div class="bg-white/10 rounded-lg p-4 border border-white/30">
                    <h4 class="text-white/80 text-sm uppercase mb-2">Problema</h4>
                    <p id="problemDescription" class="text-white">{explication.shortDescripcionDelProblema}</p>
                </div>

                <!-- Explanation -->
                <div class="bg-white/10 rounded-lg p-4 border border-white/30">
                    <h4 class="text-white/80 text-sm uppercase mb-2">Explicación</h4>
                    <p id="explanation" class="text-white">{explication.explicacionRespuesta}</p>
                </div>

                <!-- Solution steps -->
                <div class="bg-white/10 rounded-lg p-4 border border-white/30">
                    <h4 class="text-white/80 text-sm uppercase mb-2">Pasos para resolver</h4>
                    <div id="solutionSteps">
                        <ol class="list-decimal pl-5 text-white space-y-2">
                            {#each explication.pasoParResolverElProblema as paso}
                                <li>{paso}</li>
                            {/each}
                        </ol>
                    </div>
                </div>
            {/if}
        </div>
    </div>
</div>
{/if}

<style>
    .loader {
        border: 4px solid rgba(255, 255, 255, 0.3);
        border-top: 4px solid white;
        border-radius: 50%;
        width: 24px;
        height: 24px;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }
</style>