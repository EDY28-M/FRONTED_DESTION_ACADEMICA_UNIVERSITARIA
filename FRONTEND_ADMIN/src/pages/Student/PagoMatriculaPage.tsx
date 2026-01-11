import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { estudiantesApi } from '../../services/estudiantesApi';
import paymentApi from '../../lib/paymentApi';
import { StripePaymentForm } from '../../components/Payment/StripePaymentForm';
import { 
  ShoppingCart, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  X,
  CreditCard,
  ArrowLeft
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

  const eliminarCurso = (idCurso: number) => {
    setCursosSeleccionados(cursosSeleccionados.filter(c => c.idCurso !== idCurso));
    // Si se elimina un curso, recrear el Payment Intent
    setClientSecret('');
    setPaymentIntentId('');
  };

  if (pagoExitoso) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        <div className="bg-white border border-zinc-200 rounded-xl p-8 max-w-md w-full text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-zinc-900 mb-2">¡Pago Exitoso!</h2>
          <p className="text-zinc-600 mb-6">
            Estamos procesando tu matrícula. Por favor espera...
          </p>
          {isVerifyingPayment && (
            <div className="flex items-center justify-center gap-2 text-zinc-500">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Verificando matrícula...</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/estudiante/matricula')}
            className="flex items-center gap-2 text-zinc-600 hover:text-zinc-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Volver a matrícula</span>
          </button>
          <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
            <ShoppingCart className="w-6 h-6" />
            Pago de Matrícula
          </h1>
          <p className="text-zinc-600 mt-1">Completa el pago para finalizar tu matrícula</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Resumen de cursos */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-zinc-200 rounded-xl p-6 sticky top-4">
              <h2 className="text-lg font-semibold text-zinc-900 mb-4">Resumen</h2>
              
              <div className="space-y-3 mb-6">
                {cursosSeleccionados.map((curso) => (
                  <div
                    key={curso.idCurso}
                    className="flex items-start justify-between p-3 bg-zinc-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-zinc-900">{curso.nombre}</p>
                      <p className="text-xs text-zinc-500 mt-1">
                        {curso.codigo} • {curso.creditos} créditos
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-zinc-900">
                        ${curso.precio.toFixed(2)}
                      </span>
                      <button
                        onClick={() => eliminarCurso(curso.idCurso)}
                        className="text-zinc-400 hover:text-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-zinc-200 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-zinc-600">Subtotal</span>
                  <span className="text-sm font-medium text-zinc-900">
                    ${total.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-zinc-900">Total</span>
                  <span className="text-xl font-bold text-zinc-900">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Formulario de pago */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-zinc-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <CreditCard className="w-5 h-5 text-zinc-600" />
                <h2 className="text-lg font-semibold text-zinc-900">Información de Pago</h2>
              </div>

              {isCreatingIntent ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-zinc-600 mb-4" />
                  <p className="text-zinc-600">Preparando el pago...</p>
                </div>
              ) : clientSecret ? (
                <StripePaymentForm
                  clientSecret={clientSecret}
                  paymentIntentId={paymentIntentId}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">Error al inicializar el pago</p>
                    <p className="text-xs text-amber-700 mt-1">
                      Por favor, intenta nuevamente o contacta con soporte.
                    </p>
                    <button
                      onClick={crearPaymentIntent}
                      className="mt-3 text-sm text-amber-800 hover:text-amber-900 underline"
                    >
                      Reintentar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PagoMatriculaPage;
