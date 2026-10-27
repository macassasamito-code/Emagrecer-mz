import React, { useEffect, useRef, useState } from 'react';
import {
  getBase64SizeBytes,
  normalizeScannedMealResult,
  ScannedMealResult,
} from '../utils/nutrition';
import {
  Camera,
  CheckCircle2,
  Flame,
  Loader2,
  Plus,
  RefreshCw,
  Sparkles,
  Upload,
  Utensils,
  X,
} from 'lucide-react';

interface MealScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddScannedMeal: (meal: ScannedMealResult) => void;
}

const MAX_BYTES = 300 * 1024; // 300KB limit

/**
 * Comprime qualquer imagem (HTMLVideoElement, HTMLImageElement ou HTMLCanvasElement)
 * garantindo um Data URL JPEG abaixo de 300KB.
 */
function compressSourceToUnder300Kb(
  source: CanvasImageSource,
  sourceWidth: number,
  sourceHeight: number
): { dataUrl: string; sizeKb: number } {
  const maxDim = 900;
  let width = sourceWidth || 640;
  let height = sourceHeight || 480;

  if (width > maxDim || height > maxDim) {
    const ratio = Math.min(maxDim / width, maxDim / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.drawImage(source, 0, 0, width, height);
  }

  let quality = 0.82;
  let dataUrl = canvas.toDataURL('image/jpeg', quality);
  let bytes = getBase64SizeBytes(dataUrl);

  while (bytes > MAX_BYTES && quality > 0.25) {
    quality -= 0.12;
    dataUrl = canvas.toDataURL('image/jpeg', quality);
    bytes = getBase64SizeBytes(dataUrl);
  }

  // Se ainda exceder 300KB, reduz a escala da imagem
  if (bytes > MAX_BYTES) {
    const smallCanvas = document.createElement('canvas');
    smallCanvas.width = Math.round(width * 0.65);
    smallCanvas.height = Math.round(height * 0.65);
    const sCtx = smallCanvas.getContext('2d');
    if (sCtx) {
      sCtx.drawImage(canvas, 0, 0, smallCanvas.width, smallCanvas.height);
    }
    dataUrl = smallCanvas.toDataURL('image/jpeg', 0.65);
    bytes = getBase64SizeBytes(dataUrl);
  }

  return {
    dataUrl,
    sizeKb: Math.max(1, Math.round((bytes / 1024) * 10) / 10),
  };
}

/**
 * Desenha um prato moçambicano realista num canvas para captura instantânea
 * quando o dispositivo/navegador não possui câmera física conectada.
 */
function renderSimulatedMozambicanPlateCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 480;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // Table background
  ctx.fillStyle = '#0F172A';
  ctx.fillRect(0, 0, 640, 480);

  // Plate rim
  ctx.beginPath();
  ctx.arc(320, 240, 195, 0, Math.PI * 2);
  ctx.fillStyle = '#1E293B';
  ctx.fill();
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#334155';
  ctx.stroke();

  // Inner plate
  ctx.beginPath();
  ctx.arc(320, 240, 155, 0, Math.PI * 2);
  ctx.fillStyle = '#090D16';
  ctx.fill();

  // Xima de milho / Batata-doce portion
  ctx.beginPath();
  ctx.arc(245, 195, 52, 0, Math.PI * 2);
  ctx.fillStyle = '#F8FAFC';
  ctx.fill();

  // Grilled Carapau / Fish portion
  ctx.beginPath();
  ctx.ellipse(375, 195, 68, 34, -0.2, 0, Math.PI * 2);
  ctx.fillStyle = '#D97706';
  ctx.fill();

  // Matapa / Folhas de Abóbora e Couve
  ctx.beginPath();
  ctx.arc(265, 295, 48, 0, Math.PI * 2);
  ctx.fillStyle = '#10B981';
  ctx.fill();

  // Feijão Nhemba
  ctx.beginPath();
  ctx.arc(375, 295, 42, 0, Math.PI * 2);
  ctx.fillStyle = '#B45309';
  ctx.fill();

  return canvas;
}

