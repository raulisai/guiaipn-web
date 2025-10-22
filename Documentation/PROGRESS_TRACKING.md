# Sistema de Tracking de Progreso y Activación del Canvas al 50%

## Descripción General

Sistema que mapea con precisión el progreso de cada paso de la explicación y activa el renderizado del canvas cuando el paso alcanza el 50% de su contenido.

## Arquitectura

### Estado de Progreso en explanationStore

```javascript
stepProgress: {
    stepNumber: 0,        // Número del paso actual
    percentage: 0,        // Progreso 0-100%
    charIndex: 0,         // Carácter actual
    totalChars: 0,        // Total de caracteres
    canvasTriggered: false // Si ya se activó el canvas
}
```

### Actualización en Tiempo Real

El `syncService` actualiza el progreso en cada carácter renderizado:

```javascript
// En syncService.renderContent()
const progress = Math.round((i / content.length) * 100);

// Actualizar progreso en el store
explanationStore.updateStepProgress(checkpoint.step, progress, i, content.length);
```

## Filtrado de Comandos del Canvas

### Lógica de Filtrado Dinámica

Los comandos se muestran según la cantidad de comandos en el paso:

**1 comando**: Se activa al 100% (al final)
**2 comandos**: Se activan al 50% y 100%
**3 comandos**: Se activan al 33%, 66%, 100%
**4 comandos**: Se activan al 25%, 50%, 75%, 100%

```javascript
const currentCanvasCommands = $derived(
    $explanationStore.buffer.canvasCommands.filter((cmd) => {
        // Pasos anteriores: mostrar todos
        if (cmd.step < $explanationStore.currentStep) {
            return true;
        }
        
        // Paso actual: calcular según cantidad de comandos
        if (cmd.step === $explanationStore.currentStep) {
            // Obtener todos los comandos de este paso
            const stepCommands = $explanationStore.buffer.canvasCommands.filter(
                c => c.step === $explanationStore.currentStep
            );
            const totalCommandsInStep = stepCommands.length;
            
            // Calcular el índice de este comando dentro del paso
            const commandIndexInStep = stepCommands.findIndex(c => c === cmd);
            
            // Calcular el porcentaje necesario para mostrar este comando
            const percentagePerCommand = 100 / totalCommandsInStep;
            const requiredPercentage = (commandIndexInStep + 1) * percentagePerCommand;
            
            return $explanationStore.stepProgress.percentage >= requiredPercentage;
        }
        
        // Pasos futuros: no mostrar
        return false;
    })
);
```

### Flujo de Activación (Ejemplo con 4 comandos)

1. **Paso inicia** (0%)
   - `stepProgress.percentage = 0`
   - `canvasTriggered = false`
   - 0 comandos visibles

2. **Progreso al 25%** ⚡
   - `stepProgress.percentage = 25`
   - Comando 1 se activa
   - Log: `🎯 TRIGGER 25% - Activando comando 1/4`

3. **Progreso al 50%** ⚡
   - `stepProgress.percentage = 50`
   - Comando 2 se activa
   - Log: `🎯 TRIGGER 50% - Activando comando 2/4`

4. **Progreso al 75%** ⚡
   - `stepProgress.percentage = 75`
   - Comando 3 se activa
   - Log: `🎯 TRIGGER 75% - Activando comando 3/4`

5. **Progreso al 100%** ⚡
   - `stepProgress.percentage = 100`
   - Comando 4 se activa
   - Log: `🎯 TRIGGER 100% - Activando comando 4/4`
   - Paso completo

## Componente ProgressIndicator

### Características

- **Posición**: Fixed, top-right
- **Información mostrada**:
  - Número del paso actual
  - Porcentaje de progreso
  - Barra de progreso visual
  - Marcador al 50%
  - Contador de caracteres
  - Estado del canvas

### Estados Visuales

**Antes del 50%:**
```
Paso 1                    35%
[████████░░░░░░░░░░░░] 50%
125 / 350 caracteres
○ Esperando 50%
```

**Al 50% o más:**
```
Paso 1                    50%
[████████████🎨░░░░░░] 50%
175 / 350 caracteres
✓ Canvas activado
```

### Animaciones

- **Entrada**: Slide-in desde la derecha
- **Porcentaje al 50%**: Color verde + glow
- **Marcador 🎨**: Pulse animation
- **Barra**: Transición suave

## Logging y Monitoreo

### Logs Continuos

```javascript
syncService.onProgress((checkpoint, progress, charIndex, totalChars) => {
    console.log(`📊 Progreso paso ${checkpoint.step}: ${progress}%`);
});
```

### Log Especial al 50%

```javascript
if (progress === 50) {
    console.log(`🎯 TRIGGER 50% - Activando canvas para paso ${checkpoint.step}`);
    console.log(`🎨 Comandos canvas disponibles: ${total}`);
    console.log(`🖌️ Comandos visibles: ${visible}`);
}
```

## Ejemplo de Timeline

### Paso con 200 caracteres (velocidad 20ms/char)

```
T=0s      Paso inicia (0%)
T=1s      50 chars (25%)
T=2s      100 chars (50%) ⚡ CANVAS ACTIVADO
T=3s      150 chars (75%)
T=4s      200 chars (100%) ✓ Paso completo
```

### Sincronización Canvas

```
T=0s      Paso 1 inicia
T=2s      Llega al 50%
T=2s      Comandos entran en renderQueue
T=2.1s    Primer comando aparece (fade-in 1s)
T=3.9s    Segundo comando aparece
T=5.7s    Tercer comando aparece
```

## Funciones del Store

### updateStepProgress

