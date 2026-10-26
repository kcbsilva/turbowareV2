import { clientDateLocale, parseClientLang, type ClientLang } from './client-i18n'

/** User-facing API errors. Tuple order: en, pt-BR, fr-CA, es. */
const rows = {
  'login.tooMany': [
    'Too many sign-in attempts. Try again in 15 minutes.',
    'Muitas tentativas de entrada. Tente de novo em 15 minutos.',
    'Trop de tentatives de connexion. Réessayez dans 15 minutes.',
    'Demasiados intentos de acceso. Inténtalo de nuevo en 15 minutos.',
  ],
  'login.required': [
    'Email or business number and password are required.',
    'Informe o e-mail ou CNPJ e a senha.',
    'Le courriel ou le numéro d’entreprise et le mot de passe sont requis.',
    'El correo o el número de empresa y la contraseña son obligatorios.',
  ],
  'login.invalid': [
    'Invalid email, business number, or password.',
    'E-mail, CNPJ ou senha inválidos.',
    'Courriel, numéro d’entreprise ou mot de passe invalide.',
    'Correo, número de empresa o contraseña no válidos.',
  ],
  'login.verify': [
    'Verify your email before signing in.',
    'Verifique seu e-mail antes de entrar.',
    'Vérifiez votre courriel avant de vous connecter.',
    'Verifica tu correo antes de iniciar sesión.',
  ],
  'login.credentials': [
    'Invalid credentials.',
    'Credenciais inválidas.',
    'Identifiants invalides.',
    'Credenciales no válidas.',
  ],
  'login.deactivated': [
    'This account has been deactivated.',
    'Esta conta foi desativada.',
    'Ce compte a été désactivé.',
    'Esta cuenta fue desactivada.',
  ],
  'login.passwordRequired': [
    'Password is required.',
    'A senha é obrigatória.',
    'Le mot de passe est requis.',
    'La contraseña es obligatoria.',
  ],
  'login.emailPassword': [
    'Enter your email and password.',
    'Informe o e-mail e a senha.',
    'Entrez votre courriel et votre mot de passe.',
    'Ingresa tu correo y tu contraseña.',
  ],
  'login.badPassword': [
    'Invalid password.',
    'Senha inválida.',
    'Mot de passe invalide.',
    'Contraseña no válida.',
  ],
  'login.later': [
    'Something went wrong. Try again later.',
    'Algo deu errado. Tente de novo mais tarde.',
    'Un problème est survenu. Réessayez plus tard.',
    'Algo salió mal. Inténtalo más tarde.',
  ],
  'login.emailRequired': [
    'Email is required.',
    'O e-mail é obrigatório.',
    'Le courriel est requis.',
    'El correo es obligatorio.',
  ],
  'login.tooManyRequests': [
    'Too many requests. Try again in 15 minutes.',
    'Pedidos demais. Tente de novo em 15 minutos.',
    'Trop de demandes. Réessayez dans 15 minutes.',
    'Demasiadas solicitudes. Inténtalo de nuevo en 15 minutos.',
  ],
  'login.mailOff': [
    'Email is not configured on this deployment.',
    'O envio de e-mail não está configurado nesta instalação.',
    'L’envoi de courriel n’est pas configuré sur ce déploiement.',
    'El envío de correo no está configurado en esta instalación.',
  ],
  'login.mailFailed': [
    'Could not send the reset email. Try again later.',
    'Não foi possível enviar o e-mail de redefinição. Tente de novo mais tarde.',
    'Impossible d’envoyer le courriel de réinitialisation. Réessayez plus tard.',
    'No se pudo enviar el correo de restablecimiento. Inténtalo más tarde.',
  ],
  'login.tooManyLater': [
    'Too many requests. Try again later.',
    'Pedidos demais. Tente de novo mais tarde.',
    'Trop de demandes. Réessayez plus tard.',
    'Demasiadas solicitudes. Inténtalo más tarde.',
  ],
  'login.badRequest': [
    'Invalid request.',
    'Pedido inválido.',
    'Demande invalide.',
    'Solicitud no válida.',
  ],
  'login.resetRules': [
    'Invalid token or password. Passwords must be at least 12 characters.',
    'Token ou senha inválidos. A senha precisa ter pelo menos 12 caracteres.',
    'Jeton ou mot de passe invalide. Le mot de passe doit compter au moins 12 caractères.',
    'Token o contraseña no válidos. La contraseña debe tener al menos 12 caracteres.',
  ],
  'login.resetExpired': [
    'This password reset link is invalid or has expired.',
    'Este link de redefinição é inválido ou expirou.',
    'Ce lien de réinitialisation est invalide ou expiré.',
    'Este enlace para restablecer la contraseña no es válido o ya venció.',
  ],
  'mfa.codeRequired': [
    'Verification code is required.',
    'O código de verificação é obrigatório.',
    'Le code de vérification est requis.',
    'El código de verificación es obligatorio.',
  ],
  'mfa.setupFirst': [
    'Finish setup before verifying.',
    'Conclua a configuração antes de verificar.',
    'Terminez la configuration avant de vérifier.',
    'Termina la configuración antes de verificar.',
  ],
  'mfa.invalid': [
    'Invalid verification code.',
    'Código de verificação inválido.',
    'Code de vérification invalide.',
    'Código de verificación no válido.',
  ],
  'mfa.disabled': [
    'Two-factor authentication is not enabled.',
    'A verificação em duas etapas não está ativada.',
    'La vérification en deux étapes n’est pas activée.',
    'La verificación en dos pasos no está activada.',
  ],
  'mfa.passwordAndCode': [
    'Password and verification code are required.',
    'Informe a senha e o código de verificação.',
    'Le mot de passe et le code de vérification sont requis.',
    'La contraseña y el código de verificación son obligatorios.',
  ],
  'mfa.expired': [
    'The verification session expired. Sign in again.',
    'A sessão de verificação expirou. Entre de novo.',
    'La session de vérification a expiré. Connectez-vous de nouveau.',
    'La sesión de verificación venció. Inicia sesión de nuevo.',
  ],
  'mfa.tooMany': [
    'Too many attempts. Try again in 15 minutes.',
    'Tentativas demais. Tente de novo em 15 minutos.',
    'Trop de tentatives. Réessayez dans 15 minutes.',
    'Demasiados intentos. Inténtalo de nuevo en 15 minutos.',
  ],
  'mfa.notConfigured': [
    'Two-factor authentication is not set up for this account.',
    'A verificação em duas etapas não está configurada nesta conta.',
    'La vérification en deux étapes n’est pas configurée pour ce compte.',
    'La verificación en dos pasos no está configurada en esta cuenta.',
  ],
  'common.unauthorized': ['You are not signed in.', 'Você não está autenticado.', 'Vous n’êtes pas connecté.', 'No has iniciado sesión.'],
  'common.notFound': ['Not found.', 'Não encontrado.', 'Introuvable.', 'No encontrado.'],
  'common.badJson': ['The request could not be read.', 'Não foi possível ler o pedido.', 'La demande n’a pas pu être lue.', 'No se pudo leer la solicitud.'],
  'common.passwordShort': [
    'Password must be at least 8 characters.',
    'A senha precisa ter pelo menos 8 caracteres.',
    'Le mot de passe doit compter au moins 8 caractères.',
    'La contraseña debe tener al menos 8 caracteres.',
  ],
  'common.emptyName': ['Name cannot be empty.', 'O nome não pode ficar vazio.', 'Le nom ne peut pas être vide.', 'El nombre no puede quedar vacío.'],
  'common.nameRequired': ['Name is required.', 'O nome é obrigatório.', 'Le nom est requis.', 'El nombre es obligatorio.'],
  'common.emailInvalid': ['Enter a valid email.', 'Informe um e-mail válido.', 'Entrez un courriel valide.', 'Ingresa un correo válido.'],
  'common.emailTaken': [
    'An operator with that email already exists.',
    'Já existe um operador com esse e-mail.',
    'Un opérateur avec ce courriel existe déjà.',
    'Ya existe un operador con ese correo.',
  ],
  'common.clientNotFound': ['Client not found.', 'Cliente não encontrado.', 'Client introuvable.', 'Cliente no encontrado.'],
  'common.noEmail': [
    'This client does not have an email address.',
    'Este cliente não tem e-mail.',
    'Ce client n’a pas de courriel.',
    'Este cliente no tiene correo.',
  ],
  'common.alreadyVerified': [
    'This email is already verified.',
    'Este e-mail já está verificado.',
    'Ce courriel est déjà vérifié.',
    'Este correo ya está verificado.',
  ],
  'common.cnpjTaken': [
    'This CNPJ is already assigned to another client.',
    'Este CNPJ já está vinculado a outro cliente.',
    'Ce CNPJ est déjà lié à un autre client.',
    'Este CNPJ ya está asignado a otro cliente.',
  ],
  'common.emailClientTaken': [
    'This email is already assigned to another client.',
    'Este e-mail já está vinculado a outro cliente.',
    'Ce courriel est déjà lié à un autre client.',
    'Este correo ya está asignado a otro cliente.',
  ],
  'common.unique': [
    'A unique field is already in use.',
    'Um campo único já está em uso.',
    'Un champ unique est déjà utilisé.',
    'Un campo único ya está en uso.',
  ],
  'common.deleteFailed': ['Could not delete.', 'Não foi possível excluir.', 'Impossible de supprimer.', 'No se pudo eliminar.'],
  'common.statusRequired': ['Choose a status.', 'Escolha um status.', 'Choisissez un statut.', 'Elige un estado.'],
  'common.invalidStatus': ['Invalid status.', 'Status inválido.', 'Statut invalide.', 'Estado no válido.'],
  'common.invalidPriority': ['Invalid priority.', 'Prioridade inválida.', 'Priorité invalide.', 'Prioridad no válida.'],
  'common.nothing': ['Nothing to update.', 'Nada para atualizar.', 'Rien à mettre à jour.', 'Nada para actualizar.'],
  'common.titleEmpty': ['Title cannot be empty.', 'O título não pode ficar vazio.', 'Le titre ne peut pas être vide.', 'El título no puede quedar vacío.'],
  'activate.fields': [
    'CNPJ, password, and device id are required.',
    'CNPJ, senha e identificador do equipamento são obrigatórios.',
    'Le CNPJ, le mot de passe et l’identifiant de l’appareil sont requis.',
    'CNPJ, contraseña e identificador del equipo son obligatorios.',
  ],
  'activate.cnpj': [
    'Invalid CNPJ or password.',
    'CNPJ ou senha inválidos.',
    'CNPJ ou mot de passe invalide.',
    'CNPJ o contraseña no válidos.',
  ],
  'activate.noSub': [
    'No subscription found for this account.',
    'Nenhuma assinatura encontrada para esta conta.',
    'Aucun abonnement trouvé pour ce compte.',
    'No hay una suscripción para esta cuenta.',
  ],
  'activate.suspended': [
    'The subscription is suspended. Settle the outstanding balance.',
    'A assinatura está suspensa. Quite o saldo em aberto.',
    'L’abonnement est suspendu. Réglez le solde impayé.',
    'La suscripción está suspendida. Paga el saldo pendiente.',
  ],
  'activate.pending': [
    'The subscription is awaiting payment. Settle the outstanding balance.',
    'A assinatura está aguardando pagamento. Quite o saldo em aberto.',
    'L’abonnement est en attente de paiement. Réglez le solde impayé.',
    'La suscripción está pendiente de pago. Paga el saldo pendiente.',
  ],
  'activate.cancelled': [
    'The subscription has been cancelled.',
    'A assinatura foi cancelada.',
    'L’abonnement a été annulé.',
    'La suscripción fue cancelada.',
  ],
  'activate.machine': [
    'CNPJ and device id are required.',
    'CNPJ e identificador do equipamento são obrigatórios.',
    'Le CNPJ et l’identifiant de l’appareil sont requis.',
    'CNPJ e identificador del equipo son obligatorios.',
  ],
  'activate.notThisMachine': [
    'This machine has not been activated.',
    'Esta máquina ainda não foi ativada.',
    'Cet appareil n’a pas été activé.',
    'Este equipo no fue activado.',
  ],
  'activate.keyHw': [
    'License key and device id are required.',
    'A chave de licença e o identificador do equipamento são obrigatórios.',
    'La clé de licence et l’identifiant de l’appareil sont requis.',
    'La clave de licencia y el identificador del equipo son obligatorios.',
  ],
  'activate.busy': [
    'Activation is busy. Try again.',
    'A ativação está ocupada. Tente de novo.',
    'L’activation est occupée. Réessayez.',
    'La activación está ocupada. Inténtalo de nuevo.',
  ],
  'activate.keyMissing': [
    'License key not found.',
    'Chave de licença não encontrada.',
    'Clé de licence introuvable.',
    'Clave de licencia no encontrada.',
  ],
  'activate.alreadyDevice': [
    'Already activated on this device.',
    'Já ativado neste equipamento.',
    'Déjà activé sur cet appareil.',
    'Ya está activado en este equipo.',
  ],
  'activate.ok': [
    'License activated.',
    'Licença ativada.',
    'Licence activée.',
    'Licencia activada.',
  ],
  'activate.valid': [
    'License is valid.',
    'Licença válida.',
    'Licence valide.',
    'Licencia válida.',
  ],
  'activate.keyRequired': [
    'License key is required.',
    'A chave de licença é obrigatória.',
    'La clé de licence est requise.',
    'La clave de licencia es obligatoria.',
  ],
  'activate.misconfigured': [
    'The service is not configured.',
    'O serviço não está configurado.',
    'Le service n’est pas configuré.',
    'El servicio no está configurado.',
  ],
  'activate.revoked': [
    'The license has been revoked.',
    'A licença foi revogada.',
    'La licence a été révoquée.',
    'La licencia fue revocada.',
  ],
  'activate.suspendedLic': [
    'The license is suspended.',
    'A licença está suspensa.',
    'La licence est suspendue.',
    'La licencia está suspendida.',
  ],
  'activate.expired': [
    'The license has expired.',
    'A licença expirou.',
    'La licence est expirée.',
    'La licencia venció.',
  ],
  'activate.seats': [
    'Seat limit reached ({n}/{n}).',
    'Limite de usuários atingido ({n}/{n}).',
    'Limite d’utilisateurs atteinte ({n}/{n}).',
    'Límite de usuarios alcanzado ({n}/{n}).',
  ],
  'product.required': ['Choose a product.', 'Escolha um produto.', 'Choisissez un produit.', 'Elige un producto.'],
  'product.missing': ['Product not found.', 'Produto não encontrado.', 'Produit introuvable.', 'Producto no encontrado.'],
  'product.tier': ['Plan not found.', 'Plano não encontrado.', 'Forfait introuvable.', 'Plan no encontrado.'],
  'product.already': ['Already activated.', 'Já está ativado.', 'Déjà activé.', 'Ya está activado.'],
  'product.nameSlug': ['Name and address are required.', 'Nome e endereço são obrigatórios.', 'Le nom et l’adresse sont requis.', 'El nombre y la dirección son obligatorios.'],
  'product.productRequired': ['Product is required.', 'O produto é obrigatório.', 'Le produit est requis.', 'El producto es obligatorio.'],
  'billing.range': [
    'Billing date must be between 1 and 28.',
    'O dia de vencimento precisa estar entre 1 e 28.',
    'Le jour de facturation doit être entre 1 et 28.',
    'El día de cobro debe estar entre 1 y 28.',
  ],
  'billing.none': ['No subscription found.', 'Nenhuma assinatura encontrada.', 'Aucun abonnement trouvé.', 'No hay una suscripción.'],
  'billing.locked': [
    'The billing date can only change every 3 months. Available on {date}.',
    'O dia de vencimento só pode mudar a cada 3 meses. Disponível em {date}.',
    'Le jour de facturation ne peut changer que tous les 3 mois. Disponible le {date}.',
    'El día de cobro solo puede cambiar cada 3 meses. Disponible el {date}.',
  ],
  'billing.exists': ['A subscription already exists.', 'Já existe uma assinatura.', 'Un abonnement existe déjà.', 'Ya existe una suscripción.'],
  'billing.licenseKey': ['License key is required.', 'A chave de licença é obrigatória.', 'La clé de licence est requise.', 'La clave de licencia es obligatoria.'],
  'billing.seats': [
    'Seat count must be a positive whole number.',
    'A quantidade de usuários precisa ser um número inteiro positivo.',
    'Le nombre d’utilisateurs doit être un entier positif.',
    'La cantidad de usuarios debe ser un entero positivo.',
  ],
  'billing.licenseMissing': [
    'License key not found or not assigned to your account.',
    'Chave de licença não encontrada ou não vinculada à sua conta.',
    'Clé de licence introuvable ou non liée à votre compte.',
    'Clave de licencia no encontrada o no asignada a tu cuenta.',
  ],
  'billing.licenseUsed': [
    'This license key is already activated.',
    'Esta chave de licença já está ativada.',
    'Cette clé de licence est déjà activée.',
    'Esta clave de licencia ya está activada.',
  ],
  'billing.enterprise': [
    'Seat count is over 12,000. Contact us for enterprise pricing.',
    'Mais de 12.000 usuários. Fale conosco para um plano sob consulta.',
    'Plus de 12 000 utilisateurs. Communiquez avec nous pour un tarif sur devis.',
    'Más de 12.000 usuarios. Contáctanos para un precio a medida.',
  ],
  'billing.paid': ['This invoice is already paid.', 'Esta fatura já está paga.', 'Cette facture est déjà payée.', 'Esta factura ya está pagada.'],
  'billing.invoiceMissing': ['Invoice not found.', 'Fatura não encontrada.', 'Facture introuvable.', 'Factura no encontrada.'],
  'billing.payFailed': ['Payment failed.', 'O pagamento falhou.', 'Le paiement a échoué.', 'El pago falló.'],
  'billing.paidLocked': [
    'Paid invoices cannot be removed.',
    'Faturas pagas não podem ser removidas.',
    'Les factures payées ne peuvent pas être retirées.',
    'Las facturas pagadas no se pueden quitar.',
  ],
  'billing.chargeFields': [
    'Type, amount, and due date are required.',
    'Tipo, valor e vencimento são obrigatórios.',
    'Le type, le montant et l’échéance sont requis.',
    'El tipo, el importe y el vencimiento son obligatorios.',
  ],
  'billing.planFlag': [
    'The payment plan setting is invalid.',
    'A configuração do plano de pagamento é inválida.',
    'Le réglage du plan de paiement est invalide.',
    'La configuración del plan de pago no es válida.',
  ],
  'billing.tierRegion': [
    'Subscriber tier and region are required.',
    'A faixa de assinantes e a região são obrigatórias.',
    'Le palier d’abonnés et la région sont requis.',
    'El nivel de abonados y la región son obligatorios.',
  ],
  'billing.region': [
    'Invalid region. Use BR, CA, US, or GB.',
    'Região inválida. Use BR, CA, US ou GB.',
    'Région invalide. Utilisez BR, CA, US ou GB.',
    'Región no válida. Usa BR, CA, US o GB.',
  ],
  'billing.tier': ['Unknown subscriber tier.', 'Faixa de assinantes desconhecida.', 'Palier d’abonnés inconnu.', 'Nivel de abonados desconocido.'],
  'billing.quote': [
    'This tier needs a custom quote. Contact sales.',
    'Esta faixa precisa de cotação. Fale com o comercial.',
    'Ce palier exige un devis. Communiquez avec les ventes.',
    'Este nivel necesita una cotización. Contacta a ventas.',
  ],
  'billing.clientSub': [
    'No subscription found for this client.',
    'Nenhuma assinatura encontrada para este cliente.',
    'Aucun abonnement trouvé pour ce client.',
    'No hay una suscripción para este cliente.',
  ],
  'grace.suspendedOnly': [
    'Grace is only available for suspended subscriptions.',
    'A extensão de prazo só vale para assinaturas suspensas.',
    'Le délai de grâce n’est offert que pour les abonnements suspendus.',
    'El plazo solo está disponible para suscripciones suspendidas.',
  ],
  'grace.used': [
    'Grace was already used this month.',
    'A extensão de prazo já foi usada neste mês.',
    'Le délai de grâce a déjà été utilisé ce mois-ci.',
    'El plazo ya se usó este mes.',
  ],
  'grace.cancelled': [
    'Grace cannot be extended on a cancelled subscription.',
    'Não é possível estender o prazo de uma assinatura cancelada.',
    'Impossible de prolonger le délai d’un abonnement annulé.',
    'No se puede ampliar el plazo de una suscripción cancelada.',
  ],
  'grace.badDate': [
    'Pick a valid date on the calendar.',
    'Escolha uma data válida no calendário.',
    'Choisissez une date valide au calendrier.',
    'Elige una fecha válida en el calendario.',
  ],
  'grace.future': [
    'The grace date must be in the future.',
    'A data do prazo precisa ser futura.',
    'La date du délai doit être dans le futur.',
    'La fecha del plazo tiene que ser futura.',
  ],
  'grace.max': [
    'Grace cannot extend more than {n} days.',
    'O prazo não pode passar de {n} dias.',
    'Le délai ne peut pas dépasser {n} jours.',
    'El plazo no puede superar {n} días.',
  ],
  'grace.range': [
    'Enter between {min} and {max} extra days.',
    'Informe entre {min} e {max} dias a mais.',
    'Entrez entre {min} et {max} jours supplémentaires.',
    'Ingresa entre {min} y {max} días extra.',
  ],
  'ticket.closed': ['This ticket is closed.', 'Este chamado está fechado.', 'Ce ticket est fermé.', 'Este ticket está cerrado.'],
  'ticket.empty': ['Message cannot be empty.', 'A mensagem não pode ficar vazia.', 'Le message ne peut pas être vide.', 'El mensaje no puede quedar vacío.'],
  'ticket.required': [
    'Title and message are required.',
    'Assunto e mensagem são obrigatórios.',
    'Le sujet et le message sont requis.',
    'El asunto y el mensaje son obligatorios.',
  ],
  'ticket.adminRequired': [
    'Client, title, and message are required.',
    'Cliente, assunto e mensagem são obrigatórios.',
    'Le client, le sujet et le message sont requis.',
    'El cliente, el asunto y el mensaje son obligatorios.',
  ],
  'team.role': [
    'Invalid role. Use owner, admin, support, or helper.',
    'Função inválida. Use owner, admin, support ou helper.',
    'Rôle invalide. Utilisez owner, admin, support ou helper.',
    'Rol no válido. Usa owner, admin, support o helper.',
  ],
  'team.self': [
    'You cannot deactivate your own account.',
    'Você não pode desativar a própria conta.',
    'Vous ne pouvez pas désactiver votre propre compte.',
    'No puedes desactivar tu propia cuenta.',
  ],
  'team.lastOwner': [
    'Cannot remove the last active owner or admin.',
    'Não é possível remover o último owner ou admin ativo.',
    'Impossible de retirer le dernier owner ou admin actif.',
    'No se puede quitar al último owner o admin activo.',
  ],
  'license.revoke': [
    'Owner or admin role is required to revoke licenses.',
    'Só owner ou admin pode revogar licenças.',
    'Seuls les rôles owner ou admin peuvent révoquer une licence.',
    'Solo un owner o admin puede revocar licencias.',
  ],
  'license.seats': [
    'Seat count must be a positive whole number.',
    'A quantidade de usuários precisa ser um número inteiro positivo.',
    'Le nombre d’utilisateurs doit être un entier positif.',
    'La cantidad de usuarios debe ser un entero positivo.',
  ],
  'license.fields': [
    'Contract, product, plan, due date, and tenant address are required.',
    'Contrato, produto, plano, vencimento e endereço da instância são obrigatórios.',
    'Le contrat, le produit, le forfait, l’échéance et l’adresse de l’instance sont requis.',
    'Contrato, producto, plan, vencimiento y dirección de la instancia son obligatorios.',
  ],
  'docs.file': ['A file is required.', 'É preciso enviar um arquivo.', 'Un fichier est requis.', 'Hay que adjuntar un archivo.'],
  'docs.type': ['Invalid document type.', 'Tipo de documento inválido.', 'Type de document invalide.', 'Tipo de documento no válido.'],
  'docs.size': ['The file is larger than 10 MB.', 'O arquivo passa de 10 MB.', 'Le fichier dépasse 10 Mo.', 'El archivo supera los 10 MB.'],
  'docs.kind': [
    'Only PDF and image files are allowed.',
    'Somente PDF e imagens são aceitos.',
    'Seuls les PDF et les images sont acceptés.',
    'Solo se aceptan PDF e imágenes.',
  ],
  'notes.body': ['Note text is required.', 'O texto da nota é obrigatório.', 'Le texte de la note est requis.', 'El texto de la nota es obligatorio.'],
  'notes.id': ['Choose a note.', 'Escolha uma nota.', 'Choisissez une note.', 'Elige una nota.'],
  'product.statusOrTier': [
    'Status or plan is required.',
    'Informe o status ou o plano.',
    'Le statut ou le forfait est requis.',
    'El estado o el plan es obligatorio.',
  ],
  'common.forbidden': [
    'You do not have access to that.',
    'Você não tem acesso a isso.',
    'Vous n’avez pas accès à ça.',
    'No tienes acceso a eso.',
  ],
  'signup.disabled': [
    'Public signup is turned off.',
    'O cadastro público está desativado.',
    'L’inscription publique est désactivée.',
    'El registro público está desactivado.',
  ],
  'signup.body': [
    'That request is not valid.',
    'Essa solicitação não é válida.',
    'Cette requête n’est pas valide.',
    'Esa solicitud no es válida.',
  ],
  'signup.slug': [
    'That URL is not valid.',
    'Esse endereço (URL) não é válido.',
    'Cet identifiant URL n’est pas valide.',
    'Esa dirección (URL) no es válida.',
  ],
  'signup.password': [
    'Use at least 8 characters in the password.',
    'Use pelo menos 8 caracteres na senha.',
    'Utilisez au moins 8 caractères dans le mot de passe.',
    'Usa al menos 8 caracteres en la contraseña.',
  ],
  'signup.emailTaken': [
    'That email is already in use.',
    'Esse e-mail já está em uso.',
    'Ce courriel est déjà utilisé.',
    'Ese correo ya está en uso.',
  ],
  'signup.slugTaken': [
    'That URL is already in use.',
    'Esse endereço (URL) já está em uso.',
    'Cet identifiant URL est déjà utilisé.',
    'Esa dirección (URL) ya está en uso.',
  ],
  'signup.usernameTaken': [
    'That username is already in use.',
    'Esse nome de usuário já está em uso.',
    'Ce nom d’utilisateur est déjà utilisé.',
    'Ese nombre de usuario ya está en uso.',
  ],
  'signup.failed': [
    'Signup did not go through. Try again.',
    'O cadastro não foi concluído. Tente de novo.',
    'L’inscription n’a pas abouti. Réessayez.',
    'El registro no se completó. Inténtalo de nuevo.',
  ],
  'signup.company': [
    'Company name is required.',
    'O nome da empresa é obrigatório.',
    'Le nom de l’entreprise est requis.',
    'El nombre de la empresa es obligatorio.',
  ],
  'signup.unavailable': [
    'We could not check availability. Try again in a moment.',
    'Não foi possível verificar a disponibilidade. Tente de novo em instantes.',
    'Impossible de vérifier la disponibilité. Réessayez dans un instant.',
    'No se pudo comprobar la disponibilidad. Inténtalo de nuevo en un momento.',
  ],
  'register.name': [
    'First and last name are required.',
    'Nome e sobrenome são obrigatórios.',
    'Le prénom et le nom sont requis.',
    'El nombre y el apellido son obligatorios.',
  ],
  'register.financeEmail': [
    'The billing email is required.',
    'O e-mail financeiro é obrigatório.',
    'Le courriel de facturation est requis.',
    'El correo de facturación es obligatorio.',
  ],
  'register.password': [
    'A password is required.',
    'A senha é obrigatória.',
    'Un mot de passe est requis.',
    'La contraseña es obligatoria.',
  ],
  'register.terms': [
    'You need to accept the Terms of Service.',
    'Você precisa aceitar os Termos de Serviço.',
    'Vous devez accepter les conditions d’utilisation.',
    'Tienes que aceptar los Términos del servicio.',
  ],
  'register.captcha': [
    'The reCAPTCHA check failed. Try again.',
    'A verificação reCAPTCHA falhou. Tente de novo.',
    'La vérification reCAPTCHA a échoué. Réessayez.',
    'La verificación reCAPTCHA falló. Inténtalo de nuevo.',
  ],
  'register.emailExists': [
    'An account with this email already exists.',
    'Já existe uma conta com este e-mail.',
    'Un compte existe déjà avec ce courriel.',
    'Ya existe una cuenta con este correo.',
  ],
  'register.cnpjExists': [
    'An account with this CNPJ already exists.',
    'Já existe uma conta com este CNPJ.',
    'Un compte existe déjà avec ce CNPJ.',
    'Ya existe una cuenta con este CNPJ.',
  ],
  'register.subdomain': [
    'This subdomain is already in use.',
    'Este subdomínio já está em uso.',
    'Ce sous-domaine est déjà utilisé.',
    'Este subdominio ya está en uso.',
  ],
  'register.subdomainIsp': [
    'This subdomain is already in use on TurboISP.',
    'Este subdomínio já está em uso no TurboISP.',
    'Ce sous-domaine est déjà utilisé sur TurboISP.',
    'Este subdominio ya está en uso en TurboISP.',
  ],
  'register.slugShort': [
    'The name needs at least 3 characters.',
    'O nome precisa de pelo menos 3 caracteres.',
    'Le nom doit compter au moins 3 caractères.',
    'El nombre necesita al menos 3 caracteres.',
  ],
  'register.reserved': [
    'This subdomain is reserved.',
    'Este subdomínio é reservado.',
    'Ce sous-domaine est réservé.',
    'Este subdominio está reservado.',
  ],
  'slug.charset': [
    'Use letters or numbers (a–z, 0–9).',
    'Use letras ou números (a–z, 0–9).',
    'Utilisez des lettres ou des chiffres (a–z, 0–9).',
    'Usa letras o números (a–z, 0–9).',
  ],
  'slug.reserved': [
    '{slug} is reserved. Try a name like acme or northnet.',
    '{slug} é reservado. Tente um nome como acme ou northnet.',
    '{slug} est réservé. Essayez un nom comme acme ou northnet.',
    '{slug} está reservado. Prueba un nombre como acme o northnet.',
  ],
  'slug.short': [
    'The subdomain needs at least 3 characters.',
    'O subdomínio precisa de pelo menos 3 caracteres.',
    'Le sous-domaine doit compter au moins 3 caractères.',
    'El subdominio necesita al menos 3 caracteres.',
  ],
  'slug.format': [
    'Use lowercase letters, numbers, and hyphens. It cannot start or end with a hyphen.',
    'Use letras minúsculas, números e hífens. Não pode começar nem terminar com hífen.',
    'Utilisez des minuscules, des chiffres et des tirets. Il ne peut pas commencer ni finir par un tiret.',
    'Usa minúsculas, números y guiones. No puede empezar ni terminar con un guion.',
  ],
  'verify.required': [
    'The verification link is missing its token.',
    'O link de verificação está sem o token.',
    'Le lien de vérification n’a pas de jeton.',
    'Al enlace de verificación le falta el token.',
  ],
  'verify.used': [
    'This verification link is invalid or was already used.',
    'Este link de verificação é inválido ou já foi usado.',
    'Ce lien de vérification est invalide ou a déjà été utilisé.',
    'Este enlace de verificación no es válido o ya se usó.',
  ],
  'verify.expired': [
    'This verification link has expired. Contact support.',
    'Este link de verificação expirou. Fale com o suporte.',
    'Ce lien de vérification a expiré. Contactez le soutien.',
    'Este enlace de verificación venció. Contacta a soporte.',
  ],
  'billing.statusList': [
    'Invalid status. Use one of: {list}.',
    'Status inválido. Use um destes: {list}.',
    'Statut invalide. Utilisez l’un de ceux-ci: {list}.',
    'Estado no válido. Usa uno de estos: {list}.',
  ],
  'billing.transition': [
    'That status change is not allowed: {from} → {to}.',
    'Essa troca de status não é permitida: {from} → {to}.',
    'Ce changement de statut n’est pas permis: {from} → {to}.',
    'Ese cambio de estado no está permitido: {from} → {to}.',
  ],
  'billing.invoiceStatus': [
    'This invoice cannot be paid. Current status: {status}.',
    'Esta fatura não pode ser paga. Status atual: {status}.',
    'Cette facture ne peut pas être payée. Statut actuel: {status}.',
    'Esta factura no se puede pagar. Estado actual: {status}.',
  ],
  'billing.gateway': [
    'The payment gateway did not respond. Try again.',
    'O gateway de pagamento não respondeu. Tente de novo.',
    'La passerelle de paiement n’a pas répondu. Réessayez.',
    'La pasarela de pago no respondió. Inténtalo de nuevo.',
  ],
  'agent.identity': [
    'Provide a tenant slug or a valid 14-digit CNPJ.',
    'Informe o identificador da instância ou um CNPJ válido de 14 dígitos.',
    'Indiquez l’identifiant de l’instance ou un CNPJ valide de 14 chiffres.',
    'Indica el identificador de la instancia o un CNPJ válido de 14 dígitos.',
  ],
  'agent.fields': [
    'activeSubscribers and hardwareId are required.',
    'activeSubscribers e hardwareId são obrigatórios.',
    'activeSubscribers et hardwareId sont requis.',
    'activeSubscribers y hardwareId son obligatorios.',
  ],
  'agent.counts': [
    'Counts must be zero or greater.',
    'As contagens precisam ser zero ou mais.',
    'Les quantités doivent être de zéro ou plus.',
    'Los conteos deben ser cero o más.',
  ],
  'agent.client': [
    'No client matches that identity.',
    'Nenhum cliente corresponde a essa identidade.',
    'Aucun client ne correspond à cette identité.',
    'Ningún cliente corresponde a esa identidad.',
  ],
  'agent.noSub': [
    'No active subscription was found for this client.',
    'Não há assinatura ativa para este cliente.',
    'Aucun abonnement actif n’a été trouvé pour ce client.',
    'No hay una suscripción activa para este cliente.',
  ],
  'agent.inactive': [
    'The subscription is not active (status: {status}).',
    'A assinatura não está ativa (status: {status}).',
    'L’abonnement n’est pas actif (statut: {status}).',
    'La suscripción no está activa (estado: {status}).',
  ],
  'agent.manual': [
    'The new tier needs a manual price. Contact support.',
    'O novo plano precisa de preço manual. Fale com o suporte.',
    'Le nouveau forfait exige un prix manuel. Contactez le soutien.',
    'El nuevo plan necesita un precio manual. Contacta a soporte.',
  ],
} as const

