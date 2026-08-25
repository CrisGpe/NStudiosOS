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

const TERRITORY_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

export const CreateBrandModal: React.FC = () => {
  const { isCreateBrandModalOpen, setIsCreateBrandModalOpen, createBrand, setSelectedBrandId, organizations } = useApp();

  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('');
  const [slogan, setSlogan] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#4f46e5');
  const [contactPerson, setContactPerson] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [selectedOrgId, setSelectedOrgId] = useState<string>('');
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

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isCreateBrandModalOpen) return null;

  const handleAddTerritory = () => {
    const nextColor = TERRITORY_COLORS[territoriesList.length % TERRITORY_COLORS.length];
    setTerritoriesList((prev) => [
      ...prev,
      {
        name: '',
        objective: '',
        contentPillars: '',
        targetAudience: 'Público Objetivo',
        colorTag: nextColor,
      },
    ]);
  };

  const handleRemoveTerritory = (index: number) => {
    if (territoriesList.length <= 3) {
      setFormError('Se requieren obligatoriamente al menos 3 territorios de comunicación activos.');
      return;
    }
    setTerritoriesList((prev) => prev.filter((_, i) => i !== index));
    setFormError(null);
  };

  const handleUpdateTerritory = (index: number, field: string, value: string) => {
    setTerritoriesList((prev) =>
      prev.map((t, i) => (i === index ? { ...t, [field]: value } : t))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
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

    setIsSubmitting(true);
    setFormError(null);

    try {
      const initialTerrs: Omit<CommunicationTerritory, 'id' | 'brandId'>[] = territoriesList.map((t) => ({
        name: t.name.trim(),
        description: t.objective.trim(),
        objective: t.objective.trim(),
        contentPillars: t.contentPillars.split(',').map((p) => p.trim()).filter(Boolean),
        targetAudience: t.targetAudience.trim() || 'Audiencia General',
        colorTag: t.colorTag,
        active: true,
      }));

      const createdBrand = await createBrand(
        {
          name: name.trim(),
          industry: industry.trim(),
          slogan: slogan.trim() || `Impulsando la visión de ${name.trim()}`,
          primaryColor,
          contactPerson: contactPerson.trim(),
          contactEmail: contactEmail.trim(),
          logo: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(name.trim())}`,
          clientOrganizationId: selectedOrgId || undefined,
        },
        initialTerrs
      );

      setSelectedBrandId(createdBrand.id);
      setIsCreateBrandModalOpen(false);
    } catch (err: any) {
      console.error('Error al registrar marca:', err);
      setFormError(err?.message || 'Error al guardar la marca en la base de datos.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      onClick={() => setIsCreateBrandModalOpen(false)}
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col border border-slate-200 text-slate-800 animate-in zoom-in-95"
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-2xs">
              <Building2 className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Registrar Nueva Marca / Cliente</h3>
              <p className="text-[11px] text-slate-500">
                Alta de cliente con validación obligatoria de ≥ 3 territorios de comunicación
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCreateBrandModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span className="text-xs font-semibold">{formError}</span>
            </div>
          )}

          {/* SECTION 1: Brand Info */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              1. Identidad de la Marca
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Nombre de la Marca *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Apex Athletics"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Industria / Sector *
                </label>
                <input
                  type="text"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="Ej: Ropa & Calzado Deportivo"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Slogan o Manifiesto de Marca
                </label>
                <input
                  type="text"
                  value={slogan}
                  onChange={(e) => setSlogan(e.target.value)}
                  placeholder="Ej: Rendimiento sin límites para atletas urbanos"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Color Primario
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-8 h-8 rounded-lg border border-slate-300 cursor-pointer p-0.5 bg-slate-50 shrink-0"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono uppercase focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Persona de Contacto *
                </label>
                <input
                  type="text"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  placeholder="Ej: Mariana Valdés"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Email de Contacto *
                </label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="contacto@marca.com"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Holding / Grupo Empresarial (Opcional)
              </label>
              <select
                value={selectedOrgId}
                onChange={(e) => setSelectedOrgId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all cursor-pointer"
              >
                <option value="">-- Marca Independiente (Sin Holding) --</option>
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    🏢 {org.name} ({org.brandIds.length} marcas vinculadas)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* SECTION 2: 3 Active Communication Territories Builder */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <span>2. Territorios de Comunicación</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      territoriesList.length >= 3
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {territoriesList.length} / 3 Mínimo
                  </span>
                </h4>
                <p className="text-[10.5px] text-slate-500">
                  Regla de negocio: Toda marca en N. Studios debe nacer con al menos 3 pilares activos.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddTerritory}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold transition-all cursor-pointer active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar Territorio</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {territoriesList.map((terr, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2.5 relative shadow-2xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1">
                      <span className="w-5 h-5 rounded-full flex items-center justify-center bg-indigo-600 text-white font-mono text-[10px] font-bold shrink-0">
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        value={terr.name}
                        onChange={(e) => handleUpdateTerritory(idx, 'name', e.target.value)}
                        placeholder="Nombre del territorio"
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={terr.colorTag}
                        onChange={(e) => handleUpdateTerritory(idx, 'colorTag', e.target.value)}
                        className="w-7 h-7 rounded-lg cursor-pointer p-0.5 border border-slate-300 bg-white shrink-0"
                        title="Color distintivo del territorio"
                      />
                      {territoriesList.length > 3 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveTerritory(idx)}
                          className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer active:scale-95"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="text-[10px] text-slate-500 font-medium block mb-0.5">Objetivo Estratégico</label>
                      <input
                        type="text"
                        value={terr.objective}
                        onChange={(e) => handleUpdateTerritory(idx, 'objective', e.target.value)}
                        placeholder="Objetivo principal..."
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 font-medium block mb-0.5">Pilares de Contenido (separados por coma)</label>
                      <input
                        type="text"
                        value={terr.contentPillars}
                        onChange={(e) => handleUpdateTerritory(idx, 'contentPillars', e.target.value)}
                        placeholder="Innovación, Calidad, Estilo"
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Validación de regla estricta: {territoriesList.length} territorios configurados</span>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setIsCreateBrandModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer active:scale-98 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all cursor-pointer active:scale-98 flex items-center gap-1.5 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Guardando en BD...</span>
                  </>
                ) : (
                  <>
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Crear Marca & Activar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
