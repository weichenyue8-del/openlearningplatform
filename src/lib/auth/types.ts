export type AuthFieldName =
  | "displayName"
  | "email"
  | "password"
  | "confirmPassword";

export type AuthActionState = {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Partial<Record<AuthFieldName, string[]>>;
};

export const initialAuthActionState: AuthActionState = { status: "idle" };
