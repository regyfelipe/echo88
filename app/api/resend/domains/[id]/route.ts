import { NextRequest, NextResponse } from "next/server";
import {
  getDomain,
  verifyDomain,
  updateDomain,
  removeDomain,
  type UpdateDomainOptions,
} from "@/lib/resend/domains";

/**
 * GET /api/resend/domains/[id]
 * Obtém informações de um domínio específico
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const domain = await getDomain(id);
    return NextResponse.json({ success: true, domain });
  } catch (error) {
    console.error("Error getting domain:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Erro ao obter domínio",
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/resend/domains/[id]
 * Atualiza configurações de um domínio
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { openTracking, clickTracking } = body as Omit<
      UpdateDomainOptions,
      "id"
    >;

    const domain = await updateDomain({
      id: id,
      openTracking,
      clickTracking,
    });

    return NextResponse.json({ success: true, domain });
  } catch (error) {
    console.error("Error updating domain:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Erro ao atualizar domínio",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/resend/domains/[id]
 * Remove um domínio
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await removeDomain(id);
    return NextResponse.json({ success: true, message: "Domínio removido" });
  } catch (error) {
    console.error("Error removing domain:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Erro ao remover domínio",
      },
      { status: 500 }
    );
  }
}
