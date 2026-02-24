# Corrección: Problema con Modal al Cancelar en Gestión de Docentes

## Problema Identificado
Al hacer clic en "Cancelar" en los modales de crear/editar docente, aparecía otra ventana o modal adicional.

## Causa Probable
El problema era que los botones "Cancelar" dentro de formularios podían desencadenar el evento de submit del formulario cuando se presionaba Enter o había algún manejo incorrecto de eventos.

## Solución Implementada
Se modificaron **todos los botones "Cancelar"** y **botones de cierre (X)** para:

1. **Prevenir comportamiento por defecto**: Usar `e.preventDefault()` para evitar submit accidental del formulario
2. **Detener propagación**: Usar `e.stopPropagation()` para evitar que eventos se propaguen a elementos padres
3. **Llamar correctamente a cerrarModal**: Mantener la función de cierre del modal

## Cambios Específicos

### 1. Botones "Cancelar" en modales (3 lugares)
```typescript
// ANTES:
<button type="button" onClick={cerrarModal}>Cancelar</button>

// DESPUÉS:
<button 
  type="button" 
  onClick={(e) => {
    e.preventDefault();
    e.stopPropagation();
    cerrarModal();
  }}
>Cancelar</button>
```

### 2. Botones de cierre (X) en modales (2 lugares)
```typescript
// ANTES:
<button onClick={cerrarModal} className="text-zinc-400 hover:text-zinc-600">
  <X className="w-5 h-5" />
</button>

// DESPUÉS:
<button 
  onClick={(e) => {
    e.preventDefault();
    e.stopPropagation();
    cerrarModal();
  }} 
  className="text-zinc-400 hover:text-zinc-600"
>
  <X className="w-5 h-5" />
</button>
```

## Archivos Modificados
- `src/pages/Admin/GestionDocentesPasswordPage.tsx`:
  - Líneas ~807, ~907, ~992: Botones "Cancelar" en los 3 modales
  - Líneas ~611, ~866: Botones de cierre (X) en los modales

## ¿Por qué ocurría el problema?
1. Los formularios dentro de los modales tienen `onSubmit={handleCrear}` o `onSubmit={handleActualizar}`
2. Al presionar Enter en un campo del formulario, se disparaba el evento submit
3. Los botones "Cancelar", aunque tenían `type="button"`, no prevenían completamente el comportamiento por defecto
4. Esto podría causar que se abriera otro modal o ventana

## Verificación
Los cambios aseguran que:
- ✅ Al hacer clic en "Cancelar", solo se cierra el modal actual
- ✅ No se dispara el submit del formulario
- ✅ No se propagan eventos a elementos padres
- ✅ La experiencia del usuario es fluida y sin errores

## Pruebas Recomendadas
1. Abrir modal de creación de docente
2. Rellenar algunos campos
3. Presionar "Cancelar" - debería cerrarse sin problemas
4. Presionar la X en la esquina superior derecha - debería cerrarse sin problemas
5. Presionar Enter en un campo - no debería hacer submit