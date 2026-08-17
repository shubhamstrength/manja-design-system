# Manja Design System

A token-driven design system that ships **native components to both React and Angular** from a
single source of truth.

Nothing is duplicated that matters: colour, spacing, typography, theming behaviour and component
CSS are defined once. Only the thin binding layer — props vs. inputs, hooks vs. signals — is
written twice, so each framework gets an idiomatic API instead of a lowest-common-denominator
wrapper.

---

## Architecture

```
                    ┌──────────────────┐
                    │  @manja/tokens   │   Style Dictionary
                    │  colour, space,  │   → CSS vars, JSON, typed TS
                    │  type, motion    │
                    └────────┬─────────┘
                    ┌────────┴─────────┐
                    ▼                  ▼
        ┌──────────────────┐  ┌──────────────────┐
        │  @manja/styles   │  │   @manja/core    │
        │  reset · base ·  │  │  headless logic, │
        │  component CSS   │  │  shared types    │
        └────────┬─────────┘  └────────┬─────────┘
                 └─────────┬───────────┘
                 ▼                     ▼
     ┌──────────────────┐   ┌──────────────────┐
     │  @manja/react    │   │ @manja/angular   │
     │  React 18 / 19   │   │   Angular 22     │
     └──────────────────┘   └──────────────────┘
```

| Package          | Contains                                                      | Built with       |
| ---------------- | ------------------------------------------------------------- | ---------------- |
| `@manja/tokens`  | Token definitions → CSS custom properties, JSON, typed TS     | Style Dictionary |
| `@manja/styles`  | Cascade layers, reset, base, utilities, **all component CSS** | Lightning CSS    |
| `@manja/core`    | Theme controller, shared types, `cx()` — no framework imports | `tsc`            |
| `@manja/react`   | React components and hooks                                    | `tsc`            |
| `@manja/angular` | Angular components, directives and services                   | ng-packagr       |

### Three decisions worth knowing

**Component CSS lives in `@manja/styles`, not in the framework packages.** Both React and Angular
load the identical stylesheet, so a visual fix can never land in one framework and not the other.
The framework packages ship no CSS at all.

**Styling is driven by `data-*` attributes, not class permutations.** A component renders
`class="mj-button"` plus `data-variant`, `data-size`, `data-intent`. One CSS rule set serves both
frameworks, and Angular host bindings and React props map onto it without translation.

**Theme state has exactly one implementation.** `createThemeController()` in `@manja/core` owns
resolution, persistence, and the `prefers-color-scheme` listener. React's `ThemeProvider` and
Angular's `ManjaThemeService` are wrappers over it — roughly 40 lines each.

---

## Prerequisites

- **Node `^22.22.3 || ^24.15.0 || >=26`** — pinned in `.nvmrc` (22.23.2). Angular 22 enforces this
  floor and `ng build` refuses to start below it. Run `nvm use` in the repo root.
- **pnpm 11+**

> **Note:** on this machine pnpm was installed to `~/.local/bin`, because `corepack enable` could
> not write to `/usr/local/bin`. Add that directory to your `PATH`, or Nx will fail with
> `pnpm: command not found` when it runs package scripts:
>
> ```sh
> echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc && source ~/.zshrc
> ```
>
> Alternatively `sudo corepack enable` to install pnpm globally instead.

```sh
nvm use
pnpm install
pnpm verify        # format check + lint + typecheck + test + build
```

---

## Playgrounds

Two apps consume the packages straight from the workspace through pnpm links — nothing is
published, and they resolve the same `dist` output a real consumer would get. Both render the
identical token gallery, so you can put them side by side and confirm the two frameworks agree.

```sh
pnpm dev:react     # http://localhost:4200
pnpm dev:angular   # http://localhost:4300
```

| App                       | Stack                          | Proves                                              |
| ------------------------- | ------------------------------ | --------------------------------------------------- |
| `apps/react-playground`   | Vite 8 + React 19              | The `tsc`-built ESM packages consume cleanly        |
| `apps/angular-playground` | Angular CLI (`@angular/build`) | ng-packagr's partial-Ivy output survives the linker |

