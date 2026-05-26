'use client';

import React, { useState, useTransition, useEffect, useRef } from 'react';
import { useRouter } from '@/lib/i18n/routing';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Car,
  Compass,
  Navigation,
  Briefcase,
  TrendingUp,
  Cpu,
  Coins,
  BatteryCharging,
  Zap,
  Fuel,
  Search,
  Loader2,
  Check,
  ChevronLeft,
  ChevronRight,
  Sliders,
  Calendar,
  Wallet,
  ShieldCheck,
} from 'lucide-react';
import { LocaleSwitcher } from '@/components/locale-switcher';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input, Label } from '@/components/ui/input';
import { isSupabaseConfigured } from '@/lib/env';
import { saveOnboardingAnswersAction, completeOnboardingAction } from '@/server/actions/profile';
import type { UserProfile, FuelType } from '@/lib/types';

interface OnboardingClientProps {
  initialUser: Partial<UserProfile>;
  locale: string;
}

// ── REGEX CLIENT-SIDE ──
const REGEX_PLATE_FR = /^[A-Z]{2}-?\d{3}-?[A-Z]{2}$/i;
const REGEX_PLATE_UK = /^[A-Z]{2}\d{2}\s?[A-Z]{3}$/i;

const ONBOARDING_TRANSLATIONS: Record<string, any> = {
  fr: {
    welcome: "Bienvenue sur VeloceWealth",
    subWelcome: "Commençons par configurer votre profil d'investisseur en 3 questions rapides.",
    progress: "Étape {current} sur {total}",
    personaQuestion: "Quel type de conducteur êtes-vous ?",
    collectorLabel: "Collectionneur",
    collectorDesc: "Passionné de véhicules de prestige. Souhaite valoriser son capital auto.",
    dailyLabel: "Usage Quotidien",
    dailyDesc: "Trajets réguliers ou quotidiens. Objectif : optimiser le coût au kilomètre (TCO).",
    fleetLabel: "Gestionnaire de Flotte",
    fleetDesc: "Gestion de véhicules professionnels. Objectif : rentabilité globale et fiscalité.",
    
    objectiveQuestion: "Quel est votre objectif financier prioritaire ?",
    tcoLabel: "Optimiser mon TCO",
    tcoDesc: "Suivi chirurgical du coût/km, réduction des dépenses énergétiques.",
    phmLabel: "Entretien Prédictif (IA)",
    phmDesc: "Anticiper les pannes et programmer les révisions selon l'usure calculée.",
    resaleLabel: "Valoriser à la revente",
    resaleDesc: "Maximiser la valeur résiduelle avec un carnet numérique certifié.",
    
    motorizationQuestion: "Quelle motorisation équipe votre véhicule ?",
    hybridLabel: "Hybride",
    hybridDesc: "Optimisation de l'éco-performance pour double motorisation thermique/électrique.",
    electricLabel: "Électrique",
    electricDesc: "Suivi des cycles de recharge, usure batterie et économies vs thermique.",
    thermalLabel: "Thermique",
    thermalDesc: "Suivi classique Essence, Diesel, GPL ou Superéthanol E85.",

    vehicleSetupTitle: "Votre premier véhicule",
    vehicleSetupSubtitle: "Saisissez sa plaque d'immatriculation pour l'identifier automatiquement.",
    plateLabel: "Plaque d'immatriculation",
    platePlaceholder: "AA-123-AA",
    mileageLabel: "Kilométrage actuel",
    mileagePlaceholder: "42000",
    identifying: "Identification en cours...",
    identifiedSuccess: "{make} {model} identifié avec succès !",
    optional: "Optionnel",
    vinLabel: "Code VIN (17 caractères)",
    vinPlaceholder: "Entrez le VIN si la plaque échoue",
    customizeInfo: "Personnaliser les informations (Marque, Modèle, Finances...)",
    makeLabel: "Marque",
    modelLabel: "Modèle",
    yearLabel: "Année de mise en circulation",
    fuelTypeLabel: "Motorisation",
    purchaseDateLabel: "Date d'achat",
    purchasePriceLabel: "Prix d'achat",
    insuranceProviderLabel: "Assureur",
    insuranceMonthlyLabel: "Cotisation mensuelle",
    loading: "Finalisation en cours...",
    completeBtn: "Valider et démarrer",
    skipDemo: "Utiliser un véhicule de démonstration",
    invalidPlate: "Format de plaque invalide (ex: AA-123-AA)",
    errorSaving: "Une erreur est survenue lors de la sauvegarde.",
    step1Title: "Profil & Personnalité",
    step2Title: "Objectifs Financiers",
    step3Title: "Motorisation",
    step4Title: "Enregistrement Auto",
  },
  en: {
    welcome: "Welcome to VeloceWealth",
    subWelcome: "Let's configure your investor profile in 3 quick questions.",
    progress: "Step {current} of {total}",
    personaQuestion: "What type of driver are you?",
    collectorLabel: "Collector",
    collectorDesc: "Prestige or historic vehicle enthusiast. Focused on asset valuation.",
    dailyLabel: "Daily Driver",
    dailyDesc: "Daily commutes or regular drives. Goal: optimize cost per kilometer (TCO).",
    fleetLabel: "Fleet Manager",
    fleetDesc: "Managing multiple company vehicles. Goal: profit and tax optimization.",
    
    objectiveQuestion: "What is your primary financial goal?",
    tcoLabel: "Optimize my TCO",
    tcoDesc: "Precise tracking of cost/km, energy cost reduction.",
    phmLabel: "Predictive Maintenance (AI)",
    phmDesc: "Anticipate breakdowns and schedule service based on calculated wear.",
    resaleLabel: "Maximize Resale Value",
    resaleDesc: "Protect residual value with a certified digital logbook.",
    
    motorizationQuestion: "What engine type equips your vehicle?",
    hybridLabel: "Hybrid",
    hybridDesc: "Eco-performance optimization for dual combustion/electric engines.",
    electricLabel: "Electric",
    electricDesc: "Track charging cycles, battery degradation, and savings vs gas.",
    thermalLabel: "Thermal",
    thermalDesc: "Traditional Petrol, Diesel, LPG, or Superethanol E85 tracking.",

    vehicleSetupTitle: "Your first vehicle",
    vehicleSetupSubtitle: "Enter its license plate number to identify it automatically.",
    plateLabel: "License Plate",
    platePlaceholder: "AA-123-AA",
    mileageLabel: "Current Mileage (km)",
    mileagePlaceholder: "42000",
    identifying: "Identifying vehicle...",
    identifiedSuccess: "{make} {model} successfully identified!",
    optional: "Optional",
    vinLabel: "VIN Code (17 characters)",
    vinPlaceholder: "Enter VIN if plate lookup fails",
    customizeInfo: "Customize information manually (Make, Model, Engine...)",
    makeLabel: "Make",
    modelLabel: "Model",
    yearLabel: "Year of registration",
    fuelTypeLabel: "Engine Type",
    purchaseDateLabel: "Purchase Date",
    purchasePriceLabel: "Purchase Price",
    insuranceProviderLabel: "Insurer",
    insuranceMonthlyLabel: "Monthly Premium",
    loading: "Completing profile...",
    completeBtn: "Validate & Launch",
    skipDemo: "Use a demonstration vehicle",
    invalidPlate: "Invalid plate format (ex: AA-123-AA)",
    errorSaving: "An error occurred during saving.",
    step1Title: "Profile & Personality",
    step2Title: "Financial Goals",
    step3Title: "Motorization",
    step4Title: "Vehicle Registration",
  },
  es: {
    welcome: "Bienvenido a VeloceWealth",
    subWelcome: "Configuremos su perfil de inversor en 3 preguntas rápidas.",
    progress: "Paso {current} de {total}",
    personaQuestion: "¿Qué tipo de conductor es usted?",
    collectorLabel: "Coleccionista",
    collectorDesc: "Apasionado de los vehículos de prestigio o históricos. Desea valorizar su capital.",
    dailyLabel: "Uso Diario",
    dailyDesc: "Trayectos habituales o diarios. Objetivo: optimizar el coste por kilómetro (TCO).",
    fleetLabel: "Gestor de Flota",
    fleetDesc: "Gestión de varios vehículos profesionales. Objetivo: rentabilidad y fiscalidad.",
    
    objectiveQuestion: "¿Cuál es su prioridad financiera?",
    tcoLabel: "Optimizar mi TCO",
    tcoDesc: "Seguimiento riguroso del coste/km, reducción del consumo de energía.",
    phmLabel: "Mantenimiento Predictivo (IA)",
    phmDesc: "Anticipar averías y programar revisiones según el desgaste calculado.",
    resaleLabel: "Maximizar valor de reventa",
    resaleDesc: "Aumentar el precio de venta con un libro de mantenimiento digital certificado.",
    
    motorizationQuestion: "¿Qué motorización equipa su vehículo?",
    hybridLabel: "Híbrido",
    hybridDesc: "Optimización eco-rendimiento para doble motor térmico y eléctrico.",
    electricLabel: "Eléctrico",
    electricDesc: "Control de ciclos de carga, degradación de batería y ahorro frente a gasolina.",
    thermalLabel: "Térmico",
    thermalDesc: "Seguimiento clásico de Gasolina, Diésel, GLP o Superetanol E85.",

    vehicleSetupTitle: "Su primer vehículo",
    vehicleSetupSubtitle: "Identifíquelo al instante a través de su matrícula.",
    plateLabel: "Matrícula",
    platePlaceholder: "AA-123-AA",
    mileageLabel: "Kilometraje actual",
    mileagePlaceholder: "42000",
    identifying: "Identificando vehículo...",
    identifiedSuccess: "¡{make} {model} identificado con éxito!",
    optional: "Opcional",
    vinLabel: "Código VIN (17 caracteres)",
    vinPlaceholder: "Introduzca el VIN si falla la matrícula",
    customizeInfo: "Personalizar manualmente (Marca, Modelo, Energía...)",
    makeLabel: "Marca",
    modelLabel: "Modelo",
    yearLabel: "Año de matriculación",
    fuelTypeLabel: "Motorización",
    purchaseDateLabel: "Fecha de compra",
    purchasePriceLabel: "Precio de compra",
    insuranceProviderLabel: "Aseguradora",
    insuranceMonthlyLabel: "Prima mensual",
    loading: "Completando perfil...",
    completeBtn: "Validar y comenzar",
    skipDemo: "Usar un vehículo de demostración",
    invalidPlate: "Formato de matrícula no válido. Ejemplo: AA-123-AA",
    errorSaving: "Ocurrió un error al guardar.",
    step1Title: "Perfil y Personalidad",
    step2Title: "Objetivos Financieros",
    step3Title: "Motorización",
    step4Title: "Registro de Vehículo",
  },
  ar: {
    welcome: "مرحباً بك في VeloceWealth",
    subWelcome: "دعنا نحدد ملفك الاستثماري في 3 أسئلة سريعة.",
    progress: "الخطوة {current} من {total}",
    personaQuestion: "أي نوع من السائقين أنت؟",
    collectorLabel: "جامع سيارات",
    collectorDesc: "شغوف بالسيارات الفاخرة أو التاريخية. يركز على زيادة قيمة الأصول.",
    dailyLabel: "سائق يومي",
    dailyDesc: "التنقلات اليومية أو المنتظمة. الهدف: تحسين التكلفة لكل كيلومتر (TCO).",
    fleetLabel: "مدير أسطول",
    fleetDesc: "إدارة مركبات الشركة المتعددة. الهدف: تحسين الأرباح والضرائب.",
    
    objectiveQuestion: "ما هو هدفك المالي الرئيسي؟",
    tcoLabel: "تحسين التكلفة الإجمالية (TCO)",
    tcoDesc: "تتبع دقيق للغاية للتكلفة لكل كيلومتر وتقليل تكاليف الطاقة.",
    phmLabel: "الصيانة التنبؤية (الذكاء الاصطناعي)",
    phmDesc: "توقع الأعطال وجدولة الخدمة بناءً على التآكل المحسوب.",
    resaleLabel: "زيادة قيمة إعادة البيع",
    resaleDesc: "حماية القيمة المتبقية بسجل صيانة رقمي معتمد.",
    
    motorizationQuestion: "ما هو نوع محرك مركبتك؟",
    hybridLabel: "هجين",
    hybridDesc: "تحسين الأداء البيئي للمحركات المزدوجة (وقود وكهرباء).",
    electricLabel: "كهربائي",
    electricDesc: "تتبع دورات الشحن وتدهور البطارية والوفر مقارنة بالوقود.",
    thermalLabel: "حراري",
    thermalDesc: "تتبع تقليدي للبنزين، الديزل، الغاز المسال، أو الإيثانول E85.",

    vehicleSetupTitle: "مركبتك الأولى",
    vehicleSetupSubtitle: "تعرف عليها فوراً باستخدام رقم لوحة الترخيص.",
    plateLabel: "رقم اللوحة",
    platePlaceholder: "AA-123-AA",
    mileageLabel: "المسافة الحالية (كم)",
    mileagePlaceholder: "42000",
    identifying: "جاري التعرف على المركبة...",
    identifiedSuccess: "تم التعرف على {make} {model} بنجاح!",
    optional: "اختياري",
    vinLabel: "رمز VIN (17 حرفاً)",
    vinPlaceholder: "أدخل رمز VIN إذا فشل البحث باللوحة",
    customizeInfo: "تخصيص يدوي (الماركة، الموديل، المحرك...)",
    makeLabel: "الماركة",
    modelLabel: "الموديل",
    yearLabel: "سنة الصنع",
    fuelTypeLabel: "نوع المحرك",
    purchaseDateLabel: "تاريخ الشراء",
    purchasePriceLabel: "سعر الشراء",
    insuranceProviderLabel: "شركة التأمين",
    insuranceMonthlyLabel: "القسط الشهري",
    loading: "جاري استكمال الملف الشخصي...",
    completeBtn: "تأكيد والبدء",
    skipDemo: "استخدام مركبة تجريبية",
    invalidPlate: "تنسيق اللوحة غير صالح. مثال: AA-123-AA",
    errorSaving: "حدث خطأ أثناء الحفظ.",
    step1Title: "الملف الشخصي والشخصية",
    step2Title: "الأهداف المالية",
    step3Title: "نوع المحرك",
    step4Title: "تسجيل المركبة",
  },
  pt: {
    welcome: "Bem-vindo ao VeloceWealth",
    subWelcome: "Vamos configurar seu perfil de investidor em 3 perguntas rápidas.",
    progress: "Passo {current} de {total}",
    personaQuestion: "Que tipo de condutor você é?",
    collectorLabel: "Colecionador",
    collectorDesc: "Apaixonado por veículos de prestígio ou históricos. Focado na valorização de ativos.",
    dailyLabel: "Condutor Diário",
    dailyDesc: "Trajetos regulares ou diários. Objetivo: otimizar o custo por quilômetro (TCO).",
    fleetLabel: "Gestor de Frota",
    fleetDesc: "Gestão de múltiplos veículos comerciais. Objetivo: rentabilidade e otimização fiscal.",
    
    objectiveQuestion: "Qual é o seu principal objetivo financeiro?",
    tcoLabel: "Otimizar meu TCO",
    tcoDesc: "Acompanhamento rigoroso do custo/km, redução das despesas de energia.",
    phmLabel: "Manutenção Preditiva (IA)",
    phmDesc: "Antecipar avarias e programar revisões com base no desgaste calculado.",
    resaleLabel: "Maximizar valor de revenda",
    resaleDesc: "Maximizar o preço de revenda com um livro de bordo digital certificado.",
    
    motorizationQuestion: "Que motorização equipa o seu veículo?",
    hybridLabel: "Híbrido",
    hybridDesc: "Otimização de eco-performance para motores duplos de combustão/elétricos.",
    electricLabel: "Elétrico",
    electricDesc: "Controle de ciclos de carga, degradação da bateria e economia vs combustível.",
    thermalLabel: "Térmico",
    thermalDesc: "Acompanhamento tradicional de Gasolina, Diesel, GPL ou Superetanol E85.",

    vehicleSetupTitle: "Seu primeiro veículo",
    vehicleSetupSubtitle: "Identifique-o instantaneamente através da sua matrícula.",
    plateLabel: "Matrícula",
    platePlaceholder: "AA-123-AA",
    mileageLabel: "Quilometragem atual",
    mileagePlaceholder: "42000",
    identifying: "Identificando veículo...",
    identifiedSuccess: "{make} {model} identificado com sucesso!",
    optional: "Opcional",
    vinLabel: "Código VIN (17 caracteres)",
    vinPlaceholder: "Insira o VIN se a matrícula falhar",
    customizeInfo: "Personalizar manualmente (Marca, Modelo, Energia...)",
    makeLabel: "Marca",
    modelLabel: "Modelo",
    yearLabel: "Ano de matrícula",
    fuelTypeLabel: "Motorização",
    purchaseDateLabel: "Data de compra",
    purchasePriceLabel: "Preço de compra",
    insuranceProviderLabel: "Seguradora",
    insuranceMonthlyLabel: "Mensalidade do seguro",
    loading: "Concluindo perfil...",
    completeBtn: "Validar e começar",
    skipDemo: "Usar um veículo de demonstração",
    invalidPlate: "Formato de matrícula inválido. Exemplo: AA-123-AA",
    errorSaving: "Ocorreu um erro ao guardar.",
    step1Title: "Perfil e Personalidade",
    step2Title: "Objetivos Financistas",
    step3Title: "Motorização",
    step4Title: "Registo do Veículo",
  }
};

