import type { Role, User } from '@prisma/client'

export type { User }

export interface CreateUserDTO {
  email: string
  passwordHash: string
  name: string
  role: Role
  clinicId: string
  crmv?: string | null
}

export interface UpdateUserDTO {
  name?: string
  crmv?: string | null
}

export interface IUsersRepository {
  create(data: CreateUserDTO): Promise<User>
  findById(id: string): Promise<User | null>
  findByEmail(email: string): Promise<User | null>
  existsByEmail(email: string): Promise<boolean>
  update(id: string, data: UpdateUserDTO): Promise<User>
}
