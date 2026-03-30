import { Errors } from '../../../core/errors'
import type { ITutorsRepository } from '../repositories/ITutorsRepository'
import type { Tutor } from '@prisma/client'

export class GetTutorUseCase {
  constructor(private tutorsRepository: ITutorsRepository) {}

  async execute(id: string): Promise<Tutor> {
    const tutor = await this.tutorsRepository.findById(id)
    if (!tutor) throw Errors.notFound('Tutor não encontrado')
    return tutor
  }
}
