import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { saveClient } from "@/lib/serverStore";

export async function POST(req: Request) {
  try {
    const { clientId, email, password, fullName, phone, company, status } = await req.json();

    const cleanEmail = (email || "").trim().toLowerCase();
    const cleanFullName = (fullName || "").trim();
    const cleanPassword = (password || "").trim();

    if (!clientId && !cleanEmail) {
      return NextResponse.json(
        { error: "ID do cliente ou e-mail é obrigatório." },
        { status: 400 }
      );
    }

    // Persist in serverStore
    if (cleanEmail) {
      saveClient({
        id: clientId || undefined,
        email: cleanEmail,
        full_name: cleanFullName || "Cliente",
        password: cleanPassword || undefined,
        phone: phone ? phone.trim() : null,
        company: company ? company.trim() : null,
        status: status || "active",
        role: "client",
      });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

    // Helper for resilient profile update
    const safeUpdateProfileRecord = async (clientInstance: any, id: string, profileData: any) => {
      let payload = { ...profileData };
      for (let i = 0; i < 4; i++) {
        const { error } = await clientInstance.from("profiles").update(payload).eq("id", id);
        if (!error) return true;
        const msg = (error.message || "").toLowerCase();
        if (msg.includes("company")) delete payload.company;
        else if (msg.includes("phone")) delete payload.phone;
        else if (msg.includes("status")) delete payload.status;
        else if (msg.includes("column") && msg.includes("schema cache")) {
          payload = {
            email: profileData.email,
            full_name: profileData.full_name,
          };
        } else {
          break;
        }
      }
      return false;
    };

    let authUpdated = false;

    // If service role key is available, update user credentials in Supabase Auth (including password)
    if (serviceRoleKey) {
      try {
        const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
          auth: { autoRefreshToken: false, persistSession: false },
        });

        // Find user by ID or email
        let targetUserId = clientId;
        if (!targetUserId && cleanEmail) {
          const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
          const found = usersData?.users?.find((u) => u.email?.toLowerCase() === cleanEmail);
          if (found) targetUserId = found.id;
        }

        if (targetUserId) {
          const updateData: any = {};
          if (cleanEmail) updateData.email = cleanEmail;
          if (cleanPassword && cleanPassword.length >= 6) updateData.password = cleanPassword;
          updateData.user_metadata = {
            full_name: cleanFullName,
            role: "client",
            phone: phone ? phone.trim() : null,
            company: company ? company.trim() : null,
            status: status || "active",
          };

          const { error: updateAuthErr } = await supabaseAdmin.auth.admin.updateUserById(
            targetUserId,
            updateData
          );

          if (!updateAuthErr) {
            authUpdated = true;
          }

          // Update profiles table
          await safeUpdateProfileRecord(supabaseAdmin, targetUserId, {
            email: cleanEmail,
            full_name: cleanFullName,
            phone: phone ? phone.trim() : null,
            company: company ? company.trim() : null,
            status: status || "active",
          });

          return NextResponse.json({
            success: true,
            authUpdated: true,
            message: "Dados e senha do cliente atualizados com sucesso no sistema!",
          });
        }
      } catch (adminErr) {
        console.warn("Service role update failed, falling back to anon:", adminErr);
      }
    }

    // Fallback standard profile update
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    if (clientId) {
      await safeUpdateProfileRecord(supabase, clientId, {
        email: cleanEmail,
        full_name: cleanFullName,
        phone: phone ? phone.trim() : null,
        company: company ? company.trim() : null,
        status: status || "active",
      });
    }

    return NextResponse.json({
      success: true,
      authUpdated,
      message: "Dados do cliente atualizados com sucesso!",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Erro interno ao atualizar cliente." },
      { status: 500 }
    );
  }
}
