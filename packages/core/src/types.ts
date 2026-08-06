/**
 * The vocabulary shared by every Manja component, in both frameworks.
 *
 * These names line up 1:1 with the semantic token groups, so a component that
 * accepts `intent="danger"` can reach straight for `--mj-color-bg-danger`
 * without a lookup table.
 */

/** Control scale. Maps to `--mj-control-height-*` and `--mj-icon-size-*`. */
export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/** Semantic colour role. Maps to the `--mj-color-*-{intent}` token families. */
export type Intent = 'neutral' | 'brand' | 'danger' | 'warning' | 'success' | 'info';

/** How strongly a component asserts itself against the surface behind it. */
export type Variant = 'solid' | 'soft' | 'outline' | 'ghost' | 'link';

/** Writing-mode-aware orientation, for groups, dividers and toolbars. */
export type Orientation = 'horizontal' | 'vertical';

/** Validation state surfaced by form controls. */
export type ValidationState = 'valid' | 'invalid' | 'pending';

/**
 * Props shared by every component so consumers can always reach the host node.
 * Framework packages intersect this with their own element props.
 */
export interface BaseProps {
  /** Extra class names, merged after the component's own. */
  className?: string;
  /** Test hook. Rendered as `data-testid`. */
  testId?: string;
}
