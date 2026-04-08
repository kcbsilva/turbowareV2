"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle,
  Eye,
  EyeOff,
  Globe2,
  Loader2,
  ShieldCheck,
  User,
} from "lucide-react";
import { type Region } from "@/lib/pricing";
import turboIspTermsAndConditionsPt from "./terms-and-conditions/tc-pt";
import turboIspTermsAndConditionsEn from "./terms-and-conditions/tc-en";
import turboIspTermsAndConditionsFr from "./terms-and-conditions/tc-fr";
import turboIspTermsAndConditionsEs from "./terms-and-conditions/tc-es";

declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void;
      execute: (siteKey: string, opts: { action: string }) => Promise<string>;
    };
  }
}

const BG = "#e5e5e5";
const RECAPTCHA_SITE_KEY = process.env.RECAPTCHA_SITE_KEY || "";
const CLIENT_LOGIN_URL = "https://turboware.com.br/client/auth/login";
const REGIONS: Region[] = ["BR", "US", "CA", "GB"];
const LANGUAGES = ["pt-BR", "en-US", "es-419"] as const;

type Step = 1 | 2 | 3 | 4;
type LanguagePreference = (typeof LANGUAGES)[number];
type TermsLanguage = "pt-BR" | "en-CA" | "fr-CA" | "es-MX";

type FormState = {
  region: Region;
  languagePreference: LanguagePreference;
  firstName: string;
  lastName: string;
  cpf: string;
  phone: string;
  cnpj: string;
  tradeName: string;
  legalName: string;
  openingDate: string;
  fullAddress: string;
  financialEmail: string;
  technicalEmail: string;
  ddns: string;
  ddnsUsername: string;
  ddnsPassword: string;
  ddnsPasswordConfirm: string;
};

type Copy = {
  sidebarLabel: string;
  steps: Record<Step, { label: string; title: string; description: string }>;
  success: {
    title: string;
    description: string;
    clientPortal: string;
    workspace: string;
  };
  stepper: {
    step: string;
  };
  sections: {
    language: string;
    region: string;
    personal: string;
    company: string;
    workspace: string;
    preferencesReview: string;
    personalReview: string;
    companyReview: string;
    workspaceReview: string;
  };
  languageOptions: Record<
    LanguagePreference,
    { label: string; helper?: string }
  >;
  regionOptions: Record<
    Region,
    { label: string; helper?: string; flag: string }
  >;
  fields: {
    firstName: string;
    lastName: string;
    cpf: string;
    phone: string;
    cnpj: string;
    tradeName: string;
    legalName: string;
    fullAddress: string;
    financialEmail: string;
    technicalEmail: string;
    ddnsSubdomain: string;
    ddnsUsername: string;
    ddnsPassword: string;
    ddnsPasswordConfirm: string;
    openingDate: string;
  };
  review: {
    region: string;
    language: string;
    name: string;
    phone: string;
    tradeName: string;
    legalName: string;
    financialEmail: string;
    subdomain: string;
    username: string;
    technicalEmail: string;
    technicalEmailFallback: string;
  };
  ddns: {
    subdomainLabel: string;
    checking: string;
    empty: string;
    invalidHint: string;
    unavailable: string;
    available: (fqdn: string) => string;
    verifyError: string;
    passwordMismatch: string;
    unavailableToContinue: string;
  };
  terms: {
    checkboxPrefix: string;
    checkboxLink: string;
    checkboxSuffix: string;
    recaptcha: string;
    modalTitle: string;
    close: string;
  };
  actions: {
    back: string;
    continue: string;
    submit: string;
    sending: string;
  };
  errors: {
    acceptTerms: string;
    generic: string;
  };
};

const LANGUAGE_LABELS: Record<LanguagePreference, string> = {
  "pt-BR": "Portugues (Brasil)",
  "en-US": "English",
  "es-419": "Espanol (LATAM)",
};

