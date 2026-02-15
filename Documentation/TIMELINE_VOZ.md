# Línea de Tiempo y Síntesis de Voz - Salón IA

## Resumen

Se agregaron dos nuevas funcionalidades al Salón de Clase IA:
1. **Línea de tiempo vertical** que muestra el progreso de los pasos de la explicación
2. **Síntesis de voz en español** que lee la explicación en tiempo real

---

## 1. Línea de Tiempo Vertical

### Componente: `VerticalTimeline.svelte`

**Ubicación:** `src/routes/classRoom/components/VerticalTimeline.svelte`

### Características

- **Posición:** Borde izquierdo de la interfaz (200px de ancho)
- **Estados visuales:**
  - ✅ **Completado:** Punto verde con ícono de check
  - 🔵 **Activo:** Punto azul pulsante con animación
  - ⚪ **Pendiente:** Punto gris translúcido

### Props

```javascript
{
  steps: Array,        // Array de pasos desde explanationStore
  currentStep: Number  // Número del paso actual
}
```

### Diseño Visual

- **Header:** Muestra "Progreso" y contador (ej: "3/5")
- **Track:** Lista scrolleable de pasos con:
  - Línea vertical conectora (cambia de color según estado)
  - Punto indicador animado
  - Etiqueta con número y título del paso
- **Animaciones:**
  - Pulso en paso activo
  - Transición suave de colores
  - Scroll automático al paso actual

### Integración

```svelte
<VerticalTimeline 
  steps={$explanationStore.steps}
  currentStep={$explanationStore.currentStep}
/>
```

---

## 2. Síntesis de Voz en Español

### Servicio: `speechService.js`

**Ubicación:** `src/lib/services/speechService.js`

### Características

- **API:** Web Speech API del navegador
- **Idioma:** Español (prioridad: es-MX > es-ES)
- **Controles:** Play, Pause, Resume, Stop
- **Limpieza de texto:** Elimina LaTeX y caracteres especiales

### Métodos Principales

```javascript
// Habilitar/deshabilitar
speechService.setEnabled(true/false)

// Hablar texto
speechService.speak(text, {
  rate: 1.0,    // Velocidad (0.1 - 10)
  pitch: 1.0,   // Tono (0 - 2)
  volume: 1.0,  // Volumen (0 - 1)
  onStart: () => {},
  onEnd: () => {},
  onError: (error) => {}
})

// Controles
speechService.pause()
speechService.resume()
speechService.stop()
```

### Limpieza de Texto LaTeX

El servicio automáticamente convierte:
- `\frac{a}{b}` → "a entre b"
- `\sqrt{x}` → "raíz cuadrada de x"
- `^` → "elevado a"
- `_` → "sub"
- Elimina comandos LaTeX (`\text{}`, `\mathbb{}`, etc.)

### Integración con Socket.IO

La voz se activa automáticamente en estos eventos:

```javascript
// Frases de espera
socketService.onWaitingPhrase((data) => {
  if (voiceEnabled) speechService.speak(data.message);
});

// Inicio de paso
socketService.onStepStart((data) => {
  if (voiceEnabled) speechService.speak(`Paso ${data.step}: ${data.title}`);
});

// Paso completado
socketService.onStepComplete((data) => {
  if (voiceEnabled) speechService.speak(data.content);
});

// Explicación completada
socketService.onExplanationComplete(() => {
  if (voiceEnabled) speechService.speak('Explicación completada');
});
```

### Sincronización con Pausa

La voz se sincroniza automáticamente con el estado de pausa:

```javascript
function handlePause() {
  if (isPaused) {
    explanationStore.resumeExplanation();
    speechService.resume();  // ✅ Reanuda voz
  } else {
    explanationStore.pauseExplanation();
    speechService.pause();   // ⏸️ Pausa voz
  }
}
```

---

## 3. Controles Flotantes Actualizados

### Botón de Voz

**Estados visuales:**
- 🔇 **Desactivado:** Ícono de volumen con X, color gris
- 🔊 **Activado:** Ícono de volumen con ondas, color verde con glow

**Props del componente:**

```javascript
<FloatingControls 
  onStop={handleStop}
  onToggleVoice={toggleVoice}
  voiceEnabled={voiceEnabled}
/>
```

---

## 4. Layout Actualizado

### Grid de 3 Columnas

```
┌──────────────┬──────────────────┬──────────────┐
│   Timeline   │    Pizarrón      │  Explicación │
│   (200px)    │     (flex)       │   (600px)    │
│              │                  │              │
│  ✅ Paso 1   │   [Canvas con    │  📝 Contenido│
│  🔵 Paso 2   │    dibujos]      │     del paso │
│  ⚪ Paso 3   │                  │     actual   │
│              │                  │              │
└──────────────┴──────────────────┴──────────────┘
         └─────── Controles Flotantes ───────┘
              [⏸️] [💬] [⚙️] [🔊]
```

