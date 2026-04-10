import type { FastifyReply, FastifyRequest } from 'fastify'
import type { Role } from '@prisma/client'

export function verifyRole(...allowedRoles: Role[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const { role } = request.user
    if (!allowedRoles.includes(role)) {
      return reply.status(403).send({ message: 'Acesso não autorizado para este perfil.' })
    }
  }
}
