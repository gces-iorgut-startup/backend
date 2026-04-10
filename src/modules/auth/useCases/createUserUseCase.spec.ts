import { describe, it, expect, beforeEach } from 'vitest'
import { CreateUserUseCase } from './createUserUseCase'
import { InMemoryUsersRepository } from '../repositories/in-memory/InMemoryUsersRepository'
import type { IHashProvider } from '../providers/IHashProvider'
import { AppError } from '../../../shared/errors/app-error'

class FakeHashProvider implements IHashProvider {
  async hash(plain: string) { return `hashed:${plain}` }
  async compare(plain: string, hashed: string) { return hashed === `hashed:${plain}` }
}

describe('CreateUserUseCase', () => {
  let usersRepository: InMemoryUsersRepository
  let hashProvider: FakeHashProvider
  let sut: CreateUserUseCase

  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    hashProvider = new FakeHashProvider()
    sut = new CreateUserUseCase(usersRepository, hashProvider)
  })

  it('deve criar um usuário com role OWNER', async () => {
    const result = await sut.execute({ name: 'Dr. Gustavo', email: 'gustavo@iougurt.com', password: 'senha123', role: 'OWNER', clinicId: 'clinic-1' })
    expect(result.id).toBeDefined()
    expect(result.email).toBe('gustavo@iougurt.com')
    expect(result.role).toBe('OWNER')
  })

  it('deve criar um usuário com role VET', async () => {
    const result = await sut.execute({ name: 'Dra. Ana', email: 'ana@iougurt.com', password: 'senha123', role: 'VET', clinicId: 'clinic-1' })
    expect(result.role).toBe('VET')
  })

  it('deve fazer hash da senha', async () => {
    await sut.execute({ name: 'Gustavo', email: 'g@g.com', password: 'senha123', role: 'VET', clinicId: 'clinic-1' })
    expect(usersRepository.items[0].passwordHash).toBe('hashed:senha123')
    expect(usersRepository.items[0].passwordHash).not.toBe('senha123')
  })

  it('não deve criar usuário com e-mail duplicado', async () => {
    await sut.execute({ name: 'Gustavo', email: 'gustavo@iougurt.com', password: 'a', role: 'VET', clinicId: 'clinic-1' })
    await expect(sut.execute({ name: 'Outro', email: 'gustavo@iougurt.com', password: 'b', role: 'VET', clinicId: 'clinic-1' })).rejects.toBeInstanceOf(AppError)
  })

  it('deve lançar AppError com statusCode 409 para e-mail duplicado', async () => {
    await sut.execute({ name: 'Gustavo', email: 'g@g.com', password: 'a', role: 'VET', clinicId: 'clinic-1' })
    await expect(sut.execute({ name: 'Outro', email: 'g@g.com', password: 'b', role: 'VET', clinicId: 'clinic-1' })).rejects.toMatchObject({ statusCode: 409 })
  })
})
