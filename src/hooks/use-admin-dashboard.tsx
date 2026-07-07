import { useQuery } from "@tanstack/react-query";
import { fetchAdminDashboard, type AdminDashboardData } from "@/lib/admin-api";
import { useAdminAuth } from "@/hooks/use-admin-auth";

export function useAdminDashboard(days = 60) {
  const { isAuthenticated } = useAdminAuth();

  return useQuery<AdminDashboardData>({
    queryKey: ["admin-dashboard", days],
    queryFn: () => fetchAdminDashboard(days),
    enabled: isAuthenticated,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}
