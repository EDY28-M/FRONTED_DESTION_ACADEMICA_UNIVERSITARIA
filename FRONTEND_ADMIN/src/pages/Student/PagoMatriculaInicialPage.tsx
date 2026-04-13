import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { estudiantesApi } from '../../services/estudiantesApi';
import paymentApi from '../../lib/paymentApi';
import toast from 'react-hot-toast';
import { Search, Plus, X, CreditCard, ShieldCheck, ArrowLeft, ChevronRight, Receipt, Loader2, Lock } from 'lucide-react';

interface ServicioPago {
  id: number;
  code: string;
  nombre: string;
  descripcion: string;
  detalle: string | null;
  monto: number;
  categoria: string;
  tipoPago: string;
}

const PagoMatriculaInicialPage: React.FC = () => {
  const navigate = useNavigate();
  const [isCreatingCheckout, setIsCreatingCheckout] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [seleccionados, setSeleccionados] = useState<ServicioPago[]>([]);
  const [paso, setPaso] = useState<'seleccion' | 'resumen'>('seleccion');

  const { data: periodoActivo, isLoading: loadingPeriodo } = useQuery({
    queryKey: ['periodo-activo'],
    queryFn: estudiantesApi.getPeriodoActivo,
  });

  const { data: serviciosDisponibles = [], isLoading: loadingServicios } = useQuery<ServicioPago[]>({
    queryKey: ['services-catalog'],
    queryFn: async () => {
      const response = await paymentApi.get('/services/catalog');
      return response.data;
    },
  });

  // Verificar si ya pagó matrícula
  const { data: matriculaPagada } = useQuery<boolean>({
    queryKey: ['matricula-pagada', periodoActivo?.id],
    queryFn: () => estudiantesApi.verificarMatriculaPagada(periodoActivo!.id),
    enabled: !!periodoActivo?.id,
  });

  // Auto-seleccionar matrícula si no ha pagado
  useEffect(() => {
    if (matriculaPagada === false && serviciosDisponibles.length > 0 && seleccionados.length === 0) {
      const matriculaService = serviciosDisponibles.find(s => s.tipoPago === 'matricula');
      if (matriculaService) {
        setSeleccionados([matriculaService]);
      }
    }
  }, [matriculaPagada, serviciosDisponibles]);

  const serviciosFiltrados = useMemo(() => {
    if (!busqueda.trim()) return serviciosDisponibles;
    const termino = busqueda.toLowerCase();
    return serviciosDisponibles.filter(s =>
      s.nombre.toLowerCase().includes(termino) ||
      s.descripcion.toLowerCase().includes(termino) ||
      s.categoria.toLowerCase().includes(termino)
    );
  }, [busqueda, serviciosDisponibles]);

  const total = seleccionados.reduce((sum, s) => sum + s.monto, 0);

  const agregarServicio = (servicio: ServicioPago) => {
    if (seleccionados.find(s => s.id === servicio.id)) {
      toast.error('Este servicio ya fue agregado');
      return;
    }
    setSeleccionados(prev => [...prev, servicio]);
  };

  const quitarServicio = (id: number) => {
    // No permitir quitar matrícula si no ha pagado
    const servicio = seleccionados.find(s => s.id === id);
    if (servicio?.tipoPago === 'matricula' && matriculaPagada === false) {
      toast.error('La matrícula es obligatoria para poder matricular cursos');
      return;
    }
    setSeleccionados(prev => prev.filter(s => s.id !== id));
  };

  const handlePagarConStripe = async () => {
    if (!periodoActivo) {
      toast.error('No hay período activo');
      return;
    }

    if (seleccionados.length === 0) {
      toast.error('Seleccione al menos un servicio');
      return;
    }

    setIsCreatingCheckout(true);

    try {
      const frontendOrigin = window.location.origin;
      const response = await paymentApi.post('/services/checkout', {
        idPeriodo: periodoActivo.id,
        serviceIds: seleccionados.map(s => s.id),
        successUrl: `${frontendOrigin}/estudiante/pago-exitoso`,
        cancelUrl: `${frontendOrigin}/estudiante/pago-cancelado`,
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

  if (loadingPeriodo || loadingServicios) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-zinc-800 animate-spin" />
          <span className="text-sm text-zinc-500">Cargando servicios de pago...</span>
        </div>
      </div>
    );
  }

  // ─── PASO 2: RESUMEN DE PAGO ───
  if (paso === 'resumen') {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <button
            onClick={() => setPaso('seleccion')}
            className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a servicios
          </button>
          <h1 className="text-xl font-bold text-zinc-900">Resumen de Pago</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Período {periodoActivo?.nombre || '—'} · Año {periodoActivo?.anio || '—'}
          </p>
        </div>

        {/* Detalle de servicios */}
        <div className="bg-white border border-zinc-200 overflow-hidden">
          <div className="px-5 py-3.5 bg-zinc-900 flex items-center gap-2.5">
            <Receipt className="w-4 h-4 text-white/70" />
            <span className="text-sm font-semibold text-white tracking-wide">Detalle del Pago</span>
          </div>

          <div className="divide-y divide-zinc-100">
            {seleccionados.map((servicio, idx) => (
              <div key={servicio.id} className="px-5 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-zinc-100 text-[11px] font-bold text-zinc-600">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                        {servicio.categoria}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-zinc-900 leading-snug">
                      {servicio.nombre}
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">{servicio.detalle}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-base font-mono font-bold text-zinc-900">
                      S/ {servicio.monto.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Totales */}
          <div className="border-t border-zinc-200 bg-zinc-50/80">
            <div className="px-5 py-3 flex justify-between text-sm">
              <span className="text-zinc-500">Subtotal</span>
              <span className="font-mono text-zinc-700">S/ {total.toFixed(2)}</span>
            </div>
            <div className="px-5 pb-3 flex justify-between text-sm">
              <span className="text-zinc-500">Descuento</span>
              <span className="font-mono text-zinc-700">S/ 0.00</span>
            </div>
          </div>

          <div className="border-t-2 border-zinc-900 px-5 py-4 flex justify-between items-center">
            <span className="text-base font-bold text-zinc-900">Total a Pagar</span>
            <span className="text-2xl font-mono font-black text-zinc-900">S/ {total.toFixed(2)}</span>
          </div>
        </div>

        {/* Método de pago */}
        <div className="bg-white border border-zinc-200">
          <div className="px-5 py-3 border-b border-zinc-100 flex items-center gap-2.5">
            <CreditCard className="w-4 h-4 text-zinc-400" />
            <span className="text-sm font-semibold text-zinc-700">Método de Pago</span>
          </div>
          <div className="px-5 py-4 flex items-center gap-3">
            <div className="w-10 h-7 bg-gradient-to-br from-zinc-700 to-zinc-900 rounded flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-900">Tarjeta de crédito o débito</p>
              <p className="text-xs text-zinc-500">Procesado por Stripe · Visa, Mastercard, AMEX</p>
            </div>
          </div>
        </div>

        {/* Botón Pagar */}
        <div>
          <button
            onClick={handlePagarConStripe}
            disabled={isCreatingCheckout || !periodoActivo}
            className="w-full py-3.5 px-4 bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-950 disabled:bg-zinc-300 
                     text-white text-sm font-semibold tracking-wide transition-all disabled:cursor-not-allowed
                     flex items-center justify-center gap-2"
          >
            {isCreatingCheckout ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                Pagar S/ {total.toFixed(2)}
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-1.5 mt-3">
            <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
            <p className="text-xs text-zinc-400">
              Pago seguro · Será redirigido a la pasarela certificada PCI-DSS
            </p>
          </div>
        </div>

        {/* Nota legal */}
        <p className="text-[11px] text-zinc-400 leading-relaxed text-center pb-4">
          Al continuar, acepta los términos y condiciones de matrícula vigentes.
        </p>
      </div>
    );
  }

  // ─── PASO 1: SELECCIÓN DE SERVICIOS ───
  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate('/estudiante/inicio')}
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </button>
        <h1 className="text-xl font-bold text-zinc-900">Pagos</h1>
        <p className="text-sm text-zinc-500 mt-0.5">
          Selecciona los servicios que deseas pagar · {periodoActivo?.nombre || 'Período académico'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* ─── Columna Izquierda: Catálogo ─── */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white border border-zinc-200">
            {/* Buscador */}
            <div className="px-4 py-3 border-b border-zinc-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar servicios..."
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 text-sm text-zinc-900 
                           placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 transition-all"
                />
              </div>
            </div>

            {/* Lista de servicios */}
            <div className="divide-y divide-zinc-100">
              {serviciosFiltrados.length === 0 ? (
                <div className="px-5 py-10 text-center">
                  <Search className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                  <p className="text-sm text-zinc-500">No se encontraron servicios</p>
                  <p className="text-xs text-zinc-400 mt-1">Intenta con otro término de búsqueda</p>
                </div>
              ) : (
                serviciosFiltrados.map((servicio) => {
                  const yaSeleccionado = seleccionados.some(s => s.id === servicio.id);
                  return (
                    <div
                      key={servicio.id}
                      className={`px-5 py-4 flex items-start gap-4 transition-colors ${
                        yaSeleccionado ? 'bg-zinc-50' : 'hover:bg-zinc-50/60'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-zinc-900 leading-snug">
                          {servicio.nombre}
                        </p>
                        <p className="text-xs font-medium text-zinc-600 mt-1">
                          {servicio.descripcion}
                        </p>
                        <p className="text-xs font-semibold text-emerald-600 mt-1.5">
                          S/ {servicio.monto.toFixed(2)}
                        </p>
                      </div>
                      <button
                        onClick={() => yaSeleccionado ? quitarServicio(servicio.id) : agregarServicio(servicio)}
                        className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                          yaSeleccionado
                            ? 'bg-zinc-900 text-white hover:bg-red-600'
                            : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-900 hover:text-white'
                        }`}
                        title={yaSeleccionado ? 'Quitar' : 'Agregar'}
                      >
                        {yaSeleccionado ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* ─── Columna Derecha: Seleccionados ─── */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-zinc-200 sticky top-4">
            <div className="px-5 py-3.5 bg-zinc-900">
              <h2 className="text-sm font-semibold text-white tracking-wide">Pagos Seleccionados</h2>
            </div>

            {seleccionados.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mx-auto mb-3">
                  <Receipt className="w-5 h-5 text-zinc-400" />
                </div>
                <p className="text-sm text-zinc-500">Ningún pago seleccionado</p>
                <p className="text-xs text-zinc-400 mt-1">Agrega servicios de la lista</p>
              </div>
            ) : (
              <>
                <div className="divide-y divide-zinc-100">
                  {seleccionados.map((servicio, idx) => {
                    const esMatriculaObligatoria = servicio.tipoPago === 'matricula' && matriculaPagada === false;
                    return (
                    <div key={servicio.id} className="px-5 py-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-0.5">
                            {idx + 1}. {servicio.categoria}
                          </p>
                          <p className="text-sm text-zinc-900 font-medium leading-snug truncate">
                            {servicio.nombre}
                            {esMatriculaObligatoria && (
                              <span className="ml-2 text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                                OBLIGATORIO
                              </span>
                            )}
                          </p>
                        </div>
                        {esMatriculaObligatoria ? (
                          <span className="shrink-0 text-amber-500 p-1" title="Obligatorio para matricular cursos">
                            <Lock className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                        <button
                          onClick={() => quitarServicio(servicio.id)}
                          className="shrink-0 text-zinc-400 hover:text-red-500 transition-colors p-1"
                          title="Quitar"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-xs text-zinc-500">{servicio.descripcion}</span>
                        <span className="text-sm font-mono font-bold text-zinc-900">
                          S/ {servicio.monto.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    );
                  })}
                </div>

                {/* Total */}
                <div className="border-t-2 border-zinc-200 px-5 py-3 bg-zinc-50/80">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-zinc-700">Total</span>
                    <span className="text-lg font-mono font-black text-emerald-700">
                      S/ {total.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Botón continuar */}
                <div className="px-5 py-4 border-t border-zinc-200">
                  <button
                    onClick={() => setPaso('resumen')}
                    className="w-full py-2.5 px-4 bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-950
                             text-white text-sm font-semibold transition-all
                             flex items-center justify-center gap-2"
                  >
                    Continuar
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Info adicional */}
          <div className="mt-4 flex items-start gap-2 px-1">
            <ShieldCheck className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Pagos procesados mediante pasarela certificada PCI-DSS. Sus datos están protegidos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PagoMatriculaInicialPage;
