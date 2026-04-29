import type { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeGenerateAISummaryUseCase } from '../../../useCases/factories/makeClinicalRecordsUseCases'

export const generateAISummaryParamsSchema = z.object({
  id: z.string().uuid(),
})

export async function generateAISummaryController(
  request: FastifyRequest<{ Params: z.infer<typeof generateAISummaryParamsSchema> }>,
  reply: FastifyReply
) {
  const { id } = request.params
  const { clinicId, userId: vetId } = request.user

  const useCase = makeGenerateAISummaryUseCase()
  const result = await useCase.execute({ recordId: id, clinicId, vetId })

  return reply.status(200).send(result)
}
