import { PrismaPatientsRepository } from '../../infra/repositories/PrismaPatientsRepository'
import { UpdatePatientUseCase } from '../updatePatientUseCase'
export function makeUpdatePatientUseCase() { return new UpdatePatientUseCase(new PrismaPatientsRepository()) }
