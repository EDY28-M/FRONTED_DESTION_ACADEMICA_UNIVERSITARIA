import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { estudiantesApi } from '../../services/estudiantesApi';
import paymentApi from '../../lib/paymentApi';
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
        toast.error('No se pudo iniciar el proceso de pago');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.mensaje || 'Error al procesar la solicitud';
      toast.error(errorMessage);
    } finally {
      setIsCreatingCheckout(false);
    }
  };

  if (loadingPeriodo) {
    return (
      <div className="flex items-center justify-center py-16">
        <span className="text-sm text-zinc-500">Cargando...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Navegación */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/estudiante/inicio')}
          className="text-sm text-zinc-600 hover:text-zinc-900 hover:underline"
        >
          Volver al inicio
        </button>
      </div>

      {/* Título */}
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-zinc-900">
          Pago de Matrícula
        </h1>
        <p className="text-sm text-zinc-600 mt-1">
          {periodoActivo?.nombre || 'Período académico'}
        </p>
      </div>

      {/* Contenedor principal */}
      <div className="border border-zinc-300 bg-white">
        {/* Concepto */}
        <div className="px-5 py-4 border-b border-zinc-200">
          <table className="w-full text-sm">
            <tbody>
              <tr>
                <td className="text-zinc-600 py-1.5">Concepto</td>
                <td className="text-right text-zinc-900 font-medium">Derecho de matrícula</td>
              </tr>
              <tr>
                <td className="text-zinc-600 py-1.5">Período</td>
                <td className="text-right text-zinc-900">{periodoActivo?.nombre || '—'}</td>
              </tr>
              <tr>
                <td className="text-zinc-600 py-1.5">Año</td>
                <td className="text-right text-zinc-900">{periodoActivo?.anio || '—'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Resumen de montos */}
        <div className="px-5 py-4 border-b border-zinc-200 bg-zinc-50">
          <table className="w-full text-sm">
            <tbody>
              <tr>
                <td className="text-zinc-600 py-1">Subtotal</td>
                <td className="text-right font-mono text-zinc-900">S/ {montoMatricula.toFixed(2)}</td>
              </tr>
              <tr>
                <td className="text-zinc-600 py-1">Descuento</td>
                <td className="text-right font-mono text-zinc-900">S/ 0.00</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Total */}
        <div className="px-5 py-4 border-b border-zinc-300">
          <div className="flex justify-between items-center">
            <span className="text-zinc-900 font-semibold">Total a pagar</span>
            <span className="text-lg font-mono font-bold text-zinc-900">S/ {montoMatricula.toFixed(2)}</span>
          </div>
        </div>

        {/* Método de pago */}
        <div className="px-5 py-4 border-b border-zinc-200">
          <p className="text-sm text-zinc-600 mb-2">Método de pago</p>
          <p className="text-sm text-zinc-900">Tarjeta de crédito o débito (Stripe)</p>
        </div>

        {/* Botón de acción */}
        <div className="px-5 py-5">
          <button
            onClick={handlePagarConStripe}
            disabled={isCreatingCheckout || !periodoActivo}
            className="w-full py-3 px-4 bg-[#2E7D32] hover:bg-[#1B5E20] disabled:bg-zinc-300 
                     text-white text-sm font-medium transition-colors disabled:cursor-not-allowed"
          >
            {isCreatingCheckout ? 'Procesando...' : 'Continuar con el pago'}
          </button>
          <p className="text-xs text-zinc-500 text-center mt-3">
            Será redirigido a la pasarela de pago segura.
          </p>
        </div>
      </div>

      {/* Nota legal */}
      <div className="mt-6 text-xs text-zinc-500 leading-relaxed">
        <p>
          Al continuar, acepta los términos y condiciones de matrícula vigentes.
          El pago es procesado mediante pasarela certificada PCI-DSS.
        </p>
      </div>
    </div>
  );
};

export default PagoMatriculaInicialPage;
