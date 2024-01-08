import { authMiddleware } from "@clerk/nextjs";

// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
// See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your Middleware
export default authMiddleware({
  // gotem: remove getAll from protection
  publicRoutes: [
    "/",
    "/api/trpc/post.getAll",
    "/post/:id",
    "/@:username",
    "/api/trpc/post.getPostByUserId,profile.getUserByUsername",
  ],
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(trpc|api)(.*)"],
};
