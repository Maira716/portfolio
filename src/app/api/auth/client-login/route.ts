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

    // Helper to generate a standardized admin session response
    const buildAdminSuccessResponse = (
      adminId: string,
      adminEmail: string,
      fullName: string = "Maira Reis"
    ) => {
      const adminUser = {
        id: adminId,
        email: adminEmail,
        user_metadata: { full_name: fullName, role: "admin" },
      };
      const adminProfile = {
        id: adminId,
        email: adminEmail,
        full_name: fullName,
        role: "admin" as const,
        status: "active" as const,
      };

      const response = NextResponse.json({
        success: true,
        user: adminUser,
        profile: adminProfile,
        message: "Login de administradora autorizado!",
      });

      // Set cookie so middleware and SSR recognize admin session seamlessly
      response.cookies.set("portfolio_client_session", JSON.stringify({
        id: adminId,
        email: adminEmail,
        role: "admin",
        name: fullName,
      }), {
        path: "/",
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      return response;
    };

    // 2. Admin login verification
    const isAdminEmail = ADMIN_EMAILS.includes(cleanEmail);
    if (isAdminEmail) {
      // 2.1 Check Supabase Auth if credentials exist
      try {
        if (supabaseUrl && supabaseAnonKey) {
          const supabase = createClient(supabaseUrl, supabaseAnonKey);
          const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password: cleanPassword,
          });

          if (!authError && authData.user) {
            return buildAdminSuccessResponse(
              authData.user.id,
              cleanEmail,
              authData.user.user_metadata?.full_name || "Maira Reis"
            );
          }
        }
      } catch (authErr) {
        console.warn("Admin Supabase auth check failed:", authErr);
      }

      // 2.2 Check stored admin in serverStore
      const storedAdmin = getClientByEmail(cleanEmail);
      if (storedAdmin) {
        const isStoredPassValid =
          storedAdmin.password &&
          (storedAdmin.password === cleanPassword || verifyPassword(cleanPassword, storedAdmin.password));

        if (isStoredPassValid) {
          return buildAdminSuccessResponse(
            storedAdmin.id,
            cleanEmail,
            storedAdmin.full_name || "Maira Reis"
          );
        }
      }

      // 2.3 Master / standard admin initial password fallbacks
      const isMasterAdminPass =
        cleanPassword === "Admin@123" ||
        cleanPassword === "Cliente@123" ||
        cleanPassword === "Maira@123" ||
        cleanPassword.toLowerCase() === "admin@123" ||
        cleanPassword.toLowerCase() === "admin123" ||
        cleanPassword.toLowerCase() === "cliente@123" ||
        cleanPassword.toLowerCase() === "cliente123" ||
        cleanPassword.toLowerCase() === "maira123" ||
        cleanPassword.toLowerCase() === "mairareis2017" ||
        Boolean(process.env.ADMIN_PASSWORD && cleanPassword === process.env.ADMIN_PASSWORD);

      if (isMasterAdminPass) {
        // Save/ensure admin in server store
        saveClient({
          id: storedAdmin?.id || "admin-maira-01",
          email: cleanEmail,
          full_name: "Maira Reis",
          password: cleanPassword,
          role: "admin",
          status: "active",
        });

        return buildAdminSuccessResponse(
          storedAdmin?.id || "admin-maira-01",
          cleanEmail,
          "Maira Reis"
        );
      }

      // 2.4 Admin credentials did not match
      return NextResponse.json(
        {
          error: "E-mail ou senha incorretos. Verifique suas credenciais de acesso.",
        },
        { status: 401 }
      );
    }

    const isDefaultPasswordMatch =
      cleanPassword === DEFAULT_CLIENT_PASSWORD ||
      cleanPassword.toLowerCase() === "cliente@123" ||
      cleanPassword.toLowerCase() === "cliente123";

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
          { error: "Acesso bloqueado. Este perfil foi suspenso temporariamente pela administração. Entre em contato para reativação." },
          { status: 403 }
        );
      }

      // Check password: match default password variations OR stored password hash
      const validPass =
        isDefaultPasswordMatch ||
        Boolean(storedClient.password && verifyPassword(cleanPassword, storedClient.password));

      if (!validPass) {
        return NextResponse.json(
          {
            error: "E-mail ou senha incorretos. Verifique suas credenciais de acesso.",
          },
          { status: 401 }
        );
      }

      // If logging in with default password and password not yet stored, persist it
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
            { error: "Acesso bloqueado. Este perfil foi suspenso temporariamente pela administração. Entre em contato para reativação." },
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
        } else {
          return NextResponse.json(
            {
              error: "E-mail ou senha incorretos. Verifique suas credenciais de acesso.",
            },
            { status: 401 }
          );
        }
      }
    } catch (dbErr) {
      console.warn("DB profile lookup failed:", dbErr);
    }

    // 5. Account not found in server store or database
    return NextResponse.json(
      {
        error: "E-mail não cadastrado ou credenciais incorretas. Entre em contato com a administração.",
      },
      { status: 401 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Erro interno no servidor de autenticação." },
      { status: 500 }
    );
  }
}
