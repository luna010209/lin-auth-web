import { z as zod } from 'zod';

export const createGoogleRegisterSchema = (c) =>
  zod
    .object({
      username: zod.string().min(3, { message: c('username') }),
      displayName: zod.string().optional(),
      password: zod.string().min(6, { message: c('password') }),
      cfPassword: zod.string().min(1, { message: c('cfPassword') }),
      phone: zod.string().optional(),
    })
    .refine((data) => data.password === data.cfPassword, {
      message: c('matchPw'),
      path: ['cfPassword'],
    });
