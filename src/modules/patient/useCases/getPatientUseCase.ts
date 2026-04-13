import { Errors } from '../../../core/errors'
import type { IPatientsRepository, PatientWithTutor } from '../repositories/IPatientsRepository'

export class GetPatientUseCase {
  constructor(private patientsRepository: IPatientsRepository) {}

  async execute({ id, clinicId }: { id: string; clinicId: string }): Promise<PatientWithTutor> {
    const patient = await this.patientsRepository.findById(id, clinicId)
    if (!patient) throw Errors.notFound('Paciente não encontrado')
    return patient
  }
}
