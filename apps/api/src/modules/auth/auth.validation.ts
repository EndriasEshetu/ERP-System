import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

/**
 * Strong password pattern:
 * Minimum 8 characters, at least one uppercase letter, one lowercase letter, and one number.
 */
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;

export const registerSchema = z.object({
  name: z
    .string({ message: 'Name is required' })
    .trim()
    .min(2, { message: 'Name must be at least 2 characters long' })
    .max(100, { message: 'Name must not exceed 100 characters' }),
  email: z
    .string({ message: 'Email is required' })
    .trim()
    .toLowerCase()
    .email({ message: 'Invalid email address format' })
    .max(255, { message: 'Email must not exceed 255 characters' }),
  password: z
    .string({ message: 'Password is required' })
    .min(8, { message: 'Password must be at least 8 characters long' })
    .max(128, { message: 'Password must not exceed 128 characters' })
    .regex(PASSWORD_REGEX, {
      message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    }),
});

export const loginSchema = z.object({
  email: z
    .string({ message: 'Email is required' })
    .trim()
    .toLowerCase()
    .email({ message: 'Invalid email address format' }),
  password: z
    .string({ message: 'Password is required' })
    .min(1, { message: 'Password is required' }),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Express middleware factory to validate incoming request body against a Zod schema.
 */
export function validateBody<T extends z.ZodTypeAny>(schema: T) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      next(error);
    }
  };
}
