<script>
	const props = $props();

	let visible = $state(false);
	let onAsk = $state(() => {});
	let onSkip = $state(() => {});
	let characterSrc = $state('/lufy1.png');

	$effect(() => {
		visible = props.visible ?? false;
		onAsk = props.onAsk ?? (() => {});
		onSkip = props.onSkip ?? (() => {});
		characterSrc = props.characterSrc ?? '/lufy1.png';
	});
</script>

{#if visible}
	<div class="doubt-overlay">
		<div class="doubt-card">
			<div class="character-bubble">
				<img src={characterSrc} alt="Asistente" loading="lazy" />
			</div>
			<div class="content">
				<h2>¿Tienes otra duda antes de terminar?</h2>
				<p>
					Activa tu micrófono o escríbenos para resolver cualquier detalle pendiente.
				</p>
				<div class="actions">
					<button type="button" class="game-btn primary" onclick={onAsk}>
						🎮 Sí, tengo dudas
					</button>
					<button type="button" class="game-btn secondary" onclick={onSkip}>
						✅ Todo claro
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	.doubt-overlay {
		position: fixed;
		inset: 0;
		display: flex;
		align-items: flex-end;
		justify-content: center;
		padding: 0 1.5rem 8rem;
		pointer-events: none;
		z-index: 45;
	}

	@media (min-width: 768px) {
		.doubt-overlay {
			align-items: center;
			padding-bottom: 6rem;
		}
	}

	.doubt-card {
		pointer-events: auto;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		max-width: 480px;
		width: 100%;
		padding: 1.75rem;
		border-radius: 22px;
		background: rgba(17, 24, 39, 0.7);
		border: 1px solid rgba(192, 132, 252, 0.4);
		box-shadow:
			0 25px 60px rgba(76, 29, 149, 0.45),
			0 0 0 1px rgba(192, 132, 252, 0.28);
		backdrop-filter: blur(18px);
		color: #e9d5ff;
	}

	.character-bubble {
		display: flex;
		justify-content: center;
	}

	.character-bubble img {
		width: 86px;
		height: auto;
		filter: drop-shadow(0 12px 25px rgba(168, 85, 247, 0.45));
		animation: gentleFloat 3s ease-in-out infinite;
	}

	.content h2 {
		font-size: 1.35rem;
		font-weight: 700;
		margin-bottom: 0.35rem;
		text-align: center;
		color: #f3e8ff;
	}

	.content p {
		text-align: center;
		font-size: 0.95rem;
		color: rgba(221, 214, 254, 0.85);
	}

	.actions {
		display: grid;
		gap: 0.75rem;
	}

	@media (min-width: 480px) {
		.actions {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	.game-btn {
		border: none;
		border-radius: 14px;
		padding: 0.9rem 1.2rem;
		font-size: 0.95rem;
		font-weight: 600;
		cursor: pointer;
		transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
	}

	.game-btn.primary {
		background: linear-gradient(135deg, rgba(147, 197, 253, 0.25), rgba(167, 139, 250, 0.45));
		color: #ede9fe;
		box-shadow: 0 12px 24px rgba(126, 34, 206, 0.35);
		border: 1px solid rgba(147, 197, 253, 0.5);
	}

	.game-btn.secondary {
		background: rgba(30, 41, 59, 0.75);
		color: rgba(226, 232, 240, 0.85);
		border: 1px solid rgba(148, 163, 184, 0.4);
	}

	.game-btn:hover {
		transform: translateY(-2px) scale(1.01);
	}

	.game-btn.primary:hover {
		background: linear-gradient(135deg, rgba(129, 140, 248, 0.35), rgba(147, 197, 253, 0.6));
		box-shadow: 0 18px 30px rgba(126, 34, 206, 0.4);
	}

	.game-btn.secondary:hover {
		background: rgba(30, 41, 59, 0.9);
		box-shadow: 0 14px 28px rgba(30, 41, 59, 0.35);
	}

	.game-btn:active {
		transform: translateY(0);
	}

	@keyframes gentleFloat {
		0%,
		100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-6px);
		}
	}
</style>
