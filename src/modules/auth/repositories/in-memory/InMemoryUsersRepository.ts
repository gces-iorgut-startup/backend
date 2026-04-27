import { randomUUID } from 'crypto'
import type { User } from '@prisma/client'
import type { IUsersRepository, CreateUserDTO, UpdateUserDTO } from '../IUsersRepository'

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
      crmv: data.crmv ?? null,
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

  async update(id: string, data: UpdateUserDTO): Promise<User> {
    const user = this.items.find(u => u.id === id)
    if (!user) throw new Error('User not found')
    if (data.name !== undefined) user.name = data.name
    if (data.crmv !== undefined) user.crmv = data.crmv
    user.updatedAt = new Date()
    return user
  }

  async updatePassword(id: string, passwordHash: string): Promise<void> {
    const userIndex = this.items.findIndex(u => u.id === id)
    if (userIndex >= 0) {
      this.items[userIndex].passwordHash = passwordHash
      this.items[userIndex].updatedAt = new Date()
    }
  }
}
