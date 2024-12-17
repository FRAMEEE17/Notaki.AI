import { clerkMiddleware } from '@clerk/nextjs/server'

// Function to check if route is public
const isPublicRoute = (request: Request) => {
  const publicPaths = ['/', '/sign-in', '/sign-up']
  const { pathname } = new URL(request.url)
  return publicPaths.includes(pathname)
}

export default clerkMiddleware(async (auth, request) => {
  const { userId, redirectToSignIn } = await auth();
  if (!userId && !isPublicRoute(request)) {
    return redirectToSignIn();
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(html?|css|js|json|jpg|png|svg|ico|csv|doc|pdf)).*)',
    '/(api|trpc)(.*)',
  ],
}