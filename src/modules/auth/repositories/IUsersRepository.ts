import type { Role, User } from '@prisma/client'

export type { User }

export interface CreateUserDTO {
  email: string
  passwordHash: string
  name: string
  role: Role
}

export interface IUsersRepository {
  create(data: CreateUserDTO): Promise<User>
  findById(id: string): Promise<User | null>
  findByEmail(email: string): Promise<User | null>
  existsByEmail(email: string): Promise<boolean>
}
