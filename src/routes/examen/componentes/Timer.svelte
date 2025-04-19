<script lang="ts">
    import { onMount, onDestroy } from 'svelte';

    // Timer configuration
    export let initialSeconds = 0; // Start at 0 and count up
    
    let seconds = initialSeconds;
    let timerInterval: ReturnType<typeof setInterval>;
    let timerColor = 'text-custom-teal'; // Initial color

    // Format time as mm:ss
    function formatTime(totalSeconds: number): string {
        const minutes = Math.floor(totalSeconds / 60);
        const remainingSeconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    // Update timer color based on elapsed time
    function updateTimerColor() {
        if (seconds >= 120) { // 2 minutes or more
            timerColor = 'text-red-500';
        } else if (seconds >= 60) { // 1 minute or more
            timerColor = 'text-yellow-500';
        } else {
            timerColor = 'text-green-500'; // Less than 1 minute
        }
    }

    onMount(() => {
        // Start timer interval
        timerInterval = setInterval(() => {
            seconds++;
            updateTimerColor();
        }, 1000);
    });

    onDestroy(() => {
        // Clean up interval when component is destroyed
        clearInterval(timerInterval);
    });
</script>

<div class="relative inline-flex items-center justify-center">
    <!-- Container with timer and rotating light -->
    <div class="relative h-16 w-16 rounded-full bg-slate-800/10 flex items-center justify-center">
        <!-- Rotating light dot -->
        <div class="absolute h-2 w-2 rounded-full bg-blue-400 shadow-blue-300/50 light-orbit"></div>
        
        <!-- Timer display -->
        <div class={`h-12 w-12 rounded-full flex items-center justify-center font-medium ${timerColor} bg-slate-800/80 border border-slate-700 text-sm`}>
            {formatTime(seconds)}
        </div>
    </div>
</div>

<style>
    /* Custom animation for orbiting light effect */
    .light-orbit {
        animation: orbit 3s linear infinite;
    }
    
    @keyframes orbit {
        0% { transform: rotate(0deg) translateX(28px) rotate(0deg); }
        100% { transform: rotate(360deg) translateX(28px) rotate(-360deg); }
    }
</style>
