import { randomUUID } from 'crypto'
import type { IVaccinationsRepository, CreateVaccinationDTO, Vaccination, VaccinationStatus } from '../IVaccinationsRepository'

export class InMemoryVaccinationsRepository implements IVaccinationsRepository {
  public items: Vaccination[] = []

  async create(data: CreateVaccinationDTO): Promise<Vaccination> {
    const vaccination: Vaccination = {
      id: randomUUID(),
      patientId: data.patientId,
      vaccineName: data.vaccineName,
      appliedAt: data.appliedAt ?? null,
      nextDoseAt: data.nextDoseAt ?? null,
      status: data.status,
      createdAt: new Date(),
    }
    this.items.push(vaccination)
    return vaccination
  }

  async listByPatient(patientId: string): Promise<Vaccination[]> {
    return this.items.filter(v => v.patientId === patientId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  async findById(id: string, clinicId: string): Promise<Vaccination | null> {
    return this.items.find(v => v.id === id) ?? null
  }

  async updateStatus(id: string, status: VaccinationStatus): Promise<Vaccination> {
    const index = this.items.findIndex(v => v.id === id)
    this.items[index].status = status
    return this.items[index]
  }
}
