import { useCallback } from "react";
import { ErrorComponent } from "../../components/error/ErrorComponent";
import { SimpleLayout } from "../../layouts/simple/Layout";
import { useTranslate } from "../../locales";
import ForbiddenIllustration from "../../assets/illustrations/ForbiddenIllustration";

// ----------------------------------------------------------------------

export function NotAllowedView({ href }) {
  const { t } = useTranslate('error');
  const n = useCallback(
    (key) => t(`notAllowed.${key}`), [t]
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
        illustration={ForbiddenIllustration}
      />
    </SimpleLayout>
  );
}

export default NotAllowedView;