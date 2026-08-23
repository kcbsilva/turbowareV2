import { t } from './helpers'
import type { Category, Job } from './types'

export const CATEGORIES: Category[] = [
  { id: 'start', title: t('First steps', 'Primeiros passos', 'Premiers pas') },
  { id: 'network', title: t('Network', 'Rede', 'Réseau') },
  { id: 'map', title: t('Map & plant', 'Mapa e planta', 'Carte et plante') },
  { id: 'plans', title: t('Plans', 'Planos', 'Forfaits') },
  { id: 'subscribers', title: t('Subscribers', 'Assinantes', 'Abonnés') },
  { id: 'billing', title: t('Billing', 'Financeiro', 'Facturation') },
  { id: 'fiscal', title: t('Fiscal (Brazil)', 'Fiscal (Brasil)', 'Fiscal (Brésil)') },
  { id: 'field', title: t('Field & tickets', 'Campo e OS', 'Terrain et tickets') },
  { id: 'inventory', title: t('Inventory', 'Estoque', 'Inventaire') },
  { id: 'provisioning', title: t('Provisioning', 'Provisionamento', 'Provisionnement') },
  { id: 'noc', title: t('NOC', 'NOC', 'NOC') },
  { id: 'portal', title: t('Portal & messages', 'Portal e mensagens', 'Portail et messages') },
  { id: 'reports', title: t('Reports', 'Relatórios', 'Rapports') },
  { id: 'settings', title: t('Settings', 'Configurações', 'Paramètres') },
]

export const JOBS: Job[] = [
  {
    slug: 'create-pop',
    label: t('Stand up the first POP', 'Levantar o primeiro POP', 'Monter le premier POP'),
    blurb: t('Company, POP, then the rest of the network hangs off it.', 'Empresa, POP, e o resto da rede pende dele.', 'Société, POP, puis le reste du réseau s’y rattache.'),
  },
  {
    slug: 'internet-plans',
    label: t('Publish an internet plan', 'Publicar um plano de internet', 'Publier un forfait internet'),
    blurb: t('Speed, price, and what the contract actually sells.', 'Velocidade, preço e o que o contrato realmente vende.', 'Débit, prix, et ce que le contrat vend vraiment.'),
  },
  {
    slug: 'create-subscriber',
    label: t('Onboard a subscriber', 'Cadastrar um assinante', 'Enregistrer un abonné'),
    blurb: t('Person or company, tax id, address, portal password.', 'Pessoa ou empresa, documento, endereço, senha do portal.', 'Personne ou société, identifiant fiscal, adresse, mot de passe portail.'),
  },
  {
    slug: 'generate-invoices',
    label: t('Run this month’s invoices', 'Gerar as faturas do mês', 'Générer les factures du mois'),
    blurb: t('Bulk generate, then dunning if they do not pay.', 'Gera em lote, depois cobrança se não pagarem.', 'Génération en masse, puis relance s’ils ne paient pas.'),
  },
  {
    slug: 'provision-onu',
    label: t('Provision an ONU', 'Provisionar uma ONU', 'Provisionner une ONU'),
    blurb: t('OLT in the queue, then the ONU on the fiber.', 'OLT na fila, depois a ONU na fibra.', 'OLT dans la file, puis l’ONU sur la fibre.'),
  },
  {
    slug: 'service-orders',
    label: t('Dispatch a technician', 'Despachar um técnico', 'Envoyer un technicien'),
    blurb: t('Service call, schedule, field app, signature.', 'Ordem de serviço, agenda, app de campo, assinatura.', 'Intervention, planning, app terrain, signature.'),
  },
  {
    slug: 'network-map',
    label: t('Draw the plant on the map', 'Desenhar a planta no mapa', 'Dessiner la plante sur la carte'),
    blurb: t('Tiles, poles, cables, CTO — or import a KML.', 'Tiles, postes, cabos, CTO — ou importe um KML.', 'Tuiles, poteaux, câbles, CTO — ou importez un KML.'),
  },
]
