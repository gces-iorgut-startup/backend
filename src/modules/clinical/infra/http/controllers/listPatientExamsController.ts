import type { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeListPatientExamsUseCase } from '../../../useCases/factories/makeExamFilesUseCases'

export const listPatientExamsParamsSchema = z.object({
  patientId: z.string().uuid(),
})

export async function listPatientExamsController(
  request: FastifyRequest<{ Params: z.infer<typeof listPatientExamsParamsSchema> }>,
  reply: FastifyReply
) {
  const { patientId } = request.params

  const useCase = makeListPatientExamsUseCase()

  const exams = await useCase.execute({ patientId })

  return reply.status(200).send({ items: exams })
}
