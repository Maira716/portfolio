import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { deleteClient } from "@/lib/serverStore";

export async function POST(req: Request) {
  try {
    const { clientId, email } = await req.json();

    if (!clientId && !email) {
      return NextResponse.json({ error: "clientId or email is required" }, { status: 400 });
    }

    // 1. Delete from serverStore
    if (clientId) deleteClient(clientId);
    if (email) deleteClient(email);

    // 2. Delete from Supabase Auth & DB (if possible)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

    if (serviceRoleKey) {
      try {
        const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
          auth: { autoRefreshToken: false, persistSession: false },
        });

        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(clientId || "");
        if (isUUID) {
          await supabaseAdmin.auth.admin.deleteUser(clientId);
          await supabaseAdmin.from("profiles").delete().eq("id", clientId);
        } else if (email) {
          const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
          const found = usersData?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());
          if (found) {
            await supabaseAdmin.auth.admin.deleteUser(found.id);
            await supabaseAdmin.from("profiles").delete().eq("id", found.id);
          }
        }
      } catch (e) {}
    }

    try {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(clientId || "");
      if (isUUID) {
        await supabase.from("profiles").delete().eq("id", clientId);
      } else if (email) {
        await supabase.from("profiles").delete().ilike("email", email);
      }
    } catch (e) {}

    return NextResponse.json({ success: true, message: "Cliente excluído com sucesso!" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
