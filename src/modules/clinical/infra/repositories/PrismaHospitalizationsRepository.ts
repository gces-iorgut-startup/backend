import { prisma } from '../../../../config/prisma'
import type {
  CreateHospitalizationDTO,
  CreateHospitalizationEvolutionDTO,
  DischargeHospitalizationDTO,
  Hospitalization,
  HospitalizationDetails,
  HospitalizationEvolution,
  HospitalizationWithPatient,
  IHospitalizationsRepository,
} from '../../repositories/IHospitalizationsRepository'
import { OPEN_HOSPITALIZATION_STATUSES } from '../../repositories/IHospitalizationsRepository'

const PATIENT_CARD_SELECT = {
  id: true,
  name: true,
  species: true,
  photoUrl: true,
} as const

const VET_SELECT = { id: true, name: true } as const

export class PrismaHospitalizationsRepository implements IHospitalizationsRepository {
  async create(data: CreateHospitalizationDTO): Promise<Hospitalization> {
    return prisma.hospitalization.create({ data })
  }

  async findOpenByPatient(patientId: string): Promise<Hospitalization | null> {
    return prisma.hospitalization.findFirst({
      where: { patientId, status: { in: [...OPEN_HOSPITALIZATION_STATUSES] } },
    })
  }

  async findById(id: string, clinicId: string): Promise<Hospitalization | null> {
    return prisma.hospitalization.findFirst({ where: { id, clinicId } })
  }

  async findDetailsById(id: string, clinicId: string): Promise<HospitalizationDetails | null> {
    return prisma.hospitalization.findFirst({
      where: { id, clinicId },
      include: {
        patient: { select: PATIENT_CARD_SELECT },
        admittedByVet: { select: VET_SELECT },
        evolutions: {
          orderBy: { recordedAt: 'asc' },
          include: { recordedByVet: { select: VET_SELECT } },
        },
      },
    })
  }

  async listActiveByClinic(clinicId: string): Promise<HospitalizationWithPatient[]> {
    return prisma.hospitalization.findMany({
      where: { clinicId, status: { in: [...OPEN_HOSPITALIZATION_STATUSES] } },
      include: {
        patient: { select: PATIENT_CARD_SELECT },
        admittedByVet: { select: VET_SELECT },
      },
      // Só a ordem cronológica vem do banco. A prioridade por criticidade
      // fica no caso de uso: ordenar por `status` aqui dependeria da ordem de
      // declaração do enum no schema, que alguém pode reordenar sem perceber,
      // e faria o Prisma divergir do repositório em memória que os testes usam.
      orderBy: { admittedAt: 'asc' },
    })
  }

  async discharge(id: string, data: DischargeHospitalizationDTO): Promise<Hospitalization> {
    return prisma.hospitalization.update({
      where: { id },
      data: {
        status: 'DISCHARGED',
        dischargedAt: data.dischargedAt,
        dischargeNotes: data.dischargeNotes ?? null,
      },
    })
  }

  async addEvolution(data: CreateHospitalizationEvolutionDTO): Promise<HospitalizationEvolution> {
    return prisma.hospitalizationEvolution.create({ data })
  }
}
