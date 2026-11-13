"use client";

import { useActionState } from "react";

import { requestPasswordResetAction } from "@/app/auth/actions";
import { initialAuthActionState } from "@/lib/auth/types";

import {
  AuthFormMessage,
  FieldError,
  inputClassName,
  labelClassName,
  SubmitButton,
} from "./auth-form-parts";

export function ForgotPasswordForm({ configured }: { configured: boolean }) {
  const [state, formAction] = useActionState(
    requestPasswordResetAction,
    initialAuthActionState,
  );

  return (
    <form action={formAction} noValidate>
      <AuthFormMessage state={state} />

      <fieldset className="space-y-5" disabled={!configured}>
        <div>
          <label className={labelClassName} htmlFor="recovery-email">
            Account email
          </label>
          <input
            aria-describedby={state.fieldErrors?.email ? "recovery-email-error" : undefined}
            aria-invalid={Boolean(state.fieldErrors?.email)}
            autoComplete="email"
            className={inputClassName}
            id="recovery-email"
            inputMode="email"
            name="email"
            placeholder="you@example.com"
            required
            type="email"
          />
          <FieldError errors={state.fieldErrors?.email} id="recovery-email-error" />
        </div>

        <SubmitButton disabled={!configured} pendingLabel="Sending secure link…">
          Send Reset Link
        </SubmitButton>
      </fieldset>
    </form>
  );
}
