import { authPrivateApi, authPublicApi, unwrapApiData } from '../axios';

// ======================================================
// 📧 EMAIL VERIFICATION — lin-auth-api
// ======================================================

export const sendVerificationCode = async (email) => {
  await authPublicApi.post('/auth/email-verification/send-mail', null, {
    params: { email },
  });
};

export const verifyEmailCode = async (email, verifiedCode) => {
  await authPublicApi.post('/auth/email-verification/verify', {
    email,
    verifiedCode,
  });
};

// ======================================================
// 🌐 WEB AUTH — lin-auth-api
// ======================================================

export function buildSignUpRequest(data) {
  return {
    username: data.username,
    email: data.email,
    phone: data.phone,
    password: data.password,
    cfPassword: data.cfPassword,
  };
}

export const signUp = async (data) => {
  await authPublicApi.post('/auth/sign-up', buildSignUpRequest(data));
};

export const login = async (username, password) => {
  const response = await authPublicApi.post('/auth/login', {
    username,
    password,
  });
  return response.data;
};

export const findUsername = async (email) => {
  await authPublicApi.post('/auth/find-username', null, {
    params: { email },
  });
};

export const findPassword = async (email) => {
  await authPublicApi.post('/auth/find-password', null, {
    params: { email },
  });
};

// ======================================================
// 📱 APP AUTH (FIREBASE) — lin-auth-api
// ======================================================

const firebaseAuthHeaders = (idToken) => ({
  Authorization: `Bearer ${idToken}`,
});

export const appLoginCheck = async (idToken) =>
  unwrapApiData(
    await authPublicApi.post('/auth/app', null, {
      headers: firebaseAuthHeaders(idToken),
    })
  );

export const appRegister = async (idToken, data) =>
  unwrapApiData(
    await authPublicApi.post('/auth/app/register', data, {
      headers: firebaseAuthHeaders(idToken),
    })
  );

// ======================================================
// 👤 SESSION USER — lin-auth-api
// ======================================================

/** Session user from lin-auth-api GET /profile */
export const getCurrentUser = async () => {
  const response = await authPrivateApi.get('/profile');
  const user = response.data;

  if (!user?.id && !user?.username) {
    throw new Error('Failed to load user profile');
  }

  return user;
};

// ======================================================
// ✏️ PROFILE — lin-auth-api
// ======================================================

export function buildAccountUpdateRequest({ username, email, phone }) {
  const normalizedUsername = String(username || '').trim();
  const normalizedEmail = String(email || '').trim();

  if (!normalizedUsername) {
    throw new Error('username is required');
  }

  if (!normalizedEmail) {
    throw new Error('email is required');
  }

  const normalizedPhone =
    phone == null || String(phone).trim() === '' ? null : String(phone).trim();

  return {
    username: normalizedUsername,
    email: normalizedEmail,
    phone: normalizedPhone,
  };
}

/** @deprecated Use buildAccountUpdateRequest — account PUT does not accept displayName. */
export function buildChangeInfoRequest(params) {
  return buildAccountUpdateRequest(params);
}

/** @deprecated Use buildAccountUpdateRequest */
export function buildBasicInfoUpdateRequest(params) {
  return buildAccountUpdateRequest(params);
}

export const updateAccountInfo = async (data) => {
  await authPrivateApi.put('/auth', buildAccountUpdateRequest(data));
};

export const updateUserInfo = async (data) => {
  await authPrivateApi.put('/auth', buildAccountUpdateRequest(data));
};

/** @deprecated Use updateAccountInfo */
export const updateUserBasicInfo = async (data) => {
  await updateAccountInfo(data);
};

const GENDER_VALUES = new Set(['MALE', 'FEMALE', 'NON_BINARY', 'OTHER']);
const MARITAL_VALUES = new Set(['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED', 'PARTNERED']);

function normalizeEnum(value, allowed) {
  if (value == null || String(value).trim() === '') return null;
  const upper = String(value).trim().toUpperCase();
  return allowed.has(upper) ? upper : null;
}

function normalizeBirthday(birthday) {
  if (birthday == null || String(birthday).trim() === '') return null;
  const raw = String(birthday).trim();
  if (raw.includes('T')) return raw;
  return `${raw}T00:00:00`;
}

export function buildUpdateBasicProfileRequest({
  displayName,
  birthday,
  gender,
  hometown,
  maritalStatus,
  currentLocation,
  showBirthday,
  showGender,
  showMaritalStatus,
  showHometown,
}) {
  const body = {};

  if (displayName !== undefined) {
    body.displayName =
      displayName == null || String(displayName).trim() === ''
        ? null
        : String(displayName).trim();
  }

  if (birthday !== undefined) {
    body.birthday = normalizeBirthday(birthday);
  }

  if (gender !== undefined) {
    body.gender = normalizeEnum(gender, GENDER_VALUES);
  }

  if (hometown !== undefined) {
    body.hometown =
      hometown == null || String(hometown).trim() === '' ? null : String(hometown).trim();
  }

  if (maritalStatus !== undefined) {
    body.maritalStatus = normalizeEnum(maritalStatus, MARITAL_VALUES);
  }

  if (currentLocation !== undefined) {
    body.currentLocation =
      currentLocation == null || String(currentLocation).trim() === ''
        ? null
        : String(currentLocation).trim();
  }

  if (showBirthday !== undefined) body.showBirthday = !!showBirthday;
  if (showGender !== undefined) body.showGender = !!showGender;
  if (showMaritalStatus !== undefined) body.showMaritalStatus = !!showMaritalStatus;
  if (showHometown !== undefined) body.showHometown = !!showHometown;

  return body;
}

export const updateBasicProfile = async (data) => {
  await authPrivateApi.put('/profile', buildUpdateBasicProfileRequest(data));
};

export const changePassword = async (data) => {
  await authPrivateApi.put('/auth/change-password', data);
};

export const changeAvatar = async (formData) => {
  await authPrivateApi.post('/auth/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
