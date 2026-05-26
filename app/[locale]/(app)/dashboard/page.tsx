import { Link } from '@/lib/i18n/routing';
import {
  Gauge,
  Wallet,
  Activity,
  Leaf,
  Plus,
  ArrowRight,
  Car,
} from 'lucide-react';
import { PageHeader, Section } from '@/components/domain/page-header';
import { KpiCard } from '@/components/domain/kpi-card';
import { VehicleCard } from '@/components/domain/vehicle-card';
import { AlertCard } from '@/components/domain/alert-card';
import { FuelEntryRow } from '@/components/domain/fuel-entry-row';
import { SpendChart } from '@/components/domain/spend-chart';
import { EnergyMix } from '@/components/domain/energy-mix';
import { RegulatoryKpiCard } from '@/components/domain/regulatory-kpi-card';
import { UpcomingTasksCard } from '@/components/domain/upcoming-tasks-card';
import { getAllUserFines } from '@/server/actions/fines';
import { getAllUserTasks } from '@/server/actions/maintenance-tasks';
import { getAllUserInsuranceRecords } from '@/server/actions/insurance';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DemoButton } from '@/components/domain/demo-button';
import { getDashboardData } from '@/lib/data';
import {
  computeCostPerKm,
  energyMix,
  monthlySpend,
} from '@/lib/computations';
import { isSupabaseConfigured } from '@/lib/env';
import { formatCurrency, formatDistance } from '@/lib/utils';

