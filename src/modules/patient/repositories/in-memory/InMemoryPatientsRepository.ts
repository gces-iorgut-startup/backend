import { randomUUID } from 'crypto'
import { Decimal } from '@prisma/client/runtime/library'
import type { Patient, Tutor } from '@prisma/client'
import type {
  IPatientsRepository,
  CreatePatientDTO,
  UpdatePatientDTO,
  ListPatientsDTO,
  PatientWithTutor,
} from '../IPatientsRepository'

const dummyTutor: Tutor = {
  id: '',
  userId: null,
  clinicId: 'clinic-1',
  fullName: 'Tutor',
  cpf: '00000000000',
  phone: '',
  email: null,
  address: null,
  insurance: null,
  createdAt: new Date(),
  updatedAt: new Date(),
}

export class InMemoryPatientsRepository implements IPatientsRepository {
  public items: PatientWithTutor[] = []

  async create(data: CreatePatientDTO): Promise<Patient> {
    const patient: PatientWithTutor = {
      id: randomUUID(),
      name: data.name,
      species: data.species,
      breed: data.breed ?? null,
      birthDate: data.birthDate ?? null,
      sex: data.sex ?? null,
      weightKg: data.weightKg != null ? data.weightKg as any : null,
      observations: data.observations ?? null,
      microchip: data.microchip ?? null,
      allergies: data.allergies ?? null,
      photoUrl: data.photoUrl ?? null,
      tutorId: data.tutorId,
      clinicId: data.clinicId,
      createdAt: new Date(),
      updatedAt: new Date(),
      tutor: { ...dummyTutor, id: data.tutorId, clinicId: data.clinicId },
    }
    this.items.push(patient)
    return patient
  }

  async findById(id: string): Promise<PatientWithTutor | null> {
    return this.items.find(p => p.id === id) ?? null
  }

  async update(id: string, data: UpdatePatientDTO): Promise<Patient> {
    const index = this.items.findIndex(p => p.id === id)
    const patch = {
      ...data,
      weightKg: data.weightKg != null ? new Decimal(data.weightKg) : this.items[index].weightKg,
    }
    this.items[index] = { ...this.items[index], ...patch, updatedAt: new Date() }
    return this.items[index]
  }

  async list({ clinicId, search, tutorId, page = 1, perPage = 20 }: ListPatientsDTO): Promise<{ patients: PatientWithTutor[]; total: number }> {
    let patients = this.items.filter(p => p.clinicId === clinicId)
    if (search) patients = patients.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    if (tutorId) patients = patients.filter(p => p.tutorId === tutorId)
    const total = patients.length
    patients = patients.slice((page - 1) * perPage, page * perPage)
    return { patients, total }
  }
}
