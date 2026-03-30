import { prisma } from '../../../../config/prisma'
import type {
  IRefreshTokensRepository,
  CreateRefreshTokenDTO,
  RefreshTokenDTO,
} from '../../repositories/IRefreshTokensRepository'

export class PrismaRefreshTokensRepository implements IRefreshTokensRepository {
  async create(data: CreateRefreshTokenDTO): Promise<RefreshTokenDTO> {
    return prisma.refreshToken.create({ data })
  }

  async findByToken(token: string): Promise<RefreshTokenDTO | null> {
    return prisma.refreshToken.findUnique({ where: { token } })
  }

  async deleteByToken(token: string): Promise<void> {
    await prisma.refreshToken.deleteMany({ where: { token } })
  }

  async deleteAllByUserId(userId: string): Promise<void> {
    await prisma.refreshToken.deleteMany({ where: { userId } })
  }
}