The Angular playground deliberately uses the **real Angular CLI builder** rather than the Vite
setup used for unit tests, because that is the bundler your Angular consumers will actually run.

Nx builds the packages first — `pnpm dev:react` after changing a token gives you the new value.

> **Angular: critical-CSS inlining is disabled on purpose.** Angular's `inlineCritical`
> optimisation (beasties) inlines only the selectors it sees used in the static markup and defers
> the rest with `media="print"`. It keeps `:root` but drops the `[data-mj-theme='dark']` block, so
> a dark-theme user gets exactly the flash the init script exists to prevent. Any app consuming
> Manja needs `optimization.styles.inlineCritical: false`, or an equivalent way to keep the theme
> blocks render-blocking.

---

## Using it in a React app

```tsx
import '@manja/styles'; // tokens + reset + base + component CSS
import { ThemeProvider, useTheme } from '@manja/react';

function ThemeToggle() {
  const { resolved, toggle } = useTheme();
  return (
    <button onClick={toggle}>Switch to {resolved === 'dark' ? 'light' : 'dark'}</button>
  );
}

export function App() {
  return (
    <ThemeProvider defaultPreference="system">
      <ThemeToggle />
    </ThemeProvider>
  );
}
```

## Using it in an Angular app

```ts
import '@manja/styles';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideManjaTheme } from '@manja/angular';

bootstrapApplication(AppComponent, {
  providers: [provideManjaTheme({ defaultPreference: 'system' })],
});
```

```ts
import { Component, inject } from '@angular/core';
import { ManjaThemeService } from '@manja/angular';

@Component({
  selector: 'app-theme-toggle',
  template: `<button (click)="theme.toggle()">
    Switch to {{ theme.isDark() ? 'light' : 'dark' }}
  </button>`,
})
export class ThemeToggleComponent {
  protected readonly theme = inject(ManjaThemeService);
}
```

---

## Components

### Button

```tsx
<Button variant="outline" intent="danger" size="lg">Delete</Button>
<Button iconOnly aria-label="Add"><PlusIcon /></Button>
```

```html
<button mjButton variant="outline" intent="danger" size="lg">Delete</button>
<button mjButton iconOnly aria-label="Add"><svg>…</svg></button>
```

| Prop / input | Values                                                | Default  |
| ------------ | ----------------------------------------------------- | -------- |
| `variant`    | `solid` `soft` `outline` `ghost` `link`               | `solid`  |
| `intent`     | `brand` `neutral` `danger` `warning` `success` `info` | `brand`  |
| `size`       | `xs` `sm` `md` `lg` `xl`                              | `md`     |
| `type`       | `button` `submit` `reset`                             | `button` |
| `fullWidth`  | boolean                                               | `false`  |
| `iconOnly`   | boolean                                               | `false`  |

Three behaviours worth knowing:

**`type` defaults to `button`, not `submit`.** The native default silently posts the surrounding
form; opting into submission should be deliberate.

**An icon-only button must have an accessible name.** In React that is a compile error — the props
are a union, so `<Button iconOnly>` without `aria-label` does not typecheck. Angular templates
cannot encode that, so it logs a dev-mode warning instead.

**Thirty variant/intent combinations, eleven CSS blocks.** Each intent publishes a small palette of
private custom properties and each variant decides which to paint with. Adding an intent is one
block, not five.

---

## Theming

Themes are driven by one attribute on `<html>`:

| State                   | Markup                  | Result                         |
| ----------------------- | ----------------------- | ------------------------------ |
| Follow the OS (default) | _no attribute_          | `prefers-color-scheme` decides |
| Force light             | `data-mj-theme="light"` | Light, even on a dark OS       |
| Force dark              | `data-mj-theme="dark"`  | Dark, even on a light OS       |

`'system'` deliberately **removes** the attribute rather than writing the resolved value, so the
CSS media query stays in charge and the page keeps tracking the OS even if JavaScript never runs.

