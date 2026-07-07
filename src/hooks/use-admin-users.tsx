import { useQuery } from "@tanstack/react-query";
import { fetchAdminUsers, type AdminUsersData } from "@/lib/admin-api";
import { useAdminAuth } from "@/hooks/use-admin-auth";

export function useAdminUsers(page = 1, search = "", status = "all") {
  const { isAuthenticated } = useAdminAuth();

  return useQuery<AdminUsersData>({
    queryKey: ["admin-users", page, search, status],
    queryFn: () => fetchAdminUsers({ page, limit: 50, search, status }),
    enabled: isAuthenticated,
    staleTime: 15_000,
  });
}
