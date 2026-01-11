import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { estudiantesApi } from '../../services/estudiantesApi';
import paymentApi from '../../lib/paymentApi';
import { StripePaymentForm } from '../../components/Payment/StripePaymentForm';
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  FileText,
  User,
  Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';

interface CursoSeleccionado {
  idCurso: number;
  codigo: string;
  nombre: string;
  creditos: number;
  precio: number;
}

interface LocationState {
  cursos?: CursoSeleccionado[];
}

const PagoMatriculaPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;

  const [cursosSeleccionados, setCursosSeleccionados] = useState<CursoSeleccionado[]>(
    state?.cursos || []
  );
  const [clientSecret, setClientSecret] = useState<string>('');
  const [paymentIntentId, setPaymentIntentId] = useState<string>('');
  const [isCreatingIntent, setIsCreatingIntent] = useState(false);
  const [pagoExitoso, setPagoExitoso] = useState(false);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);

  const { data: periodoActivo } = useQuery({
    queryKey: ['periodo-activo'],
    queryFn: estudiantesApi.getPeriodoActivo,
  });

  const { data: perfil } = useQuery({
    queryKey: ['estudiante-perfil'],
    queryFn: estudiantesApi.getPerfil,
  });

  const total = cursosSeleccionados.reduce((sum, curso) => sum + curso.precio, 0);

  useEffect(() => {
    if (cursosSeleccionados.length === 0) {
      toast.error('No hay cursos seleccionados para pagar');
      navigate('/estudiante/matricula');
    }
  }, [cursosSeleccionados, navigate]);

  useEffect(() => {
    if (cursosSeleccionados.length > 0 && periodoActivo && !clientSecret) {
      crearPaymentIntent();
    }
  }, [cursosSeleccionados, periodoActivo]);

  const crearPaymentIntent = async () => {
    if (!periodoActivo) {
      toast.error('No hay período activo');
      return;
    }

    setIsCreatingIntent(true);

    try {
      const response = await paymentApi.post('/payments/create-intent', {
        idPeriodo: periodoActivo.id,
        cursos: cursosSeleccionados.map(c => ({
          idCurso: c.idCurso,
          precio: c.precio,
          cantidad: 1,
        })),
      });

      setClientSecret(response.data.clientSecret);
      setPaymentIntentId(response.data.paymentIntentId);
      toast.success('Payment Intent creado exitosamente');
    } catch (error: any) {
      const errorMessage = error.response?.data?.mensaje || 'Error al crear Payment Intent';
      toast.error(errorMessage);
      console.error('Error al crear Payment Intent:', error);
    } finally {
      setIsCreatingIntent(false);
    }
  };

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    setPagoExitoso(true);
    setIsVerifyingPayment(true);

    // Verificar el estado del pago periódicamente
    const checkPaymentStatus = async () => {
      try {
        const response = await paymentApi.get(`/payments/status/${paymentIntentId}`);
        const status = response.data.status;

        if (status === 'succeeded' && response.data.procesado) {
          toast.success('Matrícula completada exitosamente');
          setTimeout(() => {
            navigate('/estudiante/mis-cursos');
          }, 2000);
        } else if (status === 'succeeded' && !response.data.procesado) {
          // El pago fue exitoso pero aún no se procesó la matrícula
          // Continuar verificando
          setTimeout(checkPaymentStatus, 2000);
        } else {
          toast.error('Error al procesar la matrícula');
        }
      } catch (error) {
        console.error('Error al verificar estado del pago:', error);
        // Continuar verificando
        setTimeout(checkPaymentStatus, 2000);
      }
    };

    // Iniciar verificación
    checkPaymentStatus();
  };

  const handlePaymentError = (error: string) => {
    toast.error(error);
  };

  // Función para eliminar cursos (deshabilitada en diseño institucional)
  // En diseño institucional, se espera que el estudiante regrese a la selección
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const eliminarCurso = (idCurso: number) => {
    setCursosSeleccionados(cursosSeleccionados.filter(c => c.idCurso !== idCurso));
    // Si se elimina un curso, recrear el Payment Intent
    setClientSecret('');
    setPaymentIntentId('');
  };

  if (pagoExitoso) {
    return (
      <div className="min-h-screen bg-[#F6F7F9] flex items-center justify-center p-6">
        <div className="bg-white border border-gray-300 shadow-sm max-w-lg w-full">
          <div className="bg-[#2C5F7F] text-white px-6 py-4 border-b border-[#24526B]">
            <h2 className="text-lg font-semibold tracking-tight">Verificación de Pago</h2>
          </div>
          <div className="p-8 text-center">
            <div className="flex justify-center mb-5">
              <div className="w-14 h-14 bg-[#E8F4EA] border-2 border-[#4CAF50] rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7 text-[#4CAF50]" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Pago Recibido</h3>
            <p className="text-[15px] text-gray-700 leading-relaxed mb-6">
              Su pago ha sido procesado correctamente.<br />
              Estamos registrando su matrícula en el sistema.
            </p>
            {isVerifyingPayment && (
              <div className="flex items-center justify-center gap-2 text-gray-600 bg-gray-50 py-3 px-4 border border-gray-200">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm font-medium">Procesando matrícula...</span>
              </div>
            )}
            <p className="text-xs text-gray-500 mt-4">
              Por favor, no cierre esta ventana.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F7F9]">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Navegación */}
        <div className="mb-5">
          <button
            onClick={() => navigate('/estudiante/matricula')}
            className="inline-flex items-center gap-1.5 text-[13px] text-gray-600 hover:text-[#2C5F7F] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Volver a Selección de Cursos
          </button>
        </div>

        {/* Header Institucional */}
        <div className="mb-7">
          <h1 className="text-[28px] font-semibold text-gray-900 tracking-tight mb-2">
            Pago de Matrícula — {periodoActivo?.nombre || 'Período Académico'}
          </h1>
          <div className="flex items-center gap-4 text-[14px] text-gray-600">
            <span className="flex items-center gap-1.5">
              <User className="w-4 h-4 text-gray-500" />
              {perfil?.nombres} {perfil?.apellidos}
            </span>
            <span className="text-gray-400">•</span>
            <span className="flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-gray-500" />
              Código: {perfil?.codigo || 'N/A'}
            </span>
            {periodoActivo?.anio && (
              <>
                <span className="text-gray-400">•</span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  Año {periodoActivo.anio}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* Columna Izquierda: Información Académica */}
          <div className="lg:col-span-3 space-y-5">
            {/* Cursos Matriculados */}
            <div className="bg-white border border-gray-300 shadow-sm">
              <div className="bg-gray-50 border-b border-gray-300 px-5 py-3.5">
                <h2 className="text-[15px] font-semibold text-gray-900 tracking-tight">
                  Cursos Seleccionados
                </h2>
              </div>
              <div className="p-5">
                <div className="space-y-3">
                  {cursosSeleccionados.map((curso, index) => (
                    <div
                      key={curso.idCurso}
                      className="border-b border-gray-200 pb-3 last:border-b-0 last:pb-0"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 pr-4">
                          <div className="flex items-start gap-3">
                            <span className="inline-flex items-center justify-center w-6 h-6 bg-gray-100 text-gray-700 text-[11px] font-semibold border border-gray-300 mt-0.5">
                              {index + 1}
                            </span>
                            <div>
                              <p className="text-[14px] font-medium text-gray-900 leading-tight">
                                {curso.nombre}
                              </p>
                              <div className="flex items-center gap-3 mt-1.5 text-[13px] text-gray-600">
                                <span>Código: {curso.codigo}</span>
                                <span className="text-gray-400">|</span>
                                <span>{curso.creditos} créditos</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[15px] font-mono font-semibold text-gray-900">
                            ${curso.precio.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Formulario de Pago */}
            <div className="bg-white border border-gray-300 shadow-sm">
              <div className="bg-gray-50 border-b border-gray-300 px-5 py-3.5">
                <h2 className="text-[15px] font-semibold text-gray-900 tracking-tight">
                  Método de Pago
                </h2>
              </div>
              <div className="p-6">
                {isCreatingIntent ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <Loader2 className="w-7 h-7 animate-spin text-gray-500 mb-3" />
                    <p className="text-[14px] text-gray-600">
                      Inicializando pasarela de pago...
                    </p>
                  </div>
                ) : clientSecret ? (
                  <StripePaymentForm
                    clientSecret={clientSecret}
                    paymentIntentId={paymentIntentId}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                  />
                ) : (
                  <div className="bg-[#FFF9E6] border border-[#E5B800] p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-[#B8860B] flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[14px] font-medium text-gray-900 mb-1">
                          No se pudo inicializar el proceso de pago
                        </p>
                        <p className="text-[13px] text-gray-700 mb-3">
                          Por favor, intente nuevamente. Si el problema persiste, contacte con el departamento de tesorería.
                        </p>
                        <button
                          onClick={crearPaymentIntent}
                          className="text-[13px] text-[#2C5F7F] hover:text-[#1F4B63] font-medium underline"
                        >
                          Reintentar
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Columna Derecha: Resumen de Pago (estilo comprobante bancario) */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-300 shadow-sm sticky top-4">
              <div className="bg-[#2C5F7F] text-white px-5 py-3.5 border-b border-[#24526B]">
                <h2 className="text-[15px] font-semibold tracking-tight">Resumen de Pago</h2>
              </div>
              <div className="p-5">
                {/* Detalles */}
                <div className="space-y-3 mb-5">
                  <div className="flex justify-between text-[13px]">
                    <span className="text-gray-600">Concepto:</span>
                    <span className="text-gray-900 font-medium">Matrícula de Cursos</span>
                  </div>
                  <div className="flex justify-between text-[13px]">
                    <span className="text-gray-600">Cantidad de cursos:</span>
                    <span className="text-gray-900 font-medium">{cursosSeleccionados.length}</span>
                  </div>
                  <div className="flex justify-between text-[13px]">
                    <span className="text-gray-600">Período académico:</span>
                    <span className="text-gray-900 font-medium">{periodoActivo?.nombre || '—'}</span>
                  </div>
                </div>

                {/* Línea divisoria fina */}
                <div className="border-t border-gray-300 my-4"></div>

                {/* Montos */}
                <div className="space-y-2.5 mb-4">
                  <div className="flex justify-between items-center text-[13px]">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-mono text-gray-900">${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-[13px]">
                    <span className="text-gray-600">Descuentos</span>
                    <span className="font-mono text-gray-900">$0.00</span>
                  </div>
                  <div className="flex justify-between items-center text-[13px]">
                    <span className="text-gray-600">Cargos adicionales</span>
                    <span className="font-mono text-gray-900">$0.00</span>
                  </div>
                </div>

                {/* Total destacado */}
                <div className="bg-[#F0F4F7] border-t-2 border-[#2C5F7F] px-4 py-3.5 -mx-5 -mb-5">
                  <div className="flex justify-between items-center">
                    <span className="text-[15px] font-semibold text-gray-900">Total a pagar</span>
                    <span className="text-[20px] font-mono font-bold text-[#2C5F7F]">
                      ${total.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-600 mt-2">
                    Moneda: Dólares Estadounidenses (USD)
                  </p>
                </div>
              </div>
            </div>

            {/* Nota institucional */}
            <div className="mt-4 bg-white border border-gray-300 px-4 py-3">
              <p className="text-[12px] text-gray-700 leading-relaxed">
                <span className="font-semibold text-gray-900">Nota:</span> Al completar el pago, usted acepta los términos y condiciones de matrícula de la institución. El pago es procesado de forma segura mediante pasarela certificada.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PagoMatriculaPage;
