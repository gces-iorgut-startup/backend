import { Errors } from '../../../core/errors'
import type { IPatientsRepository, PatientWithTutor } from '../repositories/IPatientsRepository'

export class GetPatientUseCase {
  constructor(private patientsRepository: IPatientsRepository) {}

  async execute(id: string): Promise<PatientWithTutor> {
    const patient = await this.patientsRepository.findById(id)
    if (!patient) throw Errors.notFound('Paciente não encontrado')
    return patient
  }
}
