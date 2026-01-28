import { createTheme, ThemeOptions } from '@mui/material/styles';

/**
 * MUI Theme Configuration for VibeNotes
 * Colors match the existing CSS custom properties from index.css
 */

// Light theme palette (matches :root in index.css)
const lightPalette = {
    primary: {
        main: '#4f46e5', // Indigo 600 - matches --primary: 239 84% 58%
        light: '#6366f1',
        dark: '#4338ca',
        contrastText: '#ffffff',
    },
    secondary: {
        main: '#f5f5f5', // matches --secondary
        light: '#fafafa',
        dark: '#e5e5e5',
        contrastText: '#111111',
    },
    error: {
        main: '#ef4444', // matches --destructive: 0 84% 60%
        light: '#f87171',
        dark: '#dc2626',
        contrastText: '#ffffff',
    },
    warning: {
        main: '#f59e0b',
        light: '#fbbf24',
        dark: '#d97706',
        contrastText: '#ffffff',
    },
    success: {
        main: '#10b981',
        light: '#34d399',
        dark: '#059669',
        contrastText: '#ffffff',
    },
    background: {
        default: '#fafafa', // matches --background: 0 0% 98%
        paper: '#ffffff', // matches --card: 0 0% 100%
    },
    text: {
        primary: '#111111', // matches --foreground: 0 0% 7%
        secondary: '#6b7280', // muted-foreground
    },
    divider: '#e5e5e5', // matches --border: 0 0% 89%
};

// Dark theme palette (matches .dark in index.css)
const darkPalette = {
    primary: {
        main: '#6366f1', // Indigo 500 - matches --primary: 239 84% 67%
        light: '#818cf8',
        dark: '#4f46e5',
        contrastText: '#ffffff',
    },
    secondary: {
        main: '#262626', // matches --secondary
        light: '#404040',
        dark: '#171717',
        contrastText: '#ffffff',
    },
    error: {
        main: '#7f1d1d', // matches --destructive in dark mode
        light: '#991b1b',
        dark: '#450a0a',
        contrastText: '#ffffff',
    },
    warning: {
        main: '#d97706',
        light: '#f59e0b',
        dark: '#b45309',
        contrastText: '#ffffff',
    },
    success: {
        main: '#059669',
        light: '#10b981',
        dark: '#047857',
        contrastText: '#ffffff',
    },
    background: {
        default: '#0f0f0f', // matches --background: 0 0% 6%
        paper: '#1c1c1c', // matches --card: 0 0% 11%
    },
    text: {
        primary: '#ffffff', // matches --foreground: 0 0% 100%
        secondary: '#a3a3a3', // muted-foreground
    },
    divider: '#2a2a2a', // matches --border: 0 0% 16%
};

// Base theme options shared between light and dark
const baseThemeOptions: ThemeOptions = {
    typography: {
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        fontSize: 14,
        h1: { fontWeight: 700, fontSize: '2.25rem' },
        h2: { fontWeight: 600, fontSize: '1.875rem' },
        h3: { fontWeight: 600, fontSize: '1.5rem' },
        h4: { fontWeight: 600, fontSize: '1.25rem' },
        h5: { fontWeight: 600, fontSize: '1.125rem' },
        h6: { fontWeight: 600, fontSize: '1rem' },
        button: { textTransform: 'none', fontWeight: 500 },
    },
    shape: {
        borderRadius: 8, // matches --radius: 0.5rem
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: '0.375rem',
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: 'none',
                    },
                },
                sizeSmall: {
                    padding: '0.25rem 0.5rem',
                    fontSize: '0.875rem',
                },
                sizeMedium: {
                    padding: '0.5rem 1rem',
                },
                sizeLarge: {
                    padding: '0.625rem 1.5rem',
                },
            },
            defaultProps: {
                disableElevation: true,
            },
        },
        MuiIconButton: {
            styleOverrides: {
                root: {
                    borderRadius: '0.375rem',
                },
                sizeSmall: {
                    padding: '0.25rem',
                },
            },
        },
        MuiTextField: {
            defaultProps: {
                variant: 'outlined',
                size: 'small',
            },
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: '0.375rem',
                    },
                },
            },
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    borderRadius: '0.375rem',
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: '0.5rem',
                    boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
                },
            },
        },
        MuiDialog: {
            styleOverrides: {
                paper: {
                    borderRadius: '0.5rem',
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: '9999px',
                },
                sizeSmall: {
                    height: '1.5rem',
                    fontSize: '0.75rem',
                },
            },
        },
        MuiLinearProgress: {
            styleOverrides: {
                root: {
                    borderRadius: '9999px',
                    height: '0.5rem',
                },
            },
        },
        MuiMenu: {
            styleOverrides: {
                paper: {
                    borderRadius: '0.375rem',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                },
            },
        },
        MuiPopover: {
            styleOverrides: {
                paper: {
                    borderRadius: '0.5rem',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                },
            },
        },
    },
};

// Create light theme
export const lightTheme = createTheme({
    ...baseThemeOptions,
    palette: {
        mode: 'light',
        ...lightPalette,
    },
});

// Create dark theme
export const darkTheme = createTheme({
    ...baseThemeOptions,
    palette: {
        mode: 'dark',
        ...darkPalette,
    },
    components: {
        ...baseThemeOptions.components,
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: '0.5rem',
                    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.3)',
                    border: '1px solid #2a2a2a',
                },
            },
        },
    },
});

// Export a function to get theme based on mode
export function getMuiTheme(mode: 'light' | 'dark') {
    return mode === 'dark' ? darkTheme : lightTheme;
}
