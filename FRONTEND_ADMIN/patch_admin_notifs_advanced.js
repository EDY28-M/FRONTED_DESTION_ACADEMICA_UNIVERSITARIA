import fs from 'fs';
import path from 'path';

function injectNotify(filePath, typeVal) {
    if(!fs.existsSync(filePath)) return;
    let code = fs.readFileSync(filePath, 'utf8');

    // Make sure we have the context
    if(!code.includes('useNotifications')) {
        code = `import { useNotifications } from '../../contexts/NotificationContext';\n` + code;
    }
    
    // Auto-inject hook at the start of the component
    const componentMatch = code.match(/const [A-Z][a-zA-Z0-9]+:?.*=\s*\([^)]*\)\s*=>\s*{/);
    if (componentMatch && !code.includes('const { createNotification } = useNotifications()')) {
        code = code.replace(
            componentMatch[0], 
            `${componentMatch[0]}\n  const { createNotification } = useNotifications();`
        );
    } else {
       const functionMatch = code.match(/export default function [A-Z][a-zA-Z0-9]+\([^)]*\)\s*{/);
       if (functionMatch && !code.includes('const { createNotification } = useNotifications()')) {
           code = code.replace(
               functionMatch[0], 
               `${functionMatch[0]}\n  const { createNotification } = useNotifications();`
           );
       }
    }

    // Advanced search for mutation configs
    // It captures ANY useMutation structure and hooks into onSuccess
    code = code.replace(/useMutation\(\s*\{[\s\S]*?onSuccess:\s*(async\s*)?\([^)]*\)\s*=>\s*\{([\s\S]*?)toast\.success\(([^)]+)\);?/g, 
        (match, isAsync, preToast, toastMsg) => {
            
            // Avoid duplicates
            if(match.includes('createNotification')) return match;
            
            // Build the injected code
            let action = 'editar';
            if(toastMsg.toLowerCase().includes('cread') || toastMsg.toLowerCase().includes('generad') || toastMsg.toLowerCase().includes('registrad')) action = 'crear';
            if(toastMsg.toLowerCase().includes('eliminad') || toastMsg.toLowerCase().includes('borrad')) action = 'eliminar';
            
            const nameToPass = `\${${toastMsg}}`.replace(/\'/g, ""); // Remove quotes from the toast string to log it
            
            const inject = `await createNotification({
        type: '${typeVal}',
        action: '${action}',
        nombre: ${toastMsg}
      });`;
      
            // Replace correctly
            const replacement = match.replace(
                `toast.success(${toastMsg});`,
                `toast.success(${toastMsg});\n      ${inject}`
            );
            if(replacement === match) { // no semicolon?
                return match.replace(
                    `toast.success(${toastMsg})`,
                    `toast.success(${toastMsg})\n      ${inject}`
                );
            }
            return replacement;
        });

    fs.writeFileSync(filePath, code);
    console.log("Updated", filePath);
}

injectNotify('src/pages/Admin/GestionFacultadesPage.tsx', 'academico');
injectNotify('src/pages/Admin/GestionEscuelasPage.tsx', 'academico');
injectNotify('src/pages/Admin/ActivacionCursosPage.tsx', 'curso');
injectNotify('src/pages/Admin/GestionPeriodosPage.tsx', 'academico');
injectNotify('src/pages/Admin/GestionDocentesPasswordPage.tsx', 'password');
injectNotify('src/pages/Admin/VisualizacionEstudiantesPage.tsx', 'academico');
injectNotify('src/pages/Admin/GestionEstudiantesPage.tsx', 'academico');
injectNotify('src/pages/Admin/CursosDirigidosPage.tsx', 'curso');
injectNotify('src/pages/Admin/NotasConsolidadasAdminPage.tsx', 'academico');
injectNotify('src/pages/Admin/AnunciosAdminPage.tsx', 'academico');
injectNotify('src/pages/Admin/MaterialesAdminPage.tsx', 'academico');

