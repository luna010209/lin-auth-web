// ----------------------------------------------------------------------

export function getHttpErrorStatus(error) {
  return error?.response?.status ?? error?.status ?? null;
}

export function isForbiddenError(error) {
  if (getHttpErrorStatus(error) === 403) return true;

  const message = String(error?.message || '').toLowerCase();
  return (
    message.includes('permission') ||
    message.includes('not allowed') ||
    message.includes('forbidden')
  );
}
