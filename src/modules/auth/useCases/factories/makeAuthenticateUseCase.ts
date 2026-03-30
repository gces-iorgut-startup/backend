import { PrismaUsersRepository } from '../../infra/repositories/PrismaUsersRepository'
import { PrismaRefreshTokensRepository } from '../../infra/repositories/PrismaRefreshTokensRepository'
import { BcryptHashProvider } from '../../infra/providers/BcryptHashProvider'
import { AuthenticateUseCase } from '../authenticateUseCase'

export function makeAuthenticateUseCase() {
  return new AuthenticateUseCase(
    new PrismaUsersRepository(),
    new PrismaRefreshTokensRepository(),
    new BcryptHashProvider(),
  )
}
