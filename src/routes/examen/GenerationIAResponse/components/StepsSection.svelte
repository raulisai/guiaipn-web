<script lang="ts">
	import { fade, fly, slide } from 'svelte/transition';
	import { cubicOut, elasticOut } from 'svelte/easing';
	
	const { steps } = $props<{ steps: string[] }>();
	
	let activeStep = $state(-1);
	
	function setActiveStep(index) {
		activeStep = activeStep === index ? -1 : index;
	}
</script>

<div class="w-full my-2">
	<div class="cyber-steps w-full">		
		<ol class="list-none pl-0 space-y-5">
			{#each steps as paso, i}
				<li 
					class="step-item" 
					class:active={activeStep === i}
					style="--index: {i}"
					in:fly={{ y: 30, delay: 200 + (i * 100), duration: 500, easing: cubicOut }}
				>
					<button 
						class="flex items-start w-full text-left focus:outline-none rounded-md p-0 transition-all"
						onclick={() => setActiveStep(i)}
					>
						<div class="step-number-container mr-4">
							<div class="cyber-circle">
								<span class="step-number">{i + 1}</span>
							</div>
							{#if i < steps.length - 1}
								<div class="step-connector"></div>
							{/if}
						</div>
						
						<div class="step-content-wrapper py-2">
							<!-- Step label always visible -->
							<div class="step-label">
								<span class="text-purple-300 font-medium mb-1 block text-sm tracking-wide">
									PASO {i + 1}
								</span>
							</div>

							<!-- Step content collapses/expands when clicked -->
							<div class="step-content-toggle">
								<div class="step-content" class:expanded={activeStep === i}>
									{paso}
									{#if activeStep === i}
										<div class="cyber-underline mt-2" transition:slide={{ duration: 300 }}></div>
									{/if}
								</div>
							</div>
						</div>
					</button>
				</li>
			{/each}
		</ol>
	</div>
</div>

<style>
	.cyber-steps {
		position: relative;
	}
	
	.step-item {
		position: relative;
		cursor: pointer;
		transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
		border-radius: 0.5rem;
		padding: 0.5rem;
	}
	
	.step-item:hover {
		transform: translateX(5px);
		background-color: rgba(72, 59, 149, 0.15);
	}
	
	.step-number-container {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	
	.cyber-circle {
		width: 36px;
		height: 36px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		background: rgba(28, 28, 45, 0.8);
		border: 2px solid rgba(130, 40, 245, 0.5);
		box-shadow: 0 0 10px rgba(130, 40, 245, 0.3);
		position: relative;
		z-index: 2;
		transition: all 0.3s ease;
	}
	
	.step-item:hover .cyber-circle {
		transform: scale(1.1);
		box-shadow: 0 0 15px rgba(130, 40, 245, 0.5);
		border-color: rgba(130, 40, 245, 0.8);
	}
	
	.step-item.active .cyber-circle {
		background: rgba(130, 40, 245, 0.3);
		border-color: rgba(130, 40, 245, 0.8);
		box-shadow: 0 0 20px rgba(130, 40, 245, 0.5);
	}
	
	.step-number {
		color: rgba(235, 225, 255, 0.9);
		font-weight: bold;
		font-size: 0.9rem;
	}
	
	.step-connector {
		position: absolute;
		top: 36px;
		height: calc(100% - 10px);
		width: 2px;
		background: linear-gradient(to bottom, rgba(130, 40, 245, 0.5), rgba(130, 40, 245, 0.1));
		z-index: 1;
	}
	
	.step-content-wrapper {
		position: relative;
		flex: 1;
	}
	
	.step-content {
		color: rgba(210, 210, 230, 0.9);
		text-shadow: 0 0 5px rgba(130, 40, 245, 0.2);
		font-size: 0.95rem;
		line-height: 1.5;
		transition: all 0.4s ease;
		max-height: 60px;
		overflow: hidden;
		text-overflow: ellipsis;
		position: relative;
	}
	
	.step-content.expanded {
		max-height: 1000px; /* Large enough to show full content */
	}
	
	.cyber-underline {
		height: SI2px;
		background: linear-gradient(to right, rgba(130, 40, 245, 0.7), rgba(0, 212, 255, 0.7), rgba(130, 40, 245, 0.7));
		background-size: 200% auto;
		animation: shimmer 2s linear infinite;
	}
	
	@keyframes shimmer {
		to { background-position: 200% center; }
	}
	
	
	.step-item.active {
		background-color: rgba(79, 70, 229, 0.2);
		transform: scale(1.02);
	}
	
	.step-content {
		transition: all 0.3s ease;
	}
	
	.active .step-content {
		font-weight: 500;
	}
	
	.active .step-number {
		transform: scale(1.2);
		box-shadow: 0 0 15px rgba(99, 102, 241, 0.6);
	}
	
	.pulse-animation {
		animation: pulse 2s infinite;
	}
	
	@keyframes pulse {
		0% { transform: scale(1); opacity: 1; }
		50% { transform: scale(1.5); opacity: 0.7; }
		100% { transform: scale(1); opacity: 1; }
	}
	
	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	
	@media screen and (max-width: 768px) {
		.step-content {
			font-size: 14px;
		}
		
		.active .step-content {
			font-size: 15px;
		}
	}
</style>
