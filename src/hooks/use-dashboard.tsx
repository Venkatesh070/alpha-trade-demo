import { useQuery } from "@tanstack/react-query";
import { fetchDashboard, type DashboardData } from "@/lib/dashboard-api";
import { getStoredTokens } from "@/lib/token-store";

export function useDashboard() {
  return useQuery<DashboardData>({
    queryKey: ["dashboard"],
    queryFn: fetchDashboard,
    enabled: !!getStoredTokens(),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}
