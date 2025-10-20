# 📚 Documentación - Guía IPN Web

Bienvenido a la documentación completa del proyecto **Guía IPN Web**, una plataforma educativa para preparación del examen de admisión del IPN.

---

## 📖 Índice de Documentación

### 1. [ARQUITECTURA.md](./ARQUITECTURA.md)
**Documentación técnica completa del sistema**

Incluye:
- ✅ Visión general del proyecto
- ✅ Stack tecnológico detallado
- ✅ Estructura del proyecto
- ✅ Arquitectura de componentes
- ✅ Flujos de datos
- ✅ Sistema de autenticación
- ✅ Sistema de exámenes
- ✅ Schema de base de datos
- ✅ Diagramas de flujo en ASCII

**Para quién**: Desarrolladores que necesitan entender la arquitectura completa

---

### 2. [DIAGRAMAS.md](./DIAGRAMAS.md)
**Diagramas visuales del sistema**

Incluye:
- ✅ Arquitectura general del sistema
- ✅ Flujo de datos del examen
- ✅ Flujo de autenticación
- ✅ Arquitectura de componentes
- ✅ Ciclo de vida de una pregunta
- ✅ Gestión de estado (State Management)

**Para quién**: Desarrolladores y diseñadores que prefieren visualizaciones

---

### 3. [GUIA-RAPIDA.md](./GUIA-RAPIDA.md)
**Referencia rápida para desarrollo**

Incluye:
- ✅ Inicio rápido
- ✅ Estructura de archivos clave
- ✅ Conceptos clave
- ✅ Flujos principales
- ✅ Tareas comunes
- ✅ Configuración
- ✅ Componentes principales
- ✅ Debugging
- ✅ Convenciones de código
- ✅ Errores comunes

**Para quién**: Desarrolladores que necesitan referencias rápidas durante el desarrollo

---

## 🎯 ¿Por Dónde Empezar?

### Si eres nuevo en el proyecto:
1. Lee el **README.md** principal (en la raíz del proyecto)
2. Revisa **ARQUITECTURA.md** para entender el sistema completo
3. Consulta **DIAGRAMAS.md** para visualizar los flujos
4. Usa **GUIA-RAPIDA.md** como referencia durante el desarrollo

### Si necesitas implementar una feature:
1. Consulta **GUIA-RAPIDA.md** → "Tareas Comunes"
2. Revisa **ARQUITECTURA.md** → Sección relevante
3. Verifica **DIAGRAMAS.md** → Flujo correspondiente

### Si estás debuggeando:
1. **GUIA-RAPIDA.md** → "Debugging" y "Errores Comunes"
2. **ARQUITECTURA.md** → Flujos de datos
3. **DIAGRAMAS.md** → Visualizar el flujo problemático

---

## 🏗️ Estructura del Proyecto

```
guiaipn-web/
│
├── Documentation/              ← Estás aquí
│   ├── README.md              ← Este archivo
│   ├── ARQUITECTURA.md        ← Documentación técnica completa
│   ├── DIAGRAMAS.md           ← Diagramas visuales
│   └── GUIA-RAPIDA.md         ← Referencia rápida
│
├── src/
│   ├── lib/
│   │   ├── stores/            ← State management
│   │   ├── reactivos.js       ← Base de datos de preguntas
│   │   └── supabase.js        ← Cliente Supabase
│   │
│   └── routes/
│       ├── +layout.svelte     ← Layout principal
│       ├── +page.svelte       ← Página de inicio
│       ├── examen/            ← Sistema de exámenes
│       └── cuenta/            ← Autenticación
│
├── static/                    ← Archivos estáticos
├── package.json
├── svelte.config.js
├── vite.config.js
└── README.md                  ← README principal
```

---

## 🔑 Conceptos Clave del Proyecto

### 1. **SvelteKit 2.x (Svelte 5)**
Framework principal con:
- Runes (`$state`, `$derived`, `$effect`, `$props`)
- File-based routing
- Server-side rendering (SSR)
- API routes

### 2. **Supabase**
Backend as a Service:
- Autenticación (Email/Password, OAuth)
- Base de datos PostgreSQL
- Row Level Security (RLS)
- Real-time subscriptions

### 3. **Stores (State Management)**
Gestión de estado global:
- `authStore`: Usuario y autenticación
- `examStore`: Estado del examen

### 4. **Reactivos**
Base de datos de preguntas:
- 863+ preguntas
- Álgebra y Estadística
- Soporte para LaTeX (KaTeX)

### 5. **Componentes Reutilizables**
- `Math.svelte`: Renderizador de fórmulas
- `QuestionDisplay.svelte`: Mostrar preguntas
- `AnswerOptions.svelte`: Opciones de respuesta
- `ModalFinish.svelte`: Resultados finales

