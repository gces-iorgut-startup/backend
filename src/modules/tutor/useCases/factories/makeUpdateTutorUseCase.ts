import { PrismaTutorsRepository } from '../../infra/repositories/PrismaTutorsRepository'
import { UpdateTutorUseCase } from '../updateTutorUseCase'
export function makeUpdateTutorUseCase() { return new UpdateTutorUseCase(new PrismaTutorsRepository()) }
