# Sincronización Voz-Texto

## Descripción General

Sistema que sincroniza la velocidad del renderizado de texto (typewriter) con la duración de la síntesis de voz, asegurando que ambos terminen al mismo tiempo.

## Problema Original

**Antes:**
- Texto se renderizaba a velocidad fija (15-25ms por carácter)
- Voz tardaba mucho más en leer el contenido
- Texto terminaba antes que la voz
- Desincronización visual-auditiva

**Ejemplo:**
```
Texto: 200 caracteres × 20ms = 4 segundos
Voz:   40 palabras × 400ms = 16 segundos
❌ Texto termina 12 segundos antes
```

## Solución Implementada

### Cálculo Basado en Voz

La velocidad del typewriter se calcula dinámicamente según la duración estimada de la voz:

```javascript
calculateSpeedBasedOnVoice(content) {
    // Contar palabras
    const wordCount = content.split(/\s+/).length;
    
    // Duración estimada de la voz
    // 150 palabras/minuto = 2.5 palabras/segundo = 400ms/palabra
    const estimatedVoiceDuration = wordCount * 400;
    
    // Calcular ms por carácter
    const msPerChar = estimatedVoiceDuration / content.length;
    
    // Límites razonables: 50-150ms por carácter
    const speed = Math.max(50, Math.min(150, msPerChar));
    
    return Math.round(speed);
}
```

### Velocidad de Lectura

**Parámetros base:**
- Velocidad de lectura: **150 palabras/minuto**
- Conversión: **2.5 palabras/segundo**
- Tiempo por palabra: **400ms**
- Promedio de caracteres por palabra: **5**
- Tiempo por carácter: **~80ms**

### Límites de Velocidad

```javascript
const speed = Math.max(50, Math.min(150, msPerChar));
```

- **Mínimo**: 50ms/carácter (texto muy corto)
- **Máximo**: 150ms/carácter (texto muy largo)
- **Típico**: 70-90ms/carácter

## Ejemplos de Cálculo

### Ejemplo 1: Texto Corto

```
Contenido: "Primero, restamos 4 de ambos lados."
Caracteres: 38
Palabras: 6

Duración voz = 6 palabras × 400ms = 2,400ms
Velocidad = 2,400ms / 38 chars = 63ms/char

✅ Texto: 38 × 63ms = 2.4s
✅ Voz:  6 palabras = 2.4s
```

### Ejemplo 2: Texto Medio

```
Contenido: "Luego, dividimos ambos lados de la ecuación por 2, para aislar x."
Caracteres: 65
Palabras: 12

Duración voz = 12 palabras × 400ms = 4,800ms
Velocidad = 4,800ms / 65 chars = 74ms/char

✅ Texto: 65 × 74ms = 4.8s
✅ Voz:  12 palabras = 4.8s
```

### Ejemplo 3: Texto Largo

```
Contenido: "Estos pasos nos permiten encontrar el valor de x que satisface la ecuación original. Es importante seguir el orden correcto de operaciones."
Caracteres: 142
Palabras: 22

Duración voz = 22 palabras × 400ms = 8,800ms
Velocidad = 8,800ms / 142 chars = 62ms/char

✅ Texto: 142 × 62ms = 8.8s
✅ Voz:  22 palabras = 8.8s
```

## Modo Sin Voz

Cuando la voz está desactivada, usa velocidades fijas más rápidas:

```javascript
calculateSpeed(length) {
    if (length < 100) return 25;   // Texto corto
    if (length < 300) return 20;   // Texto medio
    return 15;                      // Texto largo
}
```

## Logs de Monitoreo

### Durante el Renderizado

```javascript
console.log(`✍️ Renderizando ${content.length} caracteres a ${speed}ms/char`);
console.log(`🎯 Duración estimada: ${(speed * content.length / 1000).toFixed(1)}s`);
console.log(`🎵 Palabras: ${wordCount}, Duración voz estimada: ${(estimatedVoiceDuration/1000).toFixed(1)}s`);
```

### Ejemplo de Logs

```
🎵 Palabras: 22, Duración voz estimada: 8.8s
✍️ Renderizando 142 caracteres a 62ms/char
🎯 Duración estimada: 8.8s
```

## Integración con Triggers del Canvas

Los triggers del canvas ahora están sincronizados con la voz:

```
Paso con 4 comandos (22 palabras, 8.8s):

T=0s    (0%)   → Inicio
T=2.2s  (25%)  → 🎯 Comando 1
T=4.4s  (50%)  → 🎯 Comando 2
T=6.6s  (75%)  → 🎯 Comando 3
T=8.8s  (100%) → 🎯 Comando 4
```

## Ventajas del Sistema

### ✅ Sincronización Perfecta
- Texto y voz terminan al mismo tiempo
- No hay desincronización visual-auditiva

### ✅ Adaptativo
- Se ajusta automáticamente a cualquier longitud de texto
- Calcula velocidad óptima por paso

### ✅ Natural
- Velocidad de lectura realista
- Ritmo cómodo para seguir

### ✅ Robusto
- Límites de velocidad para casos extremos
- Fallback a velocidad fija sin voz

## Ajustes Finos

### Cambiar Velocidad de Lectura

Para ajustar la velocidad de lectura base:

```javascript
// Más rápido (180 palabras/minuto)
const estimatedVoiceDuration = wordCount * 333;

// Más lento (120 palabras/minuto)
const estimatedVoiceDuration = wordCount * 500;
```

### Cambiar Límites

Para ajustar los límites de velocidad:

```javascript
// Más rápido
const speed = Math.max(30, Math.min(100, msPerChar));

// Más lento
const speed = Math.max(80, Math.min(200, msPerChar));
```

## Casos Especiales

### Texto con Muchos Números

Los números se leen más lento:

```javascript
// Detectar si hay muchos números
const hasNumbers = /\d/.test(content);
if (hasNumbers) {
    estimatedVoiceDuration *= 1.2; // 20% más lento
}
```

### Texto con Fórmulas

Las fórmulas matemáticas se leen más lento:

```javascript
// Detectar LaTeX
const hasLatex = /\\[a-z]+/.test(content);
if (hasLatex) {
    estimatedVoiceDuration *= 1.3; // 30% más lento
}
```

## Debugging

### Ver Cálculos

```javascript
console.log('Palabras:', wordCount);
console.log('Caracteres:', content.length);
console.log('Duración voz:', estimatedVoiceDuration, 'ms');
console.log('Velocidad calculada:', speed, 'ms/char');
console.log('Duración texto:', speed * content.length, 'ms');
```

### Verificar Sincronización

```javascript
const textDuration = speed * content.length;
const voiceDuration = wordCount * 400;
const diff = Math.abs(textDuration - voiceDuration);

console.log('Diferencia:', diff, 'ms');
// Debería ser < 100ms
```

## Archivos Modificados

- **syncService.js**:
  - Función `calculateSpeedBasedOnVoice()`
  - Modificado `renderContent()` para usar cálculo dinámico
  - Logs de monitoreo mejorados

## Mejoras Futuras

- [ ] Ajustar velocidad en tiempo real según voz real
- [ ] Detectar idioma y ajustar velocidad
- [ ] Considerar puntuación (pausas más largas)
- [ ] Calibración automática por usuario
- [ ] Análisis de complejidad del texto
