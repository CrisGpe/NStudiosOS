import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Film,
  Lock,
  Mail,
  User,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  AlertCircle,
  KeyRound,
  Building2,
  Smartphone,
} from 'lucide-react';
import { UserRole } from '../types';

export const LoginView: React.FC = () => {
  const { users, brands, login, loginWithPassword, signUpWithPassword, isLoadingAuth } = useApp();
  const navigate = useNavigate();

  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('director');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showDemoSelector, setShowDemoSelector] = useState(false);

  const isMobileScreen = typeof window !== 'undefined' && window.innerWidth < 768;

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage('Por favor ingresa tu correo y contraseña.');
      return;
    }

    try {
      if (authMode === 'login') {
        await loginWithPassword(email, password);
      } else {
        if (!name) {
          setErrorMessage('Por favor ingresa tu nombre completo.');
          return;
        }
        await signUpWithPassword(email, password, name, 'cliente');
      }

      if (isMobileScreen) {
        navigate('/mobile');
      } else {
        navigate(authMode === 'signup' ? '/client/hub' : '/kanban');
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setErrorMessage(
        err.message === 'Invalid login credentials'
          ? 'Credenciales incorrectas. Verifica tu correo y contraseña.'
          : err.message || 'Error al autenticar en Supabase.'
      );
    }
  };

  const handleQuickDemoLogin = (userId: string) => {
    login(userId);
    const loggedUser = users.find((u) => u.id === userId);
    if (isMobileScreen) {
      navigate('/mobile');
    } else {
      navigate(loggedUser?.role === 'cliente' ? '/client/hub' : '/kanban');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Subtle Background Glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-sm shadow-indigo-600/20">
              <Film className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-extrabold text-sm tracking-tight text-slate-900">
                  N. Studios
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 uppercase tracking-wide">
                  PROD v1.0
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Plataforma RBAC Audiovisual • Nataraja Agency
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Supabase Auth Activo
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-auto z-10">
        <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95">
          
          {/* Card Title & Mode Toggle */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto text-indigo-600 shadow-2xs">
              {authMode === 'login' ? <KeyRound className="w-6 h-6" /> : <Building2 className="w-6 h-6" />}
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              {authMode === 'login' ? 'Acceso al Estudio' : 'Crear Cuenta de Cliente'}
            </h2>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              {authMode === 'login'
                ? 'Ingresa tus credenciales de Supabase para acceder al sistema RBAC.'
                : 'Regístrate como cliente para revisar entregables, co-crear ideas y aprobar piezas.'}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setErrorMessage(null);
              }}
              className={`py-2 rounded-xl transition-all cursor-pointer ${
                authMode === 'login' ? 'bg-white text-indigo-600 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('signup');
                setErrorMessage(null);
              }}
              className={`py-2 rounded-xl transition-all cursor-pointer ${
                authMode === 'signup' ? 'bg-white text-indigo-600 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Registro Cliente
            </button>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Authentication Form */}
          <form onSubmit={handleAuthSubmit} className="space-y-4 text-xs">
            {authMode === 'signup' && (
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nombre Completo *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej. Sofía Chen"
                    required
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-hidden transition-all text-xs"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Correo Electrónico *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu.correo@empresa.com"
                  required
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-hidden transition-all text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Contraseña *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-hidden transition-all text-xs"
                />
              </div>
            </div>

            {authMode === 'signup' && (
              <div className="p-3 rounded-xl bg-indigo-50/80 border border-indigo-100 flex items-center gap-2.5 text-indigo-950">
                <Building2 className="w-4 h-4 text-indigo-600 shrink-0" />
                <div className="text-[11px] leading-tight">
                  <span className="font-bold block">Cuenta de Cliente de Marca</span>
                  <span className="text-slate-500">Acceso exclusivo a tu portal de marca y co-creación.</span>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoadingAuth}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-3 rounded-2xl shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              {isLoadingAuth ? (
                <span>Conectando con Supabase...</span>
              ) : (
                <>
                  <span>{authMode === 'login' ? 'Entrar a la Plataforma' : 'Crear Cuenta de Cliente'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-3 bg-white text-center text-xs text-slate-500 z-10">
        <div className="max-w-6xl mx-auto px-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            <span className="font-semibold text-slate-800">N. Studios OS</span>
            <span className="text-slate-300">•</span>
            <span>Producción Audiovisual & RBAC</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Backend PostgreSQL @ Supabase
          </div>
        </div>
      </footer>
    </div>
  );
};
