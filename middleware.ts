import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get("jwt")?.value;

    // Chặn quay lại login nếu đã đăng nhập
    if (token && pathname.startsWith("/auth/login")) {
        return NextResponse.redirect(new URL("/main/hrms/dashboard", request.url));
    }

    if (
        pathname.startsWith("/auth") ||
        pathname.startsWith("/_next") ||
        pathname.startsWith("/assets") ||
        pathname === "/"
    ) {
        return NextResponse.next();
    }


    if (!token) {
        const loginUrl = new URL("/auth/login", request.url);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/main/:path*",
        "/auth/:path*",],
};
