import { PrismaAppointmentsRepository } from '../../infra/repositories/PrismaAppointmentsRepository'
import { PrismaUsersRepository } from '../../../auth/infra/repositories/PrismaUsersRepository'
import { ApproveAppointmentUseCase } from '../approveAppointmentUseCase'

export function makeApproveAppointmentUseCase() {
  return new ApproveAppointmentUseCase(
    new PrismaAppointmentsRepository(),
    new PrismaUsersRepository(),
  )
}
