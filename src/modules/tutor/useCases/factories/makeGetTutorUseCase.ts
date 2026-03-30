import { PrismaTutorsRepository } from '../../infra/repositories/PrismaTutorsRepository'
import { GetTutorUseCase } from '../getTutorUseCase'
export function makeGetTutorUseCase() { return new GetTutorUseCase(new PrismaTutorsRepository()) }
