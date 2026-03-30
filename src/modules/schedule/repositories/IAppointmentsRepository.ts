import type { Appointment, Patient, User } from '@prisma/client'
import type { AppointmentCategory, AppointmentStatus } from '@prisma/client'

export type { AppointmentCategory, AppointmentStatus }

export type AppointmentWithRelations = Appointment & {
  patient: Pick<Patient, 'id' | 'name' | 'species'>
  vet: Pick<User, 'id' | 'name'>
}

export interface CreateAppointmentDTO {
  patientId: string
  vetId: string
  dateTime: Date
  category: AppointmentCategory
  observation?: string
}

export interface IAppointmentsRepository {
  create(data: CreateAppointmentDTO): Promise<Appointment>
  listByDay(date: Date, vetId?: string): Promise<AppointmentWithRelations[]>
}
