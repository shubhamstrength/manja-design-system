import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ManjaButton, type Intent, type Size, type Variant } from '@manja/angular';

/**
 * Mirrors the React playground's ComponentGallery exactly. Same props, same
 * order, same copy — so anything that looks different between the two apps is
 * a real difference in the design system, not in the demo.
 */
@Component({
  selector: 'app-component-gallery',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ManjaButton],
  template: `
    <section class="pg-section">
      <h2 class="pg-section-title">Button — variant x intent</h2>
      <p class="pg-section-note">
        Thirty combinations, but the CSS is six intent palettes plus five variants. Each
        intent publishes private custom properties; each variant decides which of them to
        paint with.
      </p>
      <div class="pg-matrix">
        <span></span>
        @for (variant of variants; track variant) {
          <span class="pg-matrix-label">{{ variant }}</span>
        }
        @for (intent of intents; track intent) {
          <span class="pg-matrix-label">{{ intent }}</span>
          @for (variant of variants; track variant) {
            <button mjButton [variant]="variant" [intent]="intent">Button</button>
          }
        }
      </div>
    </section>

    <section class="pg-section">
      <h2 class="pg-section-title">Button — sizes</h2>
      <p class="pg-section-note">
        Height comes from --mj-control-height-*, and icons track the label via
        --mj-icon-size-*, so a button never has to be measured by hand.
      </p>
      <div class="pg-controls">
        @for (size of sizes; track size) {
          <button mjButton [size]="size">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 5v14M5 12h14" stroke-linecap="round" />
            </svg>
            Size {{ size }}
          </button>
        }
      </div>
    </section>

    <section class="pg-section">
      <h2 class="pg-section-title">Button — icon only</h2>
      <p class="pg-section-note">
        Square footprint, fully round. Angular cannot encode the requirement in the type
        system the way React does, so an icon-only button with no accessible name logs a
        dev-mode warning instead.
      </p>
      <div class="pg-controls">
        @for (size of sizes; track size) {
          <button
            mjButton
            [size]="size"
            iconOnly
            [attr.aria-label]="'Add (' + size + ')'"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 5v14M5 12h14" stroke-linecap="round" />
            </svg>
          </button>
        }
      </div>
    </section>

    <section class="pg-section">
      <h2 class="pg-section-title">Button — states</h2>
      <p class="pg-section-note">
        Disabled keeps borderless variants borderless; a grey slab where a ghost button
        used to be reads as a different component.
      </p>
      <div class="pg-controls">
        @for (variant of variants; track variant) {
          <button mjButton [variant]="variant" disabled>Disabled</button>
        }
      </div>
      <div class="pg-controls" style="margin-block-start: var(--mj-space-3)">
        <button mjButton intent="danger">Danger focus ring</button>
        <button mjButton variant="outline" intent="danger">Tab to me</button>
      </div>
    </section>

    <section class="pg-section">
      <h2 class="pg-section-title">Button — full width</h2>
      <button mjButton fullWidth size="lg">Full width</button>
    </section>
  `,
})
export class ComponentGallery {
  protected readonly variants: Variant[] = ['solid', 'soft', 'outline', 'ghost', 'link'];
  protected readonly intents: Intent[] = [
    'brand',
    'neutral',
    'danger',
    'warning',
    'success',
    'info',
  ];
  protected readonly sizes: Size[] = ['xs', 'sm', 'md', 'lg', 'xl'];
}
