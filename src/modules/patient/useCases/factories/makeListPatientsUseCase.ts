import { PrismaPatientsRepository } from '../../infra/repositories/PrismaPatientsRepository'
import { ListPatientsUseCase } from '../listPatientsUseCase'
export function makeListPatientsUseCase() { return new ListPatientsUseCase(new PrismaPatientsRepository()) }
