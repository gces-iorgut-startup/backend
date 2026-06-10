import { AppError } from '../../../shared/errors/app-error'
import type { IAppointmentsRepository } from '../repositories/IAppointmentsRepository'
import type { Appointment } from '@prisma/client'

interface RescheduleAppointmentRequest {
  appointmentId: string
  clinicId: string
  newDateTime: Date
  newEndDateTime?: Date
}

export class RescheduleAppointmentUseCase {
  constructor(private appointmentsRepository: IAppointmentsRepository) {}

  async execute({ appointmentId, clinicId, newDateTime, newEndDateTime }: RescheduleAppointmentRequest): Promise<Appointment> {
    const appointment = await this.appointmentsRepository.findById(appointmentId, clinicId)

    if (!appointment) {
      throw new AppError('Agendamento não encontrado.', 404)
    }

    if (appointment.status !== 'SCHEDULED') {
      throw new AppError('Só é possível reagendar um agendamento com status SCHEDULED.', 400)
    }

    if (newDateTime <= new Date()) {
      throw new AppError('A nova data deve ser no futuro.', 400)
    }

    if (newEndDateTime && newEndDateTime <= newDateTime) {
      throw new AppError('O horário de fim deve ser posterior ao horário de início.', 400)
    }

    const effectiveEnd = newEndDateTime ?? new Date(newDateTime.getTime() + 15 * 60 * 1000)
    const conflict = await this.appointmentsRepository.findConflict(appointment.vetId, newDateTime, effectiveEnd, appointmentId)
    if (conflict) throw new AppError('Este horário já está ocupado.', 409)

    return this.appointmentsRepository.reschedule(appointmentId, newDateTime, newEndDateTime)
  }
}
