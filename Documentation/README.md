# 📚 Documentación - Guía IPN Web

Bienvenido a la documentación completa del proyecto **Guía IPN Web**, una plataforma educativa para preparación del examen de admisión del IPN.

---

## 🎯 Visión General

**Guía IPN Web** es una plataforma educativa que ayuda a estudiantes a prepararse para el examen de admisión del IPN mediante:

- ✅ **Exámenes de práctica** con 863+ preguntas
- ✅ **Explicaciones con IA** en tiempo real (Socket.IO + OpenAI)
- ✅ **Seguimiento de progreso** personalizado
- ✅ **Renderizado matemático** con KaTeX
- ✅ **Autenticación segura** con Supabase

---

## 📖 Documentación Disponible

### 1. [ARQUITECTURA.md](./ARQUITECTURA.md) 🏗️
**Documentación técnica completa del sistema**

**Incluye:**
- Stack tecnológico (SvelteKit 2, Svelte 5, Supabase, TailwindCSS 4)
- Estructura modular del proyecto (api/, components/, stores/, utils/, services/, data/)
- Arquitectura de componentes
- Sistema de autenticación (Email/Password + Google OAuth)
- Sistema de exámenes (863+ reactivos)
- Schema de base de datos Supabase
- Row Level Security (RLS)

**Para quién:** Desarrolladores que necesitan entender la arquitectura completa

---

### 2. [FLUJOS.md](./FLUJOS.md) 🔄
**Diagramas visuales y flujos del sistema**

**Incluye:**
- Arquitectura general (Frontend ↔ Backend ↔ Servicios)
- Flujo de autenticación (Email, Google OAuth)
- Flujo del examen (inicio, respuesta, finalización)
- Flujo de explicación con IA (Socket.IO streaming)
- Gestión de estado (authStore, examStore)
- Ciclo de vida de una pregunta
- Esquema de base de datos con triggers
- Algoritmo de tipografía inteligente (KaTeX)

**Para quién:** Desarrolladores y diseñadores que prefieren visualizaciones

---

### 3. [GUIA-RAPIDA.md](./GUIA-RAPIDA.md) ⚡
**Referencia rápida para desarrollo**

**Incluye:**
- Comandos de inicio rápido
- Estructura de archivos clave
- Conceptos clave (Stores, Runes, Rutas protegidas)
- Tareas comunes (agregar preguntas, crear componentes)
- Componentes principales
- Debugging y errores comunes
- Convenciones de código

**Para quién:** Desarrolladores que necesitan referencia rápida

---

### 4. [API.md](./API.md) 🌐
**Backend, endpoints y Socket.IO**

**Incluye:**
- Endpoints REST (Auth, Questions, Sessions, Health)
- Eventos Socket.IO (Cliente ↔ Servidor)
- Manejo de errores HTTP (HTTP_ERROR, TIMEOUT_ERROR, NETWORK_ERROR)
- Códigos de estado
- Cliente HTTP en frontend
- Configuración y variables de entorno

**Para quién:** Desarrolladores trabajando con la API o Socket.IO

---

## 🚀 Inicio Rápido

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de Supabase

# 3. Iniciar desarrollo
npm run dev

# 4. Abrir en navegador
http://localhost:5173
```

---

## 🛠️ Stack Tecnológico

### Frontend
- **Framework:** SvelteKit 2.x con Svelte 5 (runes)
- **Estilos:** TailwindCSS 4.0
- **Matemáticas:** KaTeX 0.16.22
- **Gráficas:** Chart.js 4.4.9
- **Build:** Vite 6.0

### Backend
- **BaaS:** Supabase (Auth + PostgreSQL)
- **API:** Flask + Flask-SocketIO
- **Cache:** Redis (sesiones)
- **IA:** OpenAI GPT-4

### Deployment
- **Frontend:** Vercel (adapter-vercel)
- **Backend:** Railway/Render

---

## 📁 Estructura del Proyecto

```
src/lib/
├── api/                    # Comunicación con backend
│   ├── client.js          # Cliente HTTP base
│   ├── endpoints/         # auth, questions, sessions
│   └── socket/            # ✅ NUEVO - Socket.IO
│       ├── SocketService.js   # Clase principal
│       ├── events.js          # Constantes
│       ├── useSocket.js       # Composable
│       └── index.js           # Re-exporta
│
├── components/            # Componentes reutilizables
│   └── auth/             # ProtectedRoute
│
├── stores/               # Estado global
│   ├── authStore.js      # Autenticación
│   ├── examStore.ts      # Examen
│   └── explanationStore.js   # ✅ NUEVO - Explicaciones
│
├── utils/                # Utilidades
│   ├── constants.js      # Constantes
│   ├── validators.js     # Validaciones
│   └── formatters.js     # Formateo
│
├── services/             # Servicios externos
│   └── supabase.js       # Cliente Supabase
│
└── data/                 # Datos estáticos
    └── index.js          # reactivos + config
