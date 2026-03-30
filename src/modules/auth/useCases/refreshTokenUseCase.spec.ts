import { describe, it, expect, beforeEach } from 'vitest'
import { RefreshTokenUseCase } from './refreshTokenUseCase'
import { InMemoryUsersRepository } from '../repositories/in-memory/InMemoryUsersRepository'
import { InMemoryRefreshTokensRepository } from '../repositories/in-memory/InMemoryRefreshTokensRepository'

describe('RefreshTokenUseCase', () => {
  let usersRepository: InMemoryUsersRepository
  let refreshTokensRepository: InMemoryRefreshTokensRepository
  let sut: RefreshTokenUseCase
  let userId: string

  beforeEach(async () => {
    usersRepository = new InMemoryUsersRepository()
    refreshTokensRepository = new InMemoryRefreshTokensRepository()
    sut = new RefreshTokenUseCase(usersRepository, refreshTokensRepository)
    const user = await usersRepository.create({ name: 'Dr. Gustavo', email: 'g@g.com', passwordHash: 'hash', role: 'OWNER' })
    userId = user.id
  })

  it('deve rotacionar: invalidar o antigo e emitir novo token', async () => {
    const expiresAt = new Date(); expiresAt.setDate(expiresAt.getDate() + 7)
    await refreshTokensRepository.create({ token: 'token-antigo', userId, expiresAt })

    const result = await sut.execute({ refreshToken: 'token-antigo' })

    expect(result.refreshToken).not.toBe('token-antigo')
    expect(refreshTokensRepository.items).toHaveLength(1)
    expect(refreshTokensRepository.items[0].token).toBe(result.refreshToken)
  })

  it('deve lançar 401 para token inexistente', async () => {
    await expect(sut.execute({ refreshToken: 'token-invalido' })).rejects.toMatchObject({ statusCode: 401 })
  })

  it('deve lançar 401 e deletar token expirado', async () => {
    await refreshTokensRepository.create({ token: 'token-expirado', userId, expiresAt: new Date('2020-01-01') })
    await expect(sut.execute({ refreshToken: 'token-expirado' })).rejects.toMatchObject({ statusCode: 401 })
    expect(refreshTokensRepository.items).toHaveLength(0)
  })

  it('deve retornar os dados do usuário no output', async () => {
    const expiresAt = new Date(); expiresAt.setDate(expiresAt.getDate() + 7)
    await refreshTokensRepository.create({ token: 'token-valido', userId, expiresAt })
    const result = await sut.execute({ refreshToken: 'token-valido' })
    expect(result.user.email).toBe('g@g.com')
  })
})
