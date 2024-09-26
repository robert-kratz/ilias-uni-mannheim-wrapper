import { useEffect } from 'react';
import useRenderState from './useRenderState';

export default function useApplicationTheme(): void {
    const { appState } = useRenderState();

    const mode = appState.themeMode;

    useEffect(() => {
        const root = document.documentElement;

        const applyTheme = (theme: 'light' | 'dark') => {
            root.classList.remove('light', 'dark');
            root.classList.add(theme);
        };

        if (mode === 'system') {
            window.api.getSystemTheme().then((systemTheme) => {
                applyTheme(systemTheme as 'light' | 'dark');
            });

            const handleThemeChanged = (_event: any, systemTheme: 'light' | 'dark') => {
                applyTheme(systemTheme);
            };

            window.api.onThemeChanged(handleThemeChanged);

            return () => {
                window.api.removeThemeChangedListener(handleThemeChanged);
            };
        } else {
            applyTheme(mode);
        }
    }, [mode]);
}
