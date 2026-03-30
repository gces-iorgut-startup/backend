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
    return this.tutorsRepository.update(id, data)
  }
}
