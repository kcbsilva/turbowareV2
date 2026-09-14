export const TURBOISP_MSA_TEMPLATE_NAME = 'TurboISP Master Subscription'

export const TURBOISP_MSA_TITLE = 'Master Subscription and Services Agreement'

export const TURBOISP_MSA_NOTES =
  'Template — requires local counsel review before use with any customer.'

export const TURBOISP_MSA_BODY = `
<p><strong>TURBOISP PLATFORM</strong></p>
<p>TEMPLATE — REQUIRES LOCAL COUNSEL REVIEW BEFORE USE WITH ANY CUSTOMER</p>
<p>This Master Subscription and Services Agreement ("Agreement") is entered into as of {effective_date} (the "Effective Date") by and between {provider_legal_name}, a company organized under the laws of {provider_jurisdiction}, with its principal place of business at {provider_address} ("Provider" or "TurboISP"), and {customer_legal_name}, with its principal place of business at {customer_address} ("Customer"). Provider and Customer are each a "Party" and together the "Parties."</p>
<p><strong>1. DEFINITIONS</strong></p>
<p>"Platform" means the TurboISP software-as-a-service platform, a multi-tenant OSS/BSS system for internet service providers, including subscriber management, billing, support, and regulatory reporting modules.</p>
<p>"Customer Environment" means the multi-tenant instance of the Platform provisioned to Customer, with logical data isolation between tenants.</p>
<p>"Customer Data" means all data submitted, processed, or stored by Customer or its Authorized Users through the Platform, including personal data of Customer's end-subscribers.</p>
<p>"Authorized Users" means Customer's employees, contractors, or agents authorized to access the Platform.</p>
<p>"Order Form" means the document (Exhibit A) specifying the subscription plan, fees, tenant/subscriber limits, and any add-on modules purchased.</p>
<p>"Applicable Data Protection Law" means all data protection and privacy laws applicable to the processing of Customer Data under this Agreement, including, where applicable, the GDPR, LGPD, and equivalent local laws.</p>
<p><strong>2. SCOPE OF SERVICES</strong></p>
<p>2.1. Provider will make the Platform available to Customer on a subscription basis, as a hosted software-as-a-service, together with associated hosting, maintenance, and technical support, as specified in the applicable Order Form.</p>
<p>2.2. Access is provided remotely over the internet. No source code, platform IP, or ownership rights beyond the license granted herein are transferred to Customer under any circumstance.</p>
<p>2.3. Additional modules or functionality (e.g., regulatory reporting integrations, automated billing, payment gateway connections) are subject to separate agreement and pricing under the applicable Order Form.</p>
<p><strong>3. LICENSE GRANT AND RESTRICTIONS</strong></p>
<p>3.1. Subject to the terms of this Agreement and timely payment of fees, Provider grants Customer a limited, non-exclusive, non-transferable, revocable license to access and use the Platform solely for Customer's internal business purposes as an internet service provider.</p>
<p>3.2. Customer shall not: (a) sublicense, resell, or make the Platform available to any third party outside the Customer–Authorized User relationship; (b) reverse engineer, decompile, or attempt to extract the source code of the Platform; (c) use the Platform in violation of applicable law or third-party rights; (d) exceed the tenant, user, or subscriber limits specified in the Order Form without a corresponding commercial adjustment.</p>
<p><strong>4. FEES, INVOICING AND PAYMENT</strong></p>
<p>4.1. Customer will pay the fees set out in the Order Form on a {billing_model} basis, invoiced in {currency}, due within {payment_terms_days} days of the invoice date.</p>
<p>4.2. Fees will be reviewed annually and may be adjusted by no more than {fee_increase_cap} or in line with {fee_increase_index}, with 60 days' written notice.</p>
<p>4.3. Late payments not cured within 15 days of notice entitle Provider to suspend access to the Platform on 5 business days' further notice, without prejudice to accrued fees, and to charge interest on overdue amounts at the lesser of 1.5% per month or the maximum rate permitted by law.</p>
<p>4.4. Fees are exclusive of applicable taxes, which Customer is responsible for except taxes based on Provider's net income.</p>
<p><strong>5. TERM AND TERMINATION</strong></p>
<p>5.1. This Agreement commences on the Effective Date and continues for a minimum initial term of 3 months (the "Minimum Term"). Following the Minimum Term, this Agreement will continue on a rolling, indefinite basis until terminated by either Party for any reason on at least 30 days' prior written notice.</p>
<p>5.2. Either Party may terminate this Agreement immediately on written notice if the other Party: (a) materially breaches this Agreement and fails to cure within 15 days of notice; (b) becomes insolvent, enters bankruptcy or equivalent proceedings; or (c) commits a material breach of its data protection obligations that exposes the other Party to significant regulatory risk.</p>
<p>5.3. On termination, Provider will make Customer Data available for export in a structured, commonly used format (e.g., CSV/JSON) for 30 days, after which Customer Data may be deleted in accordance with Section 6.</p>
<p>5.4. If Customer terminates before the end of the Minimum Term, Customer will pay the fees for the remaining balance of the Minimum Term. After the Minimum Term, termination is governed solely by the 30-day notice period in Section 5.1, with no further termination fee.</p>
<p><strong>6. DATA PROTECTION</strong></p>
<p>6.1. For the purposes of Applicable Data Protection Law, Customer acts as controller (or equivalent) of the personal data of its end-subscribers and Authorized Users, and Provider acts as processor (or equivalent), processing such data only on Customer's documented instructions and for the purposes described in this Agreement.</p>
<p>6.2. Provider will: (a) implement technical and organizational security measures appropriate to the risk; (b) notify Customer without undue delay, and in any event within 48 hours, of any security incident materially affecting Customer Data; (c) not engage sub-processors without prior notice to Customer; (d) reasonably assist Customer in responding to data subject requests and regulatory inquiries.</p>
<p>6.3. Where required by Applicable Data Protection Law (including for EU/EEA or Brazilian personal data), the Parties will execute a Data Processing Addendum (Exhibit B) detailing sub-processors, data location, cross-border transfer mechanisms (e.g., Standard Contractual Clauses), and security measures, which will form part of this Agreement.</p>
<p>6.4. Following the export period in Section 5.3, Customer Data will be permanently deleted, except where retention is required by applicable law.</p>
<p><strong>7. SERVICE LEVELS AND SUPPORT</strong></p>
<p>7.1. Provider will use commercially reasonable efforts to maintain monthly Platform availability of {sla_uptime_percent}, excluding scheduled maintenance windows communicated at least 48 hours in advance.</p>
<p>7.2. If Provider fails to meet the SLA in a given month, Customer will be entitled to service credits as detailed in Exhibit B, capped at {sla_credit_cap_percent} of the fees for the affected period.</p>
<p>7.3. Technical support will be provided during business hours on business days via the channels specified in the Order Form, with response times by severity level detailed in Exhibit B.</p>
<p>7.4. NOTE: the SLA percentages and service credit terms above are placeholders. Do not finalize these figures until your infrastructure can actually sustain them — a signed SLA is an enforceable commitment, not a marketing statement, and a customer with a history of litigating vendor failures will hold you to it precisely.</p>
<p><strong>8. INTELLECTUAL PROPERTY</strong></p>
<p>8.1. All source code, algorithms, trademarks, designs, technical documentation, and other elements of the Platform are and remain the exclusive property of Provider or its licensors. Nothing in this Agreement transfers any ownership interest in the Platform to Customer.</p>
<p>8.2. Any custom development performed specifically for Customer under a separate paid engagement will have its ownership terms defined in the applicable statement of work; absent express agreement, Provider retains ownership subject to a perpetual license to Customer for its internal use.</p>
<p>8.3. Customer retains all right, title, and interest in and to Customer Data.</p>
<p><strong>9. CONFIDENTIALITY</strong></p>
<p>9.1. Each Party will protect the other's confidential information, including technical, business, financial, and customer information, using at least the same degree of care it uses for its own confidential information, and will not disclose it except to Authorized Users or advisors under equivalent confidentiality obligations.</p>
<p>9.2. These obligations survive for 5 years after termination of this Agreement, and do not apply to information that is or becomes public through no breach of this Agreement, or that must be disclosed by law, subject to prior notice where legally permitted.</p>
<p><strong>10. WARRANTIES AND LIMITATION OF LIABILITY</strong></p>
<p>10.1. Except as expressly stated in the Order Form, the Platform is provided "as is," without warranties of any kind, express or implied, including any warranty of fitness for a particular purpose not expressly agreed in writing.</p>
<p>10.2. Each Party's total aggregate liability arising out of or related to this Agreement, whether in contract, tort, or otherwise, will not exceed the fees actually paid by Customer in the {liability_cap_months} months preceding the event giving rise to the claim.</p>
<p>10.3. The liability cap in 10.2 does not apply to: (a) breaches of confidentiality obligations; (b) a Party's gross negligence or willful misconduct; (c) Provider's failure to meet its data protection obligations resulting in a regulatory sanction directly attributable to Provider's fault.</p>
<p>10.4. Neither Party will be liable for any indirect, incidental, special, or consequential damages, or for lost profits, even if advised of the possibility of such damages, except to the extent such exclusion is not permitted by applicable law.</p>
<p><strong>11. REGULATORY COMPLIANCE</strong></p>
<p>11.1. The Parties acknowledge that Customer, as a licensed or registered telecommunications service provider, is subject to the regulatory requirements of its local telecommunications authority (e.g., ANATEL in Brazil, or the equivalent authority in Customer's jurisdiction), including record-retention and regulatory reporting obligations.</p>
<p>11.2. The Platform may offer features to support Customer's regulatory reporting, but such features do not constitute an assumption by Provider of Customer's own regulatory responsibilities. Customer remains solely responsible for the accuracy and timeliness of its regulatory filings.</p>
<p><strong>12. GENERAL PROVISIONS</strong></p>
<p>12.1. This Agreement, together with its Exhibits, constitutes the entire agreement between the Parties regarding its subject matter and supersedes all prior discussions or agreements on the same subject.</p>
<p>12.2. Neither Party may assign this Agreement without the other Party's prior written consent, except in connection with a merger, acquisition, or sale of substantially all assets, provided the assignee assumes all obligations hereunder.</p>
<p>12.3. Neither Party will be liable for delay or failure to perform resulting from causes beyond its reasonable control (force majeure), for as long as such cause persists.</p>
<p>12.4. No failure or delay by either Party in exercising any right under this Agreement will operate as a waiver of that right.</p>
<p><strong>13. GOVERNING LAW AND DISPUTE RESOLUTION</strong></p>
<p>13.1. This Agreement is governed by the laws of {governing_law_jurisdiction}, without regard to its conflict-of-laws principles.</p>
<p>13.2. Any dispute arising out of or relating to this Agreement will be subject to the exclusive jurisdiction of the courts of {dispute_jurisdiction}. [Optional — evaluate with counsel: the Parties may instead agree to binding arbitration administered by {arbitral_institution}, seated in {arbitration_seat}, in lieu of court jurisdiction.]</p>
<p>13.3. If Customer is located in a jurisdiction with mandatory local consumer or data protection law that conflicts with this Section, those mandatory local provisions will prevail solely to the extent required by law.</p>
<p>IN WITNESS WHEREOF, the Parties have executed this Agreement as of the Effective Date.</p>
<p>{signing_place_date}</p>
<p>Provider — TurboISP</p>
<p>Customer</p>
`.trim()