const COPY: Record<LanguagePreference, Copy> = {
  "pt-BR": {
    sidebarLabel: "Cadastro TurboISP",
    steps: {
      1: {
        label: "Preferencias",
        title: "Escolha seu idioma e regiao",
        description:
          "Usaremos isso para ajustar comunicacoes, onboarding e configuracao comercial.",
      },
      2: {
        label: "Pessoal",
        title: "Dados pessoais",
        description:
          "Informe quem sera o responsavel pela conta e pelo primeiro acesso.",
      },
      3: {
        label: "Empresa",
        title: "Empresa e configuracao da plataforma",
        description:
          "Aqui ficam os dados da empresa e as credenciais do ambiente TurboISP.",
      },
      4: {
        label: "Revisao",
        title: "Revise e aceite os termos",
        description:
          "Confirme os dados abaixo, aceite os termos e envie o cadastro.",
      },
    },
    success: {
      title: "Solicitacao recebida",
      description:
        "Seu cadastro foi enviado com sucesso. Agora voce pode acessar o portal do cliente e sua plataforma TurboISP usando os links abaixo.",
      clientPortal: "Acessar o portal do cliente",
      workspace: "Abrir seu ambiente TurboISP",
    },
    stepper: {
      step: "Etapa",
    },
    sections: {
      language: "Preferencia de idioma",
      region: "Regiao",
      personal: "Dados pessoais",
      company: "Informacoes da empresa",
      workspace: "Ambiente TurboISP",
      preferencesReview: "Preferencias",
      personalReview: "Dados pessoais",
      companyReview: "Empresa",
      workspaceReview: "Ambiente",
    },
    languageOptions: {
      "pt-BR": {
        label: "Portugues (Brasil)",
      },
      "en-US": {
        label: "Ingles",
      },
      "es-419": {
        label: "Espanol (LATAM)",
      },
    },
    regionOptions: {
      BR: {
        label: "Brasil",
        flag: "BR",
      },
      US: {
        label: "Estados Unidos",
        flag: "US",
      },
      CA: {
        label: "Canada",
        flag: "CA",
      },
      GB: {
        label: "Reino Unido",
        flag: "GB",
      },
    },
    fields: {
      firstName: "Primeiro nome",
      lastName: "Sobrenome",
      cpf: "CPF",
      phone: "Telefone",
      cnpj: "CNPJ",
      tradeName: "Nome fantasia",
      legalName: "Razao social",
      fullAddress: "Endereco completo",
      financialEmail: "Email financeiro",
      technicalEmail: "Email tecnico (opcional)",
      ddnsSubdomain: "suaempresa",
      ddnsUsername: "Usuario do ambiente",
      ddnsPassword: "Senha do ambiente",
      ddnsPasswordConfirm: "Confirmar senha do ambiente",
      openingDate: "Data de abertura",
    },
    review: {
      region: "Regiao",
      language: "Idioma",
      name: "Nome",
      phone: "Telefone",
      tradeName: "Nome fantasia",
      legalName: "Razao social",
      financialEmail: "Email financeiro",
      subdomain: "Subdominio",
      username: "Usuario",
      technicalEmail: "Email tecnico",
      technicalEmailFallback: "Nao informado",
    },
    ddns: {
      subdomainLabel: "Subdominio",
      checking: "Verificando disponibilidade...",
      empty: "Informe um nome para verificar a disponibilidade.",
      invalidHint: "Use apenas letras, numeros e hifen.",
      unavailable: "Nome indisponivel.",
      available: (fqdn) => `${fqdn} esta disponivel.`,
      verifyError: "Nao foi possivel verificar agora.",
      passwordMismatch: "As senhas do DDNS nao coincidem.",
      unavailableToContinue:
        "Verifique e escolha um nome DDNS disponivel antes de continuar.",
    },
    terms: {
      checkboxPrefix: "Concordo com os ",
      checkboxLink: "Termos e Condicoes",
      checkboxSuffix: " e confirmo que os dados acima estao corretos.",
      recaptcha:
        "Este envio inclui reCAPTCHA v3 quando RECAPTCHA_SITE_KEY estiver configurada.",
      modalTitle: "Termos e Condicoes",
      close: "Fechar",
    },
    actions: {
      back: "Voltar",
      continue: "Continuar",
      submit: "Enviar cadastro",
      sending: "Enviando...",
    },
    errors: {
      acceptTerms: "Voce precisa concordar com os Termos e Condicoes.",
      generic: "Algo deu errado. Tente novamente.",
    },
  },
  "en-US": {
    sidebarLabel: "TurboISP Register",
    steps: {
      1: {
        label: "Preferences",
        title: "Choose your language and region",
        description:
          "We will use this to tailor communications, onboarding, and commercial setup.",
      },
      2: {
        label: "Personal",
        title: "Personal details",
        description:
          "Tell us who will own the account and receive the first access details.",
      },
      3: {
        label: "Company",
        title: "Company and platform setup",
        description:
          "This step covers your company data and the credentials for the TurboISP workspace.",
      },
      4: {
        label: "Review",
        title: "Review and accept the terms",
        description:
          "Confirm the details below, agree to the terms, and submit the registration.",
      },
    },
    success: {
      title: "Registration received",
      description:
        "Your registration was submitted successfully. You can now access the client portal and your TurboISP workspace using the links below.",
      clientPortal: "Access the client portal",
      workspace: "Open your TurboISP workspace",
    },
    stepper: {
      step: "Step",
    },
    sections: {
      language: "Language preference",
      region: "Region",
      personal: "Personal details",
      company: "Company information",
      workspace: "TurboISP workspace",
      preferencesReview: "Preferences",
      personalReview: "Personal details",
      companyReview: "Company",
      workspaceReview: "Workspace",
    },
    languageOptions: {
      "pt-BR": {
        label: "Portuguese (Brazil)",
      },
      "en-US": {
        label: "English",
      },
      "es-419": {
        label: "Spanish (LATAM)",
      },
    },
    regionOptions: {
      BR: {
        label: "Brazil",
        flag: "BR",
      },
      US: {
        label: "United States",
        flag: "US",
      },
      CA: {
        label: "Canada",
        flag: "CA",
      },
      GB: {
        label: "United Kingdom",
        flag: "GB",
      },
    },
    fields: {
      firstName: "First name",
      lastName: "Last name",
      cpf: "CPF",
      phone: "Phone",
      cnpj: "CNPJ",
      tradeName: "Trade name",
      legalName: "Legal name",
      fullAddress: "Full address",
      financialEmail: "Financial email",
      technicalEmail: "Technical email (optional)",
      ddnsSubdomain: "yourcompany",
      ddnsUsername: "Workspace username",
      ddnsPassword: "Workspace password",
      ddnsPasswordConfirm: "Confirm workspace password",
      openingDate: "Opening date",
    },
    review: {
      region: "Region",
      language: "Language",
      name: "Name",
      phone: "Phone",
      tradeName: "Trade name",
      legalName: "Legal name",
      financialEmail: "Financial email",
      subdomain: "Subdomain",
      username: "Username",
      technicalEmail: "Technical email",
      technicalEmailFallback: "Not provided",
    },
    ddns: {
      subdomainLabel: "Subdomain",
      checking: "Checking availability...",
      empty: "Enter a name to verify availability.",
      invalidHint: "Use letters, numbers, and hyphens only.",
      unavailable: "Name unavailable.",
      available: (fqdn) => `${fqdn} is available.`,
      verifyError: "Unable to verify right now.",
      passwordMismatch: "The DDNS passwords do not match.",
      unavailableToContinue:
        "Verify and choose an available DDNS name before continuing.",
    },
    terms: {
      checkboxPrefix: "I agree to the ",
      checkboxLink: "Terms and Conditions",
      checkboxSuffix: " and confirm that the details above are correct.",
      recaptcha:
        "This submission includes reCAPTCHA v3 when RECAPTCHA_SITE_KEY is configured.",
      modalTitle: "Terms and Conditions",
      close: "Close",
    },
    actions: {
      back: "Back",
      continue: "Continue",
      submit: "Submit registration",
      sending: "Submitting...",
    },
    errors: {
      acceptTerms: "You need to agree to the Terms and Conditions.",
      generic: "Something went wrong. Please try again.",
    },
  },
  "es-419": {
    sidebarLabel: "Registro TurboISP",
    steps: {
      1: {
        label: "Preferencias",
        title: "Elige tu idioma y region",
        description:
          "Usaremos esto para ajustar comunicaciones, onboarding y configuracion comercial.",
      },
      2: {
        label: "Personal",
        title: "Datos personales",
        description:
          "Indica quien sera responsable de la cuenta y recibira el primer acceso.",
      },
      3: {
        label: "Empresa",
        title: "Empresa y configuracion de la plataforma",
        description:
          "Aqui definimos los datos de la empresa y las credenciales del ambiente TurboISP.",
      },
      4: {
        label: "Revision",
        title: "Revisa y acepta los terminos",
        description:
          "Confirma los datos, acepta los terminos y envia el registro.",
      },
    },
    success: {
      title: "Registro recibido",
      description:
        "Tu registro fue enviado con exito. Ahora puedes acceder al portal del cliente y a tu ambiente TurboISP con los enlaces abajo.",
      clientPortal: "Acceder al portal del cliente",
      workspace: "Abrir tu ambiente TurboISP",
    },
    stepper: {
      step: "Paso",
    },
    sections: {
      language: "Preferencia de idioma",
      region: "Region",
      personal: "Datos personales",
      company: "Informacion de la empresa",
      workspace: "Ambiente TurboISP",
      preferencesReview: "Preferencias",
      personalReview: "Datos personales",
      companyReview: "Empresa",
      workspaceReview: "Ambiente",
    },
    languageOptions: {
      "pt-BR": {
        label: "Portugues (Brasil)",
        helper: "Ideal para operaciones en Brasil.",
      },
      "en-US": {
        label: "Ingles",
        helper: "Recomendado para operaciones en US, CA y GB.",
      },
      "es-419": {
        label: "Espanol (LATAM)",
        helper: "Util para equipos multilingues en America Latina.",
      },
    },
    regionOptions: {
      BR: {
        label: "Brasil",
        helper: "Onboarding en portugues y precios para Brasil.",
        flag: "BR",
      },
      US: {
        label: "Estados Unidos",
        helper: "Facturacion en dolares y onboarding en ingles.",
        flag: "US",
      },
      CA: {
        label: "Canada",
        helper: "Precios canadienses con onboarding en ingles.",
        flag: "CA",
      },
      GB: {
        label: "Reino Unido",
        helper: "Facturacion en libras y onboarding en ingles.",
        flag: "GB",
      },
    },
    fields: {
      firstName: "Nombre",
      lastName: "Apellido",
      cpf: "CPF",
      phone: "Telefono",
      cnpj: "CNPJ",
      tradeName: "Nombre comercial",
      legalName: "Razon social",
      fullAddress: "Direccion completa",
      financialEmail: "Email financiero",
      technicalEmail: "Email tecnico (opcional)",
      ddnsSubdomain: "tuempresa",
      ddnsUsername: "Usuario del ambiente",
      ddnsPassword: "Contrasena del ambiente",
      ddnsPasswordConfirm: "Confirmar contrasena del ambiente",
      openingDate: "Fecha de apertura",
    },
    review: {
      region: "Region",
      language: "Idioma",
      name: "Nombre",
      phone: "Telefono",
      tradeName: "Nombre comercial",
      legalName: "Razon social",
      financialEmail: "Email financiero",
      subdomain: "Subdominio",
      username: "Usuario",
      technicalEmail: "Email tecnico",
      technicalEmailFallback: "No informado",
    },
    ddns: {
      subdomainLabel: "Subdominio",
      checking: "Verificando disponibilidad...",
      empty: "Ingresa un nombre para verificar disponibilidad.",
      invalidHint: "Usa solo letras, numeros y guion.",
      unavailable: "Nombre no disponible.",
      available: (fqdn) => `${fqdn} esta disponible.`,
      verifyError: "No fue posible verificar ahora.",
      passwordMismatch: "Las contrasenas de DDNS no coinciden.",
      unavailableToContinue:
        "Verifica y elige un nombre DDNS disponible antes de continuar.",
    },
    terms: {
      checkboxPrefix: "Acepto los ",
      checkboxLink: "Terminos y Condiciones",
      checkboxSuffix: " y confirmo que los datos de arriba son correctos.",
      recaptcha:
        "Este envio incluye reCAPTCHA v3 cuando RECAPTCHA_SITE_KEY este configurada.",
      modalTitle: "Terminos y Condiciones",
      close: "Cerrar",
    },
    actions: {
      back: "Volver",
      continue: "Continuar",
      submit: "Enviar registro",
      sending: "Enviando...",
    },
    errors: {
      acceptTerms: "Debes aceptar los Terminos y Condiciones.",
      generic: "Algo salio mal. Intenta nuevamente.",
    },
  },
};

