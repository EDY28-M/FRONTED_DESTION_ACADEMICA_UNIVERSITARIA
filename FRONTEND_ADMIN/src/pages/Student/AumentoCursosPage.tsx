import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { estudiantesApi } from '../../services/estudiantesApi';
import { CursoDisponible } from '../../types/estudiante';
import { AlertCircle, Check, Clock, CreditCard, Loader2, Plus, ShieldCheck, Server, Database } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNotifications } from '../../contexts/NotificationContext';

// Modal de confirmación con diseño Premium y Carga Por Pasos
const ConfirmModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isLoading: boolean;
    isSuccess: boolean;
    cursosCount: number;
}> = ({ isOpen, onClose, onConfirm, isLoading, isSuccess, cursosCount }) => {
    const [loadingStep, setLoadingStep] = useState(0);

    // Efecto acelerado para simular pasos de progreso muy rápido (estética sin demora)


    if (!isOpen) return null;

    const loadingMessages = [
        { text: "Iniciando solicitud segura...", icon: ShieldCheck },
        { text: "Verificando disponibilidad de vacantes...", icon: Server },
        { text: "Registrando tu matrícula en el sistema...", icon: Database },
        { text: "Finalizando inscripción...", icon: Check }
    ];

    const CurrentIcon = loadingMessages[loadingStep]?.icon || Loader2;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop con blur más sofisticado */}
            <div
                className="absolute inset-0 bg-zinc-900/60 backdrop-blur-md transition-all duration-300"
                onClick={!isLoading && !isSuccess ? onClose : undefined}
            />

            {/* Modal Card Premium */}
            <div className={`
        relative bg-white rounded-[2rem] shadow-2xl p-0 max-w-[400px] w-full mx-4 overflow-hidden
        transform transition-all duration-500 ease-out
        ${isOpen ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95'}
      `}>
                {/* Barra superior decorativa */}
                <div className={`h-2 w-full transition-colors duration-500 ${isSuccess ? 'bg-emerald-500' : 'bg-blue-600'}`} />

                <div className="p-8">
                    {!isSuccess ? (
                        <>
                            {/* Header Visual */}
                            <div className="flex flex-col items-center mb-8">
                                <div className={`
                  relative w-24 h-24 rounded-full flex items-center justify-center mb-6
                  transition-all duration-500
                  ${isLoading ? 'bg-blue-50' : 'bg-zinc-50 border border-zinc-100'}
                `}>
                                    {isLoading ? (
                                        <>
                                            {/* Anillos de carga animados */}
                                            <div className="absolute inset-0 rounded-full border-4 border-blue-100 animate-[spin_3s_linear_infinite]" />
                                            <div className="absolute inset-2 rounded-full border-2 border-t-blue-600 border-r-transparent border-b-transparent border-l-transparent animate-spin" />

                                            {/* Icono central cambiante */}
                                            <CurrentIcon className="w-8 h-8 text-blue-600 animate-[pulse_1s_ease-in-out_infinite]" />
                                        </>
                                    ) : (
                                        <div className="w-16 h-16 bg-blue-600 rounded-2xl rotate-3 flex items-center justify-center shadow-lg shadow-blue-200">
                                            <Plus className="w-8 h-8 text-white -rotate-3" />
                                        </div>
                                    )}
                                </div>

                                {/* Títulos Dinámicos */}
                                <h3 className="text-2xl font-bold text-zinc-900 text-center mb-3 tracking-tight">
                                    {isLoading ? 'Procesando' : 'Confirmar Matrícula'}
                                </h3>

                                <div className="h-6 flex items-center justify-center overflow-hidden w-full">
                                    <p className={`
                    text-zinc-500 text-sm text-center font-medium transition-all duration-300
                    ${isLoading ? 'text-blue-600' : ''}
                  `}>
                                        {isLoading
                                            ? loadingMessages[loadingStep]?.text
                                            : `Has seleccionado ${cursosCount} curso${cursosCount !== 1 ? 's' : ''}`
                                        }
                                    </p>
                                </div>
                            </div>

                            {/* Botones de Acción */}
                            {!isLoading && (
                                <div className="space-y-3">
                                    <button
                                        onClick={onConfirm}
                                        className="w-full py-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold rounded-xl shadow-lg shadow-blue-600/20 transition-all duration-200 flex items-center justify-center gap-2 group"
                                    >
                                        Confirmar Inscripción
                                        <Check className="w-5 h-5 transition-transform group-hover:scale-110" />
                                    </button>
                                    <button
                                        onClick={onClose}
                                        className="w-full py-3 text-zinc-500 hover:text-zinc-800 font-medium transition-colors text-sm"
                                    >
                                        Cancelar operación
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        /* Estado de Éxito Premium */
                        <div className="flex flex-col items-center py-4">
                            <div className="relative mb-6">
                                <div className="absolute inset-0 bg-emerald-100 rounded-full blur-xl animate-pulse" />
                                <div className="relative w-28 h-28 rounded-full bg-gradient-to-tr from-emerald-50 to-emerald-100 flex items-center justify-center">
                                    <svg className="w-28 h-28 absolute" viewBox="0 0 100 100">
                                        <circle
                                            cx="50" cy="50" r="46" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round"
                                            className="animate-[drawCircle_0.6s_ease-out_forwards]"
                                            style={{ strokeDasharray: '289', strokeDashoffset: '289' }}
                                        />
                                    </svg>
                                    <Check className="w-12 h-12 text-emerald-600 drop-shadow-sm animate-[popIn_0.4s_ease-out_0.3s_both]" />
                                </div>
                            </div>

                            <h3 className="text-2xl font-bold text-zinc-900 mb-2 animate-[fadeInUp_0.4s_ease-out_0.4s_both]">
                                ¡Inscripción Exitosa!
                            </h3>
                            <p className="text-zinc-500 text-center mb-8 px-4 animate-[fadeInUp_0.4s_ease-out_0.5s_both]">
                                Tu matrícula ha sido procesada correctamente. Ya puedes ver tus cursos en el panel.
                            </p>

                            <button
                                onClick={onClose}
                                className="w-full py-4 bg-zinc-900 text-white font-semibold rounded-xl hover:bg-zinc-800 transition-all duration-200 animate-[fadeInUp_0.4s_ease-out_0.6s_both]"
                            >
                                Ver Mis Cursos
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
        @keyframes drawCircle { to { stroke-dashoffset: 0; } }
        @keyframes popIn { 
          0% { transform: scale(0); opacity: 0; } 
          60% { transform: scale(1.1); } 
          100% { transform: scale(1); opacity: 1; } 
        }
        @keyframes fadeInUp { 
          from { opacity: 0; transform: translateY(10px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
      `}</style>
        </div>
    );
};

const AumentoCursosPage: React.FC = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const { addNotification } = useNotifications();
    const [cursosSeleccionados, setCursosSeleccionados] = useState<number[]>([]);

    // Estados para el modal
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Detectar si viene de un pago exitoso (URL puede tener parámetros)
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const pagoExitoso = urlParams.get('pago_exitoso');

        if (pagoExitoso === 'true') {
            // Invalidar todas las queries relacionadas con pago y cursos
            queryClient.invalidateQueries({ queryKey: ['matricula-pagada'] });
            queryClient.invalidateQueries({ queryKey: ['cursos-disponibles'] });
            queryClient.invalidateQueries({ queryKey: ['historial-pagos'] });

            // Limpiar el parámetro de la URL
            window.history.replaceState({}, '', window.location.pathname);
        }
    }, [queryClient]);

    const { data: perfil } = useQuery({
        queryKey: ['estudiante-perfil'],
        queryFn: estudiantesApi.getPerfil,
    });

    const { data: periodoActivo } = useQuery({
        queryKey: ['periodo-activo'],
        queryFn: estudiantesApi.getPeriodoActivo,
    });

    // Verificar si el estudiante ha pagado la matrícula - NO BLOQUEANTE
    const { data: matriculaPagada, isLoading: isLoadingPago, refetch: refetchMatriculaPagada } = useQuery<boolean>({
        queryKey: ['matricula-pagada', periodoActivo?.id],
        queryFn: () => estudiantesApi.verificarMatriculaPagada(periodoActivo!.id),
        enabled: !!periodoActivo?.id,
        staleTime: 30000,
        gcTime: 300000,
        refetchOnMount: true,
        refetchOnWindowFocus: false,
        refetchInterval: (query) => {
            // Si no ha pagado, reintentar cada 3s por si acaba de pagar en otra pestaña
            return query.state.data === false ? 3000 : false;
        },
    });

    // !! OPTIMIZACIÓN: Cargar cursos en paralelo, no depender del estado de pago !!
    // Simplemente requerimos que exista un periodo activo
    const { data: cursosDisponibles, isLoading: isLoadingCursos } = useQuery<CursoDisponible[]>({
        queryKey: ['cursos-disponibles', periodoActivo?.id],
        queryFn: () => estudiantesApi.getCursosDisponibles(periodoActivo!.id),
        enabled: !!periodoActivo?.id, // SOLO depende del periodo, no del pago
        staleTime: 0, // Datos siempre frescos
        gcTime: 0, // No mantener en caché
        refetchOnMount: 'always', // Recargar siempre al entrar
        refetchOnWindowFocus: true, // Recargar al volver a la pestaña
        placeholderData: (previousData) => previousData,
    });

    useEffect(() => {
        if (periodoActivo?.id) {
            if (!queryClient.getQueryData(['matricula-pagada', periodoActivo.id])) {
                refetchMatriculaPagada();
            }
        }
    }, [periodoActivo?.id, refetchMatriculaPagada, queryClient]);

    const matricularMasivoMutation = useMutation({
        mutationFn: estudiantesApi.matricularMasivo,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cursos-disponibles'] });
            queryClient.invalidateQueries({ queryKey: ['mis-cursos'] });
        },
    });

    const cursosParaMatricular = (cursosDisponibles ?? []).filter((c: CursoDisponible) => c.disponible && !c.yaMatriculado);
    const cursosNoDisponibles = (cursosDisponibles ?? []).filter((c: CursoDisponible) => !c.disponible && !c.yaMatriculado);

    const handleToggleCurso = (idCurso: number) => {
        setCursosSeleccionados(prev =>
            prev.includes(idCurso) ? prev.filter(id => id !== idCurso) : [...prev, idCurso]
        );
    };

    const handleOpenConfirmModal = () => {
        if (cursosSeleccionados.length === 0) {
            toast.error('Selecciona al menos un curso para matricular');
            return;
        }

        const idPeriodo = periodoActivo?.id;
        if (!idPeriodo) {
            toast.error('No hay período activo');
            return;
        }

        // Validación final antes de abrir modal (por seguridad)
        if (!matriculaPagada) {
            toast.error('Debes pagar la matrícula antes de poder matricular cursos');
            navigate('/estudiante/pago-matricula-inicial');
            return;
        }

        setShowConfirmModal(true);
        setIsSuccess(false);
        setIsProcessing(false);
    };

    const handleCloseModal = () => {
        if (isSuccess) {
            setCursosSeleccionados([]);
            navigate('/estudiante/matricula');
        }
        setShowConfirmModal(false);
        setIsSuccess(false);
        setIsProcessing(false);
    };

    const handleConfirmMatricula = async () => {
        const idPeriodo = periodoActivo?.id;
        if (!idPeriodo) return;

        setIsProcessing(true);

        try {
            const matriculas = await matricularMasivoMutation.mutateAsync({
                idsCursos: cursosSeleccionados,
                idPeriodo
            });

            // Notificaciones de éxito para feedback visual
            matriculas.forEach(matricula => {
                addNotification({
                    type: 'academico',
                    action: 'matricula',
                    nombre: matricula.nombreCurso,
                    metadata: {
                        idCurso: matricula.idCurso,
                        nombreCurso: matricula.nombreCurso,
                        periodo: matricula.nombrePeriodo || 'Período actual'
                    }
                });
            });

            setIsSuccess(true);
        } catch (error) {
            console.error('Error matriculando:', error);
            setShowConfirmModal(false);
            toast.error('Ocurrió un error al procesar la matrícula');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white border border-zinc-200 rounded-xl p-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-semibold text-zinc-900 mb-1">Aumento de Cursos</h2>
                        <div className="flex items-center gap-3 text-sm text-zinc-500">
                            <span className="flex items-center gap-1.5">

                                <span>Ciclo</span>
                                <span className="px-1.5 py-0.5 bg-zinc-100 text-zinc-700 rounded text-xs font-medium font-mono">{perfil?.cicloActual}</span>
                            </span>
                            <span className="text-zinc-300">•</span>
                            <span className="flex items-center gap-1.5">
                                <span>Créditos Acumulados</span>
                                <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-xs font-medium font-mono">{perfil?.creditosAcumulados}</span>
                            </span>
                        </div>
                        {periodoActivo && (
                            <p className="text-xs text-zinc-400 mt-2 font-mono flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {periodoActivo.nombre}
                            </p>
                        )}
                    </div>

                    {/* Indicador de estado de pago (esquina superior derecha) */}
                    {isLoadingPago ? (
                        <span className="flex items-center gap-2 px-3 py-1 bg-zinc-50 text-zinc-500 rounded-full text-xs border border-zinc-100">
                            <Loader2 className="w-3 h-3 animate-spin" /> Verificando estado de matrícula...
                        </span>
                    ) : matriculaPagada ? (
                        <span className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-medium border border-emerald-100">
                            <Check className="w-3 h-3" /> Matrícula Activa
                        </span>
                    ) : (
                        <span className="flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-xs font-medium border border-amber-100 animate-pulse">
                            <AlertCircle className="w-3 h-3" /> Pago Pendiente
                        </span>
                    )}
                </div>
            </div>

            {/* Banner de Pago Requerido (Solo si ya se confirmó que NO pagó) */}
            {!isLoadingPago && matriculaPagada === false && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex items-start gap-4 animate-[fadeInUp_0.3s_ease-out]">
                    <CreditCard className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <h3 className="font-medium text-amber-900">Pago de matrícula requerido</h3>
                        <p className="text-sm text-amber-700 mt-1">
                            Puedes ver los cursos disponibles, pero <strong>debes realizar el pago</strong> antes de poder confirmar tu matrícula.
                        </p>
                        <button
                            onClick={() => navigate('/estudiante/pago-matricula-inicial')}
                            className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors shadow-sm shadow-amber-200"
                        >
                            <CreditCard className="h-4 w-4" />
                            Ir a Pagar Ahora
                        </button>
                    </div>
                </div>
            )}

            <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-zinc-200 bg-emerald-50/30 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <h3 className="text-sm font-medium text-zinc-900">Cursos Disponibles para Matrícula</h3>
                    </div>
                    {cursosSeleccionados.length > 0 && (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                            {cursosSeleccionados.length} seleccionado(s)
                        </span>
                    )}
                </div>

                {/* Carga de Cursos: Ahora independiente del pago */}
                {isLoadingCursos && !cursosDisponibles ? (
                    <div className="p-12 text-center">
                        <div className="animate-spin w-6 h-6 border-2 border-zinc-900 border-t-transparent rounded-full mx-auto mb-4" />
                        <p className="text-zinc-500 text-sm">Cargando cursos disponibles...</p>
                    </div>
                ) : cursosParaMatricular.length > 0 ? (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-zinc-200 bg-zinc-50/50">
                                        <th className="w-10 px-4 py-3 text-center">
                                            <input
                                                type="checkbox"
                                                className="rounded border-zinc-300 text-emerald-600 transition-colors disabled:opacity-50"
                                                checked={cursosSeleccionados.length === cursosParaMatricular.length && cursosParaMatricular.length > 0}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setCursosSeleccionados(cursosParaMatricular.map((c: CursoDisponible) => c.id));
                                                    } else {
                                                        setCursosSeleccionados([]);
                                                    }
                                                }}
                                                /* Permitimos seleccionar incluso si no ha pagado, para que explore. El bloqueo es al final. */
                                                disabled={matricularMasivoMutation.isPending}
                                            />
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide">Código</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide">Curso</th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-zinc-500 uppercase tracking-wide">Ciclo</th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-zinc-500 uppercase tracking-wide">Créditos</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide">Docente</th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-zinc-500 uppercase tracking-wide">Vacantes</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100">
                                    {cursosParaMatricular.map((curso: CursoDisponible) => {
                                        const vacantes = (curso.capacidadMaxima || 30) - curso.estudiantesMatriculados;
                                        const isSelected = cursosSeleccionados.includes(curso.id);
                                        return (
                                            <tr
                                                key={curso.id}
                                                className={`hover:bg-emerald-50/50 transition-colors cursor-pointer ${isSelected ? 'bg-emerald-50' : ''}`}
                                                onClick={() => handleToggleCurso(curso.id)}
                                            >
                                                <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                                                    <input
                                                        type="checkbox"
                                                        className="rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                                                        checked={isSelected}
                                                        onChange={() => handleToggleCurso(curso.id)}
                                                        disabled={matricularMasivoMutation.isPending}
                                                    />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="font-mono text-xs text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                                                        {curso.codigo}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <p className="text-sm font-medium text-zinc-900">{curso.nombreCurso}</p>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-zinc-100 text-zinc-700 border border-zinc-200">
                                                        Ciclo {curso.ciclo}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className="text-sm font-mono tabular-nums text-zinc-700">{curso.creditos}</span>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-zinc-600">{curso.nombreDocente || 'Por asignar'}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className={`text-sm font-mono tabular-nums ${vacantes > 5 ? 'text-emerald-600' : vacantes > 0 ? 'text-amber-600' : 'text-red-600'}`}>
                                                        {vacantes}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Footer con acciones */}
                        <div className="px-5 py-4 bg-emerald-50/50 border-t border-zinc-200 flex items-center justify-between">
                            <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-zinc-500">Disponibles:</span>
                                    <span className="font-mono tabular-nums text-zinc-700">{cursosParaMatricular.length}</span>
                                </div>
                            </div>

                            {/* Tooltip o mensaje si está deshabilitado por pago */}
                            <div className="flex items-center gap-3">
                                {(!matriculaPagada && !isLoadingPago) && (
                                    <span className="text-xs text-amber-600 font-medium">
                                        Requiere pago de matrícula
                                    </span>
                                )}
                                <button
                                    className={`
                        inline-flex items-center gap-2 px-4 py-2 text-white text-sm font-medium rounded-lg transition-all
                        ${cursosSeleccionados.length === 0 || matricularMasivoMutation.isPending || !matriculaPagada
                                            ? 'bg-zinc-300 cursor-not-allowed opacity-70'
                                            : 'bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-200'}
                    `}
                                    onClick={handleOpenConfirmModal}
                                    disabled={cursosSeleccionados.length === 0 || matricularMasivoMutation.isPending || !matriculaPagada}
                                >
                                    {matricularMasivoMutation.isPending ? 'Matriculando...' : `Matricular (${cursosSeleccionados.length})`}
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="py-16 text-center">
                        <Check className="h-12 w-12 text-emerald-300 mx-auto mb-3" />
                        <p className="text-sm text-zinc-500 mb-1">No hay cursos disponibles para aumento</p>
                        <p className="text-xs text-zinc-400">Ya estás matriculado en todos los cursos disponibles para tu ciclo</p>
                    </div>
                )}
            </div>

            {/* Cursos No Disponibles */}
            {cursosNoDisponibles.length > 0 && (
                <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
                    <div className="px-5 py-3 bg-amber-50/50 border-b border-zinc-200 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-amber-600" />
                        <span className="text-sm font-medium text-amber-800">Cursos No Disponibles ({cursosNoDisponibles.length})</span>
                    </div>
                    <div className="p-4 space-y-2">
                        {cursosNoDisponibles.map((curso: CursoDisponible) => (
                            <div key={curso.id} className="flex items-center justify-between p-3 bg-zinc-50 border border-zinc-100 rounded-lg">
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-zinc-700">{curso.nombreCurso}</p>
                                    <p className="text-xs text-zinc-500">{curso.nombreDocente} • {curso.creditos} créditos • Ciclo {curso.ciclo}</p>
                                </div>
                                {curso.motivoNoDisponible && (
                                    <span className="px-2 py-0.5 bg-amber-100 text-amber-700 border border-amber-200 rounded-full text-xs font-medium">
                                        {curso.motivoNoDisponible}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Modal de confirmación */}
            <ConfirmModal
                isOpen={showConfirmModal}
                onClose={handleCloseModal}
                onConfirm={handleConfirmMatricula}
                isLoading={isProcessing}
                isSuccess={isSuccess}
                cursosCount={cursosSeleccionados.length}
            />
        </div>
    );
};

export default AumentoCursosPage;
