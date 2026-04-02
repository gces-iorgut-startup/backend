import { PrismaAppointmentsRepository } from '../../infra/repositories/PrismaAppointmentsRepository'
import { CancelAppointmentUseCase } from '../cancelAppointmentUseCase'

export function makeCancelAppointmentUseCase() {
  const appointmentsRepository = new PrismaAppointmentsRepository()
  return new CancelAppointmentUseCase(appointmentsRepository)
}
