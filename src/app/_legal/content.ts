import { LEGAL_PLACEHOLDERS as P, type LegalSection } from './_components/LegalDoc'

const empresaPt = `${P.razaoSocial}, inscrita no CNPJ sob o nº ${P.cnpj}, com sede em ${P.endereco}`
const companyEn = `${P.razaoSocial}, CNPJ ${P.cnpj}, headquartered at ${P.endereco}`

export const privacyPt: LegalSection[] = [
  { title: '1. Quem somos', body: [`Esta Política de Privacidade descreve como ${empresaPt} ("TurboISP", "Turboware", "nós"), atuando como controladora, trata dados pessoais nos termos da Lei nº 13.709/2018 (Lei Geral de Proteção de Dados – LGPD).`] },
  { title: '2. Dados que coletamos', body: ['Dados cadastrais (nome, razão social, CPF/CNPJ, e-mail, telefone, endereço); dados de acesso (credenciais, registros de login, endereço IP, data e hora); dados de faturamento e pagamento (processados por provedores como Asaas e Stripe; não armazenamos dados completos de cartão); dados que nossos clientes provedores inserem na plataforma sobre seus próprios assinantes, em relação aos quais atuamos como operadora.'] },
  { title: '3. Finalidades e bases legais', body: ['Tratamos dados para: prestar e operar o serviço (execução de contrato, art. 7º, V); faturamento e obrigações fiscais (cumprimento de obrigação legal, art. 7º, II); segurança, prevenção a fraudes e registros de acesso exigidos pelo Marco Civil da Internet (obrigação legal e legítimo interesse, art. 7º, IX); comunicações sobre o serviço; e, quando aplicável, mediante consentimento, que pode ser revogado a qualquer momento.'] },
  { title: '4. Compartilhamento', body: ['Compartilhamos dados apenas com operadores necessários à prestação do serviço (hospedagem e infraestrutura em nuvem, processadores de pagamento, envio de e-mail, verificação anti-robô), com autoridades quando exigido por lei ou ordem judicial, e em caso de reorganização societária. Não vendemos dados pessoais.'] },
  { title: '5. Transferência internacional', body: ['Alguns fornecedores podem armazenar dados fora do Brasil. Nesses casos, adotamos as salvaguardas previstas no art. 33 da LGPD, como cláusulas contratuais padrão.'] },
  { title: '6. Retenção', body: ['Mantemos os dados pelo tempo necessário às finalidades acima, ao cumprimento de obrigações legais (por exemplo, registros de acesso por no mínimo 6 meses e documentos fiscais pelo prazo legal) e ao exercício regular de direitos. Após esse período, os dados são excluídos ou anonimizados.'] },
  { title: '7. Seus direitos', body: ['Nos termos do art. 18 da LGPD, você pode solicitar: confirmação da existência de tratamento; acesso; correção; anonimização, bloqueio ou eliminação de dados desnecessários; portabilidade; informação sobre compartilhamento; revogação de consentimento; e revisão de decisões automatizadas. Você também pode peticionar à Autoridade Nacional de Proteção de Dados (ANPD).'] },
  { title: '8. Segurança', body: ['Adotamos medidas técnicas e administrativas para proteger os dados, incluindo criptografia em trânsito, controle de acesso, autenticação multifator para administradores e registros de auditoria. Incidentes relevantes serão comunicados aos titulares e à ANPD conforme a lei.'] },
  { title: '9. Cookies', body: ['Utilizamos cookies estritamente necessários para autenticação e segurança da sessão. Não utilizamos cookies de publicidade.'] },
  { title: '10. Encarregado (DPO) e contato', body: [`Encarregado pelo tratamento de dados pessoais: ${P.dpoNome} – ${P.dpoEmail}. Contato geral: ${P.contatoEmail}.`] },
  { title: '11. Alterações', body: ['Esta política pode ser atualizada. A versão vigente estará sempre disponível nesta página, com a data da última atualização.'] },
]

export const privacyEn: LegalSection[] = [
  { title: '1. Who we are', body: [`This Privacy Policy explains how ${companyEn} ("TurboISP", "Turboware", "we"), as data controller, processes personal data under Brazil's General Data Protection Law (Law 13,709/2018 – LGPD).`] },
  { title: '2. Data we collect', body: ['Account data (name, company name, tax ID, email, phone, address); access data (credentials, login records, IP address, timestamps); billing and payment data (processed by providers such as Asaas and Stripe; we do not store full card data); data our ISP customers enter about their own subscribers, for which we act as processor.'] },
  { title: '3. Purposes and legal bases', body: ['We process data to provide and operate the service (performance of contract); for billing and tax obligations (legal obligation); for security, fraud prevention and access logs required by the Brazilian Internet Civil Framework (legal obligation and legitimate interest); for service communications; and, where applicable, based on consent, which you may withdraw at any time.'] },
  { title: '4. Sharing', body: ['We share data only with processors needed to provide the service (cloud hosting, payment processors, email delivery, bot protection), with authorities when required by law or court order, and in a corporate reorganization. We do not sell personal data.'] },
  { title: '5. International transfers', body: ['Some providers may store data outside Brazil. In such cases we rely on the safeguards in LGPD article 33, such as standard contractual clauses.'] },
  { title: '6. Retention', body: ['We keep data as long as needed for the purposes above, to meet legal obligations (e.g. access logs for at least 6 months and tax records for the statutory period) and to exercise legal rights. Afterwards data is deleted or anonymized.'] },
  { title: '7. Your rights', body: ['Under LGPD article 18 you may request confirmation of processing, access, correction, anonymization, blocking or deletion, portability, information about sharing, withdrawal of consent and review of automated decisions. You may also file a complaint with the ANPD (Brazilian data protection authority).'] },
  { title: '8. Security', body: ['We apply technical and organizational measures including encryption in transit, access control, multi-factor authentication for administrators and audit logs. Relevant incidents will be reported to data subjects and the ANPD as required by law.'] },
  { title: '9. Cookies', body: ['We use only strictly necessary cookies for authentication and session security. We do not use advertising cookies.'] },
  { title: '10. Data Protection Officer and contact', body: [`Data Protection Officer (Encarregado): ${P.dpoNome} – ${P.dpoEmail}. General contact: ${P.contatoEmail}.`] },
  { title: '11. Changes', body: ['We may update this policy. The current version, with its last-updated date, is always available on this page.'] },
]

