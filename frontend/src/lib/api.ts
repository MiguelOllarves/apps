/**
 * ControlTotal Frontend Configuration
 * Centralizes environment-specific values.
 */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://10.100.5.199:4000';

/**
 * Create fetch headers with tenant isolation
 */
export function apiHeaders(tenantId: string, extra?: Record<string, string>): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'x-tenant-id': tenantId,
    ...extra,
  };
}

/**
 * Typed fetch wrapper for ControlTotal API calls
 */
export async function apiFetch<T>(
  path: string,
  tenantId: string,
  options?: RequestInit,
): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        ...apiHeaders(tenantId),
        ...(options?.headers as Record<string, string>),
      },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}
