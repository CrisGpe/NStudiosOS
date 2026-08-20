import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Building2,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { CommunicationTerritory } from '../types';

export const CreateBrandModal: React.FC = () => {
  const { isCreateBrandModalOpen, setIsCreateBrandModalOpen, createBrand, setSelectedBrandId } = useApp();

  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('');
  const [slogan, setSlogan] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#4f46e5');
  const [contactPerson, setContactPerson] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const [territoriesList, setTerritoriesList] = useState<
    { name: string; objective: string; contentPillars: string; targetAudience: string; colorTag: string }[]
  >([
    {
      name: 'Lanzamiento & Performance',
      objective: 'Posicionamiento de producto de alto rendimiento e impacto directo.',
      contentPillars: 'Innovación, Velocidad, Ergonomía',
      targetAudience: 'Early adopters y profesionales',
      colorTag: '#3b82f6',
    },
    {
      name: 'Estilo de Vida & Comunidad',
      objective: 'Humanizar la marca mediante historias de usuarios y embajadores.',
      contentPillars: 'Cultura, Bienestar, Identidad',
      targetAudience: 'Comunidad activa y seguidores',
      colorTag: '#10b981',
    },
    {
      name: 'Sostenibilidad & Trazabilidad',
      objective: 'Transmitir transparencia, origen de insumos y propósito ético.',
      contentPillars: 'Eco-diseño, Reciclaje, Ética',
      targetAudience: 'Consumidores conscientes',
      colorTag: '#f59e0b',
    },
  ]);

  if (!isCreateBrandModalOpen) return null;

  const handleAddTerritory = () => {
    setTerritoriesList((prev) => [
      ...prev,
      {
        name: `Nuevo Territorio ${prev.length + 1}`,
        objective: 'Definición del propósito estratégico del territorio.',
        contentPillars: 'Pilar 1, Pilar 2, Pilar 3',
        targetAudience: 'Público objetivo',
        colorTag: '#8b5cf6',
      },
    ]);
  };

  const handleRemoveTerritory = (index: number) => {
    if (territoriesList.length <= 3) {
      setFormError('Regla de Negocio Estricta: Cada marca debe tener al menos 3 territorios de comunicación activos.');
      return;
    }
    setFormError(null);
    setTerritoriesList((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleUpdateTerritory = (index: number, field: string, value: string) => {
    setTerritoriesList((prev) =>
      prev.map((t, idx) => (idx === index ? { ...t, [field]: value } : t))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !industry.trim() || !contactPerson.trim() || !contactEmail.trim()) {
      setFormError('Por favor completa todos los campos obligatorios de la marca.');
      return;
    }

    if (territoriesList.length < 3) {
      setFormError('Regla de Negocio Estricta: Se requieren al menos 3 territorios activos.');
      return;
    }

    const emptyTerr = territoriesList.some((t) => !t.name.trim());
    if (emptyTerr) {
      setFormError('Todos los territorios deben tener un nombre válido.');
      return;
    }

    const initialTerrs: Omit<CommunicationTerritory, 'id' | 'brandId'>[] = territoriesList.map((t) => ({
      name: t.name.trim(),
      description: t.objective.trim(),
      objective: t.objective.trim(),
      contentPillars: t.contentPillars.split(',').map((p) => p.trim()).filter(Boolean),
      targetAudience: t.targetAudience.trim() || 'Audiencia General',
      active: true,
      colorTag: t.colorTag,
    }));

    const createdBrand = createBrand(
      {
        name: name.trim(),
        industry: industry.trim(),
        slogan: slogan.trim() || `Innovación y Liderazgo en ${industry.trim()}`,
        primaryColor,
        contactPerson: contactPerson.trim(),
        contactEmail: contactEmail.trim(),
        logo: `https://ui-avatars.com/api/?name=${encodeURIComponent(name.trim())}&background=${primaryColor.replace('#', '')}&color=fff&bold=true`,
      },
      initialTerrs
    );

    setSelectedBrandId(createdBrand.id);
    setIsCreateBrandModalOpen(false);
  };

  return (
    <div
      onClick={() => setIsCreateBrandModalOpen(false)}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in-scale"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass-panel-elevated rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col border border-white/15 text-slate-100"
      >
        
        {/* Header */}
        <div className="p-4 border-b border-white/10 bg-slate-950/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Registrar Nueva Marca / Cliente</h3>
              <p className="text-[11px] text-slate-400">
                Alta de cliente con validación obligatoria de ≥ 3 territorios de comunicación
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCreateBrandModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
          
          {formError && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 flex items-start gap-2 animate-in-scale">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="text-xs font-semibold">{formError}</span>
            </div>
          )}

          {/* SECTION 1: Brand Info */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">
              1. Identidad de la Marca
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Nombre de la Marca *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Hyperion Dynamics"
                  required
                  className="input-impeccable"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Industria / Sector *
                </label>
                <input
                  type="text"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="Ej: Robotics & Automotriz"
                  required
                  className="input-impeccable"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Slogan o Manifiesto de Marca
                </label>
                <input
                  type="text"
                  value={slogan}
                  onChange={(e) => setSlogan(e.target.value)}
                  placeholder="Ej: Redefiniendo el movimiento autónomo"
                  className="input-impeccable"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Color Primario
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-8 h-8 rounded-lg border border-white/20 cursor-pointer p-0.5 bg-slate-900"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="input-impeccable font-mono uppercase flex-1"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Persona de Contacto *
                </label>
                <input
                  type="text"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  placeholder="Ej: Valeria Ramos"
                  required
                  className="input-impeccable"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Email de Contacto *
                </label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="contacto@hyperion.com"
                  required
                  className="input-impeccable font-mono"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: 3 Active Communication Territories Builder */}
          <div className="space-y-3 pt-3 border-t border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <span>2. Territorios de Comunicación</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    territoriesList.length >= 3
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  }`}>
                    {territoriesList.length} / 3 Mínimo
                  </span>
                </h4>
                <p className="text-[10.5px] text-slate-400">
                  Regla de negocio: Toda marca en N. Studios debe nacer con al menos 3 pilares activos.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddTerritory}
                className="btn-secondary py-1 px-2.5 text-[11px]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar Territorio</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {territoriesList.map((terr, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-white/10 bg-slate-950/70 space-y-2.5 relative shadow-2xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1">
                      <span className="w-5 h-5 rounded-full flex items-center justify-center bg-indigo-600 text-white font-mono text-[10px] font-bold">
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        value={terr.name}
                        onChange={(e) => handleUpdateTerritory(idx, 'name', e.target.value)}
                        placeholder="Nombre del territorio"
                        className="input-impeccable font-bold text-xs py-1"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={terr.colorTag}
                        onChange={(e) => handleUpdateTerritory(idx, 'colorTag', e.target.value)}
                        className="w-7 h-7 rounded-lg cursor-pointer p-0.5 border border-white/20 bg-slate-900"
                        title="Color distintivo del territorio"
                      />
                      {territoriesList.length > 3 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveTerritory(idx)}
                          className="p-1 rounded-md text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Objetivo Estratégico</label>
                      <input
                        type="text"
                        value={terr.objective}
                        onChange={(e) => handleUpdateTerritory(idx, 'objective', e.target.value)}
                        placeholder="Objetivo principal..."
                        className="input-impeccable text-xs py-1"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Pilares de Contenido (separados por coma)</label>
                      <input
                        type="text"
                        value={terr.contentPillars}
                        onChange={(e) => handleUpdateTerritory(idx, 'contentPillars', e.target.value)}
                        placeholder="Innovación, Calidad, Estilo"
                        className="input-impeccable text-xs py-1"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Validación de regla estricta: {territoriesList.length} territorios configurados</span>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setIsCreateBrandModalOpen(false)}
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-primary"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Crear Marca & Activar</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
