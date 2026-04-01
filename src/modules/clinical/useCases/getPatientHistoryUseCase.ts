import type { IClinicalRecordsRepository } from '../repositories/IClinicalRecordsRepository'
import type { ClinicalRecord } from '@prisma/client'

interface GetPatientHistoryRequest {
  patientId: string
}

export class GetPatientHistoryUseCase {
  constructor(private clinicalRecordsRepository: IClinicalRecordsRepository) {}

  async execute({ patientId }: GetPatientHistoryRequest): Promise<ClinicalRecord[]> {
    return this.clinicalRecordsRepository.listByPatient(patientId)
  }
}
