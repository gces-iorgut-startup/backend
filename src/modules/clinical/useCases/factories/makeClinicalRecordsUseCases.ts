import { StartClinicalRecordUseCase } from '../startClinicalRecordUseCase'
import { UpdateClinicalRecordUseCase } from '../updateClinicalRecordUseCase'
import { FinalizeClinicalRecordUseCase } from '../finalizeClinicalRecordUseCase'
import { GetPatientHistoryUseCase } from '../getPatientHistoryUseCase'
import { GeneratePrescriptionUseCase } from '../generatePrescriptionUseCase'
import { GenerateAISummaryUseCase } from '../generateAISummaryUseCase'
import { PrismaClinicalRecordsRepository } from '../../infra/repositories/PrismaClinicalRecordsRepository'
import { PrismaAppointmentsRepository } from '../../../schedule/infra/repositories/PrismaAppointmentsRepository'

export function makeStartClinicalRecordUseCase() {
  const appointmentsRepository = new PrismaAppointmentsRepository()
  const clinicalRecordsRepository = new PrismaClinicalRecordsRepository()
  return new StartClinicalRecordUseCase(appointmentsRepository, clinicalRecordsRepository)
}

export function makeUpdateClinicalRecordUseCase() {
  const clinicalRecordsRepository = new PrismaClinicalRecordsRepository()
  return new UpdateClinicalRecordUseCase(clinicalRecordsRepository)
}

export function makeFinalizeClinicalRecordUseCase() {
  const clinicalRecordsRepository = new PrismaClinicalRecordsRepository()
  const appointmentsRepository = new PrismaAppointmentsRepository()
  const generateAISummaryUseCase = new GenerateAISummaryUseCase()
  return new FinalizeClinicalRecordUseCase(
    clinicalRecordsRepository,
    appointmentsRepository,
    generateAISummaryUseCase
  )
}

export function makeGetPatientHistoryUseCase() {
  const clinicalRecordsRepository = new PrismaClinicalRecordsRepository()
  return new GetPatientHistoryUseCase(clinicalRecordsRepository)
}

export function makeGeneratePrescriptionUseCase() {
  return new GeneratePrescriptionUseCase()
}

export function makeGenerateAISummaryUseCase() {
  return new GenerateAISummaryUseCase()
}
