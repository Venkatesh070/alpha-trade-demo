import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/app/wallet")({
  component: WalletLayout,
});

function WalletLayout() {
  return <Outlet />;
}
