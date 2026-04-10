import { Errors } from '../../../core/errors'
import type { ITutorsRepository } from '../repositories/ITutorsRepository'
import type { Tutor } from '@prisma/client'

interface CreateTutorInput {
  clinicId: string
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
    const existingCpf = await this.tutorsRepository.findByCpf(input.cpf)
    if (existingCpf) throw Errors.conflict('CPF já cadastrado no sistema')

    if (input.email) {
      const existingEmail = await this.tutorsRepository.findByEmail(input.email)
      if (existingEmail) throw Errors.conflict('E-mail já cadastrado no sistema')
    }

    return this.tutorsRepository.create(input)
  }
}
