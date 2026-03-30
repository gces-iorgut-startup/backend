import { PrismaAppointmentsRepository } from '../../infra/repositories/PrismaAppointmentsRepository'
import { ListAppointmentsByDayUseCase } from '../listAppointmentsByDayUseCase'
export function makeListAppointmentsByDayUseCase() { return new ListAppointmentsByDayUseCase(new PrismaAppointmentsRepository()) }
