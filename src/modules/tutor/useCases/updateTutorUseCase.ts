import { Errors } from '../../../core/errors'
import type { ITutorsRepository, UpdateTutorDTO } from '../repositories/ITutorsRepository'
import type { Tutor } from '@prisma/client'

interface UpdateTutorInput extends UpdateTutorDTO {
  id: string
  clinicId: string
}

export class UpdateTutorUseCase {
  constructor(private tutorsRepository: ITutorsRepository) {}

  async execute({ id, clinicId, ...data }: UpdateTutorInput): Promise<Tutor> {
    const tutor = await this.tutorsRepository.findById(id, clinicId)
    if (!tutor) throw Errors.notFound('Tutor não encontrado')

    if (data.cpf && data.cpf !== tutor.cpf) {
      const existingTutor = await this.tutorsRepository.findByCpf(data.cpf, tutor.clinicId)
      if (existingTutor) throw Errors.conflict('CPF já cadastrado nesta clínica')
    }

    if (data.email && data.email !== tutor.email) {
      const existingEmail = await this.tutorsRepository.findByEmail(data.email, tutor.clinicId)
      if (existingEmail) throw Errors.conflict('E-mail já cadastrado nesta clínica')
    }

    return this.tutorsRepository.update(id, data)
  }
}
