'use client';

import { useState } from 'react';
import { Sparkles, Check, Gift } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckoutButton } from '@/app/[locale]/(marketing)/pricing/checkout-button';

export function BillingPricingSelector() {
  const [interval, setInterval] = useState<'monthly' | 'yearly'>('monthly');

  return (
    <div className="space-y-6 pt-4">
      <div className="flex flex-col items-center space-y-3">
        <h3 className="font-display text-lg font-semibold text-white">
          Activez votre accès premium sans interruption
        </h3>
        <p className="text-sm text-muted-foreground text-center max-w-lg">
          Sélectionnez la formule la plus adaptée à vos objectifs financiers et de gestion de flotte.
        </p>

        {/* Interval Selector Toggle */}
        <div className="inline-flex p-1 rounded-full bg-[#16161A]/80 border border-white/5 backdrop-blur-md mt-2">
          <button
            onClick={() => setInterval('monthly')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              interval === 'monthly'
                ? 'bg-[#2D2D2D] text-white shadow-sm'
                : 'text-muted-foreground hover:text-white'
            }`}
          >
            Mensuel
          </button>
          <button
            onClick={() => setInterval('yearly')}
            className={`relative px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1 ${
              interval === 'yearly'
                ? 'bg-[#2D2D2D] text-white shadow-sm'
                : 'text-muted-foreground hover:text-white'
            }`}
          >
            Annuel
            <Badge className="bg-emerald-500/10 text-emerald-400 border-none text-[9px] px-1.5 py-0">
              −25%
            </Badge>
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto pt-2">
        {/* Premium Plan Card */}
        <Card className="p-6 border border-[#007AFF]/40 bg-gradient-to-b from-[#007AFF]/10 to-transparent backdrop-blur-md rounded-card flex flex-col justify-between relative shadow-lg">
          <Badge className="bg-[#007AFF] text-white absolute -top-3 left-1/2 -translate-x-1/2 rounded-full border-none shadow-[0_0_10px_rgba(0,122,255,0.4)] px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
            Recommandé
          </Badge>
          <div className="space-y-4">
            <div>
              <h4 className="font-display text-base font-bold text-white">Premium</h4>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Pour les propriétaires individuels passionnés.
              </p>
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="font-mono text-3xl font-bold text-white">
                  {interval === 'yearly' ? '7,50' : '9,99'}
                </span>
                <span className="text-xs text-muted-foreground">€ / mois</span>
              </div>
              <div className="text-[10px] text-emerald-400 mt-0.5">
                {interval === 'yearly' ? 'Facturé 89,99 €/an' : 'Sans engagement'}
              </div>
            </div>
            <ul className="space-y-2 text-xs text-muted-foreground pt-3 border-t border-white/[0.04]">
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-[#007AFF]" />
                Scans OCR illimités (Reçus & PDF)
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-[#007AFF]" />
                Suivi du TCO & Mix énergétique réel
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-[#007AFF]" />
                Carnet d'entretien immuable (RLS)
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-[#007AFF]" />
                Télémétrie & Diagnostics prédictifs
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-[#007AFF]" />
                Nombre de véhicules illimités
              </li>
            </ul>
          </div>
          <div className="pt-6">
            <CheckoutButton
              interval={interval}
              tier="premium"
              label="Essai 30 jours · Commencer"
              className="w-full bg-[#007AFF] text-white hover:bg-[#005bb5] font-semibold text-xs py-5 rounded-full shadow-glow-veloce transition-all"
            />
          </div>
        </Card>

        {/* Family/Pro Plan Card */}
        <Card className="p-6 border border-white/[0.08] bg-[#16161A]/50 backdrop-blur-md rounded-card flex flex-col justify-between shadow-md">
          <div className="space-y-4">
            <div>
              <h4 className="font-display text-base font-bold text-white">Family / Pro</h4>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Pour les flottes familiales et petits parcs d'affaires.
              </p>
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="font-mono text-3xl font-bold text-white">
                  {interval === 'yearly' ? '12,50' : '16,99'}
                </span>
                <span className="text-xs text-muted-foreground">€ / mois</span>
              </div>
              <div className="text-[10px] text-emerald-400 mt-0.5">
                {interval === 'yearly' ? 'Facturé 149,99 €/an' : 'Sans engagement'}
              </div>
            </div>
            <ul className="space-y-2 text-xs text-muted-foreground pt-3 border-t border-white/[0.04]">
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-white" />
                Tout le contenu de la formule Premium
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-white" />
                Multi-comptes simultanés (jusqu'à 5)
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-white" />
                Portail de gestion de flotte simplifié
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-white" />
                Exports fiscaux avancés consolidés
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-white" />
                Support prioritaire sous 2h ouvrées
              </li>
            </ul>
          </div>
          <div className="pt-6">
            <CheckoutButton
              interval={interval}
              tier="family"
              label="Essai 30 jours · Choisir"
              variant="outline"
              className="w-full text-white border-white/10 hover:bg-white/5 font-semibold text-xs py-5 rounded-full transition-all"
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
