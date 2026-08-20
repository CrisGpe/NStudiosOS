import React from 'react';
import { useRouteError, isRouteErrorResponse, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Home, RefreshCw } from 'lucide-react';

export const RouteErrorBoundary: React.FC = () => {
  const error = useRouteError();
  const navigate = useNavigate();

  let title = 'Página no encontrada';
  let message = 'La sección a la que intentas acceder no existe o fue movida en la plataforma.';
  let statusCode = 404;

  if (isRouteErrorResponse(error)) {
    statusCode = error.status;
    if (error.status === 404) {
      title = '404 - Módulo no encontrado';
      message = error.data?.message || 'No se encontró la ruta solicitada en N. Studios OS.';
    } else if (error.status === 401 || error.status === 403) {
      title = 'Acceso Restringido';
      message = 'Tu rol actual no cuenta con permisos para ver este módulo.';
    } else {
      title = `Error del Sistema (${error.status})`;
      message = error.statusText || 'Ocurrió un error inesperado al procesar la ruta.';
    }
  } else if (error instanceof Error) {
    title = 'Error de Ejecución';
    message = error.message;
    statusCode = 500;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xl text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Visual Icon Badge */}
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto shadow-sm">
          <AlertCircle className="w-8 h-8 text-indigo-600 animate-pulse" />
        </div>

        {/* Text Details */}
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100 font-mono">
            Código {statusCode}
          </span>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight mt-2">
            {title}
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
            {message}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-2.5">
          <button
            onClick={() => navigate('/kanban')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <Home className="w-4 h-4" />
            <span>Ir al Tablero Kanban</span>
          </button>

          <button
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Regresar</span>
          </button>
        </div>

        {/* Footer info */}
        <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400 font-medium">
          N. Studios — Nataraja Agency OS • Sistema de Enrutamiento Seguro
        </div>

      </div>
    </div>
  );
};
