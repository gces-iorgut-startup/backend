import { PrismaTutorsRepository } from '../../infra/repositories/PrismaTutorsRepository'
import { ListTutorsUseCase } from '../listTutorsUseCase'
export function makeListTutorsUseCase() { return new ListTutorsUseCase(new PrismaTutorsRepository()) }
