import type { Lang } from '../site/_components/constants'
import { NUMBER_LOCALE } from '../site/_components/constants'

export { NUMBER_LOCALE }

export const pricingCopy = {
  navModules: { en: 'Modules', pt: 'Módulos', fr: 'Modules', es: 'Módulos' },
  navWhy: { en: 'Why TurboISP', pt: 'Por que TurboISP', fr: 'Pourquoi TurboISP', es: 'Por qué TurboISP' },
  navPricing: { en: 'Pricing', pt: 'Planos', fr: 'Tarifs', es: 'Precios' },
  language: { en: 'Language', pt: 'Idioma', fr: 'Langue', es: 'Idioma' },
  eyebrow: {
    en: 'Simple, transparent pricing',
    pt: 'Preço simples e transparente',
    fr: 'Tarifs simples et transparents',
    es: 'Precios simples y transparentes',
  },
  title: {
    en: 'Plans that grow with your operation',
    pt: 'Planos que acompanham a sua operação',
    fr: 'Des forfaits à la mesure de votre exploitation',
    es: 'Planes que crecen con tu operación',
  },
  lead: {
    en: 'One monthly fee based on your subscriber count. No hidden charges, no per-feature tiers.',
    pt: 'Uma mensalidade conforme o número de assinantes. Sem cobrança escondida e sem faixa por módulo.',
    fr: 'Un forfait mensuel selon le nombre d’abonnés. Pas de frais cachés, pas de palier par fonction.',
    es: 'Una mensualidad según la cantidad de abonados. Sin cargos ocultos ni precio por función.',
  },
  regionBR: { en: 'Brazil', pt: 'Brasil', fr: 'Brésil', es: 'Brasil' },
  regionCA: { en: 'Canada', pt: 'Canadá', fr: 'Canada', es: 'Canadá' },
  regionUS: { en: 'United States', pt: 'Estados Unidos', fr: 'États-Unis', es: 'Estados Unidos' },
  regionGB: { en: 'England', pt: 'Inglaterra', fr: 'Angleterre', es: 'Inglaterra' },
  installTitle: {
    en: 'One-time installation fee',
    pt: 'Taxa única de implantação',
    fr: 'Frais d’installation uniques',
    es: 'Cargo único de instalación',
  },
  installBody: {
    en: 'Covers full platform setup, DNS configuration, and onboarding',
    pt: 'Cobre a implantação da plataforma, a configuração de DNS e a entrada em operação',
    fr: 'Couvre la mise en service, la configuration DNS et l’accueil',
    es: 'Cubre la puesta en marcha, la configuración de DNS y el arranque',
  },
  subscribers: { en: 'Subscribers', pt: 'Assinantes', fr: 'Abonnés', es: 'Abonados' },
  monthly: { en: 'Monthly', pt: 'Mensal', fr: 'Mensuel', es: 'Mensual' },
  activeSubscribers: {
    en: '{n} active subscribers',
    pt: '{n} assinantes ativos',
    fr: '{n} abonnés actifs',
    es: '{n} abonados activos',
  },
  onRequest: { en: 'On request', pt: 'Sob consulta', fr: 'Sur demande', es: 'A consultar' },
  perMonth: { en: '/ month', pt: '/ mês', fr: '/ mois', es: '/ mes' },
  inquire: { en: 'On request', pt: 'Sob consulta', fr: 'Sur demande', es: 'A consultar' },
} as const satisfies Record<string, Record<Lang, string>>

