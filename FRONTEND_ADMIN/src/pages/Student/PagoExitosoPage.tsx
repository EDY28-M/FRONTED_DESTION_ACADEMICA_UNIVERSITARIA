import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import paymentApi from '../../lib/paymentApi';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
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
      const response = await paymentApi.get(`/payments/status/session/${sessionId}`);
      
      if (response.data.status === 'Succeeded' || response.data.status === 'succeeded') {
        setIsSuccess(true);
        toast.success('¡Pago completado!');
        
        queryClient.invalidateQueries({ queryKey: ['matricula-pagada'] });
        queryClient.invalidateQueries({ queryKey: ['cursos-disponibles'] });
        queryClient.invalidateQueries({ queryKey: ['historial-pagos'] });
      } else if (response.data.status === 'Pending' || response.data.status === 'pending') {
        setTimeout(verificarPago, 2000);
        return;
      } else {
        setError('El pago no se completó correctamente');
      }
    } catch (err: any) {
      console.error('Error al verificar pago:', err);
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
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-white border border-gray-200 rounded-lg p-8 max-w-md w-full text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Verificando pago...</h2>
          <p className="text-sm text-gray-600">Por favor espera un momento</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-white border border-gray-200 rounded-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Error en el pago</h2>
          <p className="text-sm text-gray-600 mb-6">{error}</p>
          <div className="space-y-2">
            <button
              onClick={() => navigate('/estudiante/pago-matricula-inicial')}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded transition-colors"
            >
              Intentar de nuevo
            </button>
            <button
              onClick={irAInicio}
              className="w-full py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded transition-colors"
            >
              Volver al inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="bg-white border border-gray-200 rounded-lg p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        
        <h2 className="text-xl font-bold text-gray-900 mb-2">Pago Exitoso</h2>
        <p className="text-sm text-gray-600 mb-6">
          Tu pago de matrícula ha sido procesado correctamente.
        </p>

        <div className="space-y-2">
          <button
            onClick={irAMatricular}
            className="w-full py-2.5 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded transition-colors"
          >
            Ir a Matricular Cursos
          </button>
          <button
            onClick={irAInicio}
            className="w-full py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded transition-colors"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    </div>
  );
};

export default PagoExitosoPage;
