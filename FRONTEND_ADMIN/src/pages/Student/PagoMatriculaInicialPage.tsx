import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { estudiantesApi } from '../../services/estudiantesApi';
import paymentApi from '../../lib/paymentApi';
import { StripePaymentForm } from '../../components/Payment/StripePaymentForm';
import {
  GraduationCap,
  Loader2,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  ArrowLeft,
  Shield
} from 'lucide-react';
import toast from 'react-hot-toast';

const PagoMatriculaInicialPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [clientSecret, setClientSecret] = useState<string>('');
  const [paymentIntentId, setPaymentIntentId] = useState<string>('');
  const [isCreatingIntent, setIsCreatingIntent] = useState(false);
  const [pagoExitoso, setPagoExitoso] = useState(false);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);

  const { data: periodoActivo } = useQuery({
    queryKey: ['periodo-activo'],
    queryFn: estudiantesApi.getPeriodoActivo,
  });

  const montoMatricula = 5.00; // 5 PEN

  useEffect(() => {
    if (periodoActivo && !clientSecret) {
      crearPaymentIntent();
    }
  }, [periodoActivo]);

  const crearPaymentIntent = async () => {
    if (!periodoActivo) {
      toast.error('No hay período activo');
      return;
    }

    setIsCreatingIntent(true);

    try {
      const response = await paymentApi.post('/payments/pagar-matricula', { idPeriodo: periodoActivo.id });

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

    try {
      // Llamar al endpoint para confirmar el pago directamente
      const response = await paymentApi.post(`/payments/confirm-payment/${paymentIntentId}`);

      if (response.data.procesado) {
        toast.success('Matrícula pagada exitosamente. Ahora puedes matricular cursos.');
        // Refrescar estado de matrícula pagada y cursos (evita cache viejo en la navegación)
        queryClient.invalidateQueries({ queryKey: ['matricula-pagada'] });
        queryClient.invalidateQueries({ queryKey: ['cursos-disponibles'] });
        setTimeout(() => {
          navigate('/estudiante/aumento-cursos');
        }, 2000);
      } else {
        // Si el procesado falló, intentar verificar el estado
        const statusResponse = await paymentApi.get(`/payments/status/${paymentIntentId}`);
        if (statusResponse.data.status === 'succeeded' && statusResponse.data.procesado) {
          toast.success('Matrícula pagada exitosamente. Ahora puedes matricular cursos.');
          queryClient.invalidateQueries({ queryKey: ['matricula-pagada'] });
          queryClient.invalidateQueries({ queryKey: ['cursos-disponibles'] });
          setTimeout(() => {
            navigate('/estudiante/aumento-cursos');
          }, 2000);
        } else {
          toast.error('Error al procesar el pago. Por favor, contacta con soporte.');
        }
      }
    } catch (error: any) {
      console.error('Error al confirmar pago:', error);
      // Fallback: verificar estado directamente
      try {
        const statusResponse = await paymentApi.get(`/payments/status/${paymentIntentId}`);
        if (statusResponse.data.status === 'succeeded') {
          toast.success('Pago recibido. Procesando matrícula...');
          setTimeout(() => {
            navigate('/estudiante/aumento-cursos');
          }, 2000);
        } else {
          toast.error('Error al procesar el pago');
        }
      } catch {
        toast.error('Error al verificar el pago. Por favor, intenta de nuevo.');
      }
    } finally {
      setIsVerifyingPayment(false);
    }
  };

  const handlePaymentError = (error: string) => {
    toast.error(error);
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
            Estamos procesando tu pago de matrícula. Por favor espera...
          </p>
          {isVerifyingPayment && (
            <div className="flex items-center justify-center gap-2 text-zinc-500">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Verificando pago...</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/estudiante/inicio')}
            className="flex items-center gap-2 text-zinc-600 hover:text-zinc-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Volver</span>
          </button>
          <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">

            Pago de Matrícula
          </h1>
          <p className="text-zinc-600 mt-1">Completa el pago de matrícula para poder matricular cursos</p>
        </div>

        {/* Información importante */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900 mb-1">Información importante</p>
              <p className="text-xs text-blue-700">
                El pago de matrícula es un requisito obligatorio para poder matricular cursos.
                Una vez completado el pago, podrás matricular todos los cursos disponibles para tu ciclo.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Resumen */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-zinc-200 rounded-xl p-6 sticky top-4">
              <h2 className="text-lg font-semibold text-zinc-900 mb-4">Resumen</h2>

              <div className="space-y-3 mb-6">
                <div className="flex items-start justify-between p-3 bg-zinc-50 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-zinc-900">Matrícula</p>
                    <p className="text-xs text-zinc-500 mt-1">
                      Período: {periodoActivo?.nombre || 'Cargando...'}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-zinc-900">
                    S/ {montoMatricula.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="border-t border-zinc-200 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-zinc-900">Total</span>
                  <span className="text-xl font-bold text-zinc-900">
                    S/ {montoMatricula.toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 mt-2">
                  Moneda: Soles Peruanos (PEN)
                </p>
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
                  buttonText="Pagar Matrícula"
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

export default PagoMatriculaInicialPage;
