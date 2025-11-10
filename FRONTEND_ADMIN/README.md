# 🎓 Panel Administrativo - Gestión Académica

Un panel administrativo moderno y minimalista para la gestión de docentes y cursos académicos, desarrollado con React, TypeScript y Tailwind CSS.

## 🚀 Características

### 📊 Dashboard Interactivo
- **Estadísticas en tiempo real** con tarjetas de resumen
- **Gráficos dinámicos** para visualizar datos (Recharts)
- **Actividad reciente** y acciones rápidas
- **Métricas clave** del sistema académico

### 👨‍🏫 Gestión de Docentes
- **CRUD completo** (Crear, Leer, Actualizar, Eliminar)
- **Búsqueda avanzada** por nombre, apellido, profesión o correo
- **Formularios validados** con React Hook Form
- **Vista detallada** con cursos asignados
- **Gestión de información** personal y profesional

### 📚 Gestión de Cursos
- **Administración completa** de cursos académicos
- **Asignación de docentes** a cursos
- **Filtros por ciclo** y búsqueda inteligente
- **Gestión de créditos** y horas semanales
- **Organización por ciclos** académicos

### 📈 Estadísticas y Reportes
- **Gráficos interactivos** de distribución por ciclos
- **Análisis de carga horaria** por ciclo
- **Distribución de docentes** por profesión
- **Métricas de créditos** y horas semanales
- **Tablas de resumen** detalladas

## 🛠️ Tecnologías

### Frontend
- **React 18** - Biblioteca de interfaz de usuario
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Framework de estilos
- **Framer Motion** - Animaciones fluidas
- **React Router** - Navegación
- **React Hook Form** - Manejo de formularios
- **React Query** - Estado del servidor
- **Recharts** - Gráficos y visualizaciones

### Backend Integration
- **Axios** - Cliente HTTP
- **API REST** - Integración con backend .NET
- **CORS** configurado para desarrollo

## 🎨 Diseño

### Características de UI/UX
- **Diseño responsive** - Adaptable a todos los dispositivos
- **Tema claro/oscuro** - Modo claro por defecto
- **Animaciones suaves** - Transiciones fluidas
- **Componentes reutilizables** - Arquitectura modular
- **Accesibilidad** - Cumple estándares WCAG

### Paleta de Colores
```css
Primary: #3B82F6 (Azul)
Secondary: #64748B (Gris)
Success: #22C55E (Verde)
Warning: #F59E0B (Amarillo)
Danger: #EF4444 (Rojo)
```

## 🚦 Instalación y Configuración

### Prerrequisitos
- Node.js 18+ 
- npm 9+ 
- Backend API ejecutándose en `https://localhost:7219`

### ⚡ Inicio Rápido con Scripts Automáticos

La forma más fácil de levantar todo el sistema es usando los scripts automáticos ubicados en la carpeta raíz:

#### 🎯 Opción 1: Menu Interactivo
```bash
# Desde la carpeta raíz del proyecto:
menu.bat
```

#### 🚀 Opción 2: Scripts Directos
```bash
# Inicio normal (recomendado)
start-system.bat

# Inicio rápido con navegador automático
quick-start.bat

# Modo desarrollo con hot reload
dev-mode.bat

# Verificar sistema antes de empezar
check-system.bat

# Detener todos los servicios
stop-system.bat
```

#### 💻 PowerShell (Alternativo)
```powershell
# Para usuarios de PowerShell
.\start-system.ps1
```

### 🔧 Instalación Manual

1. **Instalar dependencias**
```bash
cd FRONTEND_ADMIN
npm install
```

2. **Configurar variables de entorno**
```bash
# Crear archivo .env.local
VITE_API_URL=https://localhost:7219/api
```

3. **Ejecutar backend**
```bash
cd BACKEND_DEVELOMENT/API_REST_CURSOSACADEMICOS
dotnet run
```

