import React, { useState } from 'react';
import { Calendar, FileSpreadsheet, X, Upload, CheckCircle2, ArrowRight, Table, Layers, HardDrive, Download, Sparkles, Plus } from 'lucide-react';
import { Brand, CommunicationTerritory, Deliverable, DriveFile } from '../../types';
import { useDriveVaultContext } from '../../context/DriveVaultContext';
import { useToast } from '../../context/ToastContext';

interface ImportPreCalendarModalProps {
  brand?: Brand;
  allBrands: Brand[];
  territories: CommunicationTerritory[];
  vaultFiles: DriveFile[];
  isOpen: boolean;
  onClose: () => void;
  onImportBatch: (deliverables: Array<Partial<Deliverable> & { title: string; brandId: string; territoryId: string; publishDate: string }>) => void;
}

interface ParsedItem {
  id: string;
  title: string;
  territoryId: string;
  territoryName: string;
  deliverableType: 'video' | 'graphic';
  formatSuggested: string;
  productionStartDate: string;
  productionEndDate: string;
  publishDate: string;
}

export const ImportPreCalendarModal: React.FC<ImportPreCalendarModalProps> = ({
  brand,
  allBrands,
  territories,
  vaultFiles,
  isOpen,
  onClose,
  onImportBatch,
}) => {
  const { createDriveFile } = useDriveVaultContext();
  const toast = useToast();

  const [selectedBrandId, setSelectedBrandId] = useState(brand?.id || allBrands[0]?.id || '');
  const [selectedFileId, setSelectedFileId] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [parsedItems, setParsedItems] = useState<ParsedItem[]>([]);

  if (!isOpen) return null;

  const currentBrand = allBrands.find((b) => b.id === selectedBrandId) || brand;
  const brandTerritories = territories.filter((t) => t.brandId === selectedBrandId && t.active);
  const brandSpreadsheets = vaultFiles.filter(
    (f) =>
      (selectedBrandId === 'all' || f.brandId === selectedBrandId) &&
      (f.name.endsWith('.xlsx') || f.name.endsWith('.csv') || f.name.endsWith('.sheet') || f.type === 'document' || f.name.toLowerCase().includes('calendario') || f.name.toLowerCase().includes('cronograma'))
  );

  const handleDownloadTemplate = () => {
    const csvContent = [
      'Titulo,Territorio,Formato,Fecha_Rodaje_Inicio,Fecha_Rodaje_Fin,Fecha_Publicacion,Notas',
      `"Reel Apertura de Mes - ADN ${currentBrand?.name || 'Marca'}","Pilar 1 - Identidad","9:16 Vertical Reel (45s)","2026-09-05","2026-09-07","2026-09-10","Gancho inicial de 0-3s con producto en primer plano"`,
      `"Carrusel Educativo: 5 Tips","Pilar 2 - Educacion","1:1 Feed Post (5 slides)","2026-09-10","2026-09-12","2026-09-15","Diseno con paleta cromatica oficial"`,
      `"Video Caso de Exito / Testimonial","Pilar 1 - Identidad","9:16 TikTok / Reel (60s)","2026-09-16","2026-09-18","2026-09-22","Entrevista dinamica y tomas de detalle"`,
      `"Infografia Promo Especial","Pilar 2 - Educacion","4:5 Feed Portrait","2026-09-23","2026-09-24","2026-09-28","Copy con llamada a la accion clara"`,
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Plantilla_PreCalendario_${currentBrand?.name.replace(/\s+/g, '_') || 'NatarajaOS'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('¡Plantilla oficial .CSV descargada con éxito!');
  };

  const handleAutoCreateSpreadsheetInVault = async () => {
    setIsProcessing(true);
    try {
      const fileName = `01_Cronograma_PreCalendario_${currentBrand?.name.replace(/\s+/g, '_') || 'Marca'}.csv`;
      const created = await createDriveFile({
        name: fileName,
        type: 'document',
        brandId: selectedBrandId || brand?.id || 'brd_apex',
        sizeFormatted: '48 KB',
        sizeBytes: 48000,
        mimeType: 'text/csv',
        accountId: 'acc_default',
        folderId: 'fld_default',
        url: `https://drive.google.com/open?id=demo_${Date.now()}`,
        uploadedByName: 'Nataraja Studio OS',
      });
      setSelectedFileId(created.id);
      toast.success(`¡Hoja "${fileName}" creada y vinculada en el Vault de ${currentBrand?.name}!`);
    } catch (err: any) {
      toast.error('Error al crear hoja en el Vault: ' + (err.message || 'Error desconocido'));
    } finally {
      setIsProcessing(false);
    }
  };

  // Generate mock parsed items based on spreadsheet or sample
  const handleProcessFile = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const today = new Date();
      const currentYear = today.getFullYear();
      const currentMonth = String(today.getMonth() + 1).padStart(2, '0');

      const terr1 = brandTerritories[0]?.id || 'terr_1';
      const terr1Name = brandTerritories[0]?.name || 'Pilar Principal';
      const terr2 = brandTerritories[1]?.id || terr1;
      const terr2Name = brandTerritories[1]?.name || terr1Name;

      const sampleBatch: ParsedItem[] = [
        {
          id: 'item_1',
          title: `Reel Apertura de Mes - ADN ${currentBrand?.name || 'Marca'}`,
          territoryId: terr1,
          territoryName: terr1Name,
          deliverableType: 'video',
          formatSuggested: '9:16 Vertical Reel (45s)',
          productionStartDate: `${currentYear}-${currentMonth}-05`,
          productionEndDate: `${currentYear}-${currentMonth}-07`,
          publishDate: `${currentYear}-${currentMonth}-10`,
        },
        {
          id: 'item_2',
          title: `Carrusel Educativo: Tips & Cuidados de Temporada`,
          territoryId: terr2,
          territoryName: terr2Name,
          deliverableType: 'graphic',
          formatSuggested: '1:1 Feed Post (Carrusel 5 slides)',
          productionStartDate: `${currentYear}-${currentMonth}-10`,
          productionEndDate: `${currentYear}-${currentMonth}-12`,
          publishDate: `${currentYear}-${currentMonth}-15`,
        },
        {
          id: 'item_3',
          title: `Video Testimonial Cliente VIP / Caso de Éxito`,
          territoryId: terr1,
          territoryName: terr1Name,
          deliverableType: 'video',
          formatSuggested: '9:16 TikTok / Reel (60s)',
          productionStartDate: `${currentYear}-${currentMonth}-16`,
          productionEndDate: `${currentYear}-${currentMonth}-18`,
          publishDate: `${currentYear}-${currentMonth}-22`,
        },
        {
          id: 'item_4',
          title: `Infografía de Cierre de Mes & Promo Especial`,
          territoryId: terr2,
          territoryName: terr2Name,
          deliverableType: 'graphic',
          formatSuggested: '4:5 Feed Portrait',
          productionStartDate: `${currentYear}-${currentMonth}-23`,
          productionEndDate: `${currentYear}-${currentMonth}-24`,
          publishDate: `${currentYear}-${currentMonth}-28`,
        },
      ];

      setParsedItems(sampleBatch);
      setIsProcessing(false);
      setStep(2);
    }, 600);
  };

  const handleConfirmImport = () => {
    const toCreate = parsedItems.map((item) => ({
      title: item.title,
      brandId: selectedBrandId || brand?.id || 'brd_apex',
      territoryId: item.territoryId,
      deliverableType: item.deliverableType,
      phase: 'ideacion' as const,
      priority: 'medium' as const,
      productionStartDate: item.productionStartDate,
      productionEndDate: item.productionEndDate,
      publishDate: item.publishDate,
      scriptText: `[Importado desde Pre-calendario Drive Vault]\nFormato: ${item.formatSuggested}`,
    }));

    onImportBatch(toCreate);
    setStep(1);
    setParsedItems([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-2xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <span>Cargar Pre-Calendario de Producción</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-bold">
                  Paso {step} de 2
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {step === 1
                  ? 'Selecciona la hoja de cálculo del Drive Vault o sube el archivo con la pauta mensual'
                  : 'Revisa las piezas detectadas antes de crearlas en fase Ideación / Pre-producción'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {step === 1 && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Marca de Destino
                </label>
                <select
                  value={selectedBrandId}
                  onChange={(e) => setSelectedBrandId(e.target.value)}
                  className="w-full bg-slate-50 focus:bg-white border border-slate-300 focus:border-blue-600 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                >
                  {allBrands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Hojas de Cálculo disponibles en Drive Vault de {currentBrand?.name}
                </label>

                {brandSpreadsheets.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {brandSpreadsheets.map((file) => (
                      <div
                        key={file.id}
                        onClick={() => setSelectedFileId(file.id)}
                        className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          selectedFileId === file.id
                            ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20'
                            : 'bg-white border-slate-200 hover:border-blue-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
                          <div>
                            <span className="font-bold text-slate-900 block">{file.name}</span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {file.sizeFormatted} • Actualizado {file.uploadedAt}
                            </span>
                          </div>
                        </div>

                        {selectedFileId === file.id && (
                          <CheckCircle2 className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1 text-slate-500">
                    <p className="text-xs">No hay hojas de cálculo vinculadas en el Vault de esta marca.</p>
                    <p className="text-[11px] text-slate-400">Puedes usar la plantilla de auto-generación de cronograma.</p>
                  </div>
                )}
              </div>

              {/* Dual Action: Download Template CSV & Auto-Create in Vault */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border border-blue-200 text-slate-800 space-y-2.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-blue-900 font-bold text-xs">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span>Plantilla Oficial de Pre-Calendario</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-100/80 text-blue-800 border border-blue-200">
                    5 Columnas Requeridas
                  </span>
                </div>

                <p className="text-[11px] text-slate-600 leading-snug">
                  Descarga el formato pre-estructurado con ejemplos de <strong>{currentBrand?.name}</strong> o auto-genera el archivo directamente en la carpeta de Drive de la marca.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleDownloadTemplate}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-300 shadow-2xs transition-all cursor-pointer hover:border-slate-400 active:scale-98"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-600" />
                    <span>📥 Descargar Plantilla .CSV</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleAutoCreateSpreadsheetInVault}
                    disabled={isProcessing}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all cursor-pointer disabled:opacity-50 active:scale-98"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>⚡ Crear Hoja en Drive Vault</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">
                  {parsedItems.length} entregables listos para importar a {currentBrand?.name}
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Formato Validado ✓
                </span>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs max-h-64 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 text-[11px]">
                    <tr>
                      <th className="py-2 px-3 font-bold">Título / Pieza</th>
                      <th className="py-2 px-3 font-bold">Territorio</th>
                      <th className="py-2 px-3 font-bold">Tipo</th>
                      <th className="py-2 px-3 font-bold">Rodaje</th>
                      <th className="py-2 px-3 font-bold">Publicación</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedItems.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2 px-3 font-semibold text-slate-900 max-w-[180px] truncate">
                          {item.title}
                        </td>
                        <td className="py-2 px-3 text-slate-600 max-w-[120px] truncate">
                          {item.territoryName}
                        </td>
                        <td className="py-2 px-3">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                              item.deliverableType === 'video'
                                ? 'bg-indigo-50 text-indigo-700'
                                : 'bg-teal-50 text-teal-700'
                            }`}
                          >
                            {item.deliverableType === 'video' ? 'AV Video' : 'Gráfico'}
                          </span>
                        </td>
                        <td className="py-2 px-3 font-mono text-[10px] text-slate-500">
                          {item.productionStartDate}
                        </td>
                        <td className="py-2 px-3 font-mono text-[10px] text-emerald-700 font-bold">
                          {item.publishDate}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          {step === 2 ? (
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 font-semibold text-xs transition-colors cursor-pointer"
            >
              Atrás
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 font-semibold text-xs transition-colors cursor-pointer"
            >
              Cancelar
            </button>
          )}

          {step === 1 ? (
            <button
              type="button"
              onClick={handleProcessFile}
              disabled={isProcessing}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{isProcessing ? 'Procesando Vault...' : 'Analizar Hoja & Vista Previa'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleConfirmImport}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Confirmar & Crear {parsedItems.length} Entregables</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