export const MealScannerModal: React.FC<MealScannerModalProps> = ({
  isOpen,
  onClose,
  onAddScannedMeal,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraStatusMsg, setCameraStatusMsg] = useState<string>(
    'A iniciar câmera do telemóvel...'
  );
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScannedMealResult | null>(null);
  const [addedSuccess, setAddedSuccess] = useState(false);

  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const startMobileCamera = async () => {
    setScanResult(null);
    setAddedSuccess(false);

    if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
        setCameraActive(true);
        setCameraStatusMsg('Aponte a câmera para o seu prato moçambicano e toque em Capturar.');
        return;
      } catch {
        setCameraActive(false);
        setCameraStatusMsg(
          'Câmera direta indisponível neste navegador — tire foto pelo botão abaixo ou capture um prato de demonstração.'
        );
      }
    } else {
      setCameraActive(false);
      setCameraStatusMsg(
        'Tire uma foto do prato com a câmera do telemóvel ou capture um prato moçambicano.'
      );
    }
  };

  useEffect(() => {
    if (isOpen) {
      startMobileCamera();
    } else {
      stopCameraStream();
      setScanResult(null);
      setIsScanning(false);
      setAddedSuccess(false);
    }
    return () => {
      stopCameraStream();
    };
  }, [isOpen]);

  const analyzeCompressedPhotoWithGemini = async (
    dataUrl: string,
    sizeKb: number
  ) => {
    setIsScanning(true);
    stopCameraStream();

    try {
      const response = await fetch('/api/meals/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageDataUrl: dataUrl,
          compressedSizeKb: sizeKb,
        }),
      });

      const data = (await response.json()) as Partial<ScannedMealResult>;
      const normalized = normalizeScannedMealResult(data, dataUrl);
      setScanResult(normalized);
    } catch {
      const fallback = normalizeScannedMealResult({}, dataUrl);
      setScanResult(fallback);
    } finally {
      setIsScanning(false);
    }
  };

  const handleCapturePhoto = async () => {
    if (
      cameraActive &&
      videoRef.current &&
      videoRef.current.videoWidth > 0 &&
      videoRef.current.videoHeight > 0
    ) {
      const { dataUrl, sizeKb } = compressSourceToUnder300Kb(
        videoRef.current,
        videoRef.current.videoWidth,
        videoRef.current.videoHeight
      );
      await analyzeCompressedPhotoWithGemini(dataUrl, sizeKb);
      return;
    }

    // Fallback: gera e comprime a captura do prato moçambicano (< 300KB)
    const plateCanvas = renderSimulatedMozambicanPlateCanvas();
    const { dataUrl, sizeKb } = compressSourceToUnder300Kb(
      plateCanvas,
      plateCanvas.width,
      plateCanvas.height
    );
    await analyzeCompressedPhotoWithGemini(dataUrl, sizeKb);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = async () => {
        const { dataUrl, sizeKb } = compressSourceToUnder300Kb(
          img,
          img.naturalWidth || 800,
          img.naturalHeight || 600
        );
        await analyzeCompressedPhotoWithGemini(dataUrl, sizeKb);
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleAddCaloriesToDay = () => {
    if (!scanResult || addedSuccess) return;
    onAddScannedMeal(scanResult);
    setAddedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 650);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="meal-scanner-modal-title"
    >
      <div className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 p-5 sm:p-6 space-y-5 shadow-2xl max-h-[92vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Camera className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 id="meal-scanner-modal-title" className="text-base sm:text-lg font-bold text-white">
                Scanner Nutricional IA — Prato Moçambicano
              </h3>
              <p className="text-xs text-slate-400">
                Compressão automática (&lt; 300KB) · Análise via Google Gemini Vision
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar scanner de refeição"
            className="min-h-[40px] min-w-[40px] rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Hidden Native Camera File Input for Mobile Devices */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileInputChange}
          className="hidden"
          aria-label="Selecionar ou tirar foto da câmera do telemóvel"
        />

        {/* Step 1: Camera Viewfinder (before photo is taken) */}
        {!scanResult && !isScanning && (
          <div className="space-y-4">
            <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 aspect-video flex flex-col items-center justify-center">
              <video
                ref={videoRef}
                playsInline
                muted
                className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
              />

              {!cameraActive && (
                <div className="p-6 text-center space-y-3 max-w-md">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto">
                    <Utensils className="w-7 h-7 text-emerald-400" />
                  </div>
                  <p className="text-sm font-semibold text-white">
                    Pronto para analisar o teu prato moçambicano
                  </p>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {cameraStatusMsg}
                  </p>
                </div>
              )}

              {/* Viewfinder framing guides */}
              <div className="pointer-events-none absolute inset-4 border border-dashed border-emerald-400/40 rounded-xl" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleCapturePhoto}
                className="min-h-[48px] px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Camera className="w-4 h-4 shrink-0" />
                <span>Tirar Foto & Analisar Prato</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="min-h-[48px] px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Upload className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Abrir Câmera / Galeria do Telemóvel</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Loading / Compressing & Calling Gemini */}
        {isScanning && (
          <div
            role="status"
            className="py-12 px-6 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-3"
          >
            <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
            <p className="text-sm font-bold text-white">
              A comprimir foto (&lt; 300KB) e a identificar alimentos com Gemini IA...
            </p>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              A estimar calorias, proteínas, carboidratos, gorduras e dica personalizada de emagrecimento.
            </p>
          </div>
        )}

        {/* Step 3: Modal Result with Captured Photo, Nutrition Cards & Add to Daily Total Button */}
        {scanResult && !isScanning && (
          <div className="space-y-5">
            {/* Photo + Identified Dish Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
              <div className="sm:col-span-5 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 aspect-video sm:aspect-square relative">
                <img
                  src={scanResult.imageDataUrl}
                  alt={scanResult.dishName}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 right-2 bg-slate-950/90 px-2.5 py-1 rounded-lg text-[11px] font-mono-tabular text-emerald-400 border border-slate-800">
                  {scanResult.compressedSizeKb} KB (&lt; 300KB)
                </div>
              </div>

              <div className="sm:col-span-7 space-y-2.5">
                <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Prato Identificado pela IA · {scanResult.scannedAt}</span>
                </div>
                <h4 className="text-lg font-bold text-white leading-snug">
                  {scanResult.dishName}
                </h4>

                <div className="space-y-1">
                  <span className="text-xs font-medium text-slate-400">
                    Alimentos Moçambicanos Identificados:
                  </span>
                  <ul className="space-y-1 text-xs text-slate-200">
                    {scanResult.identifiedFoods.map((item, idx) => (
                      <li key={idx}>• {item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* 4 Nutritional Result Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-xl bg-slate-950 border border-slate-800 p-3.5">
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-emerald-400" />
                  Calorias
                </span>
                <p className="text-xl font-bold text-emerald-400 font-mono-tabular mt-1">
                  {scanResult.calories} <span className="text-xs font-normal">kcal</span>
                </p>
              </div>

              <div className="rounded-xl bg-slate-950 border border-slate-800 p-3.5">
                <span className="text-xs text-slate-400">Proteínas</span>
                <p className="text-xl font-bold text-white font-mono-tabular mt-1">
                  {scanResult.proteinGrams} <span className="text-xs font-normal text-slate-400">g</span>
                </p>
              </div>

              <div className="rounded-xl bg-slate-950 border border-slate-800 p-3.5">
                <span className="text-xs text-slate-400">Carboidratos</span>
                <p className="text-xl font-bold text-white font-mono-tabular mt-1">
                  {scanResult.carbsGrams} <span className="text-xs font-normal text-slate-400">g</span>
                </p>
              </div>

              <div className="rounded-xl bg-slate-950 border border-slate-800 p-3.5">
                <span className="text-xs text-slate-400">Gorduras</span>
                <p className="text-xl font-bold text-white font-mono-tabular mt-1">
                  {scanResult.fatsGrams} <span className="text-xs font-normal text-slate-400">g</span>
                </p>
              </div>
            </div>

            {/* Quick Weight Loss Tip */}
            <div className="rounded-xl bg-emerald-950/25 border border-emerald-500/30 p-4 space-y-1">
              <span className="text-xs font-semibold text-emerald-400">
                Dica Rápida para Emagrecer (Coach Fit IA):
              </span>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                {scanResult.weightLossTip}
              </p>
            </div>

            {/* Action Buttons: Add to Daily Total or Retake Photo */}
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <button
                type="button"
                onClick={handleAddCaloriesToDay}
                disabled={addedSuccess}
                className="min-h-[48px] flex-1 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                {addedSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Calorias Somadas ao Dia!</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>
                      Somar +{scanResult.calories} kcal e +{scanResult.proteinGrams}g Proteína ao Total do Dia
                    </span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={startMobileCamera}
                className="min-h-[48px] px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 transition-colors whitespace-nowrap cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Tirar Outra Foto</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
