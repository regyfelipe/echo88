/**
 * Resend Domain Management
 * Funções para gerenciar domínios no Resend
 * Documentação: https://resend.com/docs/api-reference/domains
 */

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export interface Domain {
  id: string;
  name: string;
  status: "not_started" | "validation_pending" | "signed" | "verified";
  created_at: string;
  region?: string;
  records?: DomainRecord[];
}

export interface DomainRecord {
  name: string;
  type: string;
  value: string;
  ttl: number;
  priority?: number;
}

export interface CreateDomainOptions {
  name: string;
  region?: "us-east-1" | "eu-west-1" | "sa-east-1";
}

export interface UpdateDomainOptions {
  id: string;
  openTracking?: boolean;
  clickTracking?: boolean;
}

/**
 * Cria um novo domínio no Resend
 */
export async function createDomain(
  options: CreateDomainOptions
): Promise<Domain> {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY não configurada");
  }

  const { data, error } = await resend.domains.create({
    name: options.name,
    region: options.region,
  });

  if (error) {
    throw new Error(`Erro ao criar domínio: ${error.message}`);
  }

  return data as unknown as Domain;
}

/**
 * Obtém informações de um domínio específico
 */
export async function getDomain(domainId: string): Promise<Domain> {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY não configurada");
  }

  const { data, error } = await resend.domains.get(domainId);

  if (error) {
    throw new Error(`Erro ao obter domínio: ${error.message}`);
  }

  return data as unknown as Domain;
}

/**
 * Verifica um domínio (inicia o processo de verificação)
 */
export async function verifyDomain(domainId: string): Promise<Domain> {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY não configurada");
  }

  const { data, error } = await resend.domains.verify(domainId);

  if (error) {
    throw new Error(`Erro ao verificar domínio: ${error.message}`);
  }

  return data as unknown as Domain;
}

/**
 * Atualiza configurações de um domínio
 */
export async function updateDomain(
  options: UpdateDomainOptions
): Promise<Domain> {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY não configurada");
  }

  const { data, error } = await resend.domains.update({
    id: options.id,
    openTracking: options.openTracking,
    clickTracking: options.clickTracking,
  });

  if (error) {
    throw new Error(`Erro ao atualizar domínio: ${error.message}`);
  }

  return data as unknown as Domain;
}

/**
 * Lista todos os domínios
 */
export async function listDomains(): Promise<Domain[]> {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY não configurada");
  }

  const { data, error } = await resend.domains.list();

  if (error) {
    throw new Error(`Erro ao listar domínios: ${error.message}`);
  }

  return (data?.data || []) as Domain[];
}

/**
 * Remove um domínio
 */
export async function removeDomain(domainId: string): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY não configurada");
  }

  const { error } = await resend.domains.remove(domainId);

  if (error) {
    throw new Error(`Erro ao remover domínio: ${error.message}`);
  }
}

/**
 * Obtém o primeiro domínio verificado disponível
 * Útil para usar como FROM_EMAIL automaticamente
 */
export async function getVerifiedDomain(): Promise<Domain | null> {
  try {
    const domains = await listDomains();
    const verified = domains.find(
      (domain) => domain.status === "verified" || domain.status === "signed"
    );
    return verified || null;
  } catch (error) {
    console.error("Erro ao buscar domínio verificado:", error);
    return null;
  }
}

/**
 * Obtém o email "from" recomendado baseado no domínio verificado
 */
export async function getRecommendedFromEmail(): Promise<string> {
  const verifiedDomain = await getVerifiedDomain();
  
  if (verifiedDomain) {
    // Retorna um email padrão usando o domínio verificado
    // Você pode personalizar isso (ex: noreply@, hello@, etc)
    return `noreply@${verifiedDomain.name}`;
  }

  // Fallback para o domínio padrão do Resend
  return process.env.FROM_EMAIL || "onboarding@resend.dev";
}

