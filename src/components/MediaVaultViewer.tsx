import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Film, Music, FileText, ExternalLink, Copy, Check, Maximize2, Minimize2, Image, FileSpreadsheet, Presentation, Loader2 } from 'lucide-react';

export function resolveGoogleDriveEmbedUrl(file: { url: string; previewUrl?: string; mimeType?: string; type?: string }): string | null {
  const targetUrl = file.previewUrl || file.url || '';
  if (!targetUrl) return null;

  // 1. Direct preview links already formatted
  if (targetUrl.includes('/preview')) {
    return targetUrl;
  }

  // 2. Google Drive /file/d/{ID}
  const driveFileMatch = targetUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveFileMatch && driveFileMatch[1]) {
    return `https://drive.google.com/file/d/${driveFileMatch[1]}/preview`;
  }

  // 3. Google Docs /document/d/{ID}
  const docsMatch = targetUrl.match(/\/document\/d\/([a-zA-Z0-9_-]+)/);
  if (docsMatch && docsMatch[1]) {
    return `https://docs.google.com/document/d/${docsMatch[1]}/preview`;
  }

  // 4. Google Sheets /spreadsheets/d/{ID}
  const sheetsMatch = targetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
  if (sheetsMatch && sheetsMatch[1]) {
    return `https://docs.google.com/spreadsheets/d/${sheetsMatch[1]}/preview?widget=true&headers=false`;
  }

  // 5. Google Slides /presentation/d/{ID}
  const slidesMatch = targetUrl.match(/\/presentation\/d\/([a-zA-Z0-9_-]+)/);
  if (slidesMatch && slidesMatch[1]) {
    return `https://docs.google.com/presentation/d/${slidesMatch[1]}/preview`;
  }

  // 6. Drive Open ID: open?id={ID} or id={ID}
  const idParamMatch = targetUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idParamMatch && idParamMatch[1]) {
    return `https://drive.google.com/file/d/${idParamMatch[1]}/preview`;
  }

  // 7. Google Drive Folder: /folders/{ID}
  const folderMatch = targetUrl.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  if (folderMatch && folderMatch[1]) {
    return `https://drive.google.com/embeddedfolderview?id=${folderMatch[1]}#grid`;
  }

  // 8. Direct PDF / media URLs
  if (targetUrl.endsWith('.pdf') || file.mimeType === 'application/pdf') {
    return targetUrl;
  }

  return targetUrl;
}

