import { useCallback } from 'react';

import { PageDocumentTitle } from '../../components/documentTitle/PageDocumentTitle';
import { useTranslate } from '../../locales';
import NotAllowedView from '../../sections/error/NotAllowedView';
import { paths } from '../../routes/paths';

// ----------------------------------------------------------------------

export default function NotAllowed() {
  const { t } = useTranslate('error');
  const n = useCallback((key) => t(`notAllowed.${key}`), [t]);

  return (
    <>
      <PageDocumentTitle title={n('notAllowedTitle')} />
      <NotAllowedView href={paths.main.home} />
    </>
  );
}
