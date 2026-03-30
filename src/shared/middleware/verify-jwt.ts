import { AppError } from '../errors/app-error'
import type { FastifyReply, FastifyRequest } from 'fastify'

export function verifyJwt(request: FastifyRequest, reply: FastifyReply) {
  try {
    request.jwtVerify()
  } catch {
    throw new AppError('Token inválido ou expirado.', 401)
  }
}