export const MediaVaultViewer: React.FC = () => {
  const { activePreviewFile, setActivePreviewFile, brands, driveAccounts } = useApp();
  const [videoSourceType, setVideoSourceType] = useState<'master' | 'proxy' | 'iframe'>('master');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoadingIframe, setIsLoadingIframe] = useState(true);

  if (!activePreviewFile) return null;

  const file = activePreviewFile;
  const brand = brands.find((b) => b.id === file.brandId);
  const account = driveAccounts.find((a) => a.id === file.accountId);
  const embedUrl = resolveGoogleDriveEmbedUrl(file);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(file.url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const isSheet = file.mimeType?.includes('sheet') || file.mimeType?.includes('csv') || file.name.endsWith('.csv') || file.name.endsWith('.xlsx');
  const isDoc = file.mimeType?.includes('document') || file.name.endsWith('.docx') || file.name.endsWith('.doc');
  const isSlide = file.mimeType?.includes('presentation') || file.name.endsWith('.pptx');
  const isPdf = file.mimeType?.includes('pdf') || file.name.endsWith('.pdf');
  const isImage = file.type === 'image' || file.mimeType?.startsWith('image/') || /\.(png|jpe?g|webp|gif|svg)$/i.test(file.name);

  const renderIcon = () => {
    if (file.type === 'video') return <Film className="w-4.5 h-4.5" />;
    if (file.type === 'audio') return <Music className="w-4.5 h-4.5" />;
    if (isImage) return <Image className="w-4.5 h-4.5" />;
    if (isSheet) return <FileSpreadsheet className="w-4.5 h-4.5 text-emerald-600" />;
    if (isSlide) return <Presentation className="w-4.5 h-4.5 text-amber-600" />;
    return <FileText className="w-4.5 h-4.5 text-indigo-600" />;
  };

  const renderViewerContent = () => {
    // 1. VIDEO VIEWER (Native MP4/WebM or Drive Stream)
    if (file.type === 'video' && videoSourceType !== 'iframe') {
      const activeVideoUrl =
        videoSourceType === 'master'
          ? file.previewUrl || file.proxyUrl || file.url
          : file.proxyUrl || file.previewUrl || file.url;

      const isDirectStreamable = activeVideoUrl.endsWith('.mp4') || activeVideoUrl.endsWith('.webm') || activeVideoUrl.includes('blob:');

      if (isDirectStreamable) {
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
                {embedUrl && (
                  <button
                    onClick={() => setVideoSourceType('iframe')}
                    className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
                  >
                    Visor Google Drive
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
            <div className="relative flex-1 bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center border border-slate-800 min-h-[420px]">
              <video
                key={activeVideoUrl}
                src={activeVideoUrl}
                controls
                autoPlay
                className="w-full h-full max-h-[560px] object-contain rounded-xl"
              />
            </div>
          </div>
        );
      }
    }

    // 2. AUDIO VIEWER
    if (file.type === 'audio') {
      return (
        <div className="flex flex-col justify-center items-center h-full p-8 bg-slate-50 rounded-xl border border-slate-200 space-y-6 min-h-[400px]">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
            <Music className="w-10 h-10" />
          </div>

          <div className="text-center space-y-1">
            <h3 className="font-bold text-slate-900 text-base">{file.name}</h3>
            <p className="text-xs text-slate-500 font-mono">
              {file.technicalSpecs?.audioSpecs || 'Grabación de Audio • 32-bit Float 48kHz Stereo'}
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

          {/* Native Audio Player */}
          <audio
            src={file.previewUrl || file.url || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'}
            controls
            autoPlay
            className="w-full max-w-lg"
          />
        </div>
      );
    }

    // 3. IMAGE VIEWER
    if (isImage) {
      return (
        <div className="relative flex-1 bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center border border-slate-800 min-h-[460px] p-4">
          <img
            src={file.previewUrl || file.url}
            alt={file.name}
            className="w-full h-full max-h-[580px] object-contain rounded-lg shadow-2xl"
          />
        </div>
      );
    }

    // 4. UNIVERSAL EMBEDDED GOOGLE DRIVE / DOCS / SHEETS / PDF VIEWER
    if (embedUrl) {
      return (
        <div className="flex flex-col h-full space-y-2 flex-1 min-h-[540px]">
          {/* Subheader info bar */}
          <div className="flex items-center justify-between bg-slate-50 p-2 px-3 rounded-xl border border-slate-200 text-xs shrink-0">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase font-mono">
                {isPdf ? 'Documento PDF' : isSheet ? 'Hoja de Cálculo' : isSlide ? 'Presentación' : 'Google Drive Preview'}
              </span>
              <span className="text-slate-500 text-[11px] truncate max-w-xs">
                {file.name}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={file.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-2xs"
              >
                <ExternalLink className="w-3 h-3" />
                <span>Abrir en Google Drive</span>
              </a>
            </div>
          </div>

          {/* Embedded Iframe Container */}
          <div className="relative flex-1 w-full bg-slate-900 rounded-xl overflow-hidden border border-slate-200 shadow-inner min-h-[500px] flex flex-col">
            {isLoadingIframe && (
              <div className="absolute inset-0 z-10 bg-slate-900/80 flex flex-col items-center justify-center gap-2 text-slate-300 text-xs">
                <Loader2 className="w-7 h-7 text-indigo-400 animate-spin" />
                <span>Cargando previsualización de Google Drive...</span>
              </div>
            )}
            <iframe
              src={embedUrl}
              title={file.name}
              onLoad={() => setIsLoadingIframe(false)}
              className="w-full flex-1 border-0 rounded-xl bg-white min-h-[500px]"
              allow="autoplay; fullscreen"
              allowFullScreen
            />
          </div>
        </div>
      );
    }

    // 5. GENERIC FALLBACK
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 bg-slate-50 rounded-xl border border-slate-200 space-y-4 text-center min-h-[380px]">
        <FileText className="w-16 h-16 text-slate-400" />
        <div>
          <h3 className="font-bold text-slate-900 text-sm">{file.name}</h3>
          <p className="text-xs text-slate-500 font-mono mt-1">Formato: {file.mimeType || 'Documento'} • {file.sizeFormatted}</p>
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
      className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`bg-white border border-slate-200 rounded-2xl w-full shadow-2xl overflow-hidden my-auto flex flex-col animate-in zoom-in-95 text-slate-800 transition-all ${
          isFullscreen ? 'max-w-[98vw] h-[96vh]' : 'max-w-6xl max-h-[94vh]'
        }`}
      >
        {/* Header */}
        <div className="p-3.5 px-5 border-b border-slate-100 bg-slate-50/90 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-2xs shrink-0">
              {renderIcon()}
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
                <span>{account?.name || 'Google Drive Workspace Vault'}</span>
                <span>•</span>
                <span>{file.mimeType || 'Documento Oficial'}</span>
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
              <span>{copiedUrl ? 'Copiado' : 'Copiar Enlace'}</span>
            </button>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 transition-all cursor-pointer active:scale-95"
              title={isFullscreen ? 'Salir de Pantalla Completa' : 'Pantalla Completa'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
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
        <div className="p-4 flex-1 overflow-y-auto flex flex-col min-h-0">
          {renderViewerContent()}
        </div>
      </div>
    </div>
  );
};
