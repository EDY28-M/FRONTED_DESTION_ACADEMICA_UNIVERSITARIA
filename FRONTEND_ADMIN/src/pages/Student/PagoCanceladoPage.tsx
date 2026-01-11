import React from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle } from 'lucide-react';

const PagoCanceladoPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="bg-white border border-gray-200 rounded-lg p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <XCircle className="w-8 h-8 text-gray-600" />
        </div>
        
        <h2 className="text-xl font-bold text-gray-900 mb-2">Pago Cancelado</h2>
        <p className="text-sm text-gray-600 mb-6">
          Has cancelado el proceso de pago. No se realizó ningún cargo.
        </p>

        <div className="space-y-2">
          <button
            onClick={() => navigate('/estudiante/pago-matricula-inicial')}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded transition-colors"
          >
            Intentar de nuevo
          </button>
          <button
            onClick={() => navigate('/estudiante/inicio')}
            className="w-full py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded transition-colors"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    </div>
  );
};

export default PagoCanceladoPage;
