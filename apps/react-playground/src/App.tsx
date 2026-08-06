import { ThemeSwitcher } from './ThemeSwitcher.js';
import { TokenGallery } from './TokenGallery.js';

export function App() {
  return (
    <main className="pg-shell" id="top">
      <header className="pg-header">
        <div>
          <h1 className="pg-title">Manja — React</h1>
          <p className="pg-subtitle">
            Consuming <code>@manja/react</code>, <code>@manja/styles</code> and{' '}
            <code>@manja/tokens</code> straight from the workspace. Nothing is published.
          </p>
        </div>
        <ThemeSwitcher />
      </header>

      <TokenGallery />
    </main>
  );
}
