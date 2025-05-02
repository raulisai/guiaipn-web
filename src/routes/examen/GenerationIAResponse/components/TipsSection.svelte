<script lang="ts">
  import { fly } from 'svelte/transition';
  export let tips: string;
  let hovering = false;
</script>

<button
  on:mouseenter={() => hovering = true}
  on:mouseleave={() => hovering = false}
  class="relative inline-flex items-center justify-center p-2 bg-gray-700 text-gray-200 rounded hover:bg-gray-600 focus:outline-none"
>
         <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 2a7 7 0 00-7 7c0 3.313 2.243 6.12 5.217 6.854L10 21h4l.783-5.146A7.001 7.001 0 0019 9a7 7 0 00-7-7z" />
         </svg>
       

  {#if hovering}
    <div
      transition:fly={{ y: 8, duration: 200 }}
      class="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 w-56 bg-gray-800/90 text-gray-200 text-sm p-3 rounded shadow-lg z-10"
    >
      {tips}
      <!-- Flecha en la parte inferior -->
      <div class="absolute top-full left-1/2 transform -translate-x-1/2 w-3 h-3 bg-gray-800/90 rotate-45"></div>
    </div>
  {/if}
</button>
