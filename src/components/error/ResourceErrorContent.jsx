import ForbiddenIllustration from '../../assets/illustrations/ForbiddenIllustration';
import { ErrorComponent } from './ErrorComponent';

// ----------------------------------------------------------------------

export function ResourceErrorContent({
  forbidden = false,
  staleSession = false,
  notFoundTitle,
  notFoundButtonText,
  href,
  forbiddenLabels,
  staleSessionLabels,
  onStaleSessionAction,
}) {
  if (staleSession) {
    return (
      <ErrorComponent
        href={href}
        n={staleSessionLabels}
        onAction={onStaleSessionAction}
        illustration={ForbiddenIllustration}
      />
    );
  }

  if (forbidden) {
    return (
      <ErrorComponent
        href={href}
        n={forbiddenLabels}
        illustration={ForbiddenIllustration}
      />
    );
  }

  return (
    <ErrorComponent
      title={notFoundTitle}
      description=""
      buttonText={notFoundButtonText}
      href={href}
    />
  );
}
