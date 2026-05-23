'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLocale } from 'next-intl';

const TRANSLATIONS = {
  fr: {
    channels: "Canaux",
    channelsSub: "Comment voulez-vous être prévenu ?",
    reset: "Réinitialiser",
    save: "Enregistrer",
    email: "Email",
    push: "Push",
    sms: "SMS",
    groups: [
      {
        title: 'Maintenance',
        items: [
          { label: 'Alertes prédictives (pneus, freins, vidange)', defaultOn: true },
          { label: 'Rappel contrôle technique', defaultOn: true },
          { label: 'Échéance assurance', defaultOn: true },
        ],
      },
      {
        title: 'Énergie',
        items: [
          { label: 'Hausse de prix sur stations habituelles', defaultOn: true },
          { label: 'Borne disponible à proximité', defaultOn: false },
        ],
      },
      {
        title: 'Marché',
        items: [
          { label: 'Variation indice de revente > 5 %', defaultOn: true },
          { label: 'Récap mensuel coût/km', defaultOn: true },
        ],
      },
      {
        title: 'Promotions partenaires',
        items: [
          { label: 'Offres garages partenaires', defaultOn: false },
          { label: 'Récompenses éco-score', defaultOn: true },
        ],
      },
    ]
  },
  en: {
    channels: "Channels",
    channelsSub: "How do you want to be notified?",
    reset: "Reset",
    save: "Save",
    email: "Email",
    push: "Push",
    sms: "SMS",
    groups: [
      {
        title: 'Maintenance',
        items: [
          { label: 'Predictive alerts (tires, brakes, oil change)', defaultOn: true },
          { label: 'Technical inspection reminder', defaultOn: true },
          { label: 'Insurance expiry', defaultOn: true },
        ],
      },
      {
        title: 'Energy',
        items: [
          { label: 'Price spike at usual stations', defaultOn: true },
          { label: 'Available charging station nearby', defaultOn: false },
        ],
      },
      {
        title: 'Market',
        items: [
          { label: 'Resale value index change > 5%', defaultOn: true },
          { label: 'Monthly cost/km summary', defaultOn: true },
        ],
      },
      {
        title: 'Partner Promotions',
        items: [
          { label: 'Partner garage offers', defaultOn: false },
          { label: 'Eco-score rewards', defaultOn: true },
        ],
      },
    ]
  },
  es: {
    channels: "Canales",
    channelsSub: "¿Cómo quieres ser notificado?",
    reset: "Restablecer",
    save: "Guardar",
    email: "Email",
    push: "Push",
    sms: "SMS",
    groups: [
      {
        title: 'Mantenimiento',
        items: [
          { label: 'Alertas predictivas (neumáticos, frenos, cambio de aceite)', defaultOn: true },
          { label: 'Recordatorio de inspección técnica', defaultOn: true },
          { label: 'Vencimiento del seguro', defaultOn: true },
        ],
      },
      {
        title: 'Energía',
        items: [
          { label: 'Subida de precios en estaciones habituales', defaultOn: true },
          { label: 'Estación de carga disponible cerca', defaultOn: false },
        ],
      },
      {
        title: 'Mercado',
        items: [
          { label: 'Variación de índice de reventa > 5%', defaultOn: true },
          { label: 'Resumen mensual coste/km', defaultOn: true },
        ],
      },
      {
        title: 'Promociones de Socios',
        items: [
          { label: 'Ofertas de talleres asociados', defaultOn: false },
          { label: 'Recompensas de eco-score', defaultOn: true },
        ],
      },
    ]
  },
  ar: {
    channels: "القنوات",
    channelsSub: "كيف ترغب في تلقي الإشعارات؟",
    reset: "إعادة ضبط",
    save: "حفظ",
    email: "بريد إلكتروني",
    push: "إشعارات الهاتف",
    sms: "رسائل قصيرة SMS",
    groups: [
      {
        title: 'الصيانة',
        items: [
          { label: 'التنبيهات التنبؤية (الإطارات، المكابح، تغيير الزيت)', defaultOn: true },
          { label: 'تذكير الفحص الفني للسيارة', defaultOn: true },
          { label: 'انتهاء صلاحية التأمين', defaultOn: true },
        ],
      },
      {
        title: 'الطاقة',
        items: [
          { label: 'ارتفاع الأسعار في المحطات المعتادة', defaultOn: true },
          { label: 'محطة شحن متوفرة في الجوار', defaultOn: false },
        ],
      },
      {
        title: 'السوق',
        items: [
          { label: 'تغير مؤشر قيمة إعادة البيع > 5%', defaultOn: true },
          { label: 'ملخص التكلفة لكل كيلومتر الشهري', defaultOn: true },
        ],
      },
      {
        title: 'العروض الترويجية للشركاء',
        items: [
          { label: 'عروض الورش الشريكة', defaultOn: false },
          { label: 'مكافآت مؤشر القيادة البيئية', defaultOn: true },
        ],
      },
    ]
  },
  pt: {
    channels: "Canais",
    channelsSub: "Como deseja ser notificado?",
    reset: "Redefinir",
    save: "Salvar",
    email: "Email",
    push: "Push",
    sms: "SMS",
    groups: [
      {
        title: 'Manutenção',
        items: [
          { label: 'Alertas preditivos (pneus, freios, troca de óleo)', defaultOn: true },
          { label: 'Lembrete de inspeção técnica', defaultOn: true },
          { label: 'Vencimento do seguro', defaultOn: true },
        ],
      },
      {
        title: 'Energia',
        items: [
          { label: 'Aumento de preço nas estações habituais', defaultOn: true },
          { label: 'Estação de carregamento disponível nas proximidades', defaultOn: false },
        ],
      },
      {
        title: 'Mercado',
        items: [
          { label: 'Variação do índice de revenda > 5%', defaultOn: true },
          { label: 'Resumo mensal custo/km', defaultOn: true },
        ],
      },
      {
        title: 'Promoções de Parceiros',
        items: [
          { label: 'Ofertas de oficinas parceiras', defaultOn: false },
          { label: 'Recompensas de eco-score', defaultOn: true },
        ],
      },
    ]
  }
};

