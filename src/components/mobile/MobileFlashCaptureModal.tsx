import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles, Link, Camera, FileText, Mic, MicOff, Upload, CheckCircle2, Send } from 'lucide-react';
import { Brand, CommunicationTerritory, MobileCaptureType } from '../../types';

interface MobileFlashCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  brand: Brand;
  territories: CommunicationTerritory[];
  onSaveIdea: (ideaData: {
    title: string;
    notes: string;
    targetTerritoryId?: string;
    formatSuggested: string;
    referenceUrls: string[];
    captureType: MobileCaptureType;
    sourcePlatform: 'tiktok' | 'instagram' | 'pinterest' | 'youtube' | 'facebook' | 'camera' | 'voice' | 'manual';
    attachmentUrl?: string;
    audioDurationSeconds?: number;
  }) => void;
}

export const MobileFlashCaptureModal: React.FC<MobileFlashCaptureModalProps> = ({
  isOpen,
  onClose,
  brand,
  territories,
  onSaveIdea,
}) => {
  const [activeTab, setActiveTab] = useState<MobileCaptureType>('social_link');

  // Form states
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [url, setUrl] = useState('');
  const [territoryId, setTerritoryId] = useState(territories[0]?.id || '');
  const [format, setFormat] = useState('9:16 Vertical Reel (45s)');
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);

  // Voice recording simulation states
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRefs = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  // Cleanup timers on unmount or close
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      timeoutRefs.current.forEach((t) => clearTimeout(t));
      timeoutRefs.current = [];
    };
  }, []);

  if (!isOpen) return null;

  // Detect social platform from URL
  const detectPlatform = (rawUrl: string): 'tiktok' | 'instagram' | 'pinterest' | 'youtube' | 'facebook' | 'manual' => {
    const lower = rawUrl.toLowerCase();
    if (lower.includes('tiktok.com')) return 'tiktok';
    if (lower.includes('instagram.com')) return 'instagram';
    if (lower.includes('pinterest.') || lower.includes('pin.it')) return 'pinterest';
    if (lower.includes('youtube.com') || lower.includes('youtu.be')) return 'youtube';
    if (lower.includes('facebook.com') || lower.includes('fb.watch')) return 'facebook';
    return 'manual';
  };

  const getPlatformInfo = (platform: string) => {
    switch (platform) {
      case 'tiktok':
        return { name: 'TikTok', color: 'bg-black text-white', icon: '🎵' };
      case 'instagram':
        return { name: 'Instagram Reel', color: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white', icon: '📸' };
      case 'pinterest':
        return { name: 'Pinterest Pin', color: 'bg-red-600 text-white', icon: '📌' };
      case 'youtube':
        return { name: 'YouTube Shorts', color: 'bg-red-700 text-white', icon: '▶️' };
      default:
        return { name: 'Enlace Web', color: 'bg-indigo-600 text-white', icon: '🔗' };
    }
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    setRecordSeconds(0);
    setVoiceTranscript('');
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setRecordSeconds((s) => s + 1);
    }, 1000);

    // Simulate real-time speech to text transcription
    const t1 = setTimeout(() => {
      setVoiceTranscript('Idea para campaña de verano: Grabar un plano secuencia dinámico al atardecer...');
    }, 2000);
    const t2 = setTimeout(() => {
      setVoiceTranscript('Idea para campaña de verano: Grabar un plano secuencia dinámico al atardecer con transición rápida de calzado deportivo y remate con el logo de la marca en 9:16.');
      setTitle('Video Dinámico al Atardecer');
      setNotes('Grabación en exterior hora dorada, ritmo ágil con audio de tendencia rítmico y foco en el producto.');
    }, 4500);

    timeoutRefs.current.push(t1, t2);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handlePhotoUploadSimulated = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setAttachmentPreview(reader.result as string);
        if (!title) {
          setTitle(`Foto Referencia: ${file.name.replace(/\.[^/.]+$/, '')}`);
        }
      };
      reader.readAsDataURL(file);
    } else {
      // Fallback simulated photo
      setAttachmentPreview('https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80');
      setTitle('Foto de Referencia en Set');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalTitle = title.trim() || 'Referencia Capturada en Móvil';
    const finalNotes = notes.trim() || voiceTranscript || 'Captura rápida desde la aplicación móvil.';
    const sourcePlatform = activeTab === 'social_link' ? detectPlatform(url) : activeTab === 'camera_photo' ? 'camera' : activeTab === 'voice_memo' ? 'voice' : 'manual';

    onSaveIdea({
      title: finalTitle,
      notes: finalNotes,
      targetTerritoryId: territoryId || undefined,
      formatSuggested: format,
      referenceUrls: url.trim() ? [url.trim()] : [],
      captureType: activeTab,
      sourcePlatform,
      attachmentUrl: attachmentPreview || undefined,
      audioDurationSeconds: activeTab === 'voice_memo' ? recordSeconds : undefined,
    });

    // Reset and close
    setTitle('');
    setNotes('');
    setUrl('');
    setAttachmentPreview(null);
    setVoiceTranscript('');
    onClose();
  };

  const detectedPlatform = url ? detectPlatform(url) : 'manual';
  const platformInfo = getPlatformInfo(detectedPlatform);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in slide-in-from-bottom-6">
        
        {/* Header with Grab Handle */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 relative">
          <div className="w-12 h-1.5 bg-slate-300 rounded-full absolute top-2 left-1/2 -translate-x-1/2 sm:hidden" />
          
          <div className="flex items-center gap-2.5 mt-1 sm:mt-0">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-2xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 leading-tight">
                Captura Flash Móvil
              </h3>
              <p className="text-[11px] text-slate-500">
                Guardando en <strong className="text-slate-800">{brand.name}</strong> • Drive Vault
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4 Mode Tabs */}
        <div className="grid grid-cols-4 p-2 gap-1 bg-slate-100/70 border-b border-slate-200 text-[11px] font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('social_link')}
            className={`py-2 px-1 rounded-xl flex flex-col items-center gap-1 transition-all cursor-pointer ${
              activeTab === 'social_link'
                ? 'bg-white text-indigo-600 shadow-2xs font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Link className="w-4 h-4" />
            <span>Red Social</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('camera_photo')}
            className={`py-2 px-1 rounded-xl flex flex-col items-center gap-1 transition-all cursor-pointer ${
              activeTab === 'camera_photo'
                ? 'bg-white text-indigo-600 shadow-2xs font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Cámara</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('quick_note')}
            className={`py-2 px-1 rounded-xl flex flex-col items-center gap-1 transition-all cursor-pointer ${
              activeTab === 'quick_note'
                ? 'bg-white text-indigo-600 shadow-2xs font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Nota</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('voice_memo')}
            className={`py-2 px-1 rounded-xl flex flex-col items-center gap-1 transition-all cursor-pointer ${
              activeTab === 'voice_memo'
                ? 'bg-white text-indigo-600 shadow-2xs font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Mic className="w-4 h-4" />
            <span>Voz IA</span>
          </button>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 overflow-y-auto flex-1 custom-scrollbar">
          
          {/* TAB 1: SOCIAL LINK CAPTURE */}
          {activeTab === 'social_link' && (
            <div className="space-y-3">
              <div className="bg-indigo-50/60 p-3 rounded-2xl border border-indigo-100 text-xs text-indigo-900 space-y-1">
                <span className="font-bold flex items-center gap-1">
                  <span>📱 Pega el enlace de TikTok, Instagram, Pinterest o Shorts</span>
                </span>
                <p className="text-[11px] text-indigo-700">
                  Detectamos automáticamente la plataforma y la añadimos a la cola de producción.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  URL del Video o Publicación *
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => {
                      setUrl(e.target.value);
                      if (!title && e.target.value) {
                        const plat = detectPlatform(e.target.value);
                        setTitle(`Referencia ${getPlatformInfo(plat).name}`);
                      }
                    }}
                    placeholder="https://www.tiktok.com/@... o https://instagram.com/reel/..."
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 pr-10 text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  />
                  {url && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm">
                      {platformInfo.icon}
                    </span>
                  )}
                </div>
                {url && (
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${platformInfo.color}`}>
                      {platformInfo.icon} {platformInfo.name}
                    </span>
                    <span className="text-[10.5px] text-emerald-700 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Enlace Detectado
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: CAMERA & GALLERY */}
          {activeTab === 'camera_photo' && (
            <div className="space-y-3">
              <div className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-2xl p-4 text-center space-y-2 bg-slate-50 transition-colors">
                {attachmentPreview ? (
                  <div className="relative rounded-xl overflow-hidden shadow-sm max-h-48 flex justify-center bg-black">
                    <img src={attachmentPreview} alt="Preview" className="object-contain max-h-48" />
                    <button
                      type="button"
                      onClick={() => setAttachmentPreview(null)}
                      className="absolute top-2 right-2 bg-black/70 text-white p-1 rounded-full text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-2xs">
                      <Camera className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">Tomar Foto o Subir desde Galería</h4>
                      <p className="text-[11px] text-slate-500">Imágenes PNG, JPG o clips de video cortos</p>
                    </div>
                    <label className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold cursor-pointer shadow-2xs active:scale-95 transition-all">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Abrir Cámara / Galería</span>
                      <input
                        type="file"
                        accept="image/*,video/*"
                        capture="environment"
                        onChange={handlePhotoUploadSimulated}
                        className="hidden"
                      />
                    </label>
                  </>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: QUICK NOTE */}
          {activeTab === 'quick_note' && (
            <div className="space-y-2">
              <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-0.5">
                <span className="font-bold">💡 Anota cualquier idea espontánea</span>
                <p className="text-[11px] text-amber-700">
                  Describe el enfoque, producto, locación o estilo visual.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: VOICE MEMO AI */}
          {activeTab === 'voice_memo' && (
            <div className="space-y-3">
              <div className="bg-purple-50 p-4 rounded-2xl border border-purple-200 text-center space-y-3">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-xs font-bold text-purple-900">Grabadora de Voz con Transcripción IA</span>
                </div>

                <div className="flex flex-col items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={isRecording ? handleStopRecording : handleStartRecording}
                    className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-md cursor-pointer ${
                      isRecording
                        ? 'bg-rose-600 text-white animate-pulse scale-105'
                        : 'bg-purple-600 hover:bg-purple-700 text-white'
                    }`}
                  >
                    {isRecording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
                  </button>

                  <span className="text-xs font-mono font-bold text-slate-700">
                    {isRecording ? `Grabando: 00:0${recordSeconds}s (Habla ahora...)` : 'Toca el micrófono para dictar tu idea'}
                  </span>
                </div>

                {voiceTranscript && (
                  <div className="p-2.5 rounded-xl bg-white border border-purple-200 text-left text-xs space-y-1">
                    <span className="text-[10px] font-bold uppercase text-purple-700 block">Transcripción en tiempo real:</span>
                    <p className="text-slate-800 italic">"{voiceTranscript}"</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Common Fields */}
          <div className="space-y-3 pt-1 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Título de la Idea / Concepto *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: POV en set con luces de neón"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Detalles / Notas para el Equipo
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Describe la atmósfera, producto, llamado a la acción o música..."
                rows={2}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Territorio de Marca
                </label>
                <select
                  value={territoryId}
                  onChange={(e) => setTerritoryId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all cursor-pointer"
                >
                  {territories.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Formato Deseado
                </label>
                <input
                  type="text"
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Footer Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 rounded-2xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
            >
              <Send className="w-4 h-4" />
              <span>Enviar Referencia a N. Studios OS</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
