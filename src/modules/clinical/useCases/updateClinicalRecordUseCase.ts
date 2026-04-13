import { AppError } from '../../../shared/errors/app-error'
import type { IClinicalRecordsRepository, UpdateClinicalRecordDTO } from '../repositories/IClinicalRecordsRepository'
import type { ClinicalRecord } from '@prisma/client'

interface UpdateClinicalRecordRequest {
  recordId: string
  vetId: string
  clinicId: string
  data: UpdateClinicalRecordDTO
}

export class UpdateClinicalRecordUseCase {
  constructor(private clinicalRecordsRepository: IClinicalRecordsRepository) {}

  async execute({ recordId, vetId, clinicId, data }: UpdateClinicalRecordRequest): Promise<ClinicalRecord> {
    const record = await this.clinicalRecordsRepository.findById(recordId, clinicId)

    if (!record) {
      throw new AppError('Prontuário não encontrado.', 404)
    }

    if (record.vetId !== vetId) {
      throw new AppError('Apenas o veterinário responsável pode editar o prontuário.', 403)
    }

    if (record.finalized) {
      throw new AppError('Não é possível editar um prontuário finalizado.', 400)
    }

    // Protect finalized flag
    const { finalized, ...updateData } = data

    return this.clinicalRecordsRepository.update(recordId, updateData)
  }
}
