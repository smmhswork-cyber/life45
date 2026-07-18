"use client";

import { ExternalLink, KeyRound, ShieldCheck } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserMenu } from "@/components/auth/user-menu";
import { useGoogleIdentity } from "@/hooks/use-google-identity";
import { isGoogleConfigured } from "@/components/auth/google-auth-provider";

export function AccountSection() {
  const { configured } = useGoogleIdentity();
  const envConfigured = isGoogleConfigured();

  const steps = [
    {
      n: "1",
      title: "Open Google Cloud Console",
      body: "Visit console.cloud.google.com and create (or pick) a project for Life45.",
    },
    {
      n: "2",
      title: "Configure the OAuth consent screen",
      body: "User type: External (or Internal for Workspace). Add app name, support email, and a developer contact. Scopes are openid, profile, email — those are the defaults.",
    },
    {
      n: "3",
      title: "Create an OAuth 2.0 Web Client ID",
      body: "Credentials → Create credentials → OAuth client ID → Application type: Web application.",
    },
    {
      n: "4",
      title: "Add authorized JavaScript origins",
      body: (
        <>
          Add <code className="font-mono text-[11px]">http://localhost:3000</code> for
          development and your production origin (e.g.{" "}
          <code className="font-mono text-[11px]">https://life45.app</code>) when you
          deploy.
        </>
      ),
    },
    {
      n: "5",
      title: "Drop the client ID into .env.local",
      body: (
        <>
          Set{" "}
          <code className="font-mono text-[11px]">
            NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-id.apps.googleusercontent.com
          </code>{" "}
          and rebuild. See <code className="font-mono text-[11px]">.env.example</code>{" "}
          for the template.
        </>
      ),
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account</CardTitle>
        <CardDescription>
          Sign in to put your name and avatar in the sidebar. This is display-only
          &mdash; no data is sent anywhere.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-muted)]/40 p-4">
          <UserMenu />
        </div>

        <div className="flex items-center gap-2 text-[11px] text-[var(--color-muted-foreground)]">
          <ShieldCheck size={12} strokeWidth={1.75} />
          <span>
            {envConfigured && configured
              ? "Real sign-in is enabled."
              : envConfigured
                ? "Configuration loaded. Click the button above to sign in."
                : "Sign-in renders in dev-only mode — wire up a client ID to authenticate."}
          </span>
        </div>

        {!envConfigured && (
          <div className="rounded-[var(--radius-md)] border border-dashed border-[var(--color-border)] p-4 space-y-4">
            <div className="flex items-start gap-2">
              <KeyRound
                size={14}
                strokeWidth={1.75}
                className="mt-0.5 text-[var(--color-primary)] shrink-0"
              />
              <div>
                <p className="text-sm font-medium">Enable real sign-in</p>
                <p className="text-[11px] text-[var(--color-muted-foreground)] mt-0.5">
                  Five small steps. Total time: about three minutes.
                </p>
              </div>
            </div>

            <ol className="space-y-3">
              {steps.map((s) => (
                <li
                  key={s.n}
                  className="grid grid-cols-[24px_1fr] gap-3 text-[12px] leading-relaxed text-[var(--color-foreground)]"
                >
                  <span className="grid place-items-center h-6 w-6 rounded-full bg-[var(--color-muted)] text-[10px] font-semibold tabular-nums text-[var(--color-muted-foreground)]">
                    {s.n}
                  </span>
                  <div>
                    <p className="font-medium">{s.title}</p>
                    <p className="text-[var(--color-muted-foreground)] mt-0.5">
                      {s.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="flex items-center justify-between pt-1">
              <a
                href="https://console.cloud.google.com/apis/credentials"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-primary)] hover:underline"
              >
                Open Google Cloud Console
                <ExternalLink size={12} strokeWidth={1.75} />
              </a>
              <span className="text-[10px] uppercase tracking-[0.18em] text-[var(--color-muted-foreground)]">
                public client id
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
