import { t } from './helpers'
import type { I18n } from './types'

export const wikiCopy = {
  brand: t('Wiki', 'Wiki', 'Wiki'),
  tagline: t(
    'Operator runbooks for TurboISP — how to do the work, not a dump of every screen.',
    'Runbooks do operador no TurboISP — como fazer o trabalho, não uma lista de telas.',
    'Runbooks opérateur pour TurboISP — comment faire le travail, pas un dump d’écrans.',
  ),
  homeTitle: t('What do you want to do?', 'O que você quer fazer?', 'Que voulez-vous faire ?'),
  homeLead: t(
    'Start from a job. Each guide follows the real TurboMenu path, with the clicks in order.',
    'Comece por uma tarefa. Cada guia segue o caminho real do TurboMenu, clique a clique.',
    'Partez d’une tâche. Chaque guide suit le vrai chemin TurboMenu, clic par clic.',
  ),
  browse: t('Browse by area', 'Navegar por área', 'Parcourir par domaine'),
  search: t('Search the wiki…', 'Buscar no wiki…', 'Rechercher le wiki…'),
  searchTitle: t('Search wiki', 'Buscar wiki', 'Rechercher le wiki'),
  searchEmpty: t('No guides match that.', 'Nenhum guia corresponde.', 'Aucun guide ne correspond.'),
  minutes: t('min', 'min', 'min'),
  onThisPage: t('On this page', 'Nesta página', 'Sur cette page'),
  related: t('Next', 'Em seguida', 'Ensuite'),
  need: t('You will need', 'Você vai precisar', 'Vous aurez besoin'),
  tip: t('Tip', 'Dica', 'Conseil'),
  warn: t('Watch out', 'Atenção', 'Attention'),
  openMenu: t('Open menu', 'Abrir menu', 'Ouvrir le menu'),
  contents: t('Contents', 'Conteúdo', 'Sommaire'),
  backHome: t('Wiki home', 'Início do wiki', 'Accueil du wiki'),
  site: t('Product', 'Produto', 'Produit'),
  signIn: t('Sign in', 'Entrar', 'Connexion'),
  language: t('Language', 'Idioma', 'Langue'),
  guides: t('guides', 'guias', 'guides'),
  step: t('Step', 'Passo', 'Étape'),
} as const satisfies Record<string, I18n>
