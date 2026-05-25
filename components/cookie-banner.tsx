'use client';

import { useEffect, useState, useTransition } from 'react';
import { Cookie, Shield, Lock, Globe } from 'lucide-react';
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/lib/i18n/routing';
import { locales, localeFlags, type Locale } from '@/lib/i18n/routing';
import { updateLocaleAction } from '@/server/actions/profile';
import { cn } from '@/lib/utils';

export const STORAGE_KEY = 'vw-cookie-consent';

const TRANSLATIONS = {
  fr: {
    consent: "CONSENTEMENT",
    title: "Nous respectons votre vie privée et la sécurité de vos données automobiles",
    desc1: "VeloceWealth utilise des cookies essentiels pour assurer le bon fonctionnement de la plateforme (comme la mémorisation de votre session sécurisée).",
    desc2: "Avec votre accord, nous et nos partenaires utilisons également des cookies pour mesurer l'audience du site, optimiser les performances techniques, sécuriser les services de cartographie intégrés et vous proposer des outils d'analyse de reçus ainsi que des services d'entretien de proximité adaptés à votre véhicule. Vous pouvez modifier vos préférences à tout moment.",
    essentialLabel: "Cookies Essentiels (Actifs)",
    partnerLabel: "Analyses & Cartographie",
    refuseBtn: "Refuser / Paramétrer",
    acceptBtn: "Tout accepter",
    dpoLabel: "Pour toute question relative à vos données, contactez notre DPO à"
  },
  en: {
    consent: "CONSENT",
    title: "We respect your privacy and the security of your automotive data",
    desc1: "VeloceWealth uses essential cookies to ensure the proper functioning of the platform (such as remembering your secure session).",
    desc2: "With your consent, we and our partners also use cookies to measure site audience, optimize technical performance, secure integrated mapping services, and offer receipt analysis tools and local maintenance services tailored to your vehicle. You can change your preferences at any time.",
    essentialLabel: "Essential Cookies (Active)",
    partnerLabel: "Analytics & Mapping",
    refuseBtn: "Decline / Customize",
    acceptBtn: "Accept All",
    dpoLabel: "For any questions regarding your data, contact our DPO at"
  },
  es: {
    consent: "CONSENTIMIENTO",
    title: "Respetamos su privacidad y la seguridad de sus datos automotrices",
    desc1: "VeloceWealth utiliza cookies esenciales para garantizar el correcto funcionamiento de la plataforma (como recordar su sesión segura).",
    desc2: "Con su consentimiento, nosotros y nuestros socios también utilizamos cookies para medir la audiencia del sitio, optimizar el rendimiento técnico, asegurar los servicios de mapas integrados y ofrecer herramientas de análisis de recibos y servicios de mantenimiento de proximidad adaptados a su vehículo. Puede cambiar sus preferencias en cualquier momento.",
    essentialLabel: "Cookies Esenciales (Activas)",
    partnerLabel: "Análisis y Mapas",
    refuseBtn: "Rechazar / Personalizar",
    acceptBtn: "Aceptar todo",
    dpoLabel: "Para cualquier pregunta sobre sus datos, contacte a nuestro DPO en"
  },
  ar: {
    consent: "موافقة",
    title: "نحن نحترم خصوصيتك وأمان بيانات سيارتك",
    desc1: "يستخدم VeloceWealth ملفات تعريف الارتباط الأساسية لضمان حسن سير العمل بالمنصة (مثل حفظ جلستك الآمنة).",
    desc2: "بموافقتك، نستخدم نحن وشركاؤنا أيضًا ملفات تعريف الارتباط لقياس جمهور الموقع، وتحسين الأداء الفني، وتأمين خدمات الخرائط المتكاملة، وتقديم أدوات تحليل الإيصالات وخدمات الصيانة القريبة المناسبة لسيارتك. يمكنك تعديل تفضيلاتك في أي وقت.",
    essentialLabel: "ملفات أساسية (نشطة)",
    partnerLabel: "التحليلات والخرائط",
    refuseBtn: "رفض / تخصيص",
    acceptBtn: "قبول الكل",
    dpoLabel: "لأي استفسار بخصوص بياناتك، اتصل بمسؤول حماية البيانات لدينا على"
  },
  pt: {
    consent: "CONSENTIMENTO",
    title: "Respeitamos sua privacidade e a segurança dos seus dados automotivos",
    desc1: "VeloceWealth utiliza cookies essenciais para garantir o funcionamento correto da plataforma (como lembrar de sua sessão segura).",
    desc2: "Com o seu consentimento, nós e nossos parceiros também usamos cookies para medir a audiência do site, otimizar o desempenho técnico, proteger serviços de mapas integrados e oferecer ferramentas de análise de recibos e serviços de manutenção de proximidade adaptados ao seu veículo. Você pode alterar suas preferências a qualquer momento.",
    essentialLabel: "Cookies Essentiais (Ativos)",
    partnerLabel: "Análises e Mapas",
    refuseBtn: "Recusar / Personalizar",
    acceptBtn: "Aceitar todos",
    dpoLabel: "Para qualquer dúvida sobre seus dados, entre em contato com nosso DPO em"
  }
};

