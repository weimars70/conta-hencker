import { ref, watch } from 'vue';
import { useQuasar, setCssVar } from 'quasar';

const theme = ref('light'); // Default theme

const themes = {
  light: {
    primary: '#1976D2',
    secondary: '#26A69A',
    accent: '#9C27B0',
    dark: '#1D1D1D',
    positive: '#21BA45',
    negative: '#C10015',
    info: '#31CCEC',
    warning: '#F2C037',
  },
  dark: {
    primary: '#64B5F6',
    secondary: '#80CBC4',
    accent: '#BA68C8',
    dark: '#121212',
    positive: '#81C784',
    negative: '#E57373',
    info: '#4FC3F7',
    warning: '#FFD54F',
    // Colores específicos para el drawer en tema oscuro
    'background-drawer': 'linear-gradient(180deg, #2c3e50 0%, #34495e 100%)',
    'background-drawer-header': 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
    'text-on-drawer': '#ECF0F1',
    'border-drawer': 'rgba(255,255,255,0.05)',
    'logo-avatar-background': 'linear-gradient(135deg, #f39c12, #e67e22)',
    'logo-avatar-shadow': '0 4px 12px rgba(0,0,0,0.3)',
    'logo-text-shadow': '0 1px 2px rgba(0,0,0,0.4)',
    'search-input-background': 'rgba(255,255,255,0.05)',
    'search-input-border': 'rgba(255,255,255,0.1)',
    'search-input-hover-background': 'rgba(255,255,255,0.08)',
    'search-input-hover-border': 'rgba(255,255,255,0.15)',
    'search-input-text': '#BBDEFB',
    'search-input-placeholder': 'rgba(255,255,255,0.5)',
    'no-results-text': 'rgba(255,255,255,0.5)',
    'menu-item-hover-background': 'rgba(255,255,255,0.08)',
    'menu-item-active-background': 'rgba(255,255,255,0.15)',
    'menu-item-active-shadow': '0 2px 8px rgba(0,0,0,0.2)',
    'menu-item-active-icon': '#FFEB3B',
    'menu-icon': '#90CAF9',
    'menu-label': '#BBDEFB',
    'child-icon': '#64B5F6',
    'child-label': '#90CAF9',
    'menu-expansion-item-hover-background': 'rgba(255,255,255,0.08)',
    'menu-expansion-icon': '#90CAF9',
    'menu-expansion-label': '#BBDEFB',
    'sync-separator': 'rgba(255,255,255,0.1)',
    'sync-item-hover-background': 'rgba(255,255,255,0.08)',
    'sync-icon': '#80DEEA',
    'sync-label': '#BBDEFB',
  },
  ocean: {
    primary: '#00BCD4',
    secondary: '#4DD0E1',
    accent: '#80DEEA',
    dark: '#263238',
    positive: '#A5D6A7',
    negative: '#EF9A9A',
    info: '#81D4FA',
    warning: '#FFEB3B',
    // Colores específicos para el drawer en tema ocean
    'background-drawer': 'linear-gradient(180deg, #00BCD4 0%, #0097A7 100%)',
    'background-drawer-header': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
    'text-on-drawer': '#E0F7FA',
    'border-drawer': 'rgba(255,255,255,0.1)',
    'logo-avatar-background': 'linear-gradient(135deg, #80DEEA, #4DD0E1)',
    'logo-avatar-shadow': '0 4px 12px rgba(0,0,0,0.2)',
    'logo-text-shadow': '0 1px 2px rgba(0,0,0,0.3)',
    'search-input-background': 'rgba(255,255,255,0.1)',
    'search-input-border': 'rgba(255,255,255,0.2)',
    'search-input-hover-background': 'rgba(255,255,255,0.15)',
    'search-input-hover-border': 'rgba(255,255,255,0.3)',
    'search-input-text': '#E0F7FA',
    'search-input-placeholder': 'rgba(255,255,255,0.7)',
    'no-results-text': 'rgba(255,255,255,0.6)',
    'menu-item-hover-background': 'rgba(255,255,255,0.1)',
    'menu-item-active-background': 'rgba(255,255,255,0.2)',
    'menu-item-active-shadow': '0 2px 8px rgba(0,0,0,0.1)',
    'menu-item-active-icon': '#FFD700',
    'menu-icon': '#80DEEA',
    'menu-label': '#E0F7FA',
    'child-icon': '#4DD0E1',
    'child-label': '#B2EBF2',
    'menu-expansion-item-hover-background': 'rgba(255,255,255,0.1)',
    'menu-expansion-icon': '#80DEEA',
    'menu-expansion-label': '#E0F7FA',
    'sync-separator': 'rgba(255,255,255,0.2)',
    'sync-item-hover-background': 'rgba(255,255,255,0.1)',
    'sync-icon': '#B2EBF2',
    'sync-label': '#E0F7FA',
  },
  sunset: {
    primary: '#FF5722',
    secondary: '#FFAB40',
    accent: '#FFCC80',
    dark: '#3E2723',
    positive: '#C5E1A5',
    negative: '#FFCDD2',
    info: '#B3E5FF',
    warning: '#FFECB3',
    // Colores específicos para el drawer en tema sunset
    'background-drawer': 'linear-gradient(180deg, #FF5722 0%, #E64A19 100%)',
    'background-drawer-header': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
    'text-on-drawer': '#FFF3E0',
    'border-drawer': 'rgba(255,255,255,0.1)',
    'logo-avatar-background': 'linear-gradient(135deg, #FFCC80, #FFAB40)',
    'logo-avatar-shadow': '0 4px 12px rgba(0,0,0,0.2)',
    'logo-text-shadow': '0 1px 2px rgba(0,0,0,0.3)',
    'search-input-background': 'rgba(255,255,255,0.1)',
    'search-input-border': 'rgba(255,255,255,0.2)',
    'search-input-hover-background': 'rgba(255,255,255,0.15)',
    'search-input-hover-border': 'rgba(255,255,255,0.3)',
    'search-input-text': '#FFF3E0',
    'search-input-placeholder': 'rgba(255,255,255,0.7)',
    'no-results-text': 'rgba(255,255,255,0.6)',
    'menu-item-hover-background': 'rgba(255,255,255,0.1)',
    'menu-item-active-background': 'rgba(255,255,255,0.2)',
    'menu-item-active-shadow': '0 2px 8px rgba(0,0,0,0.1)',
    'menu-item-active-icon': '#FFD700',
    'menu-icon': '#FFCC80',
    'menu-label': '#FFF3E0',
    'child-icon': '#FFAB40',
    'child-label': '#FFECB3',
    'menu-expansion-item-hover-background': 'rgba(255,255,255,0.1)',
    'menu-expansion-icon': '#FFCC80',
    'menu-expansion-label': '#FFF3E0',
    'sync-separator': 'rgba(255,255,255,0.2)',
    'sync-item-hover-background': 'rgba(255,255,255,0.1)',
    'sync-icon': '#FFECB3',
    'sync-label': '#FFF3E0',
  },
};

