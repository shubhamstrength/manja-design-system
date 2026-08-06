let counter = 0;

/**
 * Monotonic id for wiring `aria-labelledby`, `aria-describedby` and friends.
 *
 * React 19 and Angular both have their own SSR-safe id hooks — reach for those
 * inside components. This exists for the headless layer, which has no
 * framework to ask.
 */
export function createId(prefix = 'mj'): string {
  counter += 1;
  return `${prefix}-${counter}`;
}

/** Resets the counter. Test-only; keeps snapshots stable across cases. */
export function resetIdCounter(): void {
  counter = 0;
}
