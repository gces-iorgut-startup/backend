import type { IAppointmentsRepository, AppointmentWithRelations, AppointmentStatus } from '../repositories/IAppointmentsRepository'

interface ListByStatusInput { status: AppointmentStatus; clinicId: string; date?: string }

export class ListAppointmentsByStatusUseCase {
  constructor(private appointmentsRepository: IAppointmentsRepository) {}

  async execute({ status, clinicId, date }: ListByStatusInput): Promise<AppointmentWithRelations[]> {
    return this.appointmentsRepository.listByStatus(status, clinicId, date ? new Date(date) : undefined)
  }
}
