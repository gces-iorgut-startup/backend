import { PrismaAppointmentsRepository } from '../../infra/repositories/PrismaAppointmentsRepository'
import { ListAppointmentsByStatusUseCase } from '../listAppointmentsByStatusUseCase'

export function makeListAppointmentsByStatusUseCase() {
  return new ListAppointmentsByStatusUseCase(new PrismaAppointmentsRepository())
}
