import type { Patient, Tutor } from '@prisma/client'

export type { Patient }

export type PatientWithTutor = Patient & { tutor: Tutor }

export interface CreatePatientDTO {
  name: string
  tutorId: string
  clinicId: string
  species: string
  breed?: string
  birthDate?: Date
  sex?: string
  weightKg?: number
  observations?: string
  microchip?: string
  allergies?: string
  photoUrl?: string
}

export interface UpdatePatientDTO {
  name?: string
  species?: string
  breed?: string
  birthDate?: Date
  sex?: string
  weightKg?: number
  observations?: string
  microchip?: string
  allergies?: string
  photoUrl?: string
}

export interface ListPatientsDTO {
  clinicId: string
  search?: string
  tutorId?: string
  species?: string
  updateDate?: string
  page?: number
  perPage?: number
}

export interface IPatientsRepository {
  create(data: CreatePatientDTO): Promise<Patient>
  findById(id: string): Promise<PatientWithTutor | null>
  update(id: string, data: UpdatePatientDTO): Promise<Patient>
  list(params: ListPatientsDTO): Promise<{ patients: PatientWithTutor[]; total: number }>
}
