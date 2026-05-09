import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Conditions générales d\'utilisation',
  description:
    'Conditions générales d\'utilisation de Velocewealth — règles d\'usage, abonnement, responsabilité.',
};

export default function TermsPage() {
  return (
    <main className="container py-16 max-w-3xl">
      <h1 className="font-display text-3xl font-bold tracking-tight">
        Conditions générales d&apos;utilisation
      </h1>
      <p className="text-sm text-muted-foreground mt-2">
        Version du 9 mai 2026 · applicable aux personnes physiques majeures
        utilisant le service Velocewealth.
      </p>

      <section className="mt-10 space-y-8 text-sm leading-relaxed">
        <Article number="1" title="Objet">
          <p>
            Les présentes CGU régissent l&apos;accès et l&apos;utilisation du service
            Velocewealth (ci-après « le Service »), édité par Velocewealth (voir{' '}
            <a href="/legal/imprint" className="text-veloce hover:underline">
              mentions légales
            </a>
            ). Le Service est une plateforme web de gestion automobile permettant
            de suivre les coûts d&apos;un ou plusieurs véhicules, de consigner
            l&apos;entretien et de générer un carnet certifié.
          </p>
          <p>
            Toute création de compte ou souscription emporte acceptation pleine et
            entière des présentes CGU et de la{' '}
            <a href="/legal/privacy" className="text-veloce hover:underline">
              politique de confidentialité
            </a>
            .
          </p>
        </Article>

        <Article number="2" title="Création de compte">
          <p>
            La création d&apos;un compte requiert une adresse email valide et un
            mot de passe d&apos;au moins 6 caractères. Les utilisateurs déclarent
            être majeurs et fournir des informations exactes. Un compte peut être
            créé via OAuth (Google, Apple) — l&apos;utilisateur reste responsable
            de la sécurité de ses identifiants chez le fournisseur tiers.
          </p>
          <p>
            Velocewealth se réserve le droit de suspendre tout compte présentant
            une activité frauduleuse, abusive ou contraire aux présentes CGU.
          </p>
        </Article>

        <Article number="3" title="Niveaux d'offre">
          <p>Trois niveaux sont proposés :</p>
          <ul className="list-disc ps-5 space-y-1">
            <li>
              <strong>Standard (gratuit)</strong> : suivi manuel limité, OCR
              limité à 5 scans par mois, 1 véhicule.
            </li>
            <li>
              <strong>Premium</strong> : 4,99 € TTC / mois ou 45 € TTC / an, OCR
              illimité, carnet certifié exportable, TCO complet, véhicules
              illimités.
            </li>
            <li>
              <strong>Garage Partenaire (B2B)</strong> : sur devis, mise en avant
              dans la carte et prise de rendez-vous intégrée.
            </li>
          </ul>
          <p>
            Les prix s&apos;entendent TVA incluse, calculée par Stripe Tax selon
            le pays de facturation. Les prix peuvent évoluer ; les abonnements en
            cours sont protégés jusqu&apos;à leur prochain renouvellement.
          </p>
        </Article>

        <Article number="4" title="Essai gratuit, paiement et résiliation">
          <p>
            Le Premium est proposé avec 30 jours d&apos;essai gratuit pour les
            nouveaux abonnés. Aucun prélèvement n&apos;est effectué pendant
            l&apos;essai si l&apos;abonnement est résilié avant son terme.
          </p>
          <p>
            Le paiement est traité par Stripe Inc. Velocewealth ne stocke aucune
            donnée bancaire. L&apos;abonnement se renouvelle tacitement chaque
            mois ou chaque année selon la formule choisie.
          </p>
          <p>
            La résiliation est gratuite, sans engagement, à tout moment depuis
            <em> Paramètres → Abonnement</em>. Elle prend effet à la fin de la
            période en cours ; aucun remboursement prorata temporis n&apos;est
            effectué, sauf cas prévus par la loi.
          </p>
        </Article>

        <Article number="5" title="Carnet d'entretien certifié">
          <p>
            Velocewealth propose un carnet d&apos;entretien certifié dont
            chaque entrée est signée par un hash SHA-256 chaîné à la précédente,
            et dont la modification ou la suppression est techniquement bloquée
            au niveau base de données (PostgreSQL trigger).
          </p>
          <p>
            <strong>
              Cette certification est de nature technique et ne constitue pas un
              acte authentique au sens des articles 1369 et suivants du Code
              civil.
            </strong>{' '}
            Elle a vocation à fournir une preuve technique d&apos;intégrité
            destinée à rassurer un futur acheteur du véhicule, sans valeur
            opposable à un tiers de bonne foi en cas de litige judiciaire.
          </p>
        </Article>

        <Article number="6" title="Obligations de l'utilisateur">
          <p>L&apos;utilisateur s&apos;engage à :</p>
          <ul className="list-disc ps-5 space-y-1">
            <li>fournir des données exactes et à les mettre à jour ;</li>
            <li>
              ne pas utiliser le Service à des fins illégales, frauduleuses ou
              portant atteinte aux droits de tiers ;
            </li>
            <li>
              ne pas tenter de contourner les limitations techniques (rate limit
              OCR, quota gratuit, RLS) ;
            </li>
            <li>
              ne pas téléverser de contenu protégé par le droit d&apos;auteur
              dont il ne dispose pas des droits.
            </li>
          </ul>
        </Article>

        <Article number="7" title="Propriété intellectuelle">
          <p>
            Le code, le design, les marques et le logo Velocewealth sont protégés
            par le droit d&apos;auteur et le droit des marques. Toute
            reproduction sans autorisation est interdite.
          </p>
          <p>
            Les données saisies par l&apos;utilisateur (véhicules, dépenses,
            entretiens, photos) restent sa propriété. L&apos;utilisateur concède
            à Velocewealth une licence non exclusive d&apos;hébergement et de
            traitement strictement nécessaire à la fourniture du Service, pour
            la durée du compte.
          </p>
        </Article>

        <Article number="8" title="Limitations de responsabilité">
          <p>
            Velocewealth est tenu à une obligation de moyens. Le Service est
            fourni « tel quel ». Velocewealth ne peut être tenu responsable :
          </p>
          <ul className="list-disc ps-5 space-y-1">
            <li>
              d&apos;une décision prise par l&apos;utilisateur sur la base d&apos;estimations
              (coût/km, indice de revente, alertes prédictives) qui restent
              indicatives ;
            </li>
            <li>
              d&apos;une indisponibilité temporaire du Service due à une
              maintenance, un incident technique ou un cas de force majeure ;
            </li>
            <li>
              d&apos;erreurs ou retards dans l&apos;extraction OCR : les données
              extraites doivent être vérifiées par l&apos;utilisateur avant
              enregistrement.
            </li>
          </ul>
          <p>
            En tout état de cause, la responsabilité de Velocewealth est plafonnée
            au montant total payé par l&apos;utilisateur sur les 12 derniers mois.
          </p>
        </Article>

        <Article number="9" title="Données personnelles">
          <p>
            Le traitement des données est régi par notre{' '}
            <a href="/legal/privacy" className="text-veloce hover:underline">
              politique de confidentialité
            </a>{' '}
            conforme au RGPD (UE 2016/679).
          </p>
        </Article>

        <Article number="10" title="Évolution des CGU">
          <p>
            Velocewealth peut modifier les CGU. Toute évolution substantielle est
            notifiée par email aux utilisateurs au moins 30 jours avant son
            entrée en vigueur. Le refus emporte droit de résiliation immédiate
            sans frais.
          </p>
        </Article>

        <Article number="11" title="Droit applicable et juridiction">
          <p>
            Les présentes CGU sont régies par le droit français. Tout litige sera
            soumis aux tribunaux compétents du ressort du domicile de
            l&apos;utilisateur consommateur, ou des tribunaux de Paris pour les
            utilisateurs professionnels.
          </p>
          <p>
            Avant tout recours juridictionnel, les parties s&apos;efforcent de
            trouver une solution amiable. L&apos;utilisateur consommateur peut
            saisir gratuitement le médiateur de la consommation conformément à
            l&apos;article L.612-1 du Code de la consommation.
          </p>
        </Article>
      </section>
    </main>
  );
}

function Article({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <article>
      <h2 className="font-display text-xl font-semibold mb-3">
        <span className="text-muted-foreground font-mono me-2">{number}.</span>
        {title}
      </h2>
      <div className="space-y-3 text-muted-foreground">{children}</div>
    </article>
  );
}
