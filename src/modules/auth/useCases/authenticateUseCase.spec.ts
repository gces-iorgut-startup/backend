import { describe, it, expect, beforeEach } from 'vitest'
import { AuthenticateUseCase } from './authenticateUseCase'
import { InMemoryUsersRepository } from '../repositories/in-memory/InMemoryUsersRepository'
import { InMemoryRefreshTokensRepository } from '../repositories/in-memory/InMemoryRefreshTokensRepository'
import type { IHashProvider } from '../providers/IHashProvider'

class FakeHashProvider implements IHashProvider {
  async hash(plain: string) { return `hashed:${plain}` }
  async compare(plain: string, hashed: string) { return hashed === `hashed:${plain}` }
}

describe('AuthenticateUseCase', () => {
  let usersRepository: InMemoryUsersRepository
  let refreshTokensRepository: InMemoryRefreshTokensRepository
  let sut: AuthenticateUseCase

  beforeEach(async () => {
    usersRepository = new InMemoryUsersRepository()
    refreshTokensRepository = new InMemoryRefreshTokensRepository()
    sut = new AuthenticateUseCase(usersRepository, refreshTokensRepository, new FakeHashProvider())
    await usersRepository.create({ name: 'Dr. Gustavo', email: 'gustavo@iougurt.com', passwordHash: 'hashed:senha123', role: 'OWNER', clinicId: 'clinic-1' })
  })

  it('deve autenticar com credenciais corretas e retornar refreshToken', async () => {
    const result = await sut.execute({ email: 'gustavo@iougurt.com', password: 'senha123' })
    expect(result.user.email).toBe('gustavo@iougurt.com')
    expect(result.user.role).toBe('OWNER')
    expect(result.refreshToken).toHaveLength(64)
  })

  it('deve salvar o refreshToken no repositório', async () => {
    await sut.execute({ email: 'gustavo@iougurt.com', password: 'senha123' })
    expect(refreshTokensRepository.items).toHaveLength(1)
  })

  it('deve lançar 401 para e-mail inexistente', async () => {
    await expect(sut.execute({ email: 'nao@existe.com', password: 'senha123' })).rejects.toMatchObject({ statusCode: 401 })
  })

  it('deve lançar 401 para senha incorreta', async () => {
    await expect(sut.execute({ email: 'gustavo@iougurt.com', password: 'senhaerrada' })).rejects.toMatchObject({ statusCode: 401 })
  })

  it('não deve revelar se o e-mail existe (mesma mensagem de erro)', async () => {
    const errEmail = await sut.execute({ email: 'ine@g.com', password: 'x' }).catch(e => e)
    const errPass = await sut.execute({ email: 'gustavo@iougurt.com', password: 'x' }).catch(e => e)
    expect(errEmail.message).toBe(errPass.message)
  })
})
