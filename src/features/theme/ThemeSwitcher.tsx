import {useId} from 'react';
import {Monitor, Moon, Sun} from 'lucide-react';
import {useTheme} from './ThemeProvider';
import type {ThemePreference} from '../../lib/theme';
import './theme-switcher.css';

export function ThemeSwitcher({className = ''}: { className?: string }) {
    const {theme, setTheme} = useTheme();
    const id = useId();
    const Icon = theme === 'system' ? Monitor : theme === 'dark' ? Moon : Sun;
    return <div className={`theme-control ${className}`}><Icon size={16} strokeWidth={1.5} aria-hidden="true"/><label
        className="sr-only" htmlFor={id}>Color theme</label><select aria-label="Color theme" id={id}
                                                                    className="theme-select" value={theme}
                                                                    onChange={e => setTheme(e.target.value as ThemePreference)}>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="system">System</option>
    </select></div>;
}
