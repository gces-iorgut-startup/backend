import type { IRefreshTokensRepository } from '../repositories/IRefreshTokensRepository'

export class LogoutUseCase {
  constructor(private refreshTokensRepository: IRefreshTokensRepository) {}

  async execute(userId: string): Promise<void> {
    await this.refreshTokensRepository.deleteAllByUserId(userId)
  }
}
