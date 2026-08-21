import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Camera,
  Plus,
  DollarSign,
} from 'lucide-react';
import { EquipmentCategory } from '../types';

export const CreateEquipmentModal: React.FC = () => {
  const { isCreateEquipmentModalOpen, setIsCreateEquipmentModalOpen, createEquipment } = useApp();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<EquipmentCategory>('camera');
  const [model, setModel] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [dailyRateUSD, setDailyRateUSD] = useState<number>(120);
  const [specs, setSpecs] = useState('');
  const [image, setImage] = useState('https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=300&auto=format&fit=crop&q=80');

  if (!isCreateEquipmentModalOpen) return null;

  const handleCategoryChange = (cat: EquipmentCategory) => {
    setCategory(cat);
    switch (cat) {
      case 'camera':
        setImage('https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=300&auto=format&fit=crop&q=80');
        break;
      case 'lens':
        setImage('https://images.unsplash.com/photo-1617005082133-548c4dd27f35?w=300&auto=format&fit=crop&q=80');
        break;
      case 'lighting':
        setImage('https://images.unsplash.com/photo-1524863479829-916d8e77f114?w=300&auto=format&fit=crop&q=80');
        break;
      case 'audio':
        setImage('https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=300&auto=format&fit=crop&q=80');
        break;
      case 'mobile_capture':
        setImage('https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=300&auto=format&fit=crop&q=80');
        break;
      case 'editing_station':
        setImage('https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=300&auto=format&fit=crop&q=80');
        break;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !model.trim() || !serialNumber.trim()) {
      alert('Por favor completa los campos obligatorios.');
      return;
    }

    createEquipment({
      name: name.trim(),
      category,
      model: model.trim(),
      serialNumber: serialNumber.trim(),
      status: 'available',
      specs: specs.trim() || 'Especificaciones técnicas de estudio estándar.',
      dailyRateUSD: Number(dailyRateUSD) || 50,
      image: image.trim(),
    });

    setIsCreateEquipmentModalOpen(false);
  };

  return (
    <div
      onClick={() => setIsCreateEquipmentModalOpen(false)}
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col border border-slate-200 text-slate-800 animate-in zoom-in-95"
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 shadow-2xs">
              <Camera className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Registrar Nuevo Equipo de Hardware</h3>
              <p className="text-[11px] text-slate-500">
                Añadir al inventario técnico para reservas y control de colisiones
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCreateEquipmentModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Nombre del Equipo *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Sony FX3 Cinema Line"
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Categoría *
              </label>
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value as EquipmentCategory)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all cursor-pointer"
              >
                <option value="camera">Cámara Principal / B-Cam</option>
                <option value="lens">Óptica / Lente Cinema</option>
                <option value="lighting">Iluminación / Gaffer</option>
                <option value="audio">Microfonía & Sonido Directo</option>
                <option value="mobile_capture">Captura Móvil / Gimbal</option>
                <option value="editing_station">Estación DIT / Edición</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Modelo Específico *
              </label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="Ej: ILME-FX3 (Full Frame 4K)"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Número de Serie / Placa *
              </label>
              <input
                type="text"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                placeholder="SN-FX3-99402"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Tarifa Diaria Estimada (USD) *
              </label>
              <div className="relative">
                <DollarSign className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  value={dailyRateUSD}
                  onChange={(e) => setDailyRateUSD(Number(e.target.value))}
                  min={0}
                  step={5}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-xs text-emerald-700 font-bold font-mono focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Especificaciones Técnicas & Kit
            </label>
            <textarea
              value={specs}
              onChange={(e) => setSpecs(e.target.value)}
              rows={2}
              placeholder="Sensor Full-Frame 12.1MP, 4K 120p 10-bit 4:2:2, S-Cinetone, Dual Base ISO 800/12800..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              URL de Imagen / Thumbnail
            </label>
            <div className="flex items-center gap-3">
              <img
                src={image}
                alt="Preview"
                className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0 shadow-2xs"
              />
              <input
                type="url"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="pt-3.5 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsCreateEquipmentModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer active:scale-98"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 shadow-md shadow-teal-600/20 transition-all cursor-pointer active:scale-98 flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Guardar en Inventario</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
