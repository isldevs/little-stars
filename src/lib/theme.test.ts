import {describe, expect, it} from 'vitest';
import {parseStoredTheme, parseThemePreference, resolveTheme} from './theme';

describe('theme preference recovery', () => {
    it('accepts each supported preference and discards unknown or outdated values', () => {
        for (const preference of ['light', 'dark', 'system'] as const) expect(parseThemePreference(preference)).toBe(preference);
        for (const invalid of [null, undefined, false, 3, {}, [], 'sepia', 'DARK']) expect(parseThemePreference(invalid)).toBe('system');
    });
    it('safely recovers missing, malformed, and structurally wrong persisted data', () => {
        expect(parseStoredTheme('"dark"')).toBe('dark');
        expect(parseStoredTheme('"light"')).toBe('light');
        for (const raw of [null, 'not-json', 'null', '{"theme":"dark"}', '["light"]', '"retired-theme"']) expect(parseStoredTheme(raw)).toBe('system');
    });
    it('follows the device only when system is selected', () => {
        expect(resolveTheme('system', true)).toBe('dark');
        expect(resolveTheme('system', false)).toBe('light');
        expect(resolveTheme('dark', false)).toBe('dark');
        expect(resolveTheme('light', true)).toBe('light');
    });
});
