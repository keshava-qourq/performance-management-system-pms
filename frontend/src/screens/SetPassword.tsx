import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import { UnmetRules, useAcceptToken, useTokenCheck } from "@/lib/account";
import { ApiError } from "@/lib/api";
import { brand } from "@/lib/brand";
import { Button, Input, Label } from "@/lib/ui";

const HAIRLINE = "1px solid rgba(255,255,255,0.10)";
const field = {
  border: HAIRLINE,
  borderRadius: brand.radius,
  height: 46,
  backgroundColor: "rgba(0,0,0,0.25)",
  color: brand.primaryColor,
};
const label = { color: brand.neutralColor, letterSpacing: "0.18em" };
const muted = { color: brand.neutralColor };
const warn = { color: "#e8a29a" };

interface Values {
  password: string;
  confirm: string;
}

function Frame({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="flex min-h-screen items-center justify-center px-6"
      style={{ color: brand.primaryColor, fontFamily: brand.fontBody }}
    >
      <main
        className="w-full max-w-md p-10"
        style={{
          backgroundColor: "rgba(255,255,255,0.04)",
          border: HAIRLINE,
          borderRadius: brand.radius,
        }}
      >
        <h1 className="text-2xl" style={{ fontFamily: brand.fontHeading }}>
          {title}
        </h1>
        <div
          aria-hidden
          className="mt-3 h-px w-12"
          style={{ backgroundColor: brand.accentColor }}
        />
        {children}
      </main>
    </div>
  );
}

/**
 * The unauthenticated screen behind an invitation or password-reset link. The
 * link is checked before anything is asked for: an expired, revoked or
 * already-used one shows only an explanation, never a password form (AC-020).
 * The password is held in the form and nowhere else.
 */
export default function SetPassword() {
  const params = useParams();
  const [search] = useSearchParams();
  const token = params.token ?? search.get("token") ?? undefined;
  const navigate = useNavigate();
  const check = useTokenCheck(token);
  const accept = useAcceptToken(token);
  const [serverRules, setServerRules] = useState<string[]>([]);
  const [formError, setFormError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ defaultValues: { password: "", confirm: "" } });

  if (!token || (!check.isLoading && (check.isError || check.data?.valid === false)))
    return (
      <Frame title="This link is no longer valid">
        <p className="mt-4 text-sm" style={muted}>
          Invitation and password-reset links can only be used once, and they expire. This one has
          already been used, has expired or has been replaced by a newer link, so no account was
          created or changed.
        </p>
        <p className="mt-3 text-sm" style={muted}>
          Contact your HR Admin and ask them to issue you a new link.
        </p>
      </Frame>
    );

  if (check.isLoading || !check.data)
    return (
      <Frame title="Checking your link">
        <p role="status" className="mt-4 text-sm" style={muted}>
          {"Checking this link…"}
        </p>
      </Frame>
    );

  const isReset = (check.data.purpose ?? "").toLowerCase().includes("reset");
  const rules = check.data.password_rules ?? [];

  const submit = handleSubmit(async (values) => {
    setFormError("");
    setServerRules([]);
    if (values.password !== values.confirm) {
      setFormError("The two passwords do not match.");
      return;
    }
    try {
      await accept.mutateAsync(values.password);
      navigate("/my-performance", { replace: true });
    } catch (error) {
      if (error instanceof UnmetRules) setServerRules(error.rules);
      else if (error instanceof ApiError && error.status === 410)
        setFormError(
          "This link is no longer valid. Contact your HR Admin and ask them to issue a new one.",
        );
      else
        setFormError(
          error instanceof ApiError && error.message
            ? error.message
            : "Your password could not be set. Try again.",
        );
    }
  });

  return (
    <Frame title={isReset ? "Set a new password" : "Set your password"}>
      <p className="mt-3 text-xs uppercase" style={label}>
        {isReset ? "Password reset" : "Invitation"}
      </p>
      <p className="mt-4 text-sm" style={muted}>
        {isReset
          ? "Choose a new password. This link works only once."
          : "Choose a password to finish setting up your account. This link works only once."}
      </p>
      <form className="mt-6 space-y-5" onSubmit={submit} noValidate>
        <div className="space-y-2">
          <Label htmlFor="password" className="block text-xs uppercase" style={label}>
            New password
          </Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            style={field}
            aria-describedby={serverRules.length ? "password-rules" : "password-hints"}
            aria-invalid={serverRules.length ? true : undefined}
            {...register("password", { required: "Enter a password." })}
          />
          {errors.password?.message && (
            <p role="alert" className="text-xs" style={warn}>
              {errors.password.message}
            </p>
          )}
          {serverRules.length > 0 ? (
            <div id="password-rules" role="alert">
              <p className="text-xs" style={warn}>
                That password was not accepted. It still needs to meet:
              </p>
              <ul className="mt-1 list-disc pl-5 text-xs" style={warn}>
                {serverRules.map((rule) => (
                  <li key={rule}>{rule}</li>
                ))}
              </ul>
            </div>
          ) : (
            rules.length > 0 && (
              <ul id="password-hints" className="list-disc pl-5 text-xs" style={muted}>
                {rules.map((rule) => (
                  <li key={rule}>{rule}</li>
                ))}
              </ul>
            )
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm" className="block text-xs uppercase" style={label}>
            Confirm password
          </Label>
          <Input
            id="confirm"
            type="password"
            autoComplete="new-password"
            style={field}
            {...register("confirm")}
          />
        </div>
        {formError && (
          <p role="alert" className="text-sm" style={warn}>
            {formError}
          </p>
        )}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full"
          style={{ backgroundColor: brand.accentColor, color: "#16211c" }}
        >
          {isSubmitting ? "Setting your password…" : "Set password and sign in"}
        </Button>
      </form>
    </Frame>
  );
}
