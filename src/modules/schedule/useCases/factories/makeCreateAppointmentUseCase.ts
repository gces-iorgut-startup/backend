import { PrismaAppointmentsRepository } from '../../infra/repositories/PrismaAppointmentsRepository'
import { PrismaPatientsRepository } from '../../../patient/infra/repositories/PrismaPatientsRepository'
import { PrismaUsersRepository } from '../../../auth/infra/repositories/PrismaUsersRepository'
import { CreateAppointmentUseCase } from '../createAppointmentUseCase'

export function makeCreateAppointmentUseCase() {
  return new CreateAppointmentUseCase(
    new PrismaAppointmentsRepository(),
    new PrismaPatientsRepository(),
    new PrismaUsersRepository(),
  )
}
