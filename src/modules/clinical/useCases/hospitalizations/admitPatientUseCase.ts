import { AppError } from '../../../../shared/errors/app-error'
import type { IPatientsRepository } from '../../../patient/repositories/IPatientsRepository'
import type {
  Hospitalization,
  IHospitalizationsRepository,
} from '../../repositories/IHospitalizationsRepository'

interface AdmitPatientRequest {
  clinicId: string
  patientId: string
  admittedByVetId: string
  bedIdentifier: string
  reason: string
}

export class AdmitPatientUseCase {
  constructor(
    private hospitalizationsRepository: IHospitalizationsRepository,
    private patientsRepository: IPatientsRepository
  ) {}

  async execute({
    clinicId,
    patientId,
    admittedByVetId,
    bedIdentifier,
    reason,
  }: AdmitPatientRequest): Promise<Hospitalization> {
    // `findById` do repositório de pacientes já é escopado por clínica, então
    // isto também impede internar paciente de outra clínica.
    const patient = await this.patientsRepository.findById(patientId, clinicId)

    if (!patient) {
      throw new AppError('Paciente não encontrado.', 404)
    }

    const openHospitalization = await this.hospitalizationsRepository.findOpenByPatient(patientId)

    if (openHospitalization) {
      throw new AppError('Este paciente já possui uma internação em aberto.', 409)
    }

    const trimmedBed = bedIdentifier.trim()
    if (!trimmedBed) {
      throw new AppError('Informe a baia ou leito da internação.', 400)
    }

    const trimmedReason = reason.trim()
    if (!trimmedReason) {
      throw new AppError('Informe o motivo da internação.', 400)
    }

    return this.hospitalizationsRepository.create({
      clinicId,
      patientId,
      admittedByVetId,
      bedIdentifier: trimmedBed,
      reason: trimmedReason,
    })
  }
}
