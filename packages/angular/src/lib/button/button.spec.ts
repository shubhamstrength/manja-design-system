import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ManjaButton } from './button';

@Component({
  imports: [ManjaButton],
  template: `
    <button
      mjButton
      [variant]="variant()"
      [intent]="intent()"
      [size]="size()"
      [fullWidth]="fullWidth()"
      [iconOnly]="iconOnly()"
      (click)="clicks = clicks + 1"
    >
      Continue
    </button>
  `,
})
class HostComponent {
  readonly variant = signal<'solid' | 'outline' | 'soft' | 'ghost' | 'link'>('solid');
  readonly intent = signal<'brand' | 'danger' | 'neutral'>('brand');
  readonly size = signal<'xs' | 'sm' | 'md' | 'lg' | 'xl'>('md');
  readonly fullWidth = signal(false);
  readonly iconOnly = signal(false);
  clicks = 0;
}

describe('ManjaButton', () => {
  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  });

  function mount() {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    return { fixture, button };
  }

  it('applies the component class to the native button', () => {
    const { button } = mount();
    expect(button.classList.contains('mj-button')).toBe(true);
    expect(button.tagName).toBe('BUTTON');
  });

  it('defaults to type="button" so it cannot silently submit a form', () => {
    const { button } = mount();
    expect(button.getAttribute('type')).toBe('button');
  });

  it('applies the default variant, intent and size', () => {
    const { button } = mount();
    expect(button.getAttribute('data-variant')).toBe('solid');
    expect(button.getAttribute('data-intent')).toBe('brand');
    expect(button.getAttribute('data-size')).toBe('md');
  });

  it('maps inputs onto the same data attributes React uses', () => {
    const { fixture, button } = mount();

    fixture.componentInstance.variant.set('outline');
    fixture.componentInstance.intent.set('danger');
    fixture.componentInstance.size.set('lg');
    fixture.detectChanges();

    expect(button.getAttribute('data-variant')).toBe('outline');
    expect(button.getAttribute('data-intent')).toBe('danger');
    expect(button.getAttribute('data-size')).toBe('lg');
  });

  it('omits boolean modifiers rather than rendering them false', () => {
    const { button } = mount();
    expect(button.hasAttribute('data-full-width')).toBe(false);
    expect(button.hasAttribute('data-icon-only')).toBe(false);
  });

  it('sets modifier attributes when enabled', () => {
    const { fixture, button } = mount();

    fixture.componentInstance.fullWidth.set(true);
    fixture.componentInstance.iconOnly.set(true);
    fixture.detectChanges();

    expect(button.getAttribute('data-full-width')).toBe('true');
    expect(button.getAttribute('data-icon-only')).toBe('true');
  });

  it('projects its content', () => {
    const { button } = mount();
    expect(button.textContent?.trim()).toBe('Continue');
  });

  it('emits native click events', () => {
    const { fixture, button } = mount();

    button.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.clicks).toBe(1);
  });
});

describe('ManjaButton accessible name guard', () => {
  let warn: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => warn.mockRestore());

  @Component({
    imports: [ManjaButton],
    template: `<button mjButton iconOnly></button>`,
  })
  class UnnamedIconButton {}

  @Component({
    imports: [ManjaButton],
    template: `<button mjButton iconOnly aria-label="Close"></button>`,
  })
  class NamedIconButton {}

  it('warns when an icon-only button has no accessible name', async () => {
    const fixture = TestBed.createComponent(UnnamedIconButton);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('no accessible name'),
      expect.anything(),
    );
  });

  it('stays quiet when an aria-label is present', async () => {
    const fixture = TestBed.createComponent(NamedIconButton);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(warn).not.toHaveBeenCalled();
  });
});
