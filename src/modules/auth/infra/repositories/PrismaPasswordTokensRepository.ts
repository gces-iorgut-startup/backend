import { prisma } from '../../../../config/prisma'
import { IPasswordTokensRepository, PasswordToken } from '../../repositories/IPasswordTokensRepository'

export class PrismaPasswordTokensRepository implements IPasswordTokensRepository {
  async create(userId: string, token: string, expiresAt: Date): Promise<void> {
    await prisma.passwordToken.create({
      data: { userId, token, expiresAt }
    })
  }

  async findByToken(token: string): Promise<PasswordToken | null> {
    return prisma.passwordToken.findUnique({ where: { token } })
  }

  async markAsUsed(token: string): Promise<void> {
    await prisma.passwordToken.update({
      where: { token },
      data: { usedAt: new Date() }
    })
  }

  async invalidatePreviousTokens(userId: string): Promise<void> {
    await prisma.passwordToken.updateMany({
      where: {
        userId,
        usedAt: null,
      },
      data: {
        usedAt: new Date(),
      },
    })
  }
}