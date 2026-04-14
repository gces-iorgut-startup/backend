import jwt from 'jsonwebtoken'
import { env } from '../../../config/env'
import type { IUsersRepository } from '../repositories/IUsersRepository'
import type { IPasswordTokensRepository } from '../repositories/IPasswordTokensRepository'
import type { ResendMailProvider } from '../infra/providers/ResendMailProvider'

export class SendForgotPasswordMailUseCase {
  constructor(
    private usersRepository: IUsersRepository,
    private passwordTokensRepository: IPasswordTokensRepository,
    private mailProvider: ResendMailProvider,
  ) {}

  async execute({ email }: { email: string }): Promise<void> {
    const user = await this.usersRepository.findByEmail(email.toLowerCase().trim())

    if (!user) return

    const token = jwt.sign({ sub: user.id }, env.JWT_SECRET, { expiresIn: '2h' })
    
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 2)

    await this.passwordTokensRepository.create(user.id, token, expiresAt)

    const resetUrl = `${env.APP_URL}/reset-password?token=${token}`

    // TO-DO: Rever o template do email enviado

    await this.mailProvider.sendMail({
      to: email,
      subject: '[IOUGURT] Recuperação de Senha',
      html: `<p>Olá, ${user.name}! Use este link: <a href="${resetUrl}">Redefinir Senha</a></p>`,
    })
  }
}