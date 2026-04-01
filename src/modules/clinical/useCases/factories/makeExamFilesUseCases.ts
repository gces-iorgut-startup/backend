import { PrismaPatientsRepository } from '../../../patient/infra/repositories/PrismaPatientsRepository'
import { PrismaExamFilesRepository } from '../../infra/repositories/PrismaExamFilesRepository'
import { UploadExamFileUseCase } from '../exams/uploadExamFileUseCase'
import { ListPatientExamsUseCase } from '../exams/listPatientExamsUseCase'

export function makeUploadExamFileUseCase() {
  const examFilesRepository = new PrismaExamFilesRepository()
  const patientsRepository = new PrismaPatientsRepository()
  return new UploadExamFileUseCase(examFilesRepository, patientsRepository)
}

export function makeListPatientExamsUseCase() {
  const examFilesRepository = new PrismaExamFilesRepository()
  return new ListPatientExamsUseCase(examFilesRepository)
}
