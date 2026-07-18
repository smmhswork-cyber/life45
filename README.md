# Life45

> A personal management app for the things that matter. Tasks · Habits · Goals · Journal · Calendar — in one calm, local-first workspace.

Life45 is a Next.js 15 + TypeScript + Tailwind CSS v4 web app. All data lives in the browser's `localStorage` — nothing leaves the device.

---

## Getting started

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev

# Type-check the project
npm run typecheck

# Build for production
npm run build
```

Then open <http://localhost:3000>.

---

## Project structure

```
lifeOS/
├── app/                  # Next.js App Router
│   ├── layout.tsx        # Root layout + sidebar nav
│   ├── page.tsx          # Dashboard
│   ├── globals.css       # Design tokens (Tailwind v4 @theme)
│   ├── tasks/            # Tasks module
│   ├── habits/           # Habits module
│   ├── goals/            # Goals module
│   ├── journal/          # Journal module
│   └── calendar/         # Calendar module
├── components/
│   ├── ui/               # Button, Card, Input, Textarea, Badge
│   ├── nav-sidebar.tsx   # Permanent left sidebar
│   ├── mobile-nav.tsx    # Sticky scrollable nav for small screens
│   ├── module-header.tsx # Shared page header
│   └── empty-state.tsx   # Friendly "coming soon" block
├── hooks/
│   └── use-local-storage.ts # SSR-safe persisted state
└── lib/
    ├── types.ts          # Domain types + MODULE_META registry
    ├── storage.ts        # SSR-safe localStorage wrapper
    └── utils.ts          # cn, formatDate, todayKey, id
```

---

## Design system

- **Tailwind v4** with custom `oklch` design tokens defined in `app/globals.css` under the `@theme` block.
- Light + dark mode both honored via `@media (prefers-color-scheme: dark)`.
- Type elements, radii, and shadows are exposed as CSS variables (`--color-primary`, `--radius-lg`, …) so they can be re-themed in one place.
- Headings and body copy use the **Geist** font family via `next/font/google`.

---

## Adding a new module

1. Add the type to `lib/types.ts` and an entry to `MODULE_META` (this registers the sidebar nav item automatically).
2. Create `app/<module>/page.tsx` and reuse `ModuleHeader` + `EmptyState`.
3. Persist with the `useLocalStorage` hook against `MODULE_META.<id>.storageKey`.

That's it — no routing config, no nav edits, no theme tokens to wire up.

---

## Roadmap

- [ ] Wire up add/edit/delete forms for each module
- [ ] Drag-to-reorder on Tasks
- [ ] Habit streak heatmap
- [ ] Goal progress widgets on the dashboard
- [ ] Markdown for journal entries
- [ ] ICS export for calendar
- [ ] Encrypted cloud sync (optional, opt-in)