const TRANSLATIONS = {
  fr: {
    hello: "Bonjour",
    subtitle: "Voici la photo de votre flotte sur les 6 derniers mois.",
    addExpense: "Ajouter une dépense",
    costPerKm: "Coût au km",
    spend6Months: "Dépenses 6 mois",
    distance: "Distance",
    ecoScore: "Score éco",
    monthlySpend: "Dépenses mensuelles",
    monthlySpendSub: "Énergie + entretien + assurance sur 6 mois",
    insurance: "Assurance",
    energy: "Énergie",
    maintenance: "Entretien",
    energyMix: "Mix énergétique",
    energyMixSub: "Part électrique vs thermique",
    elecSavings: "Économies cumulées électrique",
    vsThermal: "vs 100 % thermique",
    maintenanceAlerts: "Alertes maintenance",
    maintenanceAlertsSub: "Anticipez l'usure réelle de chaque véhicule",
    viewAll: "Tout voir",
    recentEnergySpend: "Dernières dépenses énergie",
    yourVehicles: "Vos véhicules",
    add: "Ajouter",
    welcome: "Bienvenue",
    emptyStateDesc: "Pour commencer, ajoutez votre premier véhicule. Velocewealth calculera automatiquement votre coût au kilomètre dès la première dépense.",
    addFirstVehicle: "Ajouter mon premier véhicule",
    enableDemoMode: "Activer le Mode Démo",
    notConfigured: "Backend non configuré",
    notConfiguredDesc: "Renseignez vos clés Supabase dans .env.local puis redémarrez. Voir ONBOARDING.md."
  },
  en: {
    hello: "Hello",
    subtitle: "Here is your fleet status over the last 6 months.",
    addExpense: "Add expense",
    costPerKm: "Cost per km",
    spend6Months: "6-month expenses",
    distance: "Distance",
    ecoScore: "Eco score",
    monthlySpend: "Monthly expenses",
    monthlySpendSub: "Energy + maintenance + insurance over 6 months",
    insurance: "Insurance",
    energy: "Energy",
    maintenance: "Maintenance",
    energyMix: "Energy mix",
    energyMixSub: "Electric vs thermal share",
    elecSavings: "Cumulative electric savings",
    vsThermal: "vs 100% thermal",
    maintenanceAlerts: "Maintenance alerts",
    maintenanceAlertsSub: "Anticipate real wear for each vehicle",
    viewAll: "View all",
    recentEnergySpend: "Recent energy expenses",
    yourVehicles: "Your vehicles",
    add: "Add",
    welcome: "Welcome",
    emptyStateDesc: "To start, add your first vehicle. Velocewealth will automatically compute your running cost per kilometer starting from the first expense.",
    addFirstVehicle: "Add my first vehicle",
    enableDemoMode: "Activate Demo Mode",
    notConfigured: "Backend not configured",
    notConfiguredDesc: "Configure your Supabase keys in .env.local and restart. See ONBOARDING.md."
  },
  es: {
    hello: "Hola",
    subtitle: "Esta es la situación de tu flota en los últimos 6 meses.",
    addExpense: "Añadir gasto",
    costPerKm: "Coste por km",
    spend6Months: "Gastos de 6 meses",
    distance: "Distancia",
    ecoScore: "Eco score",
    monthlySpend: "Gastos mensuales",
    monthlySpendSub: "Energía + mantenimiento + seguro durante 6 meses",
    insurance: "Seguro",
    energy: "Energía",
    maintenance: "Mantenimiento",
    energyMix: "Mix energético",
    energyMixSub: "Cuota eléctrica vs térmica",
    elecSavings: "Ahorro eléctrico acumulado",
    vsThermal: "vs 100% térmico",
    maintenanceAlerts: "Alertas de mantenimiento",
    maintenanceAlertsSub: "Anticipa el desgaste real de cada vehículo",
    viewAll: "Ver todo",
    recentEnergySpend: "Gastos de energía recientes",
    yourVehicles: "Tus vehículos",
    add: "Añadir",
    welcome: "Bienvenido",
    emptyStateDesc: "Para empezar, añade tu primer vehículo. Velocewealth calculará automáticamente tu coste por kilómetro desde el primer gasto.",
    addFirstVehicle: "Añadir mi primer vehículo",
    enableDemoMode: "Activar el Modo Demo",
    notConfigured: "Backend no configurado",
    notConfiguredDesc: "Configure sus claves Supabase en .env.local y reinicie. Consulte ONBOARDING.md."
  },
  ar: {
    hello: "مرحباً",
    subtitle: "إليك حالة أسطولك خلال آخر 6 أشهر.",
    addExpense: "إضافة مصروف",
    costPerKm: "التكلفة لكل كم",
    spend6Months: "مصروفات 6 أشهر",
    distance: "المسافة",
    ecoScore: "مؤشر القيادة البيئية",
    monthlySpend: "المصروفات الشهرية",
    monthlySpendSub: "الطاقة + الصيانة + التأمين على مدى 6 أشهر",
    insurance: "التأمين",
    energy: "الطاقة",
    maintenance: "الصيانة",
    energyMix: "مزيج الطاقة",
    energyMixSub: "حصة الكهرباء مقابل الوقود",
    elecSavings: "الوفر الكهربائي التراكمي",
    vsThermal: "مقارنة بـ 100% وقود",
    maintenanceAlerts: "تنبيهات الصيانة",
    maintenanceAlertsSub: "توقع التآكل الفعلي لكل مركبة",
    viewAll: "عرض الكل",
    recentEnergySpend: "آخر مصروفات الطاقة",
    yourVehicles: "مركباتك",
    add: "إضافة",
    welcome: "مرحباً بك",
    emptyStateDesc: "للبدء، أضف مركبتك الأولى. سيقوم Velocewealth تلقائياً بحساب التكلفة لكل كيلومتر بدءاً من المصروف الأول.",
    addFirstVehicle: "إضافة مركبتي الأولى",
    enableDemoMode: "تفعيل الوضع التجريبي",
    notConfigured: "قاعدة البيانات غير مهيأة",
    notConfiguredDesc: "يرجى إدخال مفاتيح Supabase في ملف .env.local وإعادة التشغيل. راجع ONBOARDING.md."
  },
  pt: {
    hello: "Olá",
    subtitle: "Aqui está o estado da sua frota nos últimos 6 meses.",
    addExpense: "Adicionar despesa",
    costPerKm: "Custo por km",
    spend6Months: "Despesas de 6 meses",
    distance: "Distância",
    ecoScore: "Eco score",
    monthlySpend: "Despesas mensais",
    monthlySpendSub: "Energia + manutenção + seguro durante 6 meses",
    insurance: "Seguro",
    energy: "Energia",
    maintenance: "Manutenção",
    energyMix: "Mix energético",
    energyMixSub: "Cota elétrica vs térmica",
    elecSavings: "Economia elétrica acumulada",
    vsThermal: "vs 100% térmico",
    maintenanceAlerts: "Alertas de manutenção",
    maintenanceAlertsSub: "Antecipe o desgaste real de cada veículo",
    viewAll: "Ver tudo",
    recentEnergySpend: "Despesas de energia recentes",
    yourVehicles: "Seus veículos",
    add: "Adicionar",
    welcome: "Bem-vindo",
    emptyStateDesc: "Para começar, adicione o seu primeiro veículo. O Velocewealth calculará automaticamente o seu custo por quilómetro a partir da primeira despesa.",
    addFirstVehicle: "Adicionar meu primeiro veículo",
    enableDemoMode: "Ativar o Modo Demo",
    notConfigured: "Backend não configurado",
    notConfiguredDesc: "Configure suas chaves Supabase no arquivo .env.local e reinicie. Veja ONBOARDING.md."
  }
};

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function DashboardPage({ params }: PageProps) {
  const { locale } = await params;
  const t = TRANSLATIONS[locale as keyof typeof TRANSLATIONS] || TRANSLATIONS.fr;

  if (!isSupabaseConfigured()) {
    return (
      <div className="container py-12">
        <Card className="p-10 max-w-2xl mx-auto text-center">
          <h1 className="font-display text-2xl font-bold">
            {t.notConfigured}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t.notConfiguredDesc}
          </p>
        </Card>
      </div>
    );
  }

  const [{ profile, vehicles, fuel, maintenance, alerts }, fines, tasks, insuranceRecords] =
    await Promise.all([
      getDashboardData(),
      getAllUserFines(),
      getAllUserTasks(),
      getAllUserInsuranceRecords(),
    ]);

  if (!profile || vehicles.length === 0) {
    return (
      <div className="container py-12">
        <Card variant="premium" className="p-10 max-w-2xl mx-auto text-center">
          <div className="rounded-full bg-veloce/10 text-veloce h-16 w-16 mx-auto flex items-center justify-center">
            <Car className="h-8 w-8" strokeWidth={1.5} />
          </div>
          <h1 className="font-display text-2xl font-bold mt-6">
            {t.welcome}{profile ? `, ${profile.fullName.split(' ')[0]}` : ''}
          </h1>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">
            {t.emptyStateDesc}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/vehicles/new">
                <Plus className="h-4 w-4" /> {t.addFirstVehicle}
              </Link>
            </Button>
            <DemoButton />
          </div>
        </Card>
      </div>
    );
  }

  const breakdowns = vehicles.map((v) =>
    computeCostPerKm(v, fuel, maintenance, 6, insuranceRecords),
  );
  const totalSpend = breakdowns.reduce((s, b) => s + b.total, 0);
  const totalDistance = breakdowns.reduce((s, b) => s + b.distance, 0);
  const fleetCostPerKm = totalDistance > 0 ? totalSpend / totalDistance : 0;
  const mix = energyMix(fuel);
  const monthly = monthlySpend(fuel, maintenance, 6, vehicles);
  const recentFuel = fuel.slice(0, 4);
  const criticalAlerts = alerts.filter(
    (a) => a.severity === 'critical' || a.severity === 'warning',
  );

  return (
    <div className="container py-6 lg:py-8 space-y-8">
      <PageHeader
        title={`${t.hello}, ${profile.fullName.split(' ')[0]}`}
        description={t.subtitle}
        action={
          <Button asChild>
            <Link href="/fuel/scan">
              <Plus className="h-4 w-4" /> {t.addExpense}
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          label={t.costPerKm}
          value={fleetCostPerKm.toFixed(3)}
          unit={`${profile.currency}/km`}
          icon={<Gauge className="h-4 w-4" strokeWidth={1.5} />}
        />
        <KpiCard
          label={t.spend6Months}
          value={totalSpend.toFixed(0)}
          unit={profile.currency}
          icon={<Wallet className="h-4 w-4" strokeWidth={1.5} />}
        />
        <KpiCard
          label={t.distance}
          value={formatDistance(totalDistance).replace(' km', '')}
          unit="km"
          icon={<Activity className="h-4 w-4" strokeWidth={1.5} />}
        />
        <KpiCard
          label={t.ecoScore}
          value="82"
          unit="/100"
          variant="premium"
          icon={<Leaf className="h-4 w-4" strokeWidth={1.5} />}
        />
      </div>

      <RegulatoryKpiCard
        fines={fines}
        totalFleetSpend={totalSpend}
        currency={profile.currency}
        hrefFirstVehicle={vehicles[0] ? `/vehicles/${vehicles[0].id}` : null}
      />

      <UpcomingTasksCard
        tasks={tasks}
        vehicleLabels={Object.fromEntries(
          vehicles.map((v) => [v.id, `${v.make} ${v.model} · ${v.plate}`]),
        )}
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-base font-semibold">
                {t.monthlySpend}
              </h2>
              <p className="text-xs text-muted-foreground">
                {t.monthlySpendSub}
              </p>
            </div>
            <div className="flex gap-3 text-xs">
              {vehicles.some((v) => v.insuranceMonthly && v.insuranceMonthly > 0) && (
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#C5A059]" /> {t.insurance}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-veloce" /> {t.energy}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-eco" /> {t.maintenance}
              </span>
            </div>
          </div>
          <SpendChart data={monthly} currency={profile.currency} />
        </Card>

        <Card className="p-6">
          <div className="mb-4">
            <h2 className="font-display text-base font-semibold">
              {t.energyMix}
            </h2>
            <p className="text-xs text-muted-foreground">
              {t.energyMixSub}
            </p>
          </div>
          <EnergyMix
            thermal={mix.thermal}
            electric={mix.electric}
            thermalVolume={mix.thermalVolume}
            electricVolume={mix.electricVolume}
          />
          {mix.thermalAmount > 0 && (
            <div className="mt-6 rounded-btn bg-eco/5 border border-eco/10 p-3">
              <div className="text-xs text-eco font-medium">
                {t.elecSavings}
              </div>
              <div className="font-mono text-lg font-semibold mt-1 tabular-nums">
                {formatCurrency(mix.thermalAmount * 0.3, profile.currency)}
              </div>
              <div className="text-[11px] text-muted-foreground">
                {t.vsThermal}
              </div>
            </div>
          )}
        </Card>
      </div>

      {(criticalAlerts.length > 0 || recentFuel.length > 0) && (
        <div className="grid lg:grid-cols-2 gap-6">
          {criticalAlerts.length > 0 && (
            <Section
              title={t.maintenanceAlerts}
              description={t.maintenanceAlertsSub}
              action={
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/maintenance">
                    {t.viewAll} <ArrowRight className="h-3 w-3" />
                  </Link>
                </Button>
              }
            >
              <div className="space-y-2">
                {criticalAlerts.map((a) => (
                  <AlertCard key={a.id} alert={a} />
                ))}
              </div>
            </Section>
          )}

          {recentFuel.length > 0 && (
            <Section
              title={t.recentEnergySpend}
              action={
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/fuel">
                    {t.viewAll} <ArrowRight className="h-3 w-3" />
                  </Link>
                </Button>
              }
            >
              <Card className="divide-y divide-border">
                {recentFuel.map((e) => (
                  <FuelEntryRow key={e.id} entry={e} />
                ))}
              </Card>
            </Section>
          )}
        </div>
      )}

      <Section
        title={t.yourVehicles}
        action={
          <Button variant="outline" size="sm" asChild>
            <Link href="/vehicles/new">
              <Plus className="h-3.5 w-3.5" /> {t.add}
            </Link>
          </Button>
        }
      >
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {vehicles.map((v) => (
            <VehicleCard key={v.id} vehicle={v} />
          ))}
        </div>
      </Section>
    </div>
  );
}
