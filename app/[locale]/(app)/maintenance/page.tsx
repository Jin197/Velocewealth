import { Link } from '@/lib/i18n/routing';
import { Plus, Wrench, FileText, Brain } from 'lucide-react';
import { PageHeader, Section } from '@/components/domain/page-header';
import { AlertCard } from '@/components/domain/alert-card';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  getMaintenanceEntries,
  getActiveAlerts,
  getVehicles,
} from '@/lib/data';
import { isSupabaseConfigured } from '@/lib/env';
import { formatCurrency, formatDate, formatDistance } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const TRANSLATIONS = {
  fr: {
    title: "Entretien",
    desc: "Historique, alertes et carnet certifié de votre flotte",
    aiPlan: "Plan IA",
    certifiedLog: "Carnet certifié",
    add: "Ajouter",
    planPerVehicle: "Plan de maintenance par véhicule",
    planPerVehicleDesc: "Générique ou jumeau numérique selon l'historique",
    digitalTwin: (count: number) => `Jumeau numérique · ${count} historique${count > 1 ? 's' : ''}`,
    genericPlan: "Plan générique",
    predictiveAlerts: "Alertes prédictives",
    predictiveAlertsDesc: "Calculées par algorithme à partir de l'usure réelle",
    history: "Historique",
    historyDesc: "Toutes les interventions, par date",
    noMaintenance: "Aucun entretien enregistré",
    noMaintenanceDesc: "Générez un plan d'entretien basé sur les recommandations constructeur, ou saisissez vos premières interventions pour activer le jumeau numérique.",
    generatePlan: "Générer un plan",
    addIntervention: "Ajouter une intervention",
    categories: {
      oil: 'Vidange',
      tires: 'Pneumatiques',
      brakes: 'Freinage',
      filter: 'Filtres',
      battery: 'Batterie',
      inspection: 'Contrôle',
      other: 'Autre',
    } as Record<string, string>
  },
  en: {
    title: "Maintenance",
    desc: "History, alerts, and certified logbook of your fleet",
    aiPlan: "AI Plan",
    certifiedLog: "Certified logbook",
    add: "Add",
    planPerVehicle: "Maintenance plan per vehicle",
    planPerVehicleDesc: "Generic or digital twin according to history",
    digitalTwin: (count: number) => `Digital twin · ${count} logs`,
    genericPlan: "Generic plan",
    predictiveAlerts: "Predictive alerts",
    predictiveAlertsDesc: "Computed by algorithm from real wear",
    history: "History",
    historyDesc: "All services, by date",
    noMaintenance: "No services logged yet",
    noMaintenanceDesc: "Generate a maintenance plan based on builder specs, or enter your first services to activate the digital twin.",
    generatePlan: "Generate a plan",
    addIntervention: "Add a service",
    categories: {
      oil: 'Oil Change',
      tires: 'Tires',
      brakes: 'Brakes',
      filter: 'Filters',
      battery: 'Battery',
      inspection: 'Inspection',
      other: 'Other',
    } as Record<string, string>
  },
  es: {
    title: "Mantenimiento",
    desc: "Historial, alertas y carnet certificado de tu flota",
    aiPlan: "Plan IA",
    certifiedLog: "Carnet certificado",
    add: "Añadir",
    planPerVehicle: "Plan de mantenimiento por vehículo",
    planPerVehicleDesc: "Genérico o gemelo digital según el historial",
    digitalTwin: (count: number) => `Gemelo digital · ${count} historial${count > 1 ? 'es' : ''}`,
    genericPlan: "Plan genérico",
    predictiveAlerts: "Alertas predictivas",
    predictiveAlertsDesc: "Calculadas mediante algoritmo a partir del desgaste real",
    history: "Historial",
    historyDesc: "Todas las intervenciones, por fecha",
    noMaintenance: "Ningún mantenimiento registrado",
    noMaintenanceDesc: "Genera un plan de mantenimiento basado en las especificaciones del fabricante, o introduce tus primeras intervenciones para activar el gemelo digital.",
    generatePlan: "Generar un plan",
    addIntervention: "Añadir una intervención",
    categories: {
      oil: 'Cambio de aceite',
      tires: 'Neumáticos',
      brakes: 'Frenado',
      filter: 'Filtros',
      battery: 'Batería',
      inspection: 'Control',
      other: 'Otro',
    } as Record<string, string>
  },
  ar: {
    title: "الصيانة",
    desc: "سجل الصيانة، والتنبيهات، ودفتر الصيانة المعتمد لأسطولك",
    aiPlan: "خطة الذكاء الاصطناعي",
    certifiedLog: "دفتر الصيانة المعتمد",
    add: "إضافة",
    planPerVehicle: "خطة الصيانة لكل مركبة",
    planPerVehicleDesc: "خطة عامة أو جيمي رقمي حسب السجل",
    digitalTwin: (count: number) => `جيميني رقمي · ${count} سجلات`,
    genericPlan: "خطة عامة",
    predictiveAlerts: "التنبيهات التنبؤية",
    predictiveAlertsDesc: "تم احتسابها بواسطة الخوارزميات بناءً على التآكل الفعلي",
    history: "السجل",
    historyDesc: "جميع العمليات، حسب التاريخ",
    noMaintenance: "لا يوجد سجل صيانة حالياً",
    noMaintenanceDesc: "أنشئ خطة صيانة بناءً على مواصفات الشركة المصنعة، أو أدخل عمليات الصيانة الأولى لتفعيل التوأم الرقمي.",
    generatePlan: "إنشاء خطة",
    addIntervention: "إضافة عملية صيانة",
    categories: {
      oil: 'تغيير الزيت',
      tires: 'الإطارات',
      brakes: 'المكابح',
      filter: 'الفلاتر',
      battery: 'البطارية',
      inspection: 'فحص',
      other: 'آخر',
    } as Record<string, string>
  },
  pt: {
    title: "Manutenção",
    desc: "Histórico, alertas e caderneta certificada da sua frota",
    aiPlan: "Plano IA",
    certifiedLog: "Caderneta certificada",
    add: "Adicionar",
    planPerVehicle: "Plano de manutenção por veículo",
    planPerVehicleDesc: "Genérico ou gêmeo digital de acordo com o histórico",
    digitalTwin: (count: number) => `Gêmeo digital · ${count} registros`,
    genericPlan: "Plano genérico",
    predictiveAlerts: "Alertas preditivos",
    predictiveAlertsDesc: "Calculados por algoritmo a partir do desgaste real",
    history: "Histórico",
    historyDesc: "Todos os serviços, por data",
    noMaintenance: "Nenhum serviço registrado",
    noMaintenanceDesc: "Gere um plano de manutenção baseado nas especificações do fabricante, ou insira as suas primeiras intervenções para ativar o gêmeo digital.",
    generatePlan: "Gerar um plano",
    addIntervention: "Adicionar uma intervenção",
    categories: {
      oil: 'Troca de óleo',
      tires: 'Pneus',
      brakes: 'Freios',
      filter: 'Filtros',
      battery: 'Bateria',
      inspection: 'Inspeção',
      other: 'Outro',
    } as Record<string, string>
  }
};

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function MaintenancePage({ params }: PageProps) {
  const { locale } = await params;
  const t = TRANSLATIONS[locale as keyof typeof TRANSLATIONS] || TRANSLATIONS.fr;

  if (!isSupabaseConfigured()) {
    return (
      <div className="container py-12">
        <Card className="p-10 max-w-xl mx-auto text-center">
          <div className="rounded-full bg-veloce/10 text-veloce h-14 w-14 mx-auto flex items-center justify-center">
            <Wrench className="h-7 w-7" strokeWidth={1.5} />
          </div>
          <h1 className="font-display text-xl font-bold mt-5">
            {t.noMaintenance}
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            {t.noMaintenanceDesc}
          </p>
        </Card>
      </div>
    );
  }

  const [maintenance, alerts, vehicles] = await Promise.all([
    getMaintenanceEntries(),
    getActiveAlerts(),
    getVehicles(),
  ]);

  if (maintenance.length === 0 && alerts.length === 0) {
    const firstVehicleId = vehicles[0]?.id;
    return (
      <div className="container py-12">
        <Card className="p-10 max-w-xl mx-auto text-center">
          <div className="rounded-full bg-veloce/10 text-veloce h-14 w-14 mx-auto flex items-center justify-center">
            <Wrench className="h-7 w-7" strokeWidth={1.5} />
          </div>
          <h1 className="font-display text-xl font-bold mt-5">
            {t.noMaintenance}
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            {t.noMaintenanceDesc}
          </p>
          <div className="mt-5 flex gap-2 justify-center flex-wrap">
            {firstVehicleId && (
              <Button variant="outline" asChild>
                <Link href={`/maintenance/plan/${firstVehicleId}`}>
                  <Brain className="h-4 w-4" /> {t.generatePlan}
                </Link>
              </Button>
            )}
            <Button asChild>
              <Link href="/maintenance/new">
                <Plus className="h-4 w-4" /> {t.addIntervention}
              </Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-6 lg:py-8 space-y-6">
      <PageHeader
        title={t.title}
        description={t.desc}
        action={
          <div className="flex gap-2 flex-wrap">
            {vehicles[0] && (
              <Button variant="outline" asChild>
                <Link href={`/maintenance/plan/${vehicles[0].id}`}>
                  <Brain className="h-4 w-4" /> {t.aiPlan}
                </Link>
              </Button>
            )}
            <Button variant="outline" asChild>
              <Link href="/maintenance/log">
                <FileText className="h-4 w-4" /> {t.certifiedLog}
              </Link>
            </Button>
            <Button asChild>
              <Link href="/maintenance/new">
                <Plus className="h-4 w-4" /> {t.add}
              </Link>
            </Button>
          </div>
        }
      />

      {vehicles.length > 1 && (
        <Section
          title={t.planPerVehicle}
          description={t.planPerVehicleDesc}
        >
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {vehicles.map((v) => {
              const count = maintenance.filter((m) => m.vehicleId === v.id).length;
              return (
                <Link
                  key={v.id}
                  href={`/maintenance/plan/${v.id}`}
                  className="rounded-card border border-border bg-card p-4 hover:bg-muted/40 transition-colors flex items-center gap-3"
                >
                  <div className="rounded-btn bg-veloce/10 text-veloce p-2">
                    <Brain className="h-4 w-4" strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {v.make} {v.model}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {count > 0
                        ? t.digitalTwin(count)
                        : t.genericPlan}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </Section>
      )}

      {alerts.length > 0 && (
        <Section
          title={t.predictiveAlerts}
          description={t.predictiveAlertsDesc}
        >
          <div className="grid sm:grid-cols-2 gap-2">
            {alerts.map((a) => (
              <AlertCard key={a.id} alert={a} />
            ))}
          </div>
        </Section>
      )}

      {maintenance.length > 0 && (
        <Section title={t.history} description={t.historyDesc}>
          <Card className="divide-y divide-border">
            {maintenance.map((m) => {
              const v = vehicles.find((veh) => veh.id === m.vehicleId);
              return (
                <Link
                  key={m.id}
                  href={`/maintenance/${m.id}`}
                  className="flex items-center gap-4 p-4 hover:bg-muted/40 transition-colors"
                >
                  <div className="rounded-btn bg-veloce/10 text-veloce p-2.5 shrink-0">
                    <Wrench className="h-4 w-4" strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      {m.description}
                      <Badge
                        variant="muted"
                        className="text-[10px] px-1.5 py-0 h-4"
                      >
                        {t.categories[m.category] || m.category}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                      {v && (
                        <span>
                          {v.make} {v.model}
                        </span>
                      )}
                      <span>· {m.garageName}</span>
                      <span>· {formatDate(m.occurredAt)}</span>
                      <span>· {formatDistance(m.mileageKm)}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-mono font-semibold tabular-nums">
                      {formatCurrency(m.cost, m.currency)}
                    </div>
                  </div>
                </Link>
              );
            })}
          </Card>
        </Section>
      )}
    </div>
  );
}