function Toggle({ defaultOn }: { defaultOn?: boolean }) {
  return (
    <label className="relative inline-flex h-6 w-11 cursor-pointer items-center">
      <input type="checkbox" defaultChecked={defaultOn} className="peer sr-only" />
      <span className="absolute inset-0 rounded-pill bg-muted peer-checked:bg-veloce transition-colors" />
      <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform peer-checked:translate-x-5" />
    </label>
  );
}

export default function NotificationsPage() {
  const locale = useLocale();
  const t = TRANSLATIONS[locale as keyof typeof TRANSLATIONS] || TRANSLATIONS.fr;

  const channelsList = [
    { label: t.email, defaultOn: true },
    { label: t.push, defaultOn: true },
    { label: t.sms, defaultOn: false },
  ];

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between text-sm mb-2">
          <div>
            <div className="font-display font-semibold">{t.channels}</div>
            <div className="text-xs text-muted-foreground">
              {t.channelsSub}
            </div>
          </div>
        </div>
        <div className="grid sm:grid-cols-3 gap-3 mt-3">
          {channelsList.map((c) => (
            <label
              key={c.label}
              className="flex items-center justify-between rounded-card border border-border p-4 cursor-pointer"
            >
              <span className="text-sm font-medium">{c.label}</span>
              <Toggle defaultOn={c.defaultOn} />
            </label>
          ))}
        </div>
      </Card>

      {t.groups.map((g) => (
        <Card key={g.title} className="p-6">
          <h2 className="font-display text-sm font-semibold mb-4">{g.title}</h2>
          <ul className="divide-y divide-border">
            {g.items.map((it) => (
              <li key={it.label} className="flex items-center justify-between py-3 text-sm">
                <span>{it.label}</span>
                <Toggle defaultOn={it.defaultOn} />
              </li>
            ))}
          </ul>
        </Card>
      ))}

      <div className="flex justify-end gap-3">
        <Button variant="ghost">{t.reset}</Button>
        <Button>{t.save}</Button>
      </div>
    </div>
  );
}