### Avoiding the light-mode flash

Server-rendered markup carries no theme attribute, so a dark-theme user would otherwise see a white
flash. Inline this in `<head>` before any stylesheet:

```tsx
import { themeInitScript } from '@manja/react'; // or '@manja/angular'

<script dangerouslySetInnerHTML={{ __html: themeInitScript() }} />;
```

### Scoping a theme to part of the page

```tsx
<ThemeProvider scoped>…</ThemeProvider>          {/* React  */}
```

```html
<section mjTheme="dark" class="mj-theme">…</section>
<!-- Angular -->
```

---

## Tokens

230 CSS custom properties, all prefixed `--mj-`. 65 semantic colour tokens are defined per theme,
and the build **fails** if light and dark ever fall out of sync.

```
Base ramps      --mj-color-brand-600      raw palette, theme-independent
Semantic        --mj-color-bg-brand       what it means, per theme
Spacing         --mj-space-1 … 12
Radius          --mj-radius-sm … full
Typography      --mj-font-size-*, --mj-font-weight-*, --mj-font-line-height-*
Motion          --mj-duration-*, --mj-easing-*
Elevation       --mj-shadow-xs … xl
```

Semantic tokens reference base ramps through `var()`, so overriding a single ramp value at runtime
re-themes light and dark together:

```css
:root {
  --mj-color-brand-600: #7c3aed;
} /* the whole system turns purple */
```

**Contrast is a deliberate part of the token set.** Each intent carries its own foreground token
(`--mj-color-fg-on-warning` is near-black, `--mj-color-fg-on-brand` is white) because white text on
amber fails WCAG AA badly. Reach for the matching `fg-on-*` token rather than assuming white.

### Shape

Manja is a **circular** system. Interactive controls are pills; surfaces are generously rounded at
20px. Native HTML elements get it from the base layer, so a plain `<button>` is already a pill
before any component wraps it.

| Token                         | Resolves to | Used by                       |
| ----------------------------- | ----------- | ----------------------------- |
| `--mj-radius-control`         | pill        | buttons, chips, badges        |
| `--mj-radius-field`           | pill        | inputs, selects               |
| `--mj-radius-field-multiline` | 16px        | textareas                     |
| `--mj-radius-surface`         | **20px**    | cards, dialogs, panels        |
| `--mj-radius-overlay`         | 16px        | popovers, menus, tooltips     |
| `--mj-radius-selection`       | 8px         | checkboxes                    |
| `--mj-radius-circle`          | pill        | radios, avatars, icon buttons |

Component CSS references these **semantic** tokens, never a raw step like `--mj-radius-xl`. That is
what makes the shape language swappable: re-point `--mj-radius-control` at `--mj-radius-sm` and the
entire system turns square in one edit, with no component touched.

Two shapes are deliberately _not_ pills. A multi-line pill reads as a lozenge, so textareas stay
merely rounded; and a pill checkbox is indistinguishable from a radio, so checkboxes get a rounded
square. Both are visible side by side in the playgrounds.

### Rebranding

Edit `packages/tokens/src/base/color.json`, then `pnpm nx build @manja/tokens`. Every downstream
package picks it up — Nx handles the ordering.

---

## Commands

```sh
pnpm build                       # build every package in dependency order
pnpm test                        # run all unit tests
pnpm lint
pnpm typecheck
pnpm verify                      # everything above, plus a format check
pnpm format                      # prettier --write
pnpm graph                       # visualise the project graph

pnpm nx build @manja/tokens      # a single package
pnpm nx run-many -t test         # a single target
```

Nx caches every target; a no-op `pnpm verify` finishes in well under a second.

---

## Status

The foundation is complete and verified end to end: tokens, styles, headless core, both framework
packages, and both playground apps build, typecheck, lint and test from clean — 23 Nx tasks across
7 projects.

`Button` is the first shipped component and the reference implementation. See
[CONTRIBUTING.md](CONTRIBUTING.md) for the workflow that adds the next one to both frameworks at
once.
