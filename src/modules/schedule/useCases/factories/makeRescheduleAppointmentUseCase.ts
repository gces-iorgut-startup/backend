import { PrismaAppointmentsRepository } from '../../infra/repositories/PrismaAppointmentsRepository'
import { RescheduleAppointmentUseCase } from '../rescheduleAppointmentUseCase'

export function makeRescheduleAppointmentUseCase() {
  const appointmentsRepository = new PrismaAppointmentsRepository()
  return new RescheduleAppointmentUseCase(appointmentsRepository)
}
