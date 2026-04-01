import { AppError } from '../../../../shared/errors/app-error'
import type { IVaccinationsRepository } from '../../repositories/IVaccinationsRepository'
import type { Vaccination, VaccinationStatus } from '@prisma/client'

interface UpdateVaccinationStatusRequest {
  vaccinationId: string
  status: VaccinationStatus
}

export class UpdateVaccinationStatusUseCase {
  constructor(private vaccinationsRepository: IVaccinationsRepository) {}

  async execute({ vaccinationId, status }: UpdateVaccinationStatusRequest): Promise<Vaccination> {
    const vaccination = await this.vaccinationsRepository.findById(vaccinationId)

    if (!vaccination) {
      throw new AppError('Vacina não encontrada.', 404)
    }

    if (vaccination.status === 'UP_TO_DATE') {
      throw new AppError('Não é possível alterar o status de uma vacina já aplicada.', 400)
    }

    // Usually when applying a scheduled vaccine, you might want to update `appliedAt` to now().
    // We could either create another method `applyVaccine` or just assume `updateStatus` acts on it.
    // For MVP 2, we just switch status.
    const updated = await this.vaccinationsRepository.updateStatus(vaccinationId, status)
    return updated
  }
}
