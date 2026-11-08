import { Helmet } from 'react-helmet-async';

import { formatPageDocumentTitle } from '../../utils/documentTitle';

/** Sets `<title>` for the current route (`Page title | App name`). */
export function PageDocumentTitle({ title }) {
  return (
    <Helmet>
      <title>{formatPageDocumentTitle(title)}</title>
    </Helmet>
  );
}
