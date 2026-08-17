import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Button } from './Button.js';

describe('Button', () => {
  it('renders its label in a real button element', () => {
    render(<Button>Continue</Button>);

    const button = screen.getByRole('button', { name: 'Continue' });
    expect(button.tagName).toBe('BUTTON');
  });

  it('defaults to type="button" so it cannot silently submit a form', () => {
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <Button>Not a submit</Button>
      </form>,
    );

    screen.getByRole('button').click();

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('still allows an explicit submit button', () => {
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <Button type="submit">Submit</Button>
      </form>,
    );

    screen.getByRole('button').click();

    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it('applies the default variant, intent and size', () => {
    render(<Button>Default</Button>);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('data-variant', 'solid');
    expect(button).toHaveAttribute('data-intent', 'brand');
    expect(button).toHaveAttribute('data-size', 'md');
  });

  it('maps variant, intent and size onto data attributes', () => {
    render(
      <Button variant="outline" intent="danger" size="lg">
        Delete
      </Button>,
    );

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('data-variant', 'outline');
    expect(button).toHaveAttribute('data-intent', 'danger');
    expect(button).toHaveAttribute('data-size', 'lg');
  });

  it('omits boolean modifiers rather than rendering them false', () => {
    render(<Button>Plain</Button>);

    const button = screen.getByRole('button');
    // `data-full-width="false"` would still match a careless [data-full-width]
    // selector, so the attribute has to be absent, not false.
    expect(button).not.toHaveAttribute('data-full-width');
    expect(button).not.toHaveAttribute('data-icon-only');
  });

  it('sets modifier attributes when enabled', () => {
    render(
      <Button fullWidth iconOnly aria-label="Close">
        x
      </Button>,
    );

    const button = screen.getByRole('button', { name: 'Close' });
    expect(button).toHaveAttribute('data-full-width', 'true');
    expect(button).toHaveAttribute('data-icon-only', 'true');
  });

  it('appends the consumer class after its own', () => {
    render(<Button className="app-cta">Go</Button>);

    // Class attribute order does not affect the cascade, but pinning it keeps
    // the rendered output stable and proves the component class is not lost.
    expect(screen.getByRole('button')).toHaveAttribute('class', 'mj-button app-cta');
  });

  it('forwards a ref to the underlying button', () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Ref</Button>);

    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    expect(ref.current?.textContent).toBe('Ref');
  });

  it('forwards arbitrary button attributes and handlers', () => {
    const onClick = vi.fn();
    render(
      <Button onClick={onClick} name="action" value="save">
        Save
      </Button>,
    );

    const button = screen.getByRole('button');
    button.click();

    expect(onClick).toHaveBeenCalledOnce();
    expect(button).toHaveAttribute('name', 'action');
    expect(button).toHaveAttribute('value', 'save');
  });

  it('does not fire click when disabled', () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Disabled
      </Button>,
    );

    const button = screen.getByRole('button');
    button.click();

    expect(button).toBeDisabled();
    expect(onClick).not.toHaveBeenCalled();
  });

  it('renders testId as data-testid', () => {
    render(<Button testId="cta">Go</Button>);
    expect(screen.getByTestId('cta')).toBeInTheDocument();
  });
});
