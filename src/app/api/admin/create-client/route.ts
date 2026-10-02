import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { saveClient } from "@/lib/serverStore";

export async function POST(req: Request) {
  try {
    const { email, password, fullName, phone, company, status } = await req.json();

    const cleanEmail = (email || "").trim().toLowerCase();
    const cleanFullName = (fullName || "").trim();
    const cleanPassword = (password || "").trim();

    if (!cleanEmail || !cleanPassword || !cleanFullName) {
      return NextResponse.json(
        { error: "E-mail, senha e nome completo são obrigatórios." },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        { error: `O e-mail "${cleanEmail}" está incompleto ou inválido. Verifique se incluiu a extensão correta (ex: @hotmail.com, @gmail.com ou @empresa.com.br).` },
        { status: 400 }
      );
    }

    // Validate password minimum length
    if (cleanPassword.length < 6) {
      return NextResponse.json(
        { error: "A senha deve conter no mínimo 6 caracteres para garantir a segurança da conta." },
        { status: 400 }
      );
    }

    // 1. Immediately persist in serverStore to guarantee login works instantly from any device
    const storedClient = saveClient({
      email: cleanEmail,
      full_name: cleanFullName,
      password: cleanPassword,
      phone: phone ? phone.trim() : null,
      company: company ? company.trim() : null,
      status: status || "active",
      role: "client",
    });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

    // 2. If service role key is available, use admin API directly
    if (serviceRoleKey) {
      try {
        const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
          auth: { autoRefreshToken: false, persistSession: false },
        });

        const { data: adminUser } = await supabaseAdmin.auth.admin.createUser({
          email: cleanEmail,
          password: cleanPassword,
          email_confirm: true,
          user_metadata: {
            full_name: cleanFullName,
            role: "client",
            phone: phone ? phone.trim() : null,
            company: company ? company.trim() : null,
            status: status || "active",
          },
        });

        if (adminUser?.user) {
          try {
            await supabaseAdmin.from("profiles").upsert([
              {
                id: adminUser.user.id,
                email: cleanEmail,
                full_name: cleanFullName,
                phone: phone ? phone.trim() : null,
                company: company ? company.trim() : null,
                status: status || "active",
                role: "client",
              },
            ]);
          } catch (e) {}

          return NextResponse.json({
            success: true,
            user: adminUser.user,
            profile: storedClient,
            message: "Cliente cadastrado com sucesso!",
          });
        }
      } catch (adminErr) {
        console.warn("Service role create failed:", adminErr);
      }
    }

    // 3. Try standard SignUp in Supabase Auth
    try {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      await supabase.auth.signUp({
        email: cleanEmail,
        password: cleanPassword,
        options: {
          data: {
            full_name: cleanFullName,
            role: "client",
            phone: phone ? phone.trim() : null,
            company: company ? company.trim() : null,
            status: status || "active",
          },
        },
      });
    } catch (e) {}

    return NextResponse.json({
      success: true,
      user: {
        id: storedClient.id,
        email: storedClient.email,
        user_metadata: {
          full_name: storedClient.full_name,
          role: "client",
        },
      },
      profile: storedClient,
      message: "Cliente cadastrado com sucesso!",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Erro interno ao cadastrar cliente." },
      { status: 500 }
    );
  }
}
