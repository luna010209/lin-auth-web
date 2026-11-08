import { z as zod } from 'zod';

export const createSignUpSchema = (c) =>
  zod
    .object({
      username: zod.string().min(3, { message: c('username') }),
      email: zod.string().min(1, { message: c('email') }).email({ message: c('emailInvalid') }),
      verifyCode: zod.string().min(1, { message: c('verifyCode') }),
      nickname: zod.string().min(1, { message: c('nickname') }),
      phone: zod.string().min(1, { message: c('phone') }),
      password: zod.string().min(6, { message: c('password') }),
      cfPassword: zod.string().min(1, { message: c('cfPassword') }),
    })
    .refine((data) => data.password === data.cfPassword, {
      message: c('matchPw'),
      path: ['cfPassword'],
    });


export const createPasswordSchema = (c) =>
  zod
    .object({
      currentPassword: zod.string().min(6, { message: c('password') }),
      password: zod.string().min(6, { message: c('password') }),
      cfPassword: zod.string().min(1, { message: c('cfPassword') }),
    })
    .refine((data) => data.password === data.cfPassword, {
      message: c('matchPw'),
      path: ['cfPassword'],
    });


export const createEmailSchema = (c) =>
  zod
    .object({
      email: zod.string().min(1, { message: c('email') }).email({ message: c('emailInvalid') }),
      verifyCode: zod.string().min(1, { message: c('verifyCode') }),
    });

export const createInfoSchema = (c) =>
  zod.object({
    username: zod.string().min(3, { message: c('username') }),
    displayName: zod.string().optional(),
    phone: zod.string().optional(),
  });
