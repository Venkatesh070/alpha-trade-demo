import { loadAdminSessionFromServer } from "@/lib/session-api";

function getApiBase(): string {
  const configured = import.meta.env.VITE_API_URL as string | undefined;
  if (configured?.trim()) return configured.replace(/\/$/, "");
  if (import.meta.env.DEV) return "";
  return "http://localhost:4000";
}

const API_URL = getApiBase();

export interface AdminDashboardStats {
  totalUsers: number;
  activeToday: number;
  volume24h: number;
  deposits24h: number;
}

export interface DailyActivePoint {
  date: string;
  count: number;
}

export interface AdminDashboardData {
  stats: AdminDashboardStats;
  dailyActiveUsers: DailyActivePoint[];
}

export type AdminUserStatus = "Active" | "Pending KYC" | "Suspended";

export interface AdminUserRow {
  id: string;
  userId: string;
  accountId: string | null;
  name: string;
  email: string;
  status: AdminUserStatus;
  balance: number;
  joined: string;
  joinedAt: number;
}

export interface AdminUsersData {
  users: AdminUserRow[];
  total: number;
  page: number;
  limit: number;
}

export interface PaymentSettings {
  qrImage: string | null;
  upiId: string;
  accountName: string;
  updatedAt: number;
}

export interface DepositRequest {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  amount: number;
  referenceId: string;
  screenshot: string;
  status: "pending" | "approved" | "rejected";
  createdAt: number;
  reviewedAt?: number;
}

async function getAdminToken(): Promise<string> {
  const stored = await loadAdminSessionFromServer();
  const token = stored?.tokens?.idToken;
  if (!token) throw new Error("Admin session expired. Please sign in again.");
  return token;
}

async function adminFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = await getAdminToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  const data = (await res.json()) as T & { error?: string };
  if (!res.ok) {
    throw new Error(data.error ?? "Admin request failed.");
  }
  return data;
}

async function adminGet<T>(path: string): Promise<T> {
  return adminFetch<T>(path);
}

async function adminPut<T>(path: string, body: unknown): Promise<T> {
  return adminFetch<T>(path, { method: "PUT", body: JSON.stringify(body) });
}

async function adminPost<T>(path: string, body?: unknown): Promise<T> {
  return adminFetch<T>(path, {
    method: "POST",
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
}

async function adminDelete<T>(path: string): Promise<T> {
  return adminFetch<T>(path, { method: "DELETE" });
}

export async function fetchAdminDashboard(days = 60): Promise<AdminDashboardData> {
  return adminGet<AdminDashboardData>(`/api/admin/dashboard?days=${days}`);
}

export async function fetchAdminStats(): Promise<{ stats: AdminDashboardStats }> {
  return adminGet("/api/admin/dashboard/stats");
}

export async function fetchAdminDailyActiveUsers(
  days = 60,
): Promise<{ dailyActiveUsers: DailyActivePoint[] }> {
  return adminGet(`/api/admin/dashboard/daily-active-users?days=${days}`);
}

export async function fetchAdminUsers(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}): Promise<AdminUsersData> {
  const qs = new URLSearchParams();
  if (params?.page) qs.set("page", String(params.page));
  if (params?.limit) qs.set("limit", String(params.limit));
  if (params?.search) qs.set("search", params.search);
  if (params?.status) qs.set("status", params.status);
  const query = qs.toString();
  return adminGet(`/api/admin/users${query ? `?${query}` : ""}`);
}

export async function fetchAdminUser(userId: string): Promise<{ user: AdminUserRow }> {
  return adminGet(`/api/admin/users/${userId}`);
}

export async function fetchAdminPaymentSettings(): Promise<{ settings: PaymentSettings }> {
  return adminGet("/api/admin/deposits/payment-settings");
}

export async function updateAdminPaymentSettings(
  patch: Partial<PaymentSettings>,
): Promise<{ settings: PaymentSettings }> {
  return adminPut("/api/admin/deposits/payment-settings", patch);
}

export async function fetchAdminDepositRequests(
  status = "all",
): Promise<{ requests: DepositRequest[] }> {
  return adminGet(`/api/admin/deposits/requests?status=${status}`);
}

export async function approveAdminDeposit(
  requestId: string,
): Promise<{ request: DepositRequest }> {
  return adminPost(`/api/admin/deposits/requests/${requestId}/approve`);
}

export async function rejectAdminDeposit(
  requestId: string,
): Promise<{ request: DepositRequest }> {
  return adminPost(`/api/admin/deposits/requests/${requestId}/reject`);
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  amount: number;
  accountNumber: string;
  ifsc: string;
  status: "pending" | "approved" | "rejected";
  createdAt: number;
  reviewedAt?: number;
}

export async function fetchAdminWithdrawalRequests(
  status = "all",
): Promise<{ requests: WithdrawalRequest[] }> {
  return adminGet(`/api/admin/deposits/withdrawal-requests?status=${status}`);
}

export async function approveAdminWithdrawal(
  requestId: string,
): Promise<{ request: WithdrawalRequest }> {
  return adminPost(`/api/admin/deposits/withdrawal-requests/${requestId}/approve`);
}

export async function rejectAdminWithdrawal(
  requestId: string,
): Promise<{ request: WithdrawalRequest }> {
  return adminPost(`/api/admin/deposits/withdrawal-requests/${requestId}/reject`);
}

export interface AdminNewsArticle {
  id: string;
  title: string;
  source: string;
  category: string;
  excerpt: string;
  publishedAt: string;
  active: boolean;
}

export async function fetchAdminNews(): Promise<{ articles: AdminNewsArticle[] }> {
  return adminGet("/api/admin/news");
}

export async function fetchAdminNewsArticle(
  id: string,
): Promise<{ article: AdminNewsArticle }> {
  return adminGet(`/api/admin/news/${id}`);
}

export async function createAdminNewsArticle(input: {
  title: string;
  category: string;
  body: string;
  source?: string;
}): Promise<{ article: AdminNewsArticle }> {
  return adminPost("/api/admin/news", input);
}

export async function updateAdminNewsArticle(
  id: string,
  input: {
    title?: string;
    category?: string;
    body?: string;
    source?: string;
    active?: boolean;
  },
): Promise<{ article: AdminNewsArticle }> {
  return adminPut(`/api/admin/news/${id}`, input);
}

export async function deleteAdminNewsArticle(id: string): Promise<{ message: string }> {
  return adminDelete(`/api/admin/news/${id}`);
}
