import { Errors } from '../../../core/errors'
import type { IAppointmentsRepository, AppointmentWithRelations } from '../repositories/IAppointmentsRepository'

interface RejectAppointmentRequest {
  appointmentId: string
  clinicId: string
  reason: string
}

export class RejectAppointmentUseCase {
  constructor(private appointmentsRepository: IAppointmentsRepository) {}

  async execute({ appointmentId, clinicId, reason }: RejectAppointmentRequest): Promise<AppointmentWithRelations> {
    const appointment = await this.appointmentsRepository.findById(appointmentId, clinicId)
    if (!appointment) throw Errors.notFound('Agendamento não encontrado.')

    if (appointment.status !== 'PENDING_APPROVAL') {
      throw Errors.badRequest('Apenas agendamentos com status PENDING_APPROVAL podem ser recusados.')
    }

    if (!reason || reason.trim().length < 1) {
      throw Errors.badRequest('Justificativa de recusa deve ter ao menos 1 caractere.')
    }

    return this.appointmentsRepository.reject(appointmentId, reason.trim())
  }
}
