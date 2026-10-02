# Implementation Plan — X-Style Redesign with the HackTheBox Palette

**Scope:** full web app (`web/`), phased.
**Design references:** X (Twitter) for layout, interaction patterns and component anatomy; HackTheBox for color.
**Non-goals:** new backend endpoints, like/repost features, search/trends.

---

## 1. Design language

### 1.1 Color tokens (Tailwind v4 `@theme` in `web/src/app/globals.css`)

**Shipped.** The token layer and both schemes are in `globals.css`; what is left
for the phases below is chrome and anatomy, not color. Each token is one
`light-dark(light, dark)` pair, so the scheme is a `color-scheme` switch driven
by `data-theme` on `<html>` (rendered from the `saf_theme` cookie by the root
layout) and there is never a second copy of a color rule to keep in sync.

```css
@theme {
  /* canvas + surfaces */
  --color-canvas: light-dark(#f6f6f7, #0d0d0d);  /* page background */
  --color-surface: light-dark(#ffffff, #141414); /* cards, panels, header backdrop */
  --color-surface-2: light-dark(#f0f0f1, #1a1a1a); /* inputs, code, hover fills */

  /* 1px borders */
  --color-line: light-dark(#e4e4e7, #2a2a2a);
  --color-line-strong: light-dark(#d4d4d8, #3d3d3d); /* hover */

  /* ink */
  --color-ink: light-dark(#0d0d0d, #ffffff);   /* headings, primary text */
  --color-ink-2: light-dark(#3f3f46, #a8a8a8); /* body text */
  --color-ink-3: light-dark(#52525b, #909090); /* secondary, timestamps */
  --color-ink-4: light-dark(#6b6b73, #808080); /* faint, placeholders */

  /* brand — HackTheBox lime replaces X blue (#1d9bf0) */
  --color-accent: light-dark(#4d7c0f, #9fef00);      /* links, hover text, focus */
  --color-accent-2: light-dark(#b6ff2e, #b6ff2e);    /* hover fill */
  --color-accent-solid: light-dark(#9fef00, #9fef00); /* button fill, both schemes */
  --color-accent-ink: light-dark(#0d0d0d, #0d0d0d); /* black text on lime — the HTB signature */

  /* status semantics (see 1.3) */
  --color-danger: light-dark(#c81e1e, #ff6b6b);
  --color-warning: light-dark(#b45309, #f0b429); /* project: building */
  --color-success: light-dark(#047857, #4ade80); /* project: launched */
  --color-paused: light-dark(#c2410c, #fb923c);   /* project: paused */
}
```

Rules:

- Tokens are named `accent`, **not** `lime`, to avoid colliding with Tailwind's built-in
  `lime-*` scale.
- Lime is very high luminance: **accents only, never body text, never large fills.**
  Filled accent buttons always use `bg-accent-solid text-accent-ink`.
- **A lime fill and lime ink are different tokens.** `#9fef00` reads on a dark canvas
  and is invisible on white, so `accent` (ink: links, hover text, focus) and
  `accent-solid` (fill: buttons) are separate, with `accent-2` for the fill hover.
  Never set `hover:text-accent-2` — lime text is unreadable on a light canvas; accent
  links underline on hover instead.
- Every ink and status pair clears WCAG AA (≥ 4.5:1) against **both** the canvas and
  the surface color of its scheme; re-check this whenever a value changes.
- Borders are flat 1px `border-line` everywhere. No glassmorphism, no colored glows —
  X is flat and HTB is flat.

### 1.2 Typography & shape

- Keep the system font stack for now (X's "Chirp" is proprietary; Inter via
  `next/font` is an optional later polish — no new dependency in this plan).
