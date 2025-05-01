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
  <!-- Icono de “i” o “?” -->
  <span class="font-semibold">Tips</span>

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
