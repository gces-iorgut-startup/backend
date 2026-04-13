import type { FastifyRequest, FastifyReply } from 'fastify'
import { makeUploadExamFileUseCase } from '../../../useCases/factories/makeExamFilesUseCases'
import { randomUUID } from 'crypto'
import fs from 'fs'
import path from 'path'
import { pipeline } from 'stream/promises'
import { fileURLToPath } from 'url'
import { AppError } from '@shared/errors/app-error'

const UPLOADS_DIR = path.join(process.cwd(), 'uploads')

export async function uploadExamFileController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const data = await request.file()

  if (!data) {
    throw new AppError('Nenhum arquivo enviado.', 400)
  }

  const patientIdField = data.fields.patientId as unknown as { value: string } | undefined
  const patientId = patientIdField?.value

  const clinicalRecordIdField = data.fields.clinicalRecordId as unknown as { value: string } | undefined
  const clinicalRecordId = clinicalRecordIdField?.value

  if (!patientId) {
    throw new AppError('patientId é obrigatório.', 400)
  }

  const fileExt = path.extname(data.filename)
  const uniqueName = `${randomUUID()}${fileExt}`
  const filePath = path.join(UPLOADS_DIR, uniqueName)

  await pipeline(data.file, fs.createWriteStream(filePath))

  const fileUrl = `/uploads/${uniqueName}`
  const fileType = data.mimetype.startsWith('image/') ? 'image' : 'pdf'

  const useCase = makeUploadExamFileUseCase()

  const clinicId = request.user.clinicId

  const examFile = await useCase.execute({
    patientId,
    clinicId,
    clinicalRecordId,
    fileName: data.filename,
    fileUrl,
    fileType,
  })

  return reply.status(201).send(examFile)
}
