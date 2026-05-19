'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, ShieldCheck, Wrench, Activity, CheckCircle2, XCircle, Loader2, Database, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PhmComponentCardProps {
  name: string;
  status: 'Excellent' | 'Usure modérée' | 'Remplacement imminent';
  confidence: number;
  rulKm: number;
  anomalyFlag: boolean;
  anomalyReason?: string;
  expectedLifetimeKm?: number; // Pour la barre de progression (ex: 30000)
  vehicleId: string; // Required for feedback
  hasRealHistory: boolean; // true = données BDD, false = intervalles OEM
}

export function PhmComponentCard({
  name,
  status,
  confidence,
  rulKm,
  anomalyFlag,
  anomalyReason,
  expectedLifetimeKm = 30000,
  vehicleId,
  hasRealHistory,
}: PhmComponentCardProps) {
  const [feedbackState, setFeedbackState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleFeedback = async (isConfirmed: boolean) => {
    setFeedbackState('loading');
    try {
      const res = await fetch('/api/phm/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleId,
          componentName: name,
          anomalyReason,
          isConfirmed
        })
      });
      if (res.ok) {
        setFeedbackState('success');
      } else {
        setFeedbackState('error');
      }
    } catch (e) {
      setFeedbackState('error');
    }
  };
  
  // Couleurs conditionnelles
  const isCritical = status === 'Remplacement imminent' || anomalyFlag;
  const isWarning = status === 'Usure modérée';
  const isExcellent = status === 'Excellent';

  const statusColorClass = isCritical 
    ? 'text-destructive bg-destructive/15 border-destructive/30' 
    : isWarning 
      ? 'text-amber-500 bg-amber-500/15 border-amber-500/30' 
      : 'text-emerald-500 bg-emerald-500/15 border-emerald-500/30';

  const progressColorClass = isCritical 
    ? 'bg-destructive' 
    : isWarning 
      ? 'bg-amber-500' 
      : 'bg-emerald-500';

  // Calcul pourcentage de vie restante
  const lifePercentage = Math.min(100, Math.max(0, (rulKm / expectedLifetimeKm) * 100));

  return (
    <Card className={`p-5 flex flex-col gap-4 border transition-all duration-300 ${isCritical ? 'border-destructive/50 shadow-[0_0_15px_rgba(239,68,68,0.15)]' : ''}`}>
      
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${statusColorClass.replace('border', '')}`}>
            {isCritical ? <AlertTriangle className="h-5 w-5" /> : isWarning ? <Wrench className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
          </div>
          <div>
            <h3 className="font-display font-semibold text-lg">{name}</h3>
            <span className={`text-sm font-medium ${isCritical ? 'text-destructive' : isWarning ? 'text-amber-500' : 'text-emerald-500'}`}>
              {status}
            </span>
            <span className={`text-[10px] flex items-center gap-1 mt-0.5 ${hasRealHistory ? 'text-veloce' : 'text-muted-foreground'}`}>
              {hasRealHistory ? <><Database className="h-2.5 w-2.5" /> Jumeau Numérique</> : <><BookOpen className="h-2.5 w-2.5" /> Reco. Constructeur</>}
            </span>
          </div>
        </div>
        
        {/* Badge Confiance IA */}
        <Badge variant="outline" className="flex items-center gap-1.5 py-1">
          <Activity className="h-3 w-3 text-veloce" />
          <span className="font-mono">{confidence.toFixed(1)}%</span>
        </Badge>
      </div>

      {/* Anomalie (Si détectée) avec boucle de feedback ML */}
      {anomalyFlag && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex flex-col gap-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
            <p className="text-sm text-destructive font-medium leading-snug">
              {anomalyReason || 'Anomalie télémétrique détectée'}
            </p>
          </div>
          
          {/* Section Feedback RLHF */}
          {feedbackState === 'idle' && (
            <div className="mt-2 border-t border-destructive/10 pt-3">
              <p className="text-xs text-destructive/80 mb-2 font-medium">
                Le garage a-t-il confirmé cette usure ? (Ajuste l'IA)
              </p>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="h-7 text-xs border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => handleFeedback(true)}
                >
                  <CheckCircle2 className="h-3 w-3 mr-1" /> Oui
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="h-7 text-xs border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => handleFeedback(false)}
                >
                  <XCircle className="h-3 w-3 mr-1" /> Non (Faux Positif)
                </Button>
              </div>
            </div>
          )}

          {feedbackState === 'loading' && (
            <div className="mt-2 flex items-center gap-2 text-xs text-destructive/70 border-t border-destructive/10 pt-3">
              <Loader2 className="h-3 w-3 animate-spin" /> Enregistrement...
            </div>
          )}

          {feedbackState === 'success' && (
            <div className="mt-2 flex items-center gap-2 text-xs text-emerald-500 font-medium border-t border-destructive/10 pt-3">
              <CheckCircle2 className="h-3 w-3" /> Merci, le modèle a été ajusté.
            </div>
          )}

          {feedbackState === 'error' && (
            <div className="mt-2 flex items-center gap-2 text-xs text-destructive font-medium border-t border-destructive/10 pt-3">
              Erreur lors de l'enregistrement du feedback.
            </div>
          )}
        </div>
      )}

      {/* Barre de Durée de Vie Restante (RUL) */}
      <div className="mt-2 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Durée de Vie Restante (RUL)</span>
          <span className="font-mono font-bold">{rulKm.toLocaleString('fr-FR')} km</span>
        </div>
        
        {/* Custom Progress Bar with colored indicator */}
        <div className="h-2.5 w-full bg-secondary rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-1000 ease-out ${progressColorClass}`}
            style={{ width: `${lifePercentage}%` }}
          />
        </div>
      </div>

    </Card>
  );
}
