import { PrismaUsersRepository } from '../../infra/repositories/PrismaUsersRepository'
import { BcryptHashProvider } from '../../infra/providers/BcryptHashProvider'
import { CreateUserUseCase } from '../createUserUseCase'

export function makeCreateUserUseCase() {
  return new CreateUserUseCase(new PrismaUsersRepository(), new BcryptHashProvider())
}
