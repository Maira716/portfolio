import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { saveClient, getClientByEmail } from "@/lib/serverStore";
import { getAuthenticatedUser } from "@/lib/apiSecurity";

export async function POST(req: Request) {
  try {
    const auth = await getAuthenticatedUser(req);
    const body = await req.json().catch(() => ({}));
    const { newPassword, confirmPassword, email: bodyEmail } = body;

    const targetEmail = (auth.user?.email || bodyEmail || "").toLowerCase().trim();

    if (!targetEmail) {
      return NextResponse.json(
        { error: "Usuário não autenticado ou e-mail não informado." },
        { status: 401 }
      );
    }

    const cleanPass = String(newPassword || "").trim();
    const cleanConfirm = String(confirmPassword || "").trim();

    if (!cleanPass || cleanPass.length < 6) {
      return NextResponse.json(
        { error: "A nova senha deve ter no mínimo 6 caracteres." },
        { status: 400 }
      );
    }

    if (cleanPass !== cleanConfirm) {
      return NextResponse.json(
        { error: "A confirmação de senha não coincide com a nova senha." },
        { status: 400 }
      );
    }

    // 1. Update in local ServerStore
    const clientRecord = getClientByEmail(targetEmail);

    saveClient({
      id: clientRecord?.id || auth.user?.id || undefined,
      email: targetEmail,
      full_name: clientRecord?.full_name || auth.user?.email || "Cliente",
      password: cleanPass,
      phone: clientRecord?.phone || null,
      company: clientRecord?.company || null,
      status: clientRecord?.status || "active",
      role: clientRecord?.role || "client",
    });

    // 2. Update in Supabase Auth if service role exists
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

    if (supabaseUrl && serviceRoleKey) {
      try {
        const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
          auth: { autoRefreshToken: false, persistSession: false },
        });

        let targetUserId = auth.user?.id || clientRecord?.id;
        if (!targetUserId) {
          const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
          const found = usersData?.users?.find((u) => u.email?.toLowerCase() === targetEmail);
          if (found) targetUserId = found.id;
        }

        if (targetUserId) {
          await supabaseAdmin.auth.admin.updateUserById(targetUserId, {
            password: cleanPass,
          });
        }
      } catch (adminErr) {
        console.warn("Supabase admin auth password update error:", adminErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Senha atualizada com sucesso! Use a nova senha em seus próximos acessos.",
    });
  } catch (err: any) {
    console.error("Portal change-password error:", err);
    return NextResponse.json(
      { error: err.message || "Falha interna ao atualizar senha." },
      { status: 500 }
    );
  }
}
