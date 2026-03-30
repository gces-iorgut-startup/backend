import { Errors } from '../../../core/errors'
import type { IPatientsRepository, UpdatePatientDTO } from '../repositories/IPatientsRepository'
import type { Patient } from '@prisma/client'

interface UpdatePatientInput extends UpdatePatientDTO { id: string }

export class UpdatePatientUseCase {
  constructor(private patientsRepository: IPatientsRepository) {}

  async execute({ id, ...data }: UpdatePatientInput): Promise<Patient> {
    const patient = await this.patientsRepository.findById(id)
    if (!patient) throw Errors.notFound('Paciente não encontrado')
    return this.patientsRepository.update(id, data)
  }
}
