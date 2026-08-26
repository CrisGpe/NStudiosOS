import React, { useState } from 'react';
import { Key, CheckCircle, RefreshCw } from 'lucide-react';
import { isSupabaseConfigured } from '../../lib/supabaseClient';

export const IntegrationsWidget: React.FC = () => {
  const [testingAi, setTestingAi] = useState(false);
  const [aiStatus, setAiStatus] = useState<'idle' | 'ok' | 'error'>('idle');

  const testGeminiConnection = async () => {
    setTestingAi(true);
    setAiStatus('idle');
    try {
      const res = await fetch('/api/gemini/ideate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandName: 'Test Brand',
          industry: 'Cinema & AV',
          brandTone: 'Cinematic',
          territory: 'Test',
          briefPrompt: 'Ping test',
        }),
      });
      if (res.ok) {
        setAiStatus('ok');
      } else {
        setAiStatus('error');
      }
    } catch {
      setAiStatus('error');
    } finally {
      setTestingAi(false);
    }
  };

  return (
    <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-white/10 p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Integraciones & Servicios Conectados</h3>
            <p className="text-xs text-slate-400">
              Estado de APIs externas, LLMs e infraestructura cloud
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Supabase */}
        <div className="bg-black/30 rounded-xl p-4 border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white">Supabase Cloud</span>
            {isSupabaseConfigured ? (
              <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400">
                <CheckCircle className="w-3.5 h-3.5" /> Conectado
              </span>
            ) : (
              <span className="text-[11px] font-medium text-amber-400">Sin configurar</span>
            )}
          </div>
          <p className="text-[11px] text-slate-400">
            PostgreSQL relacional, Row-Level Security y Storage S3.
          </p>
          <div className="text-[10px] font-mono text-slate-500 truncate">
            {import.meta.env.VITE_SUPABASE_URL || 'Configurado en .env'}
          </div>
        </div>

        {/* Gemini AI */}
        <div className="bg-black/30 rounded-xl p-4 border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white">Gemini 2.5 Flash LLM</span>
            {aiStatus === 'ok' ? (
              <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400">
                <CheckCircle className="w-3.5 h-3.5" /> Operativo
              </span>
            ) : aiStatus === 'error' ? (
              <span className="text-[11px] font-medium text-rose-400">Error / Sin clave</span>
            ) : (
              <span className="text-[11px] font-medium text-slate-400">Listo para test</span>
            )}
          </div>
          <p className="text-[11px] text-slate-400">
            Co-creación de briefs, análisis de guías y optimización creativa.
          </p>
          <button
            onClick={testGeminiConnection}
            disabled={testingAi}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-medium border border-indigo-500/30 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testingAi ? 'animate-spin' : ''}`} />
            <span>{testingAi ? 'Probando LLM...' : 'Testear Endpoint IA'}</span>
          </button>
        </div>

        {/* Google Drive Workspace */}
        <div className="bg-black/30 rounded-xl p-4 border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white">Google Drive Vault</span>
            <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400">
              <CheckCircle className="w-3.5 h-3.5" /> Activo
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Arquitectura Folder-as-Code multicuenta para masters y proxies.
          </p>
          <div className="text-[10px] font-mono text-slate-500">
            Service Account & OAuth 2.0
          </div>
        </div>
      </div>
    </div>
  );
};
