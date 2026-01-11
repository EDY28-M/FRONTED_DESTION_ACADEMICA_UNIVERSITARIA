import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import paymentApi from '../../lib/paymentApi';
import {
  CheckCircle2,
  Loader2,
  XCircle,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import toast from 'react-hot-toast';

const PagoExitosoPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (sessionId) {
      verificarPago();
    } else {
      setError('No se encontró información del pago');
      setIsVerifying(false);
    }
  }, [sessionId]);

  const verificarPago = async () => {
    try {
      // Verificar el estado del pago con el session_id
      const response = await paymentApi.get(`/payments/status/session/${sessionId}`);
      
      if (response.data.status === 'succeeded' || response.data.status === 'complete') {
        setIsSuccess(true);
        toast.success('¡Pago completado exitosamente!');
        
        // Invalidar queries para refrescar el estado
        queryClient.invalidateQueries({ queryKey: ['matricula-pagada'] });
        queryClient.invalidateQueries({ queryKey: ['cursos-disponibles'] });
        queryClient.invalidateQueries({ queryKey: ['historial-pagos'] });
      } else if (response.data.status === 'pending' || response.data.status === 'processing') {
        // El pago aún está procesándose, esperar un poco y reintentar
        setTimeout(verificarPago, 2000);
        return;
      } else {
        setError('El pago no se completó correctamente');
      }
    } catch (err: any) {
      console.error('Error al verificar pago:', err);
      // Si es 404, el webhook aún no procesó el pago, reintentar
      if (err.response?.status === 404) {
        setTimeout(verificarPago, 2000);
        return;
      }
      setError(err.response?.data?.mensaje || 'Error al verificar el pago');
    } finally {
      setIsVerifying(false);
    }
  };

  const irAMatricular = () => {
    navigate('/estudiante/aumento-cursos');
  };

  const irAInicio = () => {
    navigate('/estudiante/inicio');
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="bg-white border border-zinc-200 rounded-xl p-8 max-w-md w-full text-center shadow-lg">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-zinc-900 mb-2">
            Verificando tu pago...
          </h2>
          <p className="text-zinc-600">
            Por favor espera mientras confirmamos tu transacción
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="bg-white border border-zinc-200 rounded-xl p-8 max-w-md w-full text-center shadow-lg">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-zinc-900 mb-2">
            Error en el pago
          </h2>
          <p className="text-zinc-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/estudiante/pago-matricula-inicial')}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors"
            >
              Intentar de nuevo
            </button>
            <button
              onClick={irAInicio}
              className="w-full py-3 px-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-medium rounded-lg transition-colors"
            >
              Volver al inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50">
      <div className="bg-white border border-zinc-200 rounded-xl p-8 max-w-md w-full text-center shadow-lg">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center animate-bounce">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-zinc-900 mb-2">
          ¡Pago Exitoso!
        </h2>
        <p className="text-zinc-600 mb-6">
          Tu pago de matrícula ha sido procesado correctamente.
          Ahora puedes matricularte en los cursos disponibles.
        </p>

        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center gap-2 text-emerald-700">
            <BookOpen className="w-5 h-5" />
            <span className="font-medium">Ya puedes matricular cursos</span>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={irAMatricular}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <span>Ir a Matricular Cursos</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={irAInicio}
            className="w-full py-3 px-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-medium rounded-lg transition-colors"
          >
            Volver al Inicio
          </button>
        </div>

        <p className="text-xs text-zinc-500 mt-6">
          Se ha enviado un recibo a tu correo electrónico
        </p>
      </div>
    </div>
  );
};

export default PagoExitosoPage;
