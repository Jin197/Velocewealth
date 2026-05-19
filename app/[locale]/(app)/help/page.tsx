import { Link } from '@/lib/i18n/routing';
import {
  ChevronLeft,
  BookOpen,
  MessageSquareText,
  Wrench,
  Fuel,
  Car,
  Brain,
  ScanLine,
  Map,
  CreditCard,
  Mail,
  ExternalLink,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const guides = [
  {
    icon: Car,
    title: 'Ajouter un véhicule',
    desc: 'Enregistrez votre véhicule via plaque, VIN ou saisie manuelle.',
    href: '/vehicles/new',
  },
  {
    icon: ScanLine,
    title: 'Scanner un reçu (OCR)',
    desc: 'Photographiez votre ticket pour un enregistrement instantané.',
    href: '/fuel/scan',
  },
  {
    icon: Fuel,
    title: 'Suivi des dépenses énergie',
    desc: 'Consultez et filtrez vos pleins et recharges.',
    href: '/fuel',
  },
  {
    icon: Wrench,
    title: 'Historique d\'entretien',
    desc: 'Ajoutez et suivez chaque intervention sur vos véhicules.',
    href: '/maintenance',
  },
  {
    icon: Brain,
    title: 'Diagnostic IA & Plan prédictif',
    desc: 'Notre IA analyse l\'usure réelle pour anticiper vos révisions.',
    href: '/dashboard',
  },
  {
    icon: Map,
    title: 'Carte du réseau',
    desc: 'Trouvez les stations et garages partenaires proches.',
    href: '/map',
  },
];

const faq = [
  {
    q: 'Comment fonctionne la reconnaissance OCR ?',
    a: 'Prenez en photo votre ticket de caisse. Notre algorithme extrait automatiquement le montant, le volume, le type de carburant et la station. Vérifiez et validez en un tap.',
  },
  {
    q: 'Qu\'est-ce que le Diagnostic IA ?',
    a: 'Le moteur PHM (Prognostics & Health Management) analyse le kilométrage, la fréquence d\'usage et les intervalles constructeur pour prédire l\'usure de chaque composant clé (freins, pneus, distribution…).',
  },
  {
    q: 'Mes données sont-elles en sécurité ?',
    a: 'Toutes les données sont stockées sur Supabase avec chiffrement AES-256 au repos et TLS en transit. Les politiques RLS (Row Level Security) garantissent que seul le propriétaire accède à ses véhicules.',
  },
  {
    q: 'Quelle est la différence entre Standard et Premium ?',
    a: 'Le plan Standard (gratuit) offre le suivi manuel et la carte des stations. Le Premium (4,99€/mois) débloque le scan OCR illimité, le carnet certifié, l\'export fiscal PDF et le diagnostic IA complet.',
  },
  {
    q: 'Comment exporter mon carnet d\'entretien ?',
    a: 'Depuis la page de votre véhicule, accédez au Diagnostic IA puis cliquez sur "Exporter PDF certifié". Le document généré inclut l\'historique signé et les prédictions d\'usure.',
  },
];

export default function HelpPage() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-4xl mx-auto w-full space-y-8">
      <div>
        <Button variant="ghost" size="sm" asChild className="-ml-3 mb-4">
          <Link href="/dashboard">
            <ChevronLeft className="h-4 w-4" /> Retour
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-veloce/10 text-veloce h-10 w-10 flex items-center justify-center shrink-0">
            <BookOpen className="h-5 w-5" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="font-display text-2xl lg:text-3xl font-bold tracking-tight">
              Centre d&apos;aide
            </h1>
            <p className="text-sm text-muted-foreground">
              Guides, tutoriels et réponses fréquentes
            </p>
          </div>
        </div>
      </div>

      {/* Guides rapides */}
      <section className="space-y-4">
        <h2 className="font-display text-lg font-semibold">Guides rapides</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {guides.map((g) => {
            const Icon = g.icon;
            return (
              <Link key={g.href} href={g.href}>
                <Card className="p-4 hover:bg-muted/40 transition-colors h-full">
                  <div className="flex items-start gap-3">
                    <div className="rounded-btn bg-veloce/10 text-veloce p-2 shrink-0">
                      <Icon className="h-4 w-4" strokeWidth={1.5} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium">{g.title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {g.desc}
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* FAQ */}
      <section className="space-y-4">
        <h2 className="font-display text-lg font-semibold">Questions fréquentes</h2>
        <div className="space-y-3">
          {faq.map((item, i) => (
            <Card key={i} className="p-4">
              <details className="group">
                <summary className="font-medium text-sm cursor-pointer list-none flex items-center justify-between gap-2">
                  <span>{item.q}</span>
                  <ChevronLeft className="h-4 w-4 shrink-0 text-muted-foreground -rotate-90 group-open:rotate-90 transition-transform" />
                </summary>
                <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                  {item.a}
                </p>
              </details>
            </Card>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section className="space-y-4">
        <h2 className="font-display text-lg font-semibold">Besoin d&apos;aide ?</h2>
        <Card className="p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="rounded-full bg-eco/10 text-eco h-10 w-10 flex items-center justify-center shrink-0">
                <MessageSquareText className="h-5 w-5" strokeWidth={1.5} />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium">Assistance VeloceWealth</div>
                <div className="text-xs text-muted-foreground">
                  Utilisez le chatbot en bas à droite ou contactez-nous par email
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm" className="shrink-0" asChild>
              <a href="mailto:support@velocewealth.app">
                <Mail className="h-4 w-4" /> Contacter
              </a>
            </Button>
          </div>
        </Card>
      </section>
    </div>
  );
}
