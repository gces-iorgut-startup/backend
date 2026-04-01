import { AppError } from '@shared/errors/app-error'
import type { IAppointmentsRepository } from '../../schedule/repositories/IAppointmentsRepository'
import type { IClinicalRecordsRepository } from '../repositories/IClinicalRecordsRepository'
import type { ClinicalRecord } from '@prisma/client'

interface StartClinicalRecordRequest {
  appointmentId: string
  vetId: string
}

export class StartClinicalRecordUseCase {
  constructor(
    private appointmentsRepository: IAppointmentsRepository,
    private clinicalRecordsRepository: IClinicalRecordsRepository
  ) {}

  async execute({
    appointmentId,
    vetId,
  }: StartClinicalRecordRequest): Promise<ClinicalRecord> {
    const appointment = await this.appointmentsRepository.findById(appointmentId)

    if (!appointment) {
      throw new AppError('Agendamento não encontrado.', 404)
    }

    if (appointment.vetId !== vetId) {
      throw new AppError('Apenas o veterinário responsável pode iniciar o prontuário.', 403)
    }

    if (appointment.status === 'COMPLETED') {
      throw new AppError('Este agendamento já foi concluído.', 400)
    }

    if (appointment.status === 'CANCELLED') {
      throw new AppError('Não é possível iniciar prontuário de agendamento cancelado.', 400)
    }

    const existingRecord = await this.clinicalRecordsRepository.findByAppointmentId(appointmentId)

    if (existingRecord) {
      if (appointment.status !== 'IN_PROGRESS') {
        await this.appointmentsRepository.updateStatus(appointmentId, 'IN_PROGRESS')
      }
      return existingRecord
    }

    const record = await this.clinicalRecordsRepository.create({
      patientId: appointment.patientId,
      vetId: appointment.vetId,
      appointmentId,
    })

    await this.appointmentsRepository.updateStatus(appointmentId, 'IN_PROGRESS')

    return record
  }
}
