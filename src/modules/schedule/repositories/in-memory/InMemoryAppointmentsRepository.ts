import { randomUUID } from 'crypto'
import type { Appointment } from '@prisma/client'
import { AppointmentStatus } from '@prisma/client'
import type {
  IAppointmentsRepository,
  CreateAppointmentDTO,
  AppointmentWithRelations,
} from '../IAppointmentsRepository'

export class InMemoryAppointmentsRepository implements IAppointmentsRepository {
  public items: AppointmentWithRelations[] = []

  async create(data: CreateAppointmentDTO): Promise<Appointment> {
    const appointment: AppointmentWithRelations = {
      id: randomUUID(),
      patientId: data.patientId,
      vetId: data.vetId,
      dateTime: data.dateTime,
      category: data.category,
      status: AppointmentStatus.SCHEDULED,
      observation: data.observation ?? null,
      cancelReason: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      patient: { id: data.patientId, name: 'Paciente', species: 'Cachorro' },
      vet: { id: data.vetId, name: 'Veterinário' },
    }
    this.items.push(appointment)
    return appointment
  }

  async listByDay(date: Date, vetId?: string): Promise<AppointmentWithRelations[]> {
    const dateStr = date.toISOString().slice(0, 10) // 'YYYY-MM-DD'
    return this.items.filter(a => {
      const aDateStr = a.dateTime.toISOString().slice(0, 10)
      return (
        aDateStr === dateStr &&
        a.status !== AppointmentStatus.CANCELLED &&
        (!vetId || a.vetId === vetId)
      )
    })
  }
}