```

---

## 🔑 Características Principales

### 1. Sistema de Exámenes
- 863+ preguntas de Álgebra y Estadística
- 20 preguntas aleatorias por examen
- Validación en tiempo real
- Estadísticas y gráficas

### 2. Autenticación
- Email/Password con confirmación
- Google OAuth
- JWT tokens
- Rutas protegidas

### 3. Explicaciones con IA
- Streaming en tiempo real (Socket.IO)
- Profesor virtual animado
- Pizarrón interactivo
- Pasos detallados

### 4. Renderizado Matemático
- KaTeX para fórmulas LaTeX
- Tipografía inteligente
- Responsive design
- Scroll horizontal para ecuaciones largas

---

## 📊 Métricas del Proyecto

- **Preguntas:** 863+
- **Materias:** 8 (Matemáticas, Física, Química, etc.)
- **Componentes:** 20+
- **Rutas:** 10+
- **Stores:** 3 (auth, exam, explanation) ✅
- **Endpoints API:** 8
- **Eventos Socket.IO:** 15+ ✅

---

## 🔗 Enlaces Útiles

### Documentación Externa
- [SvelteKit](https://kit.svelte.dev/)
- [Svelte 5](https://svelte.dev/docs/svelte/overview)
- [Supabase](https://supabase.com/docs)
- [TailwindCSS](https://tailwindcss.com/docs)
- [KaTeX](https://katex.org/docs/api.html)
- [Socket.IO](https://socket.io/docs/v4/)

### Carpeta prompts/
Documentación técnica detallada para implementación:
- `FRONTEND_CHECKLIST.md` - Checklist de implementación
- `SOCKET_IO_COMPLETE.md` - Documentación Socket.IO completa
- `HTTP_ROUTES.md` - Documentación API REST
- `FLOW_DIAGRAMS.md` - Diagramas de flujo detallados

---

## 🤝 Contribuir

1. Lee la documentación completa
2. Revisa [ARQUITECTURA.md](./ARQUITECTURA.md) para entender el sistema
3. Consulta [GUIA-RAPIDA.md](./GUIA-RAPIDA.md) para tareas comunes
4. Sigue las convenciones de código

---

## 📝 Notas Importantes

- **Estructura modular:** Todo en `src/lib/` está organizado por dominio
- **Imports limpios:** Usa `from '$lib/api'`, `from '$lib/stores'`, etc.
- **Rutas protegidas:** `/progreso` y `/materias` requieren autenticación
- **Timeout API:** 30 segundos por defecto (configurable)
- **Sesiones Socket.IO:** TTL 30 minutos en Redis

---

## 🎯 Progreso de Implementación

### ✅ Completado (Fases 1-5)
- [x] Fase 1: Configuración Inicial
- [x] Fase 2: Autenticación
- [x] Fase 3: Cliente HTTP
- [x] Fase 4: Cliente Socket.IO ✅ **NUEVO**
- [x] Fase 5: Gestión de Estado ✅ **NUEVO**

### 🚧 En Progreso
- [ ] Fase 6: Componentes UI (Salón de Clase)
  - [ ] Crear `/examen/salon/+page.svelte`
  - [ ] Componente `Blackboard.svelte`
  - [ ] Componente `TeacherCharacter.svelte`
  - [ ] Componente `ExplanationPanel.svelte`
  - [ ] Efecto typewriter

### 📋 Pendiente
- [ ] Fase 7: Funcionalidades Avanzadas
- [ ] Fase 8: Optimizaciones
- [ ] Fase 9: Testing
- [ ] Fase 10: Deployment

### 🔮 Futuro
- [ ] Más materias (Física, Química, etc.)
- [ ] Sistema de progreso avanzado
- [ ] Modo oscuro
- [ ] PWA (Progressive Web App)
- [ ] Notificaciones push

---

## 📞 Soporte

Para dudas o problemas:
1. Revisa [GUIA-RAPIDA.md](./GUIA-RAPIDA.md) - Sección "Debugging"
2. Consulta [API.md](./API.md) - Manejo de errores
3. Revisa [FLUJOS.md](./FLUJOS.md) - Diagramas visuales

---

**Última actualización:** 2025-01-20  
**Versión:** 1.5.0  
**Estado:** ✅ Socket.IO completado (Fases 4-5), listo para UI
