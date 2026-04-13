import { describe, it, expect, beforeEach } from 'vitest'
import { InMemoryPatientsRepository } from '../patient/repositories/in-memory/InMemoryPatientsRepository'
import { InMemoryExamFilesRepository } from './repositories/in-memory/InMemoryExamFilesRepository'
import { UploadExamFileUseCase } from './useCases/exams/uploadExamFileUseCase'
import { ListPatientExamsUseCase } from './useCases/exams/listPatientExamsUseCase'

describe('Exam Files Use Cases', () => {
  let patientsRepository: InMemoryPatientsRepository
  let examFilesRepository: InMemoryExamFilesRepository
  let uploadUseCase: UploadExamFileUseCase
  let listUseCase: ListPatientExamsUseCase

  beforeEach(() => {
    patientsRepository = new InMemoryPatientsRepository()
    examFilesRepository = new InMemoryExamFilesRepository()

    uploadUseCase = new UploadExamFileUseCase(examFilesRepository, patientsRepository)
    listUseCase = new ListPatientExamsUseCase(examFilesRepository)
  })

  it('should upload an exam file', async () => {
    const patient = await patientsRepository.create({
      name: 'Luna',
      species: 'Cat',
      tutorId: 'tutor-xyz',
      clinicId: 'clinic-1',
    })

    const file = await uploadUseCase.execute({
      patientId: patient.id,
      clinicId: 'clinic-1',
      fileName: 'exam_result.pdf',
      fileUrl: '/uploads/abc-def.pdf',
      fileType: 'pdf',
    })

    expect(file.id).toBeDefined()
    expect(file.fileUrl).toBe('/uploads/abc-def.pdf')
  })

  it('should not allow upload for non-existent patient', async () => {
    await expect(uploadUseCase.execute({
      patientId: 'invalid-id',
      clinicId: 'clinic-1',
      fileName: 'image.png',
      fileUrl: '/uploads/img.png',
      fileType: 'image',
    })).rejects.toThrow('Paciente não encontrado')
  })

  it('should list all patient exam files', async () => {
    const patient = await patientsRepository.create({
      name: 'Luna',
      species: 'Cat',
      tutorId: 'tutor-xyz',
      clinicId: 'clinic-1',
    })

    await uploadUseCase.execute({
      patientId: patient.id,
      clinicId: 'clinic-1',
      fileName: 'blood_test.pdf',
      fileUrl: '/uploads/blood.pdf',
      fileType: 'pdf',
    })

    await uploadUseCase.execute({
      patientId: patient.id,
      clinicId: 'clinic-1',
      fileName: 'xray.png',
      fileUrl: '/uploads/xray.png',
      fileType: 'image',
    })

    const exams = await listUseCase.execute({ patientId: patient.id })
    expect(exams.length).toBe(2)
    // Results are ordered by uploadedAt desc, so length 2 is guaranteed anyway
  })
})
