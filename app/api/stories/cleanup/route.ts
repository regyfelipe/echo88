import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

/**
 * POST /api/stories/cleanup
 * Limpar stories expiradas (pode ser chamado por um cron job)
 * Nota: Em produção, configure um cron job para chamar esta rota periodicamente
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar se há um token de autenticação para cron jobs
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const supabase = await createServerClient();

    // Deletar stories expiradas
    const { data, error } = await supabase
      .from("stories")
      .delete()
      .lt("expires_at", new Date().toISOString())
      .select("id");

    if (error) {
      console.error("Error cleaning up expired stories:", error);
      return NextResponse.json(
        { error: "Failed to cleanup stories" },
        { status: 500 }
      );
    }

    const deletedCount = data?.length || 0;

    return NextResponse.json({
      success: true,
      deletedCount,
      message: `Deleted ${deletedCount} expired stories`,
    });
  } catch (error) {
    console.error("Error in POST /api/stories/cleanup:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

