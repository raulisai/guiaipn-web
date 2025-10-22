# Sistema de Renderizado Progresivo del Canvas

## Descripción General

Sistema que renderiza los comandos del canvas de forma secuencial y sincronizada con la explicación del texto, con efectos visuales de aparición gradual (fade-in).

## Arquitectura

### Componentes Principales

1. **CanvasVisualization.svelte** - Componente de canvas con renderizado progresivo
2. **explanationStore.js** - Store que maneja el buffer de comandos
3. **+page.svelte** - Página principal que coordina la sincronización

## Flujo de Renderizado

### 1. Recepción de Comandos

```javascript
// Los comandos llegan desde el backend vía Socket.IO
socketService.onCanvasCommand((data) => {
    explanationStore.addCanvasCommand(data);
});
```

### 2. Buffer de Comandos

Los comandos se almacenan en el buffer del store:

```javascript
buffer: {
    canvasCommands: [
        {
            step: 1,
            command: {
                command: "draw_equation",
                parameters: { ... }
            },
            renderedAt: null
        }
    ]
}
```

### 3. Filtrado por Paso Actual y Anteriores

Se muestran comandos del paso actual (mientras se explica) y de pasos anteriores:

```javascript
const currentCanvasCommands = $derived(
    $explanationStore.buffer.canvasCommands.filter((cmd) => 
        cmd.step <= $explanationStore.currentStep
    )
);
```

**Cambio importante:** Los comandos ahora aparecen **durante** la explicación del paso, no al finalizar.

### 4. Cola de Renderizado Progresivo

Cuando llegan nuevos comandos, se agregan a una cola:

```javascript
$effect(() => {
    if (hasNewContent) {
        newCommands.forEach((cmd, idx) => {
            renderQueue.push({
                command: cmd,
                originalIndex: previousCommandCount + idx,
                step: cmd.step || 1
            });
        });
        
        if (!isAnimating) {
            processRenderQueue();
        }
    }
});
```

### 5. Procesamiento Secuencial

Los comandos se procesan uno por uno con delays muy cortos para sincronizar con el texto:

```javascript
async function processRenderQueue() {
    while (renderQueue.length > 0) {
        const item = renderQueue.shift();
        
        // Marcar como renderizado con timestamp
        renderedCommands.get(step).add(originalIndex);
        commandTimestamps.set(originalIndex, Date.now());
        
        // Redibujar con fade-in
        await drawCanvasProgressive(canvasElement, step);
        
        // Delay mucho más largo para renderizado muy lento
        const delay = renderQueue.length > 5 ? 1200 : 1800;
        await new Promise(resolve => setTimeout(resolve, delay));
    }
}
```

## Efectos Visuales

### Fade-In Progresivo

Cada comando aparece gradualmente durante 1 segundo:

```javascript
// Calcular opacidad basada en tiempo transcurrido
const timestamp = commandTimestamps.get(commandIndex);
const elapsed = Date.now() - timestamp;
const fadeDuration = 1000;
const opacity = Math.min(1.0, elapsed / fadeDuration);

ctx.globalAlpha = opacity;
executeCommand(ctx, command.command, rect.width, currentYOffset);
ctx.globalAlpha = 1.0;
```

### Animación Continua

Si hay fades activos, se repinta automáticamente:

```javascript
const hasActiveFades = stepCommands.some((command) => {
    const elapsed = Date.now() - timestamp;
    return elapsed < 400;
});

if (hasActiveFades) {
    requestAnimationFrame(() => drawCanvasProgressive(canvasElement, step));
}
```

## Sincronización con Texto

### Paso 1: Paso inicia

```javascript
syncService.onStepStart((checkpoint, stepIndex) => {
    explanationStore.setCurrentStep(checkpoint.step);
});
```

### Paso 2: Comandos de canvas se filtran en tiempo real

```javascript
const currentCanvasCommands = $derived(
    $explanationStore.buffer.canvasCommands.filter((cmd) => 
        cmd.step <= $explanationStore.currentStep
    )
);
```

**Los comandos aparecen DURANTE la explicación, no al final.**

### Paso 3: Comandos se renderizan progresivamente

Los comandos del paso actual entran en la cola y se dibujan uno por uno mientras el texto se renderiza.

### Paso 4: Monitoreo de progreso

```javascript
syncService.onProgress((checkpoint, progress, charIndex, totalChars) => {
    console.log(`Progreso: ${progress}%`);
    console.log(`Comandos visibles: ${currentCanvasCommands.length}`);
});
```

## Características

### ✅ Renderizado Secuencial
- Los comandos se dibujan uno tras otro
- No todos aparecen al mismo tiempo

### ✅ Efecto Fade-In
- Aparición gradual de 0% a 100% opacidad
- Duración: 1 segundo por comando (muy visible y lento)

### ✅ Delay Adaptativo
- 1.8 segundos entre comandos (normal)
- 1.2 segundos entre comandos (si hay muchos en cola)

### ✅ Sincronización en Tiempo Real
- Muestra comandos del paso actual mientras se explica
- Aparecen DURANTE la explicación, no al final
- Monitoreo de progreso cada 25%

### ✅ Auto-scroll
- Scroll automático al nuevo contenido
- Centrado inteligente del canvas

### ✅ Renderizado Completo al Finalizar
- Cuando termina un paso, todos sus comandos se muestran completos
- No se pierden comandos si el usuario avanza rápido

## Comandos Soportados

- `draw_equation` - Ecuaciones matemáticas
- `draw_line` - Líneas
- `draw_circle` - Círculos
- `draw_arrow` - Flechas
- `draw_text` - Texto
- `draw_triangle` - Triángulos
- `draw_vector` - Vectores
- `draw_diagram` - Diagramas complejos
- `highlight` - Resaltado de respuestas
- `draw_axis` - Ejes cartesianos

## Ejemplo de Uso

```svelte
<CanvasVisualization 
    commands={currentCanvasCommands} 
    currentStep={$explanationStore.currentStep}
    isRendering={$explanationStore.render.isRendering}
/>
```

## Props del Componente

- **commands**: Array de comandos filtrados por pasos completados
- **currentStep**: Número del paso actual
- **isRendering**: Si está en proceso de renderizado de texto

## Optimizaciones

### Performance
- Usa `requestAnimationFrame` para animaciones suaves
- Canvas con device pixel ratio para pantallas retina
- Altura dinámica basada en número de comandos

### Memoria
- Limpia timestamps de comandos antiguos
- Reutiliza canvas elements por paso
- No duplica comandos en memoria

## Debugging

Para ver el flujo de renderizado:

```javascript
console.log('📊 Canvas command guardado:', normalizedCommand);
console.log('🎨 Renderizando comando:', commandIndex, 'con opacidad:', opacity);
```

## Mejoras Futuras

- [ ] Efectos de entrada más variados (slide, scale, etc.)
- [ ] Animación de trazado para líneas y flechas
- [ ] Partículas o efectos especiales para highlights
- [ ] Replay de animaciones
- [ ] Control de velocidad de renderizado
