import { prisma } from '../../../../config/prisma'
import type {
  IPasswordTokensRepository,
  PasswordToken,
  PasswordTokenType,
} from '../../repositories/IPasswordTokensRepository'

export class PrismaPasswordTokensRepository implements IPasswordTokensRepository {
  async create(userId: string, token: string, expiresAt: Date, type: PasswordTokenType): Promise<void> {
    await prisma.passwordToken.create({
      data: { userId, token, expiresAt, type },
    })
  }

  async findByToken(token: string): Promise<PasswordToken | null> {
    return prisma.passwordToken.findUnique({ where: { token } })
  }

  async markAsUsed(token: string): Promise<boolean> {
    const { count } = await prisma.passwordToken.updateMany({
      where: { token, usedAt: null, expiresAt: { gt: new Date() } },
      data: { usedAt: new Date() },
    })
    return count > 0
  }

  async invalidatePreviousTokens(userId: string, type?: PasswordTokenType): Promise<void> {
    // Invalida expirando o token: `usedAt` fica reservado para tokens efetivamente consumidos
    await prisma.passwordToken.updateMany({
      where: {
        userId,
        type,
        usedAt: null,
      },
      data: {
        expiresAt: new Date(),
      },
    })
  }
}
