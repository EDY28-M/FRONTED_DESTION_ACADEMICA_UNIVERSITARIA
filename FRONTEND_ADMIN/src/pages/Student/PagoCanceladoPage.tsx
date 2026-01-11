import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  XCircle,
  ArrowLeft,
  RefreshCw,
  HelpCircle
} from 'lucide-react';

const PagoCanceladoPage: React.FC = () => {
  const navigate = useNavigate();

  const volverAPagar = () => {
    navigate('/estudiante/pago-matricula-inicial');
  };

  const irAInicio = () => {
    navigate('/estudiante/inicio');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50">
      <div className="bg-white border border-zinc-200 rounded-xl p-8 max-w-md w-full text-center shadow-lg">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center">
            <XCircle className="w-10 h-10 text-amber-600" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-zinc-900 mb-2">
          Pago Cancelado
        </h2>
        <p className="text-zinc-600 mb-6">
          Has cancelado el proceso de pago. No se ha realizado ningún cargo a tu tarjeta.
        </p>

        <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3 text-left">
            <HelpCircle className="w-5 h-5 text-zinc-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-zinc-700">¿Necesitas ayuda?</p>
              <p className="text-xs text-zinc-500 mt-1">
                Si tienes problemas con el pago o necesitas asistencia, 
                contacta a soporte técnico.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={volverAPagar}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Intentar de Nuevo</span>
          </button>
          <button
            onClick={irAInicio}
            className="w-full py-3 px-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al Inicio</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PagoCanceladoPage;
