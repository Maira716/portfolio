import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const { email, password, fullName, phone, company, status } = await req.json();

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: "E-mail, senha e nome completo são obrigatórios." },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

    // Create client using Supabase
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: "client",
          phone: phone || null,
          company: company || null,
          status: status || "active",
        },
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Also update/insert profile record with company and status
    if (data.user) {
      await supabase
        .from("profiles")
        .upsert([
          {
            id: data.user.id,
            email: email,
            full_name: fullName,
            phone: phone || null,
            company: company || null,
            status: status || "active",
            role: "client",
          },
        ]);
    }

    return NextResponse.json({
      success: true,
      user: data.user,
      message: "Cliente cadastrado com sucesso!",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Erro interno ao cadastrar cliente." },
      { status: 500 }
    );
  }
}
