"use client";

import { useActionState } from "react";

import { signInAction } from "@/app/auth/actions";
import { initialAuthActionState } from "@/lib/auth/types";

import {
  AuthFormMessage,
  FieldError,
  inputClassName,
  labelClassName,
  SubmitButton,
} from "./auth-form-parts";

export function LoginForm({ configured, nextPath }: { configured: boolean; nextPath: string }) {
  const [state, formAction] = useActionState(signInAction, initialAuthActionState);
  const emailErrors = state.fieldErrors?.email;
  const passwordErrors = state.fieldErrors?.password;

  return (
    <form action={formAction} noValidate>
      <input name="next" type="hidden" value={nextPath} />
      <AuthFormMessage state={state} />

      <fieldset className="space-y-5" disabled={!configured}>
        <div>
          <label className={labelClassName} htmlFor="login-email">
            Email
          </label>
          <input
            aria-describedby={emailErrors ? "login-email-error" : undefined}
            aria-invalid={Boolean(emailErrors)}
            autoComplete="email"
            className={inputClassName}
            id="login-email"
            inputMode="email"
            name="email"
            placeholder="you@example.com"
            required
            type="email"
          />
          <FieldError errors={emailErrors} id="login-email-error" />
        </div>

        <div>
          <label className={labelClassName} htmlFor="login-password">
            Password
          </label>
          <input
            aria-describedby={passwordErrors ? "login-password-error" : undefined}
            aria-invalid={Boolean(passwordErrors)}
            autoComplete="current-password"
            className={inputClassName}
            id="login-password"
            name="password"
            required
            type="password"
          />
          <FieldError errors={passwordErrors} id="login-password-error" />
        </div>

        <SubmitButton disabled={!configured} pendingLabel="Signing in…">
          Sign In
        </SubmitButton>
      </fieldset>
    </form>
  );
}
