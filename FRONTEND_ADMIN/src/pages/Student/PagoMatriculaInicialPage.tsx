import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { estudiantesApi } from '../../services/estudiantesApi';
import paymentApi from '../../lib/paymentApi';
import {
  Loader2,
  AlertCircle,
  CreditCard,
  ArrowLeft,
  Shield,
  ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';

const PagoMatriculaInicialPage: React.FC = () => {
  const navigate = useNavigate();
  const [isCreatingCheckout, setIsCreatingCheckout] = useState(false);

  const { data: periodoActivo, isLoading: loadingPeriodo } = useQuery({
    queryKey: ['periodo-activo'],
    queryFn: estudiantesApi.getPeriodoActivo,
  });

  const montoMatricula = 5.00; // 5 PEN

  const handlePagarConStripe = async () => {
    if (!periodoActivo) {
      toast.error('No hay período activo');
      return;
    }

    setIsCreatingCheckout(true);

    try {
      // Llamar al nuevo endpoint de checkout
      const response = await paymentApi.post('/payments/checkout/matricula', {
        idPeriodo: periodoActivo.id,
        tipoPago: 'matricula',
        // Las URLs de redirección las genera el backend
      });

      if (response.data.checkoutUrl) {
        // Redirigir a la ventana de Stripe Checkout
        toast.success('Redirigiendo a Stripe...');
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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-600" />
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
            <CreditCard className="w-7 h-7" />
            Pago de Matrícula
          </h1>
          <p className="text-zinc-600 mt-1">Completa el pago de matrícula para poder matricular cursos</p>
        </div>

        {/* Información importante */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900 mb-1">Pago seguro con Stripe</p>
              <p className="text-xs text-blue-700">
                Serás redirigido a la plataforma segura de Stripe para completar tu pago.
                Una vez completado, regresarás automáticamente y podrás matricular cursos.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Resumen */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-zinc-200 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-zinc-900 mb-4">Resumen del Pago</h2>

              <div className="space-y-3 mb-6">
                <div className="flex items-start justify-between p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-200">
                  <div className="flex-1">
                    <p className="text-base font-medium text-zinc-900">Pago de Matrícula</p>
                    <p className="text-sm text-zinc-500 mt-1">
                      Período: {periodoActivo?.nombre || 'No disponible'}
                    </p>
                    <p className="text-xs text-emerald-700 mt-2">
                      ✓ Acceso a matricular cursos
                    </p>
                  </div>
                  <span className="text-lg font-bold text-emerald-700">
                    S/ {montoMatricula.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="border-t border-zinc-200 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-zinc-600">Subtotal</span>
                  <span className="font-medium">S/ {montoMatricula.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-lg">
                  <span className="font-semibold text-zinc-900">Total a Pagar</span>
                  <span className="font-bold text-emerald-700">
                    S/ {montoMatricula.toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 mt-3">
                  Moneda: Soles Peruanos (PEN)
                </p>
              </div>
            </div>
          </div>

          {/* Botón de pago */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-zinc-200 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-zinc-900 mb-4">Método de Pago</h2>

              <div className="space-y-4">
                {/* Info de Stripe */}
                <div className="flex items-center gap-3 p-4 bg-zinc-50 rounded-lg">
                  <div className="w-12 h-8 bg-[#635BFF] rounded flex items-center justify-center">
                    <span className="text-white font-bold text-xs">stripe</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-900">Pago con Tarjeta</p>
                    <p className="text-xs text-zinc-500">Visa, Mastercard, American Express</p>
                  </div>
                </div>

                {/* Botón de pago */}
                <button
                  onClick={handlePagarConStripe}
                  disabled={isCreatingCheckout || !periodoActivo}
                  className="w-full py-4 px-6 bg-[#635BFF] hover:bg-[#5851db] disabled:bg-zinc-300 
                           text-white font-semibold rounded-lg transition-all duration-200
                           flex items-center justify-center gap-2 shadow-lg hover:shadow-xl
                           disabled:cursor-not-allowed"
                >
                  {isCreatingCheckout ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Preparando pago...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      <span>Pagar S/ {montoMatricula.toFixed(2)}</span>
                      <ExternalLink className="w-4 h-4 ml-1" />
                    </>
                  )}
                </button>

                <p className="text-xs text-center text-zinc-500">
                  Serás redirigido a la plataforma segura de Stripe
                </p>

                {/* Seguridad */}
                <div className="flex items-center justify-center gap-4 pt-4 border-t border-zinc-200">
                  <div className="flex items-center gap-1 text-xs text-zinc-500">
                    <Shield className="w-4 h-4" />
                    <span>Pago Seguro</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-zinc-500">
                    <span>🔒</span>
                    <span>SSL Encriptado</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Ayuda */}
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800">¿Necesitas ayuda?</p>
                  <p className="text-xs text-amber-700 mt-1">
                    Si tienes problemas con el pago, contacta a soporte técnico.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PagoMatriculaInicialPage;