### Responsive

- **Desktop (>1024px):** 3 columnas
- **Tablet/Mobile:** Timeline se oculta, 2 columnas (Pizarrón + Explicación)

---

## 5. Flujo de Usuario

### Escenario: Usuario responde incorrectamente

1. Usuario responde mal en el examen
2. Click en "Ver explicación" → Redirige a `/classRoom`
3. **Timeline aparece** mostrando todos los pasos
4. Usuario **activa la voz** 🔊
5. Explicación comienza:
   - Timeline marca paso 1 como activo 🔵
   - Voz lee: "Paso 1: Identificar el problema"
   - Contenido aparece con efecto typewriter
   - Canvas dibuja elementos visuales
6. Paso 1 completa:
   - Timeline marca paso 1 como completado ✅
   - Timeline marca paso 2 como activo 🔵
   - Voz lee el contenido completo del paso 1
7. Usuario **pausa** ⏸️:
   - Voz se pausa
   - Timeline mantiene estado
   - Puede hacer preguntas
8. Usuario **reanuda** ▶️:
   - Voz continúa donde se quedó
   - Explicación continúa
9. Explicación termina:
   - Todos los pasos marcados como completados ✅
   - Voz dice: "Explicación completada"
   - Modal de feedback aparece

---

## 6. Archivos Modificados/Creados

### Nuevos Archivos

1. `src/routes/classRoom/components/VerticalTimeline.svelte` (256 líneas)
2. `src/lib/services/speechService.js` (200 líneas)
3. `Documentation/TIMELINE_VOZ.md` (este archivo)

### Archivos Modificados

1. `src/routes/classRoom/+page.svelte`
   - Importar VerticalTimeline y speechService
   - Agregar estado `voiceEnabled`
   - Función `toggleVoice()`
   - Integrar voz en listeners de socket
   - Actualizar grid a 3 columnas
   - Pasar props a FloatingControls

2. `src/routes/classRoom/components/FloatingControls.svelte`
   - Agregar props `onToggleVoice` y `voiceEnabled`
   - Actualizar botón de volumen con estados visuales
   - Sincronizar voz con pausa/reanudación
   - Estilos para botón activo (verde)

---

## 7. Configuración de Voz

### Voces Disponibles

El servicio busca automáticamente voces en español:

```javascript
// Prioridad de selección
1. es-MX (Español México)
2. es-ES (Español España)
3. Cualquier otra voz es-*
```

### Parámetros Ajustables

```javascript
speechService.speak(text, {
  rate: 1.0,    // Velocidad normal
  pitch: 1.0,   // Tono normal
  volume: 1.0   // Volumen máximo
});
```

### Compatibilidad

- ✅ Chrome/Edge (excelente soporte)
- ✅ Firefox (buen soporte)
- ✅ Safari (soporte básico)
- ⚠️ Requiere HTTPS en producción

---

## 8. Mejoras Futuras

### Timeline
- [ ] Click en paso para saltar a ese punto
- [ ] Mostrar duración estimada por paso
- [ ] Indicador de progreso dentro de cada paso
- [ ] Colapsar/expandir timeline

### Voz
- [ ] Selector de voz (masculina/femenina)
- [ ] Control de velocidad en UI
- [ ] Resaltar texto mientras se lee
- [ ] Soporte para múltiples idiomas
- [ ] Subtítulos en tiempo real

### Integración
- [ ] Guardar preferencia de voz en localStorage
- [ ] Analytics de uso de voz
- [ ] Feedback específico sobre calidad de voz
- [ ] Modo "solo voz" (sin texto)

---

## 9. Testing

### Casos de Prueba

1. **Timeline:**
   - ✅ Muestra todos los pasos correctamente
   - ✅ Actualiza estado en tiempo real
   - ✅ Scroll automático al paso activo
   - ✅ Animaciones fluidas

2. **Voz:**
   - ✅ Activa/desactiva correctamente
   - ✅ Sincroniza con pausa/reanudación
   - ✅ Limpia texto LaTeX correctamente
   - ✅ Se detiene al desmontar componente

3. **Integración:**
   - ✅ Voz + Timeline sincronizados
   - ✅ Controles flotantes responden correctamente
   - ✅ Estado persiste durante explicación
   - ✅ Cleanup correcto al salir

---

## 10. Notas Técnicas

### Performance

- Timeline usa `virtualización` implícita con scroll
- Voz usa `queue` para evitar solapamiento
- Animaciones con `CSS` (no JavaScript)
- Cleanup automático con `onDestroy`

### Accesibilidad

- ARIA labels en todos los botones
- Estados visuales claros
- Soporte de teclado
- Indicadores de estado múltiples (visual + auditivo)

### Seguridad

- No envía audio al servidor
- Procesa voz localmente en el navegador
- Limpia texto antes de hablar (previene inyección)
