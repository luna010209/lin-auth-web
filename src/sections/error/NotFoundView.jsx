import { useCallback } from "react";
import { ErrorComponent } from "../../components/error/ErrorComponent";
import { SimpleLayout } from "../../layouts/simple/Layout";
import { useTranslate } from "../../locales";

// ----------------------------------------------------------------------

export function NotFoundView({ href }) {
  const { t } = useTranslate('error');
  const n = useCallback(
    (key) => t(`notFound.${key}`), [t]
  );
  return (
    <SimpleLayout
      slotProps={{
        content: { compact: true },
      }}
      t={t}
    >
      <ErrorComponent
        href={href}
        n={n}
      />
    </SimpleLayout>
  );
}

export default NotFoundView;