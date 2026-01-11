import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { estudiantesApi } from '../../services/estudiantesApi';
import paymentApi from '../../lib/paymentApi';
import { Loader2, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const PagoMatriculaInicialPage: React.FC = () => {
  const navigate = useNavigate();
  const [isCreatingCheckout, setIsCreatingCheckout] = useState(false);

  const { data: periodoActivo, isLoading: loadingPeriodo } = useQuery({
    queryKey: ['periodo-activo'],
    queryFn: estudiantesApi.getPeriodoActivo,
  });

  const montoMatricula = 5.00;

  const handlePagarConStripe = async () => {
    if (!periodoActivo) {
      toast.error('No hay período activo');
      return;
    }

    setIsCreatingCheckout(true);

    try {
      const response = await paymentApi.post('/payments/checkout/matricula', {
        idPeriodo: periodoActivo.id,
        tipoPago: 'matricula',
      });

      if (response.data.checkoutUrl) {
        window.location.href = response.data.checkoutUrl;
      } else {
        toast.error('Error: No se recibió la URL de pago');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.mensaje || 'Error al iniciar el pago';
      toast.error(errorMessage);
      console.error('Error al crear checkout:', error);
    } finally {
      setIsCreatingCheckout(false);
    }
  };

  if (loadingPeriodo) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-gray-600" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/estudiante/inicio')}
          className="flex items-center gap-1 text-gray-600 hover:text-gray-900 mb-3 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Pago de Matrícula</h1>
      </div>

      {/* Contenido */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {/* Resumen */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900 mb-4">Resumen</h2>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <div>
                <p className="font-medium text-gray-900">Matrícula</p>
                <p className="text-sm text-gray-500">{periodoActivo?.nombre}</p>
              </div>
              <p className="font-semibold text-gray-900">S/ {montoMatricula.toFixed(2)}</p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between text-lg">
              <span className="font-bold text-gray-900">Total</span>
              <span className="font-bold text-gray-900">S/ {montoMatricula.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Pago */}
        <div className="p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Método de Pago</h2>
          
          <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded text-sm text-gray-600">
            <p>Pago procesado por Stripe</p>
            <p className="text-xs text-gray-500 mt-1">Tarjetas Visa, Mastercard, American Express</p>
          </div>

          <button
            onClick={handlePagarConStripe}
            disabled={isCreatingCheckout || !periodoActivo}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 
                     text-white font-medium rounded transition-colors
                     disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isCreatingCheckout ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Procesando...
              </>
            ) : (
              <>Pagar S/ {montoMatricula.toFixed(2)}</>
            )}
          </button>

          <p className="text-xs text-center text-gray-500 mt-3">
            Serás redirigido a Stripe para completar el pago
          </p>
        </div>
      </div>

      {/* Nota */}
      <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded text-sm text-gray-600">
        <p className="font-medium mb-1">Nota importante:</p>
        <p>Después de completar el pago podrás matricularte en los cursos disponibles.</p>
      </div>
    </div>
  );
};

export default PagoMatriculaInicialPage;
