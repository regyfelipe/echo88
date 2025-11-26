import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("sb-access-token");

    if (!sessionCookie) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { receiverId, content } = body;

    if (!receiverId || !content || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Receiver ID and content are required" },
        { status: 400 }
      );
    }

    // Verificar sessão do usuário
    const { data: { user }, error: authError } = await supabase.auth.getUser(sessionCookie.value);

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (user.id === receiverId) {
      return NextResponse.json(
        { error: "Cannot send message to yourself" },
        { status: 400 }
      );
    }

    // Criar mensagem
    const { data: message, error: messageError } = await supabase
      .from("direct_messages")
      .insert({
        sender_id: user.id,
        receiver_id: receiverId,
        content: content.trim(),
      })
      .select(`
        id,
        sender_id,
        receiver_id,
        content,
        is_read,
        created_at,
        sender:sender_id (
          id,
          full_name,
          username,
          avatar_url
        ),
        receiver:receiver_id (
          id,
          full_name,
          username,
          avatar_url
        )
      `)
      .single();

    if (messageError) {
      console.error("Error sending message:", messageError);
      return NextResponse.json(
        { error: "Failed to send message", details: messageError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ message });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in send message route:", error);
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 }
    );
  }
}
