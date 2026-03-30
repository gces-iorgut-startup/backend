import { Errors } from '../../../core/errors'
import type { IUsersRepository } from '../repositories/IUsersRepository'
import type { IHashProvider } from '../providers/IHashProvider'
import type { Role } from '@prisma/client'

interface CreateUserInput {
  email: string
  password: string
  name: string
  role: Role
}

interface CreateUserOutput {
  id: string; email: string; name: string; role: string
}

export class CreateUserUseCase {
  constructor(
    private usersRepository: IUsersRepository,
    private hashProvider: IHashProvider,
  ) {}

  async execute(input: CreateUserInput): Promise<CreateUserOutput> {
    const exists = await this.usersRepository.existsByEmail(input.email)
    if (exists) throw Errors.conflict('E-mail já cadastrado')

    const passwordHash = await this.hashProvider.hash(input.password)
    const user = await this.usersRepository.create({
      email: input.email.toLowerCase().trim(),
      passwordHash,
      name: input.name.trim(),
      role: input.role,
    })

    return { id: user.id, email: user.email, name: user.name, role: user.role }
  }
}
