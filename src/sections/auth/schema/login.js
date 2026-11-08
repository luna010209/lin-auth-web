import { z as zod } from 'zod';

export const createLoginSchema = (c) =>
  zod
    .object({
      username: zod.string().min(1, { message: c('loginUsername') }),
      password: zod.string().min(1, { message: c('loginPassword') }),
    });

export const createRecoverySchema = (c) =>
  zod.object({
    email: zod
      .string()
      .min(1, { message: c('email') }) // "Email is required" message key
      .email({ message: c('emailInvalid') }), // "Invalid email" message key
  });
