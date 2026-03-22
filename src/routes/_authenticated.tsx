import { Outlet, createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: ({ context }) => {
    if (context.auth && !context.auth.isAuthenticated) {
      throw redirect({ to: "/login" })
    }
  },
  component: () => <Outlet />,
})
