import { redirect } from "next/navigation";

import { sanitizeRedirectPath } from "@/lib/auth/redirects";

type LegacySignInPageProps = {
  searchParams: Promise<{ next?: string | string[] }>;
};

export default async function LegacySignInPage({ searchParams }: LegacySignInPageProps) {
  const query = await searchParams;
  const rawNext = Array.isArray(query.next) ? query.next[0] : query.next;
  const nextPath = sanitizeRedirectPath(rawNext);
  redirect(`/login?next=${encodeURIComponent(nextPath)}`);
}
