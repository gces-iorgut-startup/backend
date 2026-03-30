import { PrismaUsersRepository } from '../../infra/repositories/PrismaUsersRepository'
import { PrismaRefreshTokensRepository } from '../../infra/repositories/PrismaRefreshTokensRepository'
import { RefreshTokenUseCase } from '../refreshTokenUseCase'

export function makeRefreshTokenUseCase() {
  return new RefreshTokenUseCase(new PrismaUsersRepository(), new PrismaRefreshTokensRepository())
}
