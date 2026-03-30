import { PrismaPatientsRepository } from '../../infra/repositories/PrismaPatientsRepository'
import { GetPatientUseCase } from '../getPatientUseCase'
export function makeGetPatientUseCase() { return new GetPatientUseCase(new PrismaPatientsRepository()) }
