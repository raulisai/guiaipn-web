<script lang="ts">
	export let steps: string[];
	let activeStep = -1;
	
	
</script>

<div class="flex justify-center w-full my-6">
	<div class="w-full max-w-3xl">
		<h3 class="text-gray-200 text-sm font-medium mb-3 flex items-center justify-center">
			<span class="inline-block w-1.5 h-1.5 bg-indigo-400 rounded-full mr-2"></span>
			Pasos para resolver
		</h3>
		
		<div class="text-gray-200  p-5 rounded-lg border-l-2 border-indigo-500/70 shadow-lg">
			<ol class="list-none pl-0 space-y-4">
				{#each steps as paso, i}
					<li class="step-item" class:active={activeStep === i}>
						<div 
							class="flex items-start w-full text-left focus:outline-none rounded-md p-1 transition-transform transform hover:scale-115"
							
						>
							<span class="flex-shrink-0 inline-flex items-center justify-center h-7 w-7 rounded-full 
								bg-gradient-to-br from-indigo-600 to-purple-700 text-white mr-4 shadow-md 
								transition-all duration-300 hover:scale-110 step-number">
								{i + 1}
							</span>
							<span class="leading-relaxed step-content">{paso}</span>
						</div>
					</li>
				{/each}
			</ol>
		</div>
	</div>
</div>

<style>
	
	.step-item {
		animation: fadeIn 0.5s ease-out forwards;
		animation-delay: calc(0.1s * var(--index, 0));
		opacity: 0;
		cursor: pointer;
		transition: all 0.3s ease;
		padding: 0.75rem;
		border-radius: 0.5rem;
	}
	
	.step-item:hover {
		background-color: rgba(86, 107, 202, 0.473);
		transform: translateX(5px);
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
