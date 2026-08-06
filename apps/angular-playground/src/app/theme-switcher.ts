import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ManjaThemeService, type ThemePreference } from '@manja/angular';

@Component({
  selector: 'app-theme-switcher',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="pg-controls">
      <div class="pg-controls" role="group" aria-label="Colour theme">
        @for (option of options; track option) {
          <button
            type="button"
            class="pg-button"
            [attr.aria-pressed]="theme.preference() === option"
            (click)="theme.setPreference(option)"
          >
            {{ option }}
          </button>
        }
      </div>
      <span class="pg-badge">resolved: {{ theme.resolved() }}</span>
    </div>
  `,
})
export class ThemeSwitcher {
  protected readonly theme = inject(ManjaThemeService);
  protected readonly options: ThemePreference[] = ['light', 'system', 'dark'];
}
