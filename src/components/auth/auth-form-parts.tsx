"use client";

import { LoaderCircle } from "lucide-react";
import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";

import type { AuthActionState } from "@/lib/auth/types";

export const inputClassName =
  "mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:disabled:bg-slate-800";

export const labelClassName = "block text-sm font-semibold text-slate-800 dark:text-slate-200";

export function FieldError({ id, errors }: { id: string; errors?: string[] }) {
  if (!errors?.length) return null;

  return (
    <p className="mt-2 text-sm text-red-700 dark:text-red-300" id={id}>
      {errors[0]}
    </p>
  );
}

export function AuthFormMessage({ state }: { state: AuthActionState }) {
  if (state.status === "idle" || !state.message) return null;

  const isError = state.status === "error";
  return (
    <div
      className={`mb-5 rounded-xl border px-4 py-3 text-sm leading-6 ${
        isError
          ? "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200"
          : "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200"
      }`}
      role={isError ? "alert" : "status"}
    >
      {state.message}
    </div>
  );
}

export function SubmitButton({
  children,
  pendingLabel,
  disabled = false,
}: {
  children: ReactNode;
  pendingLabel: string;
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      className="button-primary w-full justify-center disabled:cursor-not-allowed disabled:opacity-60 disabled:transform-none"
      disabled={disabled || pending}
      type="submit"
    >
      {pending ? (
        <>
          <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
          {pendingLabel}
        </>
      ) : (
        children
      )}
    </button>
  );
}
