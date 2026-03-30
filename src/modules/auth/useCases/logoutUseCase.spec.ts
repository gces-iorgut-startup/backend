import { describe, it, expect, beforeEach } from 'vitest'
import { LogoutUseCase } from './logoutUseCase'
import { InMemoryRefreshTokensRepository } from '../repositories/in-memory/InMemoryRefreshTokensRepository'

describe('LogoutUseCase', () => {
  let refreshTokensRepository: InMemoryRefreshTokensRepository
  let sut: LogoutUseCase

  beforeEach(() => {
    refreshTokensRepository = new InMemoryRefreshTokensRepository()
    sut = new LogoutUseCase(refreshTokensRepository)
  })

  it('deve remover todos os refresh tokens do usuário', async () => {
    const expiresAt = new Date()
    await refreshTokensRepository.create({ token: 'token-1', userId: 'user-1', expiresAt })
    await refreshTokensRepository.create({ token: 'token-2', userId: 'user-1', expiresAt })
    await refreshTokensRepository.create({ token: 'token-3', userId: 'user-2', expiresAt })

    await sut.execute('user-1')

    expect(refreshTokensRepository.items).toHaveLength(1)
    expect(refreshTokensRepository.items[0].userId).toBe('user-2')
  })

  it('não deve falhar se o usuário não tiver tokens', async () => {
    await expect(sut.execute('user-sem-tokens')).resolves.not.toThrow()
  })
})
