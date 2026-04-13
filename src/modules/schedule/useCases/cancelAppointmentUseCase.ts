import { AppError } from '../../../shared/errors/app-error'
import type { IAppointmentsRepository } from '../repositories/IAppointmentsRepository'
import type { Appointment } from '@prisma/client'

interface CancelAppointmentRequest {
  appointmentId: string
  clinicId: string
  reason: string
}

export class CancelAppointmentUseCase {
  constructor(private appointmentsRepository: IAppointmentsRepository) {}

  async execute({ appointmentId, clinicId, reason }: CancelAppointmentRequest): Promise<Appointment> {
    const appointment = await this.appointmentsRepository.findById(appointmentId, clinicId)

    if (!appointment) {
      throw new AppError('Agendamento não encontrado.', 404)
    }

    if (appointment.status === 'COMPLETED') {
      throw new AppError('Não é possível cancelar um agendamento já concluído.', 400)
    }

    if (appointment.status === 'CANCELLED') {
      throw new AppError('Este agendamento já está cancelado.', 400)
    }

    if (appointment.status === 'IN_PROGRESS') {
      throw new AppError('Não é possível cancelar um atendimento em andamento. Finalize o prontuário primeiro.', 400)
    }

    if (!reason || reason.trim().length < 5) {
      throw new AppError('Justificativa de cancelamento deve ter ao menos 5 caracteres.', 400)
    }

    return this.appointmentsRepository.cancel(appointmentId, reason.trim())
  }
}
