import { Errors } from '../../../core/errors'
import type { IAppointmentsRepository, AppointmentWithRelations } from '../repositories/IAppointmentsRepository'
import { DEFAULT_APPOINTMENT_DURATION_MS } from '../repositories/IAppointmentsRepository'
import type { IUsersRepository } from '../../auth/repositories/IUsersRepository'

interface ApproveAppointmentRequest {
  appointmentId: string
  clinicId: string
  vetId: string
  endDateTime?: Date
}

export class ApproveAppointmentUseCase {
  constructor(
    private appointmentsRepository: IAppointmentsRepository,
    private usersRepository: IUsersRepository,
  ) {}

  async execute({ appointmentId, clinicId, vetId, endDateTime }: ApproveAppointmentRequest): Promise<AppointmentWithRelations> {
    const appointment = await this.appointmentsRepository.findById(appointmentId, clinicId)
    if (!appointment) throw Errors.notFound('Agendamento não encontrado.')

    if (appointment.status !== 'PENDING_APPROVAL') {
      throw Errors.badRequest('Apenas agendamentos com status PENDING_APPROVAL podem ser aprovados.')
    }

    if (appointment.dateTime <= new Date()) {
      throw Errors.badRequest('Não é possível aprovar uma solicitação com data no passado.')
    }

    // Tutores também são usuários da clínica; só OWNER/VET podem ser responsáveis pela consulta.
    const vet = await this.usersRepository.findById(vetId)
    if (!vet || vet.clinicId !== clinicId || vet.role === 'TUTOR') {
      throw Errors.notFound('Veterinário não encontrado')
    }

    if (endDateTime && endDateTime <= appointment.dateTime) {
      throw Errors.badRequest('O horário de fim deve ser posterior ao horário de início.')
    }

    const effectiveEnd = endDateTime ?? new Date(appointment.dateTime.getTime() + DEFAULT_APPOINTMENT_DURATION_MS)
    const conflict = await this.appointmentsRepository.findConflict(vetId, appointment.dateTime, effectiveEnd, appointmentId)
    if (conflict) throw Errors.conflict('Este horário já está ocupado.')

    return this.appointmentsRepository.approve(appointmentId, vetId, effectiveEnd)
  }
}
