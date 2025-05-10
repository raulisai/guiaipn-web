<script lang="ts">
	
	export let content: string;
	import { fade, fly, scale } from 'svelte/transition';
	import { elasticOut } from 'svelte/easing';
	
	// Parse content to format code/formulas distinctly
	$: formattedContent = formatContent(content);
	
	function formatContent(text) {
		// Simple content formatting - this could be enhanced with regex for specific formula patterns
		return text.split('\n').filter(line => line.trim().length > 0);
	}
</script>

<div class="flex flex-col items-center">
	<div class="cyber-concept-container">
		<!-- Holographic effect elements -->
		<div class="hologram-lines"></div>
		<div class="hologram-grid"></div>

		<!-- Formula content with glowing effect -->
		<div class="cyber-formula-content">
			{#each formattedContent as line, i}
				<div 
					class="formula-line" 
					in:fly={{ x: 50, delay: i * 100, duration: 400, opacity: 0 }}
				>
					{line}
				</div>
			{/each}
		</div>

		<!-- Scanning effect -->
		<div class="scan-line"></div>
	</div>
</div>

<style>
	.cyber-concept-container {
		position: relative;
		background: rgba(25, 26, 35, 0.7);
		padding: 1.5rem;
		border-radius: 8px;
		border: 1px solid rgba(255, 216, 0, 0.3);
		box-shadow: 
			0 5px 15px rgba(0, 0, 0, 0.4),
			0 0 20px rgba(255, 216, 0, 0.2);
		overflow: hidden;
		width: 100%;
		max-width: 600px;
		backdrop-filter: blur(10px);
	}
	
	.cyber-concept-container::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 2px;
		background: linear-gradient(90deg, transparent, rgba(255, 216, 0, 0.7), transparent);
	}
	
	.hologram-lines {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: repeating-linear-gradient(
			0deg,
			transparent,
			rgba(255, 216, 0, 0.03) 1px,
			transparent 2px
		);
		pointer-events: none;
	}
	
	.hologram-grid {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: 
			linear-gradient(90deg, rgba(255, 216, 0, 0.03) 1px, transparent 1px),
			linear-gradient(0deg, rgba(255, 216, 0, 0.03) 1px, transparent 1px);
		background-size: 20px 20px;
		pointer-events: none;
	}
	
	.cyber-formula-content {
		position: relative;
		z-index: 2;
		color: rgba(255, 238, 170, 0.9);
		text-shadow: 0 0 5px rgba(255, 216, 0, 0.5);
		font-family: "Courier New", monospace;
		line-height: 1.6;
	}
	
	.formula-line {
		margin-bottom: 0.75rem;
		padding: 0.5rem;
		background-color: rgba(255, 216, 0, 0.05);
		border-left: 2px solid rgba(255, 216, 0, 0.4);
		transition: all 0.3s ease;
	}
	
	.formula-line:hover {
		background-color: rgba(255, 216, 0, 0.1);
		transform: translateX(5px);
	}
	
	.scan-line {
		position: absolute;
		left: 0;
		right: 0;
		height: 2px;
		background: linear-gradient(90deg, transparent, rgba(255, 216, 0, 0.7), transparent);
		top: 0;
		animation: scanDown 2s cubic-bezier(0.42, 0, 0.58, 1) infinite;
		opacity: 0.5;
		z-index: 1;
	}
	
	@keyframes scanDown {
		0% { transform: translateY(0); }
		100% { transform: translateY(100%); }
	}
</style>
