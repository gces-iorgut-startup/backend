import { Errors } from '../../../core/errors'
import type { ITutorsRepository } from '../repositories/ITutorsRepository'
import type { Tutor } from '@prisma/client'

interface CreateTutorInput {
  fullName: string
  cpf: string
  phone: string
  email?: string
  address?: string
  insurance?: string
}

export class CreateTutorUseCase {
  constructor(private tutorsRepository: ITutorsRepository) {}

  async execute(input: CreateTutorInput): Promise<Tutor> {
    const existing = await this.tutorsRepository.findByCpf(input.cpf)
    if (existing) throw Errors.conflict('CPF já cadastrado')
    return this.tutorsRepository.create(input)
  }
}
