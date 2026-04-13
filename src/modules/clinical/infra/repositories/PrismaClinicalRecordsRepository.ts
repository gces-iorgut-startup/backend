import { prisma } from '../../../../config/prisma'
import type {
  IClinicalRecordsRepository,
  CreateClinicalRecordDTO,
  UpdateClinicalRecordDTO,
} from '../../repositories/IClinicalRecordsRepository'
import type { ClinicalRecord } from '@prisma/client'

export class PrismaClinicalRecordsRepository implements IClinicalRecordsRepository {
  async create(data: CreateClinicalRecordDTO): Promise<ClinicalRecord> {
    return prisma.clinicalRecord.create({ data })
  }

  async findById(id: string, clinicId: string): Promise<ClinicalRecord | null> {
    return prisma.clinicalRecord.findFirst({ where: { id, patient: { clinicId } } })
  }

  async findByAppointmentId(appointmentId: string): Promise<ClinicalRecord | null> {
    return prisma.clinicalRecord.findUnique({ where: { appointmentId } })
  }

  async update(id: string, data: UpdateClinicalRecordDTO): Promise<ClinicalRecord> {
    return prisma.clinicalRecord.update({ where: { id }, data: { ...data } })
  }

  async listByPatient(patientId: string): Promise<ClinicalRecord[]> {
    return prisma.clinicalRecord.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
    })
  }
}
