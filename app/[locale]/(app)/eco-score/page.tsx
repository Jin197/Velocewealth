'use client';

import { Award, Lock, TrendingUp } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { PageHeader, Section } from '@/components/domain/page-header';
import { EcoRing } from '@/components/domain/eco-ring';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useLocale } from 'next-intl';

const TRANSLATIONS = {
  fr: {
    title: 'Éco-score',
    description: 'Mesurez votre impact, gagnez des badges, débloquez des réductions partenaires',
    deltaText: '+4 ce mois-ci',
    deltaSubtext: 'Excellent ! Continuez sur cette voie pour débloquer 15 % de réduction chez nos garages partenaires.',
    evolutionTitle: 'Évolution sur 6 mois',
    badgesTitle: 'Badges',
    badgesDesc: 'Débloquez des récompenses en améliorant votre score',
    badgeAcquired: 'Acquis',
    promoTitle: 'Réductions débloquées',
    promoDesc: 'Avec un score ≥ 80, vous bénéficiez de tarifs préférentiels chez Garage du Centre, AutoCare Premium et 12 autres partenaires.',
    promoValue: '−15 %',
    months: ['Déc', 'Jan', 'Fév', 'Mar', 'Avr', 'Mai'],
    badges: [
      { id: 'b1', label: 'Conducteur souple', description: '0 freinage brusque sur 30 jours', earned: true },
      { id: 'b2', label: 'Pied léger', description: 'Vitesse moyenne < 110 km/h', earned: true },
      { id: 'b3', label: 'Économe', description: '−15 % de consommation vs moyenne', earned: true },
      { id: 'b4', label: 'Multi-énergies', description: 'Mix thermique + électrique optimisé', earned: false },
      { id: 'b5', label: 'Régénération pro', description: '> 30 % énergie récupérée au freinage', earned: false },
      { id: 'b6', label: 'Éco-Champion', description: 'Score ≥ 90 pendant 3 mois', earned: false },
    ]
  },
  en: {
    title: 'Eco-score',
    description: 'Measure your impact, earn badges, unlock partner discounts',
    deltaText: '+4 this month',
    deltaSubtext: 'Excellent! Keep it up to unlock a 15% discount at our partner garages.',
    evolutionTitle: '6-Month Evolution',
    badgesTitle: 'Badges',
    badgesDesc: 'Unlock rewards by improving your score',
    badgeAcquired: 'Earned',
    promoTitle: 'Unlocked Discounts',
    promoDesc: 'With a score of ≥ 80, you enjoy preferred rates at Garage du Centre, AutoCare Premium, and 12 other partners.',
    promoValue: '-15%',
    months: ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'],
    badges: [
      { id: 'b1', label: 'Smooth Driver', description: '0 harsh braking events over 30 days', earned: true },
      { id: 'b2', label: 'Light Foot', description: 'Average speed < 110 km/h', earned: true },
      { id: 'b3', label: 'Eco-saver', description: '-15% fuel consumption vs average', earned: true },
      { id: 'b4', label: 'Multi-energy', description: 'Optimized thermal + electric hybrid mix', earned: false },
      { id: 'b5', label: 'Regen Pro', description: '> 30% energy recovered from braking', earned: false },
      { id: 'b6', label: 'Eco Champion', description: 'Score ≥ 90 for 3 months', earned: false },
    ]
  },
  es: {
    title: 'Eco-score',
    description: 'Mide tu impacto, gana insignias, desbloquea descuentos con socios',
    deltaText: '+4 este mes',
    deltaSubtext: '¡Excelente! Sigue así para desbloquear un 15% de descuento en nuestros talleres asociados.',
    evolutionTitle: 'Evolución de 6 meses',
    badgesTitle: 'Insignias',
    badgesDesc: 'Desbloquea recompensas mejorando tu puntuación',
    badgeAcquired: 'Ganado',
    promoTitle: 'Descuentos Desbloqueados',
    promoDesc: 'Con una puntuación ≥ 80, disfrutas de tarifas preferenciales en Garage du Centre, AutoCare Premium y otros 12 socios.',
    promoValue: '-15%',
    months: ['Dic', 'Ene', 'Feb', 'Mar', 'Abr', 'May'],
    badges: [
      { id: 'b1', label: 'Conductor Suave', description: '0 frenazos bruscos en 30 días', earned: true },
      { id: 'b2', label: 'Pie Ligero', description: 'Velocidad media < 110 km/h', earned: true },
      { id: 'b3', label: 'Económico', description: '-15% de consumo vs la media', earned: true },
      { id: 'b4', label: 'Multi-energías', description: 'Mix térmico + eléctrico optimizado', earned: false },
      { id: 'b5', label: 'Regeneración Pro', description: '> 30% energía recuperada al frenar', earned: false },
      { id: 'b6', label: 'Eco Campeón', description: 'Puntuación ≥ 90 durante 3 meses', earned: false },
    ]
  },
  ar: {
    title: 'مؤشر القيادة البيئية',
    description: 'قس تأثيرك، واكسب شارات، وافتح خصومات مع شركائنا',
    deltaText: '+4 هذا الشهر',
    deltaSubtext: 'ممتاز! استمر في هذا الطريق للحصول على خصم 15% لدى الورش الشريكة.',
    evolutionTitle: 'تطور الأداء خلال 6 أشهر',
    badgesTitle: 'الشارات',
    badgesDesc: 'افتح مكافآت من خلال تحسين درجاتك',
    badgeAcquired: 'مكتسب',
    promoTitle: 'الخصومات المفتوحة',
    promoDesc: 'بدرجة ≥ 80، تستفيد من أسعار تفضيلية لدى Garage du Centre و AutoCare Premium و 12 شريكًا آخر.',
    promoValue: '-15%',
    months: ['ديسمبر', 'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو'],
    badges: [
      { id: 'b1', label: 'سائق سلس', description: '0 كبح مفاجئ خلال 30 يومًا', earned: true },
      { id: 'b2', label: 'قدم خفيفة', description: 'متوسط السرعة < 110 كم/ساعة', earned: true },
      { id: 'b3', label: 'موفر الطاقة', description: '−15% استهلاك مقارنة بالمتوسط', earned: true },
      { id: 'b4', label: 'طاقة متعددة', description: 'مزيج هجين حراري + كهربائي محسن', earned: false },
      { id: 'b5', label: 'محترف التجديد', description: '> 30% طاقة مسترجعة عند الكبح', earned: false },
      { id: 'b6', label: 'بطل البيئة', description: 'درجة ≥ 90 لمدة أشهر', earned: false },
    ]
  },
  pt: {
    title: 'Eco-score',
    description: 'Meça seu impacto, ganhe insígnias, desbloqueie descontos com parceiros',
    deltaText: '+4 este mês',
    deltaSubtext: 'Excelente! Continue assim para desbloquear 15% de desconto nas nossas oficinas parceiras.',
    evolutionTitle: 'Evolução em 6 meses',
    badgesTitle: 'Insígnias',
    badgesDesc: 'Desbloqueie recompensas melhorando sua pontuação',
    badgeAcquired: 'Ganho',
    promoTitle: 'Descontos Desbloqueados',
    promoDesc: 'Com uma pontuação ≥ 80, você tem tarifas preferenciais na Garage du Centre, AutoCare Premium e outros 12 parceiros.',
    promoValue: '-15%',
    months: ['Dez', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai'],
    badges: [
      { id: 'b1', label: 'Motorista Suave', description: '0 frenagens bruscas em 30 dias', earned: true },
      { id: 'b2', label: 'Pé Leve', description: 'Velocidade média < 110 km/h', earned: true },
      { id: 'b3', label: 'Econômico', description: '-15% de consumo vs a média', earned: true },
      { id: 'b4', label: 'Multi-energias', description: 'Mix térmico + elétrico otimizado', earned: false },
      { id: 'b5', label: 'Regeneração Pro', description: '> 30% de energia recuperada na frenagem', earned: false },
      { id: 'b6', label: 'Eco Campeão', description: 'Pontuação ≥ 90 por 3 meses', earned: false },
    ]
  }
};

export default function EcoScorePage() {
  const locale = useLocale();
  const t = TRANSLATIONS[locale as keyof typeof TRANSLATIONS] || TRANSLATIONS.fr;

  const monthlyData = [
    { month: t.months[0], score: 71 },
    { month: t.months[1], score: 74 },
    { month: t.months[2], score: 76 },
    { month: t.months[3], score: 78 },
    { month: t.months[4], score: 78 },
    { month: t.months[5], score: 82 },
  ];

  return (
    <div className="container py-6 lg:py-8 space-y-6">
      <PageHeader
        title={t.title}
        description={t.description}
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <Card variant="premium" className="p-8 flex flex-col items-center justify-center text-center">
          <EcoRing score={82} />
          <div className="flex items-center gap-1.5 mt-4 text-eco text-sm font-medium">
            <TrendingUp className="h-4 w-4" strokeWidth={2} />{t.deltaText}
          </div>
          <p className="text-xs text-muted-foreground mt-2 max-w-xs">
            {t.deltaSubtext}
          </p>
        </Card>

        <Card className="lg:col-span-2 p-6">
          <h2 className="font-display text-base font-semibold mb-4">
            {t.evolutionTitle}
          </h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
                <XAxis
                  dataKey="month"
                  stroke="currentColor"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  className="text-muted-foreground"
                />
                <YAxis
                  domain={[60, 100]}
                  stroke="currentColor"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  className="text-muted-foreground"
                />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#2ECC71"
                  strokeWidth={3}
                  dot={{ fill: '#2ECC71', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Section
        title={t.badgesTitle}
        description={t.badgesDesc}
      >
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {t.badges.map((b) => (
            <Card
              key={b.id}
              variant={b.earned ? 'glass' : 'default'}
              className={cn(
                'p-4 flex items-center gap-3',
                !b.earned && 'opacity-60',
              )}
            >
              <div
                className={cn(
                  'rounded-btn h-12 w-12 flex items-center justify-center shrink-0',
                  b.earned
                    ? 'bg-gradient-eco text-white'
                    : 'bg-muted text-muted-foreground',
                )}
              >
                {b.earned ? (
                  <Award className="h-6 w-6" strokeWidth={2} />
                ) : (
                  <Lock className="h-5 w-5" strokeWidth={1.5} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-display font-semibold text-sm">
                    {b.label}
                  </span>
                  {b.earned && (
                    <Badge variant="success" className="text-[10px] px-1.5 py-0">
                      {t.badgeAcquired}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {b.description}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      <Card variant="premium" className="p-6 flex items-center justify-between gap-4">
        <div>
          <div className="font-display font-semibold">
            {t.promoTitle}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {t.promoDesc}
          </p>
        </div>
        <Badge variant="success">{t.promoValue}</Badge>
      </Card>
    </div>
  );
}
