/** Same-origin mail API — routes are served by this TanStack Start app, not the external auth API. */

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
      headers: {
        "Content-Type": "application/json",
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
