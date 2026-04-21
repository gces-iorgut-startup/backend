import { Resend } from 'resend'
import { Errors } from '../../../../core/errors'
import { env } from '../../../../config/env'
import { FastifyBaseLogger } from 'fastify'

export class ResendMailProvider {
  private client: Resend

  constructor(private logger?: FastifyBaseLogger) {
    this.client = new Resend(env.RESEND_API_KEY)
  }

  isConfigured(): boolean {
    return env.RESEND_API_KEY.length > 0 && env.MAIL_FROM.length > 0
  }

  assertConfigured(): void {
    if (this.isConfigured()) return

    this.logger?.error('Recuperacao de senha indisponivel: RESEND_API_KEY ou MAIL_FROM nao configurados')
    throw Errors.serviceUnavailable('Recuperação de senha indisponível no momento.')
  }

  async sendMail({ to, subject, html }: { to: string, subject: string, html: string }): Promise<void> {
    this.assertConfigured()

    const response = await this.client.emails.send({
      from: env.MAIL_FROM,
      to,
      subject,
      html,
    })

    if (response.error) {
      this.logger?.error({ error: response.error, to }, 'Falha ao enviar e-mail via Resend')
      throw new Error(response.error.message)
    }

    this.logger?.info({ emailId: response.data?.id, to }, 'E-mail enviado com sucesso')
  }
}
