<script>
	import { onMount } from 'svelte';
	import Math from '../../examen/componentes/Math.svelte';

	let { content = '', type = 'text' } = $props();
	
	let displayedContent = $state('');
	let isTyping = $state(true);
	let currentIndex = $state(0);

	// Efecto typewriter
	$effect(() => {
		if (content && currentIndex < content.length) {
			const timer = setTimeout(() => {
				displayedContent = content.substring(0, currentIndex + 1);
				currentIndex++;
			}, 30); // 30ms por carácter

			return () => clearTimeout(timer);
		} else if (currentIndex >= content.length) {
			isTyping = false;
		}
	});

	// Reset cuando cambia el contenido
	$effect(() => {
		if (content) {
			currentIndex = 0;
			displayedContent = '';
			isTyping = true;
		}
	});
</script>

<div class="content-renderer">
	{#if type === 'math'}
		<!-- Renderizar matemáticas con KaTeX -->
		<div class="math-content">
			<Math content={displayedContent} isBlock={false} />
		</div>
	{:else if type === 'text'}
		<!-- Renderizar texto plano -->
		<div class="text-content text-gray-200 leading-relaxed">
			<p class="whitespace-pre-wrap">{displayedContent}</p>
			{#if isTyping}
				<span class="typing-cursor">▋</span>
			{/if}
		</div>
	{:else if type === 'image'}
		<!-- Descripción de imagen/diagrama -->
		<div class="image-description text-gray-300 italic">
			<p class="whitespace-pre-wrap">{displayedContent}</p>
			{#if isTyping}
				<span class="typing-cursor">▋</span>
			{/if}
		</div>
	{/if}
</div>

<style>
	.content-renderer {
		min-height: 2rem;
	}

	.typing-cursor {
		display: inline-block;
		animation: blink 1s infinite;
		color: #10b981;
		margin-left: 2px;
	}

	@keyframes blink {
		0%, 49% {
			opacity: 1;
		}
		50%, 100% {
			opacity: 0;
		}
	}

	.math-content {
		padding: 0.5rem 0;
	}

	.text-content, .image-description {
		font-size: 1rem;
		line-height: 1.7;
	}
</style>
