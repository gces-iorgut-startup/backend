import { prisma } from '../../../../config/prisma'
import type {
  IPatientsRepository, CreatePatientDTO, UpdatePatientDTO, ListPatientsDTO, PatientWithTutor,
} from '../../repositories/IPatientsRepository'
import type { Patient } from '@prisma/client'

const withTutor = { tutor: true } as const

export class PrismaPatientsRepository implements IPatientsRepository {
  async create(data: CreatePatientDTO): Promise<Patient> {
    return prisma.patient.create({ data })
  }

  async findById(id: string): Promise<PatientWithTutor | null> {
    return prisma.patient.findUnique({ where: { id }, include: withTutor })
  }

  async update(id: string, data: UpdatePatientDTO): Promise<Patient> {
    return prisma.patient.update({ where: { id }, data })
  }

  async list({ search, tutorId, page = 1, perPage = 20 }: ListPatientsDTO): Promise<{ patients: PatientWithTutor[]; total: number }> {
    const where = {
      ...(tutorId && { tutorId }),
      ...(search && { name: { contains: search, mode: 'insensitive' as const } }),
    }

    const [patients, total] = await Promise.all([
      prisma.patient.findMany({ where, include: withTutor, skip: (page - 1) * perPage, take: perPage, orderBy: { name: 'asc' } }),
      prisma.patient.count({ where }),
    ])

    return { patients, total }
  }
}
