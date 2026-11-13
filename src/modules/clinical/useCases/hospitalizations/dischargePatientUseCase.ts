import { AppError } from '../../../../shared/errors/app-error'
import type {
  Hospitalization,
  IHospitalizationsRepository,
} from '../../repositories/IHospitalizationsRepository'

interface DischargePatientRequest {
  hospitalizationId: string
  clinicId: string
  dischargeNotes?: string
  now?: Date
}

export class DischargePatientUseCase {
  constructor(private hospitalizationsRepository: IHospitalizationsRepository) {}

  async execute({
    hospitalizationId,
    clinicId,
    dischargeNotes,
    now = new Date(),
  }: DischargePatientRequest): Promise<Hospitalization> {
    const hospitalization = await this.hospitalizationsRepository.findById(
      hospitalizationId,
      clinicId
    )

    if (!hospitalization) {
      throw new AppError('Internação não encontrada.', 404)
    }

    // Alta repetida sobrescreveria a data da alta original.
    if (hospitalization.status === 'DISCHARGED') {
      throw new AppError('Esta internação já teve alta concedida.', 400)
    }

    return this.hospitalizationsRepository.discharge(hospitalizationId, {
      dischargedAt: now,
      dischargeNotes: dischargeNotes?.trim() || null,
    })
  }
}
