import type { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeUpdatePatientUseCase } from '../../../useCases/factories/makeUpdatePatientUseCase'

export const updatePatientBodySchema = z.object({
  name: z.string().min(1).optional(),
  species: z.string().optional(),
  breed: z.string().optional(),
  birthDate: z.coerce.date().optional(),
  sex: z.string().optional(),
  weightKg: z.number().max(999.99).optional(),
  observations: z.string().optional(),
  microchip: z.string().optional(),
  allergies: z.string().optional(),
  photoUrl: z.string().optional(),
  tutor: z.object({
    cpf: z.string().length(11).optional(),
    fullName: z.string().min(2).optional(),
    phone: z.string().min(10).optional(),
    email: z.string().email().optional(),
    address: z.string().optional(),
    insurance: z.string().optional(),
  }).optional(),
})

export async function updatePatientController(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) {
  const { clinicId } = request.user
  const body = updatePatientBodySchema.parse(request.body)
  const useCase = makeUpdatePatientUseCase()
  const patient = await useCase.execute({ id: request.params.id, clinicId, ...body })
  return reply.status(200).send({ patient })
}
