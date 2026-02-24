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

  const formatShortDate = (dateString: string) => {
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
      minute: '2-digit',
      second: '2-digit'
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
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-50 flex items-center justify-center">
            <svg className="w-8 h-8 text-emerald-500 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Procesando tu pago</h3>
          <p className="text-sm text-gray-500">
            {retryCount > 0 ? `Verificando comprobante... (${retryCount}/${MAX_RETRIES})` : 'Por favor, espere un momento...'}
          </p>
          <div className="mt-4 w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min((retryCount / MAX_RETRIES) * 100, 95)}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Error al procesar</h3>
          <p className="text-sm text-gray-500 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/estudiante/pago-matricula-inicial')}
              className="w-full py-3 px-4 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-xl transition-all"
            >
              Intentar de nuevo
            </button>
            <button
              onClick={handleGoHome}
              className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition-all"
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
      <div className="min-h-screen bg-gray-100 py-8 px-4 print:bg-white print:py-0">
        <div className="max-w-md mx-auto">

          {/* ✅ Badge de éxito */}
          <div className="text-center mb-6 print:hidden">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center shadow-lg shadow-emerald-100">
              <svg className="w-10 h-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800">¡Pago Exitoso!</h2>
            <p className="text-sm text-gray-500 mt-1">Tu comprobante ha sido generado</p>
          </div>

          {/* 🧾 Recibo Ticket */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden print:rounded-none print:shadow-none" id="receipt-ticket">

            {/* Borde decorativo superior */}
            <div className="h-2 bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600" />

            {/* Header institucional */}
            <div className="px-8 pt-8 pb-5 text-center">
              {/* Logo/Sello */}
              <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-gray-900 flex items-center justify-center">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                </svg>
              </div>
              <h1 className="text-base font-bold text-gray-900 uppercase tracking-wide">
                {receipt.universityName}
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">{receipt.facultyName}</p>
            </div>

            {/* Separador */}
            <div className="border-t-2 border-dashed border-gray-200 mx-6" />

            {/* Título del recibo */}
            <div className="px-8 py-4 text-center">
              <span className="inline-block px-4 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-widest rounded-full">
                Comprobante de Pago
              </span>
            </div>

            {/* Número de recibo */}
            <div className="mx-6 px-4 py-3 bg-gray-50 rounded-xl flex items-center justify-between">
              <span className="text-xs text-gray-500 font-medium">N° Comprobante</span>
              <span className="text-sm font-mono font-bold text-gray-900 tracking-wider">{receipt.receiptCode}</span>
            </div>

            {/* Info del estudiante */}
            <div className="px-8 pt-5 pb-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-0.5">Estudiante</p>
                  <p className="text-sm font-semibold text-gray-900">{receipt.studentName}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-0.5">Código</p>
                  <p className="text-sm font-mono font-semibold text-gray-900">{receipt.studentCode}</p>
                </div>
              </div>

              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-0.5">Periodo</p>
                  <p className="text-sm font-medium text-gray-800">{receipt.period}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-0.5">Año Académico</p>
                  <p className="text-sm font-medium text-gray-800">{receipt.academicYear}</p>
                </div>
              </div>

              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-0.5">Fecha</p>
                  <p className="text-sm font-medium text-gray-800">{formatShortDate(receipt.paidAt)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-0.5">Hora</p>
                  <p className="text-sm font-mono font-medium text-gray-800">{formatTime(receipt.paidAt)}</p>
                </div>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-0.5">Método de Pago</p>
                <p className="text-sm font-medium text-gray-800">Tarjeta de Crédito / Débito</p>
              </div>
            </div>

            {/* Separador */}
            <div className="border-t-2 border-dashed border-gray-200 mx-6" />

            {/* Detalle del pago */}
            <div className="px-8 py-5">
              <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-3">Detalle</p>

              <div className="space-y-2">
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-sm text-gray-700">{receipt.concept}</span>
                  </div>
                  <span className="text-sm font-mono font-medium text-gray-800">
                    {formatCurrency(receipt.amount, receipt.currency)}
                  </span>
                </div>
              </div>

              {/* Total */}
              <div className="mt-4 pt-4 border-t-2 border-gray-800">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-900 uppercase">Total Pagado</span>
                  <span className="text-xl font-bold font-mono text-emerald-600">
                    {formatCurrency(receipt.amount, receipt.currency)}
                  </span>
                </div>
              </div>
            </div>

            {/* Separador */}
            <div className="border-t-2 border-dashed border-gray-200 mx-6" />

            {/* Estado y verificación */}
            <div className="px-8 py-5 text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 rounded-full mb-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-semibold text-emerald-700">PAGADO</span>
              </div>
              <p className="text-[11px] text-gray-400 mt-2">
                Documento válido como comprobante de pago
              </p>
              <p className="text-[10px] text-gray-300 font-mono mt-1">
                Ref: {receipt.receiptCode}
              </p>
            </div>

            {/* Borde decorativo inferior */}
            <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600" />
          </div>

          {/* Botones de Acción */}
          <div className="mt-6 space-y-3 print:hidden">
            <button
              onClick={handlePrint}
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18.75 12h.008v.008h-.008V12zm-3 0h.008v.008h-.008V12z" />
              </svg>
              Imprimir Comprobante
            </button>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleGoToCourses}
                className="py-3 px-4 bg-white hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded-xl transition-all border border-gray-200 shadow-sm"
              >
                Matricular Cursos
              </button>
              <button
                onClick={handleGoHome}
                className="py-3 px-4 bg-white hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded-xl transition-all border border-gray-200 shadow-sm"
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
            margin: 1cm;
            size: 80mm auto;
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
          .print\\:rounded-none {
            border-radius: 0 !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:py-0 {
            padding-top: 0 !important;
            padding-bottom: 0 !important;
          }
          #receipt-ticket {
            box-shadow: none !important;
            border-radius: 0 !important;
            max-width: 100% !important;
          }
        }
      `}</style>
    </>
  );
};

export default PagoExitosoPage;
