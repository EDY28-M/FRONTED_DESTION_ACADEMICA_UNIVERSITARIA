import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { estudiantesApi } from '../../services/estudiantesApi';
import paymentApi from '../../lib/paymentApi';
import { 
  Loader2, 
  ArrowLeft, 
  User, 
  GraduationCap, 
  Calendar, 
  CreditCard,
  CheckCircle,
  Shield
} from 'lucide-react';
import toast from 'react-hot-toast';

const PagoMatriculaInicialPage: React.FC = () => {
  const navigate = useNavigate();
  const [isCreatingCheckout, setIsCreatingCheckout] = useState(false);

  const { data: perfil, isLoading: loadingPerfil } = useQuery({
    queryKey: ['estudiante-perfil'],
    queryFn: estudiantesApi.getPerfil,
  });

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

  if (loadingPeriodo || loadingPerfil) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/estudiante/inicio')}
          className="flex items-center gap-1 text-gray-600 hover:text-gray-900 mb-3 text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
            <CreditCard className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Pago de Matrícula</h1>
            <p className="text-sm text-gray-600">Completa tu matrícula para el período académico</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna izquierda - Información */}
        <div className="lg:col-span-2 space-y-6">
          {/* Datos del Estudiante */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Datos del Estudiante</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-600 mb-1">Nombre Completo</p>
                <p className="font-semibold text-gray-900">
                  {perfil?.nombres} {perfil?.apellidos}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Código</p>
                <p className="font-semibold text-gray-900">{perfil?.codigo || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Carrera</p>
                <p className="font-semibold text-gray-900">{perfil?.carrera || 'No especificada'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Correo Electrónico</p>
                <p className="font-semibold text-gray-900 text-sm truncate">{perfil?.correo}</p>
              </div>
            </div>
          </div>

          {/* Ciclo Académico */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <GraduationCap className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg font-semibold text-gray-900">Ciclo Académico</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-600 mb-1">Período Actual</p>
                <p className="font-semibold text-gray-900">{periodoActivo?.nombre || 'No disponible'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Año Académico</p>
                <p className="font-semibold text-gray-900">{periodoActivo?.anio || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Ciclo Actual del Estudiante</p>
                <p className="font-semibold text-gray-900">{perfil?.cicloActual || 'N/A'}° Ciclo</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Estado</p>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <p className="font-semibold text-gray-900">{perfil?.estado || 'Activo'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Beneficios */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h2 className="text-lg font-semibold text-gray-900">Beneficios de tu Matrícula</h2>
            </div>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Acceso completo a matricular cursos del período</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Participación en todas las actividades académicas</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Acceso a servicios de biblioteca y laboratorios</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Validez oficial de tus estudios</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Columna derecha - Pago */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden sticky top-4">
            {/* Resumen */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-gray-700" />
                <h2 className="font-semibold text-gray-900">Resumen de Pago</h2>
              </div>
              
              <div className="space-y-3">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-600 mb-1">Concepto</p>
                  <p className="font-semibold text-gray-900">Matrícula Académica</p>
                  <p className="text-xs text-gray-500 mt-1">{periodoActivo?.nombre}</p>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                  <span className="text-sm text-gray-600">Subtotal</span>
                  <span className="font-medium text-gray-900">S/ {montoMatricula.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center text-lg pt-3 border-t-2 border-gray-300">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="font-bold text-blue-600">S/ {montoMatricula.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Método de Pago */}
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-gray-700" />
                <h2 className="font-semibold text-gray-900">Método de Pago</h2>
              </div>
              
              <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-6 bg-[#635BFF] rounded flex items-center justify-center">
                    <span className="text-white font-bold text-[10px]">stripe</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900">Pago Seguro con Stripe</p>
                </div>
                <p className="text-xs text-gray-600">
                  Visa, Mastercard, American Express
                </p>
              </div>

              <button
                onClick={handlePagarConStripe}
                disabled={isCreatingCheckout || !periodoActivo}
                className="w-full py-4 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 
                         disabled:from-gray-300 disabled:to-gray-300 text-white font-semibold rounded-lg 
                         transition-all duration-200 disabled:cursor-not-allowed 
                         flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                {isCreatingCheckout ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    Pagar S/ {montoMatricula.toFixed(2)}
                  </>
                )}
              </button>

              <p className="text-xs text-center text-gray-500 mt-3">
                🔒 Conexión segura SSL · Redirige a Stripe
              </p>
            </div>
          </div>

          {/* Nota de seguridad */}
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs text-amber-800 font-medium mb-1">
              ⚠️ Importante
            </p>
            <p className="text-xs text-amber-700">
              No compartas tu información de pago con terceros. Los pagos son procesados de forma segura.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PagoMatriculaInicialPage;
