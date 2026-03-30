import { PrismaPatientsRepository } from '../../infra/repositories/PrismaPatientsRepository'
import { PrismaTutorsRepository } from '../../../tutor/infra/repositories/PrismaTutorsRepository'
import { CreatePatientUseCase } from '../createPatientUseCase'

export function makeCreatePatientUseCase() {
  return new CreatePatientUseCase(
    new PrismaPatientsRepository(),
    new PrismaTutorsRepository(),
  )
}
