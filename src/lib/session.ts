import type { AdminProfile, UserProfile } from "@/lib/auth-api";

export const USER_KEY = "exness-auth";
export const ADMIN_KEY = "exness-admin-auth";

export function hasUserSession(): boolean {
  return false;
}

export function hasAdminSession(): boolean {
  return false;
}

export function loadUserSession(): { user: UserProfile | null; tokens: null } {
  return { user: null, tokens: null };
}

export function saveUserSession(_user: UserProfile | null, _tokens: null) {}

export function loadAdminSession(): { admin: AdminProfile | null; tokens: null } {
  return { admin: null, tokens: null };
}

export function saveAdminSession(_admin: AdminProfile | null, _tokens: null) {}
