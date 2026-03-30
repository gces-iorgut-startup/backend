import type { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeCreatePatientUseCase } from '../../../useCases/factories/makeCreatePatientUseCase'

export const createPatientBodySchema = z.object({
  name: z.string().min(1),
  tutorId: z.string().uuid(),
  species: z.string().min(1),
  breed: z.string().optional(),
  birthDate: z.string().datetime().optional().transform(v => v ? new Date(v) : undefined),
  microchip: z.string().optional(),
  allergies: z.string().optional(),
  photoUrl: z.string().url().optional(),
})

export async function createPatientController(request: FastifyRequest, reply: FastifyReply) {
  const body = createPatientBodySchema.parse(request.body)
  const useCase = makeCreatePatientUseCase()
  const patient = await useCase.execute(body)
  return reply.status(201).send({ patient })
}
