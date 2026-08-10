import { createRootRoute, Outlet } from "@tanstack/react-router"

import { AppShell } from "@/components/app-shell"

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: () => (
    <div className="mx-auto max-w-6xl px-5 py-20 text-center">
      <p className="text-6xl font-black text-primary">404</p>
      <h1 className="mt-4 text-2xl font-black">Essa página saiu do roteiro.</h1>
    </div>
  ),
})

function RootLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  )
}
