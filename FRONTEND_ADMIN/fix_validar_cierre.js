const fs = require('fs');
const file = '../../BACKEND_DEVELOMENT/API_REST_CURSOSACADEMICOS/API_REST_CURSOSACADEMICOS.Infrastructure/Services/AdminService.cs';
let content = fs.readFileSync(file, 'utf8');

const regex = /foreach \(!tiposEvaluacion\.Any\(\)\)[\s\S]*?var cursosPendientes = new List<object>\(\);/m;
// this is not a good regex. I'll just write a script to replace the entire method.
