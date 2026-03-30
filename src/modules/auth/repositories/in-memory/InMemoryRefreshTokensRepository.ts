import { randomUUID } from 'crypto'
import type {
  IRefreshTokensRepository,
  CreateRefreshTokenDTO,
  RefreshTokenDTO,
} from '../IRefreshTokensRepository'

export class InMemoryRefreshTokensRepository implements IRefreshTokensRepository {
  public items: RefreshTokenDTO[] = []

  async create(data: CreateRefreshTokenDTO): Promise<RefreshTokenDTO> {
    const token: RefreshTokenDTO = { id: randomUUID(), createdAt: new Date(), ...data }
    this.items.push(token)
    return token
  }

  async findByToken(token: string): Promise<RefreshTokenDTO | null> {
    return this.items.find(t => t.token === token) ?? null
  }

  async deleteByToken(token: string): Promise<void> {
    this.items = this.items.filter(t => t.token !== token)
  }

  async deleteAllByUserId(userId: string): Promise<void> {
    this.items = this.items.filter(t => t.userId !== userId)
  }
}
