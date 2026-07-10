import { User, Prisma } from '@prisma/client';
import prisma from '../lib/prisma';

export class UserRepository {
  /**
   * Create a new user record in the database
   */
  async create(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({ data });
  }

  /**
   * Find a user by their email address
   */
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * Find a user by their unique database ID
   */
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }
}

export const userRepository = new UserRepository();
export default userRepository;