---

## 📊 Métricas del Proyecto

### Código
- **Lenguajes**: JavaScript, TypeScript, Svelte
- **Componentes**: 15+ componentes reutilizables
- **Rutas**: 10+ páginas
- **Stores**: 2 stores principales

### Datos
- **Preguntas**: 863+ reactivos
- **Materias**: Álgebra, Estadística
- **Tipos**: Texto y matemáticas (LaTeX)

### Funcionalidades
- ✅ Sistema de exámenes
- ✅ Autenticación completa
- ✅ Renderizado de matemáticas
- ✅ Explicaciones con IA
- ✅ Seguimiento de progreso
- ✅ Responsive design
- ✅ Animaciones fluidas

---

## 🛠️ Stack Tecnológico

### Frontend
- **Framework**: SvelteKit 2.x
- **Estilos**: TailwindCSS 4.0
- **Matemáticas**: KaTeX 0.16.22
- **Gráficas**: Chart.js 4.4.9
- **Iconos**: Lucide Svelte

### Backend
- **BaaS**: Supabase
- **Auth**: Supabase Auth
- **Database**: PostgreSQL

### DevTools
- **Build**: Vite 6.0
- **Linting**: ESLint 9.x
- **Formatting**: Prettier 3.x
- **Type Checking**: TypeScript 5.x

### Deployment
- **Platform**: Vercel
- **Adapter**: @sveltejs/adapter-vercel

---

## 🚀 Inicio Rápido

```bash
# Clonar repositorio
git clone <repo-url>

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de Supabase

# Iniciar desarrollo
npm run dev

# Build para producción
npm run build
npm run preview
```

---

## 📝 Convenciones de Documentación

### Formato de Archivos
- **Markdown**: Todos los archivos de documentación
- **Diagramas**: ASCII art para compatibilidad
- **Código**: Bloques con syntax highlighting

### Estructura de Documentos
1. **Título y descripción**
2. **Índice** (si es largo)
3. **Contenido principal**
4. **Ejemplos de código**
5. **Referencias**
6. **Última actualización**

### Estilo de Escritura
- **Claro y conciso**
- **Ejemplos prácticos**
- **Diagramas cuando sea necesario**
- **Links a recursos externos**

---

## 🤝 Contribuir a la Documentación

### Agregar Nueva Documentación
1. Crea un nuevo archivo `.md` en esta carpeta
2. Actualiza este `README.md` con el nuevo documento
3. Sigue las convenciones de formato
4. Incluye ejemplos y diagramas

### Actualizar Documentación Existente
1. Edita el archivo correspondiente
2. Actualiza la fecha de "Última actualización"
3. Verifica que los links funcionen
4. Mantén consistencia con el resto

### Reportar Errores
Si encuentras errores en la documentación:
1. Abre un issue en GitHub
2. Especifica el archivo y sección
3. Sugiere la corrección

---

## 📚 Recursos Adicionales

### Documentación Oficial
- [SvelteKit](https://kit.svelte.dev/)
- [Svelte 5](https://svelte.dev/docs/svelte/overview)
- [Supabase](https://supabase.com/docs)
- [TailwindCSS](https://tailwindcss.com/docs)
- [KaTeX](https://katex.org/docs/api.html)
- [Chart.js](https://www.chartjs.org/docs/)

### Tutoriales
- [SvelteKit Tutorial](https://learn.svelte.dev/)
- [Supabase Auth Tutorial](https://supabase.com/docs/guides/auth)
- [TailwindCSS Tutorial](https://tailwindcss.com/docs/installation)

### Comunidad
- [Svelte Discord](https://svelte.dev/chat)
- [Supabase Discord](https://discord.supabase.com/)
- [GitHub Discussions](https://github.com/sveltejs/kit/discussions)

---

## 🔄 Historial de Cambios

### v1.0.0 - Octubre 2024
- ✅ Documentación inicial completa
- ✅ ARQUITECTURA.md creado
- ✅ DIAGRAMAS.md creado
- ✅ GUIA-RAPIDA.md creado
- ✅ README.md de documentación creado

---

## 📞 Contacto

Si tienes preguntas sobre la documentación o el proyecto:
- Abre un issue en GitHub
- Contacta al equipo de desarrollo
- Revisa las discusiones existentes

---

## 📄 Licencia

Este proyecto y su documentación están bajo la misma licencia que el proyecto principal.

---

**Última actualización**: Octubre 2024  
**Versión de documentación**: 1.0.0  
**Mantenido por**: Equipo de desarrollo Guía IPN Web
