import { Errors } from '../../../core/errors'
import type { ITutorsRepository, UpdateTutorDTO } from '../repositories/ITutorsRepository'
import type { Tutor } from '@prisma/client'

interface UpdateTutorInput extends UpdateTutorDTO {
  id: string
}

export class UpdateTutorUseCase {
  constructor(private tutorsRepository: ITutorsRepository) {}

  async execute({ id, ...data }: UpdateTutorInput): Promise<Tutor> {
    const tutor = await this.tutorsRepository.findById(id)
    if (!tutor) throw Errors.notFound('Tutor não encontrado')

    if (data.cpf && data.cpf !== tutor.cpf) {
      const existingTutor = await this.tutorsRepository.findByCpf(data.cpf)
      if (existingTutor) throw Errors.conflict('CPF já cadastrado no sistema')
    }

    if (data.email && data.email !== tutor.email) {
      const existingEmail = await this.tutorsRepository.findByEmail(data.email)
      if (existingEmail) throw Errors.conflict('E-mail já cadastrado no sistema')
    }

    return this.tutorsRepository.update(id, data)
  }
}
