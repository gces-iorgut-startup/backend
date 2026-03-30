import { prisma } from '../../../../config/prisma'
import type { IUsersRepository, CreateUserDTO } from '../../repositories/IUsersRepository'
import type { User } from '@prisma/client'

export class PrismaUsersRepository implements IUsersRepository {
  async create(data: CreateUserDTO): Promise<User> {
    return prisma.user.create({ data })
  }

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } })
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } })
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await prisma.user.count({ where: { email } })
    return count > 0
  }
}