export function CookieBanner() {
  const [show, setShow] = useState(false);
  const [mounted, setMounted] = useState(false);
  const currentLocale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  const t = TRANSLATIONS[currentLocale as keyof typeof TRANSLATIONS] || TRANSLATIONS.fr;

  useEffect(() => {
    setMounted(true);
    const consent = localStorage.getItem(STORAGE_KEY);
    if (consent === null) {
      setShow(true);
    }
  }, []);

  if (!mounted || !show) return null;

  const handleLanguageChange = (nextLocale: Locale) => {
    if (nextLocale === currentLocale) return;
    startTransition(async () => {
      await updateLocaleAction(nextLocale);
      router.replace(pathname, { locale: nextLocale });
      router.refresh();
    });
  };

  const handleAccept = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    window.dispatchEvent(new Event('cookie-consent-updated'));
    setShow(false);
  };

  const handleRefuse = () => {
    localStorage.setItem(STORAGE_KEY, 'false');
    window.dispatchEvent(new Event('cookie-consent-updated'));
    setShow(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Locked Backdrop blur - clicking it does nothing, forcing interaction */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md cursor-default transition-opacity duration-500 ease-out animate-in fade-in" />

      {/* Centered Modal Card with rounded-[2rem] and Slate Minimal Pro styling */}
      <div className="relative w-full max-w-lg bg-[#16161A] border border-white/[0.08] rounded-[2rem] p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] flex flex-col gap-5 overflow-hidden animate-in fade-in zoom-in-95 duration-500 ease-out z-10">
        
        {/* Premium background decorative blurs */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#007AFF]/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

        {/* Top Header Row with Title and Language Switcher */}
        <div className="flex items-center justify-between border-b border-white/[0.05] pb-3 z-10">
          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">{t.consent}</span>
          
          {/* Horizontal Language Switcher Row */}
          <div className="flex items-center gap-1 bg-white/[0.02] border border-white/[0.05] p-1 rounded-full">
            {locales.map((l) => {
              const active = currentLocale === l;
              return (
                <button
                  key={l}
                  type="button"
                  disabled={pending}
                  onClick={() => handleLanguageChange(l)}
                  className={cn(
                    "h-6 px-2 rounded-full text-xs font-medium transition-all flex items-center justify-center gap-1 shrink-0",
                    active 
                      ? "bg-[#007AFF]/10 border border-[#007AFF]/25 text-[#007AFF] font-semibold" 
                      : "text-muted-foreground hover:text-white"
                  )}
                >
                  <span className="text-sm">{localeFlags[l]}</span>
                  <span className="hidden xs:inline uppercase text-[9px] font-mono">{l}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Header Icon & Title */}
        <div className="flex flex-col items-center gap-3 text-center z-10">
          <div className="rounded-2xl bg-[#007AFF]/10 border border-[#007AFF]/20 text-[#007AFF] p-3 shadow-[0_0_15px_rgba(0,122,255,0.1)]">
            <Cookie className="h-6 w-6" strokeWidth={1.5} />
          </div>
          <h2 className="font-display font-bold text-lg sm:text-xl text-white tracking-tight leading-snug max-w-md">
            {t.title}
          </h2>
        </div>

        {/* Description Section with generic terms (No Partner Names!) */}
        <div className="space-y-3.5 text-xs sm:text-sm text-muted-foreground leading-relaxed z-10 font-sans">
          <p>{t.desc1}</p>
          <p>{t.desc2}</p>

          {/* Bulleted list of features */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/[0.05]">
            <div className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <Lock className="h-4 w-4 text-[#007AFF] shrink-0" strokeWidth={1.5} />
              <div className="text-[10px] text-white font-medium">{t.essentialLabel}</div>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <Shield className="h-4 w-4 text-[#2ECC71] shrink-0" strokeWidth={1.5} />
              <div className="text-[10px] text-white font-medium">{t.partnerLabel}</div>
            </div>
          </div>
        </div>

        {/* Buttons (Double Choice Equal Size & Aligned Horizontally) */}
        <div className="grid grid-cols-2 gap-4 pt-1.5 z-10">
          <button
            type="button"
            onClick={handleRefuse}
            className="w-full bg-white hover:bg-neutral-100 text-black border border-neutral-300 text-xs sm:text-sm font-semibold py-3 px-4 rounded-full transition-all duration-300 hover:scale-[1.02] flex items-center justify-center shadow-sm"
          >
            {t.refuseBtn}
          </button>
          
          <button
            type="button"
            onClick={handleAccept}
            className="w-full bg-[#1F2937] hover:bg-[#111827] text-white border border-[#374151] text-xs sm:text-sm font-semibold py-3 px-4 rounded-full transition-all duration-300 hover:scale-[1.02] flex items-center justify-center shadow-md shadow-black/35"
          >
            {t.acceptBtn}
          </button>
        </div>

        {/* Tiny DPO mention for GDPR compliance */}
        <div className="text-[10px] text-muted-foreground/60 text-center border-t border-white/5 pt-2.5 leading-relaxed z-10">
          {t.dpoLabel}{' '}
          <a href="mailto:dpo@velocewealth.app" className="text-[#007AFF] hover:underline">
            dpo@velocewealth.app
          </a>
        </div>

      </div>
    </div>
  );
}
