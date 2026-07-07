import { getDeviceId } from "@/lib/device-id";

export class MailApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function parseResponse<T>(res: Response): Promise<T & { error?: string }> {
  try {
    return (await res.json()) as T & { error?: string };
  } catch {
    throw new MailApiError(res.status, "Unexpected server response.");
  }
}

async function requestMail<T>(
  path: string,
  options: RequestInit & { idToken?: string } = {},
): Promise<T> {
  const { idToken, ...fetchOptions } = options;
  let res: Response;

  try {
    res = await fetch(path, {
      ...fetchOptions,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-Device-Id": getDeviceId(),
        ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
        ...fetchOptions.headers,
      },
    });
  } catch {
    throw new MailApiError(0, "Unable to reach the mail service.");
  }

  const data = await parseResponse<T>(res);
  if (!res.ok) {
    throw new MailApiError(res.status, data.error ?? "Request failed.");
  }

  return data;
}

export async function mailSendVerification(idToken: string): Promise<{ message: string }> {
  return requestMail("/api/email/send-verification", {
    method: "POST",
    idToken,
  });
}

export async function mailSendPasswordReset(email: string): Promise<{ message: string }> {
  return requestMail("/api/email/send-password-reset", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function mailSendWelcome(
  idToken: string,
  userName: string,
): Promise<{ message: string }> {
  return requestMail("/api/email/send-welcome", {
    method: "POST",
    idToken,
    body: JSON.stringify({ userName }),
  });
}

export async function mailSendLoginOtp(
  idToken: string,
): Promise<{ message: string; resendInSeconds: number }> {
  return requestMail("/api/email/send-login-otp", {
    method: "POST",
    idToken,
  });
}

export async function mailGetLoginOtpResend(
  idToken: string,
): Promise<{ resendInSeconds: number }> {
  return requestMail("/api/email/send-login-otp", {
    method: "GET",
    idToken,
  });
}

export async function mailVerifyLoginOtp(
  idToken: string,
  code: string,
): Promise<{ message: string; verified: boolean }> {
  return requestMail("/api/email/verify-login-otp", {
    method: "POST",
    idToken,
    body: JSON.stringify({ code }),
  });
}
