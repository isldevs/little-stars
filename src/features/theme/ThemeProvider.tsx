import type {ReactNode} from 'react';
import {createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useState} from 'react';
import type {ResolvedTheme, ThemePreference} from '../../lib/theme';
import {
    applyTheme,
    parseStoredTheme,
    parseThemePreference,
    readSystemDark,
    readThemePreference,
    resolveTheme,
    THEME_STORAGE_KEY
} from '../../lib/theme';

interface ThemeContextValue {
    theme: ThemePreference;
    resolvedTheme: ResolvedTheme;
    setTheme: (theme: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({children}: { children: ReactNode }) {
    const [theme, updateTheme] = useState<ThemePreference>(readThemePreference);
    const [systemDark, setSystemDark] = useState(readSystemDark);
    const resolvedTheme = resolveTheme(theme, systemDark);
    const setTheme = useCallback((next: ThemePreference) => {
        const preference = parseThemePreference(next);
        updateTheme(preference);
        try {
            window.localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(preference));
        } catch {/* Keep the preference usable in this session when storage is unavailable. */
        }
    }, []);

    useLayoutEffect(() => {
        applyTheme(resolvedTheme);
    }, [resolvedTheme]);
    useEffect(() => {
        if (typeof window.matchMedia !== 'function') return;
        const media = window.matchMedia('(prefers-color-scheme: dark)');
        const changed = (event: MediaQueryListEvent) => setSystemDark(event.matches);
        setSystemDark(media.matches);
        if (typeof media.addEventListener === 'function') media.addEventListener('change', changed);
        else media.addListener(changed);
        return () => {
            if (typeof media.removeEventListener === 'function') media.removeEventListener('change', changed); else media.removeListener(changed);
        };
    }, []);
    useEffect(() => {
        const sync = (event: StorageEvent) => {
            if (event.key === null) updateTheme('system');
            else if (event.key === THEME_STORAGE_KEY) updateTheme(parseStoredTheme(event.newValue));
        };
        window.addEventListener('storage', sync);
        return () => window.removeEventListener('storage', sync);
    }, []);

    const value = useMemo(() => ({theme, resolvedTheme, setTheme}), [theme, resolvedTheme, setTheme]);
    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
    const context = useContext(ThemeContext);
    if (!context) throw new Error('useTheme must be used within ThemeProvider');
    return context;
}
