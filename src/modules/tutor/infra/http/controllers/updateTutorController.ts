import type { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeUpdateTutorUseCase } from '../../../useCases/factories/makeUpdateTutorUseCase'

export const updateTutorBodySchema = z.object({
  cpf: z.string().length(11).optional(),
  fullName: z.string().min(2).optional(),
  phone: z.string().min(10).optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  insurance: z.string().optional(),
})

export async function updateTutorController(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) {
  const { clinicId } = request.user
  const body = updateTutorBodySchema.parse(request.body)
  const useCase = makeUpdateTutorUseCase()
  const tutor = await useCase.execute({ id: request.params.id, clinicId, ...body })
  return reply.status(200).send({ tutor })
}
