import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Building2, X, Plus, Check } from 'lucide-react';

interface CreateHoldingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onHoldingCreated?: (orgId: string) => void;
}

export const CreateHoldingModal: React.FC<CreateHoldingModalProps> = ({
  isOpen,
  onClose,
  onHoldingCreated,
}) => {
  const { brands, createOrganization, toast, setSelectedOrgId } = useApp();

  const [name, setName] = useState('');
  const [legalName, setLegalName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [selectedBrandIds, setSelectedBrandIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const toggleBrand = (brandId: string) => {
    setSelectedBrandIds((prev) =>
      prev.includes(brandId) ? prev.filter((id) => id !== brandId) : [...prev, brandId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.warning('Por favor ingresa el nombre del Holding / Grupo Empresarial');
      return;
    }

    setIsSubmitting(true);
    try {
      const newOrg = await createOrganization({
        name: name.trim(),
        legalName: legalName.trim() || undefined,
        contactEmail: contactEmail.trim() || undefined,
        brandIds: selectedBrandIds,
      });

      toast.success(`Holding "${name}" creado exitosamente.`);
      setSelectedOrgId(newOrg.id);
      if (onHoldingCreated) {
        onHoldingCreated(newOrg.id);
      }
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Error al crear el Holding');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 leading-tight">
                Crear Nuevo Holding / Cliente
              </h2>
              <p className="text-xs text-slate-500">
                Agrupa marcas comerciales bajo una organización matriz
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Nombre del Holding / Organización *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Grupo Empresarial Gonzales"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-600 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Razón Social (Opcional)
              </label>
              <input
                type="text"
                value={legalName}
                onChange={(e) => setLegalName(e.target.value)}
                placeholder="Ej. Gonzales Group S.A.C."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Email de Contacto
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="contacto@holding.com"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Asociar Marcas Existentes al Holding
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto p-2 bg-slate-50 rounded-2xl border border-slate-200">
              {brands.map((b) => {
                const isChecked = selectedBrandIds.includes(b.id);
                return (
                  <button
                    type="button"
                    key={b.id}
                    onClick={() => toggleBrand(b.id)}
                    className={`flex items-center gap-2 p-2 rounded-xl text-left border transition-all text-xs font-semibold ${
                      isChecked
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <img
                      src={b.logo}
                      alt={b.name}
                      className="w-5 h-5 rounded-md object-cover shrink-0"
                    />
                    <span className="truncate flex-1">{b.name}</span>
                    {isChecked && <Check className="w-3.5 h-3.5 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xs shadow-md shadow-indigo-500/20 hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>{isSubmitting ? 'Creando...' : 'Crear Holding'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
