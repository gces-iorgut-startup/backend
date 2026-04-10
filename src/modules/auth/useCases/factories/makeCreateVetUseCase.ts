import { PrismaUsersRepository } from '../../infra/repositories/PrismaUsersRepository'
import { BcryptHashProvider } from '../../infra/providers/BcryptHashProvider'
import { CreateVetUseCase } from '../createVetUseCase'

export function makeCreateVetUseCase() {
  return new CreateVetUseCase(new PrismaUsersRepository(), new BcryptHashProvider())
}
