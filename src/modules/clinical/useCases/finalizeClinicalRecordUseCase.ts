import { AppError } from '../../../shared/errors/app-error'
import type { IAppointmentsRepository } from '../../schedule/repositories/IAppointmentsRepository'
import type { IClinicalRecordsRepository } from '../repositories/IClinicalRecordsRepository'
import type { GenerateAISummaryUseCase } from './generateAISummaryUseCase'
import type { ClinicalRecord } from '@prisma/client'

interface FinalizeClinicalRecordRequest {
  recordId: string
  vetId: string
  clinicId: string
}

export class FinalizeClinicalRecordUseCase {
  constructor(
    private clinicalRecordsRepository: IClinicalRecordsRepository,
    private appointmentsRepository: IAppointmentsRepository,
    private generateAISummaryUseCase?: GenerateAISummaryUseCase
  ) {}

  async execute({ recordId, vetId, clinicId }: FinalizeClinicalRecordRequest): Promise<ClinicalRecord> {
    const record = await this.clinicalRecordsRepository.findById(recordId, clinicId)

    if (!record) {
      throw new AppError('Prontuário não encontrado.', 404)
    }

    if (record.vetId !== vetId) {
      throw new AppError('Apenas o veterinário responsável pode finalizar o prontuário.', 403)
    }

    if (record.finalized) {
      throw new AppError('Prontuário já está finalizado.', 400)
    }

    const updatedRecord = await this.clinicalRecordsRepository.update(recordId, { finalized: true })

    if (updatedRecord.appointmentId) {
      await this.appointmentsRepository.updateStatus(updatedRecord.appointmentId, 'COMPLETED')
    }

    if (!this.generateAISummaryUseCase) {
      return updatedRecord
    }

    try {
      const { summary } = await this.generateAISummaryUseCase.execute({
        recordId,
        vetId,
        clinicId,
      })

      return {
        ...updatedRecord,
        aiSummary: summary,
      }
    } catch (error) {
      console.error('Falha ao gerar resumo por IA do prontuário.', {
        recordId,
        error,
      })
      return updatedRecord
    }
  }
}