export function useTheme() {
  const $q = useQuasar();

  // Load theme from local storage on initial load
  const storedTheme = localStorage.getItem('app-theme');
  if (storedTheme && themes[storedTheme]) {
    theme.value = storedTheme;
  } else {
    theme.value = 'light'; // Fallback to light if stored theme is invalid
  }

  const applyThemeColors = (themeName: string) => {
    const selectedTheme = themes[themeName];
    if (selectedTheme) {
      for (const colorName in selectedTheme) {
        setCssVar(colorName, selectedTheme[colorName]);
      }
    }
  };

  // Apply theme to Quasar and update local storage
  watch(theme, (newTheme) => {
    $q.dark.set(newTheme === 'dark');
    applyThemeColors(newTheme);
    localStorage.setItem('app-theme', newTheme);
  }, { immediate: true });

  const toggleTheme = () => {
    // This function might need to be re-evaluated if we move to multiple themes
    // For now, it will just toggle between 'light' and 'dark' as a fallback
    theme.value = theme.value === 'light' ? 'dark' : 'light';
  };

  const setTheme = (newTheme: string) => {
    if (themes[newTheme]) {
      theme.value = newTheme;
    } else if (newTheme === 'system') {
      // Handle system theme logic if needed, for now fallback to light/dark
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      theme.value = prefersDark ? 'dark' : 'light';
    } else {
      console.warn(`Theme '${newTheme}' not found. Falling back to 'light'.`);
      theme.value = 'light';
    }
  };

  return {
    theme,
    themes,
    toggleTheme,
    setTheme,
  };
}