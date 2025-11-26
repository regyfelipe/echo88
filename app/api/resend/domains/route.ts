import { NextRequest, NextResponse } from "next/server";
import {
  listDomains,
  createDomain,
  type CreateDomainOptions,
} from "@/lib/resend/domains";

/**
 * GET /api/resend/domains
 * Lista todos os domínios
 */
export async function GET() {
  try {
    const domains = await listDomains();
    return NextResponse.json({ success: true, domains });
  } catch (error) {
    console.error("Error listing domains:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Erro ao listar domínios",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/resend/domains
 * Cria um novo domínio
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, region } = body as CreateDomainOptions;

    if (!name) {
      return NextResponse.json(
        { error: "Nome do domínio é obrigatório" },
        { status: 400 }
      );
    }

    const domain = await createDomain({ name, region });
    return NextResponse.json({ success: true, domain });
  } catch (error) {
    console.error("Error creating domain:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Erro ao criar domínio",
      },
      { status: 500 }
    );
  }
}

