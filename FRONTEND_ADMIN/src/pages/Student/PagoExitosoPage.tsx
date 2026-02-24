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
      <div className="bg-zinc-50 py-6 px-4 no-print">
        <div className="max-w-md mx-auto">

          {/* Boleta de Venta */}
          <div className="bg-white border border-zinc-300" id="receipt-ticket">

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
            <div className="px-6 py-3 bg-zinc-50 border-b border-zinc-200 text-center">
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
          <div className="mt-5 space-y-2">
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

      {/* Print-only version rendered outside the .no-print wrapper */}
      <div id="print-receipt" style={{ display: 'none' }}>
        <div style={{ maxWidth: '360px', margin: '30px auto', padding: '24px', fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif' }}>
          {/* Header institucional */}
          <div style={{ textAlign: 'center', paddingBottom: '12px', borderBottom: '1px solid #e4e4e7' }}>
            <img
              src="/images/fondouni.svg"
              alt="Escudo"
              style={{ width: '50px', height: '58px', margin: '0 auto 10px', display: 'block', objectFit: 'contain' as const }}
            />
            <div style={{ fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase' as const, letterSpacing: '0.05em', color: '#18181b' }}>
              {receipt.universityName}
            </div>
            <div style={{ fontSize: '11px', color: '#71717a', marginTop: '2px' }}>{receipt.facultyName}</div>
            <div style={{ fontSize: '10px', color: '#a1a1aa', marginTop: '4px' }}>RUC: 20000000001</div>
          </div>

          {/* Título */}
          <div style={{ textAlign: 'center', padding: '10px 0', borderBottom: '1px solid #e4e4e7', background: '#fafafa' }}>
            <div style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' as const, letterSpacing: '0.15em', color: '#27272a' }}>
              Boleta de Pago Electrónica
            </div>
            <div style={{ fontSize: '11px', fontFamily: 'monospace', color: '#52525b', marginTop: '4px' }}>
              {receipt.receiptCode}
            </div>
          </div>

          {/* Datos */}
          <div style={{ padding: '12px 0', borderBottom: '1px solid #e4e4e7', fontSize: '11px' }}>
            {[
              ['Fecha:', `${formatDate(receipt.paidAt)} - ${formatTime(receipt.paidAt)}`],
              ['Estudiante:', receipt.studentName],
              ['Código:', receipt.studentCode],
              ['Año académico:', String(receipt.academicYear)],
              ['Forma de pago:', 'Tarjeta'],
            ].map(([label, value], i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', color: '#27272a' }}>
                <span style={{ color: '#71717a' }}>{label}</span>
                <span style={{ fontWeight: 500 }}>{value}</span>
              </div>
            ))}
          </div>

          {/* Detalle */}
          <div style={{ padding: '12px 0', borderBottom: '1px solid #e4e4e7' }}>
            <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse' as const }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #d4d4d8' }}>
                  <th style={{ textAlign: 'left', padding: '4px 0', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase' as const, color: '#71717a' }}>Descripción</th>
                  <th style={{ textAlign: 'center', padding: '4px 0', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase' as const, color: '#71717a', width: '40px' }}>Cant.</th>
                  <th style={{ textAlign: 'right', padding: '4px 0', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase' as const, color: '#71717a' }}>Importe</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '8px 0', color: '#27272a' }}>{receipt.concept}</td>
                  <td style={{ padding: '8px 0', textAlign: 'center', color: '#27272a' }}>1</td>
                  <td style={{ padding: '8px 0', textAlign: 'right', fontFamily: 'monospace', color: '#27272a' }}>
                    {formatCurrency(receipt.amount, receipt.currency)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Totales */}
          <div style={{ padding: '12px 0', borderBottom: '1px solid #d4d4d8', fontSize: '11px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#71717a', padding: '2px 0' }}>
              <span>Subtotal</span>
              <span style={{ fontFamily: 'monospace' }}>{formatCurrency(receipt.amount * 0.82, receipt.currency)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#71717a', padding: '2px 0' }}>
              <span>IGV (18%)</span>
              <span style={{ fontFamily: 'monospace' }}>{formatCurrency(receipt.amount * 0.18, receipt.currency)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0 0', borderTop: '1px solid #e4e4e7', marginTop: '6px', fontSize: '13px' }}>
              <span style={{ fontWeight: 'bold', color: '#18181b' }}>TOTAL</span>
              <span style={{ fontWeight: 'bold', fontFamily: 'monospace', color: '#18181b' }}>
                {formatCurrency(receipt.amount, receipt.currency)}
              </span>
            </div>
          </div>

          {/* Estado */}
          <div style={{ textAlign: 'center', padding: '14px 0' }}>
            <span style={{ display: 'inline-block', padding: '3px 12px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' as const, letterSpacing: '0.1em', border: '1px solid #d4d4d8', color: '#52525b' }}>
              Pagado
            </span>
            <div style={{ fontSize: '9px', color: '#a1a1aa', marginTop: '10px' }}>
              Comprobante de pago electrónico
            </div>
            <div style={{ fontSize: '9px', color: '#a1a1aa' }}>
              Conserve este documento para cualquier reclamo
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          @page {
            margin: 15mm;
            size: A4;
          }

          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* Hide the on screen receipt + buttons */
          .no-print {
            display: none !important;
          }

          /* Hide StudentLayout sidebar (desktop + mobile) and header */
          .lg\\:fixed,
          .lg\\:inset-y-0,
          header,
          nav,
          aside,
          [class*="lg:w-60"],
          [class*="z-40"] {
            display: none !important;
          }

          /* Remove the left padding from layout content area */
          .lg\\:pl-60,
          [class*="lg:pl-60"] {
            padding-left: 0 !important;
            margin-left: 0 !important;
          }

          /* Show ONLY the print receipt */
          #print-receipt {
            display: block !important;
          }
        }
      `}</style>
    </>
  );
};

export default PagoExitosoPage;