const API_MESSAGE_TRANSLATIONS: Record<
  LanguagePreference,
  Record<string, string>
> = {
  "pt-BR": {},
  "en-US": {
    "Nome e sobrenome são obrigatórios.":
      "First name and last name are required.",
    "Email financeiro é obrigatório.": "Financial email is required.",
    "A senha é obrigatória.": "Password is required.",
    "Você precisa concordar com os Termos de Serviços.":
      "You need to agree to the Terms and Conditions.",
    "Este subdomínio já está em uso.": "This subdomain is already in use.",
    "Este subdomínio já está em uso no TurboISP.":
      "This subdomain is already in use in TurboISP.",
    "Nome deve ter pelo menos 3 caracteres.":
      "Name must be at least 3 characters long.",
    "Este subdomínio é reservado.": "This subdomain is reserved.",
    "An account with this email already exists.":
      "An account with this email already exists.",
    "An account with this CNPJ already exists.":
      "An account with this CNPJ already exists.",
  },
  "es-419": {
    "Nome e sobrenome são obrigatórios.": "Nombre y apellido son obligatorios.",
    "Email financeiro é obrigatório.": "El email financiero es obligatorio.",
    "A senha é obrigatória.": "La contrasena es obligatoria.",
    "Você precisa concordar com os Termos de Serviços.":
      "Debes aceptar los Terminos y Condiciones.",
    "Este subdomínio já está em uso.": "Este subdominio ya esta en uso.",
    "Este subdomínio já está em uso no TurboISP.":
      "Este subdominio ya esta en uso en TurboISP.",
    "Nome deve ter pelo menos 3 caracteres.":
      "El nombre debe tener al menos 3 caracteres.",
    "Este subdomínio é reservado.": "Este subdominio esta reservado.",
    "An account with this email already exists.":
      "Ya existe una cuenta con este email.",
    "An account with this CNPJ already exists.":
      "Ya existe una cuenta con este CNPJ.",
  },
};

function formatCpf(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  return digits
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1-$2");
}

function formatCnpj(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 14);
  return digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

