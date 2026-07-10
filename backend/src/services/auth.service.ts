import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '@prisma/client';
import userRepository from '../repositories/user.repository';
import { registerSchema, loginSchema } from '../validators/auth.validator';
import { z } from 'zod';
import config from '../config';
import { ConflictError, UnauthorizedError, NotFoundError } from '../utils/customErrors';

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

export interface AuthResponse {
  token: string;
  user: Omit<User, 'password'>;
}

export class AuthService {
  /**
   * Register a new user in the system
   */
  async register(input: RegisterInput): Promise<Omit<User, 'password'>> {
    // 1. Check if user already exists
    const existingUser = await userRepository.findByEmail(input.email);
    if (existingUser) {
      throw new ConflictError('A user with this email address already exists');
    }

    // 2. Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(input.password, saltRounds);

    // 3. Persist user to database
    const user = await userRepository.create({
      name: input.name,
      email: input.email,
      password: hashedPassword,
      phone: input.phone,
      role: input.role,
    });

    // 4. Return user object without password
    return this.sanitizeUser(user);
  }

  /**
   * Log in an existing user and return a JWT access token
   */
  async login(input: LoginInput): Promise<AuthResponse> {
    // 1. Find user by email
    const user = await userRepository.findByEmail(input.email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // 2. Compare passwords
    const isPasswordValid = await bcrypt.compare(input.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // 3. Generate JWT Token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      config.JWT_SECRET,
      {
        expiresIn: config.JWT_EXPIRES_IN as any,
      }
    );

    // 4. Return token and sanitized user details
    return {
      token,
      user: this.sanitizeUser(user),
    };
  }

  /**
   * Retrieve details of currently logged-in user
   */
  async getCurrentUser(id: string): Promise<Omit<User, 'password'>> {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new NotFoundError('User profile not found');
    }

    return this.sanitizeUser(user);
  }

  /**
   * Helper function to omit sensitive attributes (like passwords) from user records
   */
  private sanitizeUser(user: User): Omit<User, 'password'> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...sanitized } = user;
    return sanitized;
  }
}

export const authService = new AuthService();
export default authService;
