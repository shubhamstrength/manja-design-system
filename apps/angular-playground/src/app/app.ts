import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ThemeSwitcher } from './theme-switcher';
import { TokenGallery } from './token-gallery';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ThemeSwitcher, TokenGallery],
  template: `
    <main class="pg-shell" id="top">
      <header class="pg-header">
        <div>
          <h1 class="pg-title">Manja — Angular</h1>
          <p class="pg-subtitle">
            Consuming <code>&#64;manja/angular</code>, <code>&#64;manja/styles</code> and
            <code>&#64;manja/tokens</code> straight from the workspace. Nothing is
            published.
          </p>
        </div>
        <app-theme-switcher />
      </header>

      <app-token-gallery />
    </main>
  `,
})
export class App {}
