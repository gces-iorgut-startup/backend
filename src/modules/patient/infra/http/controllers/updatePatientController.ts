import type { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeUpdatePatientUseCase } from '../../../useCases/factories/makeUpdatePatientUseCase'

export const updatePatientBodySchema = z.object({
  name: z.string().min(1).optional(),
  species: z.string().optional(),
  breed: z.string().optional(),
  birthDate: z.coerce.date().optional(),
  sex: z.string().optional(),
  weightKg: z.number().optional(),
  observations: z.string().optional(),
  microchip: z.string().optional(),
  allergies: z.string().optional(),
  photoUrl: z.string().optional(),
})

export async function updatePatientController(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) {
  const body = updatePatientBodySchema.parse(request.body)
  const useCase = makeUpdatePatientUseCase()
  const patient = await useCase.execute({ id: request.params.id, ...body })
  return reply.status(200).send({ patient })
}
