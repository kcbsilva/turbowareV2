import type { Lang } from '../site/_components/constants'

export const pausedCopy = {
  title: {
    en: 'Self-serve signup is paused',
    pt: 'O cadastro pelo site está pausado',
    fr: 'L’inscription en libre-service est en pause',
    es: 'El alta por cuenta propia está en pausa',
  },
  body: {
    en: 'We are not opening new TurboISP instances from this site right now.',
    pt: 'No momento não abrimos novas instâncias TurboISP por este site.',
    fr: 'Nous n’ouvrons pas de nouvelles instances TurboISP depuis ce site pour l’instant.',
    es: 'Por ahora no abrimos nuevas instancias de TurboISP desde este sitio.',
  },
  back: {
    en: 'Back to TurboISP',
    pt: 'Voltar ao TurboISP',
    fr: 'Retour à TurboISP',
    es: 'Volver a TurboISP',
  },
  signIn: {
    en: 'Sign in',
    pt: 'Entrar',
    fr: 'Se connecter',
    es: 'Iniciar sesión',
  },
} as const satisfies Record<string, Record<Lang, string>>
