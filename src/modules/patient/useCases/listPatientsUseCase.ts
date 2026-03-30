import type { IPatientsRepository, ListPatientsDTO, PatientWithTutor } from '../repositories/IPatientsRepository'

export class ListPatientsUseCase {
  constructor(private patientsRepository: IPatientsRepository) {}

  async execute(params: ListPatientsDTO): Promise<{ patients: PatientWithTutor[]; total: number }> {
    return this.patientsRepository.list(params)
  }
}
