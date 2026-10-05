import { AppError } from '@shared/errors/app-error'
import type { IAppointmentsRepository } from '../../schedule/repositories/IAppointmentsRepository'
import type { IClinicalRecordsRepository } from '../repositories/IClinicalRecordsRepository'
import type { IUsersRepository } from '../../auth/repositories/IUsersRepository'
import type { ClinicalRecord, Role } from '@prisma/client'

interface StartClinicalRecordRequest {
  appointmentId: string
  vetId: string
  clinicId: string
  userRole?: Role | string
}

export class StartClinicalRecordUseCase {
  constructor(
    private appointmentsRepository: IAppointmentsRepository,
    private clinicalRecordsRepository: IClinicalRecordsRepository,
    private usersRepository: IUsersRepository
  ) {}

  async execute({
    appointmentId,
    vetId,
    clinicId,
    userRole,
  }: StartClinicalRecordRequest): Promise<ClinicalRecord> {
    const appointment = await this.appointmentsRepository.findById(appointmentId, clinicId)

    if (!appointment) {
      throw new AppError('Agendamento não encontrado.', 404)
    }

    if (appointment.status === 'COMPLETED') {
      throw new AppError('Este agendamento já foi concluído.', 400)
    }

    if (appointment.status === 'CANCELLED') {
      throw new AppError('Não é possível iniciar prontuário de agendamento cancelado.', 400)
    }

    const user = await this.usersRepository.findById(vetId)
    const role = user?.role ?? userRole

    if (role === 'TUTOR') {
      throw new AppError('Apenas o veterinário responsável pode iniciar o prontuário.', 403)
    }

    if (role === 'OWNER') {
      if (!user?.crmv || user.crmv.trim() === '') {
        throw new AppError('É necessário possuir CRMV cadastrado para iniciar o prontuário.', 403)
      }
    } else {
      if (appointment.vetId !== vetId) {
        throw new AppError('Apenas o veterinário responsável pode iniciar o prontuário.', 403)
      }
    }

    const existingRecord = await this.clinicalRecordsRepository.findByAppointmentId(appointmentId)

    if (existingRecord) {
      if (existingRecord.vetId !== vetId) {
        throw new AppError('Apenas o veterinário responsável pode iniciar o prontuário.', 403)
      }

      if (appointment.status !== 'IN_PROGRESS') {
        await this.appointmentsRepository.updateStatus(appointmentId, 'IN_PROGRESS')
      }
      return existingRecord
    }

    const record = await this.clinicalRecordsRepository.create({
      patientId: appointment.patientId,
      vetId,
      appointmentId,
    })

    await this.appointmentsRepository.updateStatus(appointmentId, 'IN_PROGRESS')

    return record
  }
}
