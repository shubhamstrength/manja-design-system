import { cssVars, tokens } from '@manja/tokens';
import type { ReactNode } from 'react';

/**
 * Everything below is derived from `@manja/tokens` at runtime rather than
 * hand-listed, so the gallery cannot fall out of date: add a token, it shows up
 * here on the next build.
 */

const RAMPS = ['neutral', 'brand', 'red', 'amber', 'green', 'cyan'] as const;

const INTENTS = [
  ['brand', cssVars.color.bg.brand, cssVars.color.fg.onBrand],
  ['danger', cssVars.color.bg.danger, cssVars.color.fg.onDanger],
  ['warning', cssVars.color.bg.warning, cssVars.color.fg.onWarning],
  ['success', cssVars.color.bg.success, cssVars.color.fg.onSuccess],
  ['info', cssVars.color.bg.info, cssVars.color.fg.onInfo],
] as const;

function Section({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: ReactNode;
}) {
  return (
    <section className="pg-section">
      <h2 className="pg-section-title">{title}</h2>
      {note ? <p className="pg-section-note">{note}</p> : null}
      {children}
    </section>
  );
}

function SwatchGrid({ group }: { group: Record<string, string> }) {
  return (
    <div className="pg-grid">
      {Object.entries(group).map(([name, varRef]) => (
        <div className="pg-card" key={name}>
          <div className="pg-swatch" style={{ backgroundColor: varRef }} />
          <div className="pg-label">
            <span className="pg-name">{name}</span>
            <br />
            {varRef}
          </div>
        </div>
      ))}
    </div>
  );
}

export function TokenGallery() {
  return (
    <>
      <Section
        title="Intents"
        note="Each intent pairs a background with its own foreground token. White on amber
              would fail WCAG AA, so the warning intent resolves to near-black text instead."
      >
        <div className="pg-intents">
          {INTENTS.map(([name, bg, fg]) => (
            <div
              key={name}
              className="pg-intent"
              style={{ backgroundColor: bg, color: fg }}
            >
              {name}
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="Semantic — background"
        note="What a colour means, not what it is. These are the tokens components should use."
      >
        <SwatchGrid group={cssVars.color.bg} />
      </Section>

      <Section title="Semantic — foreground">
        <div className="pg-grid">
          {Object.entries(cssVars.color.fg).map(([name, varRef]) => (
            <div className="pg-card" key={name}>
              <div
                className="pg-swatch"
                style={{
                  color: varRef,
                  display: 'grid',
                  placeItems: 'center',
                  fontWeight: 600,
                }}
              >
                Aa
              </div>
              <div className="pg-label">
                <span className="pg-name">{name}</span>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Semantic — border">
        <div className="pg-grid">
          {Object.entries(cssVars.color.border).map(([name, varRef]) => (
            <div className="pg-card" key={name}>
              <div
                className="pg-swatch"
                style={{ borderColor: varRef, borderWidth: 3 }}
              />
              <div className="pg-label">
                <span className="pg-name">{name}</span>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="Base ramps"
        note="Theme-independent raw palette. Semantic tokens point at these through var(),
              so overriding one ramp value re-themes light and dark together."
      >
        {RAMPS.map((ramp) => (
          <div className="pg-ramp-row" key={ramp}>
            <div className="pg-ramp-name">color.{ramp}</div>
            <div className="pg-ramp">
              {Object.entries(cssVars.color[ramp]).map(([step, varRef]) => (
                <div
                  key={step}
                  className="pg-ramp-step"
                  style={{ backgroundColor: varRef }}
                  title={`${ramp}.${step}`}
                />
              ))}
            </div>
          </div>
        ))}
      </Section>

      <Section title="Spacing">
        {Object.entries(cssVars.space).map(([name, varRef]) => (
          <div className="pg-row" key={name}>
            <span className="pg-row-key">space.{name}</span>
            <span className="pg-bar" style={{ inlineSize: varRef }} />
            <span className="pg-label">
              {tokens.space[name as keyof typeof tokens.space]}
            </span>
          </div>
        ))}
      </Section>

      <Section title="Radius">
        <div className="pg-grid">
          {Object.entries(cssVars.radius).map(([name, varRef]) => (
            <div className="pg-card" key={name}>
              <div
                className="pg-swatch"
                style={{
                  borderRadius: varRef,
                  backgroundColor: cssVars.color.bg.brandMuted,
                }}
              />
              <div className="pg-label">
                <span className="pg-name">radius.{name}</span>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Typography">
        {Object.entries(cssVars.font.size).map(([name, varRef]) => (
          <div className="pg-row" key={name}>
            <span className="pg-row-key">size.{name}</span>
            <span className="pg-type-sample" style={{ fontSize: varRef }}>
              The quick brown fox
            </span>
          </div>
        ))}
      </Section>

      <Section title="Elevation">
        <div className="pg-grid">
          {Object.entries(cssVars.shadow).map(([name, varRef]) => (
            <div className="pg-card" key={name} style={{ border: 'none' }}>
              <div className="pg-shadow-box" style={{ boxShadow: varRef }} />
              <div className="pg-label">
                <span className="pg-name">shadow.{name}</span>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="Focus ring"
        note="Tab through these. The ring comes from the design system's global
              :focus-visible rule — no component defines its own."
      >
        <div className="pg-controls">
          <button type="button" className="pg-button">
            Button
          </button>
          <a href="#top" className="pg-button">
            Link
          </a>
          <input className="pg-button" placeholder="Input" />
        </div>
      </Section>
    </>
  );
}
