import type { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { prisma } from '@config/prisma'
import { Errors } from '../../../../../core/errors'

const userSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  crmv: true,
  avatarUrl: true,
  clinicId: true,
  createdAt: true,
  updatedAt: true,
} as const

export const updateUserBodySchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  crmv: z.string().trim().min(2).max(40).nullable().optional(),
})

export async function getMeController(request: FastifyRequest, reply: FastifyReply) {
  const { userId } = request.user
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: userSelect,
  })
  if (!user) throw Errors.notFound('Usuário não encontrado')
  return reply.send({ user })
}

export async function updateMeController(request: FastifyRequest, reply: FastifyReply) {
  const { userId } = request.user
  const body = updateUserBodySchema.parse(request.body)

  const data: Record<string, unknown> = {}
  if (body.name !== undefined) data.name = body.name
  if (body.crmv !== undefined) data.crmv = body.crmv?.trim() || null

  const user = await prisma.user.update({
    where: { id: userId },
    data,
    select: userSelect,
  })

  return reply.send({ user })
}
