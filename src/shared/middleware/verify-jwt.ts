import { z } from 'zod'
import type { FastifyReply, FastifyRequest } from 'fastify'

const accessTokenPayloadSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(['OWNER', 'VET', 'TUTOR']),
  clinicId: z.string().min(1),
})

export async function verifyJwt(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify()

    const parsedPayload = accessTokenPayloadSchema.safeParse(request.user)
    if (!parsedPayload.success) {
      return reply.status(401).send({ message: 'Token inválido ou expirado.' })
    }
  } catch {
    return reply.status(401).send({ message: 'Token inválido ou expirado.' })
  }
}
