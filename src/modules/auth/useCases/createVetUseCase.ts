import { Errors } from '../../../core/errors'
import type { IUsersRepository } from '../repositories/IUsersRepository'
import type { IHashProvider } from '../providers/IHashProvider'

interface CreateVetInput {
  email: string
  password: string
  name: string
  clinicId: string // extraído do JWT do OWNER
  crmv?: string
}

interface CreateVetOutput {
  id: string; email: string; name: string; role: string; crmv: string | null
}

export class CreateVetUseCase {
  constructor(
    private usersRepository: IUsersRepository,
    private hashProvider: IHashProvider,
  ) {}

  async execute(input: CreateVetInput): Promise<CreateVetOutput> {
    const exists = await this.usersRepository.existsByEmail(input.email)
    if (exists) throw Errors.conflict('E-mail já cadastrado')

    const passwordHash = await this.hashProvider.hash(input.password)
    const user = await this.usersRepository.create({
      email: input.email.toLowerCase().trim(),
      passwordHash,
      name: input.name.trim(),
      role: 'VET',
      clinicId: input.clinicId,
      crmv: input.crmv?.trim() || null,
    })

    return { id: user.id, email: user.email, name: user.name, role: user.role, crmv: user.crmv }
  }
}
