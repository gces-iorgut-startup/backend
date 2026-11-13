import type { Hospitalization, HospitalizationEvolution } from '@prisma/client'

export type { Hospitalization, HospitalizationEvolution }

export const HOSPITALIZATION_STATUSES = ['ADMITTED', 'CRITICAL', 'DISCHARGED'] as const
export type HospitalizationStatus = (typeof HOSPITALIZATION_STATUSES)[number]

/**
 * Status que mantêm o leito ocupado. `DISCHARGED` é o único que libera.
 * Usado tanto na regra de admissão única quanto no painel de leitos.
 */
export const OPEN_HOSPITALIZATION_STATUSES = ['ADMITTED', 'CRITICAL'] as const

export interface CreateHospitalizationDTO {
  clinicId: string
  patientId: string
  admittedByVetId: string
  bedIdentifier: string
  reason: string
  status?: HospitalizationStatus
}

export interface DischargeHospitalizationDTO {
  dischargedAt: Date
  dischargeNotes?: string | null
}

export interface CreateHospitalizationEvolutionDTO {
  hospitalizationId: string
  recordedByVetId: string
  temperature?: number | null
  heartRate?: number | null
  respiratoryRate?: number | null
  mucousMembranes?: string | null
  notes: string
}

/** Quem admitiu / registrou, para a timeline não mostrar só UUID. */
export interface VetSummary {
  id: string
  name: string
}

export interface HospitalizationEvolutionWithVet extends HospitalizationEvolution {
  recordedByVet?: VetSummary
}

export interface HospitalizationWithPatient extends Hospitalization {
  patient?: {
    id: string
    name: string
    species: string
    photoUrl: string | null
  }
  admittedByVet?: VetSummary
}

export interface HospitalizationDetails extends HospitalizationWithPatient {
  evolutions: HospitalizationEvolutionWithVet[]
}

export interface IHospitalizationsRepository {
  create(data: CreateHospitalizationDTO): Promise<Hospitalization>
  /** Internação em aberto do paciente, se houver. Base da regra de admissão única. */
  findOpenByPatient(patientId: string): Promise<Hospitalization | null>
  /** Escopado por clínica: é o que impede ler internação de outra clínica. */
  findById(id: string, clinicId: string): Promise<Hospitalization | null>
  findDetailsById(id: string, clinicId: string): Promise<HospitalizationDetails | null>
  listActiveByClinic(clinicId: string): Promise<HospitalizationWithPatient[]>
  discharge(id: string, data: DischargeHospitalizationDTO): Promise<Hospitalization>
  addEvolution(data: CreateHospitalizationEvolutionDTO): Promise<HospitalizationEvolution>
}
