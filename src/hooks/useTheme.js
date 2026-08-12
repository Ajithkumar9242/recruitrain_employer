import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectTheme, setTheme } from '../store/slices/uiSlice';

export const useTheme = () => {
  const dispatch = useDispatch();
  const themePreference = useSelector(selectTheme);

  useEffect(() => {
    const root = document.documentElement;

    const applyTheme = (mode) => {
      if (mode === 'dark') {
        root.setAttribute('data-theme', 'dark');
      } else if (mode === 'light') {
        root.setAttribute('data-theme', 'light');
      } else if (mode === 'system') {
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.setAttribute('data-theme', systemPrefersDark ? 'dark' : 'light');
      }
    };

    applyTheme(themePreference);

    // Listen for system theme changes if set to system
    if (themePreference === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e) => {
        root.setAttribute('data-theme', e.matches ? 'dark' : 'light');
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [themePreference]);

  const changeTheme = (newMode) => {
    dispatch(setTheme(newMode));
  };

  const isDarkMode =
    themePreference === 'dark' ||
    (themePreference === 'system' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  return {
    themePreference,
    changeTheme,
    isDarkMode,
  };
};
