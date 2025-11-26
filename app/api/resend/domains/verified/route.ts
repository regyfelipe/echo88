import { NextRequest, NextResponse } from "next/server";
import {
  getVerifiedDomain,
  getRecommendedFromEmail,
} from "@/lib/resend/domains";

/**
 * GET /api/resend/domains/verified
 * Obtém o domínio verificado e o email "from" recomendado
 */
export async function GET() {
  try {
    const verifiedDomain = await getVerifiedDomain();
    const recommendedEmail = await getRecommendedFromEmail();

    return NextResponse.json({
      success: true,
      verifiedDomain,
      recommendedFromEmail: recommendedEmail,
    });
  } catch (error) {
    console.error("Error getting verified domain:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erro ao obter domínio verificado",
      },
      { status: 500 }
    );
  }
}

