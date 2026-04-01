import { AppError } from '../../../../shared/errors/app-error'
import type { IVaccinationsRepository } from '../../repositories/IVaccinationsRepository'
import type { Vaccination } from '@prisma/client'

interface ListPatientVaccinationsRequest {
  patientId: string
}

export class ListPatientVaccinationsUseCase {
  constructor(private vaccinationsRepository: IVaccinationsRepository) {}

  async execute({ patientId }: ListPatientVaccinationsRequest): Promise<Vaccination[]> {
    return this.vaccinationsRepository.listByPatient(patientId)
  }
}
