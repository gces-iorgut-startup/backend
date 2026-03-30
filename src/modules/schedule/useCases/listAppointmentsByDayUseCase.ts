import type { IAppointmentsRepository, AppointmentWithRelations } from '../repositories/IAppointmentsRepository'

interface ListByDayInput { date: string; vetId?: string }

export class ListAppointmentsByDayUseCase {
  constructor(private appointmentsRepository: IAppointmentsRepository) {}

  async execute({ date, vetId }: ListByDayInput): Promise<AppointmentWithRelations[]> {
    return this.appointmentsRepository.listByDay(new Date(date), vetId)
  }
}
