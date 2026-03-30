import type { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeUpdatePatientUseCase } from '../../../useCases/factories/makeUpdatePatientUseCase'

const bodySchema = z.object({
  name: z.string().min(1).optional(),
  species: z.string().optional(),
  breed: z.string().optional(),
  birthDate: z.string().datetime().optional().transform(v => v ? new Date(v) : undefined),
  microchip: z.string().optional(),
  allergies: z.string().optional(),
  photoUrl: z.string().url().optional(),
})

export async function updatePatientController(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) {
  const body = bodySchema.parse(request.body)
  const useCase = makeUpdatePatientUseCase()
  const patient = await useCase.execute({ id: request.params.id, ...body })
  return reply.status(200).send({ patient })
}
