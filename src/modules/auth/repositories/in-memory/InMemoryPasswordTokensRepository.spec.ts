import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryPasswordTokensRepository } from './InMemoryPasswordTokensRepository'
import type { PasswordToken } from '../IPasswordTokensRepository'

const inOneHour = () => new Date(Date.now() + 3600 * 1000)
const isExpired = (token: PasswordToken | null) => token!.expiresAt.getTime() <= Date.now()

describe('InMemoryPasswordTokensRepository', () => {
  let repository: InMemoryPasswordTokensRepository

  beforeEach(() => {
    repository = new InMemoryPasswordTokensRepository()
  })

  it('deve criar e buscar um token com o seu tipo', async () => {
    await repository.create('user-1', 'token-abc', inOneHour(), 'FIRST_ACCESS')

    const token = await repository.findByToken('token-abc')
    expect(token).toBeDefined()
    expect(token?.userId).toBe('user-1')
    expect(token?.type).toBe('FIRST_ACCESS')
    expect(token?.usedAt).toBeNull()
  })

  it('deve marcar um token como usado apenas uma vez', async () => {
    await repository.create('user-1', 'token-abc', inOneHour(), 'RECOVERY')

    await expect(repository.markAsUsed('token-abc')).resolves.toBe(true)
    await expect(repository.markAsUsed('token-abc')).resolves.toBe(false)

    const token = await repository.findByToken('token-abc')
    expect(token?.usedAt).toBeInstanceOf(Date)
  })

  it('não deve marcar como usado um token expirado', async () => {
    await repository.create('user-1', 'token-expirado', new Date(Date.now() - 1000), 'RECOVERY')

    await expect(repository.markAsUsed('token-expirado')).resolves.toBe(false)
    expect((await repository.findByToken('token-expirado'))?.usedAt).toBeNull()
  })

  it('deve retornar false ao marcar um token inexistente', async () => {
    await expect(repository.markAsUsed('nao-existe')).resolves.toBe(false)
  })

  it('deve invalidar apenas tokens pendentes do usuário especificado, sem marcá-los como usados', async () => {
    // 2 tokens para user-1 (um já usado, outro pendente)
    await repository.create('user-1', 'token-1', inOneHour(), 'FIRST_ACCESS')
    await repository.create('user-1', 'token-2', inOneHour(), 'FIRST_ACCESS')
    await repository.markAsUsed('token-1')

    // 1 token para user-2 (pendente)
    await repository.create('user-2', 'token-3', inOneHour(), 'FIRST_ACCESS')

    await repository.invalidatePreviousTokens('user-1')

    const token1 = await repository.findByToken('token-1')
    const token2 = await repository.findByToken('token-2')
    const token3 = await repository.findByToken('token-3')

    expect(token1?.usedAt).toBeInstanceOf(Date)
    expect(token2?.usedAt).toBeNull()
    expect(isExpired(token2)).toBe(true)
    await expect(repository.markAsUsed('token-2')).resolves.toBe(false)
    expect(token3?.usedAt).toBeNull()
    expect(isExpired(token3)).toBe(false)
  })

  it('deve invalidar apenas tokens do tipo informado', async () => {
    await repository.create('user-1', 'invite', inOneHour(), 'FIRST_ACCESS')
    await repository.create('user-1', 'recovery', inOneHour(), 'RECOVERY')

    await repository.invalidatePreviousTokens('user-1', 'FIRST_ACCESS')

    expect(isExpired(await repository.findByToken('invite'))).toBe(true)
    expect(isExpired(await repository.findByToken('recovery'))).toBe(false)
  })
})
