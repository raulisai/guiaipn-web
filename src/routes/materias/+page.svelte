<script>
    import { ProtectedRoute } from '$lib/components';
    import { onMount } from 'svelte';
    import { user } from '$lib/stores/authStore';
    import { goto } from '$app/navigation';
    
    let selectedSubject = $state(null);
    let selectedQuestions = $state(10);
    let showConfig = $state(false);

    onMount(() => {
		// Verificar autenticación
		if (!$user) {
			setTimeout(() => {
				goto('/cuenta/login');
			}, 100);
		}
	});
    
    const subjects = [
        {
            id: 'matematicas',
            name: 'Matemáticas',
            icon: '📐',
            gradient: 'from-blue-600 to-indigo-600',
            bgGradient: 'from-blue-900/70 to-indigo-700/40',
            description: 'Álgebra, geometría y cálculo',
            topics: ['Álgebra', 'Geometría', 'Cálculo'],
            image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80'
        },
        {
            id: 'fisica',
            name: 'Física',
            icon: '⚛️',
            gradient: 'from-green-600 to-teal-600',
            bgGradient: 'from-green-900/70 to-teal-700/40',
            description: 'Mecánica, electricidad y óptica',
            topics: ['Mecánica', 'Electricidad', 'Óptica'],
            image: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=800&q=80'
        },
        {
            id: 'quimica',
            name: 'Química',
            icon: '🧪',
            gradient: 'from-red-600 to-amber-600',
            bgGradient: 'from-red-900/70 to-amber-700/40',
            description: 'Orgánica, inorgánica y analítica',
            topics: ['Orgánica', 'Inorgánica', 'Analítica'],
            image: 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=800&q=80'
        },
        {
            id: 'biologia',
            name: 'Biología',
            icon: '🧬',
            gradient: 'from-emerald-600 to-lime-600',
            bgGradient: 'from-emerald-900/70 to-lime-700/40',
            description: 'Celular, genética y ecología',
            topics: ['Celular', 'Genética', 'Ecología'],
            image: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=800&q=80'
        },
        {
            id: 'historia',
            name: 'Historia',
            icon: '📚',
            gradient: 'from-yellow-600 to-orange-600',
            bgGradient: 'from-yellow-900/70 to-orange-700/40',
            description: 'México, universal y contemporánea',
            topics: ['México', 'Universal', 'Contemporánea'],
            image: 'https://images.unsplash.com/photo-1461360370896-8bfd4dc0c7c5?w=800&q=80'
        },
        {
            id: 'geografia',
            name: 'Geografía',
            icon: '🌍',
            gradient: 'from-cyan-600 to-blue-600',
            bgGradient: 'from-cyan-900/70 to-blue-700/40',
            description: 'Física, humana y económica',
            topics: ['Física', 'Humana', 'Económica'],
            image: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=800&q=80'
        }
    ];
    
    const questionOptions = [5, 10, 15, 20];
    
    function selectSubject(subject) {
        selectedSubject = subject;
        showConfig = true;
    }
    
    function startExam() {
        if (selectedSubject) {
            goto(`/examen?materia=${selectedSubject.id}&preguntas=${selectedQuestions}`);
        }
    }
    
    function goBack() {
        showConfig = false;
        selectedSubject = null;
        selectedQuestions = 10;
    }
</script>

