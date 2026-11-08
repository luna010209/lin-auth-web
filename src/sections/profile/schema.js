import { z as zod } from 'zod';

export const createProfileAboutSchema = (c) =>
  zod.object({
    displayName: zod.string().min(1, { message: c('displayName') }),
    birthday: zod.string().optional(),
    gender: zod.string().optional(),
    hometown: zod.string().max(150).optional(),
    maritalStatus: zod.string().optional(),
    currentLocation: zod.string().max(255).optional(),
    showBirthday: zod.boolean(),
    showGender: zod.boolean(),
    showMaritalStatus: zod.boolean(),
    showHometown: zod.boolean(),
  });

export const createProfileAccountSchema = (c) =>
  zod.object({
    username: zod.string().min(3, { message: c('username') }),
    phone: zod.string().optional(),
  });
