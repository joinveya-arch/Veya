import { z } from 'zod';
import { Role } from '@prisma/client';

/**
 * Zod validation schema for user registration payloads
 */
export const registerSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .trim()
    .min(2, 'Name must be at least 2 characters long'),
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .email('Invalid email format'),
  password: z
    .string({ required_error: 'Password is required' })
    .min(6, 'Password must be at least 6 characters long'),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format (e.g. +1234567890)')
    .optional()
    .or(z.literal(''))
    .transform((val) => (val === '' ? undefined : val)),
  role: z
    .nativeEnum(Role, { errorMap: () => ({ message: 'Role must be CUSTOMER, ARTIST, or ADMIN' }) })
    .default(Role.CUSTOMER),
});

/**
 * Zod validation schema for login payloads
 */
export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .email('Invalid email format'),
  password: z
    .string({ required_error: 'Password is required' })
    .min(1, 'Password is required'),
});
