"use client";

import { useActionState } from "react";

import { updatePasswordAction } from "@/app/auth/actions";
import { initialAuthActionState } from "@/lib/auth/types";

import {
  AuthFormMessage,
  FieldError,
  inputClassName,
  labelClassName,
  SubmitButton,
} from "./auth-form-parts";

export function UpdatePasswordForm({ configured }: { configured: boolean }) {
  const [state, formAction] = useActionState(updatePasswordAction, initialAuthActionState);

  return (
    <form action={formAction} noValidate>
      <AuthFormMessage state={state} />

      <fieldset className="space-y-5" disabled={!configured}>
        <div>
          <label className={labelClassName} htmlFor="new-password">
            New password
          </label>
          <input
            aria-describedby={state.fieldErrors?.password ? "new-password-error" : "new-password-hint"}
            aria-invalid={Boolean(state.fieldErrors?.password)}
            autoComplete="new-password"
            className={inputClassName}
            id="new-password"
            maxLength={128}
            minLength={8}
            name="password"
            required
            type="password"
          />
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400" id="new-password-hint">
            Use at least 8 characters.
          </p>
          <FieldError errors={state.fieldErrors?.password} id="new-password-error" />
        </div>

        <div>
          <label className={labelClassName} htmlFor="confirm-new-password">
            Confirm new password
          </label>
          <input
            aria-describedby={state.fieldErrors?.confirmPassword ? "confirm-new-password-error" : undefined}
            aria-invalid={Boolean(state.fieldErrors?.confirmPassword)}
            autoComplete="new-password"
            className={inputClassName}
            id="confirm-new-password"
            maxLength={128}
            name="confirmPassword"
            required
            type="password"
          />
          <FieldError errors={state.fieldErrors?.confirmPassword} id="confirm-new-password-error" />
        </div>

        <SubmitButton disabled={!configured} pendingLabel="Updating password…">
          Update Password
        </SubmitButton>
      </fieldset>
    </form>
  );
}
