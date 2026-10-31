/** Versioned, validated local demo persistence. Never stores passwords or payment data. */
const PREFIX = 'little-stars:v1:';

export function readStored<T>(key: string, fallback: T, valid: (value: unknown) => value is T): T {
    try {
        const raw = localStorage.getItem(PREFIX + key);
        if (raw === null) return fallback;
        const data: unknown = JSON.parse(raw);
        return valid(data) ? data : fallback;
    } catch {
        return fallback;
    }
}

export function writeStored(key: string, value: unknown): void {
    try {
        localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch { /* Storage can be disabled or full; current-session state still works. */
    }
}

export function removeStored(key: string): void {
    try {
        localStorage.removeItem(PREFIX + key);
    } catch { /* Unavailable browser storage. */
    }
}

export function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isStringArray(value: unknown): value is string[] {
    return Array.isArray(value) && value.every(x => typeof x === 'string');
}

export const storagePrefix = PREFIX;
