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

- **Node 22+**
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
pnpm install
pnpm verify        # format check + lint + typecheck + test + build
```

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

223 CSS custom properties, all prefixed `--mj-`. 65 semantic tokens are defined per theme, and the
build **fails** if light and dark ever fall out of sync.

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

The foundation is complete and verified end to end: tokens, styles, headless core, and both
framework packages build, typecheck, lint and test from clean.

**No visual components exist yet** — that is deliberate, and next. See
[CONTRIBUTING.md](CONTRIBUTING.md) for the workflow that adds one to both frameworks at once.
