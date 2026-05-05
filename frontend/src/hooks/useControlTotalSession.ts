'use client';

import { useSession } from 'next-auth/react';
import type { ControlTotalSession } from '@/types/api';

/**
 * Type-safe hook for accessing the ControlTotal session.
 * Replaces `(session as any)?.tenantId` pattern across the app.
 */
export function useControlTotalSession() {
  const { data: session, status } = useSession();
  const ctSession = session as ControlTotalSession | null;

  return {
    session: ctSession,
    status,
    tenantId: ctSession?.tenantId || '',
    role: ctSession?.role || null,
    user: ctSession?.user || null,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
  };
}
