import type { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeCreateVetUseCase } from '../../../useCases/factories/makeCreateVetUseCase'
import type { Role } from '@prisma/client'

export const registerVetBodySchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  crmv: z.string().trim().min(2).max(40).optional(),
})

export async function registerVetController(request: FastifyRequest, reply: FastifyReply) {
  const body = registerVetBodySchema.parse(request.body)
  const { clinicId } = request.user as { userId: string; role: Role; clinicId: string }
  const useCase = makeCreateVetUseCase()
  const user = await useCase.execute({ ...body, clinicId })
  return reply.status(201).send({ user })
}
