<script lang="ts">
  import { fly, scale } from 'svelte/transition';
  import { elasticOut, cubicOut } from 'svelte/easing';
  
  export let tips: string;
  let hovering = false;
</script>

<button
  on:mouseenter={() => hovering = true}
  on:mouseleave={() => hovering = false}
  class="cyber-tip-button relative inline-flex items-center justify-center"
  aria-label="Ver consejos"
>
  <!-- Cyberpunk tip icon with glowing effect -->
  <div class="cyber-tip-icon">
    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 24 24" stroke="currentColor" fill="none">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 2a7 7 0 00-7 7c0 3.313 2.243 6.12 5.217 6.854L10 21h4l.783-5.146A7.001 7.001 0 0019 9a7 7 0 00-7-7z" />
    </svg>
    <div class="cyber-tip-glow"></div>
  </div>

  <!-- Cyberpunk styled tooltip -->
  {#if hovering}
    <div
      transition:fly={{ y: 15, duration: 300, easing: cubicOut }}
      class="cyber-tooltip"
    >
      <div class="cyber-tooltip-header">
        <span class="text-xs font-mono tracking-wide text-cyan-300">TIP::INFO</span>
        <div class="cyber-dots">
          <div class="cyber-dot"></div>
          <div class="cyber-dot"></div>
        </div>
      </div>
      <div class="cyber-tooltip-content">
        {tips}
      </div>
      <div class="cyber-tooltip-arrow"></div>
    </div>
  {/if}
</button>

<style>
  /* Cyberpunk tip button */
  .cyber-tip-button {
    padding: 0.6rem;
    background: rgba(0, 195, 255, 0.1);
    border: 1px solid rgba(0, 195, 255, 0.3);
    border-radius: 6px;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    position: relative;
    overflow: hidden;
  }
  
  .cyber-tip-button:hover {
    background: rgba(0, 195, 255, 0.2);
    box-shadow: 0 0 15px rgba(0, 195, 255, 0.5);
    transform: translateY(-2px);
  }
  
  .cyber-tip-button:active {
    transform: translateY(1px);
  }
  
  /* Tip icon with glow effect */
  .cyber-tip-icon {
    position: relative;
    color: rgba(0, 195, 255, 0.9);
    z-index: 1;
  }
  
  .cyber-tip-glow {
    position: absolute;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle, rgba(0, 195, 255, 0.3) 0%, transparent 70%);
    top: 0;
    left: 0;
    z-index: 0;
    animation: pulse-glow 2s infinite alternate;
    opacity: 0.7;
  }
  
  @keyframes pulse-glow {
    0% { opacity: 0.3; transform: scale(0.9); }
    100% { opacity: 0.7; transform: scale(1.1); }
  }
  
  /* Cyberpunk tooltip */  .cyber-tooltip {
    position: absolute;
    bottom: calc(100% + 10px);
    left: 50%;
    transform: translateX(-50%);
    width: 250px;
    z-index: 10;
    background: rgba(16, 20, 31, 0.9);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(0, 195, 255, 0.4);
    border-radius: 6px;
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.5), 0 0 15px rgba(0, 195, 255, 0.3);
    overflow: hidden;
  }
  	/* Global cyberpunk style for entire app */
	:global(.cyber-background) {
		background-color: #0a0b12 !important;
		background-image: 
			radial-gradient(circle at 50% 50%, rgba(17, 24, 39, 1), rgba(10, 11, 18, 1)),
			linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.8));
	}
  .cyber-tooltip-header {
    padding: 0.5rem 0.75rem;
    background: rgba(10, 12, 18, 0.8);
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid rgba(0, 195, 255, 0.3);
  }
  
  .cyber-dots {
    display: flex;
    gap: 4px;
  }
  
  .cyber-dot {
    width: 4px;
    height: 4px;
    background: rgba(0, 195, 255, 0.7);
    border-radius: 50%;
  }
  
  .cyber-tooltip-content {
    padding: 0.75rem;
    font-size: 0.85rem;
    color: rgba(220, 230, 240, 0.9);
    text-shadow: 0 0 5px rgba(0, 195, 255, 0.3);
    font-family: 'Courier New', monospace;
    max-height: 150px;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: rgba(0, 195, 255, 0.4) transparent;
  }
  
  .cyber-tooltip-content::-webkit-scrollbar {
    width: 3px;
  }
  
  .cyber-tooltip-content::-webkit-scrollbar-track {
    background: transparent;
  }
  
  .cyber-tooltip-content::-webkit-scrollbar-thumb {
    background-color: rgba(0, 195, 255, 0.4);
    border-radius: 10px;
  }
  
  .cyber-tooltip-arrow {
    position: absolute;
    bottom: -6px;
    left: 50%;
    transform: translateX(-50%) rotate(45deg);
    width: 12px;
    height: 12px;
    background: rgba(16, 20, 31, 0.9);
    border-right: 1px solid rgba(0, 195, 255, 0.4);
    border-bottom: 1px solid rgba(0, 195, 255, 0.4);
  }
</style>
