import {
  afterNextRender,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  isDevMode,
} from '@angular/core';
import type { Intent, Size, Variant } from '@manja/core';

/**
 * Button.
 *
 * Applied to a real `<button>` rather than wrapping one, so type, form
 * association, `disabled` and native keyboard behaviour all come for free and
 * behave exactly as the platform intends.
 *
 * ```html
 * <button mjButton variant="outline" intent="danger" size="lg">Delete</button>
 * ```
 *
 * Input names match `@manja/react`'s props one for one.
 */
@Component({
  selector: 'button[mjButton]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content />',
  host: {
    class: 'mj-button',
    '[attr.type]': 'type()',
    '[attr.data-variant]': 'variant()',
    '[attr.data-intent]': 'intent()',
    '[attr.data-size]': 'size()',
    '[attr.data-full-width]': "fullWidth() ? 'true' : null",
    '[attr.data-icon-only]': "iconOnly() ? 'true' : null",
  },
})
export class ManjaButton {
  private readonly host = inject<ElementRef<HTMLButtonElement>>(ElementRef);

  /** How strongly the button asserts itself. Defaults to `'solid'`. */
  readonly variant = input<Variant>('solid');

  /** Semantic colour role. Defaults to `'brand'`. */
  readonly intent = input<Intent>('brand');

  /** Control scale. Defaults to `'md'`. */
  readonly size = input<Size>('md');

  /**
   * Native `<button>` defaults to `submit`, which silently posts the
   * surrounding form. Opting into submission should be explicit.
   */
  readonly type = input<'button' | 'submit' | 'reset'>('button');

  readonly fullWidth = input(false, { transform: booleanAttribute });

  readonly iconOnly = input(false, { transform: booleanAttribute });

  constructor() {
    /**
     * React expresses "an icon-only button must have an accessible name" as a
     * union type, so omitting it is a compile error. Angular templates cannot
     * encode that, so the equivalent guard is a dev-mode warning — checked
     * after render, when any static aria-label is actually on the element.
     */
    if (isDevMode()) {
      afterNextRender(() => {
        const el = this.host.nativeElement;
        const named =
          el.hasAttribute('aria-label') ||
          el.hasAttribute('aria-labelledby') ||
          (el.textContent ?? '').trim().length > 0;

        if (this.iconOnly() && !named) {
          console.warn(
            '[mjButton] An icon-only button has no accessible name. Add ' +
              'aria-label="…" so screen reader users can tell what it does.',
            el,
          );
        }
      });
    }
  }
}
