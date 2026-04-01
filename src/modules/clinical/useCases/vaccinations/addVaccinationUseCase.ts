import { AppError } from '../../../../shared/errors/app-error'
import type { IVaccinationsRepository, CreateVaccinationDTO } from '../../repositories/IVaccinationsRepository'
import type { IPatientsRepository } from '../../../patient/repositories/IPatientsRepository'
import type { Vaccination } from '@prisma/client'

interface AddVaccinationRequest {
  patientId: string
  vaccineName: string
  appliedAt?: string | Date
  nextDoseAt?: string | Date
  status: 'UP_TO_DATE' | 'PENDING' | 'OVERDUE'
}

export class AddVaccinationUseCase {
  constructor(
    private vaccinationsRepository: IVaccinationsRepository,
    private patientsRepository: IPatientsRepository
  ) {}

  async execute({
    patientId,
    vaccineName,
    appliedAt,
    nextDoseAt,
    status,
  }: AddVaccinationRequest): Promise<Vaccination> {
    const patient = await this.patientsRepository.findById(patientId)

    if (!patient) {
      throw new AppError('Paciente não encontrado.', 404)
    }

    if (status === 'UP_TO_DATE' && !appliedAt) {
      throw new AppError('Data de aplicação é obrigatória para vacinas aplicadas.', 400)
    }

    if (status === 'PENDING' && !nextDoseAt) {
      throw new AppError('Data da próxima dose é obrigatória para vacinas agendadas.', 400)
    }

    return this.vaccinationsRepository.create({
      patientId,
      vaccineName,
      status,
      appliedAt: appliedAt ? new Date(appliedAt) : undefined,
      nextDoseAt: nextDoseAt ? new Date(nextDoseAt) : undefined,
    })
  }
}
