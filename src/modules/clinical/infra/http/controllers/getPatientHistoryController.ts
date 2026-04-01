import type { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeGetPatientHistoryUseCase } from '../../../useCases/factories/makeClinicalRecordsUseCases'

export const getPatientHistoryParamsSchema = z.object({
  patientId: z.string().uuid(),
})

export async function getPatientHistoryController(
  request: FastifyRequest<{ Params: z.infer<typeof getPatientHistoryParamsSchema> }>,
  reply: FastifyReply
) {
  const { patientId } = request.params
  // Optional: check if user has access to patient history

  const useCase = makeGetPatientHistoryUseCase()

  const history = await useCase.execute({
    patientId,
  })

  return reply.status(200).send({ items: history })
}
