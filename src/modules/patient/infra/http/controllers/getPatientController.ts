import type { FastifyRequest, FastifyReply } from 'fastify'
import { makeGetPatientUseCase } from '../../../useCases/factories/makeGetPatientUseCase'

export async function getPatientController(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  const useCase = makeGetPatientUseCase()
  const patient = await useCase.execute(request.params.id)
  return reply.status(200).send({ patient })
}