type ApiKey = keyof typeof rows
type Bundle = Record<ApiKey, string>

function bundle(index: 0 | 1 | 2 | 3): Bundle {
  const out = {} as Bundle
  for (const key of Object.keys(rows) as ApiKey[]) out[key] = rows[key][index]
  return out
}

export const apiErrorLocales = {
  en: bundle(0),
  'pt-BR': bundle(1),
  'fr-CA': bundle(2),
  es: bundle(3),
}

export type ApiErrorKey = ApiKey

/** Exact server strings (and the one Portuguese login message) mapped to keys. */
export const API_ERROR_EXACT: Record<string, ApiErrorKey> = {
  'Too many login attempts. Please try again in 15 minutes.': 'login.tooMany',
  'Email or business number and password are required': 'login.required',
  'Invalid email, business number, or password': 'login.invalid',
  'Por favor, verifique seu e-mail antes de fazer login.': 'login.verify',
  'Invalid credentials': 'login.credentials',
  'This account has been deactivated': 'login.deactivated',
  'Password is required': 'login.passwordRequired',
  'Please provide your email and password': 'login.emailPassword',
  'Invalid password': 'login.badPassword',
  'Internal server error. Please try again later.': 'login.later',
  'Email is required.': 'login.emailRequired',
  'Too many requests. Please try again in 15 minutes.': 'login.tooManyRequests',
  'Email service is not configured on this deployment.': 'login.mailOff',
  'Could not send reset email. Please try again later.': 'login.mailFailed',
  'Too many requests. Please try again later.': 'login.tooManyLater',
  'Invalid request.': 'login.badRequest',
  'Invalid token or password. Passwords must be at least 12 characters.': 'login.resetRules',
  'This password reset link is invalid or has expired.': 'login.resetExpired',
  'Verification code is required': 'mfa.codeRequired',
  'Run setup first': 'mfa.setupFirst',
  'Invalid verification code': 'mfa.invalid',
  'MFA is not enabled': 'mfa.disabled',
  'Password and verification code are required': 'mfa.passwordAndCode',
  'MFA session expired. Sign in again.': 'mfa.expired',
  'Too many attempts. Please try again in 15 minutes.': 'mfa.tooMany',
  'MFA is not configured for this account': 'mfa.notConfigured',
  Unauthorized: 'common.unauthorized',
  'Not found': 'common.notFound',
  'Invalid JSON body': 'common.badJson',
  'Invalid or missing request body': 'common.badJson',
  'Password must be at least 8 characters.': 'common.passwordShort',
  'Password must be at least 8 characters': 'common.passwordShort',
  'Name cannot be empty': 'common.emptyName',
  'name cannot be empty': 'common.emptyName',
  'name is required': 'common.nameRequired',
  'A valid email is required': 'common.emailInvalid',
  'An operator with that email already exists': 'common.emailTaken',
  'Client not found': 'common.clientNotFound',
  'Client not found.': 'common.clientNotFound',
  'Client does not have an email address.': 'common.noEmail',
  'Client email is already verified.': 'common.alreadyVerified',
  'This CNPJ is already assigned to another client.': 'common.cnpjTaken',
  'This email is already assigned to another client.': 'common.emailClientTaken',
  'A unique field is already in use.': 'common.unique',
  'Delete failed': 'common.deleteFailed',
  'status required': 'common.statusRequired',
  'Invalid status': 'common.invalidStatus',
  'Invalid priority': 'common.invalidPriority',
  'Nothing to update': 'common.nothing',
  'No updates provided': 'common.nothing',
  'Title cannot be empty': 'common.titleEmpty',
  'cnpj, password, and hardwareId are required': 'activate.fields',
  'Invalid CNPJ or password': 'activate.cnpj',
  'No subscription found for this account': 'activate.noSub',
  'Subscription is suspended. Please settle your outstanding balance.': 'activate.suspended',
  'Subscription is pending payment. Please settle your outstanding balance.': 'activate.pending',
  'Subscription has been cancelled.': 'activate.cancelled',
  'cnpj and hardwareId are required': 'activate.machine',
  'Unauthorized — this machine has not been activated': 'activate.notThisMachine',
  'key and hardwareId are required': 'activate.keyHw',
  'Activation is busy. Please retry.': 'activate.busy',
  'License key not found.': 'activate.keyMissing',
  'Already activated on this device.': 'activate.alreadyDevice',
  'License activated successfully.': 'activate.ok',
  'License is valid.': 'activate.valid',
  'key is required': 'activate.keyRequired',
  'Service misconfigured': 'activate.misconfigured',
  'License has been revoked.': 'activate.revoked',
  'License is suspended.': 'activate.suspendedLic',
  'License has expired.': 'activate.expired',
  'productId required': 'product.required',
  'Product not found': 'product.missing',
  'Tier not found': 'product.tier',
  'Already activated': 'product.already',
  'name and slug required': 'product.nameSlug',
  'product is required': 'product.productRequired',
  'status or tierId is required': 'product.statusOrTier',
  'Billing date must be between 1 and 28.': 'billing.range',
  'No subscription found.': 'billing.none',
  'Subscription already exists.': 'billing.exists',
  'License key is required.': 'billing.licenseKey',
  'Seat count must be a positive integer.': 'billing.seats',
  'License key not found or not assigned to your account.': 'billing.licenseMissing',
  'This license key is already activated.': 'billing.licenseUsed',
  'Seat count exceeds 12,000. Please contact us for enterprise pricing.': 'billing.enterprise',
  'Invoice already paid': 'billing.paid',
  'Invoice not found': 'billing.invoiceMissing',
  'Pay failed': 'billing.payFailed',
  'Paid invoices cannot be removed': 'billing.paidLocked',
  'type, amount, and dueDate are required': 'billing.chargeFields',
  'paymentPlanAllowed must be a boolean': 'billing.planFlag',
  'subscriberTier and region are required': 'billing.tierRegion',
  'Invalid region. Must be BR, CA, US, or GB.': 'billing.region',
  'Unknown subscriber tier.': 'billing.tier',
  'This tier requires a custom quote. Please contact sales.': 'billing.quote',
  'No subscription found for this client.': 'billing.clientSub',
  'Grace period is only available for suspended subscriptions.': 'grace.suspendedOnly',
  'Grace period already used this month.': 'grace.used',
  'Cannot extend grace on a cancelled subscription.': 'grace.cancelled',
  'Pick a valid date on the calendar.': 'grace.badDate',
  'The grace date must be in the future.': 'grace.future',
  'Ticket is closed': 'ticket.closed',
  'Message cannot be empty': 'ticket.empty',
  'Title and message are required': 'ticket.required',
  'clientId, title, and message are required': 'ticket.adminRequired',
  'Invalid role. Use owner, admin, support, or helper.': 'team.role',
  'You cannot deactivate your own account': 'team.self',
  'Cannot remove the last active owner/admin': 'team.lastOwner',
  'Owner or admin role required to revoke licenses': 'license.revoke',
  'maxSeats must be a positive integer.': 'license.seats',
  'contractId, productId, tierId, dueDate, and tenantSlug are required': 'license.fields',
  'A file is required': 'docs.file',
  'Invalid document type': 'docs.type',
  'File is larger than 10 MB': 'docs.size',
  'Only PDF and image files are allowed': 'docs.kind',
  'Note body is required': 'notes.body',
  'noteId required': 'notes.id',
  Forbidden: 'common.forbidden',
  'public signup is disabled': 'signup.disabled',
  'invalid request body': 'signup.body',
  'invalid slug': 'signup.slug',
  'password must be at least 8 characters': 'signup.password',
  'email already in use': 'signup.emailTaken',
  'slug already in use': 'signup.slugTaken',
  'username already in use': 'signup.usernameTaken',
  'signup failed': 'signup.failed',
  'company name required': 'signup.company',
  'Could not check availability': 'signup.unavailable',
  'Billing database unavailable. Ensure TURBOWARE_DB is set and run: npx prisma db push': 'signup.unavailable',
  'Nome e sobrenome são obrigatórios.': 'register.name',
  'Email financeiro é obrigatório.': 'register.financeEmail',
  'A senha é obrigatória.': 'register.password',
  'Você precisa concordar com os Termos de Serviços.': 'register.terms',
  'Verificação reCAPTCHA falhou. Tente novamente.': 'register.captcha',
  'An account with this email already exists.': 'register.emailExists',
  'An account with this CNPJ already exists.': 'register.cnpjExists',
  'Este subdomínio já está em uso.': 'register.subdomain',
  'Este subdomínio já está em uso no TurboISP.': 'register.subdomainIsp',
  'Nome deve ter pelo menos 3 caracteres.': 'register.slugShort',
  'Este subdomínio é reservado.': 'register.reserved',
  'Não foi possível verificar disponibilidade. Tente novamente.': 'signup.unavailable',
  'Subdomain must use letters or numbers (a–z, 0–9)': 'slug.charset',
  'Subdomain must be at least 3 characters': 'slug.short',
  'Use lowercase letters, numbers, and hyphens; it cannot start or end with a hyphen': 'slug.format',
  'Verification token is required': 'verify.required',
  'Invalid or already used verification token': 'verify.used',
  'Verification token has expired. Please contact support.': 'verify.expired',
  'Gateway error': 'billing.gateway',
  'Provide tenantSlug or a valid 14-digit cnpj': 'agent.identity',
  'Missing required fields: activeSubscribers, hardwareId': 'agent.fields',
  'Counts must be >= 0': 'agent.counts',
  'Client not found for provided identity': 'agent.client',
  'No active subscription found for client': 'agent.noSub',
  'New tier requires manual pricing. Contact support.': 'agent.manual',
}

