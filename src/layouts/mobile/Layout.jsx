import { useCallback } from 'react';

import { MobileContent } from './Contents';
import { MainSection, LayoutSection } from '../core';

// ----------------------------------------------------------------------

export function MobileLayout({ sx, cssVars, children, slotProps, layoutQuery = 'md' }) {
  const renderMain = useCallback(() => {
    const { compact, ...restContentProps } = slotProps?.content ?? {};

    return (
      <MainSection {...slotProps?.main}>
        {compact ? (
          <MobileContent layoutQuery={layoutQuery} {...restContentProps}>
            {children}
          </MobileContent>
        ) : (
          children
        )}
      </MainSection>
    );
  }, [layoutQuery, slotProps?.content, slotProps?.main, children]);

  return (
    <LayoutSection
      cssVars={{ '--layout-simple-content-compact-width': '448px', ...cssVars }}
      sx={sx}
    >
      {renderMain()}
    </LayoutSection>
  );
}
