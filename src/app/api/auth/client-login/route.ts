import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getClientByEmail, saveClient, readPortalData } from "@/lib/serverStore";
import { checkRateLimit, verifyPassword, isValidEmail, sanitizeString, ADMIN_EMAILS } from "@/lib/apiSecurity";

export async function POST(req: NextRequest) {
  try {
    // 1. Server-side Rate Limiting (10 attempts per minute per IP)
    const rateLimit = checkRateLimit(req, 10, 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Muitas tentativas de login. Por segurança, aguarde 1 minuto antes de tentar novamente." },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil(rateLimit.resetInMs / 1000).toString(),
          },
        }
      );
    }

    const body = await req.json().catch(() => ({}));
    const rawEmail = body.email;
    const rawPassword = body.password;

    if (!rawEmail || !rawPassword || typeof rawEmail !== "string" || typeof rawPassword !== "string") {
      return NextResponse.json(
        { error: "E-mail e senha são obrigatórios." },
        { status: 400 }
      );
    }

    const cleanEmail = rawEmail.trim().toLowerCase();
    const cleanPassword = rawPassword.trim();

    if (!isValidEmail(cleanEmail)) {
      return NextResponse.json(
        { error: "Formato de e-mail inválido." },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

    // 2. Admin login verification
    const isAdminEmail = ADMIN_EMAILS.includes(cleanEmail);
    if (isAdminEmail) {
      try {
        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: cleanPassword,
        });

        if (!authError && authData.user) {
          const adminUser = {
            id: authData.user.id,
            email: cleanEmail,
            user_metadata: { full_name: "Maira Reis", role: "admin" },
          };
          const adminProfile = {
            id: authData.user.id,
            email: cleanEmail,
            full_name: "Maira Reis",
            role: "admin",
            status: "active",
          };
          return NextResponse.json({
            success: true,
            user: adminUser,
            profile: adminProfile,
            message: "Login de administradora autorizado!",
          });
        }
      } catch (authErr) {
        console.warn("Admin Supabase auth check failed:", authErr);
      }
    }

    // 3. Check local/server store first for instant client recognition
    const storedClient = getClientByEmail(cleanEmail);

    if (storedClient) {
      if (storedClient.status === "blocked") {
        return NextResponse.json(
          { error: "Acesso bloqueado. Entre em contato com a administração para reativar seu cadastro." },
          { status: 403 }
        );
      }

      // Check password with constant-time verification & salt support
      const validPass = Boolean(
        storedClient.password && verifyPassword(cleanPassword, storedClient.password)
      );

      if (!validPass) {
        return NextResponse.json(
          { error: "E-mail ou senha incorretos. Verifique suas credenciais." },
          { status: 401 }
        );
      }

      const clientUser = {
        id: storedClient.id,
        email: cleanEmail,
        user_metadata: {
          full_name: storedClient.full_name,
          role: storedClient.role || "client",
        },
      };

      const clientProfile = {
        id: storedClient.id,
        email: cleanEmail,
        full_name: storedClient.full_name,
        role: storedClient.role || "client",
        phone: storedClient.phone || null,
        company: storedClient.company || null,
        status: storedClient.status || "active",
      };

      // Try background sync with Supabase Auth if service role exists
      if (serviceRoleKey) {
        try {
          const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
            auth: { autoRefreshToken: false, persistSession: false },
          });
          const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
          const existingAuthUser = listData?.users?.find(
            (u) => u.email?.toLowerCase() === cleanEmail
          );
          if (existingAuthUser) {
            await supabaseAdmin.auth.admin.updateUserById(existingAuthUser.id, {
              password: cleanPassword,
              email_confirm: true,
            });
          }
        } catch (adminErr) {
          console.warn("Service role sync failed:", adminErr);
        }
      }

      return NextResponse.json({
        success: true,
        user: clientUser,
        profile: clientProfile,
        message: "Login autenticado com sucesso!",
      });
    }

    // 3. Fallback: Query Supabase DB / profiles table
    try {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      const { data: profileRecord } = await supabase
        .from("profiles")
        .select("*")
        .ilike("email", cleanEmail)
        .maybeSingle();

      if (profileRecord) {
        if (profileRecord.status === "blocked") {
          return NextResponse.json(
            { error: "Acesso bloqueado. Entre em contato com a administração para reativar seu cadastro." },
            { status: 403 }
          );
        }

        // Save to local server store for instant future logins
        saveClient({
          id: profileRecord.id,
          email: cleanEmail,
          full_name: profileRecord.full_name || "Cliente",
          password: cleanPassword,
          role: profileRecord.role || "client",
          phone: profileRecord.phone,
          company: profileRecord.company,
          status: profileRecord.status || "active",
        });

        const userObj = {
          id: profileRecord.id,
          email: cleanEmail,
          user_metadata: {
            full_name: profileRecord.full_name,
            role: profileRecord.role || "client",
          },
        };

        return NextResponse.json({
          success: true,
          user: userObj,
          profile: profileRecord,
          message: "Login autenticado com sucesso!",
        });
      }
    } catch (dbErr) {
      console.warn("DB profile lookup failed:", dbErr);
    }

    return NextResponse.json(
      { error: "E-mail ou senha incorretos. Verifique suas credenciais ou solicite seu cadastro." },
      { status: 401 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Erro interno no servidor de autenticação." },
      { status: 500 }
    );
  }
}
