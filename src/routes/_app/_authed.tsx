import LoginOrSignUp from '@/components/LoginOrSignUp'
import { getUserFn } from '@/lib/auth'
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/_authed')({
  component: RouteComponent,
  beforeLoad: async () => {
    try {
      const { user } = await getUserFn()
      return { isLoggedIn: !!user.email }
    } catch (_) {
      return { isLoggedIn: false }
    }
  },
})

function RouteComponent() {
  const { isLoggedIn } = Route.useRouteContext()
  if (!isLoggedIn) return <LoginOrSignUp />

  return <Outlet />
}
