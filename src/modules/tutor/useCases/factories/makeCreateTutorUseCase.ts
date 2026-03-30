import { PrismaTutorsRepository } from '../../infra/repositories/PrismaTutorsRepository'
import { CreateTutorUseCase } from '../createTutorUseCase'
export function makeCreateTutorUseCase() { return new CreateTutorUseCase(new PrismaTutorsRepository()) }
