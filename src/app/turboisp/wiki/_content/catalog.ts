import { t } from './helpers'
import type { Category, Job } from './types'

export const CATEGORIES: Category[] = [
  { id: 'start', title: t('First steps', 'Primeiros passos', 'Premiers pas', 'Primeros pasos') },
  { id: 'network', title: t('Network', 'Rede', 'Réseau', 'Red') },
  { id: 'map', title: t('Map & plant', 'Mapa e planta', 'Carte et plante', 'Mapa y planta') },
  { id: 'plans', title: t('Plans', 'Planos', 'Forfaits', 'Planes') },
  { id: 'subscribers', title: t('Subscribers', 'Assinantes', 'Abonnés', 'Abonados') },
  { id: 'billing', title: t('Billing', 'Financeiro', 'Facturation', 'Facturación') },
  { id: 'fiscal', title: t('Fiscal (Brazil)', 'Fiscal (Brasil)', 'Fiscal (Brésil)', 'Fiscal (Brasil)') },
  { id: 'field', title: t('Field & tickets', 'Campo e chamados', 'Terrain et tickets', 'Campo y tickets') },
  { id: 'inventory', title: t('Inventory', 'Estoque', 'Inventaire', 'Inventario') },
  { id: 'provisioning', title: t('Provisioning', 'Provisionamento', 'Provisionnement', 'Aprovisionamiento') },
  { id: 'noc', title: t('NOC', 'NOC', 'NOC', 'NOC') },
  { id: 'portal', title: t('Portal & messages', 'Portal e mensagens', 'Portail et messages', 'Portal y mensajes') },
  { id: 'reports', title: t('Reports', 'Relatórios', 'Rapports', 'Reportes') },
  { id: 'settings', title: t('Settings', 'Configurações', 'Paramètres', 'Configuración') },
]

export const JOBS: Job[] = [
  {
    slug: 'create-pop',
    label: t('Stand up the first POP', 'Levantar o primeiro POP', 'Monter le premier POP', 'Dar de alta el primer POP'),
    blurb: t(
      'Company, POP, then the rest of the network hangs off it.',
      'Empresa, POP, e o resto da rede pende dele.',
      'Société, POP, puis le reste du réseau s’y rattache.',
      'Empresa, POP, y el resto de la red cuelga de ahí.',
    ),
  },
  {
    slug: 'internet-plans',
    label: t('Publish an internet plan', 'Publicar um plano de internet', 'Publier un forfait internet', 'Publicar un plan de internet'),
    blurb: t(
      'Speed, price, and what the contract actually sells.',
      'Velocidade, preço e o que o contrato realmente vende.',
      'Débit, prix, et ce que le contrat vend vraiment.',
      'Velocidad, precio y lo que el contrato realmente vende.',
    ),
  },
  {
    slug: 'create-subscriber',
    label: t('Onboard a subscriber', 'Cadastrar um assinante', 'Enregistrer un abonné', 'Dar de alta un abonado'),
    blurb: t(
      'Person or company, tax id, address, portal password.',
      'Pessoa ou empresa, documento, endereço, senha do portal.',
      'Personne ou société, identifiant fiscal, adresse, mot de passe portail.',
      'Persona o empresa, documento fiscal, dirección y contraseña del portal.',
    ),
  },
  {
    slug: 'generate-invoices',
    label: t('Run this month’s invoices', 'Gerar as faturas do mês', 'Générer les factures du mois', 'Generar las facturas del mes'),
    blurb: t(
      'Bulk generate, then dunning if they do not pay.',
      'Gera em lote, depois cobrança se não pagarem.',
      'Génération en masse, puis relance s’ils ne paient pas.',
      'Generación masiva y luego cobranza si no pagan.',
    ),
  },
  {
    slug: 'provision-onu',
    label: t('Provision an ONU', 'Provisionar uma ONU', 'Provisionner une ONU', 'Aprovisionar una ONU'),
    blurb: t(
      'OLT in the queue, then the ONU on the fiber.',
      'OLT na fila, depois a ONU na fibra.',
      'OLT dans la file, puis l’ONU sur la fibre.',
      'La OLT en la cola y después la ONU en la fibra.',
    ),
  },
  {
    slug: 'service-orders',
    label: t('Dispatch a technician', 'Despachar um técnico', 'Envoyer un technicien', 'Despachar un técnico'),
    blurb: t(
      'Service call, schedule, field app, signature.',
      'Chamado, agenda, app de campo, assinatura.',
      'Billet, planning, app terrain, signature.',
      'Ticket, agenda, app de campo y firma.',
    ),
  },
  {
    slug: 'network-map',
    label: t('Draw the plant on the map', 'Desenhar a planta no mapa', 'Dessiner la plante sur la carte', 'Dibujar la planta en el mapa'),
    blurb: t(
      'Tiles, poles, cables, CTO — or import a KML.',
      'Tiles, postes, cabos, CTO — ou importe um KML.',
      'Tuiles, poteaux, câbles, CTO — ou importez un KML.',
      'Mosaicos, postes, cables, CTO, o importa un KML.',
    ),
  },
]