- Body/post text `text-[15px]` (X's size), timestamps `text-[13px] text-ink-3`.
- Radius vocabulary: **pills** (`rounded-full`) for buttons/badges/chips (X hallmark),
  `rounded-2xl` for media and right-rail widgets, `rounded-xl` for form fields.
- Elevation is expressed only through `surface` + 1px `line`, never shadows
  (except popovers/menus).

### 1.3 Post action semantics (reply-focused)

Per decision: only actions that work today ship.

| Action | Behavior | Color |
|---|---|---|
| Reply | count = `reply_count`, links to `/p/{id}` | hover: accent (lime), bg tint `accent/15` |
| Share | Web Share API → clipboard fallback, no API needed | hover: accent (X also uses brand color for share) |
| Repost / Like | **deferred** until reactions endpoints exist | — |

X's green repost (`#00ba7c`) would fight the lime brand; when likes/reposts are added,
repost should be re-picked (candidate: keep `#00ba7c` and verify visually, fallback
blue) and land as its own `light-dark()` pair — `--color-repost`, `--color-like` are
not declared until those actions exist. Same for `--color-raise`: add it when the
first popover or menu is built.

### 1.4 Icons

`web/src/components/icons.tsx` exists with inline SVGs (currently sun, moon,
monitor for the scheme control). Add to it rather than reaching for a library:
home, profile, settings, compose, reply, share, more, media, logo mark, chevrons.
Zero dependency, tree-shaken by construction. (`lucide-react` is the fallback if the set
grows.)

### 1.5 Colour scheme

**Shipped**, and every later phase must keep working in both schemes.

- `saf_theme` cookie (`system` | `light` | `dark`, default `system`) is the single
  source of truth; `lib/theme.ts` reads it, `app/actions.ts#setTheme` writes it.
- The root layout renders `<html data-theme={theme}>`, and `globals.css` maps that to
  `color-scheme: light` / `dark`. Because every token is a `light-dark()` pair, adding
  a component that uses tokens is automatically correct in both schemes — there is no
  `dark:` variant to write and nothing to forget.
- Cookie, not local storage, so the server paints the right scheme on the first
  response and the choice survives a reload with JavaScript off. Never set
  `data-theme` from client JavaScript: it would fight the server and flash.
- Controls: `ThemeToggle` renders a compact cycling button in the header (any visitor)
  and the three options side by side in `/settings` (`variant="segmented"`). The
  compact button shows the *current* scheme and names the next one in its label.

---

## 2. Layout spec (the X structure)

```
lg (1024)              xl (1280)                   2xl (1536)
┌────┬──────────┐   ┌────┬──────────┬────────┐   ┌──────────┬──────────┬────────┐
│rail│ timeline │   │rail│ timeline │  right │   │ rail     │ timeline │  right │
│88px│  600px   │   │88px│  600px   │  350px │   │ 264px    │  600px   │  350px │
└────┴──────────┘   └────┴──────────┴────────┘   └──────────┴──────────┴────────┘
```

- **`<lg` (mobile):** single column, keep the sticky top bar (restyled), max-w-2xl
  content. Bottom tab bar is optional polish, not in scope.
- **Left rail:** logo, Home, Profile, Settings, big pill **Post** button, account block
  (avatar + display name + handle + logout) pinned at the bottom — X's account switcher
  position. Items with no backend (Explore/search, Notifications) are **omitted, not
  faked**.
- **Center timeline:** `w-full max-w-[600px]`, sticky page header (`h-[53px]`, `bg-canvas/85
  backdrop-blur`, border-b) with the page title; posts are a divider list, not cards.
- **Right rail (`≥xl`):** sticky `w-[350px]`, hidden below xl.
- **Footer** under the current layout is removed (X has no page footer in the app shell).

### 2.1 Right rail content (derived from the existing API only)

No search/trends/follow endpoints exist, so the rail ships honest, data-backed widgets:

1. **"Founders to follow"** — distinct authors from `GET /feed` (excluding the signed-in
   account), avatar + display name + `@handle`, each row links to `/{username}`.
   No follow button (no follow API).
2. **"Featured projects"** — project publishers present in the feed
   (`publisher_kind === "project"`), logo + name + one-line description, links to
   `/{username}/{project}`.
3. **Footer** — small muted static links (About · README · Health) + © line.

Data plumbing: a `web/src/lib/rail.ts` helper wrapped in React `cache()` that calls
`GET /feed` once per request and is shared by the rail widget (layouts do not refetch on
client navigation, so this costs one extra upstream call per full page load, deduped with
the feed page's own fetch on `/`).

### 2.2 Route structure

Introduce route groups so auth pages get a minimal centered layout while everything else
gets the shell (URLs do not change):

```
web/src/app/
├── layout.tsx              → <html>/<body>, globals.css only
├── (auth)/
│   ├── login/page.tsx
│   └── signup/page.tsx
└── (main)/
    ├── layout.tsx          → AppShell: LeftRail + children + RightRail
    ├── page.tsx            feed
    ├── compose/page.tsx
    ├── settings/page.tsx
    ├── p/[id]/page.tsx
    ├── [username]/page.tsx
    └── [username]/[project]/page.tsx
```

---

## 3. Screen-by-screen changes

### Feed (`(main)/page.tsx`, `PostCard.tsx`)
- Remove the `h1 "Feed"` row; center header shows **Home**.
- Inline collapsed composer at the top of the timeline: avatar + "What is happening?!"
  placeholder → routes to `/compose` (existing composer reused, no new client state
  machine).
- `PostCard` becomes an X post row: transparent background, `px-4 py-3`,
  `border-b border-line`, hover `bg-surface-2/60`. Anatomy:
  avatar(40) → header line `Name [badge] @handle · 2h` → body → media (`rounded-2xl
  border border-line`) → action row (Reply, Share).
- Pagination: X-style centered pill button ("Load more" → keep, restyled
  `rounded-full border border-line hover:bg-surface-2`).

### Composer (`PostComposer.tsx`, `compose/page.tsx`)
- X anatomy: avatar left, borderless textarea ("What is happening?!"), bottom toolbar
  (Attach as icon buttons) + right-aligned **Post** pill (`bg-accent text-accent-ink`).
- Keep the "Post as" user/project selector — it is the product's differentiator; render
  it as a labeled pill select under the toolbar.
- Error alert uses `text-danger`.

### Thread detail (`p/[id]/page.tsx`, `ThreadTree.tsx`)
- X conversation view: sticky "Thread" header with back arrow; root post rendered full
  width (larger text, no card); replies below as divider-separated rows; keep the tree
  indent (`border-l border-line`) because our model is nested, but drop the card chrome
  per node.
- Reply composer fixed at the bottom of the thread column (existing `PostComposer
  replyTo`), restyled compact.

### Profiles (`[username]/page.tsx`, `[username]/[project]/page.tsx`)
- X profile anatomy: banner block (placeholder: `surface-2` + subtle lime scanline/gradient),
  avatar overlapping the banner (`-mt-10`, ring `ring-canvas`), display name + badge,
  `@handle`, bio, meta row (user: projects showcase link; project: category/status
  chips + website as a `rounded-full` outline button), stats row (`N posts · N projects` —
  no follower counts, no API), tab bar (Posts / Projects / Replies) with lime underline,
  then the divider post list.
- `ProjectCard` restyled to the same language (surface, 1px line, lime hover title).

### Auth (`login`, `signup`) and `settings`
- Centered `max-w-sm` card on `canvas`: wordmark, `rounded-xl` fields (shared field
  class — the duplicated `INPUT` const in login/signup/SettingsForm collapses into one
  `Field` component), full-width pill submit in `bg-accent text-accent-ink`.
- Settings: X-style section headers (`text-xl font-bold` + `border-b`), restyled fields,
  lime Save pill.

### Shared components
- `Nav.tsx` → replaced by `LeftRail` + mobile `TopBar` (both fed by the existing
  server-side session read; `SessionKeeper` moves into the account block).
- `PublisherBadge` → X's verified-badge role: small tinted pill (`bg-accent/15
  text-accent`) for projects, neutral for users.
- `MarkdownBody` → links `text-accent`, blockquote `border-l-2 border-accent/40`,
  inline code on `surface-2` with `text-accent`…, `pre` on `surface` with `border-line`.
- `EmptyState` → `surface` + `border-line`, accent CTA.
- `not-found.tsx` → HTB-flavored 404 (mono eyebrow in accent, pill CTA).

---

## 4. Phases

Each phase ends green: `make check` (API + web lint/typecheck/tests) passes, and a manual
browser pass over the touched screens.

### Phase 0 — Tokens & primitives (foundation)

**1–4 are done** (tokens, icons, the palette swap, and both schemes). What remains is
the shared primitives, which the phases below keep needing:

1. ~~Rewrite `globals.css`: `@theme` tokens (1.1), body/selection updates, keep the
   markdown code override.~~ Done, plus the light scheme (1.5).
2. ~~Add `components/icons.tsx` (inline SVG set).~~ Done (sun, moon, monitor).
3. Open: shared primitives `Button` (primary/secondary/ghost, pill), `IconButton`,
   `Field` (input/textarea/select styles), restyle `Avatar`, `PublisherBadge`,
   `EmptyState`. The duplicated `FIELD_CLASSES` const in `login`/`signup`/
   `SettingsForm` collapses into `Field` here.
4. ~~Mechanical swap of `sky-*` → tokens in the 12 files that use it.~~ Done for the
   whole app, zinc/white/black included — grep is clean.
- **Acceptance:** done — grep shows zero palette utilities in `web/src`; `make check`
  and `pnpm build` are green; the app was reviewed in both schemes.
- **Acceptance (remaining):** primitives render identically to today's markup, in both
  schemes.

### Phase 1 — App shell
1. Create route groups `(auth)` / `(main)` (plain `git mv`, no URL changes).
2. `(main)/layout.tsx`: `AppShell` with `LeftRail` (server component, session read moved
   from `Nav`), `RightRail`, responsive breakpoints (2.0).
3. `lib/rail.ts` (`cache()`-wrapped feed fetch) + rail widgets (2.1).
4. Delete `Nav` header/footer from the root layout; mobile `TopBar`.
- **Acceptance:** 3 columns at xl, icon rail at lg, single column with top bar on
   mobile; all nav targets resolve; auth pages render without rails; `make check` green.

### Phase 2 — Feed & post row
1. Center sticky header ("Home"), inline composer trigger.
2. `PostCard` → X post row + action row (Reply, Share per 1.3) with count formatting.
3. Divider list + restyled pagination.
- **Acceptance:** feed reads as an X timeline in lime; reply links and share
  (clipboard) work; empty/error states intact.

### Phase 3 — Composer
1. Rebuild `PostComposer` per X anatomy; keep upload + "Post as" behavior unchanged.
2. Restyle `/compose` page inside the shell.
- **Acceptance:** publishing a post/reply with and without media still works end-to-end
  (manual smoke against seeded accounts).

### Phase 4 — Thread detail
1. `p/[id]` conversation layout (back header, root hero post, divider replies,
   sticky reply box).
2. `ThreadTree` restyle (indent line instead of cards).
- **Acceptance:** nested replies render correctly; replying refreshes the thread.

### Phase 5 — Profiles
1. User profile: banner, avatar overlap, stats, tabs, post list.
2. Project profile: same shell + logo/status/website chips; `ProjectCard` restyle.
- **Acceptance:** both seeded profiles (`@HanzoDev`, `@HanzoDev/SonarAI`) match the
  spec; tab links hit existing endpoints only.

### Phase 6 — Auth, settings, system pages
1. `login` / `signup` centered card layouts + shared `Field`.
2. `settings` sections + Save.
3. `not-found`, `EmptyState` audit.
- **Acceptance:** signup → login → session round-trip works; no layout shift regressions.

### Phase 7 — Visual QA & hardening
1. Contrast audit: every ink/status pair at ≥ 4.5:1 against **both** canvas and surface
   in **both** schemes (1.1), plus lime focus rings (`focus-visible:ring-2 ring-accent`)
   on every interactive element.
2. Hover/active states sweep (X's per-action color tints).
3. Responsive sweep at 375 / 768 / 1024 / 1280 / 1536.
4. `make check` + browser walkthrough of every route (feed, compose, thread, both
   profiles, settings, auth, 404) on the seeded accounts, **in both schemes** (the
   palette swap and every later phase now changes two schemes, not one).

**Sizing (relative):** P0: M · P1: L · P2: M · P3: S · P4: M · P5: M · P6: S · P7: S.

---

## 5. Risks & open decisions

- **Lime overuse** kills the HTB look (it becomes "a green site"). Budget: accent ≤ ~5%
  of pixels — buttons, links, badges, focus, one underline.
- **Repost green vs. brand lime** when likes/reposts land later — re-decide with a
  visual test (1.3).
- **Right-rail feed dependency:** the rail fetches `/feed`; if the feed is empty the
  widgets render their own `EmptyState`, never broken skeletons.
- **Lime on a light canvas:** the one color that cannot serve both schemes as ink. Any
  new component that tints lime text on a light surface fails; `accent-solid` exists so
  lime stays a fill and `accent` stays an ink (1.1).
- **Two schemes, one audit:** the phases below restyle existing markup, and each restyle
  is now a change in two palettes. Review new color work in both schemes, not just the
  dark one (1.5).
- **Route-group move** touches many imports in one commit — do it as its own
  commit/PR inside Phase 1 so a revert is trivial.
