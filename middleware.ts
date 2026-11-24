import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken } from "@/lib/auth"
import { UserRole } from "@prisma/client"

// Routes that don't require authentication
const publicRoutes = [
  "/",
  "/login",
  "/cadastro",
  "/recuperar-senha",
  "/redefinir-senha",
  "/busca",
]

// Routes that require specific roles
const roleRoutes: Record<string, UserRole[]> = {
  "/system": ["SYSTEM"],
  "/admin": ["SYSTEM", "ADMIN", "VALIDATOR", "USER"],
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public routes
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )
  
  // Allow static files and API routes that handle their own auth
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.includes(".") ||
    isPublicRoute
  ) {
    return NextResponse.next()
  }

  // Check for auth token
  const token = request.cookies.get("auth_token")?.value

  if (!token) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Verify token
  const payload = await verifyToken(token)

  if (!payload) {
    const response = NextResponse.redirect(new URL("/login", request.url))
    response.cookies.delete("auth_token")
    return response
  }

  // Check role-based access
  for (const [route, allowedRoles] of Object.entries(roleRoutes)) {
    if (pathname.startsWith(route)) {
      if (!allowedRoles.includes(payload.role as UserRole)) {
        // Redirect to appropriate dashboard based on role
        if (payload.role === "SYSTEM") {
          return NextResponse.redirect(new URL("/system", request.url))
        }
        return NextResponse.redirect(new URL("/admin", request.url))
      }
    }
  }

  // Add user info to headers for server components
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-user-id", payload.sub)
  requestHeaders.set("x-user-role", payload.role)
  requestHeaders.set("x-organization-id", payload.organizationId || "")

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*|api/public).*)",
  ],
}