export const termsPt: LegalSection[] = [
  { title: '1. Partes', body: [`Estes Termos de Uso regulam o uso das plataformas TurboISP e Turboware, fornecidas por ${empresaPt}. Ao contratar ou utilizar o serviço, você concorda com estes termos e com a Política de Privacidade.`] },
  { title: '2. Descrição do serviço', body: ['Plataforma de gestão para provedores de internet e telecom, incluindo CRM, faturamento, automação, monitoramento, GIS e documentação de rede, oferecida como software como serviço (SaaS).'] },
  { title: '3. Conta', body: ['Você é responsável pela veracidade dos dados cadastrais, pela confidencialidade das credenciais e por todas as atividades realizadas em sua conta. Recomendamos o uso de autenticação multifator.'] },
  { title: '4. Assinatura e pagamento', body: ['O serviço é cobrado por assinatura mensal ou anual, conforme o plano contratado. O não pagamento pode resultar em suspensão após o período de tolerância. Valores podem ser reajustados mediante aviso prévio de 30 dias.'] },
  { title: '5. Uso aceitável', body: ['É vedado usar o serviço para atividades ilegais, tentar acesso não autorizado, interferir na operação do sistema ou revender o serviço sem autorização.'] },
  { title: '6. Dados e LGPD', body: ['Os dados inseridos por você permanecem de sua titularidade. Em relação aos dados dos seus assinantes, você é o controlador e nós atuamos como operador, tratando-os apenas conforme suas instruções e para a prestação do serviço, nos termos da LGPD.'] },
  { title: '7. Disponibilidade', body: ['Empregamos esforços razoáveis para manter o serviço disponível, mas ele pode sofrer interrupções para manutenção ou por fatores fora do nosso controle.'] },
  { title: '8. Limitação de responsabilidade', body: ['Na máxima extensão permitida pela lei, não nos responsabilizamos por lucros cessantes, perda de receita, interrupções de rede de terceiros ou erros de configuração realizados pelo cliente. Nossa responsabilidade total limita-se aos valores pagos nos 12 meses anteriores ao evento.'] },
  { title: '9. Cancelamento e suspensão', body: ['Você pode cancelar a qualquer momento. Podemos suspender ou encerrar contas por violação destes termos, falta de pagamento ou uso abusivo. Após o encerramento, os dados poderão ser exportados por prazo razoável antes da exclusão.'] },
  { title: '10. Alterações', body: ['Estes termos podem ser atualizados, com comunicação prévia em caso de mudanças relevantes.'] },
  { title: '11. Lei aplicável e foro', body: [`Estes termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o foro da comarca de ${P.foro} para dirimir quaisquer controvérsias, salvo disposição legal em contrário.`] },
  { title: '12. Contato', body: [`${P.contatoEmail}`] },
]

export const termsEn: LegalSection[] = [
  { title: '1. Parties', body: [`These Terms of Use govern the TurboISP and Turboware platforms provided by ${companyEn}. By subscribing to or using the service you agree to these terms and the Privacy Policy.`] },
  { title: '2. Service', body: ['A management platform for internet and telecom providers, including CRM, billing, automation, monitoring, GIS and network documentation, offered as software as a service (SaaS).'] },
  { title: '3. Account', body: ['You are responsible for accurate account data, keeping credentials confidential and all activity in your account. We recommend enabling multi-factor authentication.'] },
  { title: '4. Subscription and payment', body: ['The service is billed monthly or annually according to your plan. Non-payment may lead to suspension after the grace period. Prices may change with 30 days\u2019 notice.'] },
  { title: '5. Acceptable use', body: ['You may not use the service for illegal activity, attempt unauthorized access, interfere with system operation or resell the service without authorization.'] },
  { title: '6. Data and LGPD', body: ['Data you enter remains yours. For your subscribers\u2019 data you are the controller and we act as processor, handling it only on your instructions and to provide the service, under the LGPD.'] },
  { title: '7. Availability', body: ['We use reasonable efforts to keep the service available, but it may be interrupted for maintenance or by factors outside our control.'] },
  { title: '8. Limitation of liability', body: ['To the maximum extent permitted by law we are not liable for lost profits, lost revenue, third-party network outages or customer configuration errors. Our total liability is limited to the amounts paid in the 12 months preceding the event.'] },
  { title: '9. Cancellation and suspension', body: ['You may cancel at any time. We may suspend or terminate accounts for breach of these terms, non-payment or abuse. After termination, data may be exported for a reasonable period before deletion.'] },
  { title: '10. Changes', body: ['We may update these terms and will give prior notice of material changes.'] },
  { title: '11. Governing law and venue', body: [`These terms are governed by the laws of Brazil. The courts of ${P.foro} have jurisdiction over any dispute, unless the law provides otherwise.`] },
  { title: '12. Contact', body: [`${P.contatoEmail}`] },
]
