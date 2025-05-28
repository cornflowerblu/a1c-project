import { authMiddleware } from "@clerk/nextjs";
 
// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
// See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your middleware
export default authMiddleware({
  // Routes that can be accessed while signed out
  publicRoutes: ["/", "/sign-in", "/sign-up", "/sign-up/verify-email-address", "/api/webhook/clerk"],
  
  // Routes that can always be accessed, and have
  // no authentication information
  ignoredRoutes: ["/api/webhook/clerk"],
});
 
export const config = {
  // Matcher ignoring _next, static and api/webhook/clerk
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};