import { Resend } from 'resend'
import { env } from '../../../../config/env'
import { FastifyBaseLogger } from 'fastify'

export class ResendMailProvider {
  private client: Resend

  constructor(private logger?: FastifyBaseLogger) {
    this.client = new Resend(env.RESEND_API_KEY)
  }

  async sendMail({ to, subject, html }: { to: string, subject: string, html: string }): Promise<void> {
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