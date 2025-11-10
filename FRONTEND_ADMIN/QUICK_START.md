# 🚀 Guía de Inicio Rápido

## 📋 Requisitos Previos

1. **Node.js 18+** instalado
2. **npm 9+** instalado  
3. **Backend API** ejecutándose en `https://localhost:7219`

## ⚡ Inicio Rápido

### Opción 1: Script Automático
```bash
# Ejecutar desde la raíz del proyecto
./start-system.bat
```

### Opción 2: Manual

#### 1. Iniciar Backend
```bash
cd BACKEND_DEVELOMENT/API_REST_CURSOSACADEMICOS
dotnet run
```

#### 2. Iniciar Frontend
```bash
cd FRONTEND_ADMIN
npm install
npm run dev
```

## 🌐 URLs del Sistema

- **Frontend**: http://localhost:3000
- **Backend API**: https://localhost:7219
- **Swagger**: https://localhost:7219/swagger

## 📱 Funcionalidades Principales

### 📊 Dashboard
- Métricas en tiempo real
- Gráficos interactivos
- Acciones rápidas
- Actividad reciente

### 👨‍🏫 Gestión de Docentes
- ✅ Crear, editar, eliminar docentes
- 🔍 Búsqueda avanzada
- 📝 Formularios validados
- 👀 Vista detallada con cursos

### 📚 Gestión de Cursos
- ✅ CRUD completo de cursos
- 🎯 Asignación de docentes
- 🔢 Gestión de créditos y horas
- 📊 Filtros por ciclo

### 📈 Estadísticas
- 📊 Gráficos por ciclos
- 👥 Distribución de docentes
- ⏰ Análisis de carga horaria
- 📋 Reportes detallados

## 🎨 Características de Diseño

- ✨ **Animaciones fluidas** con Framer Motion
- 📱 **Responsive design** para todos los dispositivos
- 🎨 **Interfaz moderna** con Tailwind CSS
- 🌙 **Modo claro** optimizado
- ♿ **Accesible** y usable

## 🛠️ Comandos Útiles

```bash
# Desarrollo
npm run dev          # Iniciar servidor de desarrollo
npm run build        # Compilar para producción
npm run preview      # Vista previa de producción

# Calidad de código
npm run lint         # Verificar código
npm run lint:fix     # Arreglar problemas automáticamente
npm run type-check   # Verificar tipos TypeScript

# Utilidades
npm run clean        # Limpiar archivos temporales
npm run install:clean # Reinstalar dependencias
```

## 🔧 Solución de Problemas

### ❌ Error de CORS
- Verificar que el backend esté ejecutándose en `https://localhost:7219`
- Comprobar configuración de CORS en el backend

### ❌ Error de módulos
```bash
rm -rf node_modules package-lock.json
npm install
```

### ❌ Error de TypeScript
```bash
npm run type-check
```

## 📞 Soporte

- 📧 **Email**: admin@sistema.com
- 📖 **Documentación**: Ver README.md completo
- 🐛 **Issues**: Reportar en GitHub

---

*¡Feliz desarrollo! 🚀*