4. **Ejecutar frontend**
```bash
cd FRONTEND_ADMIN
npm run dev
```

5. **Compilar para producción**
```bash
npm run build
```

## 📁 Estructura del Proyecto

```
FRONTEND_ADMIN/
├── src/
│   ├── components/          # Componentes reutilizables
│   │   ├── Layout/         # Layout principal y navegación
│   │   ├── Dashboard/      # Componentes del dashboard
│   │   ├── Docentes/      # Componentes de gestión de docentes
│   │   ├── Cursos/        # Componentes de gestión de cursos
│   │   └── Common/        # Componentes compartidos
│   ├── pages/              # Páginas principales
│   │   ├── Dashboard.tsx   # Página de inicio
│   │   ├── Docentes/      # Páginas de docentes
│   │   ├── Cursos/        # Páginas de cursos
│   │   └── Estadisticas/  # Páginas de reportes
│   ├── services/           # Servicios API
│   ├── types/              # Tipos TypeScript
│   ├── lib/                # Utilidades y configuraciones
│   └── styles/             # Estilos globales
├── public/                 # Archivos estáticos
└── package.json           # Dependencias y scripts
```

## 🔧 Configuración del Backend

El frontend está configurado para comunicarse con el backend .NET en:
- **URL base**: `https://localhost:7219/api`
- **Endpoints**:
  - `GET /api/docentes` - Obtener todos los docentes
  - `POST /api/docentes` - Crear nuevo docente
  - `PUT /api/docentes/{id}` - Actualizar docente
  - `DELETE /api/docentes/{id}` - Eliminar docente
  - `GET /api/cursos` - Obtener todos los cursos
  - `POST /api/cursos` - Crear nuevo curso
  - `PUT /api/cursos/{id}` - Actualizar curso
  - `DELETE /api/cursos/{id}` - Eliminar curso

## 📱 Características Responsive

- **Mobile First** - Diseño optimizado para móviles
- **Breakpoints**:
  - `sm`: 640px
  - `md`: 768px
  - `lg`: 1024px
  - `xl`: 1280px
- **Sidebar colapsable** en dispositivos móviles
- **Tablas scrolleables** horizontalmente
- **Navegación adaptativa**

## 🎯 Funcionalidades Clave

### Dashboard
- Tarjetas de métricas con animaciones
- Gráficos interactivos en tiempo real
- Acciones rápidas para crear contenido
- Actividad reciente del sistema

### Gestión de Docentes
- Lista con búsqueda y filtros
- Formulario modal para CRUD
- Validación de datos en tiempo real
- Vista detallada con cursos asignados

### Gestión de Cursos
- Filtros por ciclo académico
- Asignación automática de docentes
- Gestión de créditos y horas
- Validación de rangos numéricos

### Estadísticas
- Múltiples tipos de gráficos
- Análisis por ciclos académicos
- Distribución de recursos
- Exportación de datos

## 🔐 Seguridad

- **Validación de formularios** en cliente y servidor
- **Sanitización de datos** antes del envío
- **Manejo de errores** robusto
- **Timeout de peticiones** configurado

## 🚀 Rendimiento

- **Lazy loading** de componentes
- **Memoización** de componentes pesados
- **Optimización de imágenes**
- **Bundling eficiente** con Vite

## 📊 Monitoreo

- **Logging** de errores HTTP
- **Métricas de rendimiento**
- **Feedback visual** de estados de carga
- **Notificaciones** toast para acciones

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👥 Equipo

- **Desarrollador Frontend**: Panel administrativo con React/TypeScript
- **Integración Backend**: API REST con .NET Core
- **Diseño UI/UX**: Interfaz moderna y minimalista

## 📞 Soporte

Para soporte técnico o preguntas:
- **Email**: admin@sistema.com
- **Documentación**: Ver archivos de documentación en `/docs`
- **Issues**: Reportar problemas en GitHub Issues

---

*Desarrollado con ❤️ para mejorar la gestión académica*