function normalizeDdns(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "")
    .replace(/^-+|-+$/g, "");
}

function appendNotes(form: FormState) {
  return [
    "Preferencias",
    `Regiao: ${form.region}`,
    `Idioma: ${LANGUAGE_LABELS[form.languagePreference]}`,
    "",
    "Dados Pessoais",
    `Primeiro Nome: ${form.firstName}`,
    `Sobrenome: ${form.lastName}`,
    `CPF: ${form.cpf}`,
    `Telefone: ${form.phone}`,
    "",
    "Empresa",
    `CNPJ: ${form.cnpj}`,
    `Nome Fantasia: ${form.tradeName}`,
    `Razao Social: ${form.legalName}`,
    `Data de Abertura: ${form.openingDate}`,
    `Endereco completo: ${form.fullAddress}`,
    `Email financeiro: ${form.financialEmail}`,
    `Email tecnico: ${form.technicalEmail || "N/A"}`,
    "",
    "DDNS",
    `Subdominio: ${form.ddns}`,
    `Username: ${form.ddnsUsername}`,
  ].join("\n");
}

function translateApiMessage(message: string, language: LanguagePreference) {
  return API_MESSAGE_TRANSLATIONS[language][message] || message;
}

function renderTermsDocument(document: string) {
  return document.split("\n").map((line, index) => {
    const key = `${index}-${line.slice(0, 24)}`;

    if (!line.trim()) return <div key={key} className="h-2" />;
    if (line.trim() === "---")
      return <hr key={key} className="my-5 border-black/10" />;

    if (line.startsWith("# ")) {
      return (
        <h2
          key={key}
          className="text-xl font-bold tracking-tight"
          style={{ color: "#0a1428" }}
        >
          {line.slice(2)}
        </h2>
      );
    }

    if (line.startsWith("## ")) {
      return (
        <h3
          key={key}
          className="text-lg font-semibold mt-5"
          style={{ color: "#0a1428" }}
        >
          {line.slice(3)}
        </h3>
      );
    }

    if (line.startsWith("### ")) {
      return (
        <h4
          key={key}
          className="text-sm font-semibold mt-4"
          style={{ color: "#0a1428" }}
        >
          {line.slice(4)}
        </h4>
      );
    }

    if (line.startsWith("* ")) {
      return (
        <div
          key={key}
          className="flex items-start gap-2 text-sm"
          style={{ color: "rgba(10,20,40,0.78)" }}
        >
          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#fca311]" />
          <p>{line.slice(2)}</p>
        </div>
      );
    }

    return (
      <p
        key={key}
        className="text-sm leading-relaxed"
        style={{ color: "rgba(10,20,40,0.78)" }}
      >
        {line}
      </p>
    );
  });
}

const TERMS_LANGUAGE_OPTIONS: Array<{ code: TermsLanguage; label: string }> = [
  { code: "pt-BR", label: "🇧🇷 PT-BR" },
  { code: "en-CA", label: "🇨🇦 EN-CA" },
  { code: "fr-CA", label: "🇨🇦 FR-CA" },
  { code: "es-MX", label: "🇲🇽 ES-MX" },
];

const TERMS_DOCUMENTS: Record<TermsLanguage, string> = {
  "pt-BR": turboIspTermsAndConditionsPt,
  "en-CA": turboIspTermsAndConditionsEn,
  "fr-CA": turboIspTermsAndConditionsFr,
  "es-MX": turboIspTermsAndConditionsEs,
};

function getTermsLanguageForPreference(
  language: LanguagePreference,
): TermsLanguage {
  if (language === "pt-BR") return "pt-BR";
  if (language === "es-419") return "es-MX";
  return "en-CA";
}

