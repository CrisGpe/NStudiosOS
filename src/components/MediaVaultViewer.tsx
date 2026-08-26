import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Film, Music, FileText, ExternalLink, Copy, Check } from 'lucide-react';

export const MediaVaultViewer: React.FC = () => {
  const { activePreviewFile, setActivePreviewFile, brands, driveAccounts } = useApp();
  const [videoSourceType, setVideoSourceType] = useState<'master' | 'proxy' | 'iframe'>('master');
  const [copiedUrl, setCopiedUrl] = useState(false);

  if (!activePreviewFile) return null;

  const file = activePreviewFile;
  const brand = brands.find((b) => b.id === file.brandId);
  const account = driveAccounts.find((a) => a.id === file.accountId);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(file.url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const renderViewerContent = () => {
    // 1. VIDEO VIEWER
    if (file.type === 'video') {
      const activeVideoUrl =
        videoSourceType === 'master'
          ? file.previewUrl || file.proxyUrl || file.url
          : file.proxyUrl || file.previewUrl || file.url;

      return (
        <div className="flex flex-col h-full space-y-3">
          {/* Version Switcher Bar */}
          <div className="flex items-center justify-between bg-slate-50 p-2 rounded-xl border border-slate-200 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 text-[11px] font-semibold">Fuente de Render:</span>
              <button
                onClick={() => setVideoSourceType('master')}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer active:scale-95 ${
                  videoSourceType === 'master'
                    ? 'bg-rose-600 text-white shadow-2xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Master Original 4K (ProRes / High-Bitrate)
              </button>
              {file.proxyUrl && (
                <button
                  onClick={() => setVideoSourceType('proxy')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer active:scale-95 ${
                    videoSourceType === 'proxy'
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Proxy Optimizado 1080p
                </button>
              )}
            </div>

            {file.technicalSpecs && (
              <div className="flex items-center gap-2 font-mono text-[10px] text-slate-500">
                <span className="bg-white px-2 py-0.5 rounded-md border border-slate-200">
                  {file.technicalSpecs.resolution}
                </span>
                <span className="bg-white px-2 py-0.5 rounded-md border border-slate-200">
                  {file.technicalSpecs.frameRate}
                </span>
                <span className="bg-white px-2 py-0.5 rounded-md border border-slate-200">
                  {file.technicalSpecs.codec}
                </span>
              </div>
            )}
          </div>

          {/* Player Container */}
          <div className="relative flex-1 bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center border border-slate-800 min-h-[380px]">
            <video
              key={activeVideoUrl}
              src={activeVideoUrl}
              controls
              autoPlay
              className="w-full h-full max-h-[500px] object-contain rounded-xl"
            />
          </div>
        </div>
      );
    }

    // 2. AUDIO VIEWER
    if (file.type === 'audio') {
      return (
        <div className="flex flex-col justify-center items-center h-full p-8 bg-slate-50 rounded-xl border border-slate-200 space-y-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
            <Music className="w-10 h-10" />
          </div>

          <div className="text-center space-y-1">
            <h3 className="font-bold text-slate-900 text-base">{file.name}</h3>
            <p className="text-xs text-slate-500 font-mono">
              {file.technicalSpecs?.audioSpecs || 'Grabación 32-bit Float 48kHz Stereo'}
            </p>
          </div>

          {/* Simulated Waveform Visualization */}
          <div className="w-full max-w-lg flex items-center justify-center gap-1 h-16 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
            {Array.from({ length: 48 }).map((_, i) => {
              const height = 15 + Math.sin(i * 0.4) * 35 + (i % 5) * 6;
              return (
                <div
                  key={i}
                  className="w-1 bg-indigo-500 hover:bg-rose-500 rounded-full transition-all duration-300"
                  style={{ height: `${Math.max(10, Math.min(50, height))}px` }}
                />
              );
            })}
          </div>

          {/* Native Audio Scrubber */}
          <audio
            src={file.previewUrl || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'}
            controls
            autoPlay
            className="w-full max-w-lg"
          />
        </div>
      );
    }

    // 3. GENERATED DOCUMENT / SHEET VIEWER
    if (file.type === 'document' && file.generatedDocument) {
      const doc = file.generatedDocument;
      return (
        <div className="h-full overflow-y-auto p-6 bg-white text-slate-800 rounded-xl border border-slate-200 space-y-6">
          {/* Document Masthead */}
          <div className="border-b border-slate-100 pb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase">
                  Google Docs Oficial
                </span>
                <span className="text-[10px] font-mono text-slate-500">Versión: {doc.version}</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">{doc.title}</h2>
              <p className="text-xs text-slate-500 mt-0.5">{doc.subtitle}</p>
            </div>

            <a
              href={file.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors cursor-pointer shrink-0 shadow-2xs active:scale-95"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Abrir en Google Docs</span>
            </a>
          </div>

          {/* Document Sections */}
          <div className="space-y-6">
            {doc.sections.map((sec, idx) => (
              <div key={idx} className="space-y-2.5">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-l-2 border-indigo-600 pl-2.5">
                  {sec.title}
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed">{sec.content}</p>

                {/* Optional Table Data */}
                {sec.tableData && (
                  <div className="overflow-x-auto rounded-xl border border-slate-200 mt-2">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                          {sec.tableData.headers.map((h, hIdx) => (
                            <th key={hIdx} className="p-2.5 border-r border-slate-200 last:border-r-0">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {sec.tableData.rows.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-slate-50">
                            {row.map((cell, cIdx) => (
                              <td key={cIdx} className="p-2.5 text-slate-700 border-r border-slate-100 last:border-r-0">
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Footer note */}
          <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Generado automáticamente por el motor Folder-as-Code de N. Studios</span>
            <span className="font-mono">{doc.generatedAt}</span>
          </div>
        </div>
      );
    }

    // 4. GENERIC FILE FALLBACK
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 bg-slate-50 rounded-xl border border-slate-200 space-y-4 text-center">
        <FileText className="w-16 h-16 text-slate-400" />
        <div>
          <h3 className="font-bold text-slate-900 text-sm">{file.name}</h3>
          <p className="text-xs text-slate-500 font-mono mt-1">Formato: {file.mimeType} • {file.sizeFormatted}</p>
        </div>
        <a
          href={file.url}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-2xs active:scale-95"
        >
          <ExternalLink className="w-4 h-4" />
          <span>Ver archivo en Google Drive</span>
        </a>
      </div>
    );
  };

  return (
    <div
      onClick={() => setActivePreviewFile(null)}
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white border border-slate-200 rounded-2xl max-w-6xl w-full shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col animate-in zoom-in-95 text-slate-800"
      >
        {/* Header */}
        <div className="p-3.5 px-5 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-2xs shrink-0">
              {file.type === 'video' ? <Film className="w-4.5 h-4.5" /> : file.type === 'audio' ? <Music className="w-4.5 h-4.5" /> : <FileText className="w-4.5 h-4.5" />}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate">{file.name}</h3>
                {brand && (
                  <span
                    className="text-[9px] font-bold px-1.5 py-0.5 rounded text-white shrink-0 shadow-2xs"
                    style={{ backgroundColor: brand.primaryColor }}
                  >
                    {brand.name}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                <span>{file.sizeFormatted}</span>
                <span>•</span>
                <span>{account?.name || 'Google Drive'}</span>
                <span>•</span>
                <span>Subido por {file.uploadedByName}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition-all active:scale-95"
              title="Copiar enlace de Google Drive"
            >
              {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copiedUrl ? 'Copiado' : 'Link Drive'}</span>
            </button>

            <a
              href={file.url}
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 transition-all cursor-pointer active:scale-95"
              title="Abrir en Google Drive"
            >
              <ExternalLink className="w-4 h-4" />
            </a>

            <button
              onClick={() => setActivePreviewFile(null)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition-all active:scale-95"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body Viewer */}
        <div className="p-4 flex-1 overflow-y-auto flex flex-col">
          {renderViewerContent()}
        </div>
      </div>
    </div>
  );
};
