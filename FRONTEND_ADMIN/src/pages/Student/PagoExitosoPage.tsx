import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import paymentApi from '../../lib/paymentApi';

interface PaymentReceipt {
  id: number;
  receiptCode: string;
  stripeSessionId: string;
  paymentIntentId: string | null;
  studentId: number;
  studentCode: string;
  studentName: string;
  universityName: string;
  facultyName: string;
  concept: string;
  period: string;
  academicYear: number;
  amount: number;
  currency: string;
  status: string;
  paidAt: string;
  stripeEventId: string;
  createdAt: string;
}

const PagoExitosoPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const [receipt, setReceipt] = useState<PaymentReceipt | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 5;

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (sessionId) {
      fetchReceipt();
    } else {
      setError('No se encontró información del pago');
      setIsLoading(false);
    }
  }, [sessionId]);

  const fetchReceipt = async () => {
    try {
      const response = await paymentApi.get(`/receipts/by-session/${sessionId}`);
      setReceipt(response.data);
      setIsLoading(false);
      
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['matricula-pagada'] });
      queryClient.invalidateQueries({ queryKey: ['cursos-disponibles'] });
      queryClient.invalidateQueries({ queryKey: ['historial-pagos'] });
    } catch (err: any) {
      console.error('Error al obtener recibo:', err);
      
      // Si el recibo no existe aún (webhook no procesado), reintentar
      if (err.response?.status === 404 && retryCount < MAX_RETRIES) {
        setRetryCount(prev => prev + 1);
        setTimeout(() => {
          fetchReceipt();
        }, 2000);
        return;
      }
      
      setError(err.response?.data?.mensaje || 'Error al obtener el recibo de pago');
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleGoToCourses = () => {
    // Invalidar queries antes de navegar para asegurar datos frescos
    queryClient.invalidateQueries({ queryKey: ['matricula-pagada'] });
    queryClient.invalidateQueries({ queryKey: ['cursos-disponibles'] });
    // Navegar con parámetro para indicar pago exitoso
    navigate('/estudiante/aumento-cursos?pago_exitoso=true');
  };

  const handleGoHome = () => {
    navigate('/estudiante/inicio');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        <div className="bg-white border border-zinc-300 max-w-lg w-full">
          <div className="bg-zinc-100 border-b border-zinc-300 px-5 py-4">
            <h2 className="text-sm font-semibold text-zinc-900">Verificando pago</h2>
          </div>
          <div className="px-5 py-12 text-center">
            <p className="text-sm text-zinc-600 mb-2">
              {retryCount > 0 ? `Verificando pago... (${retryCount}/${MAX_RETRIES})` : 'Verificando pago...'}
            </p>
            <p className="text-xs text-zinc-500">Por favor, espere un momento</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        <div className="bg-white border border-zinc-300 max-w-lg w-full">
          <div className="bg-zinc-100 border-b border-zinc-300 px-5 py-4">
            <h2 className="text-sm font-semibold text-zinc-900">Error</h2>
          </div>
          <div className="px-5 py-12 text-center">
            <p className="text-sm text-zinc-700 mb-6">{error}</p>
            <div className="space-y-2">
              <button
                onClick={() => navigate('/estudiante/pago-matricula-inicial')}
                className="w-full py-2.5 px-4 bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-medium transition-colors"
              >
                Intentar de nuevo
              </button>
              <button
                onClick={handleGoHome}
                className="w-full py-2.5 px-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 text-sm font-medium transition-colors"
              >
                Volver al inicio
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!receipt) {
    return null;
  }

  return (
    <>
      <div className="min-h-screen bg-zinc-50 py-8 px-4 print:bg-white print:py-0">
        <div className="max-w-3xl mx-auto">
          {/* Recibo Digital */}
          <div className="bg-white border border-zinc-300 print:border-none print:shadow-none">
            {/* Encabezado */}
            <div className="border-b border-zinc-300 px-6 py-5 print:border-b-2">
              <div className="text-center mb-4">
                <h1 className="text-lg font-semibold text-zinc-900 mb-1">
                  {receipt.universityName}
                </h1>
                <p className="text-sm text-zinc-600">{receipt.facultyName}</p>
              </div>
              <div className="text-center">
                <h2 className="text-base font-semibold text-zinc-900 uppercase tracking-wide">
                  Recibo de Pago
                </h2>
              </div>
            </div>

            {/* Código de Recibo */}
            <div className="bg-zinc-100 border-b border-zinc-300 px-6 py-3 print:bg-white">
              <div className="flex justify-between items-center">
                <span className="text-xs text-zinc-600">Código de Recibo</span>
                <span className="text-sm font-mono font-semibold text-zinc-900">{receipt.receiptCode}</span>
              </div>
            </div>

            {/* Información del Recibo */}
            <div className="px-6 py-5 space-y-4">
              {/* Estudiante */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-zinc-600 mb-1">Estudiante</p>
                  <p className="font-medium text-zinc-900">{receipt.studentName}</p>
                </div>
                <div>
                  <p className="text-zinc-600 mb-1">Código</p>
                  <p className="font-medium text-zinc-900">{receipt.studentCode}</p>
                </div>
              </div>

              {/* Concepto y Período */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-zinc-600 mb-1">Concepto</p>
                  <p className="font-medium text-zinc-900">{receipt.concept}</p>
                </div>
                <div>
                  <p className="text-zinc-600 mb-1">Período</p>
                  <p className="font-medium text-zinc-900">{receipt.period}</p>
                </div>
              </div>

              {/* Año y Fecha */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-zinc-600 mb-1">Año Académico</p>
                  <p className="font-medium text-zinc-900">{receipt.academicYear}</p>
                </div>
                <div>
                  <p className="text-zinc-600 mb-1">Fecha de Pago</p>
                  <p className="font-medium text-zinc-900">{formatDate(receipt.paidAt)}</p>
                </div>
              </div>

              {/* Método y Referencia */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-zinc-600 mb-1">Método de Pago</p>
                  <p className="font-medium text-zinc-900">Tarjeta de Crédito o Débito</p>
                </div>
                <div>
                  <p className="text-zinc-600 mb-1">Referencia Stripe</p>
                  <p className="font-mono text-xs text-zinc-900 break-all">{receipt.stripeSessionId}</p>
                </div>
              </div>

              {/* Tabla de Detalle */}
              <div className="border-t border-zinc-300 pt-4 mt-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-300">
                      <th className="text-left py-2 text-zinc-600 font-medium">Concepto</th>
                      <th className="text-right py-2 text-zinc-600 font-medium">Monto</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-zinc-200">
                      <td className="py-3 text-zinc-900">{receipt.concept}</td>
                      <td className="py-3 text-right font-mono text-zinc-900">
                        {formatCurrency(receipt.amount, receipt.currency)}
                      </td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-zinc-300">
                      <td className="py-3 font-semibold text-zinc-900">Total</td>
                      <td className="py-3 text-right font-mono font-semibold text-zinc-900">
                        {formatCurrency(receipt.amount, receipt.currency)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-zinc-300 bg-zinc-50 px-6 py-4 print:bg-white">
              <p className="text-xs text-zinc-600 text-center">
                Este recibo es válido como comprobante de pago oficial
              </p>
            </div>
          </div>

          {/* Botones de Acción (no se imprimen) */}
          <div className="mt-6 space-y-3 print:hidden">
            <button
              onClick={handlePrint}
              className="w-full py-3 px-4 bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-sm font-medium transition-colors"
            >
              Imprimir / Guardar
            </button>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleGoToCourses}
                className="py-2.5 px-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 text-sm font-medium transition-colors"
              >
                Matricular Cursos
              </button>
              <button
                onClick={handleGoHome}
                className="py-2.5 px-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 text-sm font-medium transition-colors"
              >
                Volver al Inicio
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Estilos para impresión */}
      <style>{`
        @media print {
          @page {
            margin: 1.5cm;
          }
          body {
            background: white;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:bg-white {
            background: white !important;
          }
          .print\\:border-none {
            border: none !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:border-b-2 {
            border-bottom-width: 2px !important;
          }
          .print\\:py-0 {
            padding-top: 0 !important;
            padding-bottom: 0 !important;
          }
        }
      `}</style>
    </>
  );
};

export default PagoExitosoPage;
