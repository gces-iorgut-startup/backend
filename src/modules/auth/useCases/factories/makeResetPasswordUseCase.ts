import { PrismaUsersRepository } from '../../infra/repositories/PrismaUsersRepository'
import { PrismaPasswordTokensRepository } from '../../infra/repositories/PrismaPasswordTokensRepository'
import { BcryptHashProvider } from '../../infra/providers/BcryptHashProvider'
import { ResetPasswordUseCase } from '../resetPasswordUseCase'

export function makeResetPasswordUseCase() {
  return new ResetPasswordUseCase(
    new PrismaUsersRepository(),
    new PrismaPasswordTokensRepository(),
    new BcryptHashProvider(),
  )
}