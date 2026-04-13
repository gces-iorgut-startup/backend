import { Errors } from '../../../core/errors'
import type { IPatientsRepository, CreatePatientDTO } from '../repositories/IPatientsRepository'
import type { ITutorsRepository } from '../../tutor/repositories/ITutorsRepository'
import type { Patient } from '@prisma/client'

export class CreatePatientUseCase {
  constructor(
    private patientsRepository: IPatientsRepository,
    private tutorsRepository: ITutorsRepository,
  ) {}

  async execute(input: CreatePatientDTO): Promise<Patient> {
    const tutor = await this.tutorsRepository.findById(input.tutorId, input.clinicId)
    if (!tutor) throw Errors.notFound('Tutor não encontrado')
    return this.patientsRepository.create(input)
  }
}
