import { BcryptHashProvider } from '../../infra/providers/BcryptHashProvider'
import { CreateOwnerUseCase } from '../createOwnerUseCase'

export function makeCreateOwnerUseCase() {
  return new CreateOwnerUseCase(new BcryptHashProvider())
}
