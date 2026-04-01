import { prisma } from '../../../../config/prisma'
import type { IVaccinationsRepository, CreateVaccinationDTO, Vaccination, VaccinationStatus } from '../../repositories/IVaccinationsRepository'

export class PrismaVaccinationsRepository implements IVaccinationsRepository {
  async create(data: CreateVaccinationDTO): Promise<Vaccination> {
    return prisma.vaccination.create({ data })
  }

  async listByPatient(patientId: string): Promise<Vaccination[]> {
    return prisma.vaccination.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findById(id: string): Promise<Vaccination | null> {
    return prisma.vaccination.findUnique({ where: { id } })
  }

  async updateStatus(id: string, status: VaccinationStatus): Promise<Vaccination> {
    return prisma.vaccination.update({ where: { id }, data: { status } })
  }
}
