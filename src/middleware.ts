import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const pathname = request.nextUrl.pathname;

  // Protect /admin and /portal routes on server
  const isAdminRoute = pathname.startsWith("/admin");
  const isPortalRoute = pathname.startsWith("/portal");

  if (isAdminRoute || isPortalRoute) {
    try {
      // 1. Validate token strictly on the server using getUser()
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      const clientCookie = request.cookies.get("portfolio_client_session")?.value;
      let parsedClient: { id?: string; email?: string; role?: string } | null = null;
      if (clientCookie) {
        try {
          parsedClient = JSON.parse(clientCookie);
        } catch {}
      }

      const activeUser = user || (parsedClient ? { id: parsedClient.id || "client", email: parsedClient.email } : null);

      if (!activeUser) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
      }

      // 2. Query user profile from database to determine role and status (if Supabase user exists)
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role, status")
          .eq("id", user.id)
          .maybeSingle();

        // 3. Block access if user is suspended/blocked
        if (profile?.status === "blocked") {
          const blockedUrl = new URL("/login", request.url);
          blockedUrl.searchParams.set("error", "blocked");
          return NextResponse.redirect(blockedUrl);
        }

        // 4. If accessing /admin, require role === 'admin'
        if (isAdminRoute) {
          if (profile?.role !== "admin") {
            // If logged in as client, redirect to client portal
            return NextResponse.redirect(new URL("/portal", request.url));
          }
        }
      } else if (isAdminRoute) {
        // Non-supabase or client-only session cannot access /admin
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
      }
    } catch {
      // In case of unexpected server error on protected route, redirect to login
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

