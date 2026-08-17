import { cx, type Intent, type Size, type Variant } from '@manja/core';
import { forwardRef, type ButtonHTMLAttributes } from 'react';

type ButtonBase = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label'> & {
  /** How strongly the button asserts itself. Defaults to `'solid'`. */
  variant?: Variant;
  /** Semantic colour role. Defaults to `'brand'`. */
  intent?: Intent;
  /** Control scale. Defaults to `'md'`. */
  size?: Size;
  /** Stretch to the width of the container. */
  fullWidth?: boolean;
  /** Test hook, rendered as `data-testid`. */
  testId?: string;
};

/**
 * An icon-only button renders no text, so it *must* carry an accessible name.
 * Expressing that as a union makes the omission a compile error rather than
 * something an audit catches six months later.
 */
export type ButtonProps = ButtonBase &
  (
    { iconOnly: true; 'aria-label': string } | { iconOnly?: false; 'aria-label'?: string }
  );

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(props, ref) {
    const {
      variant = 'solid',
      intent = 'brand',
      size = 'md',
      fullWidth = false,
      iconOnly = false,
      // Native default is `submit`, which silently posts the surrounding form.
      // Opting into submission should be explicit.
      type = 'button',
      className,
      testId,
      children,
      ...rest
    } = props as ButtonBase & { iconOnly?: boolean };

    return (
      <button
        {...rest}
        ref={ref}
        type={type}
        className={cx('mj-button', className)}
        data-variant={variant}
        data-intent={intent}
        data-size={size}
        data-full-width={fullWidth ? 'true' : undefined}
        data-icon-only={iconOnly ? 'true' : undefined}
        data-testid={testId}
      >
        {children}
      </button>
    );
  },
);
