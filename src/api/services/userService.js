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
    displayName: data.displayName ?? data.nickname,
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

export function buildChangeInfoRequest({ username, email, displayName, phone }) {
  const normalizedUsername = String(username || '').trim();
  const normalizedEmail = String(email || '').trim();

  if (!normalizedUsername) {
    throw new Error('username is required');
  }

  if (!normalizedEmail) {
    throw new Error('email is required');
  }

  const normalizedDisplayName =
    displayName == null || String(displayName).trim() === '' ? null : String(displayName).trim();

  const normalizedPhone =
    phone == null || String(phone).trim() === '' ? null : String(phone).trim();

  return {
    username: normalizedUsername,
    email: normalizedEmail,
    displayName: normalizedDisplayName,
    phone: normalizedPhone,
  };
}

export function buildBasicInfoUpdateRequest({ username, email, displayName, phone }) {
  const normalizedUsername = String(username || '').trim();
  const storedEmail = email == null ? '' : String(email);

  if (!normalizedUsername) {
    throw new Error('username is required');
  }

  if (!storedEmail) {
    throw new Error('email is required');
  }

  const normalizedDisplayName =
    displayName == null || String(displayName).trim() === '' ? null : String(displayName).trim();

  const normalizedPhone =
    phone == null || String(phone).trim() === '' ? null : String(phone).trim();

  return {
    username: normalizedUsername,
    email: storedEmail,
    displayName: normalizedDisplayName,
    phone: normalizedPhone,
  };
}

export const updateUserInfo = async (data) => {
  await authPrivateApi.put('/auth', buildChangeInfoRequest(data));
};

export const updateUserBasicInfo = async (data) => {
  await authPrivateApi.put('/auth', buildBasicInfoUpdateRequest(data));
};

export const changePassword = async (data) => {
  await authPrivateApi.put('/auth/change-password', data);
};

export const changeAvatar = async (formData) => {
  await authPrivateApi.post('/auth/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
