import { useCallback } from 'react';

import { PageDocumentTitle } from '../../components/documentTitle/PageDocumentTitle';
import { useTranslate } from '../../locales';
import LoginView from '../../sections/auth/LoginView';

// ----------------------------------------------------------------------

export default function Login() {
  const { t } = useTranslate('auth');
  const l = useCallback((key) => t(`label.${key}`), [t]);

  return (
    <>
      <PageDocumentTitle title={l('loginTitle')} />
      <LoginView />
    </>
  );
}
