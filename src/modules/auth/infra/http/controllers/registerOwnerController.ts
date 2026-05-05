import type { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { isValidCnpj, onlyDigits } from '@shared/documents'
import { makeCreateOwnerUseCase } from '../../../useCases/factories/makeCreateOwnerUseCase'

export const registerOwnerBodySchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  clinicName: z.string().min(2, 'Nome da clínica é obrigatório'),
  clinicCnpj: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || isValidCnpj(v), { message: 'CNPJ inválido' }),
  clinicAddress: z.string().trim().min(3).max(200).optional(),
  clinicPhone: z.string().trim().min(8).max(30).optional(),
  crmv: z.string().trim().min(2).max(40).optional(),
})

export async function registerOwnerController(request: FastifyRequest, reply: FastifyReply) {
  const parsed = registerOwnerBodySchema.parse(request.body)
  const body = {
    ...parsed,
    clinicCnpj: parsed.clinicCnpj ? onlyDigits(parsed.clinicCnpj) : undefined,
  }
  const useCase = makeCreateOwnerUseCase()
  const result = await useCase.execute(body)
  return reply.status(201).send({ user: result })
}
