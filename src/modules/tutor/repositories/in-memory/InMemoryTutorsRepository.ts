import { randomUUID } from 'crypto'
import type { Tutor } from '@prisma/client'
import type {
  ITutorsRepository,
  CreateTutorDTO,
  UpdateTutorDTO,
  ListTutorsDTO,
} from '../ITutorsRepository'

export class InMemoryTutorsRepository implements ITutorsRepository {
  public items: Tutor[] = []

  async create(data: CreateTutorDTO): Promise<Tutor> {
    const tutor: Tutor = {
      id: randomUUID(),
      userId: null,
      clinicId: data.clinicId,
      fullName: data.fullName,
      cpf: data.cpf,
      phone: data.phone,
      email: data.email ?? null,
      address: data.address ?? null,
      insurance: data.insurance ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    this.items.push(tutor)
    return tutor
  }

  async findById(id: string): Promise<Tutor | null> {
    return this.items.find(t => t.id === id) ?? null
  }

  async findByCpf(cpf: string): Promise<Tutor | null> {
    return this.items.find(t => t.cpf === cpf) ?? null
  }

  async findByEmail(email: string): Promise<Tutor | null> {
    return this.items.find(t => t.email === email) ?? null
  }

  async list({ clinicId, search, page = 1, perPage = 20 }: ListTutorsDTO): Promise<{ tutors: Tutor[]; total: number }> {
    let tutors = this.items.filter(t => t.clinicId === clinicId)
    if (search) {
      tutors = tutors.filter(t => t.fullName.toLowerCase().includes(search.toLowerCase()))
    }
    const total = tutors.length
    tutors = tutors.slice((page - 1) * perPage, page * perPage)
    return { tutors, total }
  }

  async update(id: string, data: UpdateTutorDTO): Promise<Tutor> {
    const index = this.items.findIndex(t => t.id === id)
    this.items[index] = { ...this.items[index], ...data, updatedAt: new Date() }
    return this.items[index]
  }
}
