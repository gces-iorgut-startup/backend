import { PrismaUsersRepository } from '../../infra/repositories/PrismaUsersRepository'
import { PrismaRefreshTokensRepository } from '../../infra/repositories/PrismaRefreshTokensRepository'
import { GoogleAuthUseCase } from '../googleAuthUseCase'

export function makeGoogleAuthUseCase() {
  return new GoogleAuthUseCase(
    new PrismaUsersRepository(),
    new PrismaRefreshTokensRepository(),
  )
}
