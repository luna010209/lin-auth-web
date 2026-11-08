import { useCallback } from 'react';

import { PageDocumentTitle } from '../../components/documentTitle/PageDocumentTitle';
import { useTranslate } from '../../locales';
import SignUpView from '../../sections/auth/SignUpView';

// ----------------------------------------------------------------------

export default function SignUp() {
  const { t } = useTranslate('auth');
  const l = useCallback((key) => t(`label.${key}`), [t]);

  return (
    <>
      <PageDocumentTitle title={l('signUpTitle')} />
      <SignUpView />
    </>
  );
}
