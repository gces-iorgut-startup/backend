import { randomUUID } from 'crypto'
import type { User } from '@prisma/client'
import type { IUsersRepository, CreateUserDTO } from '../IUsersRepository'

export class InMemoryUsersRepository implements IUsersRepository {
  public items: User[] = []

  async create(data: CreateUserDTO): Promise<User> {
    const user: User = {
      id: randomUUID(),
      email: data.email,
      passwordHash: data.passwordHash,
      name: data.name,
      role: data.role,
      clinicId: data.clinicId,
      avatarUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    this.items.push(user)
    return user
  }

  async findById(id: string): Promise<User | null> {
    return this.items.find(u => u.id === id) ?? null
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.items.find(u => u.email === email) ?? null
  }

  async existsByEmail(email: string): Promise<boolean> {
    return this.items.some(u => u.email === email)
  }
}
