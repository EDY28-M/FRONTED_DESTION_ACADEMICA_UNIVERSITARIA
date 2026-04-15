import fs from 'fs';
import path from 'path';

const processFile = (filePath, entityType) => {
  if (!fs.existsSync(filePath)) return;
  console.log(`Processing ${filePath}...`);
  let content = fs.readFileSync(filePath, 'utf8');

  // Ensure imports
  if (!content.includes('useNotifications')) {
    content = content.replace(/(import .* from '@tanstack\/react-query';?)/, `$1\nimport { useNotifications } from '../../contexts/NotificationContext';`);
    if(!content.includes('NotificationContext')) {
      content = content.replace(/(import .* from 'react';?)/, `$1\nimport { useNotifications } from '../../contexts/NotificationContext';`);
    }
  }

  // Ensure hook is called inside component
  // Find component declaration
  const hookRegex = /(const [A-Za-z0-9_]+ = \([^)]*\) => {)\s*(?:const queryClient = useQueryClient\(\);?)?/;
  if (content.match(hookRegex) && !content.includes('const { createNotification } = useNotifications()')) {
    content = content.replace(
      hookRegex, 
      `$1\n  const { createNotification } = useNotifications();\n  const queryClient = useQueryClient();`
    );
  }

  // Replace delete/eliminar mutations
  const mutations = [
    { name: 'deleteCursoMutation', action: 'eliminar', desc: 'Curso eliminado' },
    { name: 'deleteDocenteMutation', action: 'eliminar', desc: 'Docente eliminado' },
    { name: 'deleteMutation', action: 'eliminar', desc: 'Registro eliminado' },
    { name: 'eliminarMutation', action: 'eliminar', desc: 'Registro eliminado' },
    
    { name: 'crearMutation', action: 'crear', desc: 'Nuevo registro creado' },
    { name: 'crearEstudianteMutation', action: 'crear', desc: 'Estudiante creado' },
    { name: 'crearDirigidosMutation', action: 'crear', desc: 'Cursos dirigidos creados' },

    { name: 'editarMutation', action: 'editar', desc: 'Registro editado' },
    { name: 'actualizarMutation', action: 'editar', desc: 'Registro actualizado' },
    { name: 'asignarPasswordMutation', action: 'editar', desc: 'Contraseña asignada' },
    
    { name: 'activarMutation', action: 'editar', desc: 'Registro activado' },
    { name: 'desactivarMutation', action: 'editar', desc: 'Registro desactivado' },
    { name: 'toggleActiveMutation', action: 'editar', desc: 'Estado cambiado' },
    { name: 'cerrarPeriodoMutation', action: 'editar', desc: 'Periodo cerrado' },
    { name: 'abrirPeriodoMutation', action: 'editar', desc: 'Periodo abierto' },
  ];

  mutations.forEach(mut => {
    const mutRegex = new RegExp(`(const ${mut.name} = useMutation\\({[\\s\\S]*?onSuccess:\\s*(?:async\\s*)?\\([^)]*\\)\\s*=>\\s*{)([\\s\\S]*?)(toast\\.success\\([^)]+\\);?)`, 'g');
    
    // We only replace if we haven't already
    content = content.replace(mutRegex, (match, prefix, middle, toastCall) => {
      if (middle.includes('createNotification')) return match;
      
      const inject = `\n      await createNotification({\n        type: '${entityType}',\n        action: '${mut.action}',\n        nombre: '${mut.desc}'\n      });\n`;
      return `${prefix}${middle}${toastCall}${inject}`;
    });
  });

  fs.writeFileSync(filePath, content);
};

processFile('src/pages/Cursos/CursosPage.tsx', 'curso');
processFile('src/pages/Docente/DocentesPage.tsx', 'docente');
processFile('src/pages/Admin/GestionFacultadesPage.tsx', 'academico');
processFile('src/pages/Admin/GestionEscuelasPage.tsx', 'academico');
processFile('src/pages/Admin/ActivacionCursosPage.tsx', 'curso');
processFile('src/pages/Admin/GestionPeriodosPage.tsx', 'academico');
processFile('src/pages/Admin/GestionDocentesPasswordPage.tsx', 'password');
processFile('src/pages/Admin/VisualizacionEstudiantesPage.tsx', 'academico');
processFile('src/pages/Admin/GestionEstudiantesPage.tsx', 'academico');
processFile('src/pages/Admin/CursosDirigidosPage.tsx', 'curso');

console.log("Done patching admin pages!");
