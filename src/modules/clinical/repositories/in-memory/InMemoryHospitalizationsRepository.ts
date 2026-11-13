import { randomUUID } from 'crypto'
import type {
  CreateHospitalizationDTO,
  CreateHospitalizationEvolutionDTO,
  DischargeHospitalizationDTO,
  Hospitalization,
  HospitalizationDetails,
  HospitalizationEvolution,
  HospitalizationWithPatient,
  IHospitalizationsRepository,
} from '../IHospitalizationsRepository'
import { OPEN_HOSPITALIZATION_STATUSES } from '../IHospitalizationsRepository'

export class InMemoryHospitalizationsRepository implements IHospitalizationsRepository {
  public items: Hospitalization[] = []
  public evolutions: HospitalizationEvolution[] = []

  async create(data: CreateHospitalizationDTO): Promise<Hospitalization> {
    const now = new Date()
    const hospitalization: Hospitalization = {
      id: randomUUID(),
      clinicId: data.clinicId,
      patientId: data.patientId,
      admittedByVetId: data.admittedByVetId,
      bedIdentifier: data.bedIdentifier,
      reason: data.reason,
      status: data.status ?? 'ADMITTED',
      admittedAt: now,
      dischargedAt: null,
      dischargeNotes: null,
      createdAt: now,
      updatedAt: now,
    }
    this.items.push(hospitalization)
    return hospitalization
  }

  async findOpenByPatient(patientId: string): Promise<Hospitalization | null> {
    return (
      this.items.find(
        item =>
          item.patientId === patientId &&
          OPEN_HOSPITALIZATION_STATUSES.includes(
            item.status as (typeof OPEN_HOSPITALIZATION_STATUSES)[number]
          )
      ) ?? null
    )
  }

  async findById(id: string, clinicId: string): Promise<Hospitalization | null> {
    return this.items.find(item => item.id === id && item.clinicId === clinicId) ?? null
  }

  async findDetailsById(id: string, clinicId: string): Promise<HospitalizationDetails | null> {
    const hospitalization = await this.findById(id, clinicId)
    if (!hospitalization) return null

    return {
      ...hospitalization,
      evolutions: this.evolutions
        .filter(evolution => evolution.hospitalizationId === id)
        // Ordem cronológica crescente: a timeline conta a história do dia.
        .sort((a, b) => a.recordedAt.getTime() - b.recordedAt.getTime()),
    }
  }

  async listActiveByClinic(clinicId: string): Promise<HospitalizationWithPatient[]> {
    return this.items
      .filter(
        item =>
          item.clinicId === clinicId &&
          OPEN_HOSPITALIZATION_STATUSES.includes(
            item.status as (typeof OPEN_HOSPITALIZATION_STATUSES)[number]
          )
      )
      // Só ordem cronológica, igual ao Prisma. A prioridade por criticidade
      // é aplicada no caso de uso, para os dois repositórios concordarem.
      .sort((a, b) => a.admittedAt.getTime() - b.admittedAt.getTime())
  }

  async discharge(id: string, data: DischargeHospitalizationDTO): Promise<Hospitalization> {
    const index = this.items.findIndex(item => item.id === id)
    this.items[index] = {
      ...this.items[index],
      status: 'DISCHARGED',
      dischargedAt: data.dischargedAt,
      dischargeNotes: data.dischargeNotes ?? null,
      updatedAt: new Date(),
    }
    return this.items[index]
  }

  async addEvolution(data: CreateHospitalizationEvolutionDTO): Promise<HospitalizationEvolution> {
    const evolution: HospitalizationEvolution = {
      id: randomUUID(),
      hospitalizationId: data.hospitalizationId,
      recordedByVetId: data.recordedByVetId,
      temperature: data.temperature ?? null,
      heartRate: data.heartRate ?? null,
      respiratoryRate: data.respiratoryRate ?? null,
      mucousMembranes: data.mucousMembranes ?? null,
      notes: data.notes,
      recordedAt: new Date(),
    }
    this.evolutions.push(evolution)
    return evolution
  }
}
