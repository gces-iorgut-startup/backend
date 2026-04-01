import { AppError } from '../../../../shared/errors/app-error'
import type { IExamFilesRepository } from '../../repositories/IExamFilesRepository'
import type { IPatientsRepository } from '../../../patient/repositories/IPatientsRepository'
import type { ExamFile } from '@prisma/client'

interface UploadExamFileRequest {
  patientId: string
  clinicalRecordId?: string
  fileName: string
  fileUrl: string
  fileType: string
}

export class UploadExamFileUseCase {
  constructor(
    private examFilesRepository: IExamFilesRepository,
    private patientsRepository: IPatientsRepository
  ) {}

  async execute({
    patientId,
    clinicalRecordId,
    fileName,
    fileUrl,
    fileType,
  }: UploadExamFileRequest): Promise<ExamFile> {
    const patient = await this.patientsRepository.findById(patientId)

    if (!patient) {
      throw new AppError('Paciente não encontrado.', 404)
    }

    return this.examFilesRepository.create({
      patientId,
      clinicalRecordId,
      fileName,
      fileUrl,
      fileType,
    })
  }
}
