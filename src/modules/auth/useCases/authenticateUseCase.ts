import { randomBytes } from 'crypto'
import { Errors } from '../../../core/errors'
import type { IUsersRepository } from '../repositories/IUsersRepository'
import type { IRefreshTokensRepository } from '../repositories/IRefreshTokensRepository'
import type { IHashProvider } from '../providers/IHashProvider'
const REFRESH_EXPIRES_DAYS = 7

interface AuthenticateInput {
  email: string
  password: string
}

interface AuthenticateOutput {
  user: { id: string; name: string; email: string; role: string; clinicId: string }
  refreshToken: string
}

export class AuthenticateUseCase {
  constructor(
    private usersRepository: IUsersRepository,
    private refreshTokensRepository: IRefreshTokensRepository,
    private hashProvider: IHashProvider,
  ) {}

  async execute(input: AuthenticateInput): Promise<AuthenticateOutput> {
    const user = await this.usersRepository.findByEmail(input.email.toLowerCase().trim())
    if (!user) throw Errors.unauthorized('Credenciais inválidas')

    const match = await this.hashProvider.compare(input.password, user.passwordHash)
    if (!match) throw Errors.unauthorized('Credenciais inválidas')

    const tokenValue = randomBytes(32).toString('hex')
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + REFRESH_EXPIRES_DAYS)

    await this.refreshTokensRepository.create({ token: tokenValue, userId: user.id, expiresAt })

    return {
      user: { id: user.id, name: user.name, email: user.email, role: user.role, clinicId: user.clinicId },
      refreshToken: tokenValue,
    }
  }
}
