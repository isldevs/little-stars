export type ThemePreference = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';
export const THEME_STORAGE_KEY = 'little-stars:v1:theme';
export const THEME_COLORS: Record<ResolvedTheme,string> = {light:'#fcfbf8',dark:'#1b211d'};

export function parseThemePreference(value:unknown):ThemePreference {
  return value==='light'||value==='dark'||value==='system'?value:'system';
}
export function parseStoredTheme(raw:string|null):ThemePreference {
  if(raw===null)return 'system';
  try{return parseThemePreference(JSON.parse(raw));}catch{return 'system';}
}
export function resolveTheme(theme:ThemePreference,systemDark:boolean):ResolvedTheme {
  return theme==='system'?(systemDark?'dark':'light'):theme;
}
export function readThemePreference():ThemePreference {
  try{return parseStoredTheme(window.localStorage.getItem(THEME_STORAGE_KEY));}catch{return 'system';}
}
export function readSystemDark():boolean {
  return typeof window.matchMedia==='function'&&window.matchMedia('(prefers-color-scheme: dark)').matches;
}
export function applyTheme(theme:ResolvedTheme):void {
  document.documentElement.dataset.theme=theme;
  document.documentElement.style.colorScheme=theme;
  document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')?.setAttribute('content',THEME_COLORS[theme]);
}
