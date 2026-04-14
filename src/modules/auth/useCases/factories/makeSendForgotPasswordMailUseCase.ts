import { FastifyBaseLogger } from 'fastify'
import { PrismaUsersRepository } from '../../infra/repositories/PrismaUsersRepository'
import { PrismaPasswordTokensRepository } from '../../infra/repositories/PrismaPasswordTokensRepository'
import { ResendMailProvider } from '../../infra/providers/ResendMailProvider'
import { SendForgotPasswordMailUseCase } from '../sendForgotPasswordMailUseCase'

export function makeSendForgotPasswordMailUseCase(logger?: FastifyBaseLogger) {
  return new SendForgotPasswordMailUseCase(
    new PrismaUsersRepository(),
    new PrismaPasswordTokensRepository(),
    new ResendMailProvider(logger),
  )
}