import type { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeFinalizeClinicalRecordUseCase } from '../../../useCases/factories/makeClinicalRecordsUseCases'

export const finalizeClinicalRecordParamsSchema = z.object({
  id: z.string().uuid(),
})

export async function finalizeClinicalRecordController(
  request: FastifyRequest<{ Params: z.infer<typeof finalizeClinicalRecordParamsSchema> }>,
  reply: FastifyReply
) {
  const { id } = request.params
  const vetId = request.user.userId

  const useCase = makeFinalizeClinicalRecordUseCase()

  const record = await useCase.execute({
    recordId: id,
    vetId,
  })

  return reply.status(200).send(record)
}
