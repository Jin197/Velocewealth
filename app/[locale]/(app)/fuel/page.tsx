import { Link } from '@/lib/i18n/routing';
import { Plus, ScanLine, Fuel as FuelIcon } from 'lucide-react';
import { PageHeader, Section } from '@/components/domain/page-header';
import { FuelEntryRow } from '@/components/domain/fuel-entry-row';
import { KpiCard } from '@/components/domain/kpi-card';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getFuelEntries, getProfile } from '@/lib/data';
import { isSupabaseConfigured } from '@/lib/env';
import { formatCurrency } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const TRANSLATIONS = {
  fr: {
    title: "Énergie",
    desc: "Tickets carburant et factures de recharge",
    noExpense: "Aucune dépense énergie",
    noExpenseDesc: "Scannez un ticket ou saisissez une recharge pour démarrer le suivi de votre coût au kilomètre.",
    scanTicket: "Scanner un ticket",
    manualEntry: "Saisie manuelle",
    scan: "Scanner",
    totalSpent: "Total dépensé",
    thermalFills: "Pleins thermiques",
    electricCharges: "Recharges électriques",
    elecSavings: "Économie élec.",
    entriesCount: (count: number) => `${count} entrée${count > 1 ? 's' : ''}`,
    dateFormat: 'fr-FR'
  },
  en: {
    title: "Energy",
    desc: "Fuel receipts and charging invoices",
    noExpense: "No energy expenses yet",
    noExpenseDesc: "Scan a receipt or enter a charge to start tracking your cost per kilometer.",
    scanTicket: "Scan a receipt",
    manualEntry: "Manual entry",
    scan: "Scan",
    totalSpent: "Total spent",
    thermalFills: "Thermal fills",
    electricCharges: "Electric charges",
    elecSavings: "Elec. savings",
    entriesCount: (count: number) => `${count} entr${count > 1 ? 'ies' : 'y'}`,
    dateFormat: 'en-US'
  },
  es: {
    title: "Energía",
    desc: "Recibos de combustible y facturas de carga",
    noExpense: "Ningún gasto de energía",
    noExpenseDesc: "Escanea un recibo o introduce una carga para empezar a realizar el seguimiento del coste por kilómetro.",
    scanTicket: "Escanear un recibo",
    manualEntry: "Entrada manual",
    scan: "Escanear",
    totalSpent: "Total gastado",
    thermalFills: "Llenados térmicos",
    electricCharges: "Cargas eléctricas",
    elecSavings: "Ahorro eléc.",
    entriesCount: (count: number) => `${count} entrad${count > 1 ? 'as' : 'a'}`,
    dateFormat: 'es-ES'
  },
  ar: {
    title: "الطاقة",
    desc: "إيصالات الوقود وفواتير الشحن",
    noExpense: "لا توجد مصروفات طاقة حالياً",
    noExpenseDesc: "امسح إيصالاً أو أدخل شحنة لبدء تتبع التكلفة لكل كيلومتر.",
    scanTicket: "مسح إيصال",
    manualEntry: "إدخال يدوي",
    scan: "مسح",
    totalSpent: "إجمالي المصروفات",
    thermalFills: "تعبئة وقود حراري",
    electricCharges: "شحن كهربائي",
    elecSavings: "وفر الكهرباء",
    entriesCount: (count: number) => `${count} مدخلات`,
    dateFormat: 'ar-SA'
  },
  pt: {
    title: "Energia",
    desc: "Recibos de combustível e faturas de carregamento",
    noExpense: "Nenhuma despesa de energia",
    noExpenseDesc: "Digitalize um recibo ou insira um carregamento para começar a acompanhar o seu custo por quilómetro.",
    scanTicket: "Digitalizar um recibo",
    manualEntry: "Inserção manual",
    scan: "Digitalizar",
    totalSpent: "Total gasto",
    thermalFills: "Abastecimentos térmicos",
    electricCharges: "Carregamentos elétricos",
    elecSavings: "Economia eléc.",
    entriesCount: (count: number) => `${count} entrad${count > 1 ? 'as' : 'a'}`,
    dateFormat: 'pt-PT'
  }
};

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function FuelPage({ params }: PageProps) {
  const { locale } = await params;
  const t = TRANSLATIONS[locale as keyof typeof TRANSLATIONS] || TRANSLATIONS.fr;

  const fuelEntries = isSupabaseConfigured() ? await getFuelEntries() : [];
  const profile = isSupabaseConfigured() ? await getProfile() : null;
  const currency = profile?.currency ?? 'EUR';

  if (fuelEntries.length === 0) {
    return (
      <div className="container py-12">
        <Card className="p-10 max-w-xl mx-auto text-center">
          <div className="rounded-full bg-veloce/10 text-veloce h-14 w-14 mx-auto flex items-center justify-center">
            <FuelIcon className="h-7 w-7" strokeWidth={1.5} />
          </div>
          <h1 className="font-display text-xl font-bold mt-5">
            {t.noExpense}
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            {t.noExpenseDesc}
          </p>
          <div className="mt-5 flex flex-col sm:flex-row gap-2 justify-center">
            <Button asChild>
              <Link href="/fuel/scan">
                <ScanLine className="h-4 w-4" /> {t.scanTicket}
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/fuel/scan?manual=1">
                <Plus className="h-4 w-4" /> {t.manualEntry}
              </Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const total = fuelEntries.reduce((s, f) => s + f.totalPrice, 0);
  const electric = fuelEntries.filter((f) => f.energyType === 'electric');
  const thermal = fuelEntries.filter((f) => f.energyType !== 'electric');
  const thermalSum = thermal.reduce((s, f) => s + f.totalPrice, 0);

  const byMonth = fuelEntries.reduce<Record<string, typeof fuelEntries>>(
    (acc, e) => {
      const d = new Date(e.occurredAt);
      const key = d.toLocaleDateString(t.dateFormat, {
        month: 'long',
        year: 'numeric',
      });
      (acc[key] = acc[key] ?? []).push(e);
      return acc;
    },
    {},
  );

  return (
    <div className="container py-6 lg:py-8 space-y-6">
      <PageHeader
        title={t.title}
        description={t.desc}
        action={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/fuel/scan">
                <ScanLine className="h-4 w-4" /> {t.scan}
              </Link>
            </Button>
            <Button asChild>
              <Link href="/fuel/scan?manual=1">
                <Plus className="h-4 w-4" /> {t.manualEntry}
              </Link>
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard label={t.totalSpent} value={total.toFixed(0)} unit={currency} />
        <KpiCard label={t.thermalFills} value={String(thermal.length)} />
        <KpiCard
          label={t.electricCharges}
          value={String(electric.length)}
        />
        <KpiCard
          label={t.elecSavings}
          value={(thermalSum * 0.3).toFixed(0)}
          unit={currency}
          variant="premium"
        />
      </div>

      {Object.entries(byMonth).map(([month, entries]) => (
        <Section
          key={month}
          title={month.charAt(0).toUpperCase() + month.slice(1)}
        >
          <Card className="divide-y divide-border">
            {entries.map((e) => (
              <FuelEntryRow key={e.id} entry={e} />
            ))}
            <div className="p-3 flex items-center justify-between text-xs bg-muted/30">
              <span className="text-muted-foreground">
                {t.entriesCount(entries.length)}
              </span>
              <span className="font-mono font-semibold tabular-nums">
                {formatCurrency(
                  entries.reduce((s, e) => s + e.totalPrice, 0),
                  currency,
                )}
              </span>
            </div>
          </Card>
        </Section>
      ))}
    </div>
  );
}
