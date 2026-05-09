import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { getLocale } from 'next-intl/server';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/toaster';
import { isRtl } from '@/lib/i18n/routing';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: {
    default: 'Velocewealth — Pilotez votre voiture comme un investissement',
    template: '%s · Velocewealth',
  },
  description:
    'Suivi énergétique hybride, maintenance prédictive et carnet certifié. Transformez votre voiture en patrimoine maîtrisé.',
  keywords: [
    'gestion automobile',
    'coût au kilomètre',
    'TCO',
    'carnet entretien',
    'suivi carburant',
    'voiture électrique',
  ],
  authors: [{ name: 'Velocewealth' }],
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  ),
  openGraph: {
    type: 'website',
    title: 'Velocewealth',
    description: 'Pilotez votre voiture comme un investissement',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FFFFFF' },
    { media: '(prefers-color-scheme: dark)', color: '#121212' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const direction = isRtl(locale) ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={direction} suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrains.variable} font-sans`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
