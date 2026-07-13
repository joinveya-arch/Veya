import type { ApiResponse } from "@/types";
import { IS_MOCK, MockError, mockRequest } from "./mock/adapter";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";

const TOKEN_KEY = "veya.token";

export const tokenStore = {
  get(): string | null {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(TOKEN_KEY);
  },
  set(token: string) {
    window.localStorage.setItem(TOKEN_KEY, token);
  },
  clear() {
    window.localStorage.removeItem(TOKEN_KEY);
  },
};

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  /** Skip the JSON content-type so the browser can set a multipart boundary. */
  isFormData?: boolean;
}

/**
 * Thin fetch wrapper. Unwraps the API's `{ success, data }` envelope so
 * callers work with the payload directly, and normalises every failure
 * into an ApiError carrying the server's message.
 */
export async function apiFetch<T>(
  path: string,
  { body, isFormData, headers, ...init }: RequestOptions = {},
): Promise<T> {
  const token = tokenStore.get();

  // Static demo build (GitHub Pages): there is no server to call, so requests
  // are served from an in-memory dataset. Interception happens here, at the
  // transport, so every service/hook/component above is unchanged.
  if (IS_MOCK) {
    try {
      return await mockRequest<T>({
        path,
        method: init.method ?? "GET",
        // File uploads can't round-trip through the demo store.
        body: isFormData ? undefined : body,
        token,
      });
    } catch (error) {
      if (error instanceof MockError) {
        throw new ApiError(error.message, error.status);
      }
      throw error;
    }
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: isFormData ? (body as FormData) : body ? JSON.stringify(body) : undefined,
  });

  let payload: ApiResponse<T> | undefined;
  try {
    payload = (await res.json()) as ApiResponse<T>;
  } catch {
    // Non-JSON response (proxy error, 502, empty body).
  }

  if (!res.ok || payload?.success === false) {
    throw new ApiError(
      payload?.message ?? `Request failed (${res.status})`,
      res.status,
    );
  }

  return payload!.data;
}

export const api = {
  get: <T>(path: string, init?: RequestOptions) =>
    apiFetch<T>(path, { ...init, method: "GET" }),
  post: <T>(path: string, body?: unknown, init?: RequestOptions) =>
    apiFetch<T>(path, { ...init, method: "POST", body }),
  put: <T>(path: string, body?: unknown) =>
    apiFetch<T>(path, { method: "PUT", body }),
  patch: <T>(path: string, body?: unknown) =>
    apiFetch<T>(path, { method: "PATCH", body }),
  delete: <T>(path: string, body?: unknown) =>
    apiFetch<T>(path, { method: "DELETE", body }),
  upload: <T>(path: string, form: FormData) =>
    apiFetch<T>(path, { method: "POST", body: form, isFormData: true }),
};

/** Query string builder that drops empty/undefined params. */
export function qs(params: Record<string, unknown>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    search.set(key, String(value));
  }
  const str = search.toString();
  return str ? `?${str}` : "";
}
