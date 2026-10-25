/** Client portal copy. Tuple order: en, pt-BR, fr-CA, es. */
const rows = {
  'lang.aria': ['Language', 'Idioma', 'Langue', 'Idioma'],

  'nav.dashboard': ['Dashboard', 'Painel', 'Tableau de bord', 'Panel'],
  'nav.activate': ['Activation', 'Ativação', 'Activation', 'Activación'],
  'nav.tickets': ['Tickets', 'Chamados', 'Tickets', 'Tickets'],
  'nav.billing': ['Billing', 'Faturamento', 'Facturation', 'Facturación'],
  'nav.profile': ['Profile', 'Perfil', 'Profil', 'Perfil'],
  'nav.portal': ['Portal', 'Portal', 'Portail', 'Portal'],
  'nav.signOut': ['Sign out', 'Sair', 'Se déconnecter', 'Salir'],
  'nav.aria': ['Portal navigation', 'Navegação do portal', 'Navigation du portail', 'Navegación del portal'],

  'login.title': ['Sign in to TurboISP', 'Entrar no TurboISP', 'Connexion à TurboISP', 'Entrar a TurboISP'],
  'login.subtitle': [
    'Manage licenses, invoices, and support for your ISP.',
    'Acesse licenças, faturas e suporte da sua operação.',
    'Gérez les licences, la facturation et le soutien de votre FAI.',
    'Administra licencias, facturas y soporte de tu ISP.',
  ],
  'login.identifier': ['Email or business number', 'E-mail ou CNPJ', 'Courriel ou numéro d’entreprise', 'Correo o número de empresa'],
  'login.password': ['Password', 'Senha', 'Mot de passe', 'Contraseña'],
  'login.submit': ['Sign in', 'Entrar', 'Se connecter', 'Iniciar sesión'],
  'login.submitting': ['Signing in…', 'Entrando…', 'Connexion…', 'Entrando…'],
  'login.noAccount': ['Don’t have an account?', 'Ainda não tem uma conta?', 'Pas encore de compte?', '¿Aún no tienes cuenta?'],
  'login.requestAccess': ['Request access', 'Solicitar acesso', 'Demander l’accès', 'Solicitar acceso'],
  'login.ip': ['Your IP', 'Seu IP', 'Votre IP', 'Tu IP'],
  'login.placeholder': [
    'you@company.com or business number',
    'email@empresa.com ou 00.000.000/0000-00',
    'vous@entreprise.com ou numéro d’entreprise',
    'tu@empresa.com o número de empresa',
  ],
  'login.hidePassword': ['Hide password', 'Ocultar senha', 'Masquer le mot de passe', 'Ocultar contraseña'],
  'login.showPassword': ['Show password', 'Mostrar senha', 'Afficher le mot de passe', 'Mostrar contraseña'],
  'login.invalid': [
    'Invalid email, business number, or password.',
    'E-mail, CNPJ ou senha inválidos.',
    'Courriel, numéro d’entreprise ou mot de passe invalide.',
    'Correo, número de empresa o contraseña no válidos.',
  ],

  'common.loading': ['Loading…', 'Carregando…', 'Chargement…', 'Cargando…'],
  'common.cancel': ['Cancel', 'Cancelar', 'Annuler', 'Cancelar'],
  'common.confirm': ['Confirm', 'Confirmar', 'Confirmer', 'Confirmar'],
  'common.saving': ['Saving…', 'Salvando…', 'Enregistrement…', 'Guardando…'],
  'common.failed': ['Could not complete that.', 'Não foi possível concluir.', 'Impossible de terminer.', 'No se pudo completar.'],
  'common.refresh': ['Refresh', 'Atualizar', 'Actualiser', 'Actualizar'],
  'common.back': ['Back', 'Voltar', 'Retour', 'Volver'],
  'common.status': ['Status', 'Status', 'Statut', 'Estado'],
  'common.region': ['Region', 'Região', 'Région', 'Región'],
  'common.modules': ['Modules', 'Módulos', 'Modules', 'Módulos'],
  'common.monthly': ['Monthly', 'Mensalidade', 'Mensuel', 'Mensual'],
  'common.perMonth': ['/mo', '/mês', '/mois', '/mes'],
  'common.enterprise': ['Enterprise', 'Sob consulta', 'Sur devis', 'A medida'],
  'common.dayCount': ['{n} day', '{n} dia', '{n} jour', '{n} día'],
  'common.daysCount': ['{n} days', '{n} dias', '{n} jours', '{n} días'],

  'status.TRIAL': ['Trial', 'Em teste', 'Essai', 'Prueba'],
  'status.PENDING_PAYMENT': ['Awaiting payment', 'Aguardando pagamento', 'En attente de paiement', 'Pago pendiente'],
  'status.ACTIVE': ['Active', 'Ativo', 'Actif', 'Activo'],
  'status.SUSPENDED': ['Suspended', 'Suspenso', 'Suspendu', 'Suspendido'],
  'status.CANCELLED': ['Cancelled', 'Cancelado', 'Annulé', 'Cancelado'],
  'status.PENDING': ['Pending review', 'Em análise', 'En révision', 'En revisión'],
  'status.OPEN': ['Open', 'Aberto', 'Ouvert', 'Abierto'],
  'status.IN_PROGRESS': ['In progress', 'Em andamento', 'En cours', 'En curso'],
  'status.RESOLVED': ['Resolved', 'Resolvido', 'Résolu', 'Resuelto'],
  'status.CLOSED': ['Closed', 'Fechado', 'Fermé', 'Cerrado'],
  'status.PAID': ['Paid', 'Pago', 'Payé', 'Pagado'],
  'status.OVERDUE': ['Overdue', 'Em atraso', 'En retard', 'Vencido'],
  'status.WAIVED': ['Waived', 'Dispensado', 'Annulé', 'Condonado'],
  'status.PENDING_INV': ['Pending', 'Pendente', 'En attente', 'Pendiente'],

  'invoice.INSTALLATION': ['Installation fee', 'Taxa de instalação', 'Frais d’installation', 'Cargo de instalación'],
  'invoice.MONTHLY': ['Monthly subscription', 'Mensalidade', 'Abonnement mensuel', 'Suscripción mensual'],
  'invoice.PRORATED': ['Prorated charge', 'Cobrança proporcional', 'Montant au prorata', 'Cargo prorrateado'],
  'invoice.GRACE_FEE': ['Grace extension fee', 'Taxa de extensão de prazo', 'Frais de prolongation', 'Cargo por ampliar el plazo'],
  'invoice.IMPORTATION': ['Importation fee', 'Taxa de importação', 'Frais d’importation', 'Cargo de importación'],
  'invoice.CUSTOM': ['Custom charge', 'Cobrança avulsa', 'Frais ponctuels', 'Cargo puntual'],

  'priority.LOW': ['Low', 'Baixa', 'Basse', 'Baja'],
  'priority.MEDIUM': ['Medium', 'Média', 'Moyenne', 'Media'],
  'priority.HIGH': ['High', 'Alta', 'Haute', 'Alta'],

  'category.Billing': ['Billing', 'Faturamento', 'Facturation', 'Facturación'],
  'category.Technical': ['Technical', 'Técnico', 'Technique', 'Técnico'],
  'category.Account': ['Account', 'Conta', 'Compte', 'Cuenta'],
  'category.Activation': ['Activation', 'Ativação', 'Activation', 'Activación'],
  'category.Other': ['Other', 'Outro', 'Autre', 'Otro'],

  'activate.title': ['Activate TurboISP', 'Ativar o TurboISP', 'Activer TurboISP', 'Activar TurboISP'],
  'activate.lead': [
    'This installation uses the same credentials you used to sign in. No license key is required.',
    'Esta instalação usa as mesmas credenciais do portal. Não precisa de chave de licença.',
    'Cette installation utilise les mêmes identifiants que le portail. Aucune clé de licence n’est requise.',
    'Esta instalación usa las mismas credenciales del portal. No hace falta una clave de licencia.',
  ],
  'activate.notice': [
    'TurboISP signs in with your CNPJ and password when it starts. Keep the portal password safe — changing it means activating again.',
    'O TurboISP entra com o seu CNPJ e a sua senha na inicialização. Guarde a senha do portal — se você trocar, precisa ativar de novo.',
    'TurboISP se connecte avec votre CNPJ et votre mot de passe au démarrage. Gardez le mot de passe du portail — le changer exige une nouvelle activation.',
    'TurboISP entra con tu CNPJ y tu contraseña al iniciar. Guarda la contraseña del portal: si la cambias, hay que activar de nuevo.',
  ],
  'activate.cnpj': ['Your CNPJ', 'Seu CNPJ', 'Votre CNPJ', 'Tu CNPJ'],
  'activate.password': ['Confirm your password', 'Confirme sua senha', 'Confirmez votre mot de passe', 'Confirma tu contraseña'],
  'activate.passwordPlaceholder': ['Portal password', 'Senha do portal', 'Mot de passe du portail', 'Contraseña del portal'],
  'activate.passwordHint': [
    'Used once to confirm it is you. TurboISP stores it securely on this machine.',
    'Usada uma vez para confirmar que é você. O TurboISP guarda isso com segurança nesta máquina.',
    'Utilisé une seule fois pour confirmer que c’est vous. TurboISP le conserve de façon sécurisée sur cet appareil.',
    'Se usa una vez para confirmar que eres tú. TurboISP lo guarda de forma segura en este equipo.',
  ],
  'activate.submit': ['Activate TurboISP', 'Ativar o TurboISP', 'Activer TurboISP', 'Activar TurboISP'],
  'activate.submitting': ['Activating…', 'Ativando…', 'Activation…', 'Activando…'],
  'activate.failed': ['Activation failed.', 'Não foi possível ativar.', 'L’activation a échoué.', 'No se pudo activar.'],
  'activate.successTitle': ['TurboISP activated', 'TurboISP ativado', 'TurboISP activé', 'TurboISP activado'],
  'activate.successBody': [
    'This installation is now linked to {name}.',
    'Esta instalação agora está vinculada a {name}.',
    'Cette installation est maintenant liée à {name}.',
    'Esta instalación ya está vinculada a {name}.',
  ],
  'activate.planTier': ['Plan tier', 'Faixa do plano', 'Palier du forfait', 'Nivel del plan'],
  'activate.subscribers': ['{tier} subscribers', '{tier} assinantes', '{tier} abonnés', '{tier} abonados'],
  'activate.maxSubscribers': ['Max subscribers', 'Máximo de assinantes', 'Abonnés maximum', 'Máximo de abonados'],
  'activate.trialEnds': ['Trial ends', 'Fim do período de teste', 'Fin de l’essai', 'Fin de la prueba'],
  'activate.activatedAt': ['Activated at {date}', 'Ativado em {date}', 'Activé le {date}', 'Activado el {date}'],

  'dash.seats': ['{n} users · {price}', '{n} usuários · {price}', '{n} utilisateurs · {price}', '{n} usuarios · {price}'],
  'dash.trial': [
    'Trial is active — {span} remaining. The first payment is due on {date}.',
    'Período de teste em andamento — faltam {span}. O primeiro pagamento vence em {date}.',
    'Essai en cours — il reste {span}. Le premier paiement est dû le {date}.',
    'La prueba está activa — quedan {span}. El primer pago vence el {date}.',
  ],
  'dash.grace': [
    'Grace period is active — {span} remaining. Settle the invoices to avoid another suspension.',
    'Extensão de prazo em vigor — faltam {span}. Quite as faturas para não ser suspenso de novo.',
    'Délai de grâce en cours — il reste {span}. Réglez les factures pour éviter une nouvelle suspension.',
    'El plazo ampliado está vigente — quedan {span}. Paga las facturas para evitar otra suspensión.',
  ],
  'dash.suspendedTitle': ['Subscription suspended', 'Assinatura suspensa', 'Abonnement suspendu', 'Suscripción suspendida'],
  'dash.suspendedBody': [
    'Access is suspended because of an outstanding balance. Pay the invoices below, or extend the grace period for a few more days.',
    'O acesso está suspenso por saldo em aberto. Pague as faturas abaixo ou estenda o prazo por mais alguns dias.',
    'L’accès est suspendu à cause d’un solde impayé. Payez les factures ci-dessous ou prolongez le délai de quelques jours.',
    'El acceso está suspendido por saldo pendiente. Paga las facturas de abajo o amplía el plazo unos días más.',
  ],
  'dash.extend': ['Extend grace', 'Estender prazo', 'Prolonger le délai', 'Ampliar el plazo'],
  'dash.extendFee': ['(+R$ 5.00 on the next bill)', '(+R$ 5,00 na próxima fatura)', '(+5,00 R$ sur la prochaine facture)', '(+R$ 5,00 en la próxima factura)'],
  'dash.graceHint': [
    'Adds a R$ 5.00 fee to the next bill. Once per calendar month.',
    'Acrescenta R$ 5,00 na próxima fatura. Uma vez por mês.',
    'Ajoute 5,00 R$ à la prochaine facture. Une fois par mois.',
    'Suma R$ 5,00 a la próxima factura. Una vez por mes.',
  ],
  'dash.graceConfirm': ['Confirm grace', 'Confirmar extensão', 'Confirmer la prolongation', 'Confirmar ampliación'],
  'dash.graceUsed': [
    'Grace was already used this month. It is available again on the 1st of next month.',
    'A extensão de prazo já foi usada neste mês. Volta a ficar disponível no dia 1º do próximo mês.',
    'Le délai de grâce a déjà été utilisé ce mois-ci. Il revient le 1er du mois prochain.',
    'El plazo ya se usó este mes. Vuelve a estar disponible el día 1 del mes que viene.',
  ],
  'dash.graceFailed': ['Could not extend grace.', 'Não foi possível estender o prazo.', 'Impossible de prolonger le délai.', 'No se pudo ampliar el plazo.'],
  'dash.billing': ['Billing', 'Faturamento', 'Facturation', 'Facturación'],
  'dash.changeDate': ['Change date', 'Alterar data', 'Changer la date', 'Cambiar la fecha'],
  'dash.lockedUntil': ['Locked until {date}', 'Bloqueado até {date}', 'Verrouillé jusqu’au {date}', 'Bloqueado hasta el {date}'],
  'dash.selectDay': ['Select a new billing day…', 'Escolha o novo dia de vencimento…', 'Choisissez le nouveau jour de facturation…', 'Elige el nuevo día de cobro…'],
  'dash.dayN': ['Day {n}', 'Dia {n}', 'Jour {n}', 'Día {n}'],
  'dash.billingDayEn': ['Day {n} of each month', 'Dia {n} de cada mês', 'Le {n} de chaque mois', 'Día {n} de cada mes'],
  'dash.nextCharge': ['Next charge: {price} on day {n}', 'Próxima cobrança: {price} no dia {n}', 'Prochain prélèvement: {price} le {n}', 'Próximo cobro: {price} el día {n}'],
  'dash.awaiting': ['Awaiting payment', 'Aguardando pagamento', 'En attente de paiement', 'Pago pendiente'],
  'dash.due': ['Due {date}', 'Vence em {date}', 'Échéance le {date}', 'Vence el {date}'],
  'dash.paidOn': ['Paid {date}', 'Pago em {date}', 'Payé le {date}', 'Pagado el {date}'],
  'dash.viaPix': ['via Pix, boleto, or card', 'via Pix, boleto ou cartão', 'via Pix, boleto ou carte', 'vía Pix, boleto o tarjeta'],
  'dash.viaStripe': ['via Stripe', 'via Stripe', 'via Stripe', 'vía Stripe'],
  'dash.payNow': ['Pay now', 'Pagar agora', 'Payer maintenant', 'Pagar ahora'],
  'dash.contactAdmin': [
    'Contact your administrator to receive a payment link.',
    'Fale com o administrador para receber o link de pagamento.',
    'Communiquez avec votre administrateur pour obtenir un lien de paiement.',
    'Contacta a tu administrador para recibir el enlace de pago.',
  ],
  'dash.history': ['Payment history', 'Histórico de pagamentos', 'Historique des paiements', 'Historial de pagos'],

  'password.title': ['Change your password', 'Troque sua senha', 'Changez votre mot de passe', 'Cambia tu contraseña'],
  'password.lead': [
    'Your administrator reset the portal password. Choose a new one before continuing.',
    'O administrador redefiniu a senha do portal. Escolha uma nova antes de continuar.',
    'Votre administrateur a réinitialisé le mot de passe du portail. Choisissez-en un nouveau avant de continuer.',
    'Tu administrador restableció la contraseña del portal. Elige una nueva antes de continuar.',
  ],
  'password.sentTo': ['Temporary password sent to {email}', 'Senha temporária enviada para {email}', 'Mot de passe temporaire envoyé à {email}', 'Contraseña temporal enviada a {email}'],
  'password.new': ['New password', 'Nova senha', 'Nouveau mot de passe', 'Nueva contraseña'],
  'password.confirm': ['Confirm password', 'Confirmar senha', 'Confirmer le mot de passe', 'Confirmar contraseña'],
  'password.minPlaceholder': ['At least 8 characters', 'Mínimo de 8 caracteres', 'Au moins 8 caractères', 'Mínimo 8 caracteres'],
  'password.repeatPlaceholder': ['Repeat the new password', 'Repita a nova senha', 'Répétez le nouveau mot de passe', 'Repite la nueva contraseña'],
  'password.update': ['Update password', 'Atualizar senha', 'Mettre à jour le mot de passe', 'Actualizar contraseña'],
  'password.updating': ['Updating…', 'Atualizando…', 'Mise à jour…', 'Actualizando…'],
  'password.tooShort': ['Password must be at least 8 characters.', 'A senha precisa ter pelo menos 8 caracteres.', 'Le mot de passe doit compter au moins 8 caractères.', 'La contraseña debe tener al menos 8 caracteres.'],
  'password.mismatch': ['Passwords do not match.', 'As senhas não coincidem.', 'Les mots de passe ne correspondent pas.', 'Las contraseñas no coinciden.'],
  'password.failed': ['Could not update the password.', 'Não foi possível atualizar a senha.', 'Impossible de mettre à jour le mot de passe.', 'No se pudo actualizar la contraseña.'],
  'password.updated': ['Password updated', 'Senha atualizada', 'Mot de passe mis à jour', 'Contraseña actualizada'],

  'profile.title': ['Profile', 'Perfil', 'Profil', 'Perfil'],
  'profile.personal': ['Personal information', 'Dados pessoais', 'Renseignements personnels', 'Datos personales'],
  'profile.fullName': ['Full name', 'Nome completo', 'Nom complet', 'Nombre completo'],
  'profile.email': ['Email', 'E-mail', 'Courriel', 'Correo'],
  'profile.phone': ['Phone', 'Telefone', 'Téléphone', 'Teléfono'],
  'profile.company': ['Company', 'Empresa', 'Entreprise', 'Empresa'],
  'profile.cnpj': ['CNPJ', 'CNPJ', 'CNPJ', 'CNPJ'],
  'profile.namePlaceholder': ['Your name', 'Seu nome', 'Votre nom', 'Tu nombre'],
  'profile.emailPlaceholder': ['email@example.com', 'email@exemplo.com', 'courriel@exemple.com', 'correo@ejemplo.com'],
  'profile.phonePlaceholder': ['+55 11 99999-9999', '+55 11 99999-9999', '+1 514 555-0100', '+1 514 555-0100'],
  'profile.companyPlaceholder': ['Company name', 'Nome da empresa', 'Nom de l’entreprise', 'Nombre de la empresa'],
  'profile.save': ['Save changes', 'Salvar alterações', 'Enregistrer', 'Guardar cambios'],
  'profile.updated': ['Profile updated', 'Perfil atualizado', 'Profil mis à jour', 'Perfil actualizado'],
  'profile.failed': ['Could not save the profile.', 'Não foi possível salvar o perfil.', 'Impossible d’enregistrer le profil.', 'No se pudo guardar el perfil.'],
  'profile.passwordTitle': ['Change password', 'Alterar senha', 'Changer le mot de passe', 'Cambiar contraseña'],

  'products.title': ['Products and activation', 'Produtos e ativação', 'Produits et activation', 'Productos y activación'],
  'products.lead': [
    'Request access to more products on this account.',
    'Peça acesso a outros produtos desta conta.',
    'Demandez l’accès à d’autres produits de ce compte.',
    'Pide acceso a más productos de esta cuenta.',
  ],
  'products.empty': ['No products available yet', 'Nenhum produto disponível ainda', 'Aucun produit disponible pour le moment', 'Todavía no hay productos disponibles'],
  'products.emptyHint': [
    'Check back soon, or contact your account manager.',
    'Volte em breve ou fale com o responsável pela conta.',
    'Revenez bientôt ou communiquez avec votre chargé de compte.',
    'Vuelve pronto o contacta a quien administra tu cuenta.',
  ],
  'products.active': ['Active', 'Ativos', 'Actifs', 'Activos'],
  'products.pending': ['Pending review', 'Em análise', 'En révision', 'En revisión'],
  'products.available': ['Available', 'Disponíveis', 'Disponibles', 'Disponibles'],
  'products.activeOn': ['Active on the {tier} tier', 'Ativo no plano {tier}', 'Actif au forfait {tier}', 'Activo en el plan {tier}'],
  'products.since': ['since {date}', 'desde {date}', 'depuis le {date}', 'desde el {date}'],
  'products.pendingNote': [
    'Your request is being reviewed. We will be in touch shortly.',
    'Seu pedido está em análise. Entraremos em contato em breve.',
    'Votre demande est en révision. Nous vous écrivons sous peu.',
    'Tu solicitud está en revisión. Te contactamos pronto.',
  ],
  'products.hidePlans': ['Hide plans', 'Ocultar planos', 'Masquer les forfaits', 'Ocultar planes'],
  'products.viewPlan': ['View 1 plan', 'Ver 1 plano', 'Voir 1 forfait', 'Ver 1 plan'],
  'products.viewPlans': ['View {n} plans', 'Ver {n} planos', 'Voir {n} forfaits', 'Ver {n} planes'],
  'products.request': ['Request access', 'Solicitar acesso', 'Demander l’accès', 'Solicitar acceso'],
  'products.requesting': ['Requesting…', 'Solicitando…', 'Envoi…', 'Solicitando…'],
  'products.selectTier': ['Select a plan first.', 'Escolha um plano primeiro.', 'Choisissez d’abord un forfait.', 'Elige un plan primero.'],
  'products.selectHint': ['Select a plan above before requesting.', 'Escolha um plano acima antes de solicitar.', 'Choisissez un forfait ci-dessus avant de demander.', 'Elige un plan arriba antes de solicitar.'],
  'products.requestFailed': ['Could not send the request.', 'Não foi possível enviar o pedido.', 'Impossible d’envoyer la demande.', 'No se pudo enviar la solicitud.'],
  'products.seats': ['Up to {n} users', 'Até {n} usuários', 'Jusqu’à {n} utilisateurs', 'Hasta {n} usuarios'],
  'products.selected': ['Selected', 'Selecionado', 'Sélectionné', 'Seleccionado'],

  'billing.title': ['Billing and payments', 'Faturamento e pagamentos', 'Facturation et paiements', 'Facturación y pagos'],
  'billing.emptyTitle': ['No subscription found', 'Nenhuma assinatura encontrada', 'Aucun abonnement trouvé', 'No hay una suscripción'],
  'billing.emptyBody': [
    'Contact your administrator to set up billing.',
    'Fale com o administrador para configurar o faturamento.',
    'Communiquez avec votre administrateur pour configurer la facturation.',
    'Contacta a tu administrador para configurar la facturación.',
  ],
  'billing.method': ['Payment method', 'Forma de pagamento', 'Mode de paiement', 'Forma de pago'],
  'billing.methodHint': [
    'Links are emailed when an invoice is created.',
    'O link chega por e-mail quando a fatura é gerada.',
    'Le lien est envoyé par courriel à la création de la facture.',
    'El enlace llega por correo cuando se crea la factura.',
  ],
  'billing.gatewayBr': ['Pix, boleto, or card (Asaas)', 'Pix, boleto ou cartão (Asaas)', 'Pix, boleto ou carte (Asaas)', 'Pix, boleto o tarjeta (Asaas)'],
  'billing.gatewayIntl': ['Credit card (Stripe)', 'Cartão de crédito (Stripe)', 'Carte de crédit (Stripe)', 'Tarjeta de crédito (Stripe)'],
  'billing.outstanding': ['Outstanding', 'Em aberto', 'Impayés', 'Pendiente'],
  'billing.pendingOne': ['{n} open invoice', '{n} fatura em aberto', '{n} facture impayée', '{n} factura pendiente'],
  'billing.pendingMany': ['{n} open invoices', '{n} faturas em aberto', '{n} factures impayées', '{n} facturas pendientes'],
  'billing.all': ['All', 'Todas', 'Toutes', 'Todas'],
  'billing.pending': ['Open', 'Em aberto', 'Impayées', 'Pendientes'],
  'billing.paid': ['Paid', 'Pagas', 'Payées', 'Pagadas'],
  'billing.none': ['No invoices', 'Nenhuma fatura', 'Aucune facture', 'Ninguna factura'],
  'billing.pixShort': ['Pix, boleto, or card', 'Pix, boleto ou cartão', 'Pix, boleto ou carte', 'Pix, boleto o tarjeta'],
  'billing.linkPending': ['Link pending', 'Link pendente', 'Lien en attente', 'Enlace pendiente'],

  'tickets.title': ['Support tickets', 'Chamados', 'Tickets de soutien', 'Tickets de soporte'],
  'tickets.new': ['New ticket', 'Novo chamado', 'Nouveau ticket', 'Nuevo ticket'],
  'tickets.empty': ['No tickets yet', 'Nenhum chamado ainda', 'Aucun ticket pour le moment', 'Todavía no hay tickets'],
  'tickets.openFirst': ['Open your first ticket', 'Abrir o primeiro chamado', 'Ouvrir un premier ticket', 'Abrir tu primer ticket'],
  'tickets.backList': ['Back to tickets', 'Voltar aos chamados', 'Retour aux tickets', 'Volver a los tickets'],
  'tickets.newTitle': ['New support ticket', 'Novo chamado', 'Nouveau ticket de soutien', 'Nuevo ticket de soporte'],
  'tickets.subject': ['Subject', 'Assunto', 'Sujet', 'Asunto'],
  'tickets.subjectPlaceholder': ['Short description of the issue', 'Descrição curta do problema', 'Courte description du problème', 'Descripción breve del problema'],
  'tickets.category': ['Category', 'Categoria', 'Catégorie', 'Categoría'],
  'tickets.priority': ['Priority', 'Prioridade', 'Priorité', 'Prioridad'],
  'tickets.message': ['Message', 'Mensagem', 'Message', 'Mensaje'],
  'tickets.messagePlaceholder': ['Describe the issue in detail…', 'Descreva o problema com detalhes…', 'Décrivez le problème en détail…', 'Describe el problema con detalle…'],
  'tickets.submit': ['Submit ticket', 'Enviar chamado', 'Envoyer le ticket', 'Enviar ticket'],
  'tickets.submitting': ['Submitting…', 'Enviando…', 'Envoi…', 'Enviando…'],
  'tickets.replyPlaceholder': ['Write a reply…', 'Escreva uma resposta…', 'Écrire une réponse…', 'Escribe una respuesta…'],
  'tickets.closed': ['This ticket is closed.', 'Este chamado está fechado.', 'Ce ticket est fermé.', 'Este ticket está cerrado.'],
  'tickets.support': ['Support', 'Suporte', 'Soutien', 'Soporte'],
  'tickets.you': ['You', 'Você', 'Vous', 'Tú'],
  'tickets.supportPrefix': ['Support: ', 'Suporte: ', 'Soutien: ', 'Soporte: '],
  'tickets.messageOne': ['{n} message', '{n} mensagem', '{n} message', '{n} mensaje'],
  'tickets.messageMany': ['{n} messages', '{n} mensagens', '{n} messages', '{n} mensajes'],
  'tickets.createFailed': ['Could not open the ticket.', 'Não foi possível abrir o chamado.', 'Impossible d’ouvrir le ticket.', 'No se pudo abrir el ticket.'],
  'tickets.replyFailed': ['Could not send the reply.', 'Não foi possível enviar a resposta.', 'Impossible d’envoyer la réponse.', 'No se pudo enviar la respuesta.'],

  'grace.title': ['Extend grace', 'Estender prazo', 'Prolonger le délai', 'Ampliar el plazo'],
  'grace.description': [
    'Give this account more TurboISP access — extra days from now, or a date on the calendar.',
    'Dá mais tempo de acesso ao TurboISP — dias a mais a partir de agora, ou uma data no calendário.',
    'Accorde plus de temps d’accès à TurboISP — des jours de plus dès maintenant, ou une date au calendrier.',
    'Da más tiempo de acceso a TurboISP — días extra desde ahora, o una fecha en el calendario.',
  ],
  'grace.extraDays': ['Extra days', 'Dias a mais', 'Jours supplémentaires', 'Días extra'],
  'grace.calendar': ['Calendar date', 'Data no calendário', 'Date au calendrier', 'Fecha en el calendario'],
  'grace.accessUntil': ['Access until', 'Acesso até', 'Accès jusqu’au', 'Acceso hasta'],
  'grace.range': ['Between {min} and {max} days.', 'Entre {min} e {max} dias.', 'Entre {min} et {max} jours.', 'Entre {min} y {max} días.'],
  'grace.accessThrough': ['Access through', 'Acesso até', 'Accès jusqu’au', 'Acceso hasta'],
  'grace.day': ['day', 'dia', 'jour', 'día'],
  'grace.days': ['days', 'dias', 'jours', 'días'],
  'grace.cancel': ['Cancel', 'Cancelar', 'Annuler', 'Cancelar'],
  'grace.saving': ['Saving…', 'Salvando…', 'Enregistrement…', 'Guardando…'],
  'grace.failed': ['Could not extend grace.', 'Não foi possível estender o prazo.', 'Impossible de prolonger le délai.', 'No se pudo ampliar el plazo.'],
} as const