export default function RegisterPage() {
  const formRef = useRef<HTMLFormElement>(null);
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormState>({
    region: "BR",
    languagePreference: "pt-BR",
    firstName: "",
    lastName: "",
    cpf: "",
    phone: "",
    cnpj: "",
    tradeName: "",
    legalName: "",
    openingDate: "",
    fullAddress: "",
    financialEmail: "",
    technicalEmail: "",
    ddns: "",
    ddnsUsername: "",
    ddnsPassword: "",
    ddnsPasswordConfirm: "",
  });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingDdns, setCheckingDdns] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [ddnsStatus, setDdnsStatus] = useState<
    "idle" | "checking" | "available" | "taken"
  >("idle");
  const [ddnsMessage, setDdnsMessage] = useState("");
  const [portalSubdomain, setPortalSubdomain] = useState("");
  const [termsOpen, setTermsOpen] = useState(false);
  const [termsLanguage, setTermsLanguage] = useState<TermsLanguage>("pt-BR");

  const copy = COPY[form.languagePreference];
  const currentStep = copy.steps[step];
  const StepIcon =
    step === 1
      ? Globe2
      : step === 2
        ? User
        : step === 3
          ? Building2
          : ShieldCheck;

  function set(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function runRecaptcha(action: string) {
    if (!RECAPTCHA_SITE_KEY || !window.grecaptcha) return "";
    return new Promise<string>((resolve, reject) => {
      window.grecaptcha?.ready(() => {
        window
          .grecaptcha!.execute(RECAPTCHA_SITE_KEY, { action })
          .then(resolve)
          .catch(reject);
      });
    });
  }

  async function checkDdnsAvailability() {
    const candidate = normalizeDdns(form.ddns);
    if (!candidate) {
      setDdnsStatus("idle");
      setDdnsMessage(copy.ddns.empty);
      return false;
    }

    setCheckingDdns(true);
    setDdnsStatus("checking");
    setDdnsMessage("");

    try {
      const res = await fetch(
        `/api/register/ddns?name=${encodeURIComponent(candidate)}`,
      );
      const data = await res.json();
      if (!res.ok || !data.available) {
        setDdnsStatus("taken");
        setDdnsMessage(
          translateApiMessage(
            data.error || copy.ddns.unavailable,
            form.languagePreference,
          ),
        );
        return false;
      }

      setDdnsStatus("available");
      setDdnsMessage(
        copy.ddns.available(data.fqdn || `${candidate}.turboisp.app`),
      );
      return true;
    } catch {
      setDdnsStatus("idle");
      setDdnsMessage(copy.ddns.verifyError);
      return false;
    } finally {
      setCheckingDdns(false);
    }
  }

  function validateCurrentStep(current: Step) {
    setError("");

    if (!formRef.current?.reportValidity()) return false;

    if (current === 3) {
      if (form.ddnsPassword !== form.ddnsPasswordConfirm) {
        setError(copy.ddns.passwordMismatch);
        return false;
      }
      if (ddnsStatus !== "available") {
        setError(copy.ddns.unavailableToContinue);
        return false;
      }
    }

    if (current === 4 && !acceptedTerms) {
      setError(copy.errors.acceptTerms);
      return false;
    }

    return true;
  }

  useEffect(() => {
    if (!form.ddns) {
      setDdnsStatus("idle");
      setDdnsMessage("");
      return;
    }

    const timer = setTimeout(() => {
      void checkDdnsAvailability();
    }, 500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.ddns, form.languagePreference]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    if (!validateCurrentStep(step)) return;

    if (step < 4) {
      setStep((prev) => (prev + 1) as Step);
      return;
    }

    setLoading(true);
    try {
      const token = await runRecaptcha("register_submit");

      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          recaptchaToken: token,
          acceptedTerms,
          internalNotes: appendNotes(form),
        }),
      });

      if (res.ok) {
        setPortalSubdomain(normalizeDdns(form.ddns));
        setSuccess(true);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(
          translateApiMessage(
            data.error || copy.errors.generic,
            form.languagePreference,
          ),
        );
      }
    } catch {
      setError(copy.errors.generic);
    } finally {
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    backgroundColor: "#fff",
    border: "1px solid rgba(0,0,0,0.12)",
    color: "#0a1428",
  };

  const focusProps = {
    onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      e.currentTarget.style.outline = "2px solid rgba(252,163,17,0.55)";
      e.currentTarget.style.outlineOffset = "0";
    },
    onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      e.currentTarget.style.outline = "none";
    },
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: BG }}>
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(rgba(0,0,0,0.055) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-5xl">
          {success ? (
            <div className="text-center">
              <div
                className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 border"
                style={{
                  backgroundColor: "rgba(16,185,129,0.08)",
                  borderColor: "rgba(16,185,129,0.2)",
                }}
              >
                <CheckCircle className="w-7 h-7 text-emerald-500" />
              </div>
              <h1
                className="text-2xl font-bold mb-3"
                style={{ color: "#0a1428" }}
              >
                {copy.success.title}
              </h1>
              <p
                className="text-sm max-w-xl mx-auto mb-8 leading-relaxed"
                style={{ color: "rgba(10,20,40,0.5)" }}
              >
                {copy.success.description}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 flex-wrap">
                <a
                  href={CLIENT_LOGIN_URL}
                  className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-lg transition hover:opacity-90 shadow-sm"
                  style={{ backgroundColor: "#fca311", color: "#081124" }}
                >
                  {copy.success.clientPortal}
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
                <a
                  href={`https://${portalSubdomain || "{chosen}.turboisp.app"}/admin/auth/login`}
                  className="inline-flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-lg border transition hover:bg-black/5"
                  style={{
                    borderColor: "rgba(0,0,0,0.12)",
                    color: "rgba(10,20,40,0.55)",
                  }}
                >
                  {copy.success.workspace}
                </a>
              </div>
            </div>
          ) : (
            <div
              className="rounded-[32px] border shadow-[0_24px_90px_rgba(10,20,40,0.08)] overflow-hidden"
              style={{
                backgroundColor: "rgba(255,255,255,0.78)",
                borderColor: "rgba(0,0,0,0.08)",
              }}
            >
              <div className="grid lg:grid-cols-[280px_minmax(0,1fr)]">
                <aside
                  className="border-b lg:border-b-0 lg:border-r p-6 lg:p-8"
                  style={{
                    backgroundColor: "rgba(10,20,40,0.03)",
                    borderColor: "rgba(0,0,0,0.08)",
                  }}
                >
                  <div
                    className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-5 border"
                    style={{
                      backgroundColor: "rgba(252,163,17,0.08)",
                      borderColor: "rgba(252,163,17,0.2)",
                    }}
                  >
                    <StepIcon
                      className="w-6 h-6"
                      style={{ color: "#fca311" }}
                    />
                  </div>
                  <p
                    className="text-[10px] font-semibold uppercase tracking-[0.28em] mb-3"
                    style={{ color: "rgba(10,20,40,0.45)" }}
                  >
                    {copy.sidebarLabel}
                  </p>
                  <h1
                    className="text-2xl font-bold mb-2"
                    style={{ color: "#0a1428" }}
                  >
                    {currentStep.title}
                  </h1>
                  <p
                    className="text-sm leading-relaxed mb-8"
                    style={{ color: "rgba(10,20,40,0.5)" }}
                  >
                    {currentStep.description}
                  </p>

                  <div className="space-y-3">
                    {(Object.keys(copy.steps) as unknown as Step[]).map(
                      (item) => {
                        const isActive = item === step;
                        const isComplete = item < step;
                        return (
                          <div
                            key={item}
                            className="rounded-2xl border px-4 py-3 transition"
                            style={{
                              backgroundColor: isActive
                                ? "#0a1428"
                                : isComplete
                                  ? "rgba(16,185,129,0.08)"
                                  : "#fff",
                              borderColor: isActive
                                ? "#0a1428"
                                : isComplete
                                  ? "rgba(16,185,129,0.18)"
                                  : "rgba(0,0,0,0.08)",
                              color: isActive ? "#fff" : "#0a1428",
                            }}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <p
                                  className="text-[10px] font-semibold uppercase tracking-[0.2em]"
                                  style={{
                                    color: isActive
                                      ? "rgba(255,255,255,0.6)"
                                      : "rgba(10,20,40,0.4)",
                                  }}
                                >
                                  {copy.stepper.step} {item}
                                </p>
                                <p className="text-sm font-semibold mt-1">
                                  {copy.steps[item].label}
                                </p>
                              </div>
                              <div
                                className="w-8 h-8 rounded-full border flex items-center justify-center text-xs font-semibold"
                                style={{
                                  borderColor: isActive
                                    ? "rgba(255,255,255,0.22)"
                                    : "rgba(0,0,0,0.08)",
                                  backgroundColor: isComplete
                                    ? "rgba(16,185,129,0.18)"
                                    : "transparent",
                                }}
                              >
                                {isComplete ? (
                                  <CheckCircle className="w-4 h-4" />
                                ) : (
                                  item
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      },
                    )}
                  </div>
                </aside>

                <section className="p-6 lg:p-8">
                  <form ref={formRef} onSubmit={submit} className="space-y-6">
                    {step === 1 && (
                      <div className="space-y-4">
                        <fieldset className="space-y-4 rounded-3xl border border-black/10 bg-white/70 p-5">
                          <legend className="px-2 text-xs font-semibold uppercase tracking-wider text-[#0a1428]">
                            {copy.sections.language}
                          </legend>
                          <div className="grid gap-3">
                            {LANGUAGES.map((language) => {
                              const option = copy.languageOptions[language];
                              return (
                                <label
                                  key={language}
                                  className="cursor-pointer rounded-xl border px-4 py-3 transition hover:border-[#fca311]"
                                  style={{
                                    backgroundColor:
                                      form.languagePreference === language
                                        ? "rgba(252,163,17,0.08)"
                                        : "#fff",
                                    borderColor:
                                      form.languagePreference === language
                                        ? "rgba(252,163,17,0.45)"
                                        : "rgba(0,0,0,0.08)",
                                  }}
                                >
                                  <input
                                    type="radio"
                                    name="languagePreference"
                                    value={language}
                                    checked={
                                      form.languagePreference === language
                                    }
                                    onChange={(e) =>
                                      set("languagePreference", e.target.value)
                                    }
                                    required
                                    className="sr-only"
                                  />
                                  <div className="flex items-start justify-between gap-3">
                                    <div>
                                      <p
                                        className="text-sm font-semibold"
                                        style={{ color: "#0a1428" }}
                                      >
                                        {option.label}
                                      </p>
                                      <p
                                        className="text-xs mt-1 leading-relaxed"
                                        style={{ color: "rgba(10,20,40,0.48)" }}
                                      >
                                        {option.helper}
                                      </p>
                                    </div>
                                    <span
                                      className="mt-0.5 h-4 w-4 rounded-full border"
                                      style={{
                                        backgroundColor:
                                          form.languagePreference === language
                                            ? "#fca311"
                                            : "transparent",
                                        borderColor:
                                          form.languagePreference === language
                                            ? "#fca311"
                                            : "rgba(0,0,0,0.18)",
                                      }}
                                    />
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        </fieldset>

                        <fieldset className="space-y-4 rounded-3xl border border-black/10 bg-white/70 p-5">
                          <legend className="px-2 text-xs font-semibold uppercase tracking-wider text-[#0a1428]">
                            {copy.sections.region}
                          </legend>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {REGIONS.map((region) => {
                              const option = copy.regionOptions[region];
                              return (
                                <label
                                  key={region}
                                  className="cursor-pointer rounded-xl border px-3 py-3 text-center transition hover:border-[#fca311]"
                                  style={{
                                    backgroundColor:
                                      form.region === region
                                        ? "rgba(252,163,17,0.12)"
                                        : "#fff",
                                    borderColor:
                                      form.region === region
                                        ? "#fca311"
                                        : "rgba(0,0,0,0.08)",
                                  }}
                                >
                                  <input
                                    type="radio"
                                    name="region"
                                    value={region}
                                    checked={form.region === region}
                                    onChange={(e) =>
                                      set("region", e.target.value)
                                    }
                                    required
                                    className="sr-only"
                                  />
                                  <span
                                    className="block text-[11px] font-semibold uppercase tracking-[0.18em] mb-1"
                                    style={{ color: "rgba(10,20,40,0.45)" }}
                                  >
                                    {option.flag}
                                  </span>
                                  <span
                                    className="block text-sm font-semibold"
                                    style={{ color: "#0a1428" }}
                                  >
                                    {option.label}
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                          <p
                            className="text-xs leading-relaxed"
                            style={{ color: "rgba(10,20,40,0.48)" }}
                          >
                            {copy.regionOptions[form.region].helper}
                          </p>
                        </fieldset>
                      </div>
                    )}

                    {step === 2 && (
                      <fieldset className="space-y-4 rounded-3xl border border-black/10 bg-white/70 p-5">
                        <legend className="px-2 text-xs font-semibold uppercase tracking-wider text-[#0a1428]">
                          {copy.sections.personal}
                        </legend>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <input
                            placeholder={copy.fields.firstName}
                            value={form.firstName}
                            onChange={(e) => set("firstName", e.target.value)}
                            required
                            className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none"
                            style={inputStyle}
                            {...focusProps}
                          />
                          <input
                            placeholder={copy.fields.lastName}
                            value={form.lastName}
                            onChange={(e) => set("lastName", e.target.value)}
                            required
                            className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none"
                            style={inputStyle}
                            {...focusProps}
                          />
                          <input
                            placeholder={copy.fields.cpf}
                            value={form.cpf}
                            onChange={(e) =>
                              set("cpf", formatCpf(e.target.value))
                            }
                            required
                            className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none"
                            style={inputStyle}
                            {...focusProps}
                          />
                          <input
                            placeholder={copy.fields.phone}
                            value={form.phone}
                            onChange={(e) => set("phone", e.target.value)}
                            required
                            className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none"
                            style={inputStyle}
                            {...focusProps}
                          />
                        </div>
                      </fieldset>
                    )}

                    {step === 3 && (
                      <>
                        <fieldset className="space-y-4 rounded-3xl border border-black/10 bg-white/70 p-5">
                          <legend className="px-2 text-xs font-semibold uppercase tracking-wider text-[#0a1428]">
                            {copy.sections.company}
                          </legend>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <input
                              placeholder={copy.fields.cnpj}
                              value={form.cnpj}
                              onChange={(e) =>
                                set("cnpj", formatCnpj(e.target.value))
                              }
                              required
                              className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none"
                              style={inputStyle}
                              {...focusProps}
                            />
                            <input
                              type="date"
                              aria-label={copy.fields.openingDate}
                              value={form.openingDate}
                              onChange={(e) =>
                                set("openingDate", e.target.value)
                              }
                              required
                              className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none"
                              style={inputStyle}
                              {...focusProps}
                            />
                            <input
                              placeholder={copy.fields.tradeName}
                              value={form.tradeName}
                              onChange={(e) => set("tradeName", e.target.value)}
                              required
                              className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none"
                              style={inputStyle}
                              {...focusProps}
                            />
                            <input
                              placeholder={copy.fields.legalName}
                              value={form.legalName}
                              onChange={(e) => set("legalName", e.target.value)}
                              required
                              className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none"
                              style={inputStyle}
                              {...focusProps}
                            />
                            <input
                              placeholder={copy.fields.fullAddress}
                              value={form.fullAddress}
                              onChange={(e) =>
                                set("fullAddress", e.target.value)
                              }
                              required
                              className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none sm:col-span-2"
                              style={inputStyle}
                              {...focusProps}
                            />
                            <input
                              type="email"
                              placeholder={copy.fields.financialEmail}
                              value={form.financialEmail}
                              onChange={(e) =>
                                set("financialEmail", e.target.value)
                              }
                              required
                              className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none"
                              style={inputStyle}
                              {...focusProps}
                            />
                            <input
                              type="email"
                              placeholder={copy.fields.technicalEmail}
                              value={form.technicalEmail}
                              onChange={(e) =>
                                set("technicalEmail", e.target.value)
                              }
                              className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none"
                              style={inputStyle}
                              {...focusProps}
                            />
                          </div>
                        </fieldset>

                        <fieldset className="space-y-4 rounded-3xl border border-black/10 bg-white/70 p-5">
                          <legend className="px-2 text-xs font-semibold uppercase tracking-wider text-[#0a1428]">
                            {copy.sections.workspace}
                          </legend>
                          <div className="grid gap-4">
                            <div>
                              <label
                                className="block text-[10px] font-medium uppercase tracking-wider mb-1.5"
                                style={{ color: "rgba(10,20,40,0.4)" }}
                              >
                                {copy.ddns.subdomainLabel}
                              </label>
                              <div className="flex items-center gap-2">
                                <input
                                  value={form.ddns}
                                  onChange={(e) =>
                                    set("ddns", normalizeDdns(e.target.value))
                                  }
                                  placeholder={copy.fields.ddnsSubdomain}
                                  required
                                  className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none"
                                  style={inputStyle}
                                  {...focusProps}
                                />
                                <span
                                  className="text-xs whitespace-nowrap"
                                  style={{ color: "rgba(10,20,40,0.55)" }}
                                >
                                  .turboisp.app
                                </span>
                              </div>
                              <p
                                className="mt-1 text-[10px]"
                                style={{
                                  color:
                                    ddnsStatus === "taken"
                                      ? "#b91c1c"
                                      : "rgba(10,20,40,0.42)",
                                }}
                              >
                                {checkingDdns || ddnsStatus === "checking"
                                  ? copy.ddns.checking
                                  : ddnsMessage || copy.ddns.invalidHint}
                              </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <input
                                placeholder={copy.fields.ddnsUsername}
                                value={form.ddnsUsername}
                                onChange={(e) =>
                                  set("ddnsUsername", e.target.value)
                                }
                                required
                                className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none"
                                style={inputStyle}
                                {...focusProps}
                              />
                              <div className="relative">
                                <input
                                  type={showPassword ? "text" : "password"}
                                  placeholder={copy.fields.ddnsPassword}
                                  value={form.ddnsPassword}
                                  onChange={(e) =>
                                    set("ddnsPassword", e.target.value)
                                  }
                                  required
                                  className="w-full px-3 py-2.5 pr-9 rounded-lg text-sm focus:outline-none"
                                  style={inputStyle}
                                  {...focusProps}
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    setShowPassword((value) => !value)
                                  }
                                  className="absolute right-2.5 top-1/2 -translate-y-1/2 transition"
                                  style={{ color: "rgba(10,20,40,0.35)" }}
                                  tabIndex={-1}
                                >
                                  {showPassword ? (
                                    <EyeOff className="w-3.5 h-3.5" />
                                  ) : (
                                    <Eye className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                              <input
                                type={showPassword ? "text" : "password"}
                                placeholder={copy.fields.ddnsPasswordConfirm}
                                value={form.ddnsPasswordConfirm}
                                onChange={(e) =>
                                  set("ddnsPasswordConfirm", e.target.value)
                                }
                                required
                                className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none sm:col-span-2"
                                style={inputStyle}
                                {...focusProps}
                              />
                            </div>
                          </div>
                        </fieldset>
                      </>
                    )}

                    {step === 4 && (
                      <>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="rounded-3xl border border-black/10 bg-white/70 p-5">
                            <p
                              className="text-[10px] font-semibold uppercase tracking-[0.2em] mb-3"
                              style={{ color: "rgba(10,20,40,0.45)" }}
                            >
                              {copy.sections.preferencesReview}
                            </p>
                            <div
                              className="space-y-2 text-sm"
                              style={{ color: "#0a1428" }}
                            >
                              <p>
                                <span className="font-semibold">
                                  {copy.review.region}:
                                </span>{" "}
                                {copy.regionOptions[form.region].label}
                              </p>
                              <p>
                                <span className="font-semibold">
                                  {copy.review.language}:
                                </span>{" "}
                                {
                                  copy.languageOptions[form.languagePreference]
                                    .label
                                }
                              </p>
                            </div>
                          </div>

                          <div className="rounded-3xl border border-black/10 bg-white/70 p-5">
                            <p
                              className="text-[10px] font-semibold uppercase tracking-[0.2em] mb-3"
                              style={{ color: "rgba(10,20,40,0.45)" }}
                            >
                              {copy.sections.personalReview}
                            </p>
                            <div
                              className="space-y-2 text-sm"
                              style={{ color: "#0a1428" }}
                            >
                              <p>
                                <span className="font-semibold">
                                  {copy.review.name}:
                                </span>{" "}
                                {form.firstName} {form.lastName}
                              </p>
                              <p>
                                <span className="font-semibold">CPF:</span>{" "}
                                {form.cpf}
                              </p>
                              <p>
                                <span className="font-semibold">
                                  {copy.review.phone}:
                                </span>{" "}
                                {form.phone}
                              </p>
                            </div>
                          </div>

                          <div className="rounded-3xl border border-black/10 bg-white/70 p-5">
                            <p
                              className="text-[10px] font-semibold uppercase tracking-[0.2em] mb-3"
                              style={{ color: "rgba(10,20,40,0.45)" }}
                            >
                              {copy.sections.companyReview}
                            </p>
                            <div
                              className="space-y-2 text-sm"
                              style={{ color: "#0a1428" }}
                            >
                              <p>
                                <span className="font-semibold">
                                  {copy.review.tradeName}:
                                </span>{" "}
                                {form.tradeName}
                              </p>
                              <p>
                                <span className="font-semibold">
                                  {copy.review.legalName}:
                                </span>{" "}
                                {form.legalName}
                              </p>
                              <p>
                                <span className="font-semibold">CNPJ:</span>{" "}
                                {form.cnpj}
                              </p>
                              <p>
                                <span className="font-semibold">
                                  {copy.review.financialEmail}:
                                </span>{" "}
                                {form.financialEmail}
                              </p>
                            </div>
                          </div>

                          <div className="rounded-3xl border border-black/10 bg-white/70 p-5">
                            <p
                              className="text-[10px] font-semibold uppercase tracking-[0.2em] mb-3"
                              style={{ color: "rgba(10,20,40,0.45)" }}
                            >
                              {copy.sections.workspaceReview}
                            </p>
                            <div
                              className="space-y-2 text-sm"
                              style={{ color: "#0a1428" }}
                            >
                              <p>
                                <span className="font-semibold">
                                  {copy.review.subdomain}:
                                </span>{" "}
                                {form.ddns}.turboisp.app
                              </p>
                              <p>
                                <span className="font-semibold">
                                  {copy.review.username}:
                                </span>{" "}
                                {form.ddnsUsername}
                              </p>
                              <p>
                                <span className="font-semibold">
                                  {copy.review.technicalEmail}:
                                </span>{" "}
                                {form.technicalEmail ||
                                  copy.review.technicalEmailFallback}
                              </p>
                            </div>
                          </div>
                        </div>

                        <label className="flex items-start gap-3 rounded-2xl border border-black/10 bg-white/70 p-4 text-sm">
                          <input
                            type="checkbox"
                            checked={acceptedTerms}
                            onChange={(e) => setAcceptedTerms(e.target.checked)}
                            className="mt-1"
                          />
                          <span style={{ color: "#0a1428" }}>
                            {copy.terms.checkboxPrefix}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setTermsLanguage(
                                  getTermsLanguageForPreference(
                                    form.languagePreference,
                                  ),
                                );
                                setTermsOpen(true);
                              }}
                              className="font-semibold underline decoration-[#fca311] underline-offset-4"
                              style={{ color: "#0a1428" }}
                            >
                              {copy.terms.checkboxLink}
                            </button>
                            {copy.terms.checkboxSuffix}
                          </span>
                        </label>

                      </>
                    )}

                    {error && (
                      <div
                        className="p-3.5 rounded-lg border"
                        style={{
                          backgroundColor: "rgba(185,28,28,0.05)",
                          borderColor: "rgba(185,28,28,0.15)",
                        }}
                      >
                        <p className="text-xs" style={{ color: "#b91c1c" }}>
                          {error}
                        </p>
                      </div>
                    )}

                    <div className="flex flex-col-reverse sm:flex-row gap-3 sm:items-center">
                      {step > 1 ? (
                        <button
                          type="button"
                          onClick={() => {
                            setError("");
                            setStep((prev) => (prev - 1) as Step);
                          }}
                          className="px-4 py-3 rounded-lg text-sm font-medium border transition hover:bg-black/5 inline-flex items-center justify-center gap-2"
                          style={{
                            borderColor: "rgba(0,0,0,0.12)",
                            color: "rgba(10,20,40,0.7)",
                          }}
                        >
                          <ArrowLeft className="w-4 h-4" />
                          {copy.actions.back}
                        </button>
                      ) : (
                        <div />
                      )}

                      <button
                        type="submit"
                        disabled={loading || checkingDdns}
                        className="sm:ml-auto w-full sm:w-auto min-w-[180px] flex items-center justify-center gap-2 py-3 px-5 rounded-lg text-sm font-semibold transition hover:opacity-90 disabled:opacity-40 shadow-sm"
                        style={{ backgroundColor: "#fca311", color: "#081124" }}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            {copy.actions.sending}
                          </>
                        ) : step === 4 ? (
                          <>
                            {copy.actions.submit}
                            <ArrowRight className="w-4 h-4" />
                          </>
                        ) : (
                          <>
                            {copy.actions.continue}
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </section>
              </div>
            </div>
          )}
        </div>
      </main>

      {termsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label={copy.terms.close}
            onClick={() => setTermsOpen(false)}
            className="absolute inset-0 bg-black/45"
          />
          <div
            className="relative z-10 w-full max-w-4xl max-h-[85vh] overflow-hidden rounded-[28px] border shadow-[0_24px_90px_rgba(10,20,40,0.18)]"
            style={{
              backgroundColor: "#f8f8f6",
              borderColor: "rgba(0,0,0,0.08)",
            }}
          >
            <div
              className="flex items-center justify-between gap-4 border-b px-6 py-4"
              style={{ borderColor: "rgba(0,0,0,0.08)" }}
            >
              <div className="min-w-0">
                <h2
                  className="text-lg font-semibold"
                  style={{ color: "#0a1428" }}
                >
                  {copy.terms.modalTitle}
                </h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {TERMS_LANGUAGE_OPTIONS.map((option) => (
                    <button
                      key={option.code}
                      type="button"
                      onClick={() => setTermsLanguage(option.code)}
                      className="rounded-full border px-3 py-1.5 text-xs font-semibold transition"
                      style={{
                        backgroundColor:
                          termsLanguage === option.code ? "#0a1428" : "#ffffff",
                        borderColor:
                          termsLanguage === option.code
                            ? "#0a1428"
                            : "rgba(0,0,0,0.1)",
                        color:
                          termsLanguage === option.code
                            ? "#ffffff"
                            : "rgba(10,20,40,0.72)",
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTermsOpen(false)}
                className="rounded-lg border px-3 py-1.5 text-sm font-medium transition hover:bg-black/5 shrink-0"
                style={{
                  borderColor: "rgba(0,0,0,0.12)",
                  color: "rgba(10,20,40,0.72)",
                }}
              >
                {copy.terms.close}
              </button>
            </div>
            <div className="max-h-[calc(85vh-72px)] overflow-y-auto px-6 py-5 space-y-2">
              {renderTermsDocument(TERMS_DOCUMENTS[termsLanguage])}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
