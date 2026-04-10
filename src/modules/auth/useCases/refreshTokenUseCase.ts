import { randomBytes } from 'crypto'
import { Errors } from '../../../core/errors'
import type { IUsersRepository } from '../repositories/IUsersRepository'
import type { IRefreshTokensRepository } from '../repositories/IRefreshTokensRepository'
const REFRESH_EXPIRES_DAYS = 7

interface RefreshTokenInput { refreshToken: string }
interface RefreshTokenOutput {
  user: { id: string; name: string; email: string; role: string; clinicId: string }
  refreshToken: string
}

export class RefreshTokenUseCase {
  constructor(
    private usersRepository: IUsersRepository,
    private refreshTokensRepository: IRefreshTokensRepository,
  ) {}

  async execute(input: RefreshTokenInput): Promise<RefreshTokenOutput> {
    const stored = await this.refreshTokensRepository.findByToken(input.refreshToken)
    if (!stored) throw Errors.unauthorized('Refresh token inválido')

    if (stored.expiresAt < new Date()) {
      await this.refreshTokensRepository.deleteByToken(input.refreshToken)
      throw Errors.unauthorized('Refresh token expirado')
    }

    const user = await this.usersRepository.findById(stored.userId)
    if (!user) {
      await this.refreshTokensRepository.deleteByToken(input.refreshToken)
      throw Errors.unauthorized('Usuário não encontrado')
    }

    await this.refreshTokensRepository.deleteByToken(input.refreshToken)
    const newToken = randomBytes(32).toString('hex')
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + REFRESH_EXPIRES_DAYS)
    await this.refreshTokensRepository.create({ token: newToken, userId: user.id, expiresAt })

    return {
      user: { id: user.id, name: user.name, email: user.email, role: user.role, clinicId: user.clinicId },
      refreshToken: newToken,
    }
  }
}
