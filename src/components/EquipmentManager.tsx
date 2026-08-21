import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Camera,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Plus,
  Search,
  Filter,
  DollarSign,
  Layers,
  XCircle,
  Video,
} from 'lucide-react';
import {
  HardwareEquipment,
  EquipmentCategory,
  EquipmentStatus,
  EquipmentReservation,
} from '../types';

export const EquipmentManager: React.FC = () => {
  const {
    equipment,
    reservations,
    deliverables,
    checkEquipmentCollision,
    createEquipmentReservation,
    cancelEquipmentReservation,
    currentUser,
    brands,
    setIsCreateEquipmentModalOpen,
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [equipmentSearch, setEquipmentSearch] = useState<string>('');

  // Booking Modal State
  const [isBookModalOpen, setIsBookModalOpen] = useState<boolean>(false);
  const [targetEquipment, setTargetEquipment] = useState<HardwareEquipment | null>(null);
  const [selectedDeliverableId, setSelectedDeliverableId] = useState<string>(deliverables[0]?.id || '');
  const [bookStartDate, setBookStartDate] = useState<string>('2026-08-25');
  const [bookEndDate, setBookEndDate] = useState<string>('2026-08-27');
  const [bookNotes, setBookNotes] = useState<string>('');
  const [collisionWarning, setCollisionWarning] = useState<string | null>(null);

  const categories: { id: string; name: string }[] = [
    { id: 'all', name: 'Todas las Categorías' },
    { id: 'camera', name: 'Cámaras Cinema & Mirrorless' },
    { id: 'lens', name: 'Ópticas & Lentes Cine/Prime' },
    { id: 'audio', name: 'Audio 32-bit Float & Boom' },
    { id: 'lighting', name: 'Iluminación LED & RGB' },
    { id: 'mobile_capture', name: 'Captura Móvil & Gimbals' },
    { id: 'editing_station', name: 'Estaciones de Edición & VFX' },
  ];

  const filteredEquipment = equipment.filter((eq) => {
    if (selectedCategory !== 'all' && eq.category !== selectedCategory) return false;
    if (selectedStatus !== 'all' && eq.status !== selectedStatus) return false;
    if (equipmentSearch.trim()) {
      const q = equipmentSearch.toLowerCase();
      const matchName = eq.name.toLowerCase().includes(q);
      const matchModel = eq.model.toLowerCase().includes(q);
      const matchSN = eq.serialNumber.toLowerCase().includes(q);
      const matchSpecs = eq.specs.toLowerCase().includes(q);
      if (!matchName && !matchModel && !matchSN && !matchSpecs) return false;
    }
    return true;
  });

  const getStatusBadge = (status: EquipmentStatus) => {
    switch (status) {
      case 'available':
        return {
          label: 'Disponible',
          className: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        };
      case 'reserved':
        return {
          label: 'Reservado',
          className: 'bg-amber-50 text-amber-800 border-amber-200',
        };
      case 'in_shoot':
        return {
          label: 'En Rodaje Activo',
          className: 'bg-rose-50 text-rose-800 border-rose-200',
        };
      case 'maintenance':
        return {
          label: 'Mantenimiento / Calibración',
          className: 'bg-slate-100 text-slate-700 border-slate-200',
        };
    }
  };

  const openBookingModal = (eq: HardwareEquipment) => {
    setTargetEquipment(eq);
    setBookStartDate('2026-08-25');
    setBookEndDate('2026-08-27');
    setBookNotes('');
    setCollisionWarning(null);
    setIsBookModalOpen(true);
  };

  const handleDateChange = (start: string, end: string) => {
    setBookStartDate(start);
    setBookEndDate(end);
    if (targetEquipment && start && end) {
      const collision = checkEquipmentCollision(targetEquipment.id, start, end);
      if (collision.hasCollision) {
        setCollisionWarning(
          `¡ALERTA DE COLISIÓN! Ya existe una reserva para '${collision.collidingWith?.deliverableTitle}' del ${collision.collidingWith?.startDate} al ${collision.collidingWith?.endDate}.`
        );
      } else {
        setCollisionWarning(null);
      }
    }
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetEquipment) return;

    const chosenDel = deliverables.find((d) => d.id === selectedDeliverableId) || deliverables[0];
    const brand = brands.find((b) => b.id === chosenDel.brandId);

    const res = createEquipmentReservation({
      equipmentId: targetEquipment.id,
      deliverableId: chosenDel.id,
      deliverableTitle: chosenDel.title,
      brandName: brand?.name || 'Marca',
      startDate: bookStartDate,
      endDate: bookEndDate,
      reservedById: currentUser.id,
      reservedByName: currentUser.name,
      notes: bookNotes,
    });

    if (!res.success) {
      alert(res.error);
      return;
    }

    setIsBookModalOpen(false);
  };

  return (
    <div className="space-y-4">
      
      {/* Header & Stats - High Density */}
      <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
            <Camera className="w-4.5 h-4.5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>Inventario Audiovisual & Reservas</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200 font-semibold">
                Detección de Colisiones
              </span>
            </h2>
            <p className="text-[11px] text-slate-500">
              Hardware cinematográfico, ópticas cine, audio 32-bit float, iluminación LED y estaciones VFX.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <div className="bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200 text-center">
            <div className="text-slate-500 text-[9px] uppercase font-bold">Total Equipos</div>
            <div className="text-xs font-bold text-slate-900">{equipment.length}</div>
          </div>
          <div className="bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200 text-center">
            <div className="text-slate-500 text-[9px] uppercase font-bold">En Rodaje / Reservados</div>
            <div className="text-xs font-bold text-amber-700">
              {equipment.filter((e) => e.status !== 'available').length}
            </div>
          </div>
          <div className="bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200 text-center">
            <div className="text-slate-500 text-[9px] uppercase font-bold">Disponibles</div>
            <div className="text-xs font-bold text-emerald-700">
              {equipment.filter((e) => e.status === 'available').length}
            </div>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-2.5 flex flex-wrap items-center justify-between gap-2 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2">
          
          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={equipmentSearch}
              onChange={(e) => setEquipmentSearch(e.target.value)}
              placeholder="Buscar modelo, óptica, serial..."
              className="w-full bg-slate-50 border border-slate-200 rounded-md pl-8 pr-2.5 py-1 text-xs text-slate-800 placeholder:text-slate-400 focus:ring-1 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs text-slate-700 rounded-md px-2.5 py-1 focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs text-slate-700 rounded-md px-2.5 py-1 focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            <option value="all">Todos los Estados</option>
            <option value="available">Disponibles</option>
            <option value="reserved">Reservados</option>
            <option value="in_shoot">En Rodaje</option>
            <option value="maintenance">Mantenimiento</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] text-slate-500 font-mono">
            {filteredEquipment.length} dispositivos
          </span>

          {(currentUser.role === 'webadmin' || currentUser.role === 'director' || currentUser.role === 'colaborador') && (
            <button
              onClick={() => setIsCreateEquipmentModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-2xs cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nuevo Equipo</span>
            </button>
          )}
        </div>
      </div>

      {/* Equipment Cards Grid */}
      {filteredEquipment.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center space-y-3 shadow-2xs">
          <Camera className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-sm text-slate-800">No hay equipos registrados en el inventario</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Registra cámaras cinema, ópticas, micrófonos o gimbals para gestionar reservas y disponibilidad en rodajes.
          </p>
          {(currentUser.role === 'webadmin' || currentUser.role === 'director') && (
            <button
              onClick={() => setIsCreateEquipmentModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-xs cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Primer Equipo</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredEquipment.map((eq) => {
            const statusBadge = getStatusBadge(eq.status);
            const activeBookings = reservations.filter((r) => r.equipmentId === eq.id && r.status === 'confirmed');

            return (
              <div
                key={eq.id}
                className="bg-white border border-slate-200 hover:border-slate-300 rounded-lg overflow-hidden shadow-2xs flex flex-col justify-between group transition-all"
              >
                <div>
                  {/* Equipment Image with Category Overlay */}
                  <div className="relative h-36 bg-slate-100 overflow-hidden border-b border-slate-100">
                    <img
                      src={eq.image}
                      alt={eq.name}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-black/20" />

                    {/* Status Badge */}
                    <div className="absolute top-2 right-2">
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full border shadow-2xs backdrop-blur-xs ${statusBadge.className}`}
                      >
                        {statusBadge.label}
                      </span>
                    </div>

                    {/* Category Tag */}
                    <div className="absolute bottom-2 left-2">
                      <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-900/80 text-white backdrop-blur-xs border border-white/10 uppercase">
                        {eq.category}
                      </span>
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="p-3.5 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-xs text-slate-900 leading-tight">{eq.name}</h4>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">{eq.model}</p>
                      </div>
                      <span className="text-[11px] font-mono font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        ${eq.dailyRateUSD}/d
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                      {eq.specs}
                    </p>

                    {activeBookings.length > 0 && (
                      <div className="space-y-1 pt-1 border-t border-slate-100 text-[10px]">
                        <div className="text-[9px] uppercase font-bold text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>Fechas Bloqueadas:</span>
                        </div>
                        {activeBookings.map((b) => (
                          <div
                            key={b.id}
                            className="flex items-center justify-between bg-slate-50 px-2 py-0.5 rounded border border-slate-200 text-slate-700"
                          >
                            <span className="truncate max-w-[130px] font-medium text-amber-800">
                              {b.deliverableTitle}
                            </span>
                            <span className="font-mono text-slate-500 text-[9px]">
                              {b.startDate} al {b.endDate}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

              {/* Card Footer: Action */}
              <div className="p-3 pt-0">
                <button
                  onClick={() => openBookingModal(eq)}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-md bg-slate-50 hover:bg-amber-50 text-slate-700 hover:text-amber-800 text-xs font-semibold transition-all border border-slate-200 hover:border-amber-300 cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Reservar Hardware / Fechas</span>
                </button>
              </div>
            </div>
          );
        })}
        </div>
      )}

      {/* Modal: Reserva de Hardware con Detección de Colisiones */}
      {isBookModalOpen && targetEquipment && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl max-w-lg w-full p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Reserva de Hardware Audiovisual</h3>
                <p className="text-[11px] text-slate-500">Verificación automática de colisiones en tiempo real.</p>
              </div>
              <button
                onClick={() => setIsBookModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleBookingSubmit} className="space-y-3 text-xs">
              
              {/* Equipment Summary Banner */}
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-center gap-2.5">
                <img
                  src={targetEquipment.image}
                  alt={targetEquipment.name}
                  className="w-10 h-10 rounded-md object-cover ring-1 ring-slate-200"
                />
                <div>
                  <h4 className="font-bold text-slate-900">{targetEquipment.name}</h4>
                  <p className="text-[10px] text-slate-500 font-mono">{targetEquipment.model}</p>
                  <span className="text-[10px] text-amber-700 font-bold font-mono">
                    ${targetEquipment.dailyRateUSD} USD / día de rodaje
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Entregable Asociado al Rodaje *</label>
                <select
                  value={selectedDeliverableId}
                  onChange={(e) => setSelectedDeliverableId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 text-slate-800 text-xs focus:ring-1 focus:ring-blue-500 focus:bg-white cursor-pointer"
                >
                  {deliverables.map((del) => {
                    const brand = brands.find((b) => b.id === del.brandId);
                    return (
                      <option key={del.id} value={del.id}>
                        [{del.code}] {del.title} ({brand?.name})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Fecha Inicio de Rodaje *</label>
                  <input
                    type="date"
                    value={bookStartDate}
                    onChange={(e) => handleDateChange(e.target.value, bookEndDate)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 text-slate-800 text-xs focus:ring-1 focus:ring-blue-500 focus:bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Fecha Fin de Rodaje *</label>
                  <input
                    type="date"
                    value={bookEndDate}
                    onChange={(e) => handleDateChange(bookStartDate, e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 text-slate-800 text-xs focus:ring-1 focus:ring-blue-500 focus:bg-white"
                    required
                  />
                </div>
              </div>

              {/* Collision Alert Banner */}
              {collisionWarning ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 text-red-900 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-xs">COLISIÓN DE RESERVA DETECTADA</span>
                    <span className="text-[11px] leading-tight block mt-0.5">{collisionWarning}</span>
                  </div>
                </div>
              ) : (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2 text-emerald-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-[11px] font-medium">
                    Hardware disponible sin colisiones para el rango seleccionado.
                  </span>
                </div>
              )}

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Notas de Producción & Locación</label>
                <textarea
                  value={bookNotes}
                  onChange={(e) => setBookNotes(e.target.value)}
                  rows={2}
                  placeholder="Ej: Rodaje en exteriores de pista atlética en horario matutino..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 text-slate-800 text-xs focus:ring-1 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsBookModalOpen(false)}
                  className="px-3 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!!collisionWarning}
                  className={`px-4 py-1.5 rounded-md text-white font-semibold shadow-xs cursor-pointer ${
                    collisionWarning
                      ? 'bg-slate-400 cursor-not-allowed opacity-50'
                      : 'bg-amber-600 hover:bg-amber-700'
                  }`}
                >
                  Confirmar Reserva de Hardware
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
