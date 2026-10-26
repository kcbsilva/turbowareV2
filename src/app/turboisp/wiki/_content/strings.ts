import { t } from './helpers'
import type { I18n } from './types'

export const wikiCopy = {
  brand: t('Wiki', 'Wiki', 'Wiki', 'Wiki'),
  tagline: t(
    'Operator runbooks for TurboISP — how to do the work, not a dump of every screen.',
    'Runbooks do operador no TurboISP — como fazer o trabalho, não uma lista de telas.',
    'Guides opérateur pour TurboISP — comment faire le travail, pas un inventaire de chaque écran.',
    'Guías de operación de TurboISP: cómo hacer el trabajo, no un inventario de cada pantalla.',
  ),
  indexDescription: t(
    'Operator runbooks for TurboISP: POP, plans, subscribers, billing, provisioning, field, and the network map.',
    'Runbooks do operador no TurboISP: POP, planos, assinantes, faturamento, provisionamento, campo e o mapa da rede.',
    'Guides opérateur pour TurboISP: POP, forfaits, abonnés, facturation, provisionnement, terrain et la carte du réseau.',
    'Guías de operación de TurboISP: POP, planes, suscriptores, facturación, aprovisionamiento, campo y el mapa de la red.',
  ),
  homeTitle: t('What do you want to do?', 'O que você quer fazer?', 'Que voulez-vous faire?', '¿Qué quieres hacer?'),
  homeLead: t(
    'Start from a job. Each guide follows the real TurboMenu path, with the clicks in order.',
    'Comece por uma tarefa. Cada guia segue o caminho real do TurboMenu, clique a clique.',
    'Partez d’une tâche. Chaque guide suit le vrai chemin TurboMenu, clic par clic.',
    'Empieza por una tarea. Cada guía sigue la ruta real de TurboMenu, clic a clic.',
  ),
  browse: t('Browse by area', 'Navegar por área', 'Parcourir par domaine', 'Explorar por área'),
  search: t('Search the wiki…', 'Buscar no wiki…', 'Rechercher le wiki…', 'Buscar en el wiki…'),
  searchTitle: t('Search wiki', 'Buscar wiki', 'Rechercher le wiki', 'Buscar en el wiki'),
  searchEmpty: t('No guides match that.', 'Nenhum guia corresponde.', 'Aucun guide ne correspond.', 'Ninguna guía coincide.'),
  minutes: t('min', 'min', 'min', 'min'),
  onThisPage: t('On this page', 'Nesta página', 'Sur cette page', 'En esta página'),
  related: t('Next', 'Em seguida', 'Ensuite', 'Siguiente'),
  need: t('You will need', 'Você vai precisar', 'Vous aurez besoin', 'Vas a necesitar'),
  tip: t('Tip', 'Dica', 'Conseil', 'Consejo'),
  warn: t('Watch out', 'Atenção', 'Attention', 'Atención'),
  openMenu: t('Open menu', 'Abrir menu', 'Ouvrir le menu', 'Abrir menú'),
  contents: t('Contents', 'Conteúdo', 'Sommaire', 'Contenido'),
  backHome: t('Wiki home', 'Início do wiki', 'Accueil du wiki', 'Inicio del wiki'),
  site: t('Product', 'Produto', 'Produit', 'Producto'),
  signIn: t('Sign in', 'Entrar', 'Connexion', 'Iniciar sesión'),
  language: t('Language', 'Idioma', 'Langue', 'Idioma'),
  guides: t('guides', 'guias', 'guides', 'guías'),
  step: t('Step', 'Passo', 'Étape', 'Paso'),
} as const satisfies Record<string, I18n>
