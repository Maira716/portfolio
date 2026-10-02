import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getClientByEmail, saveClient, readPortalData } from "@/lib/serverStore";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const cleanEmail = (email || "").trim().toLowerCase();
    const cleanPassword = (password || "").trim();

    if (!cleanEmail || !cleanPassword) {
      return NextResponse.json(
        { error: "E-mail e senha são obrigatórios." },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

    // 1. Admin login password verification
    if (
      cleanEmail === "mairareis2017@gmail.com" ||
      cleanEmail === "admin@mairareis.com.br"
    ) {
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

    // 2. Check local/server store first for instant client recognition
    const storedClient = getClientByEmail(cleanEmail);

    if (storedClient) {
      if (storedClient.status === "blocked") {
        return NextResponse.json(
          { error: "Acesso bloqueado. Entre em contato com a administração para reativar seu cadastro." },
          { status: 403 }
        );
      }

      // Check password: validate against stored client password
      const validPass = Boolean(
        storedClient.password &&
        (storedClient.password === cleanPassword || storedClient.password.trim() === cleanPassword)
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