<ProtectedRoute>
    <div class="min-h-screen gradient-bg pb-20">
        <!-- Hero Section -->
        <section class="hero-section pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div class="max-w-4xl mx-auto text-center">
                <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-lg">
                    Practica por <span class="text-amber-300">Materia</span>
                </h1>
                <p class="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto mb-6">
                    Selecciona una materia y configura tu examen personalizado
                </p>
                <div class="w-24 h-1 bg-gradient-to-r from-red-600 to-amber-300 rounded-full mx-auto"></div>
            </div>
        </section>

        {#if !showConfig}
            <!-- Subjects Grid -->
            <section class="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {#each subjects as subject}
                        <button
                            onclick={() => selectSubject(subject)}
                            class="subject-card bg-gradient-to-br {subject.bgGradient} backdrop-blur-sm rounded-2xl overflow-hidden shadow-xl border border-white/10 hover:scale-105 active:scale-95 transition-all duration-300 text-left"
                        >
                            <div class="h-32 sm:h-40 overflow-hidden relative">
                                <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
                                <img 
                                    src={subject.image}
                                    alt={subject.name}
                                    class="w-full h-full object-cover"
                                />
                                <div class="absolute bottom-0 left-0 w-full p-4 z-20 flex items-center gap-3">
                                    <span class="text-4xl">{subject.icon}</span>
                                    <h3 class="text-2xl sm:text-3xl font-bold text-white">{subject.name}</h3>
                                </div>
                            </div>
                            <div class="p-4 sm:p-6">
                                <p class="text-white/80 text-sm sm:text-base mb-3">{subject.description}</p>
                                <div class="flex flex-wrap gap-2">
                                    {#each subject.topics as topic}
                                        <span class="bg-white/10 text-white text-xs py-1 px-3 rounded-full">
                                            {topic}
                                        </span>
                                    {/each}
                                </div>
                            </div>
                        </button>
                    {/each}
                </div>
            </section>
        {:else}
            <!-- Configuration Panel -->
            <section class="px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto">
                <div class="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-6 sm:p-8 lg:p-10">
                    <!-- Back Button -->
                    <button
                        onclick={goBack}
                        class="flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
                    >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                        </svg>
                        <span>Volver</span>
                    </button>

                    <!-- Selected Subject -->
                    <div class="text-center mb-8">
                        <div class="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br {selectedSubject.gradient} mb-4 text-4xl sm:text-5xl shadow-lg">
                            {selectedSubject.icon}
                        </div>
                        <h2 class="text-3xl sm:text-4xl font-bold text-white mb-2">{selectedSubject.name}</h2>
                        <p class="text-white/70">{selectedSubject.description}</p>
                    </div>

                    <!-- Question Selector -->
                    <div class="mb-8">
                        <div class="block text-white text-lg font-semibold mb-4 text-center">
                            ¿Cuántas preguntas quieres responder?
                        </div>
                        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                            {#each questionOptions as option}
                                <button
                                    onclick={() => selectedQuestions = option}
                                    class="question-option py-4 sm:py-6 rounded-xl font-bold text-lg sm:text-xl transition-all duration-300 {selectedQuestions === option 
                                        ? 'bg-gradient-to-br ' + selectedSubject.gradient + ' text-white shadow-lg scale-105 ring-4 ring-white/30' 
                                        : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'}"
                                >
                                    {option}
                                </button>
                            {/each}
                        </div>
                    </div>

                    <!-- Estimated Time -->
                    <div class="bg-white/5 rounded-xl p-4 mb-8 text-center">
                        <p class="text-white/60 text-sm mb-1">Tiempo estimado</p>
                        <p class="text-white text-2xl font-bold">
                            {Math.ceil(selectedQuestions * 1.5)} - {selectedQuestions * 2} min
                        </p>
                    </div>

                    <!-- Start Button -->
                    <button
                        onclick={startExam}
                        class="w-full py-4 sm:py-5 bg-gradient-to-r {selectedSubject.gradient} hover:shadow-2xl text-white text-lg sm:text-xl font-bold rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg"
                    >
                        Comenzar Examen
                    </button>

                    <!-- Info -->
                    <div class="mt-6 text-center text-white/50 text-sm">
                        <p>💡 Recibirás explicaciones detalladas con IA</p>
                    </div>
                </div>
            </section>
        {/if}
    </div>
</ProtectedRoute>

<style>
    .hero-section {
        margin-top: 60px;
    }

    .subject-card {
        cursor: pointer;
        -webkit-tap-highlight-color: transparent;
    }

    .question-option {
        cursor: pointer;
        -webkit-tap-highlight-color: transparent;
    }

    @media (max-width: 640px) {
        .hero-section {
            padding-top: 5rem;
        }
    }
</style>
