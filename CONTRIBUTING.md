# Contributing

## Repository layout

```
packages/
  tokens/     src/base/*.json        raw ramps and scales
              src/semantic/*.json    light.json + dark.json, must stay in sync
              build.mjs              Style Dictionary → CSS / JSON / TS
  styles/     src/reset.css          opt-in reset, zero specificity
              src/base.css           document defaults + focus-ring contract
              src/utilities.css      the few utilities components need
              src/components/        component CSS goes here
  core/       src/theme.ts           the one theme implementation
              src/types.ts           Size, Intent, Variant, Orientation
              src/cx.ts              class name joiner
  react/      src/theme/             ThemeProvider, useTheme
  angular/    src/lib/theme/         ManjaThemeService, ManjaThemeDirective

apps/
  react-playground/     Vite + React 19      pnpm dev:react    :4200
  angular-playground/   Angular CLI builder  pnpm dev:angular  :4300
```

Both playgrounds render the same token gallery from `@manja/tokens` at runtime, so a new component
should be added to both — seeing them side by side is how you catch the two frameworks disagreeing.
Their chrome CSS (`src/playground.css`) is kept byte-identical on purpose; if it drifted, the
comparison would prove nothing.

---

## Adding a component

A component is added in **three places**, in this order. The CSS is shared; only the bindings are
written twice.

### 1. Component CSS — `packages/styles/src/components/<name>.css`

Style with tokens only. Never hard-code a colour or a pixel value.

```css
@layer mj.components {
  .mj-button {
    display: inline-flex;
    align-items: center;
    gap: var(--mj-space-2);
    block-size: var(--mj-control-height-md);
    padding-inline: var(--mj-space-4);
    border-radius: var(--mj-radius-md);
    font-weight: var(--mj-font-weight-medium);
    transition: background-color var(--mj-duration-fast) var(--mj-easing-standard);
  }

  /* Variants are data attributes, so React props and Angular host bindings
     both map onto them without a lookup table. */
  .mj-button[data-variant='solid'][data-intent='brand'] {
    background-color: var(--mj-color-bg-brand);
    color: var(--mj-color-fg-on-brand);
  }

  .mj-button[data-variant='solid'][data-intent='brand']:hover:not(:disabled) {
    background-color: var(--mj-color-bg-brand-hover);
  }

  .mj-button[data-size='sm'] {
    block-size: var(--mj-control-height-sm);
    padding-inline: var(--mj-space-3);
    font-size: var(--mj-font-size-sm);
  }
}
```

Then add it to `packages/styles/src/index.css`:

```css
@import './components/button.css';
```

Rules that matter:

- **Always wrap in `@layer mj.components`.** Unlayered app CSS then beats the design system
  without anyone needing `!important`.
- **Use a semantic radius token, never a raw step.** `var(--mj-radius-control)` for anything
  interactive, `--mj-radius-surface` for cards and panels, `--mj-radius-overlay` for floating
  things. Writing `var(--mj-radius-xl)` in a component hard-codes the shape language into that
  component and breaks the ability to re-shape the system from one file. The full list is in the
  README's Shape section, and both playgrounds render it.
- **Never write a focus style.** `:focus-visible` is handled globally in `base.css`. If a component
  needs a different ring colour, set `--mj-focus-ring-color` on it.
- **Use the matching `fg-on-*` token** for text on a filled background. White on
  `--mj-color-bg-warning` fails WCAG AA.
- **Logical properties** (`block-size`, `padding-inline`) so RTL works for free.

### 2. Shared behaviour — `packages/core/`

Only if there is real logic: keyboard handling, roving tabindex, open/close state, focus trapping.
Put it in `core` so both frameworks get the same behaviour and the same bugs get fixed once.

Pure presentation needs nothing here.

### 3. The two bindings

**React** — `packages/react/src/button/Button.tsx`

```tsx
import { cx, type Intent, type Size, type Variant } from '@manja/core';
import { forwardRef, type ButtonHTMLAttributes } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  intent?: Intent;
  size?: Size;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'solid', intent = 'brand', size = 'md', className, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cx('mj-button', className)}
      data-variant={variant}
      data-intent={intent}
      data-size={size}
      {...rest}
    />
  );
});
```

**Angular** — `packages/angular/src/lib/button/button.ts`

```ts
import { Component, input } from '@angular/core';
import type { Intent, Size, Variant } from '@manja/core';

@Component({
  selector: 'button[mjButton]',
  template: `<ng-content />`,
  host: {
    class: 'mj-button',
    '[attr.data-variant]': 'variant()',
    '[attr.data-intent]': 'intent()',
    '[attr.data-size]': 'size()',
  },
})
export class ManjaButton {
  readonly variant = input<Variant>('solid');
  readonly intent = input<Intent>('brand');
  readonly size = input<Size>('md');
}
```

Export both from their package's `index.ts`, and keep the prop names identical across frameworks.

---

## Testing

Every component needs tests in both frameworks. Test **behaviour and accessibility**, not class
names — a test asserting `class="mj-button"` breaks on every refactor and catches nothing.

```sh
pnpm nx test @manja/react
pnpm nx test @manja/angular
pnpm nx run-many -t test
```

### Angular tests compile AOT — this is not optional

`packages/angular/vitest.config.mts` runs `@analogjs/vite-plugin-angular`. Under JIT, signal APIs
like `input()` are **never discovered**, because the compiler finds them by static analysis and
there is no decorator to reflect on at runtime. The symptom is nasty: the directive instantiates,
the selector matches, and every input silently keeps its default value.

If you add a spec that declares an inline test host component, make sure it is covered by
`tsconfig.spec.json` — the plugin skips files outside its TypeScript program.

---

## Tokens

Adding a semantic token means adding it to **both** `light.json` and `dark.json`. The build enforces
this and fails with the exact missing paths:

```
token build failed:
Semantic themes are out of sync.
  missing from dark.json:  color.fg.onBrand
```

After editing tokens, rebuild:

```sh
pnpm nx build @manja/tokens
```

---

## Before opening a PR

```sh
pnpm verify
```

This runs the format check, lint, typecheck, tests and builds for all five packages. Nx caches
aggressively, so a clean re-run is close to instant.
