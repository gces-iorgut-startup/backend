import { PrismaAppointmentsRepository } from '../../infra/repositories/PrismaAppointmentsRepository'
import { RejectAppointmentUseCase } from '../rejectAppointmentUseCase'

export function makeRejectAppointmentUseCase() {
  return new RejectAppointmentUseCase(new PrismaAppointmentsRepository())
}
