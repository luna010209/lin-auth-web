import { createContext, useCallback, useContext, useMemo, useState } from 'react';

// ----------------------------------------------------------------------

const PageHeaderContext = createContext(null);

const EMPTY_HEADER = {
  title: '',
  subtitle: '',
  breadcrumb: [],
};

export function PageHeaderProvider({ children }) {
  const [pageHeader, setPageHeaderState] = useState(EMPTY_HEADER);

  const setPageHeader = useCallback((next) => {
    setPageHeaderState({
      title: next?.title ?? '',
      subtitle: next?.subtitle ?? '',
      breadcrumb: next?.breadcrumb ?? [],
    });
  }, []);

  const clearPageHeader = useCallback(() => {
    setPageHeaderState(EMPTY_HEADER);
  }, []);

  const value = useMemo(
    () => ({ pageHeader, setPageHeader, clearPageHeader }),
    [pageHeader, setPageHeader, clearPageHeader]
  );

  return <PageHeaderContext.Provider value={value}>{children}</PageHeaderContext.Provider>;
}

export function usePageHeader() {
  const context = useContext(PageHeaderContext);

  if (!context) {
    throw new Error('usePageHeader must be used within PageHeaderProvider');
  }

  return context;
}