function fill(template: string, vars: Record<string, string | number>) {
  let out = template
  for (const [name, value] of Object.entries(vars)) out = out.replaceAll(`{${name}}`, String(value))
  return out
}

function text(lang: ClientLang, key: ApiErrorKey, vars?: Record<string, string | number>) {
  return fill(apiErrorLocales[lang][key], vars ?? {})
}

function relocalizePtDate(raw: string, lang: ClientLang): string {
  const match = raw.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (!match) return raw
  const day = Number(match[1])
  const month = Number(match[2])
  const year = Number(match[3])
  const date = new Date(Date.UTC(year, month - 1, day))
  if (Number.isNaN(date.getTime())) return raw
  return new Intl.DateTimeFormat(clientDateLocale(lang), { timeZone: 'UTC', dateStyle: 'medium' }).format(date)
}

/** Translate a known server error. Returns null when the string is not in the map. */
export function translateApiError(message: string | null | undefined, lang: string): string | null {
  if (!message) return null
  const locale = parseClientLang(lang === 'en' ? 'en' : lang)
  const exact = API_ERROR_EXACT[message]
  if (exact) return text(locale, exact)

  const billing = message.match(/^Billing date can only be changed every 3 months\. Available on (.+)\.$/)
  if (billing) return text(locale, 'billing.locked', { date: relocalizePtDate(billing[1] ?? '', locale) })

  const graceMax = message.match(/^Grace cannot extend more than (\d+) days\.$/)
  if (graceMax) return text(locale, 'grace.max', { n: graceMax[1] ?? '' })

  const graceRange = message.match(/^Enter between (\d+) and (\d+) extra days\.$/)
  if (graceRange) return text(locale, 'grace.range', { min: graceRange[1] ?? '', max: graceRange[2] ?? '' })

  const seats = message.match(/^Seat limit reached \((\d+)\/\1\)\.$/)
  if (seats) return text(locale, 'activate.seats', { n: seats[1] ?? '' })

  const statusList = message.match(/^Invalid status\. Must be one of: (.+)$/)
  if (statusList) return text(locale, 'billing.statusList', { list: statusList[1] ?? '' })

  const transition = message.match(/^Invalid transition: (.+) → (.+)$/)
  if (transition) return text(locale, 'billing.transition', { from: transition[1] ?? '', to: transition[2] ?? '' })

  const invoiceStatus = message.match(/^Invoice cannot be paid — current status: (.+)$/)
  if (invoiceStatus) return text(locale, 'billing.invoiceStatus', { status: invoiceStatus[1] ?? '' })

  const reserved = message.match(/^"([^"]+)" is reserved\. Try a company name like acme or northnet\.$/)
  if (reserved) return text(locale, 'slug.reserved', { slug: reserved[1] ?? '' })

  const inactive = message.match(/^Subscription is not active \(status: (.+)\)$/)
  if (inactive) return text(locale, 'agent.inactive', { status: inactive[1] ?? '' })

  return null
}

/** Known translation, otherwise the original server string. */
export function explainApiError(message: string | null | undefined, lang: string): string {
  if (!message) return ''
  return translateApiError(message, lang) ?? message
}
