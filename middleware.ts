import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const protectedPrefixes = [
    "/dashboard", "/patients", "/appointments", "/foods", "/audit", "/settings",
    "/ai-assistant", "/photos", "/templates", "/reports", "/patient-portal",
    "/events", "/messages", "/security",
  ];
  const isAppRoute = protectedPrefixes.some((p) => request.nextUrl.pathname.startsWith(p));

  if (isAppRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*", "/patients/:path*", "/appointments/:path*", "/foods/:path*",
    "/audit/:path*", "/settings/:path*", "/ai-assistant/:path*", "/photos/:path*",
    "/templates/:path*", "/reports/:path*", "/patient-portal/:path*", "/events/:path*",
    "/messages/:path*", "/security/:path*",
  ],
};
