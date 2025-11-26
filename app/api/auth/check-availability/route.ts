import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail, getUserByUsername } from "@/lib/db/users-supabase";

/**
 * POST /api/auth/check-availability
 * Verifica disponibilidade de email e username
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, username } = body;

    const result: {
      email?: { available: boolean; message?: string };
      username?: { available: boolean; message?: string };
    } = {};

    // Verifica email se fornecido
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        result.email = {
          available: false,
          message: "Formato de email inválido",
        };
      } else {
        const existing = await getUserByEmail(email);
        result.email = {
          available: !existing,
          message: existing ? "Email já cadastrado" : "Email disponível",
        };
      }
    }

    // Verifica username se fornecido
    if (username) {
      // Valida formato básico
      if (username.length < 3 || username.length > 30) {
        result.username = {
          available: false,
          message: "Username deve ter entre 3 e 30 caracteres",
        };
      } else if (username.startsWith(".") || username.endsWith(".")) {
        result.username = {
          available: false,
          message: "Não pode começar ou terminar com ponto",
        };
      } else if (username.includes("..")) {
        result.username = {
          available: false,
          message: "Não pode ter pontos consecutivos",
        };
      } else {
        const usernameRegex = /^[a-zA-Z0-9_.]+$/;
        if (!usernameRegex.test(username)) {
          result.username = {
            available: false,
            message: "Use apenas letras, números, underscore e ponto",
          };
        } else {
          const existing = await getUserByUsername(username);
          result.username = {
            available: !existing,
            message: existing
              ? "Username já cadastrado"
              : "Username disponível",
          };
        }
      }
    }

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("Check availability error:", error);
    return NextResponse.json(
      { error: "Erro ao verificar disponibilidade" },
      { status: 500 }
    );
  }
}
