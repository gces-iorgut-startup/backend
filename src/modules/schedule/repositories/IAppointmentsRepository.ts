import type { Appointment, Patient, User } from '@prisma/client'
import type { AppointmentCategory, AppointmentStatus } from '@prisma/client'

export type { AppointmentCategory, AppointmentStatus }

export type AppointmentWithRelations = Appointment & {
  patient: Pick<Patient, 'id' | 'name' | 'species' | 'clinicId' | 'photoUrl'>
  vet: Pick<User, 'id' | 'name'>
}

export interface CreateAppointmentDTO {
  patientId: string
  vetId: string
  dateTime: Date
  endDateTime?: Date
  category: AppointmentCategory
  observation?: string
}

export interface IAppointmentsRepository {
  create(data: CreateAppointmentDTO): Promise<Appointment>
  findById(id: string, clinicId: string): Promise<Appointment | null>
  findConflict(vetId: string, dateTime: Date, endDateTime: Date, excludeId?: string): Promise<Appointment | null>
  listByDay(date: Date, clinicId: string, vetId?: string): Promise<AppointmentWithRelations[]>
  updateStatus(id: string, status: AppointmentStatus): Promise<Appointment>
  cancel(id: string, reason: string): Promise<Appointment>
  reschedule(id: string, newDateTime: Date, newEndDateTime?: Date): Promise<Appointment>
}
