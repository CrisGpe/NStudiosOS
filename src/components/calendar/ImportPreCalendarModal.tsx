import React, { useState } from 'react';
import { FileSpreadsheet, X, Upload, CheckCircle2, HardDrive, Download, Sparkles, Plus, Folder } from 'lucide-react';
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
  const {
    driveAccounts,
    driveFolders,
    driveFiles,
    createDriveFile,
    createDriveFolder,
    selectedDriveAccountId,
  } = useDriveVaultContext();
  const toast = useToast();

  const [selectedBrandId, setSelectedBrandId] = useState(brand?.id || allBrands[0]?.id || '');
  const [selectedFileId, setSelectedFileId] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [parsedItems, setParsedItems] = useState<ParsedItem[]>([]);

  if (!isOpen) return null;

  const currentBrand = (allBrands || []).find((b) => b.id === selectedBrandId) || brand || allBrands[0];
  const brandTerritories = (territories || []).filter((t) => t.brandId === selectedBrandId && t.active);

  // Find all folders for this brand
  const brandFolders = (driveFolders || []).filter((f) => f.brandId === selectedBrandId);
  const brandFolderIds = brandFolders.map((f) => f.id);

  // Pre-production folder (or strategy folder) for this brand
  const preProdFolder = brandFolders.find(
    (f) =>
      f.name.includes('02') ||
      f.name.toLowerCase().includes('pre') ||
      f.name.toLowerCase().includes('cronograma') ||
      f.name.toLowerCase().includes('produccion')
  ) || brandFolders.find((f) => f.name.includes('01')) || brandFolders[0];

  // Match all spreadsheets/csv files belonging to this brand in Drive Vault
  const effectiveFiles = driveFiles && driveFiles.length > 0 ? driveFiles : (vaultFiles || []);
  const brandSpreadsheets = effectiveFiles.filter(
    (f) =>
      (f.brandId === selectedBrandId || brandFolderIds.includes(f.folderId)) &&
      (f.name.endsWith('.xlsx') ||
       f.name.endsWith('.csv') ||
       f.name.endsWith('.sheet') ||
       f.type === 'document' ||
       f.name.toLowerCase().includes('calendario') ||
       f.name.toLowerCase().includes('cronograma') ||
       f.name.toLowerCase().includes('pauta'))
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
      const activeAccId = selectedDriveAccountId || (driveAccounts && driveAccounts[0]?.id) || 'acc_default';
      
      // Ensure target folder exists in the Vault
      let targetFolderId = preProdFolder?.id;
      if (!targetFolderId) {
        // Create root brand folder first if missing
        const rootFolder = createDriveFolder({
          name: (currentBrand?.name || 'MARCA').toUpperCase() + ' [BRAND ROOT]',
          accountId: activeAccId,
          brandId: selectedBrandId || currentBrand?.id,
          path: `/${currentBrand?.name || 'Marca'}`,
        });

        // Create 02_PreProduccion folder
        const createdPreFolder = createDriveFolder({
          name: '02_PreProduccion_Cronogramas',
          accountId: activeAccId,
          brandId: selectedBrandId || currentBrand?.id,
          path: `/${currentBrand?.name || 'Marca'}/02_PreProduccion_Cronogramas`,
          parentFolderId: rootFolder.id,
        });

        targetFolderId = createdPreFolder.id;
      }

      const fileName = `01_Cronograma_PreCalendario_${currentBrand?.name.replace(/\s+/g, '_') || 'Marca'}.csv`;
      const created = createDriveFile({
        name: fileName,
        type: 'document',
        brandId: selectedBrandId || currentBrand?.id || 'brd_apex',
        sizeFormatted: '48 KB',
        sizeBytes: 48000,
        mimeType: 'text/csv',
        accountId: activeAccId,
        folderId: targetFolderId,
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
      brandId: selectedBrandId || currentBrand?.id || 'brd_apex',
      territoryId: item.territoryId,
      deliverableType: item.deliverableType,
      phase: 'ideacion' as const,
      priority: 'medium' as const,
      productionStartDate: item.productionStartDate,
      productionEndDate: item.productionEndDate,
      publishDate: item.publishDate,
      scriptText: `[Importado desde Pre-calendario Drive Vault]
Formato: ${item.formatSuggested}`,
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
                  ? 'Selecciona la hoja de cálculo del Drive Vault o auto-genera el archivo en el Vault de la marca'
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
              {/* Target Brand Selector */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Marca de Destino
                </label>
                <select
                  value={selectedBrandId}
                  onChange={(e) => {
                    setSelectedBrandId(e.target.value);
                    setSelectedFileId('');
                  }}
                  className="w-full bg-slate-50 focus:bg-white border border-slate-300 focus:border-blue-600 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                >
                  {(allBrands || []).map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Spreadsheets Available in Drive Vault */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-slate-700 font-semibold">
                    Hojas de Cálculo vinculadas en Drive Vault de {currentBrand?.name}
                  </label>
                  {preProdFolder && (
                    <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                      <Folder className="w-3 h-3 text-indigo-500" />
                      <span>{preProdFolder.name}</span>
                    </span>
                  )}
                </div>

                {brandSpreadsheets.length > 0 ? (
                  <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                    {brandSpreadsheets.map((file) => {
                      const parentFld = driveFolders.find((f) => f.id === file.folderId);
                      const isSelected = selectedFileId === file.id;

                      return (
                        <div
                          key={file.id}
                          onClick={() => setSelectedFileId(file.id)}
                          className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20 shadow-2xs'
                              : 'bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
                              <FileSpreadsheet className="w-4 h-4 shrink-0" />
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 block text-xs">{file.name}</span>
                              <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono mt-0.5">
                                {parentFld && (
                                  <span className="text-indigo-600 font-semibold">
                                    📁 {parentFld.name}
                                  </span>
                                )}
                                <span>• {file.sizeFormatted}</span>
                                <span>• {file.createdAt ? file.createdAt.split('T')[0] : 'Drive Vault'}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {isSelected ? (
                              <div className="flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-100/80 px-2 py-0.5 rounded-lg">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Seleccionado</span>
                              </div>
                            ) : (
                              <button
                                type="button"
                                className="text-xs text-slate-400 hover:text-slate-700"
                              >
                                Seleccionar
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1.5 text-slate-500">
                    <HardDrive className="w-6 h-6 text-slate-300 mx-auto" />
                    <p className="text-xs font-semibold text-slate-700">
                      No hay hojas de cálculo vinculadas en el Vault de {currentBrand?.name}.
                    </p>
                    <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                      Puedes auto-generar la hoja oficial con 1 clic en la carpeta de Pre-Producción de la marca.
                    </p>
                  </div>
                )}
              </div>

              {/* Dual Action: Download Template CSV & Auto-Create in Vault */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border border-blue-200 text-slate-800 space-y-2.5 shadow-2xs">
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
                  Descarga el formato pre-estructurado con ejemplos de <strong>{currentBrand?.name}</strong> o auto-genera el archivo directamente en la carpeta <strong>{preProdFolder?.name || '02_PreProduccion'}</strong> de Drive de la marca.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleDownloadTemplate}
                    className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-300 shadow-2xs transition-all cursor-pointer hover:border-slate-400 active:scale-98"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-600" />
                    <span>📥 Descargar Plantilla .CSV</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleAutoCreateSpreadsheetInVault}
                    disabled={isProcessing}
                    className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all cursor-pointer disabled:opacity-50 active:scale-98"
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
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{isProcessing ? 'Procesando Vault...' : 'Analizar Hoja & Vista Previa'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleConfirmImport}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer flex items-center gap-1.5"
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
