import jwt from 'jsonwebtoken'
import { env } from '../../../config/env'
import { Errors } from '../../../core/errors'
import type { IUsersRepository } from '../repositories/IUsersRepository'
import type { IPasswordTokensRepository } from '../repositories/IPasswordTokensRepository'
import type { IHashProvider } from '../providers/IHashProvider'

export class ResetPasswordUseCase {
  constructor(
    private usersRepository: IUsersRepository,
    private passwordTokensRepository: IPasswordTokensRepository,
    private hashProvider: IHashProvider,
  ) {}

  async execute({ token, newPassword }: { token: string, newPassword: string }): Promise<void> {
    const storedToken = await this.passwordTokensRepository.findByToken(token)

    if (!storedToken || storedToken.usedAt || storedToken.expiresAt < new Date()) {
      throw Errors.unauthorized('Token inválido, expirado ou já utilizado')
    }

    try {
      jwt.verify(token, env.JWT_SECRET)
    } catch {
      throw Errors.unauthorized('Token corrompido ou expirado')
    }

    const passwordHash = await this.hashProvider.hash(newPassword)
    
    await this.usersRepository.updatePassword(storedToken.userId, passwordHash)
    await this.passwordTokensRepository.markAsUsed(token)
  }
}