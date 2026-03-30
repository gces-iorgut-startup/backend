import type { ITutorsRepository } from '../repositories/ITutorsRepository'
import type { Tutor } from '@prisma/client'

interface ListTutorsInput {
  search?: string
  page?: number
  perPage?: number
}

export class ListTutorsUseCase {
  constructor(private tutorsRepository: ITutorsRepository) {}

  async execute(input: ListTutorsInput): Promise<{ tutors: Tutor[]; total: number }> {
    return this.tutorsRepository.list(input)
  }
}
