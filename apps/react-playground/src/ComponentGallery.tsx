import { Button, type Intent, type Size, type Variant } from '@manja/react';
import { Fragment } from 'react';
import { Section } from './Section.js';

const VARIANTS: Variant[] = ['solid', 'soft', 'outline', 'ghost', 'link'];
const INTENTS: Intent[] = ['brand', 'neutral', 'danger', 'warning', 'success', 'info'];
const SIZES: Size[] = ['xs', 'sm', 'md', 'lg', 'xl'];

/** Inline so the gallery exercises the component's own icon sizing rule. */
function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  );
}

export function ComponentGallery() {
  return (
    <>
      <Section
        title="Button — variant x intent"
        note="Thirty combinations, but the CSS is six intent palettes plus five variants.
              Each intent publishes private custom properties; each variant decides which
              of them to paint with."
      >
        <div className="pg-matrix">
          <span />
          {VARIANTS.map((variant) => (
            <span className="pg-matrix-label" key={variant}>
              {variant}
            </span>
          ))}

          {INTENTS.map((intent) => (
            <Fragment key={intent}>
              <span className="pg-matrix-label">{intent}</span>
              {VARIANTS.map((variant) => (
                <Button key={variant} variant={variant} intent={intent}>
                  Button
                </Button>
              ))}
            </Fragment>
          ))}
        </div>
      </Section>

      <Section
        title="Button — sizes"
        note="Height comes from --mj-control-height-*, and icons track the label via
              --mj-icon-size-*, so a button never has to be measured by hand."
      >
        <div className="pg-controls">
          {SIZES.map((size) => (
            <Button key={size} size={size}>
              <PlusIcon />
              Size {size}
            </Button>
          ))}
        </div>
      </Section>

      <Section
        title="Button — icon only"
        note="Square footprint, fully round. TypeScript refuses to compile an icon-only
              button without an aria-label, so it cannot ship without an accessible name."
      >
        <div className="pg-controls">
          {SIZES.map((size) => (
            <Button key={size} size={size} iconOnly aria-label={`Add (${size})`}>
              <PlusIcon />
            </Button>
          ))}
        </div>
      </Section>

      <Section
        title="Button — states"
        note="Disabled keeps borderless variants borderless; a grey slab where a ghost
              button used to be reads as a different component."
      >
        <div className="pg-controls">
          {VARIANTS.map((variant) => (
            <Button key={variant} variant={variant} disabled>
              Disabled
            </Button>
          ))}
        </div>
        <div className="pg-controls" style={{ marginBlockStart: 'var(--mj-space-3)' }}>
          <Button intent="danger">Danger focus ring</Button>
          <Button variant="outline" intent="danger">
            Tab to me
          </Button>
        </div>
      </Section>

      <Section title="Button — full width">
        <Button fullWidth size="lg">
          Full width
        </Button>
      </Section>
    </>
  );
}
