import { HelpCenterContent } from '@/components/help/help-center-content';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function AppHelpCenterPage({ params }: PageProps) {
  const { locale } = await params;
  const currentLocale = locale === 'fr' ? 'fr' : 'en';

  return (
    <div className="container">
      <HelpCenterContent 
        currentLocale={currentLocale} 
        backUrl="/dashboard" 
      />
    </div>
  );
}
