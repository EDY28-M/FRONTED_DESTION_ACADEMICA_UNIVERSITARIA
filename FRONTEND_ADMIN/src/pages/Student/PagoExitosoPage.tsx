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

      queryClient.invalidateQueries({ queryKey: ['matricula-pagada'] });
      queryClient.invalidateQueries({ queryKey: ['cursos-disponibles'] });
      queryClient.invalidateQueries({ queryKey: ['historial-pagos'] });
    } catch (err: any) {
      console.error('Error al obtener recibo:', err);

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
    queryClient.invalidateQueries({ queryKey: ['matricula-pagada'] });
    queryClient.invalidateQueries({ queryKey: ['cursos-disponibles'] });
    navigate('/estudiante/aumento-cursos?pago_exitoso=true');
  };

  const handleGoHome = () => {
    navigate('/estudiante/inicio');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-PE', {
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
        <div className="bg-white border border-zinc-200 max-w-sm w-full p-8 text-center">
          <p className="text-sm text-zinc-600 mb-1">
            {retryCount > 0 ? `Verificando pago... (${retryCount}/${MAX_RETRIES})` : 'Verificando pago...'}
          </p>
          <p className="text-xs text-zinc-400">Por favor, espere un momento</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        <div className="bg-white border border-zinc-200 max-w-sm w-full p-8 text-center">
          <p className="text-sm text-zinc-700 mb-6">{error}</p>
          <div className="space-y-2">
            <button
              onClick={() => navigate('/estudiante/pago-matricula-inicial')}
              className="w-full py-2.5 px-4 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium transition-colors"
            >
              Intentar de nuevo
            </button>
            <button
              onClick={handleGoHome}
              className="w-full py-2.5 px-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-sm font-medium transition-colors"
            >
              Volver al inicio
            </button>
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
        <div className="max-w-md mx-auto">

          {/* Boleta de Venta */}
          <div className="bg-white border border-zinc-300 print:border-none" id="receipt-ticket">

            {/* Header institucional */}
            <div className="px-6 pt-6 pb-4 text-center border-b border-zinc-200">
              <img
                src="/images/fondouni.svg"
                alt="Escudo Universitario"
                className="w-14 h-16 mx-auto mb-3 object-contain"
              />
              <h1 className="text-sm font-bold text-zinc-900 uppercase tracking-wide">
                {receipt.universityName}
              </h1>
              <p className="text-xs text-zinc-500 mt-0.5">{receipt.facultyName}</p>
              <p className="text-[11px] text-zinc-400 mt-1">RUC: 20000000001</p>
            </div>

            {/* Título */}
            <div className="px-6 py-3 bg-zinc-50 border-b border-zinc-200 text-center print:bg-white">
              <p className="text-xs font-bold text-zinc-800 uppercase tracking-[0.15em]">
                Boleta de Pago Electrónica
              </p>
              <p className="text-xs font-mono text-zinc-600 mt-1">{receipt.receiptCode}</p>
            </div>

            {/* Datos del estudiante */}
            <div className="px-6 py-4 border-b border-zinc-200 text-xs">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Fecha:</span>
                  <span className="text-zinc-800 font-medium">{formatDate(receipt.paidAt)} - {formatTime(receipt.paidAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Estudiante:</span>
                  <span className="text-zinc-800 font-medium">{receipt.studentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Código:</span>
                  <span className="text-zinc-800 font-mono font-medium">{receipt.studentCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Año académico:</span>
                  <span className="text-zinc-800 font-medium">{receipt.academicYear}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Forma de pago:</span>
                  <span className="text-zinc-800 font-medium">Tarjeta</span>
                </div>
              </div>
            </div>

            {/* Tabla de detalle */}
            <div className="px-6 py-4 border-b border-zinc-200">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-zinc-300">
                    <th className="text-left py-2 text-zinc-500 font-semibold uppercase text-[10px] tracking-wider">Descripción</th>
                    <th className="text-center py-2 text-zinc-500 font-semibold uppercase text-[10px] tracking-wider w-12">Cant.</th>
                    <th className="text-right py-2 text-zinc-500 font-semibold uppercase text-[10px] tracking-wider">Importe</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-zinc-100">
                    <td className="py-3 text-zinc-800">{receipt.concept}</td>
                    <td className="py-3 text-center text-zinc-800">1</td>
                    <td className="py-3 text-right font-mono text-zinc-800">
                      {formatCurrency(receipt.amount, receipt.currency)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Totales */}
            <div className="px-6 py-4 border-b border-zinc-300">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-zinc-500">
                  <span>Subtotal</span>
                  <span className="font-mono">{formatCurrency(receipt.amount * 0.82, receipt.currency)}</span>
                </div>
                <div className="flex justify-between text-zinc-500">
                  <span>IGV (18%)</span>
                  <span className="font-mono">{formatCurrency(receipt.amount * 0.18, receipt.currency)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-zinc-200 text-sm">
                  <span className="font-bold text-zinc-900">TOTAL</span>
                  <span className="font-bold font-mono text-zinc-900">
                    {formatCurrency(receipt.amount, receipt.currency)}
                  </span>
                </div>
              </div>
            </div>

            {/* Estado */}
            <div className="px-6 py-4 text-center">
              <span className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-wider border border-zinc-300 text-zinc-600">
                Pagado
              </span>
              <p className="text-[10px] text-zinc-400 mt-3">
                Comprobante de pago electrónico
              </p>
              <p className="text-[10px] text-zinc-400">
                Conserve este documento para cualquier reclamo
              </p>
            </div>
          </div>

          {/* Botones */}
          <div className="mt-5 space-y-2 print:hidden">
            <button
              onClick={handlePrint}
              className="w-full py-2.5 px-4 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium transition-colors"
            >
              Imprimir / Guardar
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleGoToCourses}
                className="py-2.5 px-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-sm font-medium transition-colors"
              >
                Matricular Cursos
              </button>
              <button
                onClick={handleGoHome}
                className="py-2.5 px-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-sm font-medium transition-colors"
              >
                Volver al Inicio
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          @page {
            margin: 1cm;
          }
          body {
            background: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
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
          .print\\:py-0 {
            padding-top: 0 !important;
            padding-bottom: 0 !important;
          }
          #receipt-ticket {
            max-width: 100% !important;
          }
        }
      `}</style>
    </>
  );
};

export default PagoExitosoPage;
