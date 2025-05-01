<script lang="ts">
  import katex from "katex";
  // Need to import the KaTeX CSS if not imported elsewhere
  import "katex/dist/katex.min.css";
  import { onMount } from "svelte";

  export let content: string;
  export let isBlock: boolean = false;
  
  let container: HTMLElement;
  
  function renderMath() {
    if (container) {
      try {
        katex.render(content, container, {
          throwOnError: false,
          displayMode: isBlock
        });
      } catch (error) {
        console.error("KaTeX rendering error:", error);
        container.textContent = content; // Fallback to plain text
      }
    }
  }

  onMount(renderMath);
  
  $: if (container && content) {
    renderMath();
  }
</script>
  
<svelte:element 
  this={isBlock ? "div" : "span"}
  class="text-center text-sm break-words md:whitespace-normal max-w-full 
  {isBlock ? 'math-block' : 'math-inline'}"
  bind:this={container}
/>

<style>

  
</style>