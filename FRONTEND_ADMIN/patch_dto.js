const fs = require('fs');
const file = '../../BACKEND_DEVELOMENT/API_REST_CURSOSACADEMICOS/API_REST_CURSOSACADEMICOS.Application/DTOs/MatriculaDtos.cs';
let content = fs.readFileSync(file, 'utf8');
const newDto = `
    public class ActualizarNotaEstadoMatriculaDto
    {
        [Required]
        public int IdEstudiante { get; set; }
        [Required]
        public int IdCurso { get; set; }
        [Required]
        public int IdPeriodo { get; set; }
        
        public decimal? PromedioFinal { get; set; }
        public string? Estado { get; set; }
    }
}
`;
content = content.replace(/}\s*$/, newDto);
fs.writeFileSync(file, content);
console.log("Patched DTO");
