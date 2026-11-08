import { useCallback } from 'react';

import { PageDocumentTitle } from '../../components/documentTitle/PageDocumentTitle';
import { useTranslate } from '../../locales';
import NotFoundView from '../../sections/error/NotFoundView';
import { paths } from '../../routes/paths';

// ----------------------------------------------------------------------

export default function NotFound() {
  const { t } = useTranslate('error');
  const n = useCallback((key) => t(`notFound.${key}`), [t]);

  return (
    <>
      <PageDocumentTitle title={n('notFoundTitle')} />
      <NotFoundView href={paths.main.home} />
    </>
  );
}
