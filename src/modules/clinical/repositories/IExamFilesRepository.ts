import type { ExamFile } from '@prisma/client'

export type { ExamFile }

export interface CreateExamFileDTO {
  patientId: string
  clinicalRecordId?: string
  fileName: string
  fileUrl: string
  fileType: string
}

export interface IExamFilesRepository {
  create(data: CreateExamFileDTO): Promise<ExamFile>
  listByPatient(patientId: string): Promise<ExamFile[]>
  delete(id: string): Promise<void>
}
