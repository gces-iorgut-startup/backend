import type { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeListPatientVaccinationsUseCase } from '../../../useCases/factories/makeVaccinationUseCases'

export const listPatientVaccinationsParamsSchema = z.object({
  patientId: z.string().uuid(),
})

export async function listPatientVaccinationsController(
  request: FastifyRequest<{ Params: z.infer<typeof listPatientVaccinationsParamsSchema> }>,
  reply: FastifyReply
) {
  const { patientId } = request.params

  const useCase = makeListPatientVaccinationsUseCase()

  const vaccinations = await useCase.execute({ patientId })

  return reply.status(200).send({ items: vaccinations })
}
