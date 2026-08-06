import { computed, Directive, input } from '@angular/core';
import { THEME_ATTRIBUTE, type ThemePreference } from '@manja/core';

/**
 * Themes a subtree without touching the document root.
 *
 * ```html
 * <section mjTheme="dark" class="mj-theme">…</section>
 * ```
 *
 * The Angular counterpart to React's `<ThemeProvider scoped>`. Binding the
 * attribute to `null` for `'system'` removes it, which hands control back to
 * the stylesheet's `prefers-color-scheme` block.
 */
@Directive({
  selector: '[mjTheme]',
  host: {
    '[attr.data-mj-theme]': 'themeAttribute()',
  },
})
export class ManjaThemeDirective {
  readonly mjTheme = input<ThemePreference>('system');

  protected readonly themeAttribute = computed(() => {
    const preference = this.mjTheme();
    return preference === 'system' ? null : preference;
  });
}

// Guards against the host binding above drifting from the token contract.
const _attributeContract: 'data-mj-theme' = THEME_ATTRIBUTE;
void _attributeContract;
