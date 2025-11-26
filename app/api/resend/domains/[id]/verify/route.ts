import { NextRequest, NextResponse } from "next/server";
import { verifyDomain } from "@/lib/resend/domains";

/**
 * POST /api/resend/domains/[id]/verify
 * Verifica um domínio (inicia o processo de verificação)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const domain = await verifyDomain(id);
    return NextResponse.json({
      success: true,
      domain,
      message:
        "Domínio verificado. Verifique os registros DNS no dashboard do Resend.",
    });
  } catch (error) {
    console.error("Error verifying domain:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Erro ao verificar domínio",
      },
      { status: 500 }
    );
  }
}
