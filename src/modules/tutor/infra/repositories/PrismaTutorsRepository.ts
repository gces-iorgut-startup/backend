import { prisma } from '../../../../config/prisma'
import type { ITutorsRepository, CreateTutorDTO, UpdateTutorDTO, ListTutorsDTO } from '../../repositories/ITutorsRepository'
import type { Tutor } from '@prisma/client'

export class PrismaTutorsRepository implements ITutorsRepository {
  async create(data: CreateTutorDTO): Promise<Tutor> {
    return prisma.tutor.create({ data })
  }

  async findById(id: string, clinicId: string): Promise<Tutor | null> {
    return prisma.tutor.findFirst({ where: { id, clinicId } })
  }

  async findByCpf(cpf: string, clinicId: string): Promise<Tutor | null> {
    return prisma.tutor.findUnique({ where: { cpf_clinicId: { cpf, clinicId } } })
  }

  async findByEmail(email: string, clinicId: string): Promise<Tutor | null> {
    return prisma.tutor.findUnique({ where: { email_clinicId: { email, clinicId } } })
  }

  async list({ clinicId, search, page = 1, perPage = 20 }: ListTutorsDTO): Promise<{ tutors: Tutor[]; total: number }> {
    const where = {
      clinicId,
      ...(search && { fullName: { contains: search, mode: 'insensitive' as const } }),
    }

    const [tutors, total] = await Promise.all([
      prisma.tutor.findMany({ where, skip: (page - 1) * perPage, take: perPage, orderBy: { fullName: 'asc' } }),
      prisma.tutor.count({ where }),
    ])

    return { tutors, total }
  }

  async update(id: string, data: UpdateTutorDTO): Promise<Tutor> {
    return prisma.tutor.update({ where: { id }, data })
  }
}
