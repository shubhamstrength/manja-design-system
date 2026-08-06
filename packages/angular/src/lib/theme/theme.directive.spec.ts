import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { THEME_ATTRIBUTE, type ThemePreference } from '@manja/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { ManjaThemeDirective } from './theme.directive';

@Component({
  imports: [ManjaThemeDirective],
  template: `<section [mjTheme]="preference()" class="mj-theme">scoped</section>`,
})
class HostComponent {
  readonly preference = signal<ThemePreference>('system');
}

describe('ManjaThemeDirective', () => {
  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    document.documentElement.removeAttribute(THEME_ATTRIBUTE);
  });

  function mount() {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const section: HTMLElement = fixture.nativeElement.querySelector('section');
    return { fixture, section };
  }

  it('leaves the attribute off for system, deferring to prefers-color-scheme', () => {
    const { section } = mount();
    expect(section.hasAttribute(THEME_ATTRIBUTE)).toBe(false);
  });

  it('applies an explicit preference to the host element', () => {
    const { fixture, section } = mount();

    fixture.componentInstance.preference.set('dark');
    fixture.detectChanges();

    expect(section.getAttribute(THEME_ATTRIBUTE)).toBe('dark');
  });

  it('never touches the document root', () => {
    const { fixture } = mount();

    fixture.componentInstance.preference.set('dark');
    fixture.detectChanges();

    expect(document.documentElement.hasAttribute(THEME_ATTRIBUTE)).toBe(false);
  });

  it('removes the attribute when switching back to system', () => {
    const { fixture, section } = mount();

    fixture.componentInstance.preference.set('light');
    fixture.detectChanges();
    expect(section.getAttribute(THEME_ATTRIBUTE)).toBe('light');

    fixture.componentInstance.preference.set('system');
    fixture.detectChanges();
    expect(section.hasAttribute(THEME_ATTRIBUTE)).toBe(false);
  });
});
