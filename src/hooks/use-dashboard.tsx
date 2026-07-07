import { useQuery } from "@tanstack/react-query";
import { fetchDashboard, type DashboardData } from "@/lib/dashboard-api";
import { useAuth } from "@/hooks/use-auth";

export function useDashboard() {
  const { isAuthenticated } = useAuth();

  return useQuery<DashboardData>({
    queryKey: ["dashboard"],
    queryFn: fetchDashboard,
    enabled: isAuthenticated,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}
