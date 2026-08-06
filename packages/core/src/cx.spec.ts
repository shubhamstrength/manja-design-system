import { describe, expect, it } from 'vitest';
import { createId, resetIdCounter } from './id.js';
import { cx } from './cx.js';

describe('cx', () => {
  it('joins strings and drops falsy values', () => {
    expect(cx('a', null, 'b', undefined, false, '', 'c')).toBe('a b c');
  });

  it('applies object keys whose value is truthy', () => {
    expect(cx('base', { on: true, off: false, absent: undefined })).toBe('base on');
  });

  it('flattens nested arrays', () => {
    expect(cx('a', ['b', ['c', false, ['d']]])).toBe('a b c d');
  });

  it('preserves order so consumer classes land last', () => {
    expect(cx('mj-button', 'mj-button--solid', 'app-override')).toBe(
      'mj-button mj-button--solid app-override',
    );
  });

  it('returns an empty string when nothing survives', () => {
    expect(cx(null, undefined, false, {})).toBe('');
  });
});

describe('createId', () => {
  it('produces unique, prefixed ids', () => {
    resetIdCounter();
    expect(createId('mj-label')).toBe('mj-label-1');
    expect(createId('mj-label')).toBe('mj-label-2');
  });
});
