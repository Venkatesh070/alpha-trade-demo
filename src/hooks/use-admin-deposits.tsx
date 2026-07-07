import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchAdminPaymentSettings,
  fetchAdminDepositRequests,
  fetchAdminWithdrawalRequests,
  updateAdminPaymentSettings,
  approveAdminDeposit,
  rejectAdminDeposit,
  approveAdminWithdrawal,
  rejectAdminWithdrawal,
  type PaymentSettings,
  type DepositRequest,
  type WithdrawalRequest,
} from "@/lib/admin-api";
import { useAdminAuth } from "@/hooks/use-admin-auth";

export function useAdminDeposits() {
  const { isAuthenticated } = useAdminAuth();
  const queryClient = useQueryClient();

  const settingsQuery = useQuery<{ settings: PaymentSettings }>({
    queryKey: ["admin-payment-settings"],
    queryFn: fetchAdminPaymentSettings,
    enabled: isAuthenticated,
    staleTime: 30_000,
  });

  const depositRequestsQuery = useQuery<{ requests: DepositRequest[] }>({
    queryKey: ["admin-deposit-requests"],
    queryFn: () => fetchAdminDepositRequests("all"),
    enabled: isAuthenticated,
    staleTime: 10_000,
    refetchInterval: 30_000,
  });

  const withdrawalRequestsQuery = useQuery<{ requests: WithdrawalRequest[] }>({
    queryKey: ["admin-withdrawal-requests"],
    queryFn: () => fetchAdminWithdrawalRequests("all"),
    enabled: isAuthenticated,
    staleTime: 10_000,
    refetchInterval: 30_000,
  });

  const updateSettings = useMutation({
    mutationFn: (patch: Partial<PaymentSettings>) => updateAdminPaymentSettings(patch),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-payment-settings"] });
    },
  });

  const approve = useMutation({
    mutationFn: (requestId: string) => approveAdminDeposit(requestId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-deposit-requests"] });
    },
  });

  const reject = useMutation({
    mutationFn: (requestId: string) => rejectAdminDeposit(requestId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-deposit-requests"] });
    },
  });

  const approveWithdrawal = useMutation({
    mutationFn: (requestId: string) => approveAdminWithdrawal(requestId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-withdrawal-requests"] });
    },
  });

  const rejectWithdrawal = useMutation({
    mutationFn: (requestId: string) => rejectAdminWithdrawal(requestId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-withdrawal-requests"] });
    },
  });

  const refetchAll = () => {
    void depositRequestsQuery.refetch();
    void withdrawalRequestsQuery.refetch();
  };

  return {
    settings: settingsQuery.data?.settings,
    requests: depositRequestsQuery.data?.requests ?? [],
    withdrawalRequests: withdrawalRequestsQuery.data?.requests ?? [],
    isLoading:
      settingsQuery.isLoading ||
      depositRequestsQuery.isLoading ||
      withdrawalRequestsQuery.isLoading,
    isError:
      settingsQuery.isError ||
      depositRequestsQuery.isError ||
      withdrawalRequestsQuery.isError,
    refetchRequests: refetchAll,
    updateSettings,
    approve,
    reject,
    approveWithdrawal,
    rejectWithdrawal,
  };
}
