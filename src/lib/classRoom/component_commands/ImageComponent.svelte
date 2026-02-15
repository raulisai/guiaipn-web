<script>
    import { onMount, onDestroy } from 'svelte';

    let {
        params = {},
        layout = {},
        context = 'panel'
    } = $props();

    let isVisible = $state(true);
    let imageLoaded = $state(false);
    let loadError = $state(false);
    let timerId = null;

    const imageUrl = $derived(params.url || params.src || '');
    const altText = $derived(params.alt || params.title || '');
    const title = $derived(params.title || '');
    const description = $derived(params.description || '');
    const autoClose = $derived(!!params.auto_close);
    const duration = $derived.by(() => {
        const value = Number(params.duration ?? params.timeout);
        return Number.isFinite(value) && value > 0 ? value : null;
    });

    const containerStyle = $derived.by(() => {
        const styles = [];
        if (layout.width) styles.push(`width: ${layout.width}`);
        if (layout.minWidth) styles.push(`min-width: ${layout.minWidth}`);
        if (layout.maxWidth) styles.push(`max-width: ${layout.maxWidth}`);
        if (layout.height) styles.push(`height: ${layout.height}`);
        if (layout.maxHeight) styles.push(`max-height: ${layout.maxHeight}`);
        return styles.join('; ');
    });

    const alignmentClass = $derived.by(() => {
        const align = layout.align || layout.alignment;
        if (align === 'center') return 'justify-center';
        if (align === 'end' || align === 'right') return 'justify-end';
        return 'justify-start';
    });

    $effect(() => {
        console.log('🖼️ ImageComponent params recibidos:', params, { layout, context });
    });

    $effect(() => {
        if (autoClose && duration) {
            if (timerId) {
                clearTimeout(timerId);
            }
            timerId = setTimeout(() => {
                isVisible = false;
            }, duration);

            return () => {
                if (timerId) {
                    clearTimeout(timerId);
                    timerId = null;
                }
            };
        }

        if (timerId) {
            clearTimeout(timerId);
            timerId = null;
        }
    });

    onDestroy(() => {
        if (timerId) {
            clearTimeout(timerId);
        }
    });

    function handleLoad() {
        imageLoaded = true;
    }

    function handleError() {
        loadError = true;
    }
</script>

{#if isVisible}
    <article
        class={`component-image-wrapper ${alignmentClass}`}
        style={containerStyle}
        data-context={context}
    >
        <div class="component-image-card">
            {#if title}
                <header class="component-image-header">
                    <h3>{title}</h3>
                </header>
            {/if}

            {#if !loadError && imageUrl}
                <div class="component-image-media" class:loaded={imageLoaded}>
                    <img
                        src={imageUrl}
                        alt={altText || 'Imagen descriptiva'}
                        loading="lazy"
                        decoding="async"
                        onload={handleLoad}
                        onerror={handleError}
                    />
                    {#if params.caption}
                        <span class="component-image-caption">{params.caption}</span>
                    {/if}
                </div>
            {:else}
                <div class="component-image-placeholder">
                    <span>{loadError ? 'No se pudo cargar la imagen' : 'Imagen no disponible'}</span>
                </div>
            {/if}

            {#if description}
                <p class="component-image-description">{description}</p>
            {/if}

            {#if autoClose && duration}
                <footer class="component-image-footer">
                    <span>Se cerrará automáticamente en {Math.ceil((duration ?? 0) / 1000)}s</span>
                </footer>
            {/if}
        </div>
    </article>
{/if}

<style>
    :global(.component-image-wrapper) {
        display: flex;
        width: 100%;
    }

    :global(.component-image-wrapper.justify-start) {
        justify-content: flex-start;
    }

    :global(.component-image-wrapper.justify-center) {
        justify-content: center;
    }

    :global(.component-image-wrapper.justify-end) {
        justify-content: flex-end;
    }

    .component-image-card {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        background: rgba(30, 41, 59, 0.65);
        border: 1px solid rgba(99, 102, 241, 0.25);
        border-radius: 0.75rem;
        padding: 1rem;
        box-shadow: 0 12px 32px rgba(15, 23, 42, 0.35);
        max-width: min(100%, 420px);
        transition: transform 0.25s ease, box-shadow 0.25s ease;
    }

    .component-image-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 20px 45px rgba(15, 23, 42, 0.45);
    }

    .component-image-header h3 {
        font-size: 1rem;
        font-weight: 600;
        color: #a5b4fc;
        letter-spacing: 0.04em;
        text-transform: uppercase;
    }

    .component-image-media {
        position: relative;
        overflow: hidden;
        border-radius: 0.6rem;
        border: 1px solid rgba(148, 163, 184, 0.25);
        background: rgba(15, 23, 42, 0.6);
        min-height: 160px;
    }

    .component-image-media img {
        display: block;
        width: 100%;
        height: auto;
        object-fit: cover;
        transition: transform 0.6s ease;
    }

    .component-image-media.loaded img:hover {
        transform: scale(1.03);
    }

    .component-image-caption {
        position: absolute;
        bottom: 0.5rem;
        right: 0.5rem;
        background: rgba(15, 23, 42, 0.75);
        border-radius: 9999px;
        padding: 0.25rem 0.75rem;
        font-size: 0.75rem;
        color: rgba(226, 232, 240, 0.8);
        border: 1px solid rgba(148, 163, 184, 0.2);
    }

    .component-image-placeholder {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 160px;
        border-radius: 0.6rem;
        border: 1px dashed rgba(148, 163, 184, 0.4);
        color: rgba(148, 163, 184, 0.7);
        font-size: 0.85rem;
        text-align: center;
        padding: 0.75rem;
    }

    .component-image-description {
        font-size: 0.9rem;
        line-height: 1.4;
        color: rgba(226, 232, 240, 0.85);
    }

    .component-image-footer {
        font-size: 0.75rem;
        color: rgba(148, 163, 184, 0.7);
        text-align: right;
    }

    @media (max-width: 640px) {
        .component-image-card {
            max-width: 100%;
        }
    }
</style>
