import { paths } from '../routes/paths';

// ----------------------------------------------------------------------

/** True when the user should finish basic profile (display name). */
export function isProfileIncomplete(user) {
  if (!user) return false;
  const name = user.displayName;
  return name == null || String(name).trim() === '';
}

/** Post-login destination: profile onboarding or the requested return path. */
export function resolvePostLoginPath(user, returnTo) {
  if (isProfileIncomplete(user)) {
    return `${paths.profile.root}?onboarding=1`;
  }
  return returnTo;
}

export function parseBirthdayForForm(birthday) {
  if (!birthday) return '';
  const value = String(birthday);
  return value.length >= 10 ? value.slice(0, 10) : value;
}