```javascript
updateStepProgress(stepNumber, percentage, charIndex, totalChars) {
    update(state => ({
        ...state,
        stepProgress: {
            stepNumber,
            percentage,
            charIndex,
            totalChars,
            canvasTriggered: state.stepProgress.canvasTriggered || percentage >= 50
        }
    }));
}
```

### setCurrentStep

```javascript
setCurrentStep(stepNumber) {
    update(state => ({
        ...state,
        currentStep: stepNumber,
        stepProgress: {
            stepNumber: stepNumber,
            percentage: 0,
            charIndex: 0,
            totalChars: 0,
            canvasTriggered: false
        }
    }));
}
```

## Ventajas del Sistema

### ✅ Precisión Total
- Tracking exacto del progreso carácter por carácter
- Porcentaje calculado en tiempo real

### ✅ Sincronización Perfecta
- Canvas aparece exactamente al 50%
- No antes, no después

### ✅ Visibilidad
- Indicador visual del progreso
- Logs detallados en consola

### ✅ Control Granular
- Fácil ajustar el porcentaje de activación
- Cambiar `>= 50` por cualquier otro valor

## Configuración

### Cambiar el Porcentaje de Activación

Para activar el canvas en otro porcentaje (ej: 30%):

```javascript
// En +page.svelte
if (cmd.step === $explanationStore.currentStep) {
    return $explanationStore.stepProgress.percentage >= 30; // Cambiar aquí
}
```

### Desactivar el Indicador Visual

```javascript
// En +page.svelte
{#if false} <!-- Cambiar a false -->
    <ProgressIndicator stepProgress={$explanationStore.stepProgress} />
{/if}
```

## Debugging

### Ver Progreso en Consola

Todos los logs están activos por defecto:
- Progreso cada carácter
- Trigger especial al 50%
- Comandos disponibles vs visibles

### Verificar Estado

```javascript
// En consola del navegador
$explanationStore.stepProgress
// {stepNumber: 1, percentage: 50, charIndex: 100, totalChars: 200, canvasTriggered: true}
```

## Archivos Modificados

1. **explanationStore.js**
   - Agregado `stepProgress` al estado
   - Función `updateStepProgress()`
   - Actualizado `setCurrentStep()`

2. **syncService.js**
   - Llama a `updateStepProgress()` en cada carácter
   - Calcula porcentaje en tiempo real

3. **+page.svelte**
   - Filtro de comandos con lógica del 50%
   - Logs de monitoreo
   - Componente ProgressIndicator

4. **ProgressIndicator.svelte** (nuevo)
   - Componente visual de progreso
   - Animaciones y estados

## Ejemplo Completo: Paso con 4 Comandos

### Datos del Paso

```javascript
{
  "title": "Proceso de solución paso a paso",
  "content": "Primero, restamos 4 de ambos lados...",
  "step_number": 3,
  "canvas_commands": [
    {
      "command": "draw_equation",
      "parameters": {
        "equation": "2x + 4 - 4 = 10 - 4",
        "description": "Restamos 4 a ambos lados"
      }
    },
    {
      "command": "draw_equation",
      "parameters": {
        "equation": "2x = 6",
        "description": "Después de restar 4"
      }
    },
    {
      "command": "draw_equation",
      "parameters": {
        "equation": "2x/2 = 6/2",
        "description": "Dividiendo por 2"
      }
    },
    {
      "command": "draw_equation",
      "parameters": {
        "equation": "x = 3",
        "description": "Después de dividir por 2"
      }
    }
  ]
}
```

### Timeline de Renderizado

```
T=0s    Paso 3 inicia
        ├─ Progreso: 0%
        ├─ Comandos visibles: 0/4
        └─ Texto: "Primero, restamos..."

T=1s    Progreso: 25%
        ├─ 🎯 TRIGGER 25% - Activando comando 1/4
        ├─ Comando 1 entra en cola de renderizado
        ├─ Aparece: "2x + 4 - 4 = 10 - 4"
        └─ Texto continúa renderizando

T=2s    Progreso: 50%
        ├─ 🎯 TRIGGER 50% - Activando comando 2/4
        ├─ Comando 2 entra en cola
        ├─ Aparece: "2x = 6"
        └─ Texto continúa renderizando

T=3s    Progreso: 75%
        ├─ 🎯 TRIGGER 75% - Activando comando 3/4
        ├─ Comando 3 entra en cola
        ├─ Aparece: "2x/2 = 6/2"
        └─ Texto continúa renderizando

T=4s    Progreso: 100%
        ├─ 🎯 TRIGGER 100% - Activando comando 4/4
        ├─ Comando 4 entra en cola
        ├─ Aparece: "x = 3"
        └─ ✅ Paso completo
```

### Logs en Consola

```
📊 Progreso paso 3: 25% (50/200 chars)
🎯 TRIGGER 25% - Activando comando 1/4
🎨 Comandos canvas disponibles: 4
🖌️ Comandos visibles: 1

📊 Progreso paso 3: 50% (100/200 chars)
🎯 TRIGGER 50% - Activando comando 2/4
🎨 Comandos canvas disponibles: 4
🖌️ Comandos visibles: 2

📊 Progreso paso 3: 75% (150/200 chars)
🎯 TRIGGER 75% - Activando comando 3/4
🎨 Comandos canvas disponibles: 4
🖌️ Comandos visibles: 3

📊 Progreso paso 3: 100% (200/200 chars)
🎯 TRIGGER 100% - Activando comando 4/4
🎨 Comandos canvas disponibles: 4
🖌️ Comandos visibles: 4
```

## Mejoras Futuras

- [ ] Configurar triggers personalizados desde UI
- [ ] Animación especial en cada trigger
- [ ] Sonido de notificación al trigger
- [ ] Gráfica de progreso histórico
- [ ] Preview de próximo comando a activar
