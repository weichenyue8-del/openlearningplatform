"use client";

import { useActionState } from "react";

import { signUpAction } from "@/app/auth/actions";
import { initialAuthActionState } from "@/lib/auth/types";

import {
  AuthFormMessage,
  FieldError,
  inputClassName,
  labelClassName,
  SubmitButton,
} from "./auth-form-parts";

export function SignupForm({ configured, nextPath }: { configured: boolean; nextPath: string }) {
  const [state, formAction] = useActionState(signUpAction, initialAuthActionState);

  return (
    <form action={formAction} noValidate>
      <input name="next" type="hidden" value={nextPath} />
      <AuthFormMessage state={state} />

      <fieldset className="space-y-5" disabled={!configured}>
        <div>
          <label className={labelClassName} htmlFor="signup-display-name">
            Display name
          </label>
          <input
            aria-describedby={state.fieldErrors?.displayName ? "signup-name-error" : undefined}
            aria-invalid={Boolean(state.fieldErrors?.displayName)}
            autoComplete="name"
            className={inputClassName}
            id="signup-display-name"
            maxLength={80}
            name="displayName"
            placeholder="How should we greet you?"
            required
          />
          <FieldError errors={state.fieldErrors?.displayName} id="signup-name-error" />
        </div>

        <div>
          <label className={labelClassName} htmlFor="signup-email">
            Email
          </label>
          <input
            aria-describedby={state.fieldErrors?.email ? "signup-email-error" : undefined}
            aria-invalid={Boolean(state.fieldErrors?.email)}
            autoComplete="email"
            className={inputClassName}
            id="signup-email"
            inputMode="email"
            name="email"
            placeholder="you@example.com"
            required
            type="email"
          />
          <FieldError errors={state.fieldErrors?.email} id="signup-email-error" />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={labelClassName} htmlFor="signup-password">
              Password
            </label>
            <input
              aria-describedby={state.fieldErrors?.password ? "signup-password-error" : "signup-password-hint"}
              aria-invalid={Boolean(state.fieldErrors?.password)}
              autoComplete="new-password"
              className={inputClassName}
              id="signup-password"
              maxLength={128}
              minLength={8}
              name="password"
              required
              type="password"
            />
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400" id="signup-password-hint">
              Use at least 8 characters.
            </p>
            <FieldError errors={state.fieldErrors?.password} id="signup-password-error" />
          </div>

          <div>
            <label className={labelClassName} htmlFor="signup-confirm-password">
              Confirm password
            </label>
            <input
              aria-describedby={state.fieldErrors?.confirmPassword ? "signup-confirm-error" : undefined}
              aria-invalid={Boolean(state.fieldErrors?.confirmPassword)}
              autoComplete="new-password"
              className={inputClassName}
              id="signup-confirm-password"
              maxLength={128}
              name="confirmPassword"
              required
              type="password"
            />
            <FieldError errors={state.fieldErrors?.confirmPassword} id="signup-confirm-error" />
          </div>
        </div>

        <SubmitButton disabled={!configured} pendingLabel="Creating account…">
          Get Started
        </SubmitButton>
      </fieldset>
    </form>
  );
}
