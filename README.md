# Life45

A calm, local-first personal management app for the things that matter. **Life45** keeps tasks, habits, goals, journaling, calendar, and tagged assignments in your browser — no server, no account required. Optionally sign in with Google to put your name and avatar in the sidebar.

## Features

| Module         | What it does                                                              |
| -------------- | ------------------------------------------------------------------------- |
| **Tasks**      | Capture, prioritize, edit inline, and complete what matters.             |
| **Habits**     | Up to 20 habits in a week / month / year grid, with a SVG progress chart. |
| **Goals**      | Long-form objectives with milestones and a target date.                   |
| **Journal**    | One daily reflection, kept close.                                         |
| **Calendar**   | Events, reminders, and time-boxed commitments.                            |
| **Assignments** | Schoolwork or tasks, tagged by class period; filter and sort by tag.    |
| **Settings**   | Manage your habit list, class period tags, and Google account.            |

The **dashboard** shows today’s habit progress and your current streak at a
glance, so you can see momentum without leaving the home page.

All data lives in `localStorage` under namespaced keys (`life45:*:v1`). Clearing
site data erases everything; nothing is sent to a server.

## Run locally

```bash
npm install
cp .env.example .env.local   # optional: only needed for real Google Sign-In
npm run dev                  # http://localhost:3000
npm run build                # production build
npm run typecheck            # tsc --noEmit
```

## Google Sign-In (optional)

The Settings page exposes a **Sign in with Google** button. This is **display-only** — your data never leaves the browser. The OAuth flow is provided by `@react-oauth/google` and runs entirely client-side; Life45 never sees or stores an OAuth token.

### One-time setup (~3 minutes)

1. **Open Google Cloud Console** → create or pick a project for Life45.
2. **Configure the OAuth consent screen:** User type External (or Internal for Google Workspace). Add an app name, support email, and developer contact. Scopes are the defaults: `openid`, `profile`, `email`.
3. **Create credentials → OAuth client ID → Application type: Web application.**
4. **Authorized JavaScript origins:**
   - `http://localhost:3000` for dev
   - your production origin when you deploy (e.g. `https://life45.app`)
5. **Drop the client ID into `.env.local`:**

   ```bash
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   ```

6. Restart `npm run dev`. The sign-in button now authenticates; the sidebar and dashboard will show your name and avatar until you sign out.

If `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is unset, the button still renders with a "dev-only" badge and a link back to these steps — the rest of the app works fine. See `.env.example` for the full template.

## Project layout

```
app/                          # Next.js App Router routes
  layout.tsx                  # Root: GoogleAuthProvider + shell chrome
  page.tsx                    # Dashboard with habit streak widget
  tasks/                      # Tasks CRUD (workspace + form)
  habits/                     # Grid + view switcher + SVG completion chart
  goals/ journal/ calendar/   # Module routes
  assignments/                # Tagged-assignment workflow
  settings/                   # Habits editor, periods editor, account
  _components/                # Cross-route widgets (e.g. habit streak)
components/                   # Shared UI (sidebar, mobile nav, ui primitives)
  auth/                       # Google OAuth provider wrapper + sign-in/menu UI
hooks/
  use-google-identity.ts      # OAuth + identity persistence
  use-local-storage.ts        # SSR-safe persisted state (with isHydrated)
lib/                          # Types, storage, utils, date/streak math, palette
.env.example                  # Template for NEXT_PUBLIC_GOOGLE_CLIENT_ID
```

## Tech

- **Next.js 15** (App Router) + **React 19**
- **TypeScript** strict
- **Tailwind v4** (`@theme` tokens in `app/globals.css`)
- **Local-first** data via `localStorage` (no database, no API)

## Conventions

- Local-first: every persisted shape is plain JSON. No `Date` objects, no `Map`s.
- UI primitives live in `components/ui/`. Route-specific components go in `app/<route>/_components/`.
- Storage keys are centralized in `lib/types.ts` under `MODULE_META` and `STORAGE_KEYS`.