type ClientKey = keyof typeof rows
type LocaleBundle = Record<ClientKey, string>

function bundle(index: 0 | 1 | 2 | 3): LocaleBundle {
  const out = {} as LocaleBundle
  for (const key of Object.keys(rows) as ClientKey[]) out[key] = rows[key][index]
  return out
}

export const clientLocales = {
  en: bundle(0),
  'pt-BR': bundle(1),
  'fr-CA': bundle(2),
  es: bundle(3),
}

export type ClientMsgKey = ClientKey
export type ClientLang = keyof typeof clientLocales

export const CLIENT_LANGS: { code: ClientLang; label: string }[] = [
  { code: 'pt-BR', label: 'PT' },
  { code: 'en', label: 'EN' },
  { code: 'fr-CA', label: 'FR' },
  { code: 'es', label: 'ES' },
]

export function clientDateLocale(lang: ClientLang): string {
  if (lang === 'pt-BR') return 'pt-BR'
  if (lang === 'fr-CA') return 'fr-CA'
  if (lang === 'es') return 'es-419'
  return 'en-US'
}

export function clientHtmlLang(lang: ClientLang): string {
  if (lang === 'fr-CA') return 'fr-CA'
  if (lang === 'es') return 'es'
  return lang
}

export function parseClientLang(raw: string | null | undefined): ClientLang {
  if (raw === 'en') return 'en'
  if (raw === 'fr' || raw === 'fr-CA' || raw === 'fr-ca' || raw === 'fr_CA') return 'fr-CA'
  if (raw === 'es' || raw === 'es-419' || raw === 'es-MX' || raw === 'es-mx') return 'es'
  if (raw === 'pt-BR' || raw === 'pt' || raw === 'pt_BR' || raw === 'pt-br') return 'pt-BR'
  return 'pt-BR'
}

export function translateClient(lang: ClientLang, key: ClientMsgKey, vars?: Record<string, string | number>): string {
  let out: string = clientLocales[lang][key] ?? key
  if (vars) {
    for (const [name, value] of Object.entries(vars)) out = out.replaceAll(`{${name}}`, String(value))
  }
  return out
}

export function clientSpan(lang: ClientLang, n: number): string {
  return translateClient(lang, n === 1 ? 'common.dayCount' : 'common.daysCount', { n })
}
