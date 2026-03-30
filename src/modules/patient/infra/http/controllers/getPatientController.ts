import type { FastifyRequest, FastifyReply } from 'fastify'
import { makeGetPatientUseCase } from '../../../useCases/factories/makeGetPatientUseCase'
import { z } from 'zod'

export const getPatientParamsSchema = z.object({ id: z.string().uuid() })

export async function getPatientController(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  const useCase = makeGetPatientUseCase()
  const patient = await useCase.execute(request.params.id)
  return reply.status(200).send({ patient })
}
