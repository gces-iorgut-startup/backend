import type { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeGeneratePrescriptionUseCase } from '../../../useCases/factories/makeClinicalRecordsUseCases'

export const generatePrescriptionParamsSchema = z.object({
  id: z.string().uuid(),
})

export async function generatePrescriptionController(
  request: FastifyRequest<{ Params: z.infer<typeof generatePrescriptionParamsSchema> }>,
  reply: FastifyReply
) {
  const { id } = request.params

  const useCase = makeGeneratePrescriptionUseCase()
  const pdfBuffer = await useCase.execute({ recordId: id })

  return reply
    .header('Content-Type', 'application/pdf')
    .header('Content-Disposition', `attachment; filename="receita-${id}.pdf"`)
    .status(200)
    .send(pdfBuffer)
}
