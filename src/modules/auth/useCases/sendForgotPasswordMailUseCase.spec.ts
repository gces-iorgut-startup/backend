import jwt from 'jsonwebtoken'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { InMemoryUsersRepository } from '../repositories/in-memory/InMemoryUsersRepository'
import { InMemoryPasswordTokensRepository } from '../repositories/in-memory/InMemoryPasswordTokensRepository'

class FakeMailProvider {
  public sentMessages: Array<{ to: string; subject: string; html: string }> = []

  assertConfigured(): void {}

  async sendMail(message: { to: string; subject: string; html: string }): Promise<void> {
    this.sentMessages.push(message)
  }
}

describe('SendForgotPasswordMailUseCase', () => {
  let usersRepository: InMemoryUsersRepository
  let passwordTokensRepository: InMemoryPasswordTokensRepository
  let mailProvider: FakeMailProvider
  let SendForgotPasswordMailUseCase: typeof import('./sendForgotPasswordMailUseCase').SendForgotPasswordMailUseCase

  beforeEach(async () => {
    process.env.DATABASE_URL = 'postgresql://iougurt:iougurt@localhost:5432/iougurt?schema=public'
    process.env.JWT_SECRET = 'access-secret'
    process.env.PASSWORD_RESET_SECRET = 'password-reset-secret'

    vi.resetModules()
    ;({ SendForgotPasswordMailUseCase } = await import('./sendForgotPasswordMailUseCase'))

    usersRepository = new InMemoryUsersRepository()
    passwordTokensRepository = new InMemoryPasswordTokensRepository()
    mailProvider = new FakeMailProvider()
  })

  it('deve gerar token com secret exclusivo e purpose de reset de senha', async () => {
    const user = await usersRepository.create({
      name: 'Dr. Gustavo',
      email: 'gustavo@iougurt.com',
      passwordHash: 'hash',
      role: 'OWNER',
      clinicId: 'clinic-1',
    })
    const sut = new SendForgotPasswordMailUseCase(
      usersRepository,
      passwordTokensRepository,
      mailProvider as never,
    )

    await sut.execute({ email: user.email })

    expect(passwordTokensRepository.items).toHaveLength(1)
    expect(mailProvider.sentMessages).toHaveLength(1)

    const payload = jwt.verify(
      passwordTokensRepository.items[0].token,
      process.env.PASSWORD_RESET_SECRET!,
    )

    expect(typeof payload).toBe('object')
    expect(payload).toMatchObject({
      sub: user.id,
      purpose: 'password-reset',
    })
  })

  it('nao deve criar token nem enviar email para usuario inexistente', async () => {
    const sut = new SendForgotPasswordMailUseCase(
      usersRepository,
      passwordTokensRepository,
      mailProvider as never,
    )

    await sut.execute({ email: 'naoexiste@iougurt.com' })

    expect(passwordTokensRepository.items).toHaveLength(0)
    expect(mailProvider.sentMessages).toHaveLength(0)
  })
})
