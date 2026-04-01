import { prisma } from '../../../../config/prisma'
import type { IExamFilesRepository, CreateExamFileDTO, ExamFile } from '../../repositories/IExamFilesRepository'

export class PrismaExamFilesRepository implements IExamFilesRepository {
  async create(data: CreateExamFileDTO): Promise<ExamFile> {
    return prisma.examFile.create({ data })
  }

  async listByPatient(patientId: string): Promise<ExamFile[]> {
    return prisma.examFile.findMany({
      where: { patientId },
      orderBy: { uploadedAt: 'desc' },
    })
  }

  async delete(id: string): Promise<void> {
    await prisma.examFile.delete({ where: { id } })
  }
}
