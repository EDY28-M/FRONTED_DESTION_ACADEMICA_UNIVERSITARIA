import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { estudiantesApi } from '../../services/estudiantesApi';
import { SemestreRegistro } from '../../types/estudiante';
import { 
  ChevronDown, 
  ChevronUp, 
  BookOpen, 
  Calendar,
  Award,
  TrendingUp,
  Download,
  FileText,
  AlertCircle
} from 'lucide-react';

// Stat Card Mini Component
const StatMini = ({ label, value, color = 'zinc' }: { label: string; value: string | number; color?: string }) => (
  <div className="bg-white border border-zinc-200 rounded-lg px-3 py-2 text-center min-w-[70px]">
    <p className="text-[10px] text-zinc-500 uppercase tracking-wider">{label}</p>
    <p className={`text-lg font-bold tabular-nums text-${color}-700`}>{value}</p>
  </div>
);

export default function RegistroNotasPage() {
  const [semestreExpandido, setSemestreExpandido] = useState<number | null>(null);

  const { data: registroNotas, isLoading, error } = useQuery({
    queryKey: ['registro-notas'],
    queryFn: () => estudiantesApi.getRegistroNotas(),
  });

  const toggleSemestre = (idPeriodo: number) => {
    setSemestreExpandido(semestreExpandido === idPeriodo ? null : idPeriodo);
  };

  const exportarAPDF = () => window.print();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="inline-block w-6 h-6 border-2 border-zinc-200 border-t-zinc-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-50 p-6">
        <div className="max-w-5xl mx-auto bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <p className="text-[13px] text-red-700">Error al cargar el registro de notas</p>
        </div>
      </div>
    );
  }

  if (!registroNotas || registroNotas.semestres.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-50 p-6">
        <div className="max-w-5xl mx-auto bg-white rounded-xl border border-zinc-200 p-8 text-center">
          <div className="w-12 h-12 bg-zinc-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-6 h-6 text-zinc-400" />
          </div>
          <p className="text-[13px] font-medium text-zinc-900 mb-1">No hay semestres registrados</p>
          <p className="text-[11px] text-zinc-500">Los registros aparecerán cuando se cierren los periodos académicos</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200">
        <div className="h-14 px-6 max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-medium text-zinc-900">Registro de Notas</h1>
              <p className="text-[11px] text-zinc-500">Historial académico completo</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Legend */}
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                Aprobado
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-red-500 rounded-full" />
                Desaprobado
              </span>
            </div>
            
            <button
              onClick={exportarAPDF}
              className="flex items-center gap-2 px-3 py-1.5 text-[13px] font-medium text-white bg-zinc-900 rounded-lg hover:bg-zinc-800 transition-colors print:hidden"
            >
              <Download className="w-4 h-4" />
              Exportar PDF
            </button>
          </div>
        </div>
      </header>

      <div className="p-6 max-w-6xl mx-auto space-y-4">
        {registroNotas.semestres.map((semestre: SemestreRegistro, index: number) => (
          <div 
            key={semestre.idPeriodo} 
            className="bg-white rounded-xl border border-zinc-200 overflow-hidden"
          >
            {/* Semester Header - Clickable */}
            <button
              onClick={() => toggleSemestre(semestre.idPeriodo)}
              className="w-full px-5 py-4 flex items-center justify-between hover:bg-zinc-50/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-zinc-900 text-white flex items-center justify-center font-bold text-lg tabular-nums">
                  {index + 1}
                </div>
                <div className="text-left">
                  <h2 className="text-[13px] font-semibold text-zinc-900">{semestre.periodo}</h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="flex items-center gap-1 text-[11px] text-zinc-500">
                      <Calendar className="w-3 h-3" />
                      {semestre.anio} - Ciclo {semestre.ciclo}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                      semestre.estado === 'Cerrado' 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {semestre.estado}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Quick Stats */}
                <div className="hidden md:flex items-center gap-2">
                  <StatMini label="Créditos" value={semestre.totales.totalCreditos} color="zinc" />
                  <StatMini label="PSem" value={semestre.totales.promedioSemestral.toFixed(2)} color="emerald" />
                  <StatMini label="PAc" value={semestre.totales.promedioAcumulado.toFixed(2)} color="blue" />
                </div>

                <div className="w-8 h-8 rounded-lg border border-zinc-200 flex items-center justify-center">
                  {semestreExpandido === semestre.idPeriodo ? (
                    <ChevronUp className="w-4 h-4 text-zinc-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-zinc-500" />
                  )}
                </div>
              </div>
            </button>

            {/* Expandable Content */}
            {semestreExpandido === semestre.idPeriodo && (
              <div className="border-t border-zinc-100 p-5">
                {semestre.estado === 'Abierto' && (
                  <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                    <p className="text-[12px] text-amber-700">Periodo en curso. Las notas se consolidarán al cierre del semestre.</p>
                  </div>
                )}

                {/* Courses Table */}
                <div className="overflow-x-auto rounded-lg border border-zinc-200">
                  <table className="w-full text-[12px]">
                    <thead>
                      <tr className="bg-zinc-50">
                        <th className="px-3 py-2.5 text-left text-[10px] font-semibold text-zinc-600 uppercase tracking-wider">Código</th>
                        <th className="px-3 py-2.5 text-left text-[10px] font-semibold text-zinc-600 uppercase tracking-wider">Asignatura</th>
                        <th className="px-3 py-2.5 text-center text-[10px] font-semibold text-zinc-600 uppercase tracking-wider">Créditos</th>
                        
                        {/* Dynamic Evaluation Columns */}
                        {semestre.cursos[0]?.evaluaciones.map((evaluacion, i) => (
                          <th key={i} className="px-3 py-2.5 text-center text-[10px] font-semibold text-zinc-600 uppercase tracking-wider bg-zinc-100/50">
                            <div>{evaluacion.nombre}</div>
                            <div className="text-zinc-400 font-normal">({evaluacion.peso}%)</div>
                          </th>
                        ))}

                        <th className="px-3 py-2.5 text-center text-[10px] font-semibold text-zinc-600 uppercase tracking-wider bg-emerald-50">Nota Final</th>
                        <th className="px-3 py-2.5 text-center text-[10px] font-semibold text-zinc-600 uppercase tracking-wider">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {semestre.cursos.map((curso) => (
                        <tr key={curso.idMatricula} className="hover:bg-zinc-50/50 transition-colors">
                          <td className="px-3 py-2.5">
                            <span className="px-1.5 py-0.5 bg-zinc-100 text-zinc-700 rounded font-mono text-[11px]">
                              {curso.codigoCurso}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-[12px] font-medium text-zinc-900">{curso.nombreCurso}</td>
                          <td className="px-3 py-2.5 text-center">
                            <span className="text-[12px] font-medium tabular-nums text-zinc-600">{curso.creditos}</span>
                          </td>

                          {/* Evaluation Grades */}
                          {curso.evaluaciones.map((evaluacion, i) => (
                            <td key={i} className="px-3 py-2.5 text-center bg-zinc-50/30">
                              <span className="text-[12px] font-semibold tabular-nums text-zinc-700">{evaluacion.nota.toFixed(1)}</span>
                            </td>
                          ))}

                          {/* Final Grade */}
                          <td className="px-3 py-2.5 text-center bg-emerald-50/30">
                            <span className={`inline-flex px-2 py-0.5 rounded text-[12px] font-bold tabular-nums ${
                              curso.notaFinal >= 11 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {curso.notaFinal}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="px-3 py-2.5 text-center">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${
                              curso.estadoCurso === 'Aprobado' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {curso.estadoCurso}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Summary Row */}
                <div className="mt-4 flex items-center justify-between p-4 bg-zinc-50 rounded-xl">
                  <div className="flex items-center gap-4">
                    <span className="text-[11px] font-semibold text-zinc-600 uppercase tracking-wider">Totales del Semestre</span>
                    <span className="px-2 py-1 bg-zinc-200 text-zinc-700 rounded text-[12px] font-bold tabular-nums">
                      {semestre.totales.totalCreditos} créditos
                    </span>
                    <span className="text-[12px] text-zinc-500 tabular-nums">
                      {semestre.totales.totalHoras} horas
                    </span>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                      <span className="text-[11px] text-zinc-500 uppercase">PSem</span>
                      <span className="text-lg font-bold text-emerald-700 tabular-nums">{semestre.totales.promedioSemestral.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-blue-600" />
                      <span className="text-[11px] text-zinc-500 uppercase">PAc</span>
                      <span className="text-lg font-bold text-blue-700 tabular-nums">{semestre.totales.promedioAcumulado.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-container, .print-container * { visibility: visible; }
          .print-container { position: absolute; left: 0; top: 0; width: 100%; }
          button { display: none !important; }
        }
      `}</style>
    </div>
  );
}

