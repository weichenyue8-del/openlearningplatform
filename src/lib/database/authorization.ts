import "server-only";

import { getOptionalViewer } from "@/lib/auth/session";

export async function ownsRequestedUser(userId: string) {
  const viewer = await getOptionalViewer();
  return Boolean(viewer && viewer.id === userId);
}

export const unauthorizedDataResult = {
  ok: false,
  error: "You must sign in to access this learning data.",
} as const;
