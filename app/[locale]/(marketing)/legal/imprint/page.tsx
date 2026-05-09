import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mentions légales',
  description: 'Mentions légales de Velocewealth — éditeur, hébergeur, contact.',
};

export default function ImprintPage() {
  return (
    <main className="container py-16 max-w-3xl">
      <h1 className="font-display text-3xl font-bold tracking-tight">
        Mentions légales
      </h1>
      <p className="text-sm text-muted-foreground mt-2">
        Conformément à l&apos;article 6 de la loi pour la confiance dans
        l&apos;économie numérique (LCEN).
      </p>

      <section className="mt-10 space-y-6 text-sm leading-relaxed text-muted-foreground">
        <Block title="Éditeur du site">
          <Field label="Raison sociale" value="Velocewealth SAS (en cours d'immatriculation)" />
          <Field label="Forme juridique" value="Société par actions simplifiée" />
          <Field label="Capital social" value="à compléter" />
          <Field label="RCS" value="à compléter" />
          <Field label="N° TVA intracommunautaire" value="à compléter" />
          <Field label="Siège social" value="à compléter (France)" />
          <Field label="Directeur de la publication" value="à compléter" />
          <Field label="Email" value="legal@velocewealth.app" link />
        </Block>

        <Block title="Hébergement">
          <Field label="Application web" value="Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, USA — données hébergées en région UE." />
          <Field label="Base de données &amp; stockage" value="Supabase Inc., 970 Toa Payoh North #07-04, Singapore 318992 — instance hébergée à Frankfurt (Allemagne)." />
          <Field label="Paiements" value="Stripe Payments Europe Ltd, 1 Grand Canal Street Lower, Grand Canal Dock, Dublin, Ireland." />
        </Block>

        <Block title="Propriété intellectuelle">
          <p>
            L&apos;ensemble des éléments accessibles sur le site (textes, images,
            graphismes, logo, icônes, sons, logiciels) est la propriété exclusive
            de Velocewealth ou de ses partenaires. Toute reproduction,
            représentation, modification, publication, adaptation totale ou
            partielle, par quelque procédé que ce soit, est interdite sans
            autorisation préalable écrite.
          </p>
        </Block>

        <Block title="Données personnelles">
          <p>
            Les modalités de traitement des données personnelles sont décrites
            dans notre{' '}
            <a href="/legal/privacy" className="text-veloce hover:underline">
              politique de confidentialité
            </a>
            .
          </p>
        </Block>

        <Block title="Médiation">
          <p>
            Conformément à l&apos;article L.612-1 du Code de la consommation,
            tout consommateur a le droit de recourir gratuitement à un médiateur
            de la consommation en vue de la résolution amiable d&apos;un litige
            l&apos;opposant à un professionnel.
          </p>
        </Block>

        <Block title="Contact">
          <p>
            Pour toute question relative à ces mentions ou au site, écrivez à{' '}
            <a href="mailto:legal@velocewealth.app" className="text-veloce hover:underline">
              legal@velocewealth.app
            </a>
            .
          </p>
        </Block>
      </section>
    </main>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-card border border-border bg-card p-5">
      <h2 className="font-display text-base font-semibold text-foreground mb-3">
        {title}
      </h2>
      <div className="space-y-2 text-sm">{children}</div>
    </div>
  );
}

function Field({
  label,
  value,
  link,
}: {
  label: string;
  value: string;
  link?: boolean;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:gap-4">
      <span className="text-xs text-muted-foreground sm:w-44 sm:shrink-0 uppercase tracking-wider">
        {label}
      </span>
      <span>
        {link ? (
          <a href={`mailto:${value}`} className="text-veloce hover:underline">
            {value}
          </a>
        ) : (
          value
        )}
      </span>
    </div>
  );
}
