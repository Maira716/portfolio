import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getClientByEmail, saveClient, readPortalData } from "@/lib/serverStore";
import { checkRateLimit, verifyPassword, isValidEmail, sanitizeString, ADMIN_EMAILS } from "@/lib/apiSecurity";

const DEFAULT_CLIENT_PASSWORD = "Cliente@123";

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

    const isDefaultPasswordMatch =
      cleanPassword === DEFAULT_CLIENT_PASSWORD ||
      cleanPassword.toLowerCase() === DEFAULT_CLIENT_PASSWORD.toLowerCase();

    // Helper to generate a standardized client session response
    const buildSuccessResponse = (
      clientObj: {
        id: string;
        email: string;
        full_name: string;
        role?: string;
        phone?: string | null;
        company?: string | null;
        status?: string;
      }
    ) => {
      const clientUser = {
        id: clientObj.id,
        email: cleanEmail,
        user_metadata: {
          full_name: clientObj.full_name,
          role: "client",
        },
      };

      const clientProfile = {
        id: clientObj.id,
        email: cleanEmail,
        full_name: clientObj.full_name,
        role: "client" as const,
        phone: clientObj.phone || null,
        company: clientObj.company || null,
        status: (clientObj.status as any) || "active",
      };

      const response = NextResponse.json({
        success: true,
        user: clientUser,
        profile: clientProfile,
        message: "Login autenticado com sucesso!",
      });

      // Set cookie so middleware and SSR recognize client session seamlessly
      response.cookies.set("portfolio_client_session", JSON.stringify({
        id: clientObj.id,
        email: cleanEmail,
        role: "client",
        name: clientObj.full_name,
      }), {
        path: "/",
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      return response;
    };

    // 3. Check local/server store first
    const storedClient = getClientByEmail(cleanEmail);

    if (storedClient) {
      if (storedClient.status === "blocked") {
        return NextResponse.json(
          { error: "Acesso bloqueado. Entre em contato com a administração para reativar seu cadastro." },
          { status: 403 }
        );
      }

      // Check password with verifyPassword or system default client password fallback
      const validPass =
        isDefaultPasswordMatch ||
        Boolean(storedClient.password && verifyPassword(cleanPassword, storedClient.password));

      if (!validPass) {
        return NextResponse.json(
          { error: "E-mail ou senha incorretos. Verifique suas credenciais." },
          { status: 401 }
        );
      }

      // If logging in with default password, ensure it is stored
      if (isDefaultPasswordMatch && !storedClient.password) {
        storedClient.password = DEFAULT_CLIENT_PASSWORD;
        saveClient(storedClient);
      }

      return buildSuccessResponse(storedClient);
    }

    // 4. Query Supabase DB / profiles table using Service Role or Anon Key
    try {
      const supabase = createClient(supabaseUrl, serviceRoleKey || supabaseAnonKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
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

        const validPass =
          isDefaultPasswordMatch ||
          Boolean((profileRecord as any).password && verifyPassword(cleanPassword, (profileRecord as any).password));

        if (validPass) {
          // Save to local server store for instant future logins
          const saved = saveClient({
            id: profileRecord.id,
            email: cleanEmail,
            full_name: profileRecord.full_name || cleanEmail.split("@")[0],
            password: cleanPassword,
            role: "client",
            phone: profileRecord.phone,
            company: profileRecord.company,
            status: profileRecord.status || "active",
          });

          return buildSuccessResponse(saved);
        }
      }
    } catch (dbErr) {
      console.warn("DB profile lookup failed:", dbErr);
    }

    // 5. If using standard default client password (e.g. registered in Admin/Projects), grant client access
    if (isDefaultPasswordMatch) {
      const emailPrefix = cleanEmail.split("@")[0];
      const derivedName = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);

      const newClient = saveClient({
        email: cleanEmail,
        full_name: derivedName,
        password: cleanPassword,
        role: "client",
        status: "active",
      });

      return buildSuccessResponse(newClient);
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
