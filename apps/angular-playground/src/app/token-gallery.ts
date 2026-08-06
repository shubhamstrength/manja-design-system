import { ChangeDetectionStrategy, Component } from '@angular/core';
import { cssVars, tokens } from '@manja/tokens';

interface Entry {
  readonly name: string;
  readonly value: string;
}

interface Intent {
  readonly name: string;
  readonly bg: string;
  readonly fg: string;
}

interface Ramp {
  readonly name: string;
  readonly steps: Entry[];
}

/** Turns a token group into something `@for` can iterate. */
const entries = (group: Record<string, string>): Entry[] =>
  Object.entries(group).map(([name, value]) => ({ name, value }));

/**
 * Mirrors the React playground's gallery exactly, and is derived from
 * `@manja/tokens` at runtime rather than hand-listed — so the two frameworks
 * cannot drift, and neither can fall behind the tokens.
 */
@Component({
  selector: 'app-token-gallery',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="pg-section">
      <h2 class="pg-section-title">Intents</h2>
      <p class="pg-section-note">
        Each intent pairs a background with its own foreground token. White on amber would
        fail WCAG AA, so the warning intent resolves to near-black text instead.
      </p>
      <div class="pg-intents">
        @for (intent of intents; track intent.name) {
          <div
            class="pg-intent"
            [style.background-color]="intent.bg"
            [style.color]="intent.fg"
          >
            {{ intent.name }}
          </div>
        }
      </div>
    </section>

    <section class="pg-section">
      <h2 class="pg-section-title">Semantic — background</h2>
      <p class="pg-section-note">
        What a colour means, not what it is. These are the tokens components should use.
      </p>
      <div class="pg-grid">
        @for (item of bg; track item.name) {
          <div class="pg-card">
            <div class="pg-swatch" [style.background-color]="item.value"></div>
            <div class="pg-label">
              <span class="pg-name">{{ item.name }}</span
              ><br />{{ item.value }}
            </div>
          </div>
        }
      </div>
    </section>

    <section class="pg-section">
      <h2 class="pg-section-title">Semantic — foreground</h2>
      <div class="pg-grid">
        @for (item of fg; track item.name) {
          <div class="pg-card">
            <div
              class="pg-swatch"
              [style.color]="item.value"
              style="display: grid; place-items: center; font-weight: 600"
            >
              Aa
            </div>
            <div class="pg-label">
              <span class="pg-name">{{ item.name }}</span>
            </div>
          </div>
        }
      </div>
    </section>

    <section class="pg-section">
      <h2 class="pg-section-title">Semantic — border</h2>
      <div class="pg-grid">
        @for (item of border; track item.name) {
          <div class="pg-card">
            <div
              class="pg-swatch"
              [style.border-color]="item.value"
              style="border-width: 3px"
            ></div>
            <div class="pg-label">
              <span class="pg-name">{{ item.name }}</span>
            </div>
          </div>
        }
      </div>
    </section>

    <section class="pg-section">
      <h2 class="pg-section-title">Base ramps</h2>
      <p class="pg-section-note">
        Theme-independent raw palette. Semantic tokens point at these through var(), so
        overriding one ramp value re-themes light and dark together.
      </p>
      @for (ramp of ramps; track ramp.name) {
        <div class="pg-ramp-row">
          <div class="pg-ramp-name">color.{{ ramp.name }}</div>
          <div class="pg-ramp">
            @for (step of ramp.steps; track step.name) {
              <div
                class="pg-ramp-step"
                [style.background-color]="step.value"
                [title]="ramp.name + '.' + step.name"
              ></div>
            }
          </div>
        </div>
      }
    </section>

    <section class="pg-section">
      <h2 class="pg-section-title">Spacing</h2>
      @for (item of space; track item.name) {
        <div class="pg-row">
          <span class="pg-row-key">space.{{ item.name }}</span>
          <span class="pg-bar" [style.inline-size]="item.value"></span>
          <span class="pg-label">{{ spaceValues[item.name] }}</span>
        </div>
      }
    </section>

    <section class="pg-section">
      <h2 class="pg-section-title">Radius</h2>
      <div class="pg-grid">
        @for (item of radius; track item.name) {
          <div class="pg-card">
            <div
              class="pg-swatch"
              [style.border-radius]="item.value"
              [style.background-color]="brandMuted"
            ></div>
            <div class="pg-label">
              <span class="pg-name">radius.{{ item.name }}</span>
            </div>
          </div>
        }
      </div>
    </section>

    <section class="pg-section">
      <h2 class="pg-section-title">Typography</h2>
      @for (item of fontSize; track item.name) {
        <div class="pg-row">
          <span class="pg-row-key">size.{{ item.name }}</span>
          <span class="pg-type-sample" [style.font-size]="item.value">
            The quick brown fox
          </span>
        </div>
      }
    </section>

    <section class="pg-section">
      <h2 class="pg-section-title">Elevation</h2>
      <div class="pg-grid">
        @for (item of shadow; track item.name) {
          <div class="pg-card" style="border: none">
            <div class="pg-shadow-box" [style.box-shadow]="item.value"></div>
            <div class="pg-label">
              <span class="pg-name">shadow.{{ item.name }}</span>
            </div>
          </div>
        }
      </div>
    </section>

    <section class="pg-section">
      <h2 class="pg-section-title">Focus ring</h2>
      <p class="pg-section-note">
        Tab through these. The ring comes from the design system's global :focus-visible
        rule — no component defines its own.
      </p>
      <div class="pg-controls">
        <button type="button" class="pg-button">Button</button>
        <a href="#top" class="pg-button">Link</a>
        <input class="pg-button" placeholder="Input" />
      </div>
    </section>
  `,
})
export class TokenGallery {
  protected readonly bg = entries(cssVars.color.bg);
  protected readonly fg = entries(cssVars.color.fg);
  protected readonly border = entries(cssVars.color.border);
  protected readonly space = entries(cssVars.space);
  protected readonly radius = entries(cssVars.radius);
  protected readonly fontSize = entries(cssVars.font.size);
  protected readonly shadow = entries(cssVars.shadow);

  protected readonly brandMuted = cssVars.color.bg.brandMuted;
  protected readonly spaceValues: Record<string, string> = tokens.space;

  protected readonly ramps: Ramp[] = [
    'neutral',
    'brand',
    'red',
    'amber',
    'green',
    'cyan',
  ].map((name) => ({
    name,
    steps: entries(cssVars.color[name as 'neutral']),
  }));

  protected readonly intents: Intent[] = [
    { name: 'brand', bg: cssVars.color.bg.brand, fg: cssVars.color.fg.onBrand },
    { name: 'danger', bg: cssVars.color.bg.danger, fg: cssVars.color.fg.onDanger },
    { name: 'warning', bg: cssVars.color.bg.warning, fg: cssVars.color.fg.onWarning },
    { name: 'success', bg: cssVars.color.bg.success, fg: cssVars.color.fg.onSuccess },
    { name: 'info', bg: cssVars.color.bg.info, fg: cssVars.color.fg.onInfo },
  ];
}
