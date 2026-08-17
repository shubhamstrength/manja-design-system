import { cssVars, tokens } from '@manja/tokens';
import { Section } from './Section.js';

/**
 * Everything below is derived from `@manja/tokens` at runtime rather than
 * hand-listed, so the gallery cannot fall out of date: add a token, it shows up
 * here on the next build.
 */

const RAMPS = ['neutral', 'brand', 'red', 'amber', 'green', 'cyan'] as const;

/** The semantic radius tokens — what component CSS is allowed to reference. */
const SHAPE = [
  ['control', 'buttons, chips, badges'],
  ['field', 'inputs, selects'],
  ['fieldMultiline', 'textareas'],
  ['surface', 'cards, dialogs, panels'],
  ['overlay', 'popovers, menus, tooltips'],
  ['selection', 'checkboxes'],
  ['circle', 'radios, avatars, icon buttons'],
] as const;

const INTENTS = [
  ['brand', cssVars.color.bg.brand, cssVars.color.fg.onBrand],
  ['danger', cssVars.color.bg.danger, cssVars.color.fg.onDanger],
  ['warning', cssVars.color.bg.warning, cssVars.color.fg.onWarning],
  ['success', cssVars.color.bg.success, cssVars.color.fg.onSuccess],
  ['info', cssVars.color.bg.info, cssVars.color.fg.onInfo],
] as const;

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

      <Section
        title="Shape — semantic"
        note="Manja is a circular system: controls are pills, surfaces are generously
              rounded. Component CSS references these tokens and never a raw step, so
              re-pointing one of them re-shapes everything that uses it."
      >
        <div className="pg-grid">
          {SHAPE.map(([name, usage]) => (
            <div className="pg-card" key={name}>
              <div
                className="pg-shape-box"
                style={{ borderRadius: cssVars.radius[name] }}
              />
              <div className="pg-label">
                <span className="pg-name">radius.{name}</span>
                <br />
                {usage}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="Shape — native elements"
        note="These are bare HTML elements, styled here for colour and size only — not one
              border-radius among them. The rounding comes from the design system's base
              layer, so an unstyled control already belongs."
      >
        <div className="pg-native">
          <button type="button">Button</button>
          <input placeholder="Text input" />
          <select>
            <option>Select</option>
          </select>
          <textarea placeholder="Textarea" />
          <input type="checkbox" defaultChecked aria-label="Checkbox" />
          <input type="radio" defaultChecked aria-label="Radio" />
        </div>
      </Section>

      <Section
        title="Radius — base scale"
        note="The raw steps the semantic tokens point at. Reach for these only when
              defining a new semantic token."
      >
        <div className="pg-grid">
          {Object.entries(cssVars.radius)
            .filter(([name]) => !SHAPE.some(([semantic]) => semantic === name))
            .map(([name, varRef]) => (
              <div className="pg-card" key={name}>
                <div className="pg-shape-box" style={{ borderRadius: varRef }} />
                <div className="pg-label">
                  <span className="pg-name">radius.{name}</span>
                  <br />
                  {tokens.radius[name as keyof typeof tokens.radius]}
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
