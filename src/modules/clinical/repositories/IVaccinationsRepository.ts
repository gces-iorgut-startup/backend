import type { Vaccination, VaccinationStatus } from '@prisma/client'

export type { Vaccination, VaccinationStatus }

export interface CreateVaccinationDTO {
  patientId: string
  vaccineName: string
  appliedAt?: Date | null
  nextDoseAt?: Date | null
  doseNumber?: number | null
  intervalDays?: number | null
  status: VaccinationStatus
}

export interface IVaccinationsRepository {
  create(data: CreateVaccinationDTO): Promise<Vaccination>
  listByPatient(patientId: string): Promise<Vaccination[]>
  findById(id: string, clinicId: string): Promise<Vaccination | null>
  updateStatus(id: string, status: VaccinationStatus): Promise<Vaccination>
}
