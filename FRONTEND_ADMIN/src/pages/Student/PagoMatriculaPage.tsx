import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { estudiantesApi } from '../../services/estudiantesApi';
import paymentApi from '../../lib/paymentApi';
import { StripePaymentForm } from '../../components/Payment/StripePaymentForm';
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
      toast.error('No hay cursos seleccionados');
      navigate('/estudiante/matricula');
    }
  }, [cursosSeleccionados, navigate]);

  useEffect(() => {
    if (cursosSeleccionados.length > 0 && periodoActivo && !clientSecret) {
      crearPaymentIntent();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    } catch (error: any) {
      const errorMessage = error.response?.data?.mensaje || 'Error al inicializar el pago';
      toast.error(errorMessage);
    } finally {
      setIsCreatingIntent(false);
    }
  };

  const handlePaymentSuccess = async (intentId: string) => {
    setPagoExitoso(true);
    setIsVerifyingPayment(true);

    const checkPaymentStatus = async () => {
      try {
        const response = await paymentApi.get(`/payments/status/${intentId}`);
        const status = response.data.status;

        if (status === 'succeeded' && response.data.procesado) {
          toast.success('Matrícula completada');
          setTimeout(() => navigate('/estudiante/mis-cursos'), 2000);
        } else if (status === 'succeeded' && !response.data.procesado) {
          setTimeout(checkPaymentStatus, 2000);
        } else {
          toast.error('Error al procesar la matrícula');
        }
      } catch {
        setTimeout(checkPaymentStatus, 2000);
      }
    };

    checkPaymentStatus();
  };

  const handlePaymentError = (error: string) => {
    toast.error(error);
  };

  // Estado: Pago exitoso
  if (pagoExitoso) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16">
        <div className="border border-zinc-300 bg-white">
          <div className="bg-zinc-100 border-b border-zinc-300 px-5 py-3">
            <h2 className="text-sm font-semibold text-zinc-900">Confirmación de Pago</h2>
          </div>
          <div className="px-5 py-8 text-center">
            <p className="text-zinc-900 font-medium mb-2">Pago recibido correctamente</p>
            <p className="text-sm text-zinc-600 mb-6">
              Estamos registrando su matrícula en el sistema.
            </p>
            {isVerifyingPayment && (
              <p className="text-sm text-zinc-500">Procesando...</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Navegación */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/estudiante/matricula')}
          className="text-sm text-zinc-600 hover:text-zinc-900 hover:underline"
        >
          Volver a selección de cursos
        </button>
      </div>

      {/* Título */}
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-zinc-900">
          Pago de Cursos
        </h1>
        <p className="text-sm text-zinc-600 mt-1">
          {periodoActivo?.nombre || 'Período académico'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Columna izquierda: Cursos y pago */}
        <div className="lg:col-span-3 space-y-6">
          {/* Lista de cursos */}
          <div className="border border-zinc-300 bg-white">
            <div className="bg-zinc-100 border-b border-zinc-300 px-5 py-3">
              <h2 className="text-sm font-semibold text-zinc-900">Cursos seleccionados</h2>
            </div>
            <div className="divide-y divide-zinc-200">
              {cursosSeleccionados.map((curso, index) => (
                <div key={curso.idCurso} className="px-5 py-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-zinc-900">
                        {index + 1}. {curso.nombre}
                      </p>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        {curso.codigo} — {curso.creditos} créditos
                      </p>
                    </div>
                    <p className="text-sm font-mono text-zinc-900">
                      ${curso.precio.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Formulario de pago */}
          <div className="border border-zinc-300 bg-white">
            <div className="bg-zinc-100 border-b border-zinc-300 px-5 py-3">
              <h2 className="text-sm font-semibold text-zinc-900">Información de pago</h2>
            </div>
            <div className="p-5">
              {isCreatingIntent ? (
                <div className="py-12 text-center">
                  <p className="text-sm text-zinc-500">Inicializando pasarela de pago...</p>
                </div>
              ) : clientSecret ? (
                <StripePaymentForm
                  clientSecret={clientSecret}
                  paymentIntentId={paymentIntentId}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
              ) : (
                <div className="py-8 text-center">
                  <p className="text-sm text-zinc-700 mb-3">
                    No se pudo inicializar el proceso de pago.
                  </p>
                  <button
                    onClick={crearPaymentIntent}
                    className="text-sm text-zinc-600 hover:text-zinc-900 underline"
                  >
                    Reintentar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Columna derecha: Resumen */}
        <div className="lg:col-span-2">
          <div className="border border-zinc-300 bg-white sticky top-4">
            <div className="bg-zinc-100 border-b border-zinc-300 px-5 py-3">
              <h2 className="text-sm font-semibold text-zinc-900">Resumen de pago</h2>
            </div>
            <div className="px-5 py-4">
              <table className="w-full text-sm">
                <tbody>
                  <tr>
                    <td className="text-zinc-600 py-1.5">Concepto</td>
                    <td className="text-right text-zinc-900">Matrícula de cursos</td>
                  </tr>
                  <tr>
                    <td className="text-zinc-600 py-1.5">Cantidad</td>
                    <td className="text-right text-zinc-900">{cursosSeleccionados.length} curso(s)</td>
                  </tr>
                  <tr>
                    <td className="text-zinc-600 py-1.5">Período</td>
                    <td className="text-right text-zinc-900">{periodoActivo?.nombre || '—'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3 border-t border-zinc-200 bg-zinc-50">
              <table className="w-full text-sm">
                <tbody>
                  <tr>
                    <td className="text-zinc-600 py-1">Subtotal</td>
                    <td className="text-right font-mono text-zinc-900">${total.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="text-zinc-600 py-1">Descuento</td>
                    <td className="text-right font-mono text-zinc-900">$0.00</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="px-5 py-4 border-t border-zinc-300">
              <div className="flex justify-between items-center">
                <span className="text-zinc-900 font-semibold">Total</span>
                <span className="text-lg font-mono font-bold text-zinc-900">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Nota */}
          <div className="mt-4 text-xs text-zinc-500 leading-relaxed">
            <p>
              Al completar el pago, acepta los términos de matrícula institucional.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PagoMatriculaPage;
