import { PrismaRefreshTokensRepository } from '../../infra/repositories/PrismaRefreshTokensRepository'
import { LogoutUseCase } from '../logoutUseCase'

export function makeLogoutUseCase() {
  return new LogoutUseCase(new PrismaRefreshTokensRepository())
}