type Persona = 'collector' | 'daily' | 'fleet';
type Objective = 'tco' | 'phm' | 'resale';
type Motorization = 'hybrid' | 'electric' | 'thermal';

export default function OnboardingClient({ initialUser, locale }: OnboardingClientProps) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [pending, startTransition] = useTransition();

  // Answers state
  const [persona, setPersona] = useState<Persona | null>(null);
  const [objective, setObjective] = useState<Objective | null>(null);
  const [motorization, setMotorization] = useState<Motorization | null>(null);

  // Animation selected highlights
  const [selectedAnim, setSelectedAnim] = useState<string | null>(null);

  // Vehicle form state
  const [plate, setPlate] = useState('');
  const [mileage, setMileage] = useState('');
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Manual vehicle inputs
  const [make, setMake] = useState('Peugeot');
  const [model, setModel] = useState('3008');
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [vin, setVin] = useState('');
  const [fuelType, setFuelType] = useState<FuelType>('hybrid');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [purchasePrice, setPurchasePrice] = useState('15000');
  const [insuranceProvider, setInsuranceProvider] = useState('');
  const [insuranceMonthly, setInsuranceMonthly] = useState('');

  const t = ONBOARDING_TRANSLATIONS[locale] || ONBOARDING_TRANSLATIONS.fr;
  const isRtl = locale === 'ar';

  // 1. Save QCM answers once Step 3 is selected
  const handleSaveAnswers = (
    chosenPersona: Persona,
    chosenObjective: Objective,
    chosenMotorization: Motorization
  ) => {
    startTransition(async () => {
      try {
        const res = await saveOnboardingAnswersAction({
          onboardingPersona: chosenPersona,
          onboardingObjective: chosenObjective,
          onboardingMotorization: chosenMotorization,
        });
        if (res.error) {
          console.error('Failed to save onboarding answers:', res.error);
        }
      } catch (err) {
        console.error('Onboarding answers network error:', err);
      }
    });
  };

  // 2. Click option with micro-animation of 300ms
  const handleSelectOption = (type: 'persona' | 'objective' | 'motorization', val: string) => {
    setSelectedAnim(val);
    
    setTimeout(() => {
      setSelectedAnim(null);
      if (type === 'persona') {
        setPersona(val as Persona);
        setDirection(1);
        setStep(1);
      } else if (type === 'objective') {
        setObjective(val as Objective);
        setDirection(1);
        setStep(2);
      } else if (type === 'motorization') {
        setMotorization(val as Motorization);
        // Zero-click transition straight to vehicle registration (Step 3)
        handleSaveAnswers(persona!, objective!, val as Motorization);
        setDirection(1);
        setStep(3);
      }
    }, 300);
  };

  // 3. Smart vehicle plate/VIN lookup
  const handleLookup = async (lookupVal: string) => {
    const cleaned = lookupVal.toUpperCase().replace(/\s/g, '').replace(/-/g, '');
    if (!cleaned || cleaned.length < 4) return;

    setIsLookingUp(true);
    try {
      if (!isSupabaseConfigured()) {
        // Pre-prod fallback: simulate a premium auto-lookup with a high-tech laser effect
        await new Promise((resolve) => setTimeout(resolve, 1500));
        let mockMake = 'Peugeot';
        let mockModel = '3008';
        let mockYear = 2022;
        let mockFuel: FuelType = 'hybrid';

        if (persona === 'collector') {
          mockMake = motorization === 'thermal' ? 'Porsche' : 'BMW';
          mockModel = motorization === 'thermal' ? '911 Carrera' : 'i8';
          mockYear = 2021;
          mockFuel = motorization === 'thermal' ? 'thermal' : 'hybrid';
        } else if (motorization === 'electric') {
          mockMake = 'Tesla';
          mockModel = persona === 'fleet' ? 'Model Y' : 'Model 3';
          mockYear = 2023;
          mockFuel = 'electric';
        }

        setMake(mockMake);
        setModel(mockModel);
        setYear(mockYear);
        setFuelType(mockFuel);
        
        toast.success(t.identifiedSuccess.replace('{make}', mockMake).replace('{model}', mockModel), {
          description: 'Source : SIV France (Simulé - pré-prod)',
        });
        return;
      }

      // Supabase is configured: fetch API
      const param = `plate=${encodeURIComponent(cleaned)}`;
      const res = await fetch(`/api/vehicles/lookup?${param}`);
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        if (errorData.fallback === 'manual-entry') {
          toast.warning("Véhicule non reconnu. Veuillez renseigner les détails manuellement.");
          setShowAdvanced(true);
        } else {
          toast.error(errorData.error || "Recherche échouée.");
        }
        return;
      }

      const data = await res.json();
      if (data.make) setMake(data.make);
      if (data.model) setModel(data.model);
      if (data.year) setYear(data.year);
      if (data.trim) setModel((prev) => `${prev} ${data.trim}`);
      if (data.vin) setVin(data.vin);
      if (data.fuel_type) setFuelType(data.fuel_type as FuelType);

      toast.success(t.identifiedSuccess.replace('{make}', data.make).replace('{model}', data.model), {
        description: data.source ? `Source : ${data.source.toUpperCase()}` : undefined,
      });
    } catch (err) {
      console.error('Vehicle lookup error:', err);
    } finally {
      setIsLookingUp(false);
    }
  };

  // 4. Submit vehicle setup & finish onboarding
  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!plate) {
      toast.error("Veuillez saisir votre plaque d'immatriculation.");
      return;
    }
    if (!mileage || Number(mileage) <= 0) {
      toast.error("Veuillez indiquer un kilométrage valide.");
      return;
    }

    startTransition(async () => {
      try {
        const payload = {
          make,
          model,
          year: Number(year),
          vin: vin || undefined,
          plate: plate.toUpperCase(),
          fuelType,
          currentMileageKm: Number(mileage),
        };

        const res = await completeOnboardingAction(payload);
        if (res.error) {
          toast.error(res.error);
          return;
        }

        // Mock mode local save
        if (!isSupabaseConfigured()) {
          localStorage.setItem('onboarding_completed', 'true');
          localStorage.setItem('onboarding_persona', persona || 'daily');
          localStorage.setItem('onboarding_objective', objective || 'tco');
          localStorage.setItem('onboarding_motorization', motorization || 'hybrid');
        }

        toast.success("Profil et premier véhicule configurés avec succès !");
        
        // Final victorious redirect
        router.push('/dashboard');
        router.refresh();
      } catch (err) {
        toast.error(t.errorSaving);
      }
    });
  };

  // 5. Use Demo/Mock vehicle based on choices
  const handleSkipToDemo = () => {
    startTransition(async () => {
      try {
        let mockMake = 'Peugeot';
        let mockModel = '3008';
        let mockYear = 2022;
        let mockFuel: FuelType = 'hybrid';

        if (persona === 'collector') {
          mockMake = motorization === 'thermal' ? 'Porsche' : 'BMW';
          mockModel = motorization === 'thermal' ? '911 Carrera' : 'i8';
          mockYear = 2021;
          mockFuel = motorization === 'thermal' ? 'thermal' : 'hybrid';
        } else if (motorization === 'electric') {
          mockMake = 'Tesla';
          mockModel = persona === 'fleet' ? 'Model Y' : 'Model 3';
          mockYear = 2023;
          mockFuel = 'electric';
        }

        const payload = {
          make: mockMake,
          model: mockModel,
          year: mockYear,
          vin: 'WVWZZZ3CZWE' + Math.floor(100000 + Math.random() * 900000),
          plate: 'VW-888-VW',
          fuelType: mockFuel,
          currentMileageKm: 12500,
        };

        const res = await completeOnboardingAction(payload);
        if (res.error) {
          toast.error(res.error);
          return;
        }

        if (!isSupabaseConfigured()) {
          localStorage.setItem('onboarding_completed', 'true');
        }

        toast.success("Mode Démo activé. Bienvenue à bord !");
        router.push('/dashboard');
        router.refresh();
      } catch (err) {
        toast.error(t.errorSaving);
      }
    });
  };

  // Animation configuration for sliding carrousel
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
      },
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 300 : -300,
      opacity: 0,
      scale: 0.95,
      transition: {
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
      },
    }),
  };

  const getStepProgress = () => {
    return ((step + 1) / 4) * 100;
  };

  const getStepTitle = () => {
    switch (step) {
      case 0:
        return t.step1Title;
      case 1:
        return t.step2Title;
      case 2:
        return t.step3Title;
      case 3:
        return t.step4Title;
      default:
        return "";
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0D0D12] text-white flex flex-col justify-between overflow-x-hidden select-none">
      
      {/* ── UNIFIED MINIMALIST TOP NAV ── */}
      <header className="w-full sticky top-0 left-0 right-0 z-50 bg-[#0D0D12]/80 backdrop-blur-xl border-b border-white/[0.02] px-6 py-4">
        <div className="max-w-xl mx-auto space-y-3">
          
          {/* Top Row: step details and language switch */}
          <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
            <span className="font-semibold text-white tracking-wide uppercase">
              {getStepTitle()}
            </span>
            <div className="flex items-center gap-3">
              <span>{t.progress.replace('{current}', String(step + 1)).replace('{total}', '4')}</span>
              <div className="h-4 w-px bg-white/10" />
              <LocaleSwitcher variant="compact" />
            </div>
          </div>

          {/* Bottom Row: progress line */}
          <div className="bg-white/[0.04] h-1 rounded-full overflow-hidden border border-white/[0.01]">
            <motion.div
              className="h-full bg-gradient-veloce rounded-full shadow-glow-veloce"
              initial={{ width: 0 }}
              animate={{ width: `${getStepProgress()}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>
        </div>
      </header>

      {/* ── MAIN IMMERSIVE CONTENT AREA ── */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 z-40 relative">
        
        {/* Subtle backdrop glowing orb to emulate premium UI */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-veloce/5 blur-[120px] pointer-events-none" />

        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait" custom={direction}>
            {step === 0 && (
              <motion.div
                key="step-persona"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="space-y-6"
              >
                <div className="text-center space-y-2">
                  <h1 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                    {t.personaQuestion}
                  </h1>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    {t.subWelcome}
                  </p>
                </div>

                <div className="grid gap-4 mt-6">
                  {[
                    { key: 'collector', label: t.collectorLabel, desc: t.collectorDesc, icon: Compass },
                    { key: 'daily', label: t.dailyLabel, desc: t.dailyDesc, icon: Navigation },
                    { key: 'fleet', label: t.fleetLabel, desc: t.fleetDesc, icon: Briefcase },
                  ].map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = selectedAnim === opt.key;
                    return (
                      <button
                        key={opt.key}
                        onClick={() => handleSelectOption('persona', opt.key)}
                        disabled={pending}
                        className={`w-full text-left p-6 rounded-[1.8rem] border backdrop-blur-xl transition-all duration-300 flex items-start gap-4 ${
                          isSelected
                            ? 'border-veloce bg-veloce/10 text-white shadow-glow-veloce scale-[1.02]'
                            : 'border-white/[0.08] bg-[#1C1C24]/40 hover:bg-[#1C1C24]/80 text-muted-foreground hover:text-white'
                        }`}
                      >
                        <div className={`p-3.5 rounded-2xl flex items-center justify-center transition-colors ${
                          isSelected ? 'bg-veloce text-white' : 'bg-white/[0.04] text-muted-foreground group-hover:text-white'
                        }`}>
                          <Icon className="h-6 w-6" strokeWidth={1.5} />
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-display font-semibold text-lg text-white">
                            {opt.label}
                          </h3>
                          <p className="text-xs leading-relaxed text-muted-foreground">
                            {opt.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="step-objective"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="space-y-6"
              >
                <div className="flex items-center gap-2 -ml-2 mb-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setDirection(-1);
                      setStep(0);
                    }}
                    className="text-xs text-muted-foreground hover:text-white"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" /> {locale === 'ar' ? 'السابق' : 'Retour'}
                  </Button>
                </div>

                <div className="text-center space-y-2">
                  <h1 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                    {t.objectiveQuestion}
                  </h1>
                </div>

                <div className="grid gap-4 mt-6">
                  {[
                    { key: 'tco', label: t.tcoLabel, desc: t.tcoDesc, icon: TrendingUp },
                    { key: 'phm', label: t.phmLabel, desc: t.phmDesc, icon: Cpu },
                    { key: 'resale', label: t.resaleLabel, desc: t.resaleDesc, icon: Coins },
                  ].map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = selectedAnim === opt.key;
                    return (
                      <button
                        key={opt.key}
                        onClick={() => handleSelectOption('objective', opt.key)}
                        disabled={pending}
                        className={`w-full text-left p-6 rounded-[1.8rem] border backdrop-blur-xl transition-all duration-300 flex items-start gap-4 ${
                          isSelected
                            ? 'border-veloce bg-veloce/10 text-white shadow-glow-veloce scale-[1.02]'
                            : 'border-white/[0.08] bg-[#1C1C24]/40 hover:bg-[#1C1C24]/80 text-muted-foreground hover:text-white'
                        }`}
                      >
                        <div className={`p-3.5 rounded-2xl flex items-center justify-center transition-colors ${
                          isSelected ? 'bg-veloce text-white' : 'bg-white/[0.04] text-muted-foreground group-hover:text-white'
                        }`}>
                          <Icon className="h-6 w-6" strokeWidth={1.5} />
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-display font-semibold text-lg text-white">
                            {opt.label}
                          </h3>
                          <p className="text-xs leading-relaxed text-muted-foreground">
                            {opt.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step-motorization"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="space-y-6"
              >
                <div className="flex items-center gap-2 -ml-2 mb-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setDirection(-1);
                      setStep(1);
                    }}
                    className="text-xs text-muted-foreground hover:text-white"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" /> {locale === 'ar' ? 'السابق' : 'Retour'}
                  </Button>
                </div>

                <div className="text-center space-y-2">
                  <h1 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                    {t.motorizationQuestion}
                  </h1>
                </div>

                <div className="grid gap-4 mt-6">
                  {[
                    { key: 'hybrid', label: t.hybridLabel, desc: t.hybridDesc, icon: BatteryCharging },
                    { key: 'electric', label: t.electricLabel, desc: t.electricDesc, icon: Zap },
                    { key: 'thermal', label: t.thermalLabel, desc: t.thermalDesc, icon: Fuel },
                  ].map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = selectedAnim === opt.key;
                    return (
                      <button
                        key={opt.key}
                        onClick={() => handleSelectOption('motorization', opt.key)}
                        disabled={pending}
                        className={`w-full text-left p-6 rounded-[1.8rem] border backdrop-blur-xl transition-all duration-300 flex items-start gap-4 ${
                          isSelected
                            ? 'border-veloce bg-veloce/10 text-white shadow-glow-veloce scale-[1.02]'
                            : 'border-white/[0.08] bg-[#1C1C24]/40 hover:bg-[#1C1C24]/80 text-muted-foreground hover:text-white'
                        }`}
                      >
                        <div className={`p-3.5 rounded-2xl flex items-center justify-center transition-colors ${
                          isSelected ? 'bg-veloce text-white' : 'bg-white/[0.04] text-muted-foreground group-hover:text-white'
                        }`}>
                          <Icon className="h-6 w-6" strokeWidth={1.5} />
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-display font-semibold text-lg text-white">
                            {opt.label}
                          </h3>
                          <p className="text-xs leading-relaxed text-muted-foreground">
                            {opt.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step-vehicle-setup"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="space-y-6 max-w-xl mx-auto"
              >
                <div className="text-center space-y-2">
                  <h1 className="font-display text-3xl font-extrabold tracking-tight text-white uppercase">
                    {t.vehicleSetupTitle}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {t.vehicleSetupSubtitle}
                  </p>
                </div>

                <form onSubmit={handleFinalSubmit} className="space-y-4">
                  {/* License plate styling and current mileage */}
                  <Card className="p-6 space-y-5 border-veloce bg-veloce/5 shadow-glow-veloce relative overflow-hidden rounded-[2.2rem]">
                    
                    {/* Laser scanning line overlay */}
                    {isLookingUp && (
                      <div className="absolute inset-0 pointer-events-none z-10">
                        <div className="w-full h-1 bg-gradient-to-r from-transparent via-[#007AFF] to-transparent animate-laser-sweep" />
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-[#007AFF] tracking-widest uppercase">
                        SIV Protocol
                      </span>
                      {isLookingUp ? (
                        <div className="text-xs text-veloce flex items-center gap-1.5 font-mono">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" /> {t.identifying}
                        </div>
                      ) : (
                        <div className="text-xs text-muted-foreground flex items-center gap-1 font-mono">
                          <ShieldCheck className="h-3.5 w-3.5" /> Securisé
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      {/* License Plate Field */}
                      <div className="space-y-1.5">
                        <Label htmlFor="plateOnboard" className="font-semibold text-sm text-white">
                          {t.plateLabel}
                        </Label>
                        <div className="relative">
                          <Input
                            id="plateOnboard"
                            name="plate"
                            value={plate}
                            onChange={(e) => {
                              setPlate(e.target.value);
                              // Trigger auto lookup on 6+ characters for French plates or DVLA UK format
                              if (e.target.value.length >= 7) {
                                handleLookup(e.target.value);
                              }
                            }}
                            onBlur={(e) => handleLookup(e.target.value)}
                            placeholder={t.platePlaceholder}
                            className="font-mono pl-10 text-lg uppercase tracking-widest bg-black/40 border-white/[0.08] focus:border-veloce rounded-xl"
                            required
                          />
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>

                      {/* Current Mileage Field */}
                      <div className="space-y-1.5">
                        <Label htmlFor="mileageOnboard" className="font-semibold text-sm text-white">
                          {t.mileageLabel}
                        </Label>
                        <Input
                          id="mileageOnboard"
                          name="currentMileageKm"
                          type="number"
                          value={mileage}
                          onChange={(e) => setMileage(e.target.value)}
                          placeholder={t.mileagePlaceholder}
                          className="font-mono text-lg bg-black/40 border-white/[0.08] focus:border-veloce rounded-xl"
                          required
                        />
                      </div>
                    </div>
                  </Card>

                  {/* ── EXPANDABLE DETAILED OPTIONS ── */}
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="w-full flex items-center justify-between p-3.5 rounded-xl border border-white/[0.04] bg-[#2D2D2D]/20 hover:bg-[#2D2D2D]/40 text-xs font-semibold text-muted-foreground transition-all"
                  >
                    <span className="flex items-center gap-2">
                      <Sliders className="h-3.5 w-3.5 text-[#C5A059]" />
                      {t.customizeInfo}
                    </span>
                  </button>

                  <AnimatePresence>
                    {showAdvanced && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden space-y-4"
                      >
                        <Card className="p-6 bg-black/30 border-white/[0.06] rounded-[1.8rem] space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <Label className="text-xs">{t.makeLabel}</Label>
                              <Input
                                value={make}
                                onChange={(e) => setMake(e.target.value)}
                                className="bg-black/20 border-white/[0.08]"
                                required
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">{t.modelLabel}</Label>
                              <Input
                                value={model}
                                onChange={(e) => setModel(e.target.value)}
                                className="bg-black/20 border-white/[0.08]"
                                required
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">{t.yearLabel}</Label>
                              <Input
                                type="number"
                                value={year}
                                onChange={(e) => setYear(Number(e.target.value))}
                                className="bg-black/20 border-white/[0.08]"
                                required
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">{t.fuelTypeLabel}</Label>
                              <select
                                value={fuelType}
                                onChange={(e) => setFuelType(e.target.value as FuelType)}
                                className="w-full rounded-btn border border-white/[0.08] bg-black/60 px-3 py-1.5 text-sm"
                              >
                                <option value="thermal">Thermique</option>
                                <option value="electric">Électrique</option>
                                <option value="hybrid">Hybride</option>
                              </select>
                            </div>
                            <div className="space-y-1 col-span-2">
                              <Label className="text-xs">VIN</Label>
                              <Input
                                value={vin}
                                onChange={(e) => setVin(e.target.value.toUpperCase())}
                                placeholder="17 caractères"
                                maxLength={17}
                                className="bg-black/20 border-white/[0.08] font-mono"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">{t.purchasePriceLabel}</Label>
                              <Input
                                type="number"
                                value={purchasePrice}
                                onChange={(e) => setPurchasePrice(e.target.value)}
                                className="bg-black/20 border-white/[0.08] font-mono"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">{t.purchaseDateLabel}</Label>
                              <Input
                                type="date"
                                value={purchaseDate}
                                onChange={(e) => setPurchaseDate(e.target.value)}
                                className="bg-black/20 border-white/[0.08] font-mono"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">{t.insuranceProviderLabel}</Label>
                              <Input
                                value={insuranceProvider}
                                onChange={(e) => setInsuranceProvider(e.target.value)}
                                placeholder="AXA"
                                className="bg-black/20 border-white/[0.08]"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">{t.insuranceMonthlyLabel}</Label>
                              <Input
                                type="number"
                                value={insuranceMonthly}
                                onChange={(e) => setInsuranceMonthly(e.target.value)}
                                placeholder="80"
                                className="bg-black/20 border-white/[0.08] font-mono"
                              />
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex flex-col gap-3 pt-4">
                    <Button
                      type="submit"
                      disabled={pending}
                      className="w-full py-6 bg-[#007AFF] hover:bg-[#007AFF]/90 rounded-full font-bold text-white shadow-glow-veloce flex items-center justify-center gap-2 text-base transition-all duration-300"
                    >
                      {pending ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" /> {t.loading}
                        </>
                      ) : (
                        <>
                          {t.completeBtn} <ChevronRight className="h-5 w-5" />
                        </>
                      )}
                    </Button>

                    <button
                      type="button"
                      onClick={handleSkipToDemo}
                      disabled={pending}
                      className="w-full text-center py-2 text-xs font-semibold text-[#C5A059] hover:underline transition-all"
                    >
                      {t.skipDemo}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* ── FOOTER STATUS ── */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-4 flex items-center justify-between text-xs text-muted-foreground z-50">
        <div>
          VeloceWealth Inc. &copy; {new Date().getFullYear()}
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[10px]">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
          <span>VeloceWealth Network: OPÉRATIONNEL</span>
        </div>
      </footer>
    </div>
  );
}
