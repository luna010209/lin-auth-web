import { isEqual } from 'es-toolkit';
import { useMemo, useState, useCallback } from 'react';
import { useLocalStorage } from 'minimal-shared/hooks';
import { SETTINGS_STORAGE_KEY } from '../settingsConfig';
import { SettingsContext } from './settingsContext';

// ----------------------------------------------------------------------

// export const SettingsContext = createContext(undefined);

export function SettingsProvider({ children, defaultSettings, storageKey = SETTINGS_STORAGE_KEY }) {
  const { state, setState, resetState, setField } = useLocalStorage(storageKey, defaultSettings);

  const [openDrawer, setOpenDrawer] = useState(false);

  const onToggleDrawer = useCallback(() => {
    setOpenDrawer((prev) => !prev);
  }, []);

  const onCloseDrawer = useCallback(() => {
    document.activeElement?.blur();
    setOpenDrawer(false);
  }, []);

  const canReset = !isEqual(state, defaultSettings);

  const onReset = useCallback(() => {
    resetState(defaultSettings);
  }, [defaultSettings, resetState]);

  const memoizedValue = useMemo(
    () => ({
      canReset,
      onReset,
      openDrawer,
      onCloseDrawer,
      onToggleDrawer,
      state,
      setState,
      setField,
    }),
    [canReset, onReset, openDrawer, onCloseDrawer, onToggleDrawer, state, setField, setState]
  );

  return <SettingsContext.Provider value={memoizedValue}>{children}</SettingsContext.Provider>;
}
