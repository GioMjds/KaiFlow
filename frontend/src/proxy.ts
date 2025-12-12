import { type NextRequest, NextResponse } from "next/server";
import { auth } from "./gateways/Auth";

export async function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // Skip Next.js internals and obvious static assets
    if (
        pathname.startsWith("/_next/") ||
        pathname.startsWith("/favicon") ||
        pathname === "/robots.txt" ||
        pathname === "/sitemap.xml" ||
        pathname === "/manifest.webmanifest" ||
        /\.[a-zA-Z0-9]+$/.test(pathname)
    ) {
        return NextResponse.next();
    }

    const authPages = new Set(["/login", "/signup", "/otp"]);
    const isAuthPage = authPages.has(pathname);

    const accessToken = req.cookies.get("access_token")?.value;
    const refreshToken = req.cookies.get("refresh_token")?.value;
    const isAuthenticated = Boolean(accessToken);

    // Logged-in users should not see auth pages
    if (isAuthPage && isAuthenticated) {
        const url = req.nextUrl.clone();
        url.pathname = "/";
        return NextResponse.redirect(url);
    }

    if (isAuthPage) return NextResponse.next();

    if (isAuthenticated) return NextResponse.next();

    if (refreshToken) {
        try {
            await auth.refresh();
            return NextResponse.next();
        } catch (e) {
            return NextResponse.redirect(req.nextUrl.pathname = "/login");
        }
    }

    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
}