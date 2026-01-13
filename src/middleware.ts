import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

// Public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  "/",
  "/how-it-works",
  "/for-employers",
  "/for-employees",
  "/trust",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks/(.*)",
  "/api/health",
])

// Admin routes that require org:admin role
const isAdminRoute = createRouteMatcher([
  "/admin(.*)",
  "/api/organizations/(.*)/program(.*)",
  "/api/organizations/(.*)/analytics(.*)",
  "/api/organizations/(.*)/rules(.*)",
])

export default clerkMiddleware(async (auth, req) => {
  // Allow public routes without authentication
  if (isPublicRoute(req)) {
    return
  }

  // Protect all other routes
  await auth.protect()

  // Additional admin check for admin routes
  if (isAdminRoute(req)) {
    const { sessionClaims } = await auth()
    const role = sessionClaims?.org_role as string | undefined

    if (role !== "org:admin") {
      // Redirect non-admins to employee dashboard
      return Response.redirect(new URL("/employee", req.url))
    }
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
}
