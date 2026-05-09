'use client';

import { Camera, Upload, ScanLine } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OcrScannerProps {
  onCapture?: () => void;
  onUpload?: () => void;
  scanning?: boolean;
}

export function OcrScanner({ onCapture, onUpload, scanning }: OcrScannerProps) {
  return (
    <div className="relative aspect-[3/4] max-w-sm mx-auto rounded-card overflow-hidden bg-anthra border border-border">
      {/* Camera viewport placeholder */}
      <div className="absolute inset-0 bg-gradient-to-b from-anthra-500 via-anthra-700 to-anthra-900" />
      <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/40">
        <Camera className="h-20 w-20" strokeWidth={0.75} />
      </div>

      {/* Frame guides */}
      <div className="absolute inset-6 border-2 border-eco/40 rounded-card pointer-events-none">
        <div className="absolute -top-1 -left-1 w-6 h-6 border-t-2 border-l-2 border-eco rounded-tl-card" />
        <div className="absolute -top-1 -right-1 w-6 h-6 border-t-2 border-r-2 border-eco rounded-tr-card" />
        <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-2 border-l-2 border-eco rounded-bl-card" />
        <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-2 border-r-2 border-eco rounded-br-card" />
      </div>

      {/* Laser sweep */}
      {scanning && (
        <div className="absolute inset-6 overflow-hidden rounded-card pointer-events-none">
          <div
            className="absolute inset-x-0 h-1 bg-gradient-to-b from-transparent via-eco to-transparent animate-laser-sweep"
            style={{
              boxShadow: '0 0 20px 4px rgba(46, 204, 113, 0.6)',
            }}
          />
        </div>
      )}

      {/* Status badge */}
      {scanning && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-pill bg-eco/20 border border-eco/30 px-3 py-1.5 text-eco text-xs font-medium backdrop-blur">
          <ScanLine className="h-3.5 w-3.5 animate-pulse" />
          Analyse OCR…
        </div>
      )}

      {/* Actions */}
      <div className="absolute bottom-4 inset-x-4 flex gap-2">
        <Button
          variant="primary"
          className="flex-1"
          size="lg"
          onClick={onCapture}
          disabled={scanning}
        >
          <Camera className="h-4 w-4" /> Capturer
        </Button>
        <Button variant="ghost" size="lg" onClick={onUpload} disabled={scanning} className="bg-white/5 backdrop-blur">
          <Upload className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
